import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            name?: string;
            email?: string;
            topic?: string;
            message?: string;
        };

        const name = body.name?.trim() ?? '';
        const email = body.email?.trim().toLowerCase() ?? '';
        const topic = body.topic?.trim() || 'General Inquiry';
        const message = body.message?.trim() ?? '';

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
        }

        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
        }

        if (message.length < 10) {
            return NextResponse.json({ error: 'Please include a little more detail in your feedback.' }, { status: 400 });
        }

        const admin = createSupabaseAdminClient();
        const { error } = await admin.from('hub_feedback').insert({
            name,
            email,
            topic,
            message,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent to the CoSET team. We appreciate your feedback and will review it shortly.',
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Could not submit feedback right now.' },
            { status: 500 },
        );
    }
}
