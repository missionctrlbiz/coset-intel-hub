import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabasePublicClient } from '@/lib/supabase/clients';
import { MODELS } from '@/lib/genai';
import { chatRequestSchema, validationError } from '@/lib/validation';
import { withRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// Quick diagnostic: GET /api/chat returns report count and text search test
export async function GET() {
    try {
        const supabase = createSupabasePublicClient();
        const { count, error: countError } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published');

        if (countError) {
            return NextResponse.json({ ok: false, error: countError.message }, { status: 500 });
        }

        // Test text search
        const { data: testResults, error: searchError } = await supabase
            .from('reports')
            .select('id, title, slug')
            .eq('status', 'published')
            .textSearch('search_vector', 'climate', { type: 'websearch' })
            .limit(3);

        return NextResponse.json({
            ok: true,
            publishedCount: count ?? 0,
            textSearchWorking: !searchError && (testResults?.length ?? 0) > 0,
            sampleReports: testResults?.map((r) => ({ title: r.title, slug: r.slug })) ?? [],
        });
    } catch (err) {
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}

type ChatMode = 'general' | 'report';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface RetrievedChunk {
    content: string;
    title: string;
    slug: string;
    similarity: number;
}

interface ReportMeta {
    id: string;
    title: string;
    slug: string;
    description: string | null;
}

const SYSTEM_INSTRUCTION = `You are the CoSET Intelligence Hub research assistant — an AI that helps users explore published research from the Coalition for Socio-Ecological Transformation (CoSET) Nigeria.

You have access to excerpts from published CoSET Intelligence reports. Answer questions based ONLY on the provided excerpts. Follow these rules strictly:

1. GROUNDED ANSWERS: Only use information from the provided report excerpts. If the excerpts do not contain enough information to answer the question, say: "I could not find enough detail in the published reports to answer this question fully. You can [browse all reports](/reports) or try rephrasing your question."

2. CITE SOURCES: When you reference information from a specific report, cite it by title using a markdown link: [Report Title](/reports/slug). Always include at least one citation when drawing from the excerpts.

3. BE CONCISE: Keep responses focused and well-structured. Use markdown formatting — bullet points, **bold** for key terms, and numbered lists where appropriate. Do not write a full article unless asked.

4. STAY ON BRAND: CoSET is a Nigerian socio-ecological transformation research platform covering climate, energy, governance, security, economics, biodiversity, health, technology, and society. The brand voice is professional, authoritative, and accessible.

5. NO INVENTIONS: Never invent data, statistics, or claims that are not in the provided excerpts. If asked about something not covered, acknowledge the gap and suggest browsing /reports.

6. FORMAT OUTPUT: Use plain markdown. Links should be [Title](/path). Headings with ##. Bullet points with -. Source citations at the end when relevant.`;

function plainText(text: string): Response {
    return new Response(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}

function fallbackText(text: string): Response {
    return new Response(text, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Response-Source': 'fallback',
        },
    });
}

async function retrieveRelevantChunks(
    query: string,
    mode: ChatMode,
    reportId: string | null,
): Promise<RetrievedChunk[]> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return [];

    const supabase = createSupabasePublicClient();

    // Step 1: Generate query embedding
    let queryEmbedding: number[] | undefined;
    try {
        const embeddingClient = new GoogleGenAI({ apiKey });
        const embeddingResponse = await embeddingClient.models.embedContent({
            model: 'gemini-embedding-001',
            contents: [query],
            config: { outputDimensionality: 768 },
        });
        queryEmbedding = embeddingResponse?.embeddings?.[0]?.values;
    } catch {
        return [];
    }

    if (!queryEmbedding) return [];

    // Step 2: Call pgvector similarity search
    try {
        const { data: matchedChunks, error } = await supabase.rpc(
            'match_report_embeddings',
            {
                query_embedding: JSON.stringify(queryEmbedding),
                match_threshold: 0.15,
                match_count: 10,
                filter_report_id: reportId as any,
            },
        ) as { data: any[] | null; error: any };

        if (error || !matchedChunks?.length) return [];

        // Step 3: Resolve report metadata for each chunk
        const reportIds = [...new Set((matchedChunks as any[]).map((c) => c.report_id))];
        const { data: reports } = await supabase
            .from('reports')
            .select('id, title, slug, description')
            .in('id', reportIds)
            .eq('status', 'published');

        const reportMap = new Map<string, ReportMeta>(
            (reports ?? []).map((r) => [r.id, r as ReportMeta]),
        );

        return (matchedChunks as any[]).map((c) => {
            const report = reportMap.get(c.report_id);
            return {
                content: c.content,
                title: report?.title ?? 'Unknown Report',
                slug: report?.slug ?? '',
                similarity: c.similarity,
            };
        });
    } catch {
        return [];
    }
}

