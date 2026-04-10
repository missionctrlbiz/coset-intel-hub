---
applyTo: components/**
---

# Components — Copilot Instructions

## Do NOT import or reference these (they do not exist)

```ts
import { AdminSidebar } from "@/components/admin-sidebar"; // ❌ FILE DOES NOT EXIST
import { AdminHeader } from "@/components/admin-header"; // ❌ FILE DOES NOT EXIST
```

## Component Registry — Current Real Components

| Component           | File                 | Client? | Key Props                                     |
| ------------------- | -------------------- | ------- | --------------------------------------------- |
| `<SiteHeader />`    | `site-header.tsx`    | ✅      | none (reads session internally)               |
| `<SiteFooter />`    | `site-footer.tsx`    | no      | none                                          |
| `<ThemeLogo />`     | `theme-logo.tsx`     | ✅      | `width?`, `height?`, `className?`             |
| `<ThemeToggle />`   | `theme-toggle.tsx`   | ✅      | none                                          |
| `<ThemeProvider />` | `theme-provider.tsx` | ✅      | `children`                                    |
| `<ChipInput />`     | `chip-input.tsx`     | ✅      | `label, placeholder, value, onChange, limit?` |
| `<SectionReveal />` | `section-reveal.tsx` | ✅      | `children`                                    |
| `<SearchForm />`    | `search-form.tsx`    | ✅      | varies                                        |
| `<UploadWizard />`  | `upload-wizard.tsx`  | ✅      | `initialData?`                                |
| `<FloatingChat />`  | `floating-chat.tsx`  | ✅      | report context                                |
| `<HomeSections />`  | `home-sections.tsx`  | ✅      | varies                                        |
| `<LoadingStates />` | `loading-states.tsx` | no      | specific variant exports                      |

## UploadWizard Props (exact contract)

```tsx
type UploadWizardProps = {
  initialData?: {
    id: number;
    title: string;
    summary: string; // maps to DB column `description`
    categories: string[]; // maps to DB column `category`
    tags: string[];
    coverImagePath: string | null;
  } | null;
};
```

- `initialData = null | undefined` → starts at **Step 0** (file upload)
- `initialData = { ... }` → starts at **Step 1** (metadata edit, no file required)
- Steps: `['Upload File', 'Add Details', 'Review']`

## ThemeLogo Usage

```tsx
import { ThemeLogo } from '@/components/theme-logo';
<ThemeLogo />                          // default size
<ThemeLogo className="w-[140px]" />    // custom width
```

Renders `/logo.png` in light mode, `/logo-white.png` in dark mode.

## Design Token Classes — always use these, never hard-code hex values

**Colors:**

```
text-ink     text-navy     text-teal     text-ember    text-muted
bg-mist      bg-panel      bg-panel-alt  bg-ink        bg-teal      bg-ember
border-line
```

**Shadows:** `shadow-editorial` (deep), `shadow-soft` (subtle)

**Border radius:**

```
rounded-xl           ← buttons, inputs
rounded-2xl          ← small cards
rounded-[2rem]       ← standard cards/panels
rounded-[2.5rem]     ← feature cards
rounded-full         ← pills, badges
```

**Typography labels (standard pattern):**

```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
  Label
</p>
```

## Language/Copy Guidelines

Plain, accessible language. No internal jargon.

| ❌ Forbidden            | ✅ Use instead     |
| ----------------------- | ------------------ |
| Intelligence Ingestion  | Upload File        |
| Deployment Protocol     | Publish Settings   |
| Full-Fidelity Preview   | Preview            |
| Automated timed release | Schedule for later |
| Metadata population     | Fill in details    |
| Extraction workflow     | processing         |
| Editorial metadata      | Report details     |
