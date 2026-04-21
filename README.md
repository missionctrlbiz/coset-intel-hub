# CoSET Intelligence Hub

Premium intelligence hub and administrative suite for the Coalition for Socio-Ecological Transformation (CoSET) Nigeria.

A Next.js App Router application for publishing climate justice research, policy briefs, and editorial content, with an AI-powered admin workflow for intelligent content ingestion, semantic search, and audience management.

See [HANDOVER_REVIEW.md](HANDOVER_REVIEW.md) for the current implementation status, remaining work, and handover recommendations.

## Overview

The hub serves three primary audiences:

- **Researchers & General Public** – Access to intelligence reports, policy analysis, and climate justice insights
- **Policy Makers & Institutional Partners** – Actionable socio-ecological transformation research
- **CoSET Administrators** – Full content lifecycle management with AI-assisted ingestion and publishing

## Key Features

### Public Experience

- 🏠 **Landing Page** – Mission statement, featured reports, real-time stats (16,000+ gas flaring sites mapped)
- 📊 **Reports Directory** – Filterable intelligence library with grid/list views, category/tag filtering
- 📄 **Report Detail Pages** – Full-text report viewer with executive findings, highlights, and related content
- 📝 **Blog & Editorial Desk** – "Planet Pulse" updates on climate justice and policy developments
- 💬 **Contact Page** – Direct engagement channel
- 📬 **Subscriber Capture Modal** – Public subscribe CTA with email capture, welcome email, and success confirmation
- 🎨 **Light/Dark Theme** – System-aware theme toggle with localStorage persistence
- 🔍 **Semantic Search** – Hybrid vector + full-text search powered by Gemini embeddings

### Admin Portal

- 🎛️ **Dashboard** – KPI overview, recent activity timeline, operational metrics
- 📤 **Intelligent Upload Wizard** – Multi-source ingestion (file upload, URL scraping, HTML paste, clipboard capture)
- 🤖 **AI-Powered Processing** – Auto-extraction via Google Gemini (title, summary, categories, tags, semantic HTML formatting)
- 📋 **Content Management** – Paginated report table with status/category filtering, inline edit/delete controls
- 👥 **Platform Users View** – Current `/admin/subscribers` page lists authenticated platform users and roles
- 📈 **Analytics Dashboard** – Performance metrics and engagement tracking
- 🔐 **Role-Based Access** – Admin, Editor, Viewer roles with granular permissions

## Tech Stack

### Frontend

- **Next.js 14** – App Router with server/client components
- **React 18** – Server components, streaming, and concurrent features
- **TypeScript** – Type-safe development
- **Tailwind CSS** – Utility-first styling with custom design tokens
- **Framer Motion** – Smooth animations and transitions
- **Lucide React** – Icon system

### Backend & Services

- **Supabase PostgreSQL** – Primary database with Row Level Security (RLS)
- **Supabase Auth** – Email/password authentication with role-based access
- **Supabase Storage** – File storage for report images and uploads
- **pgvector Extension** – Vector embeddings for semantic search
- **Google Gemini 1.5 Pro / 1.5 Flash** – AI-powered metadata extraction, analysis, and content formatting
- **Resend** – Subscriber audience capture and welcome emails
- **text-embedding-004** – Vector embeddings for semantic similarity

### Document Processing

- **officeparser** – PDF, PPTX, DOCX extraction
- **pdf-parse** – PDF text extraction
- **isomorphic-dompurify** – HTML sanitization

## Project Structure

