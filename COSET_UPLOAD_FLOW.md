# Technical Architecture: CoSET Intelligence Pipeline

## File Upload → AI Processing → Publishing → Editing

This document provides a deep technical breakdown of how the CoSET Intelligence Hub handles the end-to-end lifecycle of a report, from raw document ingestion to live public deployment.

---

## 1. Multi-Channel Ingestion

CoSET supports ingestion via file uploads and external URL scraping. Both channels use a unified extraction pipeline but differ in their initial data capture.

### File Upload (PDF, PPTX, CSV, DOCX)

1.  **Parsing**: Uses `lib/document-parser.ts` to convert binary formats into raw text.
2.  **Preview**: Slips the first 12,000 characters to Gemini for metadata generation.
3.  **Code (API)**:
    ```typescript
    // app/api/extract-from-file/route.ts
    const parseResult = await parseDocument(file);
    const textPreview = parseResult.text.slice(0, 12000);
    ```

### URL Scraping

1.  **SSRF Protection**: Validates the URL against private IP ranges and local hostnames.
2.  **Capture**: Fetches the HTML content with a 15-second timeout.
3.  **Code (API)**:
    ```typescript
    // app/api/extract-from-url/route.ts
    const fetchResponse = await fetch(url, {
      headers: { "User-Agent": "CoSET-IntelHub/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    ```

---

## 2. AI Processing: Metadata & Content Extraction

Use **Gemini 1.5 Flash** for semantic analysis.

### Metadata Auto-Fill

The system prompts Gemini to return a specific JSON structure. This ensures consistency in the "Step 1: Add Details" phase of the wizard.

```typescript
// lib/genai.ts
const prompt = `Return JSON only: { "title": "...", "summary": "...", "category": [], "tags": [] }`;
const response = await client.models.generateContent({
  model: "gemini-1.5-pro",
  contents: [{ role: "user", parts: [{ text: prompt }] }],
});
```

### URL to Semantic HTML

For scraping, the AI is tasked with extracting the _core report body_ while stripping navigation and ads, returning it as clean semantic HTML.

```typescript
// Prompt instruction for scraping
purpose === "web-scraping"
  ? `Extract core content as semantic HTML (h1-3, p, ul, table)`
  : `Extract metadata only`;
```

---

## 3. Storage & Background Vectorization

Data persistence is handled via Supabase, with an asynchronous RAG (Retrieval-Augmented Generation) pipeline.

### Document Storage

Files are saved in `report-uploads` storage bucket. Featured images (covers) are stored in a separate folder scoped by the user ID.

### Vector Embeddings (RAG)

To power the Hub's smart search and AI chat, reports are chunked and embedded using the `text-embedding-004` model.

```typescript
// lib/embeddings.ts
export async function processAndEmbedReport(
  reportId: string,
  extractedText: string,
) {
  const chunks = extractedText.split(/\n\s*\n/).filter((c) => c.length > 50);

  for (const text of chunks) {
    const embedding = await client.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });

    await supabase.from("report_embeddings").insert({
      report_id: reportId,
      content: text,
      embedding: embedding.values,
    });
  }
}
```

---

## 4. Publishing Workflow

The publishing lifecycle is managed via the `reports` table's `status` enum and a dedicated deployment API.

### Deployment States

| State       | Logic                                     | Visibility           |
| :---------- | :---------------------------------------- | :------------------- |
| `draft`     | Default state on upload.                  | Admin Only           |
| `published` | Sets `published_at` to current timestamp. | Public Hub           |
| `scheduled` | Stores `published_at` as a future date.   | Hidden until trigger |
| `archived`  | Removes from active lists.                | Admin Only           |

### API Trigger

```typescript
// app/api/reports/deploy/route.ts
export async function PATCH(request: Request) {
  const { reportId, status } = await request.json();
  await supabase.from("reports").update({ status }).eq("id", reportId);
}
```

---

## 5. Editing & Revision

Editing is a seamless extension of the creation wizard, using "Hydration Logic".

### Hydrating the Wizard

The `AdminUploadPage` fetches existing report data and passes it as `initialData` to the `UploadWizard`.

```typescript
// app/admin/upload/page.tsx
const { data: report } = await supabase.from('reports').eq('slug', slug).single();
return <UploadWizard initialData={report} />;
```

### Upserting Changes

The wizard uses the presence of an `id` to determine if it should perform a database update instead of a fresh insert.

```typescript
// components/upload-wizard.tsx
if (initialData?.id) {
  formData.append("id", initialData.id);
}
```

---

## Architecture Summary Table

| Component     | Responsibility             | Technology                    |
| :------------ | :------------------------- | :---------------------------- |
| **Logic**     | API Routes & Processing    | Next.js (App Router)          |
| **AI Drafts** | Metadata & HTML Extraction | Gemini 1.5 Pro                |
| **Search**    | Semantic Similarity Search | pgvector + text-embedding-004 |
| **Storage**   | Raw Assets & Images        | Supabase Storage              |
| **Database**  | Metadata & Audit Logs      | Supabase PostgreSQL           |
| **UI**        | Interactive Upload Wizard  | Framer Motion + React         |

---

### Key Technical Considerations

- **Transaction Safety**: If database insertion fails, the uploaded file is automatically purged from Supabase Storage to prevent orphaned cloud assets.
- **Chunking Strategy**: Paragraph-based chunking is used for better semantic retrieval in the RAG pipeline compared to fixed character limits.
- **Editor Roles**: All operations are protected by a `role` check (`admin` | `editor`) in the `profiles` table.
