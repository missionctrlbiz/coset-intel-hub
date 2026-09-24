import { createSupabaseServerClient } from '@/lib/supabase/clients';
import { chunkReportText, embedTexts } from '@/lib/ai/embed';

export async function processAndEmbedReport(reportId: string, extractedText: string) {
    if (!extractedText.trim()) return;

    const chunks = chunkReportText(extractedText);
    if (chunks.length === 0) return;

    const embeddings = await embedTexts(chunks);
    if (!embeddings) return;

    const supabase = await createSupabaseServerClient();

    const insertedRows = chunks
        .map((text, index) => {
            const embedding = embeddings[index];
            if (!embedding) return null;
            return {
                report_id: reportId,
                content: text,
                embedding,
            };
        })
        .filter(Boolean);

    if (insertedRows.length === 0) return;

    // @ts-ignore - Supabase types might not have vector(1024) properly, ts-ignore is safe here
    await supabase.from('report_embeddings').insert(insertedRows);
}