```text
app/
  ├── admin/                      # Admin portal
  │   ├── analytics/             # Performance metrics
  │   ├── content/               # Content management
  │   ├── subscribers/           # Platform users and roles
  │   └── upload/                # Upload wizard
  ├── api/                       # API routes
  │   ├── analyze-content/       # Metadata analysis from extracted content
  │   ├── beautify-content/      # AI formatting for preview/report HTML
  │   ├── chat/                  # Report Q&A endpoint
  │   ├── extract-from-file/     # File upload processing
  │   ├── extract-from-url/      # URL scraping
  │   ├── subscribe/             # Public subscriber capture via Resend
  │   ├── reports/deploy/        # Report publishing
  │   ├── search/                # Hybrid search
  │   └── feedback/              # Public feedback/contact handling
  ├── blog/                      # Editorial content
  │   └── [slug]/               # Individual blog post
  ├── contact/                   # Contact form
  ├── login/                     # Authentication
  └── reports/                   # Intelligence reports
      └── [slug]/               # Individual report detail
components/
  ├── chip-input.tsx             # Multi-tag input
  ├── floating-chat.tsx          # Report Q&A widget (disabled)
  ├── search-form.tsx            # Global search
  ├── site-footer.tsx            # Public footer
  ├── site-header.tsx            # Public header with auth
  ├── subscribe-modal-trigger.tsx# Public subscribe modal CTA
  ├── theme-toggle.tsx           # Light/dark mode switch
  └── upload-wizard.tsx          # Multi-phase ingestion
lib/
  ├── content.ts                 # Content fetching utilities
  ├── database.types.ts          # Supabase generated types
  ├── genai.ts                   # Gemini API helpers
  ├── site-data.ts               # Static content & config
  └── supabase/
      └── clients.ts             # Supabase client factories
supabase/
  ├── config.toml                # Local Supabase config
  ├── migrations/                # Database schema migrations
  └── seed.sql                   # Development seed data
public/
  ├── fonts/                     # CoSET brand fonts
  └── stitch/                    # Design reference files
```

## Available Routes

### Public Routes

- `/` – Landing page with mission, featured reports, and stats
- `/reports` – Filterable reports directory
- `/reports/[slug]` – Individual report detail page
- `/blog` – Editorial content listing
- `/blog/[slug]` – Individual blog post page
- `/contact` – Contact form
- `/login` – Authentication portal

### Admin Routes (Protected)

- `/admin` – Dashboard with KPIs and activity timeline
- `/admin/analytics` – Performance metrics
- `/admin/content` – Content management table
- `/admin/subscribers` – Platform users and roles
- `/admin/upload` – Intelligent upload wizard

### API Routes

- `POST /api/extract-from-file` – Process uploaded files with AI metadata extraction
- `POST /api/extract-from-url` – Scrape and analyze URLs
- `POST /api/analyze-content` – Analyze extracted text or pasted content for metadata
- `POST /api/beautify-content` – Format content into semantic HTML
- `POST /api/reports/deploy` – Publish report and generate embeddings
- `POST /api/subscribe` – Save a public subscriber email and send a welcome email via Resend
- `GET /api/search` – Hybrid semantic + full-text search
- `POST /api/chat` – Report-specific Q&A using vector retrieval

## Database Schema

The application uses Supabase PostgreSQL with the following tables:

### Core Tables

- **`profiles`** – User accounts (email, full_name, role, timestamps)
  - Roles: `viewer`, `editor`, `admin`
  - Auto-created via auth trigger on signup

- **`reports`** – Intelligence assets
  - Fields: title, description, html_content, category[], tags[], status, slug, image_url
  - Status: `draft`, `scheduled`, `published`, `archived`
  - Full-text search via `search_vector` with GIN index
  - Published reports are publicly readable via RLS

- **`blog_posts`** – Editorial content
  - Similar structure to reports
  - Category, author, excerpt, featured flag

- **`report_ingestions`** – Upload pipeline tracking
  - Tracks file_name, extracted_text, ai_draft JSON, status, error_message
  - Status: `uploaded`, `extracting`, `drafted`, `failed`, `completed`

- **`report_embeddings`** – Vector embeddings for semantic search
  - Chunked content with vector(768) embeddings from Gemini
  - Cosine similarity search via pgvector

### Storage Buckets

- **`report-images`** – Cover images and screenshots
- **`report-uploads`** – Source files (PDFs, Office docs)

### RLS Policies

- Public read access to published content
- Editor/Admin roles can manage all content
- Service-role bypasses all policies

### Functions & Triggers

