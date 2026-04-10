# CoSET Intelligence Hub — Copilot Workspace Instructions

> **Every AI coding session must begin by reading this file.** These rules exist because previous sessions caused regressions by overwriting working code, importing deleted components, and running destructive git operations. Follow them strictly.

---

## 1. Non-Negotiable Safety Rules

These are the highest-priority rules. Violating them has caused file loss and regressions.

### NEVER perform destructive git operations

```
git stash        ← FORBIDDEN (causes VS Code to lose diff count)
git stash pop    ← FORBIDDEN
git reset        ← FORBIDDEN without explicit user instruction
git clean        ← FORBIDDEN
git checkout --  ← FORBIDDEN without explicit user instruction
git restore      ← FORBIDDEN without explicit user instruction
```

If you need to inspect a clean diff: use `git diff HEAD -- <file>` instead.

### ALWAYS read a file before editing it

- Before any `replace_string_in_file` or `multi_replace_string_in_file`, read the relevant section of the file.
- Build output / compiler errors are cached. Do not trust them alone — check the actual file.
- If a search pattern fails to match, re-read the file before retrying.

### NEVER downgrade a working implementation to a placeholder

- If a file has a real implementation, never replace it with a stub, placeholder, or simpler version.
- If you are asked to "fix" something, only modify what is broken — not surrounding code, not imports that still work, not other files.

### NEVER import or reference removed components

These components were deliberately removed. They do not exist:

- `@/components/admin-header` — DOES NOT EXIST. Use `SiteHeader` with `isAdmin` prop.
- `@/components/admin-sidebar` — WAS REMOVED. Never import. Never render it.

### NEVER create files that already exist or are in-progress stubs

These files exist but are empty stubs — do not overwrite them with a broken or wrong implementation:

- `app/api/reports/deploy/route.ts` — empty, stub
- `app/api/extract-from-url/route.ts` — empty, stub
- `app/admin/subscribers/page.tsx` — empty, stub

---

## 2. Project Identity

**Product**: CoSET Intelligence Hub — AI-powered research publishing platform for the Coalition for Socio-Ecological Transformation (CoSET) Nigeria.

**Audiences**:

1. Public (researchers, NGOs, policymakers) → browse reports, search, read, contact
2. CoSET Administrators → manage content, upload documents, track analytics

**Tech Stack**:

- Next.js 14 App Router (TypeScript)
- Tailwind CSS (custom design tokens — see §5)
- Supabase (PostgreSQL + pgvector + Auth + Storage)
- Google Gemini 1.5 Pro (AI extraction + embeddings)
- Framer Motion (animations)
- Lucide React (icons)

---

## 3. Architecture & Layout Rules

### Root Layout (`app/layout.tsx`)

- Wraps everything in `ThemeProvider`
- Applies fonts via CSS custom property `--font-coset-sans`
- Body classes: `bg-mist font-sans text-ink antialiased`

### Admin Layout (`app/admin/layout.tsx`)

```tsx
// CORRECT (current implementation):
import { SiteHeader } from "@/components/site-header";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-mist">
      <SiteHeader />
      {children}
    </div>
  );
}
```

- **NO sidebar**. Admin pages are full-width below a standard site header.
- `SiteHeader` conditionally renders admin nav links (`isAdmin` state comes from session/auth inside the header itself — do not pass it as a prop unless the component is verified to accept it).

### Admin Pages Layout Pattern

```tsx
// All admin page content sits in a max-width container:
<div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
  {/* page content */}
</div>
```

- No sidebar column. Pages are single-column content areas.
- The Upload wizard page (`admin/upload/page.tsx`) wraps `<UploadWizard initialData={...} />` inside a `<main>` — nothing else.

### Server vs Client Components

- All `app/admin/**/page.tsx` are **Server Components** (async, can call Supabase directly).
- Interactive UI (wizards, forms, search dropdowns) lives in `components/` as `'use client'` components.
- Pass data from server page → client component via props.

