import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

/**
 * Cron job: flip reports from 'scheduled' → 'published' when their publish time has arrived.
 * Configured in vercel.json — runs daily at 09:00 UTC (Vercel Hobby plan limit).
 * On Vercel Pro, change schedule to "0 * * * *" (hourly) or finer.
 * Secured by CRON_SECRET — Vercel sets the Authorization header automatically.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('reports')
            .update({ status: 'published' })
            .eq('status', 'scheduled')
            .lte('published_at', new Date().toISOString())
            .select('id, slug, title');

        if (error) {
            console.error('[publish-scheduled] DB error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const published = data ?? [];
        console.log(`[publish-scheduled] Published ${published.length} report(s):`, published.map((r) => r.slug));

        return NextResponse.json({ published: published.length, reports: published.map((r) => r.slug) });
    } catch (err) {
        console.error('[publish-scheduled] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