- `handle_new_user()` – Creates profile on auth signup
- `update_search_vector()` – Updates full-text search on content changes
- `match_report_embeddings(query_embedding, match_threshold, match_count)` – Vector similarity search
- `current_app_role()` – Returns current user's app role

## Authentication & Authorization

### User Roles

The application implements three role levels:

- **Viewer** – Can browse published content, no admin access
- **Editor** – Can create, edit, and publish reports and blog posts
- **Admin** – Full system access including user management

### Authentication Flow

1. Users sign up/sign in via `/login` using Supabase Auth (email/password)
2. On first signup, a trigger automatically creates a `profiles` record with `viewer` role
3. Admins can promote users by updating the role in the `profiles` table
4. Admin pages check authentication server-side via `createSupabaseServerClient()`
5. Protected routes redirect unauthenticated users to `/login`

### Role Promotion

After a user signs up, promote them via SQL:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### Admin UI Features

- **Avatar Dropdown** – User email display with logout in header (favicon icon)
- **Protected Routes** – All `/admin/*` routes require authentication
- **Role Indicators** – Content management shows user capabilities based on role
- **Graceful Fallback** – Unauthenticated users see fallback content with sign-in prompts

## Subscriber Capture

- Public subscribe CTAs open a modal-based email capture flow instead of linking to an on-page anchor.
- `POST /api/subscribe` stores contacts in a Resend audience when configured and sends a welcome email.
- Required environment variables for production:

```bash
RESEND_API_KEY="your-resend-key"
RESEND_FROM_EMAIL="updates@your-domain.com"
RESEND_AUDIENCE_ID="your-resend-audience-id"
```

## Supabase Setup

### Local Development

If Docker is installed, start the local Supabase stack:

```bash
supabase start
supabase db reset
```

This applies migrations and loads `supabase/seed.sql`.

### Linking A Remote Project

To link the repo to the correct hosted Supabase project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

If you want generated database types after linking:

```bash
supabase gen types typescript --linked > lib/database.types.ts
```

### Linking A Remote Project

To link the repo to your hosted Supabase project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Generate TypeScript types after linking:

```bash
supabase gen types typescript --linked > lib/database.types.ts
```

## Intelligent Content Ingestion Pipeline

The upload wizard supports multiple ingestion methods with AI-powered processing:

### Phase 1: Source Selection

Four ingestion methods available:

1. **📎 File Upload** – PDF, PPTX, DOCX, CSV, TXT, HTML, images (max 50MB)
   - Server-side extraction via `officeparser` and `pdf-parse`
   - Text content sent to Gemini for analysis

2. **🔗 URL Scraping** – Automated HTML fetching
   - Cleans boilerplate and extracts main content
   - Warns about SPA/JavaScript-heavy sites
   - Preserves semantic structure

3. **📋 Clipboard Capture** – Rich HTML paste
   - Supports content from browsers, Gemini, Slack, Notion
   - Auto-formats double-newlines to paragraphs
   - Preserves links and basic formatting

4. **💻 Raw HTML** – Direct markup injection
   - For technical content with specific formatting
   - Bypasses auto-formatting

### Phase 2: Editorial Control

- **Smart Formatting** – AI converts messy content into semantic HTML (`<h2-3>`, `<p>`, `<ul>`, `<table>`)
- **Auto-Fill Metadata** – Gemini analyzes content and suggests:
  - Title and summary
  - Categories (multi-select from preset taxonomy)
  - Tags and keywords
  - Executive findings and highlights
- **Manual Override** – All AI suggestions are editable
- **Preview** – Real-time content preview with applied formatting

### Phase 3: Review & Deploy

- **Metadata Review** – Confirm title, description, category, tags
- **Cover Image** – Upload or select from existing images
- **Status Selection**:
  - **Draft** – Save for later editing
  - **Scheduled** – Set publication timestamp
  - **Published** – Immediately live
- **Vector Embedding** – On publish, content is chunked and embedded for semantic search
- **Full-Text Index** – Automatic search_vector update via database trigger

### API Endpoints

