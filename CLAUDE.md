# Pivot Pyramid Canvas

AI-powered startup hypothesis canvas using the Pivot Pyramid framework. Built with Next.js 15, Convex, and OpenRouter.

## Project Overview

This is the web application and ebook for the Pivot Pyramid framework, created by Selçuk Atlı (YC W14, 500 Startups Venture Partner).

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Convex (real-time database + serverless functions + file storage)
- **AI Text**: OpenRouter (Gemini 2.5 Flash for canvas generation and chat)
- **AI Images**: Fal AI (Recraft v3 / nano-banana-pro for figure generation)
- **Animations**: Framer Motion

## Project Structure

```
casablanca/
├── src/
│   ├── app/              # Next.js app router pages
│   │   └── ebook/        # HTML ebook routes
│   │       └── [slug]/   # Dynamic chapter pages
│   ├── components/       # React components
│   │   ├── canvas/       # Canvas-specific components
│   │   └── ebook/        # Ebook components (TOC, nav, markdown renderer)
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and data
│       └── ebook-parser.ts # Ebook markdown parser
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── canvases.ts       # Canvas CRUD + AI generation
│   ├── canvasMessages.ts # Chat messages
│   └── http.ts           # HTTP routes for streaming
├── ebook/                # Ebook source and generated files
│   ├── pivot-pyramid-ebook.md        # Source markdown
│   ├── pivot-pyramid-ebook-styled.pdf # Generated PDF
│   ├── ebook-styles.css              # PDF styling
│   └── figures/                      # Diagrams and illustrations
│       └── optimized/                # Optimized images for PDF
└── public/               # Static assets
    └── ebook/figures/    # Web-optimized figures for HTML ebook
```

## Development

```bash
# Install dependencies
npm install

# Run Convex dev server (Terminal 1)
npx convex dev

# Run Next.js dev server (Terminal 2)
npm run dev
```

## Environment Variables

### Local (.env.local)
```
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Convex Dashboard
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
FAL_KEY=your-fal-api-key
```

---

## Ebook Generation

The Pivot Pyramid ebook is a comprehensive guide (190+ pages) generated from markdown with custom styling.

### File Structure

```
ebook/
├── pivot-pyramid-ebook.md          # Source content (~4500 lines)
├── pivot-pyramid-ebook-styled.pdf  # Final styled PDF (~32MB)
├── ebook-styles.css                # Custom CSS for PDF styling
└── figures/
    ├── *.png                       # Original high-res figures (~5MB each)
    └── optimized/                  # Optimized figures (~1MB each)
        ├── pivot-pyramid-foundation.png
        ├── over-under-pivot.png
        ├── cascade-customer-pivot.png
        ├── cascade-problem-pivot.png
        ├── cascade-solution-pivot.png
        ├── cascade-technology-pivot.png
        ├── cascade-growth-pivot.png
        ├── diagnostic-flowchart.png
        ├── cost-impact-matrix.png
        ├── pivot-planning-canvas.png
        ├── customer-pivot-playbook.png
        ├── solution-pivot-playbook.png
        ├── growth-channels-matrix.png
        ├── multi-track-trap.png
        ├── anti-pivot-warning.png
        ├── pyramid-audit-template.png
        ├── layer-documentation-card.png
        ├── toolkit-overview.png
        ├── assessment-canvas-full.png
        └── pivot-cost-curve.png
```

### Regenerating the PDF

The PDF is generated using `md-to-pdf` (via npx) which uses Puppeteer/Chromium for rendering.

```bash
cd ebook

# Generate PDF with styling
npx md-to-pdf pivot-pyramid-ebook.md \
  --stylesheet ebook-styles.css \
  --pdf-options '{"format": "Letter", "margin": {"top": "0.75in", "bottom": "0.75in", "left": "0.85in", "right": "0.85in"}}'

# Rename output to styled version
mv pivot-pyramid-ebook.pdf pivot-pyramid-ebook-styled.pdf
```

### CSS Styling

The `ebook-styles.css` provides professional styling including:

