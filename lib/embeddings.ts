import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

export async function processAndEmbedReport(reportId: string, extractedText: string) {
    if (!extractedText.trim()) return;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return;
    const client = new GoogleGenAI({ apiKey });

    // Chunk text by paragraphs roughly (split by double newlines)
    const chunks = extractedText
        .split(/\n\s*\n/)
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 50 && chunk.length < 5000); // Exclude very short or excessively long chunks

    if (chunks.length === 0) return;

    const supabase = createSupabaseServerClient();

    for (let i = 0; i < chunks.length; i += 50) {
        const batch = chunks.slice(i, i + 50);
        
        try {
            // Using text-embedding-004 for vector embeddings
            // As per SDK docs, we can embed multiple texts in one go if supported, or loop. We'll loop to be safe.
            const responses = await Promise.all(
                batch.map(text => 
                    client.models.embedContent({
                        model: 'text-embedding-004',
                        contents: text,
                    }).catch(() => null)
                )
            );

            const insertedRows = batch.map((text, index) => {
                const embedding = responses[index]?.embeddings?.[0]?.values;
                if (!embedding) return null;
                return {
                    report_id: reportId,
                    content: text,
                    embedding,
                };
            }).filter(Boolean);

            if (insertedRows.length > 0) {
                // @ts-ignore - Supabase types might not have vector(768) properly, ts-ignore is safe here
                await supabase.from('report_embeddings').insert(insertedRows);
            }
        } catch (error) {
            console.error('Failed to embed chunk batch:', error);
        }
    }
}
