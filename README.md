# CoSET Intelligence Hub

Premium intelligence hub and administrative suite for the Coalition for Socio-Ecological Transformation (CoSET).

This project is a Next.js App Router application for publishing climate justice research, policy briefs, reports, and editorial content, with an admin-facing workflow for content curation and AI-assisted extraction.

## Overview

The hub is designed for three main groups:

- Researchers and general users who need access to reports and analysis
- Policy makers looking for actionable socio-ecological insights
- CoSET administrators managing uploads, metadata, and publication workflows

The current implementation includes:

- A public landing page for the intelligence hub
- A reports directory with seeded data and detail pages
- A blog page
- An admin dashboard, content view, analytics view, and upload flow
- A light and dark theme system
- An extraction API route prepared for document-to-text and AI-assisted metadata drafting

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Supabase client libraries
- Google GenAI SDK via `@google/genai`
- `officeparser` and `pdf-parse` for document extraction

## Project Structure

```text
app/
	admin/
	api/
		extract-from-file/
	blog/
	reports/
components/
lib/
public/
	fonts/
	stitch/
CoSET_PRD.md
```

Key areas:

- `app/page.tsx`: public landing page
- `app/reports/page.tsx`: reports listing
- `app/reports/[slug]/page.tsx`: individual report page
- `app/blog/page.tsx`: editorial and article listing
- `app/admin/*`: admin views
- `app/api/extract-from-file/route.ts`: server-side file extraction endpoint
- `components/upload-wizard.tsx`: multi-step upload UI
- `lib/genai.ts`: GenAI integration helpers
- `lib/site-data.ts`: seeded content and link data

## Available Routes

- `/`
- `/reports`
- `/reports/[slug]`
- `/blog`
- `/admin`
- `/admin/analytics`
- `/admin/content`
- `/admin/upload`
- `/api/extract-from-file`

## Design Assets

The repository includes local CoSET brand assets and stitched reference screens under `public/stitch/`. Those stitched HTML files are reference material for layout and flow, not production UI.

## Environment Variables

Create a local `.env` file based on `.env.example`.

Required values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_GENERATIVE_AI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` should be a full HTTPS URL
- `GOOGLE_GENERATIVE_AI_API_KEY` is used by the extraction flow
- `NEXT_PUBLIC_SITE_URL` should be updated for deployed environments

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Upload And Extraction Pipeline

The upload flow is structured around a server-side extraction step:

1. A file is submitted through the admin upload flow
2. The extraction route reads text content where supported
3. The GenAI helper can draft structured metadata and content output
4. The frontend can use that output to prefill report fields for review

At the moment, the route is set up for safe text-preview extraction and graceful fallback behavior. It is prepared for broader document parsing using `officeparser` and `pdf-parse` where applicable.

## Build Notes

- The app uses App Router error boundaries via `app/error.tsx`, `app/global-error.tsx`, and `app/not-found.tsx`
- Local parser dependencies are configured in `next.config.js` under `serverComponentsExternalPackages`
- If a Next.js build behaves inconsistently after route-level changes, clear `.next` and rebuild

## Product Context

The implementation is based on the requirements in `CoSET_PRD.md`, which outlines:

- product goals
- audience
- content model
- routing architecture
- stitch screen mapping
- AI-assisted ingestion workflow

## Current Status

Implemented:

- public-facing landing, reports, report detail, and blog pages
- admin dashboard, analytics, content, and upload screens
- seeded content for preview and layout validation
- local fonts and brand assets
- light/dark theme support
- GenAI helper migration to `@google/genai`

Planned or integration-dependent:

- live Supabase persistence
- full production content ingestion workflow
- authenticated admin access controls
- richer binary document extraction and persistence

## Repository

GitHub remote:

- `https://github.com/missionctrlbiz/coset-intel-hub.git`
