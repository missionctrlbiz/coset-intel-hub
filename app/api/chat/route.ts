import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const { message, slug } = await request.json();

        if (!message || !slug) {
            return NextResponse.json({ error: 'Message and slug are required' }, { status: 400 });
        }

        const supabase = createSupabaseServerClient();

        const { data: reportData, error: reportError } = await supabase
            .from('reports')
            .select('id, title, status')
            .eq('slug', slug)
            .maybeSingle();

        const report = reportData as { id: string; title: string; status: string } | null;

        if (reportError || !report || report.status !== 'published') {
            return NextResponse.json({ error: 'Report not found or not published' }, { status: 404 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Generative AI is not configured' }, { status: 500 });
        }
        
        const client = new GoogleGenAI({ apiKey });

        // 2. Generate embedding for user message
        const embedResponse = await client.models.embedContent({
            model: 'text-embedding-004',
            contents: message,
        });

        const queryEmbedding = embedResponse.embeddings?.[0]?.values;

        if (!queryEmbedding) {
            return NextResponse.json({ error: 'Failed to generate query embedding' }, { status: 500 });
        }

        // 3. Search Supabase for relevant context
        const { data: chunksData, error: matchError } = await (supabase as any).rpc('match_report_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            filter_report_id: report.id,
        });

        if (matchError) {
            console.error('Vector search error:', matchError);
            return NextResponse.json({ error: 'Error searching context' }, { status: 500 });
        }

        const chunks = chunksData as { content: string }[] | null;

        const contextText = (chunks || [])
            .map((chunk) => chunk.content)
            .join('\n\n---\n\n');

        // 4. Send to Gemini 2.5 Pro
        const systemPrompt = `You are a helpful CoSET Intelligence Hub assistant answering questions about the report "${report.title}".
Your responses MUST be exclusively based on the following excerpts from the report.
If the context does not contain the answer, politely say that you cannot find the answer in the report.
Use citations like [Excerpt 1] etc if appropriate, but since it's all from the same report, just referencing the text is fine. Be concise and clear.

Context Excerpts:
${contextText || "No relevant excerpts found in the report."}`;

        const chatResponse = await client.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. Please provide your query.' }] },
                { role: 'user', parts: [{ text: message }] },
            ],
            config: {
                systemInstruction: "You are a helpful assistant for CoSET Intelligence Hub",
                temperature: 0.3
            }
        });

        if (!chatResponse.text) {
            return NextResponse.json({ error: 'Failed to generate answer' }, { status: 500 });
        }

        return NextResponse.json({ answer: chatResponse.text });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
