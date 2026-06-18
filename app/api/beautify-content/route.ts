import { NextResponse } from 'next/server';
import { beautifyHtmlContent } from '@/lib/genai';
import { requireRole } from '@/lib/auth';
import { beautifyContentSchema, validationError } from '@/lib/validation';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
    try {
        const auth = await requireRole(['admin', 'editor']);
        if (auth instanceof Response) return auth;

        const body = await request.json().catch(() => ({}));
        const parsed = beautifyContentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: validationError(parsed) }, { status: 400 });
        }

        // beautifyHtmlContent sanitizes the AI output with DOMPurify before returning
        const formattedHtml = await beautifyHtmlContent(parsed.data.content);

        if (!formattedHtml) {
            return NextResponse.json(
                { error: 'Could not reformat the content. Please try again.' },
                { status: 422 },
            );
        }

        return NextResponse.json({ success: true, formattedHtml });
    } catch (error) {
        logger.error('Beautify content error', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
