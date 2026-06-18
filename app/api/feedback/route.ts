import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/clients';
import { feedbackSchema, validationError } from '@/lib/validation';
import { withRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const rateLimitResponse = withRateLimit(request, 'feedback', 5, 60_000);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json().catch(() => ({}));
        const parsed = feedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: validationError(parsed) }, { status: 400 });
        }

        const { name, email, topic, message } = parsed.data;

        const admin = createSupabaseAdminClient();
        const { error } = await admin.from('hub_feedback').insert({
            name,
            email,
            topic,
            message,
        });

        if (error) {
            logger.error('Feedback save error', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent to the CoSET team. We appreciate your feedback and will review it shortly.',
        });
    } catch (error) {
        logger.error('Feedback API error', error);
        return NextResponse.json(
            { error: 'Could not submit feedback right now.' },
            { status: 500 },
        );
    }
}
