# Product Requirements Document (PRD): CoSET Intelligence Hub & Technical Implementation Guide

*(This document combines the original CoSET requirements with an exhaustive technical blueprint based on our successful execution of the YouPaD Intelligence Hub. It maps out dependencies, database architecture, the backend AI pipeline, and a specific breakdown of which `stitch` UI components to use.)*

## 1. Project Overview & Target Audience
**Client:** Coalition for Socio-Ecological Transformation (CoSET)  
**Product:** Intelligence Hub & Administrative Management Suite  
**Objective:** A premium, data-driven web platform to present reports, research, and insights on climate justice and socio-ecological transformation in Nigeria.

**Target Audience:**
- **General Users/Researchers:** Seeking high-quality, verified data and policy briefs.
- **Policy Makers:** Looking for actionable insights and regional impact analysis.
- **CoSET Administrators/Curators:** Staff responsible for uploading, tagging, and running AI extraction on the repository.

---

## 2. Comprehensive Tech Stack & Dependencies
This project will mirror the robust infrastructure to ensure high stability and seamless file processing.

**Framework & Core Dependencies:**
- **Next.js (App Router):** `14.x` (React 18)
- **Styling:** `tailwindcss` v3, `tailwind-merge`, `clsx`, `@tailwindcss/typography`
- **UI Components & Icons:** `framer-motion` (animations), `lucide-react` (icons)

**Backend & Data Services:**
- **Database & Auth:** `@supabase/supabase-js`, `@supabase/ssr` (Supabase Postgres)

**Intelligence Content Pipeline:**
- **Google AI:** `@google/generative-ai` (Gemini 2.5 Pro for content generation)
- **Document Processing:** `officeparser` (for `.pptx`, `.docx`, `.csv`), `pdf-parse` (for `.pdf`)
- **Sanitization:** `dompurify` (for cleaning AI-generated HTML before rendering)

**Crucial Configuration (`next.config.js`):**
Because we rely on local file parsers inside Server Actions/Route Handlers, you *must* explicitly opt them out of the edge runtime:
```js
experimental: { serverComponentsExternalPackages: ['officeparser', 'file-type'] }
```

---

## 3. Core Database Architecture (Supabase)
This schema provides extreme flexibility, supporting dynamic multi-select tags and rich AI-enhanced HTML content without breaking search capabilities.

**Table: `reports`**
- `id` (uuid, primary key)
- `title` (text)
- `slug` (text, unique) - *For clean frontend URLs.*
- `description` (text)
- `category` (text) - *Stored as a comma-separated string to support up to 3 categories natively without complex joins.*
- `tags` (text[]) - *PostgreSQL array for precise frontend checkbox filtering.*
- `html_content` (text) - *Stores the AI's generated rich HTML layout.*
- `cover_image_path` (text, nullable) - *Refers to the `report-images` storage bucket.*
- `source_url` (text, nullable)
- `source_type` (text: `'upload'` | `'link'`)
- `status` (text: `'draft'` | `'published'`)
- `views` / `downloads` (integer, default 0)
- `created_at` / `updated_at` (timestamptz)

---

## 4. Application Routing Architecture
```text
├── app/
│   ├── (public)/
│   │   ├── page.tsx                     # Landing Page
│   │   ├── reports/                     # Reports Directory 
│   │   ├── reports/[slug]/              # Individual Report View
│   ├── admin/
│   │   ├── layout.tsx                   # Admin Auth Guard & Sidebar Wrapper
│   │   ├── page.tsx                     # Admin Dashboard (KPIs)
│   │   ├── content/                     # Tabular Content Management
│   │   ├── upload/                      # AI Upload Wizard (Multi-step)
│   ├── api/
│       ├── extract-from-file/route.ts   # Edge route for intercepting PPT/CSV/PDF
```

---

## 5. Critical Analysis of "Stitch" UI Components
The `stitch` folder contains numerous raw, unstructured HTML/CSS layouts that serve as a rough mapping of user flows. They are currently basic and not aligned with professional standards.

