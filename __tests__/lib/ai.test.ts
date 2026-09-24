import { describe, it, expect } from 'vitest';

import { extractFirstJsonBlock, normalizeJsonResponse, parseModelJson } from '@/lib/ai/json';
import { chunkReportText, orderEmbeddings } from '@/lib/ai/embed';
import { resolveBeautifyTarget } from '@/lib/ai/clients';

describe('extractFirstJsonBlock', () => {
    it('returns a plain JSON object unchanged', () => {
        expect(extractFirstJsonBlock('{"a":1}')).toBe('{"a":1}');
    });

    it('finds the first JSON block after commentary', () => {
        const input = 'Here is the result:\n{"title":"Report","tags":["a"]} hope that helps';
        expect(extractFirstJsonBlock(input)).toBe('{"title":"Report","tags":["a"]}');
    });

    it('handles braces inside strings', () => {
        const input = '{"summary":"use } and { carefully"}';
        expect(extractFirstJsonBlock(input)).toBe(input);
    });

    it('handles escaped quotes inside strings', () => {
        const input = '{"summary":"say \\"hi\\" {now}"}';
        expect(extractFirstJsonBlock(input)).toBe(input);
    });

    it('extracts arrays', () => {
        expect(extractFirstJsonBlock('prefix ["one","two"] suffix')).toBe('["one","two"]');
    });

    it('returns null when no JSON is present', () => {
        expect(extractFirstJsonBlock('no json here')).toBeNull();
    });

    it('returns null for unterminated JSON', () => {
        expect(extractFirstJsonBlock('{"a":1')).toBeNull();
    });
});

describe('normalizeJsonResponse', () => {
    it('strips markdown json fences', () => {
        expect(normalizeJsonResponse('```json\n{"a":1}\n```')).toBe('{"a":1}');
    });

    it('strips plain code fences', () => {
        expect(normalizeJsonResponse('```\n{"a":1}\n```')).toBe('{"a":1}');
    });
});

describe('parseModelJson', () => {
    it('parses fenced JSON responses', () => {
        expect(parseModelJson('```json\n{"title":"T"}\n```')).toEqual({ title: 'T' });
    });

    it('returns null for invalid JSON', () => {
        expect(parseModelJson('not json at all')).toBeNull();
    });
});

describe('chunkReportText', () => {
    const TARGET_CHARS = 700 * 4; // ~700 tokens at 4 chars/token
    const OVERLAP_CHARS = Math.round(TARGET_CHARS * 0.12);

    it('merges short paragraphs into a single chunk', () => {
        const text = 'First paragraph discussing climate adaptation.\n\nSecond paragraph on energy.\n\nThird on governance.';
        const chunks = chunkReportText(text);
        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toContain('First paragraph');
        expect(chunks[0]).toContain('Third on governance.');
    });

    it('splits long documents into chunks within the token budget', () => {
        const paragraphs = Array.from(
            { length: 10 },
            (_, i) => `Paragraph ${i} ${'x'.repeat(500)} end.`,
        );
        const chunks = chunkReportText(paragraphs.join('\n\n'));

        expect(chunks.length).toBeGreaterThan(1);
        for (const chunk of chunks) {
            expect(chunk.length).toBeLessThanOrEqual(TARGET_CHARS);
        }
    });

    it('overlaps consecutive chunks by ~12% for retrieval context', () => {
        const paragraphs = Array.from(
            { length: 10 },
            (_, i) => `Paragraph ${i} ${'x'.repeat(500)} end.`,
        );
        const chunks = chunkReportText(paragraphs.join('\n\n'));

        for (let i = 1; i < chunks.length; i += 1) {
            const tail = chunks[i - 1].slice(-OVERLAP_CHARS).trim();
            expect(chunks[i].startsWith(tail)).toBe(true);
        }
    });

    it('hard-splits a single oversized paragraph into sliding windows', () => {
        const huge = Array.from(
            { length: 180 },
            (_, i) => `Sentence number ${i} with some content.`,
        ).join(' ');
        const chunks = chunkReportText(huge);

        expect(chunks.length).toBeGreaterThan(1);
        for (const chunk of chunks) {
            expect(chunk.length).toBeLessThanOrEqual(TARGET_CHARS);
        }
        for (let i = 1; i < chunks.length; i += 1) {
            const tail = chunks[i - 1].slice(-OVERLAP_CHARS).trim();
            expect(chunks[i].startsWith(tail)).toBe(true);
        }
    });

    it('keeps very short paragraphs by merging them with neighbours', () => {
        const chunks = chunkReportText('Short.\n\nThis paragraph is long enough to be embedded safely on its own.');
        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toContain('Short.');
    });

    it('returns empty array for empty input', () => {
        expect(chunkReportText('')).toEqual([]);
    });
});

describe('orderEmbeddings', () => {
    it('restores input order from out-of-order provider data', () => {
        const vectors = orderEmbeddings([
            { index: 2, embedding: [3] },
            { index: 0, embedding: [1] },
            { index: 1, embedding: [2] },
        ]);
        expect(vectors).toEqual([[1], [2], [3]]);
    });
});

describe('resolveBeautifyTarget', () => {
    it('prefers the HTML provider when configured', () => {
        expect(resolveBeautifyTarget(true)).toBe('html');
    });

    it('falls back to the primary provider when the HTML provider is unset', () => {
        expect(resolveBeautifyTarget(false)).toBe('primary');
    });
});
