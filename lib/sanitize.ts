import DOMPurify from 'isomorphic-dompurify';

const HEADING_STYLE_VARIANTS = ['signal', 'banner', 'marker', 'split'] as const;

function slugifyFragment(value: string) {
    return value
        .toLowerCase()
        .replace(/&amp;/g, 'and')
        .replace(/&#39;|&rsquo;|&lsquo;/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function stripHtml(value: string) {
    return value
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
        .replace(/&ndash;|&mdash;/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

function appendClassAttribute(attributes: string, classNames: string) {
    const classMatch = attributes.match(/class=(['"])(.*?)\1/i);

    if (!classMatch) {
        return `${attributes} class="${classNames}"`;
    }

    const current = classMatch[2].trim();
    const merged = `${current} ${classNames}`.trim();

    return attributes.replace(classMatch[0], `class="${merged}"`);
}

function addOrReplaceAttribute(attributes: string, attributeName: string, attributeValue: string) {
    const attributePattern = new RegExp(`${attributeName}=(['"])(.*?)\\1`, 'i');

    if (attributePattern.test(attributes)) {
        return attributes.replace(attributePattern, `${attributeName}="${attributeValue}"`);
    }

    return `${attributes} ${attributeName}="${attributeValue}"`;
}

function getStyleVariant(seedText: string) {
    const hash = Array.from(seedText).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 5), 0);
    return HEADING_STYLE_VARIANTS[hash % HEADING_STYLE_VARIANTS.length];
}

function normalizeGeneratedHeadingWrappers(html: string) {
    return html.replace(
        /<div\b[^>]*class=(['"])[^'"]*flex[^'"]*items-center[^'"]*gap-3[^'"]*\1[^>]*>\s*<div\b[^>]*class=(['"])[^'"]*w-1[^'"]*h-8[^'"]*\2[^>]*><\/div>\s*(<h[23]\b[\s\S]*?<\/h[23]>)\s*<\/div>/gi,
        '$3'
    );
}

export function enhanceReportHtml(dirty: string) {
    let html = normalizeGeneratedHeadingWrappers(dirty);
    const slugCounts = new Map<string, number>();
    const sectionSlugByLabel = new Map<string, string>();
    const firstHeadingText = stripHtml(html.match(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i)?.[1] ?? 'report');
    const reportSeed = slugifyFragment(firstHeadingText) || 'report';

    html = html.replace(/<h([2-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level, attributes, innerHtml) => {
        const plainText = stripHtml(innerHtml);
        const isTocHeading = /^(table of contents|contents)$/i.test(plainText);
        let nextAttributes = appendClassAttribute(attributes, `report-section-heading report-section-heading--h${level}`);

        if (!isTocHeading) {
            const baseSlug = slugifyFragment(plainText) || `section-${sectionSlugByLabel.size + 1}`;
            const duplicateCount = slugCounts.get(baseSlug) ?? 0;
            const resolvedSlug = duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount + 1}`;
            const styleVariant = getStyleVariant(`${reportSeed}:${resolvedSlug}:h${level}`);

            slugCounts.set(baseSlug, duplicateCount + 1);
            sectionSlugByLabel.set(plainText.toLowerCase(), resolvedSlug);

            nextAttributes = addOrReplaceAttribute(nextAttributes, 'id', resolvedSlug);
            nextAttributes = addOrReplaceAttribute(nextAttributes, 'data-section-style', styleVariant);
        } else {
            nextAttributes = addOrReplaceAttribute(nextAttributes, 'data-toc-title', 'true');
        }

        return `<h${level}${nextAttributes}>${innerHtml}</h${level}>`;
    });

    html = html.replace(/<a\b([^>]*)href=(['"])#\2([^>]*)>([\s\S]*?)<\/a>/gi, (match, beforeHref, _quote, afterHref, innerHtml) => {
        const targetSlug = sectionSlugByLabel.get(stripHtml(innerHtml).toLowerCase());

        if (!targetSlug) {
            return match;
        }

        let nextAttributes = `${beforeHref}${afterHref}`;
        nextAttributes = addOrReplaceAttribute(nextAttributes, 'href', `#${targetSlug}`);
        nextAttributes = addOrReplaceAttribute(nextAttributes, 'aria-label', `Jump to ${stripHtml(innerHtml)}`);
        nextAttributes = appendClassAttribute(nextAttributes, 'report-toc__link');

        return `<a${nextAttributes}>${innerHtml}</a>`;
    });

    html = html.replace(
        /<div\b([^>]*)>\s*<h([23])\b([^>]*)>(\s*(?:Table of Contents|Contents)\s*)<\/h\2>\s*<ul\b([^>]*)>([\s\S]*?)<\/ul>\s*<\/div>/i,
        (_match, containerAttributes, headingLevel, headingAttributes, headingText, listAttributes, listContent) => {
            const nextContainerAttributes = appendClassAttribute(containerAttributes, 'report-toc not-prose');
            const nextHeadingAttributes = appendClassAttribute(headingAttributes, 'report-toc__title');
            const nextListAttributes = appendClassAttribute(listAttributes, 'report-toc__list');

            return `<nav${nextContainerAttributes} data-report-toc="true"><h${headingLevel}${nextHeadingAttributes}>${headingText.trim()}</h${headingLevel}><ul${nextListAttributes}>${listContent}</ul></nav>`;
        }
    );

    return html;
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses isomorphic-dompurify so it works on both server and client.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
    if (!dirty) {
        return '';
    }

    return DOMPurify.sanitize(enhanceReportHtml(dirty), {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel', 'class', 'id', 'aria-label', 'data-report-toc', 'data-toc-title', 'data-section-style'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
}
