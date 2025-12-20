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
│   ├── components/       # React components
│   │   └── canvas/       # Canvas-specific components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and data
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

Figures are generated using **Fal AI's Recraft v3 (nano-banana-pro)** model via Convex actions, then stored in Convex storage.

#### Generation Process

1. **Use Fal Actions**: Generate images using the `fal-ai/recraft-v3` model (nano-banana-pro)
2. **Store in Convex**: Upload generated images to Convex storage for persistence
3. **Download for Ebook**: Export images from Convex storage to `ebook/figures/`

#### Design Guidelines (IMPORTANT)

All figures must follow these guidelines for consistency:

1. **Flat, Front-Facing Perspective**
   - Diagrams and charts must be presented **directly facing the screen**
   - **NO 3D angles or isometric views** for informational graphics
   - Text and labels should be horizontal and readable

2. **Brand Alignment**
   - Use the amber/orange color scheme (#f59e0b, #d97706, #ea580c)
   - Consistent illustration style across all figures
   - Professional, clean aesthetic matching the ebook design

3. **Visual Consistency**
   - Same illustration style for all figures (flat design with subtle shadows)
   - Consistent use of the pyramid motif where relevant
   - Unified color palette: amber/orange for primary, teal for accents, stone grays for neutrals

#### Example Prompt Structure

```
Create a professional business diagram showing [concept].

Style requirements:
- Flat, 2D design viewed directly from the front (not at an angle)
- Clean, minimal aesthetic with amber/orange (#f59e0b) as primary color
- Professional business illustration style
- Clear labels and text that are horizontal and readable
- Light gray or white background
- Subtle shadows for depth, but diagram should face the viewer directly
```

#### Adding New Figures

1. Generate figure using Fal AI with the design guidelines above
2. Store in Convex storage
3. Download and save to `ebook/figures/`
4. Create optimized version in `ebook/figures/optimized/`:
   ```bash
   cd ebook/figures
   magick "new-figure.png" -resize 1200x1200\> -quality 85 "optimized/new-figure.png"
   ```
5. Reference in markdown:
   ```markdown
   ![Figure Title](./figures/optimized/figure-name.png)

   *Caption text in italics*
   ```

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
| `convex/canvases.ts` | Canvas CRUD + AI generation |
| `convex/canvasStream.ts` | AI streaming for chat |
| `src/lib/pivot-pyramid-data.ts` | Layer definitions and prompts |
| `ebook/ebook-styles.css` | PDF styling |
| `ebook/pivot-pyramid-ebook.md` | Ebook source content |
