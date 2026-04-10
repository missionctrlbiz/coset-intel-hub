import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;
const defaultModel = process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-1.5-pro';

export const MAX_HTML_EXCERPT_LENGTH = 30_000;

export type ExtractionDraft = {
    title: string;
    summary: string;
    category: string[];
    tags: string[];
    recommendedSlug: string;
    formattedContent?: string;
};

function normalizeJsonResponse(rawText: string) {
    return rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
}

export async function generateExtractionDraft(input: {
    fileName: string;
    fileType: string;
    excerpt: string;
    purpose?: string;
}) {
    if (!client || !input.excerpt.trim()) {
        return null;
    }

    const prompt = input.purpose === 'web-scraping'
        ? `You are CoSET's URL scraping assistant. 
           Extract the core report content from this HTML while ignoring navigation, headers, and footers.
           Return JSON only.
           
           Required JSON shape:
           {
             "title": "string",
             "summary": "string",
             "category": ["string", "string"],
             "tags": ["string", "string", "string"],
             "recommendedSlug": "string",
             "formattedContent": "string (semantic HTML of the main article only)"
           }
           
           HTML Excerpt:
           ${input.excerpt.slice(0, MAX_HTML_EXCERPT_LENGTH)}`
        : `You are CoSET's report extraction assistant.
           Analyze the uploaded file excerpt and return JSON only.

           Required JSON shape:
           {
             "title": "string",
             "summary": "string",
             "category": ["string", "string"],
             "tags": ["string", "string", "string"],
             "recommendedSlug": "string"
           }

           File name: ${input.fileName}
           File type: ${input.fileType || 'unknown'}
           Excerpt:
           ${input.excerpt.slice(0, MAX_HTML_EXCERPT_LENGTH)}`;

    try {
        const response = await client.models.generateContent({
            model: defaultModel,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const rawText = response.text?.trim();
        if (!rawText) return null;

        const parsed = JSON.parse(normalizeJsonResponse(rawText)) as ExtractionDraft;

        return {
            ...parsed,
            model: defaultModel,
        };
    } catch (error) {
        console.error('Failed to generate extraction draft:', error);
        return null;
    }
}

export type ContentMetadata = {
    title: string;
    summary: string;
    category: string[];
    tags: string[];
};

/**
 * Analyse a block of text or HTML and return structured report metadata.
 * Used by the /api/analyze-content route to let editors auto-fill Step 1.
 */
export async function analyzeContentForMetadata(content: string): Promise<ContentMetadata | null> {
    if (!client || !content.trim()) return null;

    const prompt = `You are CoSET's intelligence analyst.
Analyze the following report content and return ONLY a JSON object — no markdown fences, no commentary.

Required JSON shape:
{
  "title": "string — concise report title",
  "summary": "string — 2-4 sentence executive summary",
  "category": ["string", "string"] — at most 3 items from: Climate, Energy, Geopolitics, Security, Economics, Technology, Health, Biodiversity, Governance, Society,
  "tags": ["string", "string", "string"] — at most 5 specific keyword tags
}

Content:
${content.slice(0, MAX_HTML_EXCERPT_LENGTH)}`;

    try {
        const response = await client.models.generateContent({
            model: defaultModel,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const rawText = response.text?.trim();
        if (!rawText) return null;

        return JSON.parse(normalizeJsonResponse(rawText)) as ContentMetadata;
    } catch (error) {
        console.error('Failed to analyze content for metadata:', error);
        return null;
    }
}

/**
 * Reformat raw extracted text or HTML into a premium intelligence-report HTML layout.
 * Returns a full HTML snippet with sections, pull-quotes, and stat callouts.
 */
export async function beautifyHtmlContent(content: string): Promise<string | null> {
    if (!client || !content.trim()) return null;

    const prompt = `You are a senior intelligence report designer for CoSET Nigeria.
Reformat the following raw content into a polished, publication-quality HTML report body.

Design requirements:
- Use semantic HTML5 (<article>, <section>, <h2>, <h3>, <p>, <ul>, <blockquote>, <figure>)
- Wrap key statistics in: <div class="stat-callout"><span class="stat-number">…</span><span class="stat-label">…</span></div>
- Wrap important quotes in: <blockquote class="pull-quote">…</blockquote>
- Add section headings with: <h2 class="section-heading">…</h2>
- Preserve all factual content — do not add, remove, or alter any claims
- Output ONLY the HTML body content — no <html>, <head>, or <body> wrapper tags
- Do not include any markdown fences or explanatory text

Source content:
${content.slice(0, MAX_HTML_EXCERPT_LENGTH)}`;

    try {
        const response = await client.models.generateContent({
            model: defaultModel,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const rawText = response.text?.trim();
        return rawText || null;
    } catch (error) {
        console.error('Failed to beautify HTML content:', error);
        return null;
    }
}