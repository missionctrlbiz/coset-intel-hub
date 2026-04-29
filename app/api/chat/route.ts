import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

type ChatMode = 'general' | 'report';

type ReportRow = {
    title: string;
    slug: string;
    description: string | null;
    category: string[] | null;
    tags: string[] | null;
};

function formatReportList(reports: ReportRow[], intro: string): string {
    if (!reports.length) return intro ? intro : '';
    const lines: string[] = intro ? [intro, ''] : [];
    reports.forEach((r, i) => {
        lines.push(`${i + 1}. [${r.title}](/reports/${r.slug})`);
        if (r.description) {
            const excerpt = r.description.length > 130
                ? r.description.slice(0, 130) + '…'
                : r.description;
            lines.push(excerpt);
        }
        if (r.category?.length) {
            lines.push(`Categories: ${r.category.join(', ')}`);
        }
        lines.push('');
    });
    return lines.join('\n').trim();
}

function plainText(text: string): Response {
    return new Response(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}

export async function POST(request: Request) {
    try {
        const { message, slug, mode = 'report' } = await request.json() as {
            message?: string;
            slug?: string;
            mode?: ChatMode;
        };

        if (!message?.trim()) {
            return NextResponse.json({ error: 'A message is required' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();
        const trimmed = message.trim();
        const lower = trimmed.toLowerCase();

        // ── General mode ──────────────────────────────────────────────────────
        if (mode === 'general') {
            if (lower.includes('browse all')) {
                return plainText(
                    'Browse the full CoSET Intelligence catalog at [Browse all reports](/reports). Use the filters to narrow by category, topic, or date.'
                );
            }

            const isLatestRequest =
                lower.includes('latest') ||
                lower.includes('recent') ||
                lower.includes('newest');

            let reports: ReportRow[] | null = null;

            if (!isLatestRequest) {
                const { data } = await supabase
                    .from('reports')
                    .select('title, slug, description, category, tags')
                    .eq('status', 'published')
                    .textSearch('search_vector', trimmed, { type: 'websearch' })
                    .limit(6);
                reports = data as ReportRow[] | null;
            }

            if (!reports?.length) {
                const { data } = await supabase
                    .from('reports')
                    .select('title, slug, description, category, tags')
                    .eq('status', 'published')
                    .order('published_at', { ascending: false })
                    .limit(6);
                reports = data as ReportRow[] | null;
                const intro = isLatestRequest
                    ? 'Here are the most recently published CoSET Intelligence reports:'
                    : `No reports matched your query. Here are the latest reports:`;
                return plainText(
                    reports?.length
                        ? formatReportList(reports, intro)
                        : 'No published reports are available at the moment. Check back soon.'
                );
            }

            return plainText(
                formatReportList(reports, 'Here are CoSET Intelligence reports matching your query:')
            );
        }

        // ── Report mode ───────────────────────────────────────────────────────
        if (!slug) {
            return NextResponse.json({ error: 'A report slug is required for report chat' }, { status: 400 });
        }

        const { data: reportData } = await supabase
            .from('reports')
            .select('title, description, category, tags, author, published_at')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (!reportData) {
            return plainText('Could not load this report. Please try refreshing the page.');
        }

        const { title, description, category, tags, author, published_at } = reportData as {
            title: string;
            description: string | null;
            category: string[] | null;
            tags: string[] | null;
            author: string | null;
            published_at: string | null;
        };

        const cats = category?.join(', ') || 'Uncategorized';
        const tagList = tags?.length ? tags.join(', ') : 'None';
        const publishedDate = published_at
            ? new Date(published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Not specified';

        if (lower.includes('summar') || lower.includes('overview') || lower.includes('about')) {
            return plainText(
                description
                    ? `Summary:\n\n${description}\n\n- Categories: ${cats}\n- Tags: ${tagList}`
                    : `${title}\n\n- Categories: ${cats}\n- Tags: ${tagList}\n\nNo summary is available for this report.`
            );
        }

        if (lower.includes('key finding') || lower.includes('finding') || lower.includes('conclusion')) {
            return plainText(
                description
                    ? `Key Overview:\n\n${description}\n\n[Read the full report](/reports/${slug})`
                    : `No structured findings are stored for this report.\n\n[Open the full report](/reports/${slug}) to read the analysis.`
            );
        }

        if (lower.includes('policy') || lower.includes('recommendation')) {
            return plainText(
                description
                    ? `Policy Context:\n\n${description}\n\n- Categories: ${cats}\n\n[Read the full policy analysis](/reports/${slug})`
                    : `No policy detail is stored for this report.\n\n[Open the full report](/reports/${slug})`
            );
        }

        if (lower.includes('source') || lower.includes('reference') || lower.includes('citation') || lower.includes('author')) {
            return plainText(
                [
                    'Source References:',
                    '',
                    `- Title: ${title}`,
                    author ? `- Author: ${author}` : null,
                    `- Published: ${publishedDate}`,
                    `- Categories: ${cats}`,
                    tags?.length ? `- Tags: ${tagList}` : null,
                    '',
                    `[Open the full report](/reports/${slug})`,
                ].filter((l) => l !== null).join('\n')
            );
        }

        // Fallback: show report overview
        return plainText(
            [
                title,
                '',
                description || 'No description available for this report.',
                '',
                `- Categories: ${cats}`,
                `- Published: ${publishedDate}`,
                '',
                `[Open the full report](/reports/${slug})`,
            ].join('\n')
        );
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
