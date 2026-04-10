---
applyTo: app/api/**
---

# API Routes — Copilot Instructions

## Supabase Client in API Routes

```ts
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/clients";

// Use createSupabaseServerClient for authenticated user context
// Use createSupabaseAdminClient for privileged writes (bypasses RLS)
```

Always check authentication before modifying data:

```ts
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user)
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
```

## Implemented Routes

### `POST /api/extract-from-file`

Fully implemented. Handles:

- File parsing (PDF, DOCX, PPTX, CSV, TXT, HTML, XML)
- AI metadata extraction via Google Gemini (`generateExtractionDraft()`)
- `previewOnly: 'true'` → returns AI draft without persisting to DB
- Without `previewOnly` → saves/updates report in Supabase

**FormData fields:**

```
file: File               required
previewOnly: 'true'?     if set, return AI draft only, do not save
title: string?           override for AI title
summary: string?         override for AI summary (maps to DB `description`)
categories: string[]?    additional categories (maps to DB `category[]`)
tags: string[]?          additional tags
id: string?              if set, UPDATE existing report (not INSERT)
coverImagePath: string?  preserve existing cover image on update
```

**Do NOT modify this route's core logic.** Only add features if explicitly requested.

### `POST /api/chat`

Implemented. AI-powered report Q&A assistant. Do not modify unless asked.

### Routes that are EMPTY STUBS (do not implement unless asked)

- `POST /api/reports/deploy` — empty, intended for draft-to-published promotion
- `POST /api/extract-from-url` — empty, intended for URL scraping workflow

## Database Column Names (critical — wrong names cause silent bugs)

When writing to the `reports` table inside API routes:

| Wizard/Form state | DB column name              |
| ----------------- | --------------------------- |
| `summary`         | `description`               |
| `categories`      | `category` (array `text[]`) |
| `title`           | `title`                     |
| `tags`            | `tags` (array `text[]`)     |
| `content`         | `html_content`              |
| `coverImagePath`  | `cover_image_path`          |

Always set `status: 'draft'` as default when inserting new reports.

## Error Response Format

Always use `NextResponse.json()` with proper HTTP status codes:

```ts
// Error
return NextResponse.json({ error: "Human-readable message" }, { status: 400 });

// Success
return NextResponse.json({ success: true, report: { slug } });
```

## Runtime

All API routes should declare:

```ts
export const runtime = "nodejs";
```

(Some routes need native modules for file parsing — keep this declaration.)
