import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { parseDocument } from '@/lib/document-parser';
import { generateExtractionDraft, beautifyHtmlContent } from '@/lib/genai';
import { processAndEmbedReport } from '@/lib/embeddings';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

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
            const [draftResult, beautifyResult] = await Promise.allSettled([
                generateExtractionDraft({
                    fileName: file.name,
                    fileType: file.type,
                    excerpt: textPreview,
                }),
                parseResult.text ? beautifyHtmlContent(parseResult.text) : Promise.resolve(null),
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
        }

        if (previewOnly) {
            return NextResponse.json({
                success: true,
                message: 'Extraction completed for preview.',
                aiDraft,
                aiError,
                parserUsed: parseResult.parserUsed,
                pageCount: parseResult.pageCount,
                truncated: parseResult.truncated,
                fullText: parseResult.text, // Pass the full text for the editor
                beautifiedHtml // Include the beautified HTML in preview
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