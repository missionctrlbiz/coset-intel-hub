import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

type ContentStatus = Database['public']['Enums']['content_status'];

const VALID_STATUSES: ContentStatus[] = ['draft', 'published', 'scheduled', 'archived'];

export async function PATCH(request: Request) {
    try {
        const body = (await request.json()) as { reportId?: string; status?: string; scheduledAt?: string };
        const { reportId, status, scheduledAt } = body;

        if (!reportId || typeof reportId !== 'string') {
            return NextResponse.json({ error: 'reportId is required.' }, { status: 400 });
        }

        if (!status || !VALID_STATUSES.includes(status as ContentStatus)) {
            return NextResponse.json(
                { error: `status must be one of: ${VALID_STATUSES.join(', ')}.` },
                { status: 400 }
            );
        }

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

        return NextResponse.json({ success: true, report });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
