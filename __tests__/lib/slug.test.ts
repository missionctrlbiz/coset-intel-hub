import { describe, it, expect } from 'vitest';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

describe('slugify', () => {
    it('converts a title to a slug', () => {
        expect(slugify('Climate Change in Nigeria')).toBe('climate-change-in-nigeria');
    });

    it('removes special characters', () => {
        expect(slugify('U.S. Policy & Reform (2024)')).toBe('u-s-policy-reform-2024');
    });

    it('collapses multiple dashes', () => {
        expect(slugify('hello---world')).toBe('hello-world');
    });

    it('trims leading and trailing dashes', () => {
        expect(slugify('--hello world--')).toBe('hello-world');
    });

    it('handles accented characters by removing them', () => {
        expect(slugify('café résumé')).toBe('caf-r-sum');
    });

    it('handles empty string', () => {
        expect(slugify('')).toBe('');
    });

    it('handles only non-alphanumeric characters', () => {
        expect(slugify('!!!')).toBe('');
    });

    it('preserves numbers', () => {
        expect(slugify('Report 2024 Q1')).toBe('report-2024-q1');
    });
});
