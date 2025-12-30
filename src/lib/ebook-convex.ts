/**
 * Ebook Convex Client
 *
 * Server-side utilities for reading ebook content from Convex database.
 * This is the primary source for the HTML ebook pages.
 *
 * For PDF/figure generation scripts, use ebook-parser.ts (filesystem-based).
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id, Doc } from "../../convex/_generated/dataModel";

// ============================================================================
// Types
// ============================================================================

export interface Chapter {
  slug: string;
  title: string;
  content: string;
  part?: string;
  chapterNumber?: number;
  type: "intro" | "chapter" | "appendix";
}

export interface TableOfContentsItem {
  slug: string;
  title: string;
  type: "intro" | "chapter" | "appendix";
  chapterNumber?: number;
  part?: string;
}

export interface ConvexChapter {
  _id: Id<"ebookChapters">;
  draftId: Id<"ebookDrafts">;
  partId: Id<"ebookParts"> | null;
  slug: string;
  title: string;
  type: "intro" | "chapter" | "appendix";
  chapterNumber: number | null;
  order: number;
}

export interface ConvexBlock {
  _id: Id<"ebookBlocks">;
  chapterId: Id<"ebookChapters">;
  type:
    | "paragraph"
    | "heading2"
    | "heading3"
    | "heading4"
    | "blockquote"
    | "list"
    | "table"
    | "figure"
    | "code";
  content: string;
  figureId: Id<"ebookFigures"> | null;
  listType: "bullet" | "numbered" | null;
  order: number;
}

export interface ConvexFigure {
  _id: Id<"ebookFigures">;
  figureId: string;
  storageId: Id<"_storage">;
  alt: string;
  caption: string | null;
  url: string | null;
}

export interface ConvexPart {
  _id: Id<"ebookParts">;
  title: string;
  order: number;
}

export interface ChapterWithBlocks {
  chapter: ConvexChapter;
  blocks: ConvexBlock[];
  figures: ConvexFigure[];
}

// ============================================================================
// Convex Client
// ============================================================================

let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL environment variable is required"
      );
    }
    _client = new ConvexHttpClient(url);
  }
  return _client;
}

// Cache for draft ID (avoid repeated lookups)
let _draftIdCache: Id<"ebookDrafts"> | null = null;
let _draftIdPromise: Promise<Id<"ebookDrafts"> | null> | null = null;

async function getPublishedDraftId(): Promise<Id<"ebookDrafts"> | null> {
  if (_draftIdCache) return _draftIdCache;
  if (_draftIdPromise) return _draftIdPromise;

  _draftIdPromise = (async () => {
    const client = getClient();
    const draft = await client.query(api.ebook.queries.getPublishedDraft, {});
    _draftIdCache = draft?._id ?? null;
    return _draftIdCache;
  })();

  return _draftIdPromise;
}

// ============================================================================
// Block to Markdown Conversion
// ============================================================================

function blocksToMarkdown(
  blocks: ConvexBlock[],
  figureMap: Map<string, ConvexFigure>
): string {
  const lines: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading2":
        lines.push(`## ${block.content}`);
        break;
      case "heading3":
        lines.push(`### ${block.content}`);
        break;
      case "heading4":
        lines.push(`#### ${block.content}`);
        break;
      case "blockquote":
        lines.push(
          block.content
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")
        );
        break;
      case "list":
        lines.push(block.content);
        break;
      case "table":
        lines.push(block.content);
        break;
      case "code":
        lines.push(block.content);
        break;
      case "figure":
        if (block.figureId) {
          const figure = figureMap.get(block.figureId as string);
          if (figure && figure.url) {
            lines.push(`![${figure.alt}](${figure.url})`);
            if (figure.caption) {
              lines.push(`*${figure.caption}*`);
            }
          }
        } else {
          // Fallback to content if figureId not linked
          lines.push(block.content);
        }
        break;
      case "paragraph":
      default:
        lines.push(block.content);
        break;
    }
    lines.push(""); // Add blank line between blocks
  }

  return lines.join("\n").trim();
}

// ============================================================================
// Public API - Chapter Functions
// ============================================================================

/**
 * Get a single chapter by slug with its content
 */
