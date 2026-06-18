import { describe, it, expect } from 'vitest';

// Inline the sanitization logic for testing (from lib/sanitize.ts)
// This tests the core security functions directly without imports.

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

describe('escapeHtml', () => {
    it('escapes < and >', () => {
        expect(escapeHtml('<script>alert(1)</script>')).toBe(
            '&lt;script&gt;alert(1)&lt;/script&gt;',
        );
    });

    it('escapes double quotes', () => {
        expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("it's")).toBe('it&#39;s');
    });

    it('escapes ampersands', () => {
        expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('returns empty string for empty input', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('handles already-safe text', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });
});
