import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FeedbackRow = Database['public']['Tables']['hub_feedback']['Row'];

async function authorizeFeedbackManager() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
    }

    const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    const profile = profileData as { role: string | null } | null;

    if (!profile || !['admin', 'editor'].includes(profile.role ?? '')) {
        return { error: NextResponse.json({ error: 'Forbidden. Admin or editor role required.' }, { status: 403 }) };
    }

    return { admin: createSupabaseAdminClient() };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    if (!params.id || !UUID_RE.test(params.id)) {
        return NextResponse.json({ error: 'Invalid feedback id.' }, { status: 400 });
    }

    const auth = await authorizeFeedbackManager();
    if (auth.error) {
        return auth.error;
    }

    try {
        const body = (await request.json()) as { action?: string; reply?: string };
        const now = new Date().toISOString();
        const updateData: Database['public']['Tables']['hub_feedback']['Update'] = {
            updated_at: now,
        };

        if (body.action === 'mark-read') {
            updateData.is_read = true;
            updateData.read_at = now;
        } else if (body.action === 'reply') {
            const reply = body.reply?.trim() ?? '';
            if (!reply) {
                return NextResponse.json({ error: 'Reply text is required.' }, { status: 400 });
            }
            updateData.admin_reply = reply;
            updateData.replied_at = now;
            updateData.is_read = true;
            updateData.read_at = now;
        } else {
            return NextResponse.json({ error: 'Unsupported feedback action.' }, { status: 400 });
        }

        const { data, error } = await auth.admin
            .from('hub_feedback')
            .update(updateData)
            .eq('id', params.id)
            .select('*')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: error?.message ?? 'Could not update feedback.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, feedback: data as FeedbackRow });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Could not update feedback.' },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    if (!params.id || !UUID_RE.test(params.id)) {
        return NextResponse.json({ error: 'Invalid feedback id.' }, { status: 400 });
    }

    const auth = await authorizeFeedbackManager();
    if (auth.error) {
        return auth.error;
    }

    const { error } = await auth.admin.from('hub_feedback').delete().eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
