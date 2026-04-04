import { NextResponse } from 'next/server';

import { generateExtractionDraft } from '@/lib/genai';

export const runtime = 'nodejs';

const textExtensions = ['.txt', '.md', '.csv', '.json', '.html', '.xml'];

function canExtractText(file: File) {
    if (file.type.startsWith('text/')) {
        return true;
    }

    return textExtensions.some((extension) => file.name.toLowerCase().endsWith(extension));
}

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Expected a file upload under the "file" field.' }, { status: 400 });
    }

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
            aiError = error instanceof Error ? error.message : 'Unknown GenAI error.';
        }
    }

    return NextResponse.json(
        {
            message: textPreview
                ? 'File received. Text preview extracted and sent to GenAI when credentials were available.'
                : 'File received. Binary parser support is still needed for this file type, so only metadata was captured.',
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            extractionMode: textPreview ? 'text-preview' : 'metadata-only',
            preview: textPreview ? textPreview.slice(0, 1200) : null,
            aiDraft,
            aiError,
        },
        { status: textPreview ? 200 : 202 }
    );
}