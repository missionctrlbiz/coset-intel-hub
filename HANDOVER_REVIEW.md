# CoSET Intelligence Hub — Handover Review

Last updated: April 21, 2026

This review captures the remaining work, enhancements, operational gaps, and code quality notes needed before the project is considered fully ready for handover.

## Current State

The application is already strong in these areas:

- Public homepage, reports listing, report detail, contact, login, and blog listing are implemented.
- Admin dashboard, content management, analytics, upload workflow, and platform users page are implemented.
- File extraction, metadata drafting, preview generation, sanitization, and report publishing status updates are implemented.
- Search endpoint and search UI wiring are implemented.
- Public subscribe capture now uses a modal flow backed by `POST /api/subscribe` with Resend.

## Remaining Features Before Handover

### Public Experience

- Implement the real blog detail experience in [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx).
  - It currently redirects to `/reports`.
- Replace the footer `Legal` placeholder link in [components/site-footer.tsx](components/site-footer.tsx).
  - It currently points to `#` and should link to real legal pages or be removed.
- Decide whether the homepage newsletter section should remain as a CTA-only block or also expose inline subscriber metrics / trust copy.
- Review report detail related-navigation depth.
  - The page works well, but can be improved with related reports, previous/next report navigation, or citation export.

### Subscriber / Notification Workflow

- Complete end-to-end subscriber management for admins.
  - The current `/admin/subscribers` page shows platform users, not newsletter subscribers.
- Add newsletter subscriber visibility in admin.
  - Options:
    - pull from Resend audience via API
    - or persist subscribers in Supabase as a local mirror
- Trigger subscriber notifications when a report is published.
  - [app/api/reports/deploy/route.ts](app/api/reports/deploy/route.ts) updates report status, but does not notify subscribers yet.
- Add unsubscribe / preference management.
  - Current public flow saves the email and sends a welcome email, but no unsubscribe surface exists in this repo.

### Upload / Editorial Workflow

- Verify cover image workflow end to end in edit and publish scenarios.
  - The UI supports it, but this path should be regression-tested carefully.
- Add explicit retry / recovery states for failed preview enhancement.
  - The flow now works, but failure messaging can still be more editorially clear.
- Add audit notes or change history for report edits if editorial traceability matters for handover.

### Admin Experience

- Decide whether `/admin/subscribers` should be renamed to `Platform Users` in navigation.
  - The page content already represents platform users rather than newsletter subscribers.
- Add admin mobile-nav polish and session/account actions if required.
- Review whether analytics should remain lightweight or expand into time-based reporting.

## Operational / Platform Readiness

### Must-Have

- Add a test suite.
  - There are no automated tests covering routes, sanitization, or the upload workflow.
- Add CI checks.
  - Build verification is being done manually; add GitHub Actions for `npm ci`, lint/build, and future tests.
- Document required email environment variables for production:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `RESEND_AUDIENCE_ID`
- Confirm Vercel production environment parity for:
  - Supabase vars
  - Gemini vars
  - Resend vars

### Recommended

- Add structured runtime logging around publish + subscribe flows.
- Add rate limiting or abuse protection for `POST /api/subscribe` and contact/feedback endpoints.
- Add monitoring for failed extraction, failed publish, and failed email events.

## Code Review Notes

### High Value Improvements

- Break down [components/upload-wizard.tsx](components/upload-wizard.tsx) into smaller client modules.
  - It now carries extraction, modal, preview, publish, and success-state logic in one file.
- Reduce repeated modal logic patterns.
  - The publish success modal and subscribe modal now share similar interaction patterns and could eventually use a shared dialog primitive.
- Normalize documentation.
  - Several docs had drifted away from the live codebase and should be kept current going forward.

### Medium Value Improvements

- Centralize user-facing success/error copy for critical flows.
- Add stronger domain types for report-preview state and subscriber-flow state.
- Add integration tests for TOC generation and anchor repair in [lib/sanitize.ts](lib/sanitize.ts).

## Recommended Handover Checklist

- [ ] Blog detail page implemented
- [ ] Admin subscriber management clarified and completed
- [ ] Publish-triggered subscriber notifications implemented
- [ ] Unsubscribe or audience preference flow defined
- [ ] Tests added for upload, publish, sanitize, subscribe
- [ ] CI pipeline added
- [ ] Production env vars documented and verified
- [ ] Placeholder legal/footer links resolved
- [ ] Final README reviewed against live app behavior

## Suggested Delivery Position

If handover must happen before all items above are complete, the product can still be handed over as:

- a near-production editorial publishing platform
- with strong upload/report capabilities
- but with subscriber operations, test automation, and a few content/polish areas still pending
