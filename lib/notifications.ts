import { Resend } from 'resend';

import { createSupabaseAdminClient } from '@/lib/supabase/clients';
import { logger } from '@/lib/logger';

export type NotifyReportInput = {
    id: string;
    slug: string;
    title: string;
    summary?: string | null;
    cover_image_path?: string | null;
    category?: string[] | null;
};

export type NotifyResult = {
    attempted: boolean;
    broadcastId?: string;
    audienceId?: string;
    reason?: string;
};

/**
 * Build and send a "new report published" broadcast to the Resend audience
 * that mirrors our local newsletter_subscribers table.
 *
 * Uses Resend's broadcast API (not individual emails.send) so that Resend's
 * own audience-level unsubscribe suppression applies automatically. Our local
 * /api/unsubscribe handler also marks the matching Resend contact as
 * unsubscribed, so the two lists stay in lock-step.
 *
 * Returns { attempted: false, reason } if Resend/audience isn't configured —
 * callers should treat that as a soft success so a missing API key doesn't
 * block publishing.
 */
export async function notifySubscribersForReport(
    report: NotifyReportInput,
): Promise<NotifyResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'webmaster@cosetng.org';
    const fromName = 'CoSET Intelligence Hub';
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

    if (!apiKey || !audienceId) {
        return {
            attempted: false,
            reason: 'Resend API key or audience not configured',
        };
    }

    const categories = (report.category ?? []).filter(Boolean).slice(0, 3);
    const summary = (report.summary ?? '').trim();
    const reportUrl = `${siteUrl}/reports/${report.slug}`;
    const coverUrl = report.cover_image_path
        ? report.cover_image_path.startsWith('http')
            ? report.cover_image_path
            : `${siteUrl}${report.cover_image_path}`
        : null;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #102235; line-height: 1.7; background: #ffffff;">
            <div style="padding: 24px 24px 0;">
                <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #f28c28;">
                    New Publication
                </p>
                <h1 style="margin: 8px 0 0; font-size: 26px; line-height: 1.2; color: #102235; font-weight: 800;">
                    ${escapeHtml(report.title)}
                </h1>
            </div>
            ${coverUrl ? `
            <div style="margin: 20px 24px 0;">
                <img src="${escapeAttr(coverUrl)}" alt="" style="display: block; width: 100%; height: auto; border-radius: 16px; border: 1px solid #dbe3ee;" />
            </div>
            ` : ''}
            ${summary ? `
            <div style="padding: 20px 24px 0;">
                <p style="margin: 0; font-size: 15px; color: #2b3a4f;">${escapeHtml(summary)}</p>
            </div>
            ` : ''}
            ${categories.length > 0 ? `
            <div style="padding: 16px 24px 0;">
                ${categories.map((c) => `<span style="display: inline-block; margin-right: 6px; padding: 4px 10px; border-radius: 999px; background: #fff1e0; color: #f28c28; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">${escapeHtml(c)}</span>`).join('')}
            </div>
            ` : ''}
            <div style="padding: 24px; text-align: center;">
                <a href="${escapeAttr(reportUrl)}" style="display: inline-block; padding: 14px 28px; background: #f28c28; color: #ffffff; font-weight: 700; text-decoration: none; border-radius: 999px; font-size: 14px;">
                    Read the full report →
                </a>
            </div>
            <hr style="margin: 0 24px; border: none; border-top: 1px solid #dbe3ee;" />
            <p style="margin: 16px 24px 24px; font-size: 12px; color: #5e6b7d; text-align: center;">
                You are receiving this because you subscribed to CoSET Intelligence Hub briefings.
                <a href="${escapeAttr(`${siteUrl}/unsubscribe`)}" style="color: #5e6b7d; text-decoration: underline;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${escapeAttr(`${siteUrl}/legal`)}" style="color: #5e6b7d; text-decoration: underline;">Privacy</a>
            </p>
        </div>
    `;

    try {
        const client = new Resend(apiKey);

        const broadcast = await client.broadcasts.create({
            audienceId,
            from: `${fromName} <${fromEmail}>`,
            subject: `New: ${report.title}`,
            html,
            name: `report-${report.slug}-${Date.now()}`,
        });

        const broadcastId =
            typeof broadcast === 'object' && broadcast !== null && 'data' in broadcast
                ? (broadcast as { data?: { id?: string } }).data?.id
                : undefined;

        if (!broadcastId) {
            logger.warn('Broadcast create returned no id', { broadcast });
            return { attempted: false, reason: 'Broadcast create failed' };
        }

        const sent = await client.broadcasts.send(broadcastId);

        if (typeof sent === 'object' && sent !== null && 'error' in sent && sent.error) {
            logger.warn('Broadcast send returned error', { error: sent.error });
            return { attempted: false, broadcastId, audienceId, reason: 'Broadcast send failed' };
        }

        // Best-effort audit log: bump last_synced_at on subscribers so admins
        // can see when the audience was last engaged.
        try {
            const admin = createSupabaseAdminClient();
            await admin
                .from('newsletter_subscribers')
                .update({ last_synced_at: new Date().toISOString() })
                .eq('is_active', true);
        } catch (syncError) {
            logger.warn('Failed to update last_synced_at after broadcast', { syncError });
        }

        return { attempted: true, broadcastId, audienceId };
    } catch (error) {
        logger.error('notifySubscribersForReport failed', error);
        return { attempted: false, reason: 'Unexpected error' };
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
    return escapeHtml(value);
}
