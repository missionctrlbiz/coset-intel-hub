---
applyTo: app/admin/**
---

# Admin Pages — Copilot Instructions

## Layout Rules (STRICT)

The admin area has NO sidebar. It never did. Do not add one.

```
app/admin/layout.tsx → <SiteHeader /> + {children}   ← correct
app/admin/layout.tsx → <AdminSidebar /> + ...         ← WRONG, file does not exist
app/admin/layout.tsx → <AdminHeader /> + ...          ← WRONG, file does not exist
```

Every admin page content sits in:

```tsx
<div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
```

The upload page is `<main>` only — no outer layout container with a sidebar column.

## Server Components Only

All `app/admin/**/page.tsx` files are **Server Components** — they are `async` and fetch data directly from Supabase using `createSupabaseServerClient()`.

Client interactivity lives in `components/` — not inside page.tsx files.

## Completed Admin Pages (do NOT modify these unless explicitly asked)

- `/admin` — Dashboard with KPI stats. Working.
- `/admin/content` — Paginated content table. Working. Edit button links to `/admin/upload?edit={slug}`.
- `/admin/upload` — 3-step wizard. Working. Accepts `?edit=slug` to enter edit mode.
- `/admin/analytics` — UI done with mock data. Do not add or change the mock data.

## Stub Pages (do NOT fill these in unless explicitly asked)

- `/admin/subscribers/page.tsx` — Empty file. Do not fill it in unless the user asks.

## Edit Flow (how report editing works)

1. `/admin/content` shows a list of reports. Each "Edit" button links to `/admin/upload?edit={slug}`.
2. `/admin/upload/page.tsx` (Server Component) reads `searchParams.edit`, fetches the report by slug from Supabase, and passes `initialData` to `<UploadWizard />`.
3. `UploadWizard` detects `initialData` and skips to Step 1 (metadata edit), bypassing file upload.

```tsx
// app/admin/upload/page.tsx shape — do not add sidebar or other layout around this
export default async function AdminUploadPage({ searchParams }) {
  // fetch report if searchParams.edit exists ...
  return (
    <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
      <UploadWizard initialData={initialData} />
    </main>
  );
}
```

## Supabase in Admin Pages

Use `createSupabaseServerClient()` for all admin page data fetching.  
Use `createSupabaseAdminClient()` only in API routes for privileged writes.

**Column mapping for the `reports` table:**

- `description` — NOT `summary` (the wizard uses `summary` internally; map before writing to DB)
- `category` — array of strings, NOT `categories`
- `html_content` — NOT `content`
- `cover_image_path` — nullable string