- `POST /api/extract-from-file` – Process uploads, extract text, generate AI draft
- `POST /api/extract-from-url` – Scrape URL, clean HTML, analyze content
- `POST /api/smart-format` – Format raw content into semantic HTML
- `POST /api/reports/deploy` – Finalize and publish with embeddings

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
GOOGLE_GENERATIVE_AI_MODEL=gemini-1.5-pro

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variable Details

- **`NEXT_PUBLIC_SUPABASE_URL`** – Your Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** – Supabase anonymous/public key (client-side safe)
- **`SUPABASE_SERVICE_ROLE_KEY`** – Service role key for server-side operations (keep secret!)
- **`GOOGLE_GENERATIVE_AI_API_KEY`** – Gemini API key for AI-powered extraction
- **`GOOGLE_GENERATIVE_AI_MODEL`** – Gemini model version (recommended: `gemini-1.5-pro`)
- **`NEXT_PUBLIC_SITE_URL`** – Base URL for the application (update for production deployment)

### Getting API Keys

- **Supabase**: Create a project at [supabase.com](https://supabase.com), find keys in Project Settings → API
- **Google Gemini**: Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for local Supabase)
- Supabase project (or local instance)
- Google Gemini API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/missionctrlbiz/coset-intel-hub.git
cd coset-intel-hub
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Gemini credentials
```

4. **Set up database** (choose one)

**Option A: Use existing Supabase project**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B: Start local Supabase (requires Docker)**

```bash
supabase start
supabase db reset
```

5. **Start development server**

```bash
npm run dev
```

6. **Open application**
   Navigate to `http://localhost:3000`

### First-Time Setup

1. Visit `/login` and create an account
2. Promote your account to admin via SQL:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

3. Access admin portal at `/admin`!

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Components

| Component              | Purpose                                              | Location                                |
| ---------------------- | ---------------------------------------------------- | --------------------------------------- |
| `UploadWizard`         | Three-phase intelligent content ingestion            | `components/upload-wizard.tsx`          |
| `AdminContentControls` | Paginated report management table                    | `components/admin-content-controls.tsx` |
| `SiteHeader`           | Public navigation with auth status & avatar dropdown | `components/site-header.tsx`            |
| `AdminHeader`          | Admin portal navigation                              | `components/admin-header.tsx`           |
| `AdminSidebar`         | Admin sidebar navigation                             | `components/admin-sidebar.tsx`          |
| `ChipInput`            | Multi-tag input for categories/tags                  | `components/chip-input.tsx`             |
| `SearchForm`           | Real-time hybrid search with dropdown                | `components/search-form.tsx`            |
| `SectionReveal`        | Animation wrapper for lazy-load effects              | `components/section-reveal.tsx`         |
| `ThemeProvider`        | Global light/dark mode state                         | `components/theme-provider.tsx`         |

## UI/UX Features

### Design System

- **Color Palette**: Navy (primary), Ember (accent), Teal (secondary), Mist (backgrounds)
- **Typography**: Custom CoSET display font + system font stack
- **Responsive**: Mobile-first with breakpoints at md (768px), lg (1024px), xl (1280px)

### Animations

- **Framer Motion**: Smooth phase transitions in upload wizard
- **Section Reveals**: Staggered entrance animations on scroll
- **Menu Animations**: Dropdown transitions for search and user menus

### Theme System

- **Auto-Detection**: Respects system theme preference
- **Manual Toggle**: Theme switcher in header
- **Persistence**: localStorage saves user preference
- **Favicon**: Context-aware favicon (standard/white variants)

### Public Pages

- **Footer**: Only shown on public pages (home, reports, blog)
- **Header**: Authenticated users see avatar dropdown with logout
- **Responsive Navigation**: Mobile-friendly menu with hamburger

### Admin Pages

- **No Footer**: Admin pages exclude public footer for cleaner workspace
- **Protected Routes**: Redirect to `/login` if unauthenticated
- **Role Indicators**: UI adapts based on user role (viewer/editor/admin)

## Build Notes

