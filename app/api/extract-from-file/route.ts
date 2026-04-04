import { NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/clients';
import { generateExtractionDraft } from '@/lib/genai';

export const runtime = 'nodejs';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const textExtensions = ['.txt', '.md', '.csv', '.json', '.html', '.xml'];

function canExtractText(file: File) {
    if (file.type.startsWith('text/')) {
        return true;
    }

    return textExtensions.some((extension) => file.name.toLowerCase().endsWith(extension));
}

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

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Expected a file upload under the "file" field.' }, { status: 400 });
        }

        let supabase;
        let adminSupabase;

        try {
            supabase = createSupabaseServerClient();
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
        const textPreview = canExtractText(file) ? (await file.text()).trim().slice(0, 12000) : '';

        let aiDraft = null;
        let aiError: string | null = null;

        if (textPreview) {
            try {
                aiDraft = await generateExtractionDraft({
                    fileName: file.name,
                    fileType: file.type,
                    excerpt: textPreview,
                });
            } catch (error) {
                aiError = error instanceof Error ? error.message : 'Unknown extraction error.';
            }
        }

        if (previewOnly) {
            return NextResponse.json({
                success: true,
                message: 'Extraction completed for preview.',
                aiDraft,
                aiError,
            });
        }

        const categories = uniqueStrings([...categoriesInput, ...(aiDraft?.category ?? [])], 3);
        const tags = uniqueStrings([...tagsInput, ...(aiDraft?.tags ?? [])], 5);
        const title = titleInput || aiDraft?.title || getFileStem(file.name);
        const description = summaryInput || aiDraft?.summary || 'Uploaded source is awaiting editorial review and enrichment.';
        const slug = await createUniqueSlug(adminSupabase, aiDraft?.recommendedSlug || title);
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
                category: categories,
                created_by: user.id,
                description,
                highlight: [],
                metrics: [],
                quote: null,
                read_time_minutes: estimateReadTimeMinutes(textPreview || description),
                slug,
                source_type: 'upload',
                status: 'draft',
                tags,
                title,
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
                ai_draft: aiDraft ?? {},
                created_by: user.id,
                error_message: aiError,
                extracted_text: textPreview || null,
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type || null,
                report_id: report.id,
                status: aiDraft ? 'drafted' : textPreview ? 'completed' : 'uploaded',
                storage_path: storagePath,
            })
            .select('id, status')
            .single();

        if (ingestionError || !ingestion) {
            return NextResponse.json({ error: ingestionError?.message ?? 'The draft was created, but we could not finish processing it right now.' }, { status: 500 });
        }

        return NextResponse.json(
            {
                message: 'Draft created successfully and ready for review.',
                fileName: file.name,
                fileType: file.type,
                size: file.size,
                extractionMode: textPreview ? 'text-preview' : 'metadata-only',
                preview: textPreview ? textPreview.slice(0, 1200) : null,
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