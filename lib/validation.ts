import { z } from 'zod';

const EMAIL_SCHEMA = z.string().email('A valid email address is required').max(254);
const TRIM_STRING = z.string().trim();

// ── Chat ────────────────────────────────────────────────────────────────────
const chatMessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

export const chatRequestSchema = z.object({
    message: z.string().min(1, 'A message is required').max(2000),
    slug: z.string().max(200).optional(),
    mode: z.enum(['general', 'report']).default('report'),
    history: z.array(chatMessageSchema).max(50).default([]),
});

// ── Search ──────────────────────────────────────────────────────────────────
export const searchQuerySchema = z.object({
    q: z.string().min(2, 'Search query must be at least 2 characters').max(200),
});

// ── Subscribe ───────────────────────────────────────────────────────────────
export const subscribeSchema = z.object({
    email: EMAIL_SCHEMA,
});

// ── Feedback ────────────────────────────────────────────────────────────────
export const feedbackSchema = z.object({
    name: TRIM_STRING.min(1, 'Name is required').max(120),
    email: EMAIL_SCHEMA,
    topic: TRIM_STRING.max(100).default('General Inquiry'),
    message: TRIM_STRING.min(1, 'Message is required').max(5000),
});

// ── Feedback ID ─────────────────────────────────────────────────────────────
export const feedbackIdSchema = z.object({
    id: z.string().uuid('Invalid feedback ID'),
});

// ── Analyze Content ─────────────────────────────────────────────────────────
export const analyzeContentSchema = z.object({
    content: z.string().min(10, 'Content must be at least 10 characters').max(50_000),
});

// ── Beautify Content ────────────────────────────────────────────────────────
export const beautifyContentSchema = z.object({
    content: z.string().min(10, 'Content must be at least 10 characters').max(50_000),
});

// ── Extract from URL ────────────────────────────────────────────────────────
export const extractUrlSchema = z.object({
    url: z.string().url('A valid URL is required').max(2000),
    previewOnly: z.boolean().optional(),
    title: TRIM_STRING.optional(),
    summary: TRIM_STRING.optional(),
    categories: z.array(z.string()).max(3).optional(),
    tags: z.array(z.string()).max(5).optional(),
    status: z.enum(['draft', 'published', 'scheduled', 'archived']).optional(),
});

// ── Report Deploy ───────────────────────────────────────────────────────────
export const reportDeploySchema = z.object({
    reportId: z.string().uuid('Invalid report ID'),
    status: z.enum(['published', 'scheduled', 'archived']),
    scheduledAt: z.string().datetime().optional(),
});

// ── Report ID ───────────────────────────────────────────────────────────────
export const reportIdSchema = z.object({
    id: z.string().uuid('Invalid report ID'),
});

// ── Report download / view tracking ─────────────────────────────────────────
export const reportActionSchema = z.object({
    download: z.coerce.boolean().optional(),
    view: z.coerce.boolean().optional(),
});

// ── Cron publish ────────────────────────────────────────────────────────────
export const cronSecretSchema = z.object({
    authorization: z.string().startsWith('Bearer ').optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type AnalyzeContentInput = z.infer<typeof analyzeContentSchema>;
export type BeautifyContentInput = z.infer<typeof beautifyContentSchema>;
export type ExtractUrlInput = z.infer<typeof extractUrlSchema>;
export type ReportDeployInput = z.infer<typeof reportDeploySchema>;

export function validated<T>(schema: z.ZodType<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    if (!result.success) {
        return null;
    }
    return result.data;
}

export function validationError(result: { success: false; error: { issues: { path?: PropertyKey[]; message: string }[] } }): string {
    return result.error.issues
        .map((i) => {
            const p = i.path?.length ? i.path.map(String).join('.') : 'value';
            return `${p}: ${i.message}`;
        })
        .join('; ');
}
