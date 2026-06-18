import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/clients';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

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
            logger.error('Cron publish-scheduled DB error', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const published = data ?? [];
        logger.info(`Published ${published.length} scheduled report(s)`, { slugs: published.map((r) => r.slug) });

        return NextResponse.json({ published: published.length, reports: published.map((r) => r.slug) });
    } catch (err) {
        logger.error('Cron publish-scheduled unexpected error', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
