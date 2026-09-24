import { EMBEDDING_DIMENSIONS, MODELS, embeddingsSupportsTask, getEmbeddingsClient } from './clients';

export { EMBEDDING_DIMENSIONS, MODELS };

/** Batch size per /embeddings request — keeps payloads well under provider limits. */
const EMBED_BATCH_SIZE = 32;

// Chunk budget per the retrieval brief: ~500-800 tokens per chunk with 10-15%
// overlap, sized via a chars-per-token approximation for English report text.
// Smaller overlapping chunks retrieve better than whole documents.
const TARGET_CHUNK_TOKENS = 700;
const OVERLAP_RATIO = 0.12;
const CHARS_PER_TOKEN = 4;
const MIN_CHUNK_CHARS = 50;

/**
 * Chunk report text into ~700-token windows with ~12% overlap.
 * Paragraphs accumulate up to the budget; oversized paragraphs are hard-split
 * into sliding windows so no chunk exceeds the target size.
 * Shared by the ingest-time pipeline and the reembed backfill script so both
 * produce identical chunks.
 */
export function chunkReportText(text: string): string[] {
    const targetChars = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN;
    const overlapChars = Math.round(targetChars * OVERLAP_RATIO);
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    const chunks: string[] = [];
    let current: string[] = [];
    let currentLen = 0;

    const flush = (): string => {
        const joined = current.join('\n\n').trim();
        current = [];
        currentLen = 0;
        if (joined.length >= MIN_CHUNK_CHARS) {
            chunks.push(joined);
        }
        return joined;
    };

    for (const paragraph of paragraphs) {
        if (paragraph.length > targetChars) {
            flush();
            // Hard-split into sliding windows with the same overlap ratio
            let start = 0;
            while (start < paragraph.length) {
                const piece = paragraph.slice(start, start + targetChars).trim();
                if (piece.length >= MIN_CHUNK_CHARS) {
                    chunks.push(piece);
                }
                if (start + targetChars >= paragraph.length) break;
                start += targetChars - overlapChars;
            }
            continue;
        }

        if (currentLen > 0 && currentLen + paragraph.length + 2 > targetChars) {
            const previous = flush();
            // Carry ~12% of the previous chunk forward so context survives
            // section boundaries
            const overlap = previous.slice(Math.max(0, previous.length - overlapChars)).trim();
            if (overlap.length >= MIN_CHUNK_CHARS) {
                current = [overlap];
                currentLen = overlap.length;
            }
        }

        current.push(paragraph);
        currentLen += paragraph.length + 2;
    }
    flush();

    return chunks;
}

/**
 * Order embedding vectors by their input index — some providers return data out of order.
 */
export function orderEmbeddings(
    data: { index: number; embedding: number[] }[],
): number[][] {
    return [...data].sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

export type EmbedKind = 'document' | 'query';

/**
 * Embed a batch of texts via the configured OpenAI-compatible embeddings
 * endpoint. Returns vectors in input order, or null when the provider is
 * unconfigured/unavailable so callers fall back to text search.
 *
 * Documents embed as plain text; queries embed with the provider's
 * query-oriented mode (Jina `retrieval.query`) for better retrieval quality.
 */
export async function embedTexts(
    texts: string[],
    kind: EmbedKind = 'document',
): Promise<number[][] | null> {
    const client = getEmbeddingsClient();
    if (!client || texts.length === 0) return null;

    // Jina's body field is `task`; other OpenAI-compatible providers reject
    // unknown fields, so only send it when the endpoint is Jina.
    const task = embeddingsSupportsTask()
        ? kind === 'query' ? 'retrieval.query' : 'retrieval.passage'
        : undefined;

    const vectors: number[][] = [];

    try {
        for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
            const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
            const response = await client.embeddings.create({
                model: MODELS.embedding,
                input: batch,
                ...(task ? { task } : {}),
            } as Parameters<typeof client.embeddings.create>[0]);

            const batchVectors = orderEmbeddings(response.data);

            if (batchVectors.length !== batch.length || batchVectors.some(v => !v?.length)) {
                return null;
            }

            vectors.push(...batchVectors);
        }
    } catch (error) {
        console.error('Embedding request failed:', error);
        return null;
    }

    return vectors;
}

/** Embed a single user query with the provider's query-oriented mode. */
export async function embedQuery(text: string): Promise<number[] | null> {
    const vectors = await embedTexts([text], 'query');
    return vectors?.[0] ?? null;
}
