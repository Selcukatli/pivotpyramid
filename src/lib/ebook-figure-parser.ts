/**
 * Figure Spec Parser for Ebook
 *
 * Parses figure code fences from markdown and transforms them to standard image syntax.
 *
 * Syntax:
 * ```figure
 * id: pivot-pyramid-foundation
 * prompt: "A pyramid with 5 layers showing startup foundations"
 * alt: The Pivot Pyramid Foundation
 * style: diagram
 * aspect_ratio: 4:3
 * resolution: 2K
 * src: ./figures/optimized/pivot-pyramid-foundation.png
 * ```
 * *Caption text here*
 */

export interface FigureSpec {
  id: string;
  prompt: string;
  alt: string;
  style?: 'diagram' | 'flowchart' | 'matrix' | 'canvas' | 'conceptual';
  aspect_ratio?: string;
  resolution?: '1K' | '2K' | '4K';
  src?: string;
}

export interface ParsedFigure {
  spec: FigureSpec;
  raw: string; // Original code fence content
  startIndex: number;
  endIndex: number;
  caption?: string; // Italic text after the code fence
}

/**
 * Parse a single figure spec from code fence content
 */
export function parseFigureSpec(content: string): FigureSpec {
  const lines = content.trim().split('\n');
  const spec: Partial<FigureSpec> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove quotes from value if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    switch (key) {
      case 'id':
        spec.id = value;
        break;
      case 'prompt':
        spec.prompt = value;
        break;
      case 'alt':
        spec.alt = value;
        break;
      case 'style':
        spec.style = value as FigureSpec['style'];
        break;
      case 'aspect_ratio':
        spec.aspect_ratio = value;
        break;
      case 'resolution':
        spec.resolution = value as FigureSpec['resolution'];
        break;
      case 'src':
        spec.src = value;
        break;
    }
  }

  // Validate required fields
  if (!spec.id) throw new Error('Figure spec missing required field: id');
  if (!spec.prompt) throw new Error('Figure spec missing required field: prompt');
  if (!spec.alt) throw new Error('Figure spec missing required field: alt');

  return spec as FigureSpec;
}

/**
 * Extract all figure specs from markdown content
 */
export function extractAllFigures(markdown: string): ParsedFigure[] {
  const figures: ParsedFigure[] = [];

  // Match ```figure ... ``` code fences
  const figureRegex = /```figure\n([\s\S]*?)```/g;
  let match;

  while ((match = figureRegex.exec(markdown)) !== null) {
    const raw = match[0];
    const specContent = match[1];
    const startIndex = match.index;
    const endIndex = match.index + raw.length;

    try {
      const spec = parseFigureSpec(specContent);

      // Look for caption (italic text immediately after the code fence)
      const afterFence = markdown.slice(endIndex);
      const captionMatch = afterFence.match(/^\s*\n\*([^*]+)\*/);
      const caption = captionMatch ? captionMatch[1].trim() : undefined;

      figures.push({
        spec,
        raw,
        startIndex,
        endIndex,
        caption,
      });
    } catch (error) {
      console.error(`Error parsing figure spec at index ${startIndex}:`, error);
    }
  }

  return figures;
}

/**
 * Get figures that need generation (no src path)
 */
export function getPendingFigures(markdown: string): ParsedFigure[] {
  return extractAllFigures(markdown).filter(fig => !fig.spec.src);
}

/**
 * Check if markdown has any figures pending generation
 */
export function hasPendingFigures(markdown: string): boolean {
  return getPendingFigures(markdown).length > 0;
}

/**
 * Convert a figure spec to standard markdown image syntax
 */
export function figureSpecToMarkdown(spec: FigureSpec, caption?: string): string {
  if (!spec.src) {
    throw new Error(`Figure ${spec.id} has no src path - generate the image first`);
  }

  // Transform path for web: ./figures/optimized/file.png -> /ebook/figures/file.png
  const webPath = spec.src.replace(/\.\/figures\/optimized\//, '/ebook/figures/');

  let result = `![${spec.alt}](${webPath})`;

  if (caption) {
    result += `\n\n*${caption}*`;
  }

  return result;
}

/**
 * Transform all figure specs in markdown to standard image syntax
 * Only transforms figures that have a src path (already generated)
 */
export function transformFigureSpecs(markdown: string): string {
  const figures = extractAllFigures(markdown);
  let result = markdown;

  // Process in reverse order to maintain correct indices
  for (let i = figures.length - 1; i >= 0; i--) {
    const fig = figures[i];

    // Only transform figures with src (already generated)
    if (!fig.spec.src) continue;

    const imageMarkdown = figureSpecToMarkdown(fig.spec, fig.caption);

    // Calculate the full replacement range (including caption if present)
    let endIndex = fig.endIndex;
    if (fig.caption) {
      const afterFence = result.slice(fig.endIndex);
      const captionMatch = afterFence.match(/^\s*\n\*[^*]+\*/);
      if (captionMatch) {
        endIndex += captionMatch[0].length;
      }
    }

    // Replace the figure spec with standard markdown image
    result = result.slice(0, fig.startIndex) + imageMarkdown + result.slice(endIndex);
  }

  return result;
}

/**
 * Update a figure spec in markdown with a new src path
 * Used after image generation to "lock" the figure
 */
export function updateFigureSrc(
  markdown: string,
  figureId: string,
  srcPath: string
): string {
  const figures = extractAllFigures(markdown);
  const figure = figures.find(f => f.spec.id === figureId);

  if (!figure) {
    throw new Error(`Figure not found: ${figureId}`);
  }

  // Add or update the src line in the figure spec
  const specContent = markdown.slice(figure.startIndex, figure.endIndex);

  let updatedSpec: string;
  if (figure.spec.src) {
    // Update existing src line
    updatedSpec = specContent.replace(
      /^src:.*$/m,
      `src: ${srcPath}`
    );
  } else {
    // Add new src line before the closing ```
    updatedSpec = specContent.replace(
      /```$/,
      `src: ${srcPath}\n\`\`\``
    );
  }

  return markdown.slice(0, figure.startIndex) + updatedSpec + markdown.slice(figure.endIndex);
}
