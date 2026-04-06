import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabasePublicClient } from '@/lib/supabase/clients';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const supabase = createSupabasePublicClient();

    // Try embedding-based semantic search first
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    let semanticResults: { id: string; slug: string; title: string; description: string; category: string[]; image: string; score: number }[] = [];

    if (apiKey) {
        try {
            const client = new GoogleGenAI({ apiKey });
            const embeddingResponse = await client.models.embedContent({
                model: 'text-embedding-004',
                contents: query,
            });

            const queryEmbedding = embeddingResponse?.embeddings?.[0]?.values;

            if (queryEmbedding) {
                const { data: matchedChunks } = await supabase.rpc('match_report_embeddings', {
                    query_embedding: JSON.stringify(queryEmbedding) as any,
                    match_threshold: 0.3,
                    match_count: 10,
                    filter_report_id: '' as any,
                });

                if (matchedChunks && matchedChunks.length > 0) {
                    const reportIds = [...new Set(matchedChunks.map((c: { report_id: string }) => c.report_id))];
                    const { data: reports } = await supabase
                        .from('reports')
                        .select('id, slug, title, description, category, cover_image_path, image_path')
                        .in('id', reportIds)
                        .eq('status', 'published');

                    if (reports) {
                        semanticResults = reports.map((r) => ({
                            id: r.id,
                            slug: r.slug,
                            title: r.title,
                            description: r.description,
                            category: r.category,
                            image: r.cover_image_path || r.image_path || '/coset-eye-banner.jpg',
                            score: matchedChunks.find((c: { report_id: string; similarity: number }) => c.report_id === r.id)?.similarity || 0,
                        }));
                    }
                }
            }
        } catch (e) {
            console.error('Semantic search failed, falling back to text search:', e);
        }
    }

    // Fallback or supplement with text search
    const { data: textResults } = await supabase
        .from('reports')
        .select('id, slug, title, description, category, cover_image_path, image_path')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

    // Merge and deduplicate results, prioritizing semantic results
    const mergedMap = new Map<string, typeof semanticResults[number]>();
    for (const r of semanticResults) {
        mergedMap.set(r.id, r);
    }
    if (textResults) {
        for (const r of textResults) {
            if (!mergedMap.has(r.id)) {
                mergedMap.set(r.id, {
                    id: r.id,
                    slug: r.slug,
                    title: r.title,
                    description: r.description,
                    category: r.category,
                    image: r.cover_image_path || r.image_path || '/coset-eye-banner.jpg',
                    score: 0,
                });
            }
        }
    }

    const results = Array.from(mergedMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

    return NextResponse.json({ results });
}
