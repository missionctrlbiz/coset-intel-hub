import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { generateExtractionDraft, MAX_HTML_EXCERPT_LENGTH } from '@/lib/genai';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const runtime = 'nodejs';

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

/** Reject non-public URLs to prevent SSRF against internal services */
function isSafePublicUrl(raw: string): boolean {
    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return false;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return false;
    }

    // Block private IPv4 ranges (RFC 1918) and link-local
    const privateRanges = [
        /^10\./,
        /^192\.168\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^169\.254\./,
    ];
    if (privateRanges.some((re) => re.test(hostname))) {
        return false;
    }

    // Block metadata endpoints (cloud providers)
    if (hostname === '169.254.169.254' || hostname.endsWith('.internal')) {
        return false;
    }

    return true;
}

async function createUniqueSlug(
    adminSupabase: ReturnType<typeof createSupabaseAdminClient>,
    base: string
) {
    const baseSlug = slugify(base) || `report-${Date.now()}`;

    for (let i = 0; i < 25; i += 1) {
        const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
        const { data } = await adminSupabase
            .from('reports')
            .select('id')
            .eq('slug', candidate)
            .maybeSingle();

        if (!data) return candidate;
    }

    return `${baseSlug}-${Date.now()}`;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { url?: string; previewOnly?: boolean };
        const { url, previewOnly = false } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'A URL is required.' }, { status: 400 });
        }

        if (!isSafePublicUrl(url)) {
            return NextResponse.json(
                { error: 'Only public http/https URLs are accepted.' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'You must be signed in to extract reports from a URL.' },
                { status: 401 }
            );
        }

        const { data: profileRaw } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        const profile = profileRaw as ProfileRow | null;

        if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Editor or admin role required.' }, { status: 403 });
        }

        // Fetch the page with a timeout to avoid hanging
        let fetchResponse: Response;
        try {
            fetchResponse = await fetch(url, {
                headers: { 'User-Agent': 'CoSET-IntelHub/1.0 (+https://cosetng.org)' },
                signal: AbortSignal.timeout(15_000),
            });
        } catch (fetchError) {
            return NextResponse.json(
                {
                    error:
                        fetchError instanceof Error
                            ? `Could not reach the page: ${fetchError.message}`
                            : 'Could not reach the page.',
                },
                { status: 422 }
            );
        }

        if (!fetchResponse.ok) {
            return NextResponse.json(
                { error: `The page returned HTTP ${fetchResponse.status}.` },
                { status: 422 }
            );
        }

        const contentType = fetchResponse.headers.get('content-type') ?? '';
        if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
            return NextResponse.json(
                { error: 'Only HTML or plain-text pages are supported.' },
                { status: 422 }
            );
        }

        const htmlContent = await fetchResponse.text();

        let aiDraft = null;
        let aiError: string | null = null;

        try {
            aiDraft = await generateExtractionDraft({
                fileName: url,
                fileType: 'text/html',
                excerpt: htmlContent.slice(0, MAX_HTML_EXCERPT_LENGTH),
                purpose: 'web-scraping',
            });
        } catch (error) {
            aiError = error instanceof Error ? error.message : 'Extraction failed.';
        }

        if (previewOnly) {
            return NextResponse.json({ success: true, aiDraft, aiError });
        }

        if (!aiDraft) {
            return NextResponse.json(
                {
                    error:
                        aiError ??
                        'Could not extract report metadata from the page. Try uploading the document directly instead.',
                },
                { status: 422 }
            );
        }

        const adminSupabase = createSupabaseAdminClient();
        const slug = await createUniqueSlug(
            adminSupabase,
            aiDraft.recommendedSlug || aiDraft.title
        );

        const { data: report, error: reportError } = await adminSupabase
            .from('reports')
            .insert({
                author: profile.full_name || profile.email || user.email || 'CoSET Research Lab',
                category: aiDraft.category ?? [],
                created_by: user.id,
                description: aiDraft.summary ?? '',
                highlight: [],
                metrics: [],
                quote: null,
                slug,
                source_type: 'link',
                source_url: url,
                status: 'draft',
                tags: aiDraft.tags ?? [],
                title: aiDraft.title ?? 'Untitled Report',
                html_content: aiDraft.formattedContent ?? null,
            })
            .select('id, slug, title, status')
            .single();

        if (reportError || !report) {
            return NextResponse.json(
                { error: reportError?.message ?? 'Could not create the draft.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, report, aiDraft }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
