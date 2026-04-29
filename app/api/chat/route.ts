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

            if (isLatestRequest) {
                const { data } = await supabase
                    .from('reports')
                    .select('title, slug, description, category, tags')
                    .eq('status', 'published')
                    .order('published_at', { ascending: false })
                    .limit(6);
                const reports = data as ReportRow[] | null;
                return plainText(
                    reports?.length
                        ? formatReportList(reports, 'Here are the most recently published CoSET Intelligence reports:')
                        : 'No published reports are available at the moment. Check back soon.'
                );
            }

            // Derive a clean search term (strip trailing generic words like "research", "briefs")
            const searchTerm = trimmed
                .replace(/\b(research|briefs?|reports?|publications?)\b/gi, '')
                .replace(/\s{2,}/g, ' ')
                .trim() || trimmed;

            const { data: searchResults } = await supabase
                .from('reports')
                .select('title, slug, description, category, tags')
                .eq('status', 'published')
                .textSearch('search_vector', searchTerm, { type: 'websearch' })
                .limit(6);

            const reports = searchResults as ReportRow[] | null;

            if (reports?.length) {
                return plainText(
                    formatReportList(reports, `CoSET Intelligence reports on "${searchTerm}":`)
                );
            }

            // Fallback — show latest but clearly name what was searched
            const { data: latestData } = await supabase
                .from('reports')
                .select('title, slug, description, category, tags')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(6);
            const latest = latestData as ReportRow[] | null;
            return plainText(
                latest?.length
                    ? formatReportList(latest, `No reports found for "${searchTerm}". Here are the latest published reports:`)
                    : 'No published reports are available at the moment. Check back soon.'
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
            // Full description + all metadata
            return plainText(
                description
                    ? [
                        `Report Overview: ${title}`,
                        '',
                        description,
                        '',
                        `- Categories: ${cats}`,
                        `- Tags: ${tagList}`,
                        `- Published: ${publishedDate}`,
                        author ? `- Author: ${author}` : null,
                    ].filter((l) => l !== null).join('\n')
                    : [
                        title,
                        '',
                        `- Categories: ${cats}`,
                        `- Published: ${publishedDate}`,
                        '',
                        `No summary is stored for this report. [Open the full report](/reports/${slug}) to read it.`,
                    ].join('\n')
            );
        }

        if (lower.includes('key finding') || lower.includes('finding') || lower.includes('conclusion')) {
            // First sentence of description as the headline finding, then invite to read more
            const firstSentence = description
                ? (description.match(/^[^.!?]+[.!?]/) ?? [description.slice(0, 160)])[0].trim()
                : null;
            return plainText(
                firstSentence
                    ? [
                        'Key Findings:',
                        '',
                        firstSentence,
                        '',
                        `This report covers: ${cats}`,
                        '',
                        `[Open the full report for complete analysis](/reports/${slug})`,
                    ].join('\n')
                    : [
                        'Key Findings:',
                        '',
                        `No structured findings are stored for "${title}".`,
                        '',
                        `[Open the full report to read the analysis](/reports/${slug})`,
                    ].join('\n')
            );
        }

        if (lower.includes('policy') || lower.includes('recommendation')) {
            // Lead with policy categories/tags as the actionable lens, description as context
            const policyAreas = [
                ...(category ?? []),
                ...(tags ?? []),
            ].filter(Boolean);
            return plainText(
                [
                    'Policy Focus Areas:',
                    '',
                    policyAreas.length
                        ? policyAreas.map((a) => `- ${a}`).join('\n')
                        : '- Policy areas not specified for this report.',
                    '',
                    description
                        ? `Context:\n${description.length > 200 ? description.slice(description.length - 200) + '…' : description}`
                        : null,
                    '',
                    `[Read the full policy analysis](/reports/${slug})`,
                ].filter((l) => l !== null).join('\n')
            );
        }

        if (lower.includes('source') || lower.includes('reference') || lower.includes('citation') || lower.includes('author')) {
            // Metadata only — no description
            return plainText(
                [
                    'Source Details:',
                    '',
                    `- Title: ${title}`,
                    author ? `- Author: ${author}` : '- Author: Not specified',
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
