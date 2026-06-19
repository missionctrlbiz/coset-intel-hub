import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createSupabasePublicClient } from '@/lib/supabase/clients';
import { MODELS } from '@/lib/genai';
import { searchQuerySchema, validationError } from '@/lib/validation';
import { withRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    // Rate limit: 30 requests per minute
    const rateLimitResponse = withRateLimit(request, 'search', 30, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const queryRaw = request.nextUrl.searchParams.get('q');
    const parsed = searchQuerySchema.safeParse({ q: queryRaw ?? '' });
    if (!parsed.success) {
        return NextResponse.json({ results: [], error: validationError(parsed) }, { status: 400 });
    }

    const query = parsed.data.q;

    const supabase = createSupabasePublicClient();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    let semanticResults: { id: string; slug: string; title: string; description: string; category: string[]; image: string; score: number }[] = [];

    if (apiKey) {
        try {
            const client = new GoogleGenAI({ apiKey });
            const embeddingResponse = await client.models.embedContent({
                model: MODELS.embedding,
                contents: [query],
                config: { outputDimensionality: 768 },
            });

            const queryEmbedding = embeddingResponse?.embeddings?.[0]?.values;

            if (queryEmbedding) {
                const { data: matchedChunks } = await supabase.rpc('match_report_embeddings', {
                    query_embedding: JSON.stringify(queryEmbedding),
                    match_threshold: 0.15,
                    match_count: 10,
                    filter_report_id: null as any,
                }) as { data: any[] | null; error: any };

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
            logger.warn('Semantic search failed, falling back to text search', { error: e });
        }
    }

    const { data: textResults } = await supabase
        .from('reports')
        .select('id, slug, title, description, category, cover_image_path, image_path')
        .eq('status', 'published')
        .textSearch('search_vector', query, { type: 'plain', config: 'english' })
        .limit(5);

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
