import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } },
) {
    const { id } = params;
    if (!id || !UUID_RE.test(id)) {
        return NextResponse.json({ error: 'Invalid report id.' }, { status: 400 });
    }

    // Verify the caller is an authenticated admin or editor
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const profile = profileData as { role: string | null } | null;
    if (!profile || !['admin', 'editor'].includes(profile.role ?? '')) {
        return NextResponse.json({ error: 'Forbidden. Admin or editor role required.' }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('reports').delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