---

## 4. Supabase Integration

### Which client to use

| Context                       | Client                                                                            | Import                   |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| Server Component (page.tsx)   | `createSupabaseServerClient()`                                                    | `@/lib/supabase/clients` |
| API Route (route.ts)          | `createSupabaseServerClient()` + `createSupabaseAdminClient()` for privileged ops | `@/lib/supabase/clients` |
| Client Component (use client) | `createSupabasePublicClient()`                                                    | `@/lib/supabase/clients` |

### Database column names (use exactly these)

`reports` table:

```
id, slug, title, description (NOT summary), category (array, NOT categories),
tags (array), author, status, html_content, cover_image_path,
views, downloads, published_at, created_at, updated_at
```

`blog_posts` table:

```
id, slug, title, excerpt, category, author, status, featured,
html_content, image_path, created_at, updated_at
```

`profiles` table:

```
id, email, full_name, role (admin | editor | viewer)
```

**Critical note**: The wizard state uses `summary` internally but the DB column is `description`. In API routes, map `summary → description` before upserting.

### Content status enum

`'draft' | 'published' | 'scheduled' | 'archived'`

---

## 5. Design System

### Color tokens (CSS custom properties via Tailwind)

All colors are defined via CSS variables. Use Tailwind class names only — never hard-code hex values.

| Token                     | Usage                              |
| ------------------------- | ---------------------------------- |
| `text-ink`                | Primary text color                 |
| `text-navy`               | Brand headings and key UI elements |
| `text-teal` / `bg-teal`   | Accent (success, highlight)        |
| `text-ember` / `bg-ember` | Primary CTA, alerts, accents       |
| `text-muted`              | Secondary labels, captions         |
| `bg-mist`                 | Page background                    |
| `bg-panel`                | Card/panel backgrounds             |
| `bg-panel-alt`            | Alternate panel shade              |
| `bg-ink`                  | Dark sections (footer, dark cards) |
| `border-line`             | All standard borders               |

### Shadows

```
shadow-editorial   ← Deep card shadow
shadow-soft        ← Subtle card shadow
```

### Border radius conventions

```
rounded-xl          ← Buttons, small elements
rounded-2xl         ← Small cards
rounded-[2rem]      ← Standard panels/cards
rounded-[2.5rem]    ← Feature/hero cards
rounded-full        ← Pills, badges, avatar
```

### Typography

```
font-display        ← Headlines (font-weight: 700–900)
font-sans           ← Body text
tracking-[0.18em]   ← Uppercase labels (use with text-xs font-bold uppercase)
```

### Standard label pattern

```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
  Label
</p>
```

---

## 6. Component Contracts

### `<UploadWizard />`

**File**: `components/upload-wizard.tsx`  
**Type**: Client component (`'use client'`)

```tsx
type UploadWizardProps = {
  initialData?: {
    id: number;
    title: string;
    summary: string;
    categories: string[];
    tags: string[];
    coverImagePath: string | null;
  } | null;
};
```

**Behavior**:

- If `initialData` is `null`/`undefined`: starts at Step 0 (file upload)
- If `initialData` is provided: starts at Step 1 (metadata edit), skips file upload requirement

**Steps**: `['Upload File', 'Add Details', 'Review']`

### `<SiteHeader />`

**File**: `components/site-header.tsx`  
No `isAdmin` prop needed — the header reads the session internally.

### `<ThemeLogo />`

**File**: `components/theme-logo.tsx`  
No required props. Renders `/logo.png` (light) or `/logo-white.png` (dark) based on `useTheme()`.

### `<ChipInput />`

**File**: `components/chip-input.tsx`

```tsx
<ChipInput
  label="string"
  placeholder="string"
  value={string[]}
  onChange={(values: string[]) => void}
  limit={number?}
/>
```

### `<SectionReveal />`

**File**: `components/section-reveal.tsx`  
Wraps children with a Framer Motion scroll reveal animation.

