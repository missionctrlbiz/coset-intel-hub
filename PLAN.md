# CoSET Intelligence Hub — Comprehensive Improvement Insights

## Context

CoSET Intelligence Hub is a Next.js 14 App Router premium intelligence publishing platform for the Coalition for Socio-Ecological Transformation (CoSET) Nigeria. Admins ingest reports via file upload (PDF/DOCX/PPTX), URL scraping, or text paste — Google Gemini AI extracts metadata, beautifies HTML, and generates vector embeddings. Public users discover reports via semantic search and an RAG-powered floating chat widget. The platform is ~85% production-ready with strong core flows but meaningful gaps in security, performance, and observability.

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript 5.7 strict · Supabase PostgreSQL + pgvector · Google Gemini (text-embedding-004, gemini-2.5-pro, gemini-1.5-flash) · Tailwind CSS · Vercel

---

## SECTION 1 — SECURITY (Urgent)

### 1.1 Exposed API Keys in `.env` / `.env.local`
**Severity: CRITICAL**
The `GOOGLE_GENERATIVE_AI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and anon key are present in tracked/accessible `.env` files. The service role key bypasses all Row-Level Security policies — full database read/write for anyone with access.

**Actions:**
- Rotate all three keys immediately via Supabase dashboard and Google Cloud Console
- Move secrets to Vercel Environment Variables (server-only)
- Add `.env*` (except `.env.example`) to `.gitignore`
- Run `git filter-repo` or BFG to scrub history
- Never log `process.env.*` secrets

### 1.2 No HTML Sanitization After AI Beautification
**Severity: HIGH**
`lib/genai.ts` strips `<script>` and `<style>` tags *before* sending to Gemini, but the output returned by Gemini is written directly to `reports.html_content` in the database without re-sanitization. A jailbroken or prompt-injected Gemini response could store malicious HTML that is then rendered via `dangerouslySetInnerHTML` on public report pages.

**Fix:** Run `isomorphic-dompurify` (already installed) on Gemini's returned HTML before any database write, in every AI route that produces `html_content`.
- `app/api/extract-from-file/route.ts` — sanitize before insert
- `app/api/beautify-content/route.ts` — sanitize before returning
- `app/api/extract-from-url/route.ts` — sanitize before insert

### 1.3 No Rate Limiting on Any Endpoint
**Severity: HIGH**
All 12 API routes (search, chat, subscribe, feedback, extract, beautify) have zero rate limiting. An attacker can:
- Exhaust Google Gemini quota by POSTing millions of extraction requests
- Spam the feedback and subscribe endpoints
- Brute-force the search/chat endpoints

**Fix:** Add Vercel Edge rate limiting via `@upstash/ratelimit` + `@upstash/redis` (serverless-friendly). Target limits: search (60/min), chat (20/min), extract (10/min), subscribe (5/min).

### 1.4 SSRF — DNS Rebinding Not Blocked
**Severity: MEDIUM**
`app/api/extract-from-url/route.ts` blocks RFC 1918 private IPs and metadata endpoints by literal IP check — but if an attacker controls a domain that resolves to a private IP (DNS rebinding), the IP check at validation time may differ from the IP used at fetch time.

**Fix:** After fetching the URL, check the actual resolved IP of the response (via `dns.lookup()` or inspecting the socket). Alternatively, use a hosted URL fetching microservice (Browserless, Apify) that runs in an isolated network.

### 1.5 File Upload — No Size Limit or Virus Scan
**Severity: MEDIUM**
No explicit `Content-Length` check before reading uploaded files. A 500 MB PDF upload would be read into memory, then potentially time out at 60s, consuming server resources.

**Fix:**
- Check `req.headers.get('content-length')` and reject > 50 MB before reading body
- Use Supabase Storage bucket policy to enforce max size at the storage layer
- Consider integrating VirusTotal / ClamAV for file scanning in production

---

## SECTION 2 — DATA INGESTION

### 2.1 No Streaming Progress Feedback
All Gemini extraction calls are blocking — the upload wizard shows a spinner for up to 60 seconds with no indication of which step is running. Users have no confidence the process is alive.

**Fix:** Convert the wizard to use Server-Sent Events (SSE) or a status polling pattern:
1. Upload returns a job ID immediately
2. Client polls `/api/jobs/[id]` every 2s
3. Server writes status updates to `report_ingestions.status` as each stage completes: `uploaded → extracting → drafted → embedding → completed`
4. Wizard displays a live step list with checkmarks as each stage fires

### 2.2 Embeddings Generation is Fire-and-Forget with No Recovery
`lib/embeddings.ts` runs embedding generation asynchronously after upload. If it fails (Gemini quota hit, network timeout), no alert is raised and the report silently lacks vector search capability.

**Fix:**
- Set `report_ingestions.status = 'failed'` on embedding errors with `error_message`
- Add a retry queue: a background job (Vercel Cron) that finds `report_ingestions` with `status = 'failed'` and retries embedding every hour
- Admin dashboard should surface "Reports missing embeddings" as a warning card

### 2.3 Text Truncation Loses End of Long Reports
Documents are truncated at 120,000 chars before being sent to Gemini for metadata extraction. The FULL text is not sent for embedding either — only early chunks are used if the text is very long.

**Fix:**
- For metadata extraction: summarize the last 10% of the text and append it with a separator (so Gemini sees beginning + end context for better title/summary generation)
- For embeddings: ensure ALL chunks are embedded, not just the first batch — the current `processAndEmbedReport()` function in `lib/embeddings.ts` should loop until all chunks are processed

### 2.4 No Batch / Bulk Import
Each report must be uploaded one at a time through the wizard. For a content team ingesting 20 research PDFs, this is a productivity bottleneck.

**Fix:** Add a `/admin/upload/batch` page that accepts a ZIP of PDFs, processes each sequentially in the background, and sends an admin email summary when complete. Use `report_ingestions` to track each file's status.

### 2.5 OCR Missing for Image-Heavy PDFs
`pdf-parse` extracts embedded text only. PDFs that are scanned (image-based) return empty text, silently producing a report with no content and no embeddings.

**Fix:** Detect empty `extractedText` after parsing. If text is blank or < 100 chars, flag in `report_ingestions` with `status = 'needs_ocr'`. Consider integrating Google Cloud Vision API or Gemini's multimodal API (which can process PDF pages as images) as an OCR fallback.

---

## SECTION 3 — AI GENERATION

### 3.1 No Streaming on Chat Endpoint
`app/api/chat/route.ts` waits for the full Gemini response before sending anything to the client. For a complex question, this means 5-15 seconds of silence, then a wall of text appears.

**Fix:** Use Gemini's streaming API (`generateContentStream`) and return a `ReadableStream` response. The floating chat widget (`components/floating-chat.tsx`) must be updated to read the stream and append tokens incrementally. This is the single highest-impact UX improvement for the chat feature.

### 3.2 Beautification Prompt is 568 Lines — Unmaintainable
`lib/genai.ts` contains a 568-line system prompt embedded as a template string. Any change to the brand palette, output format, or chart rendering rules requires finding the right line inside a giant string.

**Fix:** Extract the prompt to a versioned file at `lib/prompts/beautify-v1.txt` (or `.md`). Build a lightweight `getPrompt(name, vars)` loader. This enables:
- A/B testing different prompt versions
- Non-developer prompt editing via admin UI
- Version history in git showing what changed

### 3.3 No Caching of AI Responses
Every time the admin hits "Analyze" or "Beautify," a fresh Gemini API call is made even if the content hasn't changed. For a 50-page report, this costs money and time.

**Fix:**
- Cache `analyzeContentForMetadata` results in `report_ingestions.ai_draft` (already done partially) — re-use if `html_content` hasn't changed
- Cache `beautifyHtmlContent` output keyed by `sha256(inputHtml)` in a `lib/ai-cache` table or Redis
- Display "Used cached analysis" badge in wizard when cache hit

### 3.4 No Graceful Fallback When Gemini Quota Is Exhausted
If the Gemini API key hits its daily quota, all extraction, beautification, and chat calls fail with an uncaught API error. The user sees a generic "Internal Server Error."

**Fix:**
- Catch Gemini `429` and `503` responses explicitly
- For extraction: fall back to rule-based metadata extraction (parse `<h1>` for title, first paragraph for summary)
- For chat: return a friendly "AI assistant is temporarily unavailable — please try again later" message with HTTP 503
- Add Gemini quota monitoring via the Google Cloud Console alerts

### 3.5 Model Names Partially Hardcoded
Some routes use `process.env.GOOGLE_GENERATIVE_AI_MODEL` (configurable) while others hardcode `'gemini-2.5-pro'` or `'gemini-1.5-flash'` directly in the source. If a model is deprecated, multiple files need updating.

**Fix:** Centralize model selection in `lib/genai.ts`:
```ts
export const MODELS = {
  fast: process.env.GOOGLE_GENERATIVE_AI_FAST_MODEL ?? 'gemini-2.0-flash',
  standard: process.env.GOOGLE_GENERATIVE_AI_MODEL ?? 'gemini-2.5-pro',
  embedding: 'text-embedding-004',
} as const;
```
All routes import and use `MODELS.fast`, `MODELS.standard`, etc.

---

## SECTION 4 — DATABASE OPTIMIZATION

### 4.1 N+1: Role Fetched Separately on Every Protected Route
Every protected API route runs two sequential queries: `supabase.auth.getUser()` then `supabase.from('profiles').select('role').eq('id', user.id)`. With 10 admin actions per minute, that's 20 round-trips where 10 would suffice.

**Fix:** Create a Postgres function `get_user_role(uid)` that returns the role directly, or join the role in the user metadata at login time and store it in the JWT claims via a Supabase Auth hook. The latter eliminates the `profiles` query entirely for role checks.

### 4.2 Full-Text Search Falls Back to `ilike` Instead of `tsvector`
`app/api/search/route.ts` uses `ilike '%query%'` as the non-vector fallback. The `reports` table already has a `search_vector tsvector` column with a GIN index built by a trigger. `ilike` doesn't use that index — it does a full table scan.

**Fix:** Replace the `ilike` fallback with:
```sql
SELECT * FROM reports
WHERE search_vector @@ plainto_tsquery('english', $1)
  AND status = 'published'
ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
LIMIT 10;
```
This uses the existing GIN index and is 10–100x faster on large datasets.

### 4.3 Stale Embeddings Not Cleaned Up on Content Update
When a report's `html_content` is edited after initial publication, the old `report_embeddings` rows remain. The next chat or search query will surface outdated text chunks alongside current ones.

**Fix:** Add a database trigger on `reports.html_content` updates that deletes all rows in `report_embeddings` where `report_id = NEW.id`, then re-queues embedding generation. Track this in `report_ingestions` with a new `status = 're_embedding'`.

### 4.4 No Pagination on Admin Data Fetches
`lib/content.ts` fetches all reports, all subscribers, and all feedback in single queries with no LIMIT or cursor. At 1,000+ records, this will cause slow admin page loads and potential memory issues.

**Fix:** Add cursor-based pagination to:
- `getReports()` in `lib/content.ts` — add `page` and `pageSize` params, return `{ data, nextCursor, total }`
- `getSubscribers()` — same pattern
- `getFeedback()` — same pattern
Update admin UI to show "Load more" or page controls.

### 4.5 No Connection Pooling Configuration
No PgBouncer or Supabase connection pooling is configured in the client setup (`lib/supabase/clients.ts`). Under concurrent upload operations (each creating a Node.js DB connection), the Postgres connection limit (25 for free tier, 60 for pro) could be exceeded.

**Fix:** Use Supabase's connection pooling URL (the `?pgbouncer=true` variant) for server-side clients. Enable transaction-mode pooling for short-lived API route connections.

---

## SECTION 5 — BACKEND / API IMPROVEMENTS

### 5.1 No Request Validation (No Zod)
API routes validate inputs manually with ad-hoc `if (!field)` checks. There's no schema validation, so type errors, unexpected nulls, and malformed payloads are only caught at runtime.

**Fix:** Add `zod` to the project. Define a schema per route:
```ts
const FeedbackSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});
```
Parse the request body at the top of each route handler. Return a structured `400 Bad Request` with field-level error details on validation failure.

### 5.2 No Structured Logging or Error Reporting
`console.error()` is scattered across 11+ files. In production on Vercel, these become unstructured text logs. There's no correlation ID to trace a request across API routes and AI calls.

**Fix:**
- Add `pino` (lightweight) or use Vercel's built-in log drains
- Create `lib/logger.ts` with `{ logger.info, logger.error, logger.warn }` that includes `requestId`, `route`, `userId`, `durationMs`
- Integrate Sentry (or Better Stack) for exception capturing — one-line setup in Next.js

### 5.3 Scheduled Publishing Has No Execution Engine
The `reports` table has `status = 'scheduled'` and `published_at` fields, but no background job actually flips scheduled reports to `published` at the scheduled time. Content scheduled for future release never goes live automatically.

**Fix:** Add a Vercel Cron job (`vercel.json` → `crons`) that runs every 5 minutes:
```ts
// app/api/cron/publish-scheduled/route.ts
const { data } = await supabase
  .from('reports')
  .update({ status: 'published' })
  .eq('status', 'scheduled')
  .lte('published_at', new Date().toISOString());