async function retrieveFromTextSearch(query: string, limit = 5): Promise<RetrievedChunk[]> {
    const supabase = createSupabasePublicClient();

    // Split query into individual words and build ILIKE conditions for each
    const words = query.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    // If there are multiple words, try the full phrase first
    if (words.length > 1) {
        const { data: phraseResults } = await supabase
            .from('reports')
            .select('id, title, slug, description')
            .eq('status', 'published')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(limit);

        if (phraseResults?.length) {
            return (phraseResults as ReportMeta[]).map((r) => ({
                content: r.description ?? '',
                title: r.title,
                slug: r.slug,
                similarity: 0,
            }));
        }
    }

    // Fallback: match ANY individual word (broader search)
    const wordConditions = words.map((w) => `title.ilike.%${w}%,description.ilike.%${w}%`);
    const { data: wordResults } = await supabase
        .from('reports')
        .select('id, title, slug, description')
        .eq('status', 'published')
        .or(wordConditions.join(','))
        .limit(limit);

    if (!wordResults?.length) {
        // Last resort: grab latest published reports
        const { data: latest } = await supabase
            .from('reports')
            .select('id, title, slug, description')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (!latest?.length) return [];
        return (latest as ReportMeta[]).map((r) => ({
            content: r.description ?? '',
            title: r.title,
            slug: r.slug,
            similarity: 0,
        }));
    }

    return (wordResults as ReportMeta[]).map((r) => ({
        content: r.description ?? '',
        title: r.title,
        slug: r.slug,
        similarity: 0,
    }));
}

async function resolveReportId(slug: string): Promise<string | null> {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
        .from('reports')
        .select('id')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
}

function buildContextBlock(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) return '';

    return chunks
        .map(
            (c, i) =>
                `[Excerpt ${i + 1}] From report "${c.title}" (slug: ${c.slug}):\n${c.content}`,
        )
        .join('\n\n');
}

export async function POST(request: Request) {
    try {
        // Rate limit: 20 requests per minute per IP
        const rateLimitResponse = withRateLimit(request, 'chat', 20, 60_000);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json().catch(() => ({}));
        const parsed = chatRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: validationError(parsed) },
                { status: 400 },
            );
        }

        const { message, mode, slug, history } = parsed.data;

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        // ── Resolve report id for report-scoped mode ──────────────────────
        let reportId: string | null = null;
        if (mode === 'report' && slug) {
            reportId = await resolveReportId(slug);
            if (!reportId) {
                return plainText('Could not find this report. It may have been unpublished or moved.');
            }
        }

        // ── Retrieve relevant context ─────────────────────────────────────
        let chunks = await retrieveRelevantChunks(message, mode, reportId);
        logger.debug('Embedding search chunks', { count: chunks.length, mode, reportId });

        // Fallback to full-text search if embedding search yields nothing
        if (chunks.length === 0) {
            chunks = await retrieveFromTextSearch(message, 5);
            logger.debug('Text search fallback chunks', { count: chunks.length });
        }

        // ── If no context at all, return a helpful fallback ──────────────
        if (chunks.length === 0) {
            logger.warn('No chunks found for chat query', { message, mode, reportId });
            if (mode === 'report') {
                return fallbackText(
                    'I could not find any indexed content for this report yet. ' +
                        '[Open the full report](/reports/' +
                        (slug ?? '') +
                        ') to read it directly.',
                );
            }
            return fallbackText(
                'I could not find any published reports matching your query. ' +
                    'Try [browsing all reports](/reports), or ask about a specific topic like climate, energy, governance, or biodiversity.',
            );
        }

        // ── If no Gemini key, return search results in a formatted response ─
        if (!apiKey) {
            const lines: string[] = [
                '**CoSET Intelligence reports matching your query:**',
                '',
            ];
            chunks.forEach((c, i) => {
                lines.push(`${i + 1}. [${c.title}](/reports/${c.slug})`);
                if (c.content) {
                    const excerpt =
                        c.content.length > 150 ? c.content.slice(0, 150) + '…' : c.content;
                    lines.push(`   ${excerpt}`);
                }
                lines.push('');
            });
            lines.push('Enable Gemini AI for richer, conversational answers.');
            return fallbackText(lines.join('\n'));
        }

        // ── Build the grounded prompt ─────────────────────────────────────
        const contextBlock = buildContextBlock(chunks);

        const userPrompt =
            `Below are excerpts from published CoSET Intelligence reports. ` +
            `Use ONLY these excerpts to answer the user's question. ` +
            `If the excerpts lack sufficient detail, say so honestly and suggest browsing /reports. ` +
            `Always cite reports by title using [Title](/reports/slug) format.\n\n` +
            `REPORT EXCERPTS:\n${contextBlock}\n\n` +
            `USER QUESTION: ${message}`;

        // Convert frontend history roles to Gemini roles
        const geminiContents: { role: string; parts: { text: string }[] }[] = history.map(
            (msg) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }),
        );

        // Add the current contextualized question
        geminiContents.push({ role: 'user', parts: [{ text: userPrompt }] });

        // ── Stream the Gemini response ────────────────────────────────────
        const genaiClient = new GoogleGenAI({ apiKey });

        const stream = await genaiClient.models.generateContentStream({
            model: MODELS.fast,
            contents: geminiContents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                maxOutputTokens: 1500,
                temperature: 0.4,
            },
        });

        const encoder = new TextEncoder();
        let fullText = '';

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const chunkText = chunk.text ?? '';
                        if (chunkText.length > fullText.length) {
                            const delta = chunkText.slice(fullText.length);
                            fullText = chunkText;
                            controller.enqueue(encoder.encode(delta));
                        }
                    }
                } catch (err) {
                    logger.error('Gemini stream error', err);
                    controller.enqueue(
                        encoder.encode(
                            '\n\n*I encountered an error while generating the response. Please try again.*',
                        ),
                    );
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Content-Type-Options': 'nosniff',
                'X-Response-Source': chunks.length > 0 ? 'rag' : 'none',
            },
        });
    } catch (error) {
        logger.error('Chat API Error', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
