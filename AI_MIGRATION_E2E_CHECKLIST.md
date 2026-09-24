# AI Provider Migration — E2E Verification Checklist

Migration: personal Google AI API key → **Agnes** (generation/vision) + **Poolside** (HTML beautify) + **Jina AI** (embeddings), all registered under COSET's own email.

## Environment contract

| Variable | Provider | Purpose |
|---|---|---|
| `AI_API_KEY`, `AI_BASE_URL` | Agnes (`https://apihub.agnes-ai.com/v1`) | chat, extraction, metadata, vision OCR |
| `AI_HTML_API_KEY`, `AI_HTML_BASE_URL`, `AI_HTML_MODEL` | Poolside (`https://inference.poolside.ai/v1`) | `beautify-content` only; falls back to Agnes if unset/failing |
| `JINA_API_KEY` (or `AI_EMBEDDINGS_API_KEY`), `AI_EMBEDDINGS_BASE_URL`, `AI_EMBEDDINGS_MODEL`, `AI_EMBEDDINGS_DIM` | Jina (`https://api.jina.ai/v1`, `jina-embeddings-v3`) | semantic search + RAG retrieval |

`AI_EMBEDDINGS_DIM` must stay 1024 — it matches `jina-embeddings-v3`'s native output and the dimension in `supabase/migrations/20260924000000_migrate_embeddings_openai_compatible.sql`. Switching embedding models later means a full corpus re-embed.

Jina specifics wired into `lib/ai/embed.ts`: documents embed with `task: 'retrieval.passage'`, user queries with `task: 'retrieval.query'` (sent only when the base URL is jina.ai, so the abstraction stays provider-neutral). Chunks are ~700 tokens with ~12% overlap (per the retrieval brief). Free-tier note: tokens are metered — a full corpus re-embed of a large archive may approach the free grant; watch `usage.total_tokens` in the reembed run.

## Already verified (2026-09-24, live keys)

- [x] Agnes `agnes-2.0-flash` chat completion — HTTP 200 (reasoning model; `reasoning: {enabled:false, exclude:true}` accepted, content returned)
- [x] Agnes vision — base64 `data:` URL image accepted, described correctly
- [x] Poolside `poolside/laguna-s-2.1` — model list + chat completion, HTTP 200 (free tier, 262K context, text-only)
- [x] Jina `jina-embeddings-v3` — 1024-dim vectors, `retrieval.passage` + `retrieval.query` task modes, token metering active (free tier)
- [x] Local E2E: `POST /api/chat` general mode — streamed grounded answer with citations (`X-Response-Source: rag`)
- [x] Local E2E: `POST /api/chat` report mode — report-scoped retrieval + streamed summary
- [x] Local E2E: `GET /api/search` — Jina query embedding succeeds; retrieval falls back to text search until the Supabase migration + backfill run (scores 0)
- [x] Local E2E: `GET /api/chat` diagnostic — DB + text search healthy
- [x] Embeddings failure path — provider errors → `null` → text-search fallback, no user-facing errors
- [x] CI parity — vitest 55/55, `tsc --noEmit`, `next lint`, `next build` all pass

## Remaining steps

### 1. Database migration (deployment window — brief vector downtime)
1. Apply `supabase/migrations/20260924000000_migrate_embeddings_openai_compatible.sql` to production Supabase (drops old 768-dim vectors, recreates `match_report_embeddings` + HNSW index at 1024). Until the backfill finishes, chat/search run on text search — fully functional, no semantic scores.
2. Dry-run the backfill: `npm run reports:reembed -- --dry-run`
3. Apply: `npm run reports:reembed -- --write` (sequential batches; re-embeds all reports from `extracted_text`/`html_content` with ~700-token overlapping chunks)
4. Sanity: `match_report_embeddings` returns sensible similarities for known queries; search scores > 0.
5. Watch Jina `usage.total_tokens` during the backfill to stay inside the free grant.

### 2. Editor flows (requires editor/admin login, dev or preview)
- [ ] Upload wizard: PDF → metadata draft → beautified preview → save/publish (embeddings rows created on publish path)
- [ ] Upload wizard: DOCX and image-only file (vision OCR path; check `parserUsed` in response)
- [ ] Upload wizard: URL scrape (`extract-from-url` → draft with `formattedContent`)
- [ ] Paste-content path: `analyze-content` autofill + `beautify-content`
- [ ] Beautify quality gate: compare Poolside HTML vs previous Gemini output on the same report; if layout regresses, flip `AI_HTML_MODEL` or unset `AI_HTML_API_KEY` to route beautify to Agnes

### 3. Known constraint: Agnes free-tier rate limits
Agnes enforces a tight per-minute quota on free keys. Back-to-back requests can 429 even with the in-process request serializer + SDK retries; chat then shows its inline "encountered an error" message. If production traffic hits this: upgrade the Agnes Token Plan, or repoint `AI_BASE_URL`/`AI_API_KEY` at another OpenAI-compatible gateway — the abstraction makes that an env-only change.

### 4. Cutover to production
1. Add the `AI_*` vars to Vercel (Production + Preview), registered under COSET email.
2. Deploy, verify the checklist above on the preview URL, then promote.
3. Apply the Supabase migration + run `reports:reembed --write` against production.
4. After verification: remove `GOOGLE_GENERATIVE_AI_*` from Vercel and local env files, then **revoke the personal Google AI API key**.
5. Rollback path (if needed before step 4): redeploy the previous release and restore the old env vars.

## Code map (what changed)

- `lib/ai/clients.ts` — provider clients from env, model config, primary-request serializer, beautify provider decision
- `lib/ai/generate.ts` — `generateExtractionDraft`, `analyzeContentForMetadata`, `beautifyHtmlContent`, `extractContentFromImage` (same contracts as the old `lib/genai.ts`, now via the OpenAI SDK)
- `lib/ai/embed.ts` — `chunkReportText` (~700-token overlapping chunks), `embedTexts`, `embedQuery` (Jina task modes), `orderEmbeddings`
- `lib/embeddings.ts` — ingest-time embedding pipeline on the new module
- `app/api/chat/route.ts` — OpenAI-compatible streaming + `embedQuery` retrieval; all fallbacks preserved
- `app/api/search/route.ts` — `embedQuery` semantic search; text-search fallback preserved
- `supabase/migrations/20260924000000_migrate_embeddings_openai_compatible.sql` — 768→1024 vector migration
- `scripts/reembed-reports.ts` — full-corpus re-embed backfill (`npm run reports:reembed`)
- `__tests__/lib/ai.test.ts` + `__tests__/setup.ts` — adapter unit tests; `openai` mock replaces `@google/genai`
- Removed: `lib/genai.ts`, `@google/genai` dependency, `GOOGLE_GENERATIVE_AI_*` env contract
