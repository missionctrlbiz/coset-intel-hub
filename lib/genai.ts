import { GoogleGenAI } from '@google/genai';

const defaultModel = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? 'gemini-2.5-flash';

type ExtractionDraft = {
    title: string;
    summary: string;
    category: string[];
    tags: string[];
    recommendedSlug: string;
};

function getClient() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        return null;
    }

    return new GoogleGenAI({ apiKey });
}

function normalizeJsonResponse(rawText: string) {
    return rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
}

export async function generateExtractionDraft(input: { fileName: string; fileType: string; excerpt: string }) {
    const client = getClient();

    if (!client || !input.excerpt.trim()) {
        return null;
    }

    const response = await client.models.generateContent({
        model: defaultModel,
        contents: `You are CoSET's report extraction assistant.
Analyze the uploaded file excerpt and return JSON only.

Required JSON shape:
{
  "title": "string",
  "summary": "string",
  "category": ["string", "string"],
  "tags": ["string", "string", "string"],
  "recommendedSlug": "string"
}

Constraints:
- Be concise and editorially professional.
- Infer categories and tags from the excerpt only.
- Never invent more than 2 categories and 5 tags.
- recommendedSlug must be lowercase and hyphenated.

File name: ${input.fileName}
File type: ${input.fileType || 'unknown'}
Excerpt:
${input.excerpt.slice(0, 12000)}`,
    });

    const rawText = response.text?.trim();

    if (!rawText) {
        return null;
    }

    const parsed = JSON.parse(normalizeJsonResponse(rawText)) as ExtractionDraft;

    return {
        ...parsed,
        model: defaultModel,
    };
}