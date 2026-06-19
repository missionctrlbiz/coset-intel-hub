import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';
import { reportDeploySchema, validationError } from '@/lib/validation';
import { notifySubscribersForReport } from '@/lib/notifications';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

type ContentStatus = Database['public']['Enums']['content_status'];

export async function PATCH(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const parsed = reportDeploySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: validationError(parsed) }, { status: 400 });
        }

        const { reportId, status, scheduledAt } = parsed.data;

        const supabase = await createSupabaseServerClient();
        const adminSupabase = createSupabaseAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const { data: profileRaw } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        const profile = profileRaw as Database['public']['Tables']['profiles']['Row'] | null;

        if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Editor or admin role required.' }, { status: 403 });
        }

        const updatePayload: Record<string, unknown> = {
            status: status as ContentStatus,
            updated_at: new Date().toISOString(),
        };

        if (status === 'published') {
            updatePayload.published_at = new Date().toISOString();
        } else if (status === 'scheduled' && scheduledAt) {
            updatePayload.published_at = new Date(scheduledAt).toISOString();
        }

        const { data: report, error } = await adminSupabase
            .from('reports')
            .update(updatePayload)
            .eq('id', reportId)
            .select('id, slug, title, status, published_at')
            .single();

        if (error || !report) {
            return NextResponse.json(
                { error: error?.message ?? 'Failed to update report status.' },
                { status: 500 }
            );
        }

        // Fire-and-forget subscriber broadcast when a report goes live.
        // Failures are logged but do not block the publish response — the
        // report is already saved and editors can re-send via
        // /api/subscriptions/notify if the audience was unreachable.
        if (status === 'published') {
            try {
                const { data: fullReport } = await adminSupabase
                    .from('reports')
                    .select('id, slug, title, description, cover_image_path, category')
                    .eq('id', reportId)
                    .single();

                if (fullReport) {
                    const notifyResult = await notifySubscribersForReport({
                        id: fullReport.id,
                        slug: fullReport.slug,
                        title: fullReport.title,
                        summary: fullReport.description ?? null,
                        cover_image_path: fullReport.cover_image_path ?? null,
                        category: (fullReport.category as string[] | null) ?? null,
                    });

                    if (!notifyResult.attempted) {
                        logger.warn('Subscriber broadcast skipped on deploy', {
                            reportId,
                            reason: notifyResult.reason,
                        });
                    }
                }
            } catch (notifyError) {
                logger.warn('Subscriber broadcast error on deploy', { notifyError });
            }
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        logger.error('Report deploy error', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
