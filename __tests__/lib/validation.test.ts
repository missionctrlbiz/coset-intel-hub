import { describe, it, expect } from 'vitest';
import {
    chatRequestSchema,
    searchQuerySchema,
    subscribeSchema,
    feedbackSchema,
    reportDeploySchema,
    validationError,
} from '@/lib/validation';

describe('chatRequestSchema', () => {
    it('accepts valid general mode request', () => {
        const result = chatRequestSchema.safeParse({ message: 'Hello', mode: 'general' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.message).toBe('Hello');
            expect(result.data.mode).toBe('general');
        }
    });

    it('defaults mode to report', () => {
        const result = chatRequestSchema.safeParse({ message: 'Hello' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.mode).toBe('report');
        }
    });

    it('rejects empty message', () => {
        const result = chatRequestSchema.safeParse({ message: '' });
        expect(result.success).toBe(false);
    });

    it('rejects overly long message', () => {
        const result = chatRequestSchema.safeParse({ message: 'x'.repeat(2001) });
        expect(result.success).toBe(false);
    });

    it('allows optional slug', () => {
        const result = chatRequestSchema.safeParse({
            message: 'Hello',
            slug: 'climate-report',
            mode: 'report',
        });
        expect(result.success).toBe(true);
    });

    it('accepts conversation history', () => {
        const result = chatRequestSchema.safeParse({
            message: 'What else?',
            history: [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there!' },
            ],
        });
        expect(result.success).toBe(true);
    });
});

describe('searchQuerySchema', () => {
    it('accepts valid query', () => {
        const result = searchQuerySchema.safeParse({ q: 'climate' });
        expect(result.success).toBe(true);
    });

    it('rejects very short query', () => {
        const result = searchQuerySchema.safeParse({ q: 'a' });
        expect(result.success).toBe(false);
    });
});

describe('subscribeSchema', () => {
    it('accepts valid email', () => {
        const result = subscribeSchema.safeParse({ email: 'user@example.com' });
        expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
        const result = subscribeSchema.safeParse({ email: 'not-an-email' });
        expect(result.success).toBe(false);
    });
});

describe('feedbackSchema', () => {
    it('accepts valid feedback', () => {
        const result = feedbackSchema.safeParse({
            name: 'John',
            email: 'john@example.com',
            message: 'Great work!',
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
        const result = feedbackSchema.safeParse({
            email: 'john@example.com',
            message: 'Great work!',
        });
        expect(result.success).toBe(false);
    });

    it('rejects very long message', () => {
        const result = feedbackSchema.safeParse({
            name: 'John',
            email: 'john@example.com',
            message: 'x'.repeat(5001),
        });
        expect(result.success).toBe(false);
    });
});

describe('reportDeploySchema', () => {
    it('accepts valid deploy request', () => {
        const result = reportDeploySchema.safeParse({
            reportId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            status: 'published',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid UUID', () => {
        const result = reportDeploySchema.safeParse({
            reportId: 'not-a-uuid',
            status: 'published',
        });
        expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
        const result = reportDeploySchema.safeParse({
            reportId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            status: 'deleted' as any,
        });
        expect(result.success).toBe(false);
    });

    it('accepts scheduled status with date', () => {
        const result = reportDeploySchema.safeParse({
            reportId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            status: 'scheduled',
            scheduledAt: '2026-06-01T09:00:00Z',
        });
        expect(result.success).toBe(true);
    });
});

describe('validationError', () => {
    it('formats validation errors', () => {
        const result = subscribeSchema.safeParse({ email: 'bad' });
        expect(result.success).toBe(false);
        if (!result.success) {
            const msg = validationError(result);
            expect(msg).toContain('email');
        }
    });
});
