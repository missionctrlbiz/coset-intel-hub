import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const { id } = params;

    if (!id || !UUID_RE.test(id)) {
        return NextResponse.json({ error: 'Invalid report id.' }, { status: 400 });
    }

    if (req.nextUrl.searchParams.get('download') !== '1') {
        return NextResponse.json({ error: 'Unsupported operation.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: report, error: reportError } = await admin
        .from('reports')
        .select('download_file_path, downloads, status')
        .eq('id', id)
        .maybeSingle();

    if (reportError || !report || report.status !== 'published') {
        return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    if (!report.download_file_path) {
        return NextResponse.json({ error: 'No downloadable file is attached to this report.' }, { status: 404 });
    }

    const { data: signedUrlData, error: signedUrlError } = await admin.storage
        .from('report-uploads')
        .createSignedUrl(report.download_file_path, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
        return NextResponse.json({ error: 'Could not generate the download link.' }, { status: 500 });
    }

    await admin
        .from('reports')
        .update({ downloads: (report.downloads ?? 0) + 1 })
        .eq('id', id);

    return NextResponse.redirect(signedUrlData.signedUrl, { status: 302 });
}

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
