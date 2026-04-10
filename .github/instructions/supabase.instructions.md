---
applyTo: "**"
---

# Supabase & Database — Copilot Instructions

## Client Selection (use the right one for the context)

| Where                                     | Client                         | Why                                 |
| ----------------------------------------- | ------------------------------ | ----------------------------------- |
| `app/**/page.tsx` (Server Component)      | `createSupabaseServerClient()` | Has user session cookies            |
| `app/api/**/route.ts` (API Route)         | `createSupabaseServerClient()` | Has user session cookies            |
| `app/api/**/route.ts` (privileged writes) | `createSupabaseAdminClient()`  | Bypasses RLS for service operations |
| `components/**/*.tsx` (`'use client'`)    | `createSupabasePublicClient()` | Browser-safe anonymous client       |

```ts
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
  createSupabasePublicClient,
} from "@/lib/supabase/clients";
```

## Reports Table Schema (exact column names)

```sql
reports (
  id              bigint PRIMARY KEY,
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text,            -- ⚠️ NOT "summary"
  category        text[],          -- ⚠️ NOT "categories", always an array
  tags            text[],
  author          text,
  status          content_status,  -- 'draft' | 'published' | 'scheduled' | 'archived'
  html_content    text,            -- ⚠️ NOT "content"
  cover_image_path text,
  views           int DEFAULT 0,
  downloads       int DEFAULT 0,
  published_at    timestamptz,
  created_at      timestamptz,
  updated_at      timestamptz
)
```

## Blog Posts Table Schema

```sql
blog_posts (
  id         bigint PRIMARY KEY,
  slug       text UNIQUE NOT NULL,
  title      text NOT NULL,
  excerpt    text,
  category   text,               -- single value (not array)
  author     text,
  status     content_status,
  featured   boolean DEFAULT false,
  html_content text,
  image_path text,
  created_at timestamptz,
  updated_at timestamptz
)
```

## Profiles Table Schema

```sql
profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users,
  email     text,
  full_name text,
  role      text    -- 'admin' | 'editor' | 'viewer'
)
```

## Common Query Patterns

```ts
// Fetch single report by slug
const { data, error } = await supabase
  .from("reports")
  .select("*")
  .eq("slug", slug)
  .single();

// Fetch published reports list
const { data } = await supabase
  .from("reports")
  .select(
    "id, slug, title, description, category, tags, author, status, cover_image_path, created_at",
  )
  .eq("status", "published")
  .order("created_at", { ascending: false });

// Update report by id
const { error } = await supabase
  .from("reports")
  .update({
    title,
    description,
    category,
    tags,
    updated_at: new Date().toISOString(),
  })
  .eq("id", id);
```

## Critical Mapping (wizard → DB)

The UploadWizard component uses different names internally than the DB:

| Wizard internal state | DB column     |
| --------------------- | ------------- |
| `summary`             | `description` |
| `categories`          | `category`    |
| (same)                | `tags`        |
| (same)                | `title`       |

Always map these before any `.insert()` or `.update()` call in API routes.

## Supabase Storage

Bucket: `report-images`  
Images are uploaded during file processing and referenced via `cover_image_path` in the reports table.  
If `cover_image_path` references a file that no longer exists in storage, set it to `null` (use the fallback image).
