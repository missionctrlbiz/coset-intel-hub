import { NextResponse } from 'next/server';

import { analyzeContentForMetadata } from '@/lib/genai';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
        }

        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const profile = profileData as { role: string } | null;

        if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Editor or admin role required.' }, { status: 403 });
        }

        const body = (await request.json()) as { content?: string };
        const content = typeof body.content === 'string' ? body.content.trim() : '';

        if (!content) {
            return NextResponse.json({ error: 'content is required.' }, { status: 400 });
        }

        const metadata = await analyzeContentForMetadata(content);

        if (!metadata) {
            return NextResponse.json(
                { error: 'Could not analyze the content. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ success: true, metadata });
    } catch (error) {
        console.error('[analyze-content]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
