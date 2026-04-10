# CoSET Intelligence Hub — Task Tracker

> Last updated: current session
> Use this file to track sprint tasks across all admin and platform features.

---

## Admin Header

- [x] Add **Dashboard** link to admin nav (`/admin`)
- [x] Add **Subscribers** link to admin nav (`/admin/subscribers`)
- [ ] Add responsive hamburger menu (mobile)
- [ ] Add avatar dropdown with logout action
- [x] Remove "Subscribe Now" button from admin header view
- [ ] Separate admin nav completely from public nav (different link sets)

---

## Admin Dashboard (`/admin`)

- [x] KPI cards: Total Reports | Published | Drafts
- [ ] Remove "Configure View" / "last 30 days" button
- [x] Show 5 most recent reports in activity table (full-width row)
- [ ] Remove "Infrastructure Health & Creators notes" if present
- [x] "Create New Report" CTA button present

---

## Manage Reports (`/admin/content`)

- [x] Status filter wired (uses URL search params)
- [x] Category filter wired (uses URL search params)
- [ ] Pagination — show 10 reports per page, with prev/next controls
- [ ] Action icons: **Edit** (pencil), **Preview** (eye), **Delete** (trash — greyed/disabled)
- [ ] Fix filter reset clearing page param

---

## Upload Wizard (`/admin/upload`)

- [x] Step 1: File upload with drag-and-drop (PDF, DOCX, PPT, CSV)
- [x] Step 2: AI-prefilled metadata (title, summary, categories, tags)
- [x] Chip input for **categories** (multi-select)
- [x] Chip input for **tags** (multi-select, limit 5)
- [x] Cover image picker (optional, shown in sidebar)
- [ ] Improve cover image section label (rename "Featured Image" → "Cover Image")
- [ ] Step 3 Review: show cover image thumbnail if selected
- [ ] Final step publish flow — 3 actions:
  - [ ] **Save as Draft** — saves with `status: 'draft'`
  - [ ] **Schedule** — shows datetime picker, saves with `status: 'scheduled'`
  - [ ] **Publish Now** — calls `/api/reports/deploy`, sets `status: 'published'`
- [x] If `?edit=slug` — opens wizard in edit mode at Step 2

---

## Subscribers / Platform Users (`/admin/subscribers`)

- [x] Platform users table (email, role, joined date)
- [x] Admin-only access guard
- [ ] **Resend integration** — send email to all profiles when a report is published
  - [ ] Install `resend` npm package
  - [ ] Create `/api/subscriptions/notify` route
  - [ ] Trigger from `/api/reports/deploy` when status = `published`
  - [ ] Email template: report title + link + CoSET branding

---

## TypeScript / Build Health

- [ ] Fix `never` type errors in `analytics/page.tsx`
- [ ] Fix `never` type errors in `content/page.tsx`
- [ ] Fix `never` type errors in `subscribers/page.tsx`
- [ ] Fix `never` type errors in `api/extract-from-url/route.ts`
- [ ] Fix `never` type errors in `api/reports/deploy/route.ts`
- [ ] Verify `npx tsc --noEmit` runs clean

---

## API Routes

- [x] `POST /api/extract-from-file` — AI extraction + DB upsert
- [x] `PATCH /api/reports/deploy` — publish / schedule / archive status change
- [x] `POST /api/extract-from-url` — URL scrape + AI extraction (SSRF-safe)
- [ ] `POST /api/subscriptions/notify` — Resend email blast on publish

---

## General / Quality

- [ ] No hardcoded hex colors anywhere (use design token classes)
- [ ] All admin pages pass `isAdmin` to `SiteHeader` (already done via layout)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `next build` completes without errors