```

### 5.4 No API Versioning
All routes are at `/api/*` with no version prefix. As features evolve, making breaking changes (changing response shapes) will break existing clients or admin UI without warning.

**Fix (lightweight):** Add a `X-API-Version: 1` response header to all routes today. When a breaking change is needed, route it to `/api/v2/*`. The cost is low, the protection is high.

---

## SECTION 6 — FRONTEND UX IMPROVEMENTS

### 6.1 Chat Has No Streaming — Most Impactful UX Win
Already covered in Section 3.1. The chat widget feels sluggish because responses arrive all at once. Streaming token-by-token transforms the perceived quality of the AI dramatically. This is the #1 frontend UX improvement.

### 6.2 No Error Boundaries Around Page Sections
`app/error.tsx` exists but only catches full-page errors. If the floating chat widget, the hero carousel, or the search dropdown throws, the entire page crashes.

**Fix:** Wrap major sections in React `<ErrorBoundary>` components:
- Carousel section in `home-sections.tsx`
- `<FloatingChat />` in `app/reports/[slug]/page.tsx`
- Search dropdown in `components/search-form.tsx`

Use a simple `FallbackComponent` that hides the errored section gracefully.

### 6.3 Search Dropdown Missing ARIA Roles
The search dropdown is not announced to screen readers as an interactive list. Users on assistive technology can't navigate suggestions with arrow keys.

**Fix:** Apply `role="combobox"` to the search input, `role="listbox"` to the dropdown container, and `role="option"` + `aria-selected` to each result. Add keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).

### 6.4 Modal Focus Trapping Missing
`components/delete-report-button.tsx` and `components/subscribe-modal-trigger.tsx` open modals but don't trap keyboard focus inside them. Tab key will navigate outside the modal to content behind it.

**Fix:** Use the browser's native `<dialog>` element (which handles focus trapping natively) or add a focus trap hook that keeps focus within the modal's DOM subtree.

### 6.5 Admin Tables Have No Pagination in UI
The content management table, subscribers list, and analytics tables display all data or rely on infinite skeletons. Even with 50 reports, this will cause layout jank.

**Fix:** Add a simple `<Pagination>` component to all admin tables with "Previous / Next" controls. Wire to the cursor-based pagination from Section 4.4.

### 6.6 Upload Wizard is 957 Lines — Needs Decomposition
`components/upload-wizard.tsx` combines file picking, metadata display, HTML preview, publish controls, and success animation into one massive client component. It's difficult to test, debug, or extend.

**Fix:** Split into:
- `UploadWizardRoot.tsx` — state machine, step routing only
- `UploadStep.tsx` — file/URL/text upload UI
- `ExtractStep.tsx` — metadata review and editing
- `PreviewStep.tsx` — HTML preview with beautify button
- `PublishStep.tsx` — scheduling, visibility, publish button
- `SuccessOverlay.tsx` — confetti + confirmation

### 6.7 Image Optimization Disabled
`next.config.js` has `unoptimized: true` for images. This bypasses Next.js Image Optimization entirely — hero carousel images, cover images, and report thumbnails are served at full resolution regardless of device viewport.

**Fix:** Remove `unoptimized: true`. Configure `remotePatterns` for the Supabase storage domain (already partially done). Add `sizes` props to `<Image>` components. Expected benefit: 40-70% reduction in image bytes served on mobile.

---

## SECTION 7 — PERFORMANCE OPTIMIZATIONS

### 7.1 Remove Leaflet (~1.2 MB Unused Dependency)
`leaflet` and `@types/leaflet` appear in `package.json` but no map component exists in the codebase. This dead dependency adds to install time and could accidentally end up in the bundle.

**Action:** `npm uninstall leaflet @types/leaflet`

### 7.2 Dynamically Import Heavy Libraries
`canvas-confetti` is imported at the top of `upload-wizard.tsx` even though it only fires once (on successful publish). `framer-motion` is also bundled unconditionally.

**Fix:**
```ts
// Instead of: import confetti from 'canvas-confetti'
const confetti = (await import('canvas-confetti')).default;
```
Do this inside the success handler only. For framer-motion, use `dynamic(() => import('framer-motion'), { ssr: false })` for animation-heavy sections.

### 7.3 Add HTTP Cache Headers to Read-Only API Responses
`GET /api/search` and `GET /api/reports/[id]?download=1` return no `Cache-Control` headers. Every search request hits the server fresh even if the same query was made 30 seconds ago.

**Fix:**
```ts
return NextResponse.json(results, {
  headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' }
});
```
Apply `s-maxage=60` to search, `s-maxage=3600` to signed download URLs (which are time-limited anyway).

### 7.4 Reduce `globals.css` Duplication
`app/globals.css` is 737 lines. Light/dark prose styles are duplicated (lines 73-86 vs 123-256). Many vendor prefixes are manually written despite autoprefixer being in the build chain.

**Fix:** Deduplicate using Tailwind's `@apply` in the dark mode block. Remove manually written vendor prefixes (`-webkit-`, `-moz-`) — autoprefixer handles these at build time.

### 7.5 Memoize Report Filtering in `reports-explorer.tsx`
`reports-explorer.tsx:32-36` filters and sorts all reports on every render with no memoization. If the component re-renders (e.g., due to parent state updates), all filtering is redone.

**Fix:**
```ts
const filteredReports = useMemo(
  () => reports.filter(...).sort(...),
  [reports, activeCategory, activeTags, sortOrder]
);
```

---

## SECTION 8 — ARCHITECTURE & DEVELOPER EXPERIENCE

### 8.1 Zero Test Coverage
No unit, integration, or E2E tests exist anywhere in the project. The HANDOVER_REVIEW.md explicitly flags this. Critical paths that are completely untested:
- HTML sanitization (XSS vectors)
- Upload pipeline (file → AI → DB)
- Role-based access (can viewer POST to editor routes?)
- Search hybrid ranking logic

**Fix (priority order):**
1. Vitest unit tests for `lib/sanitize.ts`, `lib/document-parser.ts`, `lib/embeddings.ts`
2. Playwright E2E test for the upload wizard golden path
3. API route integration tests with a test Supabase project

### 8.2 No CI/CD Pipeline
No GitHub Actions or Vercel CI beyond auto-deploy on push. A broken TypeScript error or ESLint violation can reach production silently.

**Fix:** Add `.github/workflows/ci.yml`:
```yaml
on: [push, pull_request]
jobs:
  ci:
    steps:
      - npm ci
      - npm run typecheck   # tsc --noEmit
      - npm run lint
      - npm run test        # once tests exist
      - npm run build
```

### 8.3 RBAC Logic Duplicated in Every Route
The pattern:
```ts
const user = await supabase.auth.getUser();
const profile = await supabase.from('profiles').select('role').eq('id', user.id);
if (!['admin','editor'].includes(profile.role)) return 403;
```
...appears in 8 of 12 API routes verbatim.

**Fix:** Extract to `lib/auth.ts`:
```ts
export async function requireRole(req: Request, allowedRoles: AppRole[]) {
  // returns { user, profile } or throws NextResponse with 401/403
}
```
Each route calls `const { user, profile } = await requireRole(req, ['admin', 'editor']);` — one line.

### 8.4 No Observability (Tracing, Metrics, Alerts)
The platform has no visibility into:
- How many reports are uploaded per day
- AI API latency and error rates
- Search query volume and zero-result rates
- Chat session engagement

**Fix (pragmatic for Vercel):**
- Enable Vercel Analytics (1 line in layout.tsx) for Core Web Vitals
- Add Vercel Speed Insights for real-user performance data
- Use PostHog (free tier) for product analytics events: `report_viewed`, `chat_used`, `search_performed`, `report_uploaded`

### 8.5 Unused Wireframe HTML in `/public`
`public/` contains ~2.1 MB of wireframe HTML files (stitch artifacts from PRD phase). These are served as static assets and increase Vercel deployment size.

**Fix:** Delete all wireframe HTML from `public/`. They are not linked from the app.

---

## SECTION 9 — FEATURES WORTH BUILDING NEXT

| Feature | Impact | Effort | Notes |
|---------|--------|--------|-------|
| Streaming AI chat | High | Medium | Gemini SDK supports `generateContentStream`; update `floating-chat.tsx` to consume SSE |
| Scheduled publish cron | High | Low | Vercel Cron + 10-line DB update; the schema already supports it |
| Admin real-time notifications | High | Medium | Supabase Realtime on `hub_feedback` and `newsletter_subscribers` tables; toast alerts in admin layout |
| Newsletter campaigns | Medium | Medium | Resend bulk email; new `campaigns` table; admin compose UI |
| Report download tracking | Medium | Low | Increment `reports.downloads` in the signed URL route (already stubbed) |
| Batch PDF import (ZIP upload) | Medium | Medium | Unzip server-side, queue sequential ingestion jobs |
| OCR fallback for scanned PDFs | Medium | High | Google Cloud Vision or Gemini multimodal API; trigger when `extractedText` is empty |
| Public comments / reactions | Low | High | Requires user auth for public; significant auth expansion |

---

## Verification / Testing Plan

Once any improvement is implemented, validate with:

1. **Security**: Use `npm audit`, run `OWASP ZAP` baseline scan against local dev server
2. **AI streaming**: Open `/reports/[any-slug]`, ask a question in chat — tokens should appear incrementally
3. **Sanitization**: POST malicious HTML (`<img src=x onerror=alert(1)>`) to `/api/beautify-content`, confirm DOMPurify strips it before DB write
4. **Rate limiting**: Run `ab -n 100 -c 10 http://localhost:3000/api/search?q=test`, confirm 429 after threshold
5. **Search quality**: Search for a term known to be in a report body — confirm it appears in results (validates tsvector index usage)
6. **Image optimization**: Run Lighthouse on the homepage — confirm `next/image` is serving WebP with correct sizes
7. **CI**: Verify GitHub Actions runs on every PR before merge
8. **Streaming cron**: Set a report's `published_at` to 1 minute in the future, wait for cron — confirm status flips to `published`

---

## Critical Files to Modify (by priority)

| Priority | File | Change |
|----------|------|--------|
| 1 | `lib/genai.ts` | Add DOMPurify sanitization on all returned HTML; centralize MODELS constants |
| 2 | `app/api/extract-from-file/route.ts` | Sanitize before DB write; add file size check; extract RBAC to `requireRole()` |
| 3 | `app/api/beautify-content/route.ts` | Sanitize output; add RBAC helper |
| 4 | `app/api/chat/route.ts` | Add streaming response via `generateContentStream` |
| 5 | `components/floating-chat.tsx` | Consume SSE stream, render tokens incrementally |
| 6 | `lib/content.ts` | Add pagination params to all list queries |
| 7 | `app/api/search/route.ts` | Replace `ilike` with `tsvector` full-text search |
| 8 | `next.config.js` | Remove `unoptimized: true` |
| 9 | `lib/auth.ts` (new) | Centralized `requireRole()` helper |
| 10 | `app/api/cron/publish-scheduled/route.ts` (new) | Scheduled publishing cron |
| 11 | `components/upload-wizard.tsx` | Decompose into 5 sub-components |
| 12 | `.github/workflows/ci.yml` (new) | TypeScript + lint + build CI |