export async function getChapterBySlug(
  slug: string
): Promise<Chapter | null> {
  const draftId = await getPublishedDraftId();
  if (!draftId) return null;

  const client = getClient();
  const result = await client.query(api.ebook.queries.getChapterWithBlocks, {
    draftId,
    slug,
  });

  if (!result) return null;

  const { chapter, blocks, figures } = result as ChapterWithBlocks;

  // Create figure map for block reconstruction
  const figureMap = new Map<string, ConvexFigure>();
  for (const fig of figures) {
    figureMap.set(fig._id as string, fig);
  }

  // Reconstruct markdown content
  const content = blocksToMarkdown(blocks, figureMap);

  // Get part name if partId exists
  let partName: string | undefined;
  if (chapter.partId) {
    const parts = await client.query(api.ebook.queries.getParts, { draftId });
    const part = parts.find(
      (p: Doc<"ebookParts">) => p._id === chapter.partId
    );
    if (part) {
      partName = part.title;
    }
  }

  return {
    slug: chapter.slug,
    title: chapter.title,
    content,
    part: partName,
    chapterNumber: chapter.chapterNumber ?? undefined,
    type: chapter.type,
  };
}

/**
 * Get all chapter slugs (for static generation)
 */
export async function getAllChapterSlugs(): Promise<string[]> {
  const draftId = await getPublishedDraftId();
  if (!draftId) return [];

  const client = getClient();
  const chapters = await client.query(api.ebook.queries.getChapters, {
    draftId,
  });

  return chapters.map((ch: Doc<"ebookChapters">) => ch.slug);
}

// ============================================================================
// Public API - Table of Contents Functions
// ============================================================================

/**
 * Get table of contents (all chapters without content)
 */
export async function getTableOfContents(): Promise<TableOfContentsItem[]> {
  const draftId = await getPublishedDraftId();
  if (!draftId) return [];

  const client = getClient();
  const chapters = await client.query(api.ebook.queries.getChapters, {
    draftId,
  });
  const parts = await client.query(api.ebook.queries.getParts, { draftId });

  // Create part map
  const partMap = new Map<string, string>();
  for (const part of parts) {
    partMap.set(part._id as string, part.title);
  }

  return chapters.map((ch: Doc<"ebookChapters">) => ({
    slug: ch.slug,
    title: ch.title,
    type: ch.type,
    chapterNumber: ch.chapterNumber ?? undefined,
    part: ch.partId ? partMap.get(ch.partId as string) : undefined,
  }));
}

/**
 * Get adjacent chapters for navigation
 */
export async function getAdjacentChapters(currentSlug: string): Promise<{
  previous: TableOfContentsItem | null;
  next: TableOfContentsItem | null;
}> {
  const toc = await getTableOfContents();
  const currentIndex = toc.findIndex((item) => item.slug === currentSlug);

  return {
    previous: currentIndex > 0 ? toc[currentIndex - 1] : null,
    next: currentIndex < toc.length - 1 ? toc[currentIndex + 1] : null,
  };
}

/**
 * Get table of contents grouped by part
 */
export async function getGroupedTableOfContents(): Promise<
  { part: string | null; items: TableOfContentsItem[] }[]
> {
  const draftId = await getPublishedDraftId();
  if (!draftId) return [];

  const client = getClient();
  const chapters = await client.query(api.ebook.queries.getChapters, {
    draftId,
  });
  const parts = await client.query(api.ebook.queries.getParts, { draftId });

  // Create part map and order
  const partMap = new Map<string, { title: string; order: number }>();
  for (const part of parts) {
    partMap.set(part._id as string, { title: part.title, order: part.order });
  }

  // Group chapters
  const groups: { part: string | null; items: TableOfContentsItem[] }[] = [];

  // Intro items (no part)
  const introItems = chapters
    .filter((ch: Doc<"ebookChapters">) => !ch.partId)
    .map((ch: Doc<"ebookChapters">) => ({
      slug: ch.slug,
      title: ch.title,
      type: ch.type,
      chapterNumber: ch.chapterNumber ?? undefined,
      part: undefined,
    }));

  if (introItems.length > 0) {
    groups.push({ part: null, items: introItems });
  }

  // Part-grouped items (sorted by part order)
  const sortedParts = [...parts].sort(
    (a: Doc<"ebookParts">, b: Doc<"ebookParts">) => a.order - b.order
  );

  for (const part of sortedParts) {
    const partChapters = chapters
      .filter((ch: Doc<"ebookChapters">) => ch.partId === part._id)
      .map((ch: Doc<"ebookChapters">) => ({
        slug: ch.slug,
        title: ch.title,
        type: ch.type,
        chapterNumber: ch.chapterNumber ?? undefined,
        part: part.title,
      }));

    if (partChapters.length > 0) {
      groups.push({ part: part.title, items: partChapters });
    }
  }

  return groups;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if Convex ebook data is available
 */
export async function hasConvexEbookData(): Promise<boolean> {
  try {
    const draftId = await getPublishedDraftId();
    return draftId !== null;
  } catch {
    return false;
  }
}

/**
 * Clear caches (useful for testing or when data changes)
 */
export function clearCaches(): void {
  _draftIdCache = null;
  _draftIdPromise = null;
}