---

## 7. API Route Contracts

### `POST /api/extract-from-file`

Accepts `FormData`:

```
file: File                  required
previewOnly: 'true'         optional — if set, returns AI draft without saving to DB
title: string               optional override
summary: string             optional override
categories: string[]        optional (append multiple values)
tags: string[]              optional (append multiple values)
id: string                  optional — if set, UPDATE existing report instead of INSERT
coverImagePath: string      optional — preserve existing cover image path on update
```

### `POST /api/reports/deploy` — STUB (not implemented)

### `POST /api/extract-from-url` — STUB (not implemented)

---

## 8. Content & Copy Tone

The UI should be **clear and accessible** to non-technical users. Avoid jargon.

### Forbidden terms (do not use in UI strings)

- "Intelligence Ingestion" → use "Upload File"
- "Deployment Protocol" → use "Publish Settings"
- "Full-Fidelity Preview" → use "Preview"
- "Automated timed release" → use "Schedule for later"
- "Metadata population" → use "Fill in details"
- "Extraction workflow" → use "processing"
- "Editorial metadata" → use "Report details"
- "AI" → avoid in user-facing copy; use "Intelligence" or "CoSET Intelligence" if needed
- "Content" → use "Report" or "Blog post" depending on context

### Allowed business terms

- "Intelligence brief" / "Intelligence report" — acceptable CoSET brand language
- "Draft" / "Published" / "Archived" — status labels, keep as-is
- "Planet Pulse" — brand name for the blog section, keep as-is
- "CoSET Intelligence" — acceptable way to refer to the AI system in user-facing copy
- "Upload File" — preferred term for the file upload step

---

## 9. Page Completion Status

Reference before building anything new — do not rebuild completed pages.

| Route                | Status       | Notes                                                                                                                          |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `/`                  | ✅ Complete  | Homepage, hero, sections                                                                                                       |
| `/reports`           | ✅ Complete  | Reports explorer with filters                                                                                                  |
| `/reports/[slug]`    | ✅ Complete  | Detail page with floating chat                                                                                                 |
| `/blog`              | ✅ Complete  | Blog listing                                                                                                                   |
| `/blog/[slug]`       | ✅ Complete  | Blog post detail                                                                                                               |
| `/login`             | ✅ Complete  | Auth form + server actions                                                                                                     |
| `/contact`           | ✅ Complete  | Contact form                                                                                                                   |
| `/admin`             | ✅ Complete  | Dashboard with KPI stats                                                                                                       |
| `/admin/content`     | ✅ Complete  | Content management table                                                                                                       |
| `/admin/upload`      | ✅ Complete  | 3-step upload/edit wizard                                                                                                      |
| `/admin/analytics`   | ⚠️ Partial   | UI done; no real data backend - !!!!! This is dummy data, not within the scope of the current project. Do not create the page! |
| `/admin/subscribers` | ❌ Not built | Empty stub                                                                                                                     |

---

## 10. Common Mistakes to Avoid

1. **Importing `AdminSidebar`** — file does not exist. Reference `SiteHeader` instead.
2. **Using `AdminHeader`** — does not exist. The site uses `SiteHeader`.
3. **Using `description` where DB column is `description`** — the wizard internally calls it `summary`; map it before DB writes.
4. **Using `category` (singular string)** — DB column `category` is an array `text[]`. Use arrays.
5. **Using `categories` in a DB query** — DB column is `category`, not `categories`.
6. **Calling `git stash`** — forbidden. Use `git diff HEAD -- <file>` to inspect.
7. **Replacing a full page's content without reading it first** — always read before editing.
8. **Adding sidebar to admin upload page** — `/admin/upload` should be full-width with NO sidebar.
9. **Creating empty route files** — if a stub exists (deploy, extract-from-url), do not re-create it.
10. **Hardcoding colors** — always use the design token class names (e.g., `text-ember`, not `text-[#E54B22]`).
