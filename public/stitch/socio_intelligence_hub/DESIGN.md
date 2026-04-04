# Intelligence Hub: Design System Documentation

## 1. Overview & Creative North Star

### The Creative North Star: "The Digital Curator"
This design system moves beyond the standard SaaS dashboard to create a high-end, editorial environment for data. We view the "Intelligence Hub" not as a collection of widgets, but as a **Digital Curator**—an authoritative, sophisticated space where complex environmental and social data is presented with the clarity of a premium broadsheet and the fluidity of modern glassmorphism.

The system breaks the rigid, "boxed-in" template look through **intentional asymmetry**, high-contrast typography scales, and a departure from traditional structural lines. We prioritize breathing room (white space) as a functional element that directs focus, ensuring that "Intelligence" feels curated, not cluttered.

---

## 2. Colors & Surface Philosophy

Our palette is anchored in deep, authoritative teals and oranges, balanced by a multi-tiered neutral system that replaces borders with tonal depth.

### The "No-Line" Rule
To achieve a signature premium feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a sidebar using `surface-container-low` should sit against a `background` main area without a dividing line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
- **Layer 0 (Background):** `#f9f9fc` — The canvas.
- **Layer 1 (Sections):** `surface-container-low` — Large content areas.
- **Layer 2 (Cards/Modules):** `surface-container-lowest` (#ffffff) — High-priority data points.
- **Layer 3 (Floating Elements):** Glassmorphism (see below).

### The "Glass & Gradient" Rule
Main CTAs and high-impact hero sections should utilize a subtle linear gradient (e.g., `primary` to `primary-container`) to provide visual "soul." For floating navigation or over-image filters, use:
- **Background:** `rgba(255, 255, 255, 0.7)` using the `surface` token.
- **Effect:** `backdrop-blur: 12px;`.

---

## 3. Typography: The Editorial Voice

We pair the geometric confidence of **Lexend** with the utilitarian precision of **Manrope**.

*   **Display & Headlines (Lexend):** Used for data storytelling. Large, bold scales (up to `display-lg` at 3.5rem) should be used with tight letter-spacing to create an "Editorial" impact.
*   **Body & Labels (Manrope):** Optimized for readability in data-heavy contexts.
*   **The Narrative Scale:** Use `headline-sm` for report titles and `label-md` for metadata. The high contrast between a `display-md` metric and a `label-sm` caption creates the "Intelligence Hub" authority.

---

## 4. Elevation & Depth

We convey hierarchy through **Tonal Layering** rather than traditional drop shadows.

### The Layering Principle
Achieve lift by "stacking" surface tiers. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift.

### Ambient Shadows
When a physical "float" is required (e.g., a search dropdown), use extra-diffused, low-opacity shadows:
- **Shadow:** `0px 12px 32px rgba(11, 47, 82, 0.06)`
- Use a tinted version of `on-surface` (the deep blue) rather than grey to maintain brand warmth.

### The "Ghost Border" Fallback
If a boundary is required for accessibility, use a **Ghost Border**:
- **Stroke:** 1px
- **Color:** `outline-variant` at **15% opacity**.
- **Never** use 100% opaque borders.

---

## 5. Components

### Cards & Report Previews
- **Structure:** Use `surface-container-lowest` with a `xl` (0.75rem) corner radius.
- **Constraint:** Forbid divider lines. Separate header from body using a 24px spacing increment or a subtle change to `surface-container-highest` for the header background.
- **Interaction:** On hover, transition the background to `surface-bright` and increase the ambient shadow slightly.

### Search Bars & Filters
- **Style:** High-contrast `surface-container-high` backgrounds.
- **Search:** Use a `full` (pill) radius for the main hub search to distinguish it from square data cards.
- **Filters:** Use Selection Chips with `primary-fixed-dim` backgrounds and `on-primary-fixed` text for active states.

### Buttons
- **Primary:** `primary` background with `on-primary` text. Use a subtle gradient for depth.
- **Secondary:** `secondary` (#a83900) for "Action" items (e.g., "Download Report").
- **Tertiary/Ghost:** Use `on-surface-variant` text with no background; background appears as `surface-container-low` on hover.

### Data Visualization Components
- **Intelligence Specific:** Use "Micro-Metric" cards. A small `surface-container-highest` badge containing a trend percentage (using `tertiary` for growth) nested within a larger data card.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical layouts for Hero sections (e.g., text left-aligned, image overlapping the container edge).
- **Do** use `Lexend` for any number or data point to emphasize precision.
- **Do** maximize white space between report categories to allow the eye to rest.
- **Do** use `Glassmorphism` for global navigation to keep the data visible underneath.

### Don't
- **Don't** use pure black (#000000) for text; always use `on-surface` (#1a1c1e) to maintain the brand's sophisticated blue-grey tone.
- **Don't** use standard "Material Design" cards with heavy shadows and 1px borders.
- **Don't** cram multiple data sets into a single row. Use vertical white space to create a "scrolling narrative."
- **Don't** use icons without purpose; icons should be clinical and thin-stroke to match the "Intelligence Hub" aesthetic.