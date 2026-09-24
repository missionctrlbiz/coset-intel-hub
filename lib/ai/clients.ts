import OpenAI from 'openai';

/**
 * Provider configuration for the CoSET AI pipeline.
 *
 * All three providers are OpenAI-compatible, so a single SDK covers them:
 * - Primary generation (chat, extraction, metadata, vision): Agnes
 * - HTML beautify (report reflow): Poolside — optional, falls back to primary
 * - Embeddings (semantic search + RAG): OpenRouter
 *
 * Keys are created under COSET-owned email accounts and stored server-side
 * (local .env files / Vercel env vars). Never expose them to the client.
 */

export const MODELS = {
  fast: process.env.AI_FAST_MODEL ?? 'agnes-2.0-flash',
  standard: process.env.AI_STANDARD_MODEL ?? 'agnes-2.0-flash',
  html: process.env.AI_HTML_MODEL ?? 'poolside/laguna-s-2.1',
  embedding: process.env.AI_EMBEDDINGS_MODEL ?? 'qwen/qwen3-embedding-0.6b',
} as const;

/** Vector dimension stored in Supabase pgvector. Must match the embedding model's native output. */
export const EMBEDDING_DIMENSIONS = Number(process.env.AI_EMBEDDINGS_DIM ?? 1024);

export type BeautifyTarget = 'html' | 'primary';

/**
 * Pure decision for which provider beautifies HTML. Poolside is preferred when
 * configured; otherwise the primary provider handles it so beautify never hard-fails.
 */
export function resolveBeautifyTarget(htmlConfigured: boolean): BeautifyTarget {
  return htmlConfigured ? 'html' : 'primary';
}

function createClient(apiKey: string | undefined, baseURL: string | undefined): OpenAI | null {
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
    maxRetries: 3,
    timeout: 120_000,
  });
}

// Agnes's free tier enforces tight per-minute rate limits, and the upload
// wizard fires extraction + beautify calls concurrently. Serializing
// primary-provider requests (plus the SDK's own 429 backoff) keeps us under
// the cap without dropping requests.
let primarySlot: Promise<unknown> = Promise.resolve();

export function withPrimarySlot<T>(task: () => Promise<T>): Promise<T> {
  const run = primarySlot.then(task, task);
  primarySlot = run.catch(() => {});
  return run;
}

let primaryClient: OpenAI | null | undefined;
let htmlClient: OpenAI | null | undefined;
let embeddingsClient: OpenAI | null | undefined;

/** Primary generation provider (Agnes). Null when AI_API_KEY is unset. */
export function getPrimaryClient(): OpenAI | null {
  if (primaryClient === undefined) {
    primaryClient = createClient(process.env.AI_API_KEY, process.env.AI_BASE_URL);
  }
  return primaryClient;
}

/** HTML beautify provider (Poolside). Null when AI_HTML_API_KEY is unset. */
export function getHtmlClient(): OpenAI | null {
  if (htmlClient === undefined) {
    htmlClient = createClient(process.env.AI_HTML_API_KEY, process.env.AI_HTML_BASE_URL);
  }
  return htmlClient;
}

/** Embeddings provider (Jina). Null when no key is set. */
export function getEmbeddingsClient(): OpenAI | null {
  if (embeddingsClient === undefined) {
    // JINA_API_KEY is the canonical name for the api.jina.ai key
    embeddingsClient = createClient(
      process.env.AI_EMBEDDINGS_API_KEY || process.env.JINA_API_KEY,
      process.env.AI_EMBEDDINGS_BASE_URL,
    );
  }
  return embeddingsClient;
}

/** True when the embeddings endpoint is Jina and supports the `task` body field. */
export function embeddingsSupportsTask(): boolean {
  return Boolean(process.env.AI_EMBEDDINGS_BASE_URL?.includes('jina.ai'));
}

/** Test-only reset so env changes between tests re-read config. */
export function resetClientsForTests() {
  primaryClient = undefined;
  htmlClient = undefined;
  embeddingsClient = undefined;
}