**We will SELECT and USE the following core screens from `stitch`, and modify them as described to achieve an enterprise-grade interface:**

### A. Public Facing: The Hub
1. **Selected UI:** **`intelligence_hub_landing_page`** (or `coset_hub_landing_page_v1`)
   - **Current State:** Likely lacks proper typographic hierarchy and feels flat.
   - **Standardization Upgrade:** 
     - Swap generic hero blocks with immersive gradients (e.g., Deep Navy `#0B2F52` to Teal `#0E6B6B`).
     - Standardize typography to `Lexend`. 
     - Add `framer-motion` entrance animations to key elements (hero text, statistic counters).

2. **Selected UI:** **`reports_directory`** (or `coset_hub_report_listing_v1`)
   - **Current State:** A blocky grid with basic input fields for "Search".
   - **Standardization Upgrade:**
     - Port the robust filtering logic we built previously (sticky sidebar, dynamic Checkbox lists for Category/Tags).
     - Ensure the Report Cards have real depth: `bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all`.
     - Implement the view toggle (Grid vs Row layout).

3. **Selected UI:** **`individual_report_page`** (or `coset_hub_individual_report_v1`)
   - **Current State:** Barebones text page.
   - **Standardization Upgrade:**
     - Wrap the entire content area in Tailwind Typography (`prose prose-slate max-w-4xl`).
     - Remove explicit "AI" branding—it's a tool, not a novelty.
     - Add sticky quick-actions (Download PDF, Copy Link) on the right sidebar.

### B. Internal Facing: Admin Suite
4. **Selected UI:** **`admin_dashboard`**
   - **Current State:** Static, unstyled metric boxes.
   - **Standardization Upgrade:**
     - Replace raw numbers with dynamic KPI cards containing Lucide icons embedded in soft-color circular backgrounds (`bg-teal-50 text-teal-600 rounded-full`).

5. **Selected UI:** **`content_management`**
   - **Current State:** A clunky HTML table.
   - **Standardization Upgrade:**
     - Build a true data table with sticky headers, subtle row borders (`border-b border-slate-100`), and alternating row stripes (`even:bg-slate-50`).
     - Replace text statuses with semantic pill badges (e.g. Published = `bg-emerald-100 text-emerald-800 text-xs font-bold uppercase`).

6. **Selected UI:** **`create_new_report`** & **`upload_wizard_step_1`**
   - **Current State:** Stuttered HTML pages with terrible native input focus states.
   - **Standardization Upgrade:**
     - **Crucial:** Build this as a single-page React Flow (Step 1 -> Step 2 -> Step 3) using `AnimatePresence` to glide between states.
     - **Form Overhaul:** Discard standard text inputs for multi-value fields. Implement our robust `ChipInput` component allowing users to add up to 3 Categories by hitting **Enter**, featuring removable pill tags.
     - Apply active focus rings to all native borders: `focus-within:ring-2 focus-within:ring-[#F28C28]`.

---

## 6. The "Secret Sauce" AI Content Pipeline
To recreate the high-quality report generation from raw uploads without relying exclusively on AI-managed APIs:
1.  **Ingestion:** Send all `.csv`, `.docx`, `.pdf`, `.pptx` uploads through the backend route (`/api/extract-from-file`), using libraries like `officeparser` to securely extract purely textual representations in the server environment.
2.  **Transformation (`gemini.ts`):** Send the extracted text alongside a highly constrained prompt to `gemini-2.5-pro`.
3.  **Visual Prompt Engineering:** The prompt must implicitly direct the model to formulate data into structured HTML elements using strictly Tailwind classes (e.g., callout boxes, responsive grid tables).
4.  **Metadata Auto-fill:** Return the metadata (Title, Description, Category[]) as a separate JSON payload so the frontend `ChipInput` components automatically populate, minimizing manual curation work.

*This concludes the blueprint. Begin initialization by running `npx create-next-app@latest`, installing dependencies in Section 2, and setting up the Supabase infrastructure.*