import { NextResponse } from 'next/server';

import { beautifyHtmlContent } from '@/lib/genai';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
    try {
        const auth = await requireRole(['admin', 'editor']);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as { content?: string };
        const content = typeof body.content === 'string' ? body.content.trim() : '';

        if (!content) {
            return NextResponse.json({ error: 'content is required.' }, { status: 400 });
        }

        // beautifyHtmlContent sanitizes the AI output with DOMPurify before returning
        const formattedHtml = await beautifyHtmlContent(content);

        if (!formattedHtml) {
            return NextResponse.json(
                { error: 'Could not reformat the content. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ success: true, formattedHtml });
    } catch (error) {
        console.error('[beautify-content]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
