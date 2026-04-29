import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '@/lib/supabase/clients';
import { MODELS } from '@/lib/genai';

export const runtime = 'nodejs';

type ChatMode = 'general' | 'report';

type ReportCatalogEntry = {
    title: string;
    slug: string;
    description: string | null;
    category: string[] | null;
    tags: string[] | null;
    published_at: string | null;
};

function formatCatalogContext(reports: ReportCatalogEntry[]) {
    return reports
        .map((report, index) => {
            const categories = report.category?.join(', ') || 'Uncategorized';
            const tags = report.tags?.length ? report.tags.join(', ') : 'No tags listed';
            const publishedAt = report.published_at || 'Unknown publish date';

            return `${index + 1}. ${report.title}\nSlug: ${report.slug}\nPath: /reports/${report.slug}\nCategories: ${categories}\nTags: ${tags}\nPublished: ${publishedAt}\nDescription: ${report.description || 'No description available.'}`;
        })
        .join('\n\n');
}

async function createChatResponse(client: GoogleGenAI, prompt: string, message: string) {
    const response = await client.models.generateContent({
        model: MODELS.fast,
        contents: [
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: 'Understood. Please provide the user question.' }] },
            { role: 'user', parts: [{ text: message }] },
        ],
        config: {
            systemInstruction: 'You are a helpful assistant for CoSET Intelligence Hub.',
            temperature: 0.3,
        },
    });

    const content = response.text?.trim();

    if (!content) {
        return NextResponse.json({ error: 'No response was generated.' }, { status: 502 });
    }

    return NextResponse.json({ content });
}

export async function POST(request: Request) {
    try {
        const { message, slug, mode = 'report' } = await request.json() as {
            message?: string;
            slug?: string;
            mode?: ChatMode;
        };

        if (!message?.trim()) {
            return NextResponse.json({ error: 'A message is required' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Generative AI is not configured' }, { status: 503 });
        }

        const supabase = await createSupabaseServerClient();
        const client = new GoogleGenAI({ apiKey });

        if (mode === 'general') {
            const { data: matchedReports } = await supabase
                .from('reports')
                .select('title, slug, description, category, tags, published_at')
                .eq('status', 'published')
                .textSearch('search_vector', message.trim(), { type: 'websearch' })
                .limit(6);

            const { data: latestReports } = await supabase
                .from('reports')
                .select('title, slug, description, category, tags, published_at')
                .eq('status', 'published')
                .order('featured', { ascending: false })
                .order('published_at', { ascending: false })
                .limit(6);

            const matchedCatalog = (matchedReports ?? []) as ReportCatalogEntry[];
            const latestCatalog = (latestReports ?? []) as ReportCatalogEntry[];

            const combinedReports: ReportCatalogEntry[] = [...matchedCatalog, ...latestCatalog].filter(
                (report, index, collection) => collection.findIndex((candidate) => candidate.slug === report.slug) === index
            );

            const contextText = formatCatalogContext(combinedReports.slice(0, 8));
            const generalPrompt = `You are a helpful CoSET Intelligence Hub assistant.
Answer only from the published report catalog below.
If you mention a report, format it as a markdown link like [Report Title](/reports/report-slug).
If the catalog does not support the answer, say so clearly and suggest [Browse all reports](/reports).
Do not invent URLs, sources, or findings beyond the catalog.
Keep the response concise, direct, and useful.

Published Report Catalog:
${contextText || 'No published report catalog is available.'}`;

            return createChatResponse(client, generalPrompt, message.trim());
        }

        if (!slug) {
            return NextResponse.json({ error: 'A report slug is required for report chat' }, { status: 400 });
        }

        const { data: reportData, error: reportError } = await supabase
            .from('reports')
            .select('id, title, status')
            .eq('slug', slug)
            .maybeSingle();

        const report = reportData as { id: string; title: string; status: string } | null;

        if (reportError || !report || report.status !== 'published') {
            return NextResponse.json({ error: 'Report not found or not published' }, { status: 404 });
        }

        // Embed the user question for semantic retrieval
        const embedResponse = await client.models.embedContent({
            model: MODELS.embedding,
            contents: message.trim(),
        });

        const queryEmbedding = embedResponse.embeddings?.[0]?.values;

        if (!queryEmbedding) {
            return NextResponse.json({ error: 'Failed to generate query embedding' }, { status: 500 });
        }

        // Retrieve the most relevant chunks from this report
        const { data: chunksData, error: matchError } = await (supabase as any).rpc('match_report_embeddings', {
            query_embedding: JSON.stringify(queryEmbedding) as any,
            match_threshold: 0.5,
            match_count: 5,
            filter_report_id: report.id,
        });

        if (matchError) {
            console.error('Vector search error:', matchError);
            return NextResponse.json({ error: 'Error searching context' }, { status: 500 });
        }

        const chunks = chunksData as { content: string }[] | null;
        const contextText = (chunks || []).map((c) => c.content).join('\n\n---\n\n');

        const systemPrompt = `You are a helpful CoSET Intelligence Hub assistant answering questions about the report "${report.title}".
Your responses must be exclusively based on the report excerpts below.
If the context does not contain the answer, say that you cannot find it in this report.
If helpful, you may reference the current report as [Open this report](/reports/${slug}).
Do not invent facts, sources, or links.
Be concise and clear.

Context Excerpts:
${contextText || 'No relevant excerpts found in the report.'}`;

        return createChatResponse(client, systemPrompt, message.trim());
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
