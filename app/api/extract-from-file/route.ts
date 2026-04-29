import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { parseDocument } from '@/lib/document-parser';
import { analyzeContentForMetadata, beautifyHtmlContent, generateExtractionDraft } from '@/lib/genai';
import { processAndEmbedReport } from '@/lib/embeddings';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

const PREVIEW_BEAUTIFY_TIMEOUT_MS = 4000;

const CATEGORY_KEYWORDS = [
    { category: 'Climate', keywords: ['climate', 'emission', 'carbon', 'adaptation', 'mitigation', 'temperature'] },
    { category: 'Energy', keywords: ['energy', 'power', 'electricity', 'oil', 'gas', 'petroleum', 'renewable'] },
    { category: 'Geopolitics', keywords: ['geopolitics', 'regional', 'international', 'border', 'diplomacy', 'foreign policy'] },
    { category: 'Security', keywords: ['security', 'conflict', 'violence', 'insurgency', 'terrorism', 'crime'] },
    { category: 'Economics', keywords: ['economy', 'economic', 'finance', 'investment', 'trade', 'revenue', 'market'] },
    { category: 'Technology', keywords: ['technology', 'digital', 'innovation', 'ai', 'artificial intelligence', 'data'] },
    { category: 'Health', keywords: ['health', 'disease', 'hospital', 'medical', 'public health'] },
    { category: 'Biodiversity', keywords: ['biodiversity', 'forest', 'ecosystem', 'wildlife', 'conservation'] },
    { category: 'Governance', keywords: ['policy', 'governance', 'regulation', 'law', 'institution', 'ministry', 'government'] },
    { category: 'Society', keywords: ['community', 'social', 'equity', 'livelihood', 'education', 'youth', 'gender'] },
] as const;

const TAG_STOPWORDS = new Set([
    'about', 'after', 'again', 'against', 'along', 'also', 'because', 'before', 'being', 'between', 'could', 'during', 'eight', 'first', 'from', 'have', 'into', 'national', 'nigeria', 'report', 'their', 'there', 'these', 'this', 'those', 'through', 'under', 'using', 'where', 'which', 'while', 'with', 'would', 'year', 'years', 'than', 'them', 'they', 'that', 'were', 'when', 'what', 'will', 'your', 'been', 'more', 'most', 'many', 'such', 'very', 'into', 'onto', 'over', 'page', 'pages', 'section', 'figure', 'table', 'http', 'https', 'www', 'com', 'org', 'also', 'than', 'across', 'among', 'within', 'without', 'shall', 'should', 'must', 'may', 'each', 'other', 'some', 'much', 'made', 'make', 'does', 'done', 'just', 'like', 'well', 'however', 'therefore', 'therein', 'hereby', 'herein', 'including', 'include', 'based', 'according', 'towards', 'across', 'study', 'analysis', 'findings', 'summary', 'executive', 'intelligence', 'coset'
]);

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function getFileStem(fileName: string) {
    return fileName.replace(/\.[^.]+$/, '');
}

function sanitizeStorageName(fileName: string) {
    const extension = fileName.includes('.') ? `.${fileName.split('.').pop()?.toLowerCase() ?? 'bin'}` : '';
    const stem = slugify(getFileStem(fileName)) || 'upload';

    return `${stem}${extension}`;
}

function uniqueStrings(values: string[], limit: number) {
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, limit);
}

function estimateReadTimeMinutes(source: string) {
    const words = source.trim().split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
}

function normalizeProcessingText(source: string) {
    return source
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race<T | null>([
        promise,
        new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), timeoutMs);
        }),
    ]);
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function deriveSummary(text: string) {
    const normalized = normalizeProcessingText(text);
    if (!normalized) {
        return '';
    }

    const sentences = normalized
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    const selected: string[] = [];
    let totalLength = 0;

    for (const sentence of sentences) {
        selected.push(sentence);
        totalLength += sentence.length;

        if (selected.length >= 3 || totalLength >= 320) {
            break;
        }
    }

    if (selected.length > 0) {
        return selected.join(' ');
    }

    return `${normalized.slice(0, 280).trim()}${normalized.length > 280 ? '…' : ''}`;
}

