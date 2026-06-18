import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminClient } from '@/lib/supabase/clients';
import { subscribeSchema, validationError } from '@/lib/validation';
import { withRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

let resend: Resend | null = null;

function getResend() {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

export async function POST(request: Request) {
    try {
        const rateLimitResponse = withRateLimit(request, 'subscribe', 10, 60_000);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json().catch(() => ({}));
        const parsed = subscribeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: validationError(parsed) }, { status: 400 });
        }

        const { email } = parsed.data;

        const admin = createSupabaseAdminClient();
        const { error: saveError } = await admin
            .from('newsletter_subscribers')
            .upsert(
                { email, source: 'public-modal', is_active: true },
                { onConflict: 'email' },
            );

        if (saveError) {
            logger.error('Subscribe save error', saveError);
            return NextResponse.json({ error: saveError.message }, { status: 500 });
        }

        const resendClient = getResend();
        if (!resendClient) {
            return NextResponse.json({
                success: true,
                message: 'Your email has been saved. We will send you updates when new publications go live.',
            });
        }

        const audienceId = process.env.RESEND_AUDIENCE_ID;
        if (audienceId) {
            try {
                const contact = await resendClient.contacts.create({
                    email,
                    firstName: '',
                    lastName: '',
                    unsubscribed: false,
                    audienceId,
                });

                const contactId = typeof contact === 'object' && contact !== null && 'id' in contact && typeof contact.id === 'string'
                    ? contact.id
                    : null;

                await admin
                    .from('newsletter_subscribers')
                    .update({
                        resend_contact_id: contactId,
                        last_synced_at: new Date().toISOString(),
                    })
                    .eq('email', email);
            } catch (error) {
                logger.warn('Failed to add Resend audience contact', { error });
            }
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'webmaster@cosetng.org';
        const fromName = 'CoSET Intelligence Hub';

        const { error } = await resendClient.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: [email],
            subject: 'Welcome to CoSET Intelligence Hub updates',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #102235; line-height: 1.7;">
                    <h1 style="font-size: 28px; line-height: 1.2; margin-bottom: 16px; color: #102235;">Welcome to CoSET Intelligence Hub</h1>
                    <p style="margin: 0 0 14px;">Thank you for subscribing to publication updates from CoSET.</p>
                    <p style="margin: 0 0 14px;">We will send you new reports, briefs, and major publication updates as they are released.</p>
                    <p style="margin: 24px 0 0;">The CoSET Intelligence Team</p>
                </div>
            `,
        });

        if (error) {
            logger.warn('Resend email error on subscribe', error);
            return NextResponse.json({
                success: true,
                message: 'Your email has been saved. We will send you updates when new publications go live.',
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Your email has been saved. We will send you updates when new publications go live.',
        });
    } catch (error) {
        logger.error('Subscribe API error', error);
        return NextResponse.json(
            { error: 'Could not save your email right now.' },
            { status: 500 },
        );
    }
}
