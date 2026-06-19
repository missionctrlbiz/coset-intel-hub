'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';
import { logger } from '@/lib/logger';

export type SyncResult = {
    success: boolean;
    synced?: number;
    removed?: number;
    error?: string;
};

type ResendContactPage = {
    data?: Array<{
        id?: string;
        email?: string;
        unsubscribed?: boolean;
        created_at?: string;
    }>;
    has_more?: boolean;
};

/**
 * Pull the current Resend audience and reconcile it with newsletter_subscribers.
 *
 * - Contacts present in Resend but missing locally → upsert with is_active derived
 *   from their Resend unsubscribed flag.
 * - Local subscribers no longer in Resend and not yet unsubscribed → mark inactive
 *   so they don't keep getting the broadcasts sent before they unsubscribed.
 *
 * Admin/editor only. Idempotent — safe to re-run.
 */
export async function syncResendAudience(): Promise<SyncResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Authentication required.' };
        }

        const { data: profileRaw } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
        const role = (profileRaw as { role?: string } | null)?.role;

        if (role !== 'admin' && role !== 'editor') {
            return { success: false, error: 'Editor or admin role required.' };
        }

        const apiKey = process.env.RESEND_API_KEY;
        const audienceId = process.env.RESEND_AUDIENCE_ID;
        if (!apiKey || !audienceId) {
            return {
                success: false,
                error: 'Resend API key or audience not configured on the server.',
            };
        }

        const client = new Resend(apiKey);
        const admin = createSupabaseAdminClient();

        // Page through Resend contacts.
        let cursor: string | undefined;
        const remoteContacts: Array<{
            id: string;
            email: string;
            unsubscribed: boolean;
        }> = [];

        for (let safety = 0; safety < 25; safety += 1) {
            const response = await client.contacts.list({
                audienceId,
                ...(cursor ? { after: cursor } : {}),
            } as Parameters<typeof client.contacts.list>[0]);

            // Resend nests the page array inside `data.data` and exposes
            // `has_more` as a sibling. We re-shape via unknown so we don't
            // fight the SDK's `ListContactsResponse` generics.
            const payload = (response as unknown as { data?: ResendContactPage })?.data;
            const page = payload?.data ?? [];
            const hasMore = Boolean(payload?.has_more);

            for (const contact of page) {
                if (contact.id && contact.email) {
                    remoteContacts.push({
                        id: contact.id,
                        email: contact.email.toLowerCase(),
                        unsubscribed: Boolean(contact.unsubscribed),
                    });
                }
            }

            if (!hasMore || page.length === 0) break;
            const lastId = page[page.length - 1]?.id;
            if (!lastId) break;
            cursor = lastId;
        }

        const remoteEmails = new Set(remoteContacts.map((c) => c.email));

        // Upsert remote contacts.
        let synced = 0;
        for (const contact of remoteContacts) {
            const { error } = await admin
                .from('newsletter_subscribers')
                .upsert(
                    {
                        email: contact.email,
                        resend_contact_id: contact.id,
                        is_active: !contact.unsubscribed,
                        source: 'resend-sync',
                        last_synced_at: new Date().toISOString(),
                    },
                    { onConflict: 'email' },
                );
            if (!error) synced += 1;
            else logger.warn('Resend sync upsert failed', { email: contact.email, error: error.message });
        }

        // Mark locals that disappeared from Resend as inactive (audit trail kept).
        const { data: localActive } = await admin
            .from('newsletter_subscribers')
            .select('id, email, resend_contact_id, is_active')
            .eq('is_active', true);

        let removed = 0;
        for (const local of localActive ?? []) {
            const email = (local as { email: string }).email.toLowerCase();
            if (!remoteEmails.has(email)) {
                await admin
                    .from('newsletter_subscribers')
                    .update({
                        is_active: false,
                        unsubscribed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', (local as { id: string }).id);
                removed += 1;
            }
        }

        revalidatePath('/admin/subscribers');
        return { success: true, synced, removed };
    } catch (error) {
        logger.error('Resend audience sync failed', error);
        return { success: false, error: 'Sync failed unexpectedly.' };
    }
}
