import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses isomorphic-dompurify so it works on both server and client.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
    if (!dirty) {
        return '';
    }

    return DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel', 'class'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
}