- **Typography**: Merriweather (serif) for body, Inter (sans-serif) for headings
- **Colors**: Amber/orange accent color scheme (#f59e0b)
- **Page setup**: Letter format with 0.75in/0.85in margins
- **Features**:
  - Chapter headings with amber underline
  - Drop cap first letters after h2 headings
  - Styled blockquotes as callout boxes
  - Professional table styling with gradient headers
  - Centered figures with shadows and captions
  - Page break handling for print

### Figure Styling

Images are styled with:
```css
img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e7e5e4;
  display: block;
  margin: 1em auto;
}
```

Captions (italic text after images) are automatically styled:
```css
img + em {
  display: block;
  text-align: center;
  font-size: 10pt;
  color: #78716c;
}
```

### Optimizing Figures

The original figures are high-resolution (~5MB each). For a reasonable PDF size, use optimized versions:

```bash
cd ebook/figures

# Create optimized versions (requires ImageMagick)
mkdir -p optimized
for f in *.png; do
  magick "$f" -resize 1200x1200\> -quality 85 "optimized/$f"
done
```

The markdown references optimized figures: `./figures/optimized/filename.png`

### Generating Figures

Figures are generated using **Fal AI's nano-banana-pro** model via Convex actions, with LLM-enhanced prompts for consistent styling.

#### Figure Spec Syntax

Instead of manually generating and linking images, use the `figure` code fence syntax in the markdown. This embeds generation prompts directly in the document:

````markdown
```figure
id: my-diagram
prompt: "A pyramid with 5 layers showing the startup foundation"
alt: My Diagram Title
style: diagram
aspect_ratio: 4:3
resolution: 2K
```
*Caption text in italics*
````

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier, used as filename |
| `prompt` | Yes | Generation prompt for Fal AI |
| `alt` | Yes | Alt text for accessibility |
| `style` | No | Style preset (see below). Default: `diagram` |
| `aspect_ratio` | No | Image ratio. Default: `4:3` |
| `resolution` | No | `1K`, `2K`, or `4K`. Default: `2K` |
| `src` | Auto | Added automatically after generation (locks the figure) |

#### Style Presets

The generation script uses an LLM to enhance prompts with style-specific requirements for visual consistency:

| Style | Description |
|-------|-------------|
| `diagram` | Technical diagrams, framework visualizations (like the Pivot Pyramid) |
| `flowchart` | Process flows, decision trees |
| `matrix` | Grids, comparison matrices |
| `canvas` | Worksheets, planning templates |
| `conceptual` | Abstract concept illustrations |

All styles apply the ebook's visual identity:
- **3D isometric perspective** with depth and polish
- **Color palette**: Dark teal/navy (#1e3a5f), amber/gold (#f59e0b), muted teal-greens
- **Glossy surfaces** with gradients and lighting effects
- **Clean light gray backgrounds**
- **Professional business illustration style**

#### Generation Workflow

1. **Add figure spec** to markdown (without `src` field)
2. **Run generation script**:
   ```bash
   npm run ebook:generate-figures
   ```
3. **Script automatically**:
   - Finds all figures without `src` paths
   - Enhances prompts using LLM + style presets
   - Generates images via Fal AI (in parallel)
   - Downloads to `ebook/figures/optimized/`
   - Copies to `public/ebook/figures/`
   - Updates markdown with `src` path

#### Regenerating Figures

```bash
# Regenerate only figures without src paths
npm run ebook:generate-figures

# Force regenerate ALL figures (even those with src)
npm run ebook:generate-figures -- --force
```

To regenerate a single figure:
1. Delete the `src:` line from its figure spec
2. Run `npm run ebook:generate-figures`

#### How Locking Works

- **Without `src`**: Figure is pending generation
- **With `src`**: Figure is "locked" - won't be regenerated unless `--force` is used
- The `prompt` is always preserved for documentation, even after generation

#### Key Files

| File | Purpose |
|------|---------|
| `scripts/generate-ebook-figures.mjs` | CLI script for figure generation |
| `src/lib/ebook-figure-parser.ts` | Parses figure specs from markdown |
| `src/lib/ebook-parser.ts` | Transforms figure specs to standard images |
| `convex/lib/fal/actions/generateEbookFigure.ts` | Convex action with LLM enhancement |

#### Adding New Figures (Simplified)

1. Add figure spec to markdown:
   ````markdown
   ```figure
   id: new-concept-diagram
   prompt: "Visual representation of the concept"
   alt: New Concept Diagram
   style: diagram
   ```
   *Figure caption*
   ````

2. Generate:
   ```bash
   npm run ebook:generate-figures
   ```

3. Done! The `src` path is automatically added and the figure is ready.

### Markdown Structure

The ebook markdown follows this structure:

```markdown
# Chapter Title

## Section Title

Content paragraphs...

### Subsection

> Callout/quote box content

![Figure Alt Text](./figures/optimized/figure.png)

*Figure caption in italics*

| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |
```

---

## HTML Ebook

The ebook is also available as an HTML version with individual chapter pages, optimized for web reading.

### Routes

| Route | Description |
|-------|-------------|
| `/ebook` | Landing page with full table of contents |
| `/ebook/foreword` | Foreword: Why I Wrote This Book |
| `/ebook/about-author` | About the Author |
| `/ebook/about-book` | About This Book |
| `/ebook/chapter-1` to `/ebook/chapter-14` | Individual chapters |
| `/ebook/appendix-a` to `/ebook/appendix-c` | Appendices |

### Features

- **Sidebar Table of Contents**: Fixed sidebar navigation on desktop, slide-out drawer on mobile
- **Reading Progress**: Progress bar at top showing scroll position
- **Previous/Next Navigation**: Navigate between chapters at the bottom of each page
- **SEO Optimized**: Each chapter has its own URL, metadata, and sitemap entry
- **Responsive Design**: Mobile-first design with adaptive layout
- **Image Lightbox**: Click figures to view full-size
- **Next.js Image Optimization**: Figures served via Next.js Image component

### Key Files

```
src/
├── app/ebook/
│   ├── layout.tsx          # Shared layout with sidebar + progress bar
│   ├── page.tsx             # Landing page with TOC
│   └── [slug]/page.tsx      # Dynamic chapter pages
├── components/ebook/
│   ├── Figure.tsx           # Image with lightbox + caption
│   ├── MarkdownRenderer.tsx # Custom markdown rendering
│   ├── TableOfContents.tsx  # Sidebar/mobile navigation
│   ├── ChapterNav.tsx       # Previous/Next buttons
│   ├── ReadingProgress.tsx  # Scroll progress bar
│   └── EbookSidebar.tsx     # Desktop sidebar + mobile drawer
└── lib/
    └── ebook-parser.ts      # Parses markdown into chapters
```

### Parser Functions

The `ebook-parser.ts` module provides:

```typescript
parseChapters()           // Get all chapters with content
getChapterBySlug(slug)    // Get single chapter by URL slug
getTableOfContents()      // Get TOC items (no content)
getAdjacentChapters(slug) // Get previous/next for navigation
getGroupedTableOfContents() // TOC grouped by Part
getAllChapterSlugs()      // All slugs for static generation
```

### Updating the HTML Ebook

The HTML ebook is automatically generated from the same `ebook/pivot-pyramid-ebook.md` source as the PDF. When you update the markdown:

1. **Figures**: Copy any new figures to `public/ebook/figures/`:
   ```bash
   cp ebook/figures/optimized/new-figure.png public/ebook/figures/
   ```

2. **Build**: The Next.js build will statically generate all chapter pages:
   ```bash
   npm run build
   ```

3. **Sitemap**: Chapter URLs are automatically added to the sitemap via `src/app/sitemap.ts`

### Styling

The HTML ebook uses:
- **Typography**: Merriweather (serif) for body, Inter (sans-serif) for headings
- **Colors**: Same amber/orange theme as PDF (#f59e0b)
- **Components**: Tailwind CSS for responsive styling
- **Markdown**: react-markdown with remark-gfm for GFM support

---

## Deployment

### Convex
```bash
npx convex deploy
```

### Vercel
```bash
vercel
```

Set `NEXT_PUBLIC_CONVEX_URL` in Vercel environment variables.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/canvas/page.tsx` | Main canvas page |
| `src/app/ebook/page.tsx` | HTML ebook landing page |
| `src/app/ebook/[slug]/page.tsx` | Dynamic chapter pages |
| `src/lib/ebook-parser.ts` | Ebook markdown parser |
| `src/lib/ebook-figure-parser.ts` | Figure spec parser |
| `scripts/generate-ebook-figures.mjs` | Figure generation CLI script |
| `convex/lib/fal/actions/generateEbookFigure.ts` | Fal AI figure generation action |
| `convex/canvases.ts` | Canvas CRUD + AI generation |
| `convex/canvasStream.ts` | AI streaming for chat |
| `src/lib/pivot-pyramid-data.ts` | Layer definitions and prompts |
| `ebook/ebook-styles.css` | PDF styling |
| `ebook/pivot-pyramid-ebook.md` | Ebook source content |