function inferCategories(text: string) {
    const normalized = normalizeProcessingText(text).toLowerCase();
    if (!normalized) {
        return [] as string[];
    }

    const scored = CATEGORY_KEYWORDS
        .map(({ category, keywords }) => ({
            category,
            score: keywords.reduce((count, keyword) => count + (normalized.includes(keyword) ? 1 : 0), 0),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map((entry) => entry.category);

    if (scored.length > 0) {
        return scored;
    }

    return ['Governance'];
}

function inferTags(text: string) {
    const normalized = normalizeProcessingText(text).toLowerCase();
    if (!normalized) {
        return [] as string[];
    }

    const frequencies = new Map<string, number>();
    for (const word of normalized.match(/[a-z][a-z-]{3,}/g) ?? []) {
        if (TAG_STOPWORDS.has(word)) {
            continue;
        }

        frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    }

    return Array.from(frequencies.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([word]) => word.replace(/(^|-)([a-z])/g, (_, prefix, character: string) => `${prefix}${character.toUpperCase()}`));
}

function buildPlainTextPreviewHtml(text: string, fallbackTitle: string) {
    const blocks = text
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .slice(0, 80);

    if (blocks.length === 0) {
        return '';
    }

    const htmlBlocks = blocks.map((block, index) => {
        const compactBlock = block.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
        const safeBlock = escapeHtml(compactBlock);
        const looksLikeHeading = compactBlock.length <= 120 && !/[.!?]$/.test(compactBlock);

        if (index === 0) {
            return `<h1>${escapeHtml(looksLikeHeading ? compactBlock : fallbackTitle)}</h1>${looksLikeHeading ? '' : `<p>${safeBlock}</p>`}`;
        }

        if (looksLikeHeading) {
            return `<h2>${escapeHtml(compactBlock)}</h2>`;
        }

        return `<p>${safeBlock}</p>`;
    });

    return htmlBlocks.join('\n');
}

type DraftLike = {
    title?: string;
    summary?: string;
    category?: string[];
    tags?: string[];
    recommendedSlug?: string;
    formattedContent?: string;
} | null;

function hydrateDraft(file: File, draft: DraftLike, fullText: string) {
    const fallbackTitle = getFileStem(file.name);
    const fallbackSummary = deriveSummary(fullText);
    const fallbackCategories = inferCategories(fullText);
    const fallbackTags = inferTags(fullText);

    return {
        title: draft?.title?.trim() || fallbackTitle,
        summary: draft?.summary?.trim() || fallbackSummary,
        category: uniqueStrings(draft?.category?.length ? draft.category : fallbackCategories, 3),
        tags: uniqueStrings(draft?.tags?.length ? draft.tags : fallbackTags, 5),
        recommendedSlug: draft?.recommendedSlug?.trim() || fallbackTitle,
        ...(draft?.formattedContent ? { formattedContent: draft.formattedContent } : {}),
    };
}

async function resolvePreviewDraft(file: File, excerpt: string, fullText: string) {
    const draft = await generateExtractionDraft({
        fileName: file.name,
        fileType: file.type,
        excerpt,
    });

    if (draft?.title || draft?.summary || draft?.category?.length || draft?.tags?.length) {
        return hydrateDraft(file, draft, fullText || excerpt);
    }

    const fallbackMetadata = await analyzeContentForMetadata(fullText || excerpt);
    if (!fallbackMetadata) {
        return hydrateDraft(file, draft, fullText || excerpt);
    }

    return hydrateDraft(file, {
        ...fallbackMetadata,
        recommendedSlug: fallbackMetadata.title || getFileStem(file.name),
    }, fullText || excerpt);
}

async function createUniqueSlug(supabase: ReturnType<typeof createSupabaseAdminClient>, baseValue: string) {
    const baseSlug = slugify(baseValue) || `report-${Date.now()}`;

    for (let index = 0; index < 25; index += 1) {
        const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
        const { data, error } = await supabase.from('reports').select('id').eq('slug', candidate).maybeSingle();

        if (error) {
            break;
        }

        if (!data) {
            return candidate;
        }
    }

    return `${baseSlug}-${Date.now()}`;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const id = String(formData.get('id') ?? '').trim() || null;
        const textContent = String(formData.get('textContent') ?? '').trim();
        const sourceUrl = String(formData.get('sourceUrl') ?? '').trim() || null;
        const downloadFile = formData.get('downloadFile');
        const existingCoverImagePath = String(formData.get('coverImagePath') ?? '').trim() || null;

        let supabase;
        let adminSupabase;

        try {
            supabase = await createSupabaseServerClient();
            adminSupabase = createSupabaseAdminClient();
        } catch (error) {
            return NextResponse.json(
                { error: 'Database connection unavailable. Please check your environment configuration.' },
                { status: 500 }
            );
        }
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'You must be signed in to upload report files.' }, { status: 401 });
        }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const profile = profileData as ProfileRow | null;

        if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
            return NextResponse.json(
                { error: 'Your account needs editor or admin access before it can create report drafts.' },
                { status: 403 }
            );
        }

        const titleInput = String(formData.get('title') ?? '').trim();
        const summaryInput = String(formData.get('summary') ?? '').trim();
        const categoriesInput = formData.getAll('categories').map(String);
        const tagsInput = formData.getAll('tags').map(String);
        const previewOnly = formData.get('previewOnly') === 'true';
        const requestedStatus = (formData.get('status') as Database['public']['Enums']['content_status']) || 'draft';
        const coverImageFile = formData.get('coverImage') as File | null;
        const downloadFileFile = downloadFile instanceof File ? downloadFile : null;

        // Guard: reject oversized uploads before reading into memory
        if (file instanceof File && file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds the 50 MB limit.' }, { status: 400 });
        }

        // Guard: new reports require a file or pasted/URL text content
        if (!id && !(file instanceof File) && !textContent) {
            return NextResponse.json({ error: 'Expected a file upload under the "file" field.' }, { status: 400 });
        }

        // ── UPDATE EXISTING REPORT ──────────────────────────────────────────────
        if (id && !previewOnly) {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };
            if (titleInput) updateData.title = titleInput;
            if (summaryInput) updateData.description = summaryInput;
            if (categoriesInput.length > 0) updateData.category = uniqueStrings(categoriesInput, 3);
            if (tagsInput.length > 0) updateData.tags = uniqueStrings(tagsInput, 5);
            if (sourceUrl) {
                updateData.source_url = sourceUrl;
                updateData.source_type = 'link';
            }

            if (file instanceof File) {
                const preparedContent = textContent.trim();
                let contentForStorage = preparedContent;
                let contentForProcessing = normalizeProcessingText(preparedContent);

                if (!contentForStorage) {
                    const parseResult = await parseDocument(file);
                    contentForProcessing = parseResult.text;

                    if (parseResult.text) {
                        try {
                            contentForStorage = (await beautifyHtmlContent(parseResult.text)) || parseResult.text;
                        } catch (error) {
                            console.error('Failed to beautify HTML during update:', error);
                            contentForStorage = parseResult.text;
                        }
                    }
                }

                if (contentForStorage) {
                    updateData.html_content = contentForStorage;
                    updateData.read_time_minutes = estimateReadTimeMinutes(contentForProcessing || contentForStorage);
                    const storagePath = `${user.id}/${Date.now()}-${sanitizeStorageName(file.name)}`;
                    const fileBuffer = Buffer.from(await file.arrayBuffer());
                    await adminSupabase.storage.from('report-uploads').upload(storagePath, fileBuffer, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false,
                    });
                    processAndEmbedReport(id, contentForProcessing || contentForStorage);
                }
            } else if (textContent) {
                const preparedContent = textContent.trim();
                const processingText = normalizeProcessingText(preparedContent);
                try {
                    updateData.html_content = (await beautifyHtmlContent(preparedContent)) || preparedContent;
                } catch (error) {
                    console.error('Failed to beautify pasted content during update:', error);
                    updateData.html_content = preparedContent;
                }
                updateData.read_time_minutes = estimateReadTimeMinutes(processingText || preparedContent);
            }

            if (coverImageFile instanceof File) {
                const coverExt = coverImageFile.name.split('.').pop() ?? 'jpg';
                const coverImagePath = `${user.id}/covers/${Date.now()}-${id}.${coverExt}`;
                const coverBuffer = Buffer.from(await coverImageFile.arrayBuffer());
                await adminSupabase.storage.from('report-images').upload(coverImagePath, coverBuffer, {
                    contentType: coverImageFile.type,
                    upsert: false,
                });
                updateData.cover_image_path = coverImagePath;
            } else if (existingCoverImagePath) {
                updateData.cover_image_path = existingCoverImagePath;
            }

            if (downloadFileFile) {
                const dlExt = downloadFileFile.name.split('.').pop() ?? 'bin';
                const dlPath = `${user.id}/downloads/${Date.now()}-${id}.${dlExt}`;
                const dlBuffer = Buffer.from(await downloadFileFile.arrayBuffer());
                await adminSupabase.storage.from('report-uploads').upload(dlPath, dlBuffer, {
                    contentType: downloadFileFile.type || 'application/octet-stream',
                    upsert: false,
                });
                updateData.download_file_path = dlPath;
            }

            const { data: report, error: updateError } = await adminSupabase
                .from('reports')
                .update(updateData)
                .eq('id', id)
                .select('id, slug, title, status')
                .single();

            if (updateError || !report) {
                return NextResponse.json({ error: updateError?.message ?? 'Could not update the report.' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Report updated.', report }, { status: 200 });
        }

        // ── TEXT-ONLY CREATE (Paste / URL content, no source file) ─────────────
        if (!(file instanceof File)) {
            const categories = uniqueStrings(categoriesInput, 3);
            const tags = uniqueStrings(tagsInput, 5);
            const title = titleInput || 'Intelligence Report';
            const description = summaryInput || '';
            const slug = await createUniqueSlug(adminSupabase, title);
            const processingText = normalizeProcessingText(textContent);

            // Beautify pasted or URL content
            let beautifiedHtml: string | null = null;
            try {
                beautifiedHtml = await beautifyHtmlContent(textContent);
            } catch (error) {
                console.error('Failed to beautify text content:', error);
            }

            let coverImagePath: string | null = null;
            if (coverImageFile instanceof File) {
                const coverExt = coverImageFile.name.split('.').pop() ?? 'jpg';
                coverImagePath = `${user.id}/covers/${Date.now()}-${slug}.${coverExt}`;
                const coverBuffer = Buffer.from(await coverImageFile.arrayBuffer());
                await adminSupabase.storage.from('report-images').upload(coverImagePath, coverBuffer, {
                    contentType: coverImageFile.type,
                    upsert: false,
                });
            }

            let downloadFilePath: string | null = null;
            if (downloadFileFile) {
                const dlExt = downloadFileFile.name.split('.').pop() ?? 'bin';
                downloadFilePath = `${user.id}/downloads/${Date.now()}-${slug}.${dlExt}`;
                const dlBuffer = Buffer.from(await downloadFileFile.arrayBuffer());
                await adminSupabase.storage.from('report-uploads').upload(downloadFilePath, dlBuffer, {
                    contentType: downloadFileFile.type || 'application/octet-stream',
                    upsert: false,
                });
            }

            const { data: report, error: reportError } = await adminSupabase
                .from('reports')
                .insert({
                    author: profile.full_name || profile.email || user.email || 'CoSET Research Lab',
                    category: categories,
                    created_by: user.id,
                    description,
                    highlight: [],
                    metrics: [],
                    quote: null,
                    read_time_minutes: estimateReadTimeMinutes(processingText || textContent),
                    slug,
                    source_type: sourceUrl ? 'link' : 'upload',
                    source_url: sourceUrl,
                    status: requestedStatus,
                    tags,
                    title,
                    html_content: beautifiedHtml || textContent,
                    cover_image_path: coverImagePath,
                    download_file_path: downloadFilePath,
                })
                .select('id, slug, title, status')
                .single();

            if (reportError || !report) {
                return NextResponse.json({ error: reportError?.message ?? 'Could not create the report.' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Report created from content.', report }, { status: 201 });
        }

        if (textContent) {
            const categories = uniqueStrings(categoriesInput, 3);
            const tags = uniqueStrings(tagsInput, 5);
            const title = titleInput || getFileStem(file.name);
            const description = summaryInput || 'Uploaded source is awaiting editorial review and enrichment.';
            const slug = await createUniqueSlug(adminSupabase, title);
            const processingText = normalizeProcessingText(textContent);

            let coverImagePath: string | null = null;
            if (coverImageFile && coverImageFile instanceof File) {
                const coverExt = coverImageFile.name.split('.').pop() ?? 'jpg';
                coverImagePath = `${user.id}/covers/${Date.now()}-${slug}.${coverExt}`;
                const coverBuffer = Buffer.from(await coverImageFile.arrayBuffer());
                await adminSupabase.storage.from('report-images').upload(coverImagePath, coverBuffer, {
                    contentType: coverImageFile.type,
                    upsert: false
                });
            }

            let downloadFilePath: string | null = null;
            if (downloadFileFile) {
                const dlExt = downloadFileFile.name.split('.').pop() ?? 'bin';
                downloadFilePath = `${user.id}/downloads/${Date.now()}-${slug}.${dlExt}`;
                const dlBuffer = Buffer.from(await downloadFileFile.arrayBuffer());
                await adminSupabase.storage.from('report-uploads').upload(downloadFilePath, dlBuffer, {
                    contentType: downloadFileFile.type || 'application/octet-stream',
                    upsert: false,
                });
            }

            const storagePath = `${user.id}/${Date.now()}-${sanitizeStorageName(file.name)}`;
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const { error: uploadError } = await adminSupabase.storage.from('report-uploads').upload(storagePath, fileBuffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: false,
            });

            if (uploadError) {
                return NextResponse.json({ error: uploadError.message }, { status: 500 });
            }

            const { data: report, error: reportError } = await adminSupabase
                .from('reports')
                .insert({
                    author: profile.full_name || profile.email || user.email || 'CoSET Research Lab',
                    html_content: textContent,
                    category: categories,
                    created_by: user.id,
                    description,
                    highlight: [],
                    metrics: [],
                    quote: null,
                    read_time_minutes: estimateReadTimeMinutes(processingText || description),
                    slug,
                    source_type: 'upload',
                    status: requestedStatus,
                    tags,
                    title,
                    cover_image_path: coverImagePath,
                    download_file_path: downloadFilePath,
                })
                .select('id, slug, title, status')
                .single();

            if (reportError || !report) {
                await adminSupabase.storage.from('report-uploads').remove([storagePath]);

                return NextResponse.json({ error: reportError?.message ?? 'We could not create the draft right now.' }, { status: 500 });
            }

            const { data: ingestion, error: ingestionError } = await adminSupabase
                .from('report_ingestions')
                .insert({
                    ai_draft: {},
                    created_by: user.id,
                    error_message: null,
                    extracted_text: processingText || null,
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type || null,
                    report_id: report.id,
                    status: processingText ? 'completed' : 'uploaded',
                    storage_path: storagePath,
                })
                .select('id, status')
                .single();

            if (ingestionError || !ingestion) {
                return NextResponse.json({ error: ingestionError?.message ?? 'The draft was created, but we could not finish processing it right now.' }, { status: 500 });
            }

            if (processingText) {
                processAndEmbedReport(report.id, processingText);
            }

            return NextResponse.json(
                {
                    message: 'Draft created successfully and ready for review.',
                    ingestion,
                    report,
                },
                { status: 201 }
            );
        }

        // ── DOCUMENT PARSING PIPELINE (PDF, DOCX, PPTX, TXT, etc.) ────────────
        const parseResult = await parseDocument(file);
        const textPreview = parseResult.text.slice(0, 12000);

        let aiDraft = null;
        let aiError: string | null = null;
        let beautifiedHtml: string | null = null;

        if (textPreview) {
            const beautifyPromise = parseResult.text
                ? (previewOnly
                    ? withTimeout(beautifyHtmlContent(parseResult.text), PREVIEW_BEAUTIFY_TIMEOUT_MS)
                    : beautifyHtmlContent(parseResult.text))
                : Promise.resolve(null);

            const [draftResult, beautifyResult] = await Promise.allSettled([
                resolvePreviewDraft(file, textPreview, parseResult.text),
                beautifyPromise,
            ]);

            if (draftResult.status === 'fulfilled') {
                aiDraft = draftResult.value;
            } else {
                aiError = draftResult.reason instanceof Error ? draftResult.reason.message : 'Unknown extraction error.';
            }

            if (beautifyResult.status === 'fulfilled') {
                beautifiedHtml = beautifyResult.value;
            } else {
                console.error('Failed to beautify HTML:', beautifyResult.reason);
            }

            if (!aiDraft && !aiError) {
                aiError = 'We prepared the preview, but could not fill the report details automatically. You can still edit them manually.';
            }
        }

        if (previewOnly) {
            const previewHtml = beautifiedHtml || buildPlainTextPreviewHtml(parseResult.text, aiDraft?.title || getFileStem(file.name));

            return NextResponse.json({
                success: true,
                message: 'Extraction completed for preview.',
                aiDraft,
                aiError,
                parserUsed: parseResult.parserUsed,
                pageCount: parseResult.pageCount,
                truncated: parseResult.truncated,
                fullText: parseResult.text, // Pass the full text for the editor
                beautifiedHtml: previewHtml, // Include the beautified HTML in preview
                previewStyle: beautifiedHtml ? 'beautified' : 'fallback',
            });
        }

        const categories = uniqueStrings([...categoriesInput, ...(aiDraft?.category ?? [])], 3);
        const tags = uniqueStrings([...tagsInput, ...(aiDraft?.tags ?? [])], 5);
        const title = titleInput || aiDraft?.title || getFileStem(file.name);
        const description = summaryInput || aiDraft?.summary || 'Uploaded source is awaiting editorial review and enrichment.';
        const slug = await createUniqueSlug(adminSupabase, aiDraft?.recommendedSlug || title);

        let coverImagePath: string | null = null;
        if (coverImageFile && coverImageFile instanceof File) {
            const coverExt = coverImageFile.name.split('.').pop() ?? 'jpg';
            coverImagePath = `${user.id}/covers/${Date.now()}-${slug}.${coverExt}`;
            const coverBuffer = Buffer.from(await coverImageFile.arrayBuffer());
            await adminSupabase.storage.from('report-images').upload(coverImagePath, coverBuffer, {
                contentType: coverImageFile.type,
                upsert: false
            });
        }

        let downloadFilePath: string | null = null;
        if (downloadFileFile) {
            const dlExt = downloadFileFile.name.split('.').pop() ?? 'bin';
            downloadFilePath = `${user.id}/downloads/${Date.now()}-${slug}.${dlExt}`;
            const dlBuffer = Buffer.from(await downloadFileFile.arrayBuffer());
            await adminSupabase.storage.from('report-uploads').upload(downloadFilePath, dlBuffer, {
                contentType: downloadFileFile.type || 'application/octet-stream',
                upsert: false,
            });
        }

        const storagePath = `${user.id}/${Date.now()}-${sanitizeStorageName(file.name)}`;

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await adminSupabase.storage.from('report-uploads').upload(storagePath, fileBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
        });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: report, error: reportError } = await adminSupabase
            .from('reports')
            .insert({
                author: profile.full_name || profile.email || user.email || 'CoSET Research Lab',
                html_content: beautifiedHtml || parseResult.text || null, // Use beautified HTML if available, fallback to raw text
                category: categories,
                created_by: user.id,
                description,
                highlight: [],
                metrics: [],
                quote: null,
                read_time_minutes: estimateReadTimeMinutes(parseResult.text || description),
                slug,
                source_type: 'upload',
                status: requestedStatus,
                tags,
                title,
                cover_image_path: coverImagePath,
                download_file_path: downloadFilePath,
            })
            .select('id, slug, title, status')
            .single();


        if (reportError || !report) {
            await adminSupabase.storage.from('report-uploads').remove([storagePath]);

            return NextResponse.json({ error: reportError?.message ?? 'We could not create the draft right now.' }, { status: 500 });
        }

        const ingestionStatus = aiDraft ? 'drafted' : parseResult.text ? 'completed' : 'uploaded';

        const { data: ingestion, error: ingestionError } = await adminSupabase
            .from('report_ingestions')
            .insert({
                ai_draft: aiDraft ?? {},
                created_by: user.id,
                error_message: aiError,
                extracted_text: parseResult.text || null,
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type || null,
                report_id: report.id,
                status: ingestionStatus,
                storage_path: storagePath,
            })
            .select('id, status')
            .single();

        if (ingestionError || !ingestion) {
            return NextResponse.json({ error: ingestionError?.message ?? 'The draft was created, but we could not finish processing it right now.' }, { status: 500 });
        }

        if (parseResult.text) {
            // Process chunks and embed asynchronously in the background
            processAndEmbedReport(report.id, parseResult.text);
        }

        return NextResponse.json(
            {
                message: 'Draft created successfully and ready for review.',
                fileName: file.name,
                fileType: file.type,
                size: file.size,
                extractionMode: parseResult.parserUsed === 'none' ? 'metadata-only' : parseResult.parserUsed,
                preview: textPreview ? textPreview.slice(0, 1200) : null,
                parserUsed: parseResult.parserUsed,
                pageCount: parseResult.pageCount,
                truncated: parseResult.truncated,
                aiDraft,
                aiError,
                ingestion,
                report,
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'We could not complete this upload right now.' },
            { status: 500 }
        );
    }
}