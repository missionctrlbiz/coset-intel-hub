import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;
const defaultModel = process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-1.5-pro';
const fastModel = process.env.GOOGLE_GENERATIVE_AI_FAST_MODEL || 'gemini-1.5-flash';

export const MAX_HTML_EXCERPT_LENGTH = 30_000;

export type ExtractionDraft = {
  title: string;
  summary: string;
  category: string[];
  tags: string[];
  recommendedSlug: string;
  formattedContent?: string;
};

function normalizeJsonResponse(rawText: string) {
  return rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
}

export async function generateExtractionDraft(input: {
  fileName: string;
  fileType: string;
  excerpt: string;
  purpose?: string;
}) {
  if (!client || !input.excerpt.trim()) {
    return null;
  }

  const prompt = input.purpose === 'web-scraping'
    ? `You are CoSET's URL scraping assistant. 
           Extract the core report content from this HTML while ignoring navigation, headers, and footers.
           Return JSON only.
           
           Required JSON shape:
           {
             "title": "string",
             "summary": "string",
             "category": ["string", "string"],
             "tags": ["string", "string", "string"],
             "recommendedSlug": "string",
             "formattedContent": "string (semantic HTML of the main article only)"
           }
           
           HTML Excerpt:
           ${input.excerpt.slice(0, MAX_HTML_EXCERPT_LENGTH)}`
    : `You are CoSET's report extraction assistant.
           Analyze the uploaded file excerpt and return JSON only.

           Required JSON shape:
           {
             "title": "string",
             "summary": "string",
             "category": ["string", "string"],
             "tags": ["string", "string", "string"],
             "recommendedSlug": "string"
           }

           File name: ${input.fileName}
           File type: ${input.fileType || 'unknown'}
           Excerpt:
           ${input.excerpt.slice(0, MAX_HTML_EXCERPT_LENGTH)}`;

  try {
    const response = await client.models.generateContent({
      model: fastModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const rawText = response.text?.trim();
    if (!rawText) return null;

    const parsed = JSON.parse(normalizeJsonResponse(rawText)) as ExtractionDraft;

    return {
      ...parsed,
      model: fastModel,
    };
  } catch (error) {
    console.error('Failed to generate extraction draft:', error);
    return null;
  }
}

export type ContentMetadata = {
  title: string;
  summary: string;
  category: string[];
  tags: string[];
};

/**
 * Analyse a block of text or HTML and return structured report metadata.
 * Used by the /api/analyze-content route to let editors auto-fill Step 1.
 */
export async function analyzeContentForMetadata(content: string): Promise<ContentMetadata | null> {
  if (!client || !content.trim()) return null;

  const prompt = `You are CoSET's intelligence analyst.
Analyze the following report content and return ONLY a JSON object — no markdown fences, no commentary.

Required JSON shape:
{
  "title": "string — concise report title",
  "summary": "string — 2-4 sentence executive summary",
  "category": ["string", "string"] — at most 3 items from: Climate, Energy, Geopolitics, Security, Economics, Technology, Health, Biodiversity, Governance, Society,
  "tags": ["string", "string", "string"] — at most 5 specific keyword tags
}

Content:
${content.slice(0, MAX_HTML_EXCERPT_LENGTH)}`;

  try {
    const response = await client.models.generateContent({
      model: fastModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const rawText = response.text?.trim();
    if (!rawText) return null;

    return JSON.parse(normalizeJsonResponse(rawText)) as ContentMetadata;
  } catch (error) {
    console.error('Failed to analyze content for metadata:', error);
    return null;
  }
}

/**
 * Pre-process raw HTML to extract chart/visualization data from <script> tags.
 * This data would otherwise be lost since scripts are stripped for security.
 * We feed this extracted data explicitly into the Gemini prompt so it can
 * recreate the visualizations as pure HTML/CSS.
 */
function extractVisualizationData(rawHtml: string): string {
  const scriptBlocks: string[] = [];
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(rawHtml)) !== null) {
    const scriptContent = match[1].trim();
    // Only keep scripts that contain chart/viz data (not CDN imports)
    if (
      scriptContent.length > 50 &&
      (scriptContent.includes('Chart') ||
        scriptContent.includes('chart') ||
        scriptContent.includes('Plotly') ||
        scriptContent.includes('plotly') ||
        scriptContent.includes('data') ||
        scriptContent.includes('labels') ||
        scriptContent.includes('datasets') ||
        scriptContent.includes('d3.') ||
        scriptContent.includes('echarts') ||
        scriptContent.includes('google.visualization'))
    ) {
      scriptBlocks.push(scriptContent);
    }
  }

  if (scriptBlocks.length === 0) return '';

  return `
## ⚠️ EXTRACTED CHART/VISUALIZATION DATA (from <script> tags):
The original HTML contained JavaScript-driven charts (Chart.js, Plotly, D3, etc.).
These scripts will be STRIPPED for security. You MUST recreate ALL of the following
chart data as pure HTML/CSS visualizations using the component patterns below.
DO NOT SKIP ANY CHART. Every dataset, every label, every data point must appear.

\`\`\`javascript
${scriptBlocks.join('\n\n// --- NEXT SCRIPT BLOCK ---\n\n')}
\`\`\`

`;
}

/**
 * Pre-process raw HTML to extract inline CSS styles that provide visual context.
 */
function extractCustomStyles(rawHtml: string): string {
  const styleBlocks: string[] = [];
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let match;

  while ((match = styleRegex.exec(rawHtml)) !== null) {
    const styleContent = match[1].trim();
    if (styleContent.length > 20) {
      styleBlocks.push(styleContent);
    }
  }

  if (styleBlocks.length === 0) return '';

  return `
## ORIGINAL CSS STYLES (for visual context — colors, fonts, layout intent):
\`\`\`css
${styleBlocks.join('\n\n')}
\`\`\`

`;
}

function inferDocumentClassGuidance(content: string): string {
  const normalized = content.toLowerCase();
  const policySignals = [
    'policy',
    'regulation',
    'legislation',
    'framework',
    'recommendation',
    'implementation',
    'enforcement',
    'compliance',
    'section ',
    'act',
    'ministry',
    'agency',
    'authority',
    'stakeholder',
    'host community',
  ];

  const matchedSignals = policySignals.filter((signal) => normalized.includes(signal));
  if (matchedSignals.length < 3) {
    return '';
  }

  return `
## DOCUMENT CLASS GUIDANCE — POLICY / LEGAL BRIEFING:
This source reads like a policy, legal, regulatory, or institutional briefing.
Prioritize a structure that feels like a decision-grade brief rather than a generic article.

When the source supports it, include these semantic blocks:
1. An executive summary panel that states the issue, why it matters, and the decisive takeaway.
2. A clear separation between findings, risks/barriers, and recommendations.
3. A policy actor or stakeholder matrix when institutions, agencies, communities, ministries, or operators are named.
4. A legal or regulatory framework block when acts, sections, compliance duties, or enforcement pathways are mentioned.
5. An implementation pathway or phased timeline when the document implies sequence, reform steps, or institutional actions.

Preferred visual patterns for this class of report:
- Actor matrix tables
- Recommendation cards grouped by audience or timeline
- Risk / barrier callouts with stronger contrast
- Timeline strips for implementation phases
- Comparison bars for entitlements, obligations, penalties, or resource splits

Do not invent legal citations or actors. Only structure what is genuinely present in the source.

`;
}

/**
 * Reformat raw extracted text or HTML into a premium intelligence-report HTML layout.
 * Returns a full HTML snippet with sections, pull-quotes, stat callouts, and recreated charts.
 * 
 * This function transforms raw/messy content into beautifully structured, interactive
 * intelligence reports using Gemini with comprehensive design guidelines.
 */
export async function beautifyHtmlContent(content: string): Promise<string | null> {
  if (!client || !content.trim()) return null;

  // Pre-extract visualization data and styles before they get stripped
  const vizData = extractVisualizationData(content);
  const styleData = extractCustomStyles(content);
  const documentClassGuidance = inferDocumentClassGuidance(content);

  const prompt = `You are an expert report designer and data visualization specialist for the CoSET Intelligence Hub — a socio-ecological transformation research platform focused on Nigeria.

I will give you RAW HTML that was pasted from a browser, uploaded as a file, or scraped from a web page. Your job is to PARSE and RESTRUCTURE it into a beautifully formatted, premium-quality intelligence report using ONLY Tailwind CSS classes and inline styles.

${vizData}${styleData}${documentClassGuidance}## RENDERING CONTEXT — CRITICAL FOR STYLING:
Your output HTML will be rendered inside this wrapper:
\`\`\`html
<article class="prose prose-slate prose-lg max-w-none">
  <!-- YOUR OUTPUT GOES HERE -->
</article>
\`\`\`

This means:
1. **Tailwind's prose plugin is active** — it overrides text colors, heading sizes, link colors, margins, etc.
2. **In LIGHT mode**: page background is #F8F9FA (mist). The prose plugin sets body text to dark gray.
3. **In DARK mode**: The prose-invert plugin would set body text to light gray.
4. **YOU MUST override prose defaults** on every element by setting explicit text colors, background colors, and borders.
5. **EVERY text element** needs explicit colors. Never rely on prose defaults — they may conflict.
6. **Cards with bg-white will blend into the light-mode background** — always add a visible border (border border-slate-200 dark:border-slate-700) and subtle shadow (shadow-sm).
7. **Dark background sections** (like bg-ink/navy process flows) must use explicit light text colors (text-white, text-blue-100) and be wrapped in class="not-prose" to prevent prose from overriding text to dark colors.
8. **Inside dark background sections**, do NOT use dark: prefixes for text — text needs to be light regardless of page theme.
9. **The prose plugin affects <p>, <ul>, <li>, <h2>, <h3>, <blockquote>, <table>** — always add explicit Tailwind classes.

## STRICT COLOR PALETTE (use ONLY these CoSET brand colors):
- Ink (Navy): #1A202C or rgb(26, 32, 44) — headings, dark section backgrounds, primary text
- Navy: rgb(15, 23, 42) or #0F172A — alternate dark sections  
- Teal: #0D9488 or rgb(13, 148, 136) — positive indicators, success, growth data
- Ember (Orange-Red): #E54B22 or rgb(229, 75, 34) — highlights, callout icons, important numbers, CTA buttons, alerts
- Mist: #F8F9FA or rgb(248, 249, 250) — light panel backgrounds
- Panel: #FFFFFF with borders — white card backgrounds
- Body text: text-slate-700 (ALWAYS set explicitly)
- Muted text: text-slate-500 or text-slate-600
- Card backgrounds: bg-white or bg-panel (ALWAYS add border border-line + shadow)
- Borders: border-slate-200 or border-line class

## CRITICAL RULES — READ CAREFULLY:

### Rule 1: EXTRACT EVERYTHING
Copy every single piece of content: headings, paragraphs, statistics, data points, chart labels, chart values, table cells, bullet points, quotes, footnotes, source attributions, dates, author names, captions. NOTHING should be omitted.

### Rule 1.5: UNIQUE & ENHANCED LAYOUTS
Avoid using the exact same structure for every report. Enhance the visualizations by using a diverse range of layout patterns, contextual layouts, and beautiful styling combos to ensure every report looks unique. You should adapt the layout creatively depending on the context.

### Rule 1.6: SEMANTIC NAVIGATION & ANCHORED STRUCTURE
- Every major section heading must be a semantic <h2> with a unique slug id, for example: <h2 id="host-community-trusts" data-section-style="signal">Host Community Trusts</h2>
- Important subsections should use <h3 id="..."></h3> when they deserve deep linking.
- Never output href="#" placeholders.
- If the report has 4 or more major sections, include a visible table of contents near the top using:
  <nav data-report-toc="true" class="not-prose bg-white rounded-[1.75rem] border border-line p-5 shadow-soft my-6">
    <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-ember">Table of Contents</h2>
    <ul class="mt-4 space-y-2 text-sm">
      <li><a href="#host-community-trusts" class="text-navy hover:text-ember font-semibold">Host Community Trusts</a></li>
    </ul>
  </nav>
- Every TOC item must point to a real heading id that exists later in the document.

### Rule 2: RECREATE ALL CHARTS & VISUALIZATIONS AS PURE HTML/CSS
The original HTML may contain Chart.js, Plotly, D3, or other JavaScript charts. Since scripts are stripped, you MUST recreate every chart as a pure HTML/CSS visualization:

**Bar Charts → HTML Bar Visualization:**
<div class="bg-white rounded-2xl p-6 border border-line shadow-soft my-6">
  <h3 class="font-display font-bold text-navy mb-1 text-lg">Chart Title</h3>
  <p class="text-xs text-muted mb-4">Subtitle or axis description</p>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <span class="text-xs text-slate-600 w-36 shrink-0 text-right">Label Name</span>
      <div class="flex-1 bg-mist rounded-full h-8 overflow-hidden">
        <div class="h-full bg-ember rounded-full flex items-center justify-end pr-2" style="width: 92%">
          <span class="text-xs font-bold text-white">92%</span>
        </div>
      </div>
    </div>
    <!-- Repeat for EVERY data point. Use different colors for different categories:
         bg-ember (orange-red), bg-teal (teal), bg-navy (navy), bg-slate-400 (gray) -->
  </div>
  <p class="mt-4 text-xs text-slate-400 italic">Source attribution if available</p>
</div>

**Pie/Donut Charts → Progress Ring Cards:**
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
  <div class="bg-white rounded-2xl p-4 border border-line shadow-soft text-center">
    <div class="relative w-20 h-20 mx-auto mb-3">
      <div class="w-full h-full rounded-full" style="background: conic-gradient(#E54B22 0% 75%, #e2e8f0 75% 100%)"></div>
      <div class="absolute inset-2 bg-white rounded-full flex items-center justify-center">
        <span class="text-lg font-bold text-ember">75%</span>
      </div>
    </div>
    <p class="text-sm font-semibold text-navy">Label</p>
  </div>
</div>

**Tables with Visual Indicators:**
<div class="overflow-x-auto my-6 rounded-2xl border border-line shadow-soft">
  <table class="w-full text-sm">
    <thead>
      <tr>
        <th class="bg-ink text-white px-4 py-3 text-left font-semibold">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr class="even:bg-mist">
        <td class="px-4 py-3 border-t border-line text-slate-700">Cell content</td>
      </tr>
    </tbody>
  </table>
</div>

### Rule 3: PROCESS FLOWS & STEP SEQUENCES
If the original has a flow diagram, process steps, or sequential cards — wrap in "not-prose" to prevent prose color overrides on the dark background:
<div class="not-prose bg-ink rounded-[2rem] p-8 my-8 shadow-editorial">
  <h3 class="text-2xl font-bold text-white text-center mb-2">Process Title</h3>
  <p class="text-blue-200 text-center text-sm mb-8 max-w-2xl mx-auto">Description</p>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
      <div class="w-10 h-10 bg-ember rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">1</div>
      <h4 class="font-bold text-ember mb-2">Step Title</h4>
      <p class="text-blue-100 text-sm">Step description text.</p>
    </div>
    <!-- Repeat for every step. Do NOT use dark: prefixes inside this section — text is always light on the navy background -->
  </div>
</div>

### Rule 4: SECTION HEADERS
Do NOT use one universal decorative wrapper for every heading.
Keep headings semantic and vary their presentation with one of these styles:
- <h2 id="section-slug" data-section-style="signal" class="text-2xl font-bold text-navy font-display">Section Title</h2>
- <h2 id="section-slug" data-section-style="banner" class="text-2xl font-bold text-navy font-display">Section Title</h2>
- <h2 id="section-slug" data-section-style="marker" class="text-2xl font-bold text-navy font-display">Section Title</h2>
- <h2 id="section-slug" data-section-style="split" class="text-2xl font-bold text-navy font-display">Section Title</h2>
Choose heading styles contextually. Do not repeat the same heading treatment mechanically throughout the whole report.

### Rule 5: STATISTIC/DATA CALLOUT CARDS
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
  <div class="bg-white rounded-2xl p-5 border border-line shadow-soft">
    <p class="text-3xl font-bold text-ember font-display">42%</p>
    <p class="text-sm text-muted mt-1">Description of the stat</p>
  </div>
</div>

### Rule 6: CONTEXT/INFO CARDS WITH COLORED BORDERS
<div class="bg-white border-l-4 border-ember p-5 shadow-soft rounded-r-xl my-4">
  <h4 class="font-bold text-ember mb-1">Card Title</h4>
  <p class="text-slate-700 text-sm">Description text.</p>
</div>
<!-- Use border-ember for important callouts, border-teal for positive, border-navy for policy -->

### Rule 7: QUOTE/FINDING CALLOUT
<blockquote class="border-l-4 border-ember bg-ember/5 p-5 rounded-r-xl my-6">
  <p class="italic text-slate-700 text-lg leading-relaxed">"Quote text here"</p>
  <footer class="mt-2 text-sm text-muted">— Attribution</footer>
</blockquote>

### Rule 8: ALERT/IMPORTANT BOX
<div class="bg-red-50 border border-red-200 rounded-2xl p-5 my-6">
  <div class="flex items-start gap-3">
    <span class="text-ember text-xl">⚠️</span>
    <div>
      <p class="font-semibold text-red-800">Alert Title</p>
      <p class="text-red-700 text-sm mt-1">Details...</p>
    </div>
  </div>
</div>

### Rule 9: SUCCESS/POSITIVE BOX
<div class="bg-teal-50 border border-teal-200 rounded-2xl p-5 my-6">
  <div class="flex items-start gap-3">
    <span class="text-teal-600 text-xl">✅</span>
    <div>
      <p class="font-semibold text-teal-800">Finding</p>
      <p class="text-teal-700 text-sm mt-1">Details...</p>
    </div>
  </div>
</div>

### Rule 10: RECOMMENDATIONS/KEY FINDINGS CARDS
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="bg-white rounded-2xl p-6 border-t-4 border-teal border border-line shadow-soft">
    <h3 class="font-bold text-navy font-display mb-3">Recommendation Title</h3>
    <ul class="space-y-2 text-sm text-slate-600">
      <li class="flex items-start gap-2"><span class="text-teal mt-0.5">✓</span> Point text</li>
    </ul>
  </div>
</div>

### Rule 11: CTA BUTTONS/ACTION LINKS
<a class="inline-flex items-center gap-2 bg-ember text-white font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-colors shadow-md mt-4">Button Text</a>

### Rule 12: IMAGES & LINKS
- PRESERVE all <img> tags with original src. Style: class="w-full rounded-2xl shadow-soft my-4"
- PRESERVE all <a> tags with original href. Style: class="text-ember hover:underline font-medium"
- Wrap images in a figure if context is available

## OUTPUT RULES:
1. DO NOT add <!DOCTYPE>, <html>, <head>, <body>, or <script> tags
2. DO NOT wrap in a container div — the page already provides max-w-4xl and padding
3. Body paragraphs: <p class="text-slate-700 leading-relaxed mb-4">
4. Lists: <ul class="space-y-2 my-4 ml-4 list-disc list-inside"> with styled <li class="text-slate-700">
5. Make it responsive with md: and lg: breakpoints
6. The result should look like a premium Bloomberg/McKinsey/World Bank report
7. Use conic-gradient for pie/donut charts, percentage widths for bar charts, colored badges for severity
8. Wrap any section with a dark background (bg-ink, bg-navy, bg-red-50, bg-teal-50) in a <div class="not-prose ...">
9. ALL white cards (bg-white) MUST have border border-line shadow-soft
10. Use CoSET design tokens: border-line, bg-panel, bg-mist, text-muted, shadow-soft, shadow-editorial, rounded-2xl, rounded-[2rem], font-display for headings
11. If the source contains numeric comparisons, percentages, rankings, budgets, counts, year changes, or survey splits, convert that information into at least one real visual component instead of leaving it as plain paragraphs.
12. Use a mix of visuals when appropriate: metric cards, comparison bars, timeline strips, evidence grids, process flows, severity matrices, and data tables with emphasis cues.

## SELF-VALIDATION CHECKLIST (check your output against these before returning):
□ Does every section from the original appear in the output?
□ Are all chart/graph data points recreated as HTML visualizations (no empty cards)?
□ Do all stat cards have actual numbers (not placeholders)?
□ Are process/flow steps all present with correct numbering?
□ Do all grid layouts have correct responsive classes (md:, lg:)?
□ Are colors from the CoSET palette only (ink, navy, teal, ember, mist)?
□ Is there NO empty or placeholder content?
□ Does the output have visual variety (not just paragraphs — mix of cards, bars, tables, callouts)?
□ All text explicitly styled (not relying on prose defaults)?
□ Are dark-background sections wrapped in "not-prose"?
□ Does every TOC link point to a real heading id instead of href="#"?
□ Did you avoid repeating the exact same heading shell across the report?

Return ONLY the transformed HTML. No markdown fences, no explanations, no commentary.

---

RAW CONTENT TO TRANSFORM:

${content.slice(0, MAX_HTML_EXCERPT_LENGTH)}`;

  try {
    const response = await client.models.generateContent({
      model: defaultModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const rawText = response.text?.trim();
    if (!rawText) return null;

    // Clean up — remove markdown code fences if present
    const cleaned = rawText
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return cleaned;
  } catch (error) {
    console.error('Failed to beautify HTML content:', error);
    return null;
  }
}