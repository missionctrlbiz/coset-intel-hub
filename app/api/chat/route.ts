import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '@/lib/supabase/clients';
import { MODELS } from '@/lib/genai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const { message, slug } = await request.json();

        if (!message || !slug) {
            return new Response(JSON.stringify({ error: 'Message and slug are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = await createSupabaseServerClient();

        const { data: reportData, error: reportError } = await supabase
            .from('reports')
            .select('id, title, status')
            .eq('slug', slug)
            .maybeSingle();

        const report = reportData as { id: string; title: string; status: string } | null;

        if (reportError || !report || report.status !== 'published') {
            return new Response(JSON.stringify({ error: 'Report not found or not published' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Generative AI is not configured' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const client = new GoogleGenAI({ apiKey });

        // Embed the user question for semantic retrieval
        const embedResponse = await client.models.embedContent({
            model: MODELS.embedding,
            contents: message,
        });

        const queryEmbedding = embedResponse.embeddings?.[0]?.values;

        if (!queryEmbedding) {
            return new Response(JSON.stringify({ error: 'Failed to generate query embedding' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Retrieve the most relevant chunks from this report
        const { data: chunksData, error: matchError } = await (supabase as any).rpc('match_report_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            filter_report_id: report.id,
        });

        if (matchError) {
            console.error('Vector search error:', matchError);
            return new Response(JSON.stringify({ error: 'Error searching context' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const chunks = chunksData as { content: string }[] | null;
        const contextText = (chunks || []).map((c) => c.content).join('\n\n---\n\n');

        const systemPrompt = `You are a helpful CoSET Intelligence Hub assistant answering questions about the report "${report.title}".
Your responses MUST be exclusively based on the following excerpts from the report.
If the context does not contain the answer, politely say that you cannot find the answer in the report.
Be concise and clear.

Context Excerpts:
${contextText || 'No relevant excerpts found in the report.'}`;

        // Stream the response token-by-token
        const stream = await client.models.generateContentStream({
            model: MODELS.standard,
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. Please provide your query.' }] },
                { role: 'user', parts: [{ text: message }] },
            ],
            config: {
                systemInstruction: 'You are a helpful assistant for CoSET Intelligence Hub',
                temperature: 0.3,
            },
        });

        const readable = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        const token = chunk.text ?? '';
                        if (token) {
                            controller.enqueue(encoder.encode(token));
                        }
                    }
                } catch (err) {
                    console.error('Streaming error:', err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
