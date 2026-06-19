import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/clients';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

type UnsubscribeResponse = {
    success?: boolean;
    message?: string;
    error?: string;
};

type UnsubscribeRow = {
    id: string;
    email: string;
    is_active: boolean;
    resend_contact_id: string | null;
};

/**
 * POST /api/unsubscribe
 *
 * Body: { token: string }   (preferred — token comes from the email link)
 *  or:  { email: string }   (fallback for manual entry on /unsubscribe)
 *
 * Marks the subscriber inactive locally AND marks the matching Resend contact
 * unsubscribed (if one exists) so we never email them again from either side.
 *
 * Intentionally POST (not GET) so email-link prefetchers (Gmail, Outlook)
 * cannot trigger an accidental unsubscribe.
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json().catch(() => ({}))) as {
            token?: string;
            email?: string;
        };

        const token = typeof body.token === 'string' ? body.token.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

        if (!token && !email) {
            return NextResponse.json(
                { error: 'An unsubscribe token or email is required.' },
                { status: 400 }
            );
        }

        const admin = createSupabaseAdminClient();

        // Resolve subscriber by token first, then email.
        let query = admin
            .from('newsletter_subscribers')
            .select('id, email, is_active, resend_contact_id, unsubscribe_token, unsubscribed_at');

        if (token) {
            query = query.eq('unsubscribe_token', token);
        } else if (email) {
            query = query.eq('email', email);
        }

        const { data, error } = await query.maybeSingle<UnsubscribeRow>();

        if (error) {
            logger.warn('Unsubscribe lookup error', { error: error.message });
            return NextResponse.json(
                { error: 'Could not process your request right now.' },
                { status: 500 }
            );
        }

        if (!data) {
            // Don't leak whether a given token/email exists — return a generic
            // success so probing can't be used to enumerate subscribers.
            return NextResponse.json({
                success: true,
                message: 'If that address is subscribed, it has been removed.',
            });
        }

        if (!data.is_active) {
            return NextResponse.json({
                success: true,
                message: 'This address is already unsubscribed.',
            });
        }

        const { error: updateError } = await admin
            .from('newsletter_subscribers')
            .update({
                is_active: false,
                unsubscribed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);

        if (updateError) {
            logger.error('Unsubscribe update error', updateError);
            return NextResponse.json(
                { error: 'Could not process your request right now.' },
                { status: 500 }
            );
        }

        // Mirror to Resend so their suppression list stays in sync.
        const apiKey = process.env.RESEND_API_KEY;
        const audienceId = process.env.RESEND_AUDIENCE_ID;
        if (apiKey && audienceId && data.resend_contact_id) {
            try {
                const { Resend } = await import('resend');
                const client = new Resend(apiKey);
                await client.contacts.update({
                    id: data.resend_contact_id,
                    audienceId,
                    unsubscribed: true,
                });
                await admin
                    .from('newsletter_subscribers')
                    .update({ last_synced_at: new Date().toISOString() })
                    .eq('id', data.id);
            } catch (resendError) {
                logger.warn('Failed to mark Resend contact unsubscribed', { resendError });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'You have been unsubscribed.',
        });
    } catch (error) {
        logger.error('Unsubscribe API error', error);
        return NextResponse.json(
            { error: 'Could not process your request right now.' },
            { status: 500 }
        );
    }
}