- **App Router**: Uses Next.js 14 App Router with server/client component split
- **Error Boundaries**: Implemented via `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`
- **Server Components**: Default for all pages; client components marked with `'use client'`
- **External Packages**: `officeparser` and `pdf-parse` configured in `next.config.js` under `serverComponentsExternalPackages`
- **Clear Cache**: If builds behave inconsistently after route changes, delete `.next/` folder and rebuild

## Content Model

### Reports

- **Title, Description** – Core metadata
- **HTML Content** – Rich text body with semantic HTML
- **Categories** – Multi-select from preset taxonomy (Climate Justice, Policy Analysis, etc.)
- **Tags** – Freeform keywords
- **Status** – Draft, Scheduled, Published, Archived
- **Cover Image** – Hero image for cards and detail pages
- **Source URL** – Original source reference (optional)
- **Slug** – URL-friendly identifier
- **Search Vector** – Full-text search tsvector (auto-updated)
- **Embeddings** – Vector chunks for semantic search

### Blog Posts

- Similar structure to reports
- Additional fields: author, excerpt, featured flag
- Category is single-select instead of array

## Semantic Search

The application implements hybrid search combining:

1. **Vector Search** – Gemini text embeddings with cosine similarity
   - Content chunked into ~500-word segments
   - Embedded using `text-embedding-004` model
   - Stored in `report_embeddings` table with pgvector

2. **Full-Text Search** – PostgreSQL tsvector with GIN index
   - Searches title, description, and content
   - Auto-updated via database trigger
   - Supports multi-word queries and ranking

3. **Hybrid Ranking** – Results combined and sorted by relevance score

## Design Assets

The `public/stitch/` directory contains reference design files exported from Figma/Stitch. These are static HTML mockups for layout reference, not production components.

## Product Context

This implementation is based on requirements outlined in `CoSET_PRD.md`:

- Product goals and audience
- Content model and taxonomy
- Routing architecture
- Admin workflow specifications
- AI-assisted ingestion pipeline
- Design system and brand guidelines

## Current Implementation Status

### ✅ Production-Ready Features

- Public website (landing, reports, blog, contact)
- Authentication system with role-based access
- Multi-source content ingestion (file, URL, clipboard, HTML)
- AI-powered metadata extraction and formatting
- Semantic + full-text hybrid search
- Content management with pagination and filtering
- Subscriber management interface
- Light/dark theme system
- Responsive design across all breakpoints

### 🚧 In Progress

- Vector embedding generation on report publish (API route ready, needs cron trigger)
- Scheduled publication automation (requires cron job)
- Advanced analytics dashboards (structure in place)
- Email notifications for subscribers (UI ready, email integration pending)

### 📋 Planned Enhancements

- Multi-language support
- Advanced filtering and faceted search
- Bulk content operations
- Report versioning and change tracking
- Collaborative editing features
- Public API for external integrations

## Deployment

This application is optimized for deployment on Vercel:

1. **Environment Variables**: Set all required env vars in Vercel dashboard
2. **Database**: Ensure Supabase project is linked and migrations are applied
3. **Build Command**: `npm run build` (default)
4. **Output**: `.next` directory (framework preset handles this)
5. **Domain**: Update `NEXT_PUBLIC_SITE_URL` to production domain

### Post-Deployment Checklist

- [ ] Verify Supabase connection with correct URL and keys
- [ ] Test authentication flow and role assignment
- [ ] Confirm AI extraction works with Gemini API
- [ ] Check semantic search returns results
- [ ] Verify image uploads to Supabase Storage
- [ ] Test report publishing workflow end-to-end

## Contributing

This is a private repository for CoSET Nigeria. For questions or issues:

- Email: info@cosetonline.org
- Location: Marrakesh Street, Wuse 2, Abuja

## Repository

- GitHub: `https://github.com/missionctrlbiz/coset-intel-hub.git`
- Organization: Coalition for Socio-Ecological Transformation (CoSET) Nigeria

## License

Proprietary – All rights reserved by CoSET Nigeria.
