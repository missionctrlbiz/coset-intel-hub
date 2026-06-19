import { NextResponse } from 'next/server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';
import { notifySubscribersForReport, type NotifyReportInput } from '@/lib/notifications';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/subscriptions/notify
 *
 * Body: { reportId: string }
 *
 * Admin/editor only. Looks up the report (must be published) and broadcasts
 * a "new publication" email to the Resend audience that mirrors
 * newsletter_subscribers.
 *
 * /api/reports/deploy calls this automatically after a successful publish,
 * but it's also exposed here so editors can re-send notifications manually
 * (e.g. if the Resend audience was empty at publish time).
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json().catch(() => ({}))) as { reportId?: string };
        const reportId = typeof body.reportId === 'string' ? body.reportId.trim() : '';

        if (!reportId) {
            return NextResponse.json({ error: 'reportId is required.' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const adminSupabase = createSupabaseAdminClient();
        const { data: profileRaw } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
        const role = (profileRaw as { role?: string } | null)?.role;

        if (role !== 'admin' && role !== 'editor') {
            return NextResponse.json({ error: 'Editor or admin role required.' }, { status: 403 });
        }

        const { data: report, error } = await adminSupabase
            .from('reports')
            .select('id, slug, title, description, cover_image_path, category, status')
            .eq('id', reportId)
            .single();

        if (error || !report) {
            return NextResponse.json(
                { error: error?.message ?? 'Report not found.' },
                { status: 404 }
            );
        }

        if (report.status !== 'published') {
            return NextResponse.json(
                { error: 'Only published reports can trigger a notification.' },
                { status: 400 }
            );
        }

        const input: NotifyReportInput = {
            id: report.id,
            slug: report.slug,
            title: report.title,
            summary: report.description ?? null,
            cover_image_path: report.cover_image_path ?? null,
            category: (report.category as string[] | null) ?? null,
        };

        const result = await notifySubscribersForReport(input);

        if (!result.attempted) {
            logger.warn('Subscriber notification skipped', { reportId, reason: result.reason });
            return NextResponse.json({
                success: false,
                skipped: true,
                reason: result.reason,
            });
        }

        return NextResponse.json({
            success: true,
            broadcastId: result.broadcastId,
        });
    } catch (error) {
        logger.error('Notify API error', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
