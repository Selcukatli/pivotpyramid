import fs from 'fs';
import path from 'path';
import { transformFigureSpecs, hasPendingFigures as checkPendingFigures, getPendingFigures } from './ebook-figure-parser';

export interface Chapter {
  slug: string;
  title: string;
  content: string;
  part?: string;
  chapterNumber?: number;
  type: 'intro' | 'chapter' | 'appendix' | 'part';
}

export interface TableOfContentsItem {
  slug: string;
  title: string;
  type: 'intro' | 'chapter' | 'appendix' | 'part';
  chapterNumber?: number;
  part?: string;
}

// Define the chapter structure
const CHAPTER_CONFIG: { pattern: RegExp; slug: string; type: Chapter['type'] }[] = [
  { pattern: /^# The Pivot Pyramid$/m, slug: 'title', type: 'intro' },
  { pattern: /^# Why I Wrote This Book$/m, slug: 'foreword', type: 'intro' },
  { pattern: /^# Table of Contents$/m, slug: 'toc', type: 'intro' }, // Used as boundary, skipped in output
  { pattern: /^## Chapter 1:/m, slug: 'chapter-1', type: 'chapter' },
  { pattern: /^## Chapter 2:/m, slug: 'chapter-2', type: 'chapter' },
  { pattern: /^## Chapter 3:/m, slug: 'chapter-3', type: 'chapter' },
  { pattern: /^## Chapter 4:/m, slug: 'chapter-4', type: 'chapter' },
  { pattern: /^## Chapter 5:/m, slug: 'chapter-5', type: 'chapter' },
  { pattern: /^## Chapter 6:/m, slug: 'chapter-6', type: 'chapter' },
  { pattern: /^## Chapter 7:/m, slug: 'chapter-7', type: 'chapter' },
  { pattern: /^## Chapter 8:/m, slug: 'chapter-8', type: 'chapter' },
  { pattern: /^## Chapter 9:/m, slug: 'chapter-9', type: 'chapter' },
  { pattern: /^## Chapter 10:/m, slug: 'chapter-10', type: 'chapter' },
  { pattern: /^## Chapter 11:/m, slug: 'chapter-11', type: 'chapter' },
  { pattern: /^## Chapter 12:/m, slug: 'chapter-12', type: 'chapter' },
  { pattern: /^## Chapter 13:/m, slug: 'chapter-13', type: 'chapter' },
  { pattern: /^## Chapter 14:/m, slug: 'chapter-14', type: 'chapter' },
  { pattern: /^## Appendix A:/m, slug: 'appendix-a', type: 'appendix' },
  { pattern: /^## Appendix B:/m, slug: 'appendix-b', type: 'appendix' },
  { pattern: /^## Appendix C:/m, slug: 'appendix-c', type: 'appendix' },
];

// Part definitions for grouping chapters
const PARTS: { title: string; chapters: string[] }[] = [
  { title: 'Part I: The Framework', chapters: ['chapter-1', 'chapter-2', 'chapter-3'] },
  { title: 'Part II: Diagnosis', chapters: ['chapter-4', 'chapter-5', 'chapter-6'] },
  { title: 'Part III: Execution', chapters: ['chapter-7', 'chapter-8', 'chapter-9', 'chapter-10'] },
  { title: 'Part IV: Advanced Topics', chapters: ['chapter-11', 'chapter-12', 'chapter-13'] },
  { title: 'Part V: Tools and Resources', chapters: ['chapter-14', 'appendix-a', 'appendix-b', 'appendix-c'] },
];

function getPartForChapter(slug: string): string | undefined {
  for (const part of PARTS) {
    if (part.chapters.includes(slug)) {
      return part.title;
    }
  }
  return undefined;
}

function extractTitle(content: string): string {
  // Extract the first heading from the content
  const match = content.match(/^#+ (.+)$/m);
  if (match) {
    return match[1].replace(/^(Chapter \d+|Appendix [A-C]): /, '');
  }
  return 'Untitled';
}

function getChapterNumber(slug: string): number | undefined {
  const match = slug.match(/chapter-(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

function transformFigurePaths(content: string): string {
  // Transform relative figure paths to absolute paths for web
  // ./figures/optimized/filename.png -> /ebook/figures/filename.png
  return content.replace(
    /\.\/figures\/optimized\/([^)]+)/g,
    '/ebook/figures/$1'
  );
}

function stripPartHeaders(content: string): string {
  // Remove standalone Part headers (# Part I/II/III/IV/V: ...) from chapter content
  // These are shown in the sidebar TOC grouping, so they shouldn't appear in page content
  return content.replace(/^# Part [IVX]+:.*$/gm, '').trim();
}

export function getEbookContent(): string {
  const ebookPath = path.join(process.cwd(), 'ebook', 'pivot-pyramid-ebook.md');
  const content = fs.readFileSync(ebookPath, 'utf-8');
  // First transform figure specs to standard markdown, then transform paths
  const withFigures = transformFigureSpecs(content);
  return transformFigurePaths(withFigures);
}

/**
 * Get raw ebook content without any transformations
 * Used by the generation script to find pending figures
 */
export function getRawEbookContent(): string {
  const ebookPath = path.join(process.cwd(), 'ebook', 'pivot-pyramid-ebook.md');
  return fs.readFileSync(ebookPath, 'utf-8');
}

/**
 * Get the path to the ebook file
 */
export function getEbookPath(): string {
  return path.join(process.cwd(), 'ebook', 'pivot-pyramid-ebook.md');
}

/**
 * Check if the ebook has any figures pending generation
 */
export function hasPendingFigures(): boolean {
  const content = getRawEbookContent();
  return checkPendingFigures(content);
}

/**
 * Re-export getPendingFigures for use in generation script
 */
export { getPendingFigures } from './ebook-figure-parser';

export function parseChapters(): Chapter[] {
  const content = getEbookContent();
  const chapters: Chapter[] = [];

  // Find all chapter/section positions
  const positions: { slug: string; type: Chapter['type']; start: number; pattern: RegExp }[] = [];

  for (const config of CHAPTER_CONFIG) {
    const match = content.match(config.pattern);
    if (match && match.index !== undefined) {
      positions.push({
        slug: config.slug,
        type: config.type,
        start: match.index,
        pattern: config.pattern,
      });
    }
  }

  // Sort by position in document
  positions.sort((a, b) => a.start - b.start);

  // Extract content for each chapter
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const nextStart = i < positions.length - 1 ? positions[i + 1].start : content.length;

    // Skip title page and TOC (toc is just used as a boundary marker)
    if (current.slug === 'title' || current.slug === 'toc') continue;

    let chapterContent = content.slice(current.start, nextStart).trim();
    // Strip Part headers from content (they're shown in sidebar grouping)
    chapterContent = stripPartHeaders(chapterContent);
    const title = extractTitle(chapterContent);

    chapters.push({
      slug: current.slug,
      title,
      content: chapterContent,
      part: getPartForChapter(current.slug),
      chapterNumber: getChapterNumber(current.slug),
      type: current.type,
    });
  }

  return chapters;
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  const chapters = parseChapters();
  return chapters.find(chapter => chapter.slug === slug);
}

export function getTableOfContents(): TableOfContentsItem[] {
  const chapters = parseChapters();
  return chapters.map(chapter => ({
    slug: chapter.slug,
    title: chapter.title,
    type: chapter.type,
    chapterNumber: chapter.chapterNumber,
    part: chapter.part,
  }));
}

export function getAdjacentChapters(currentSlug: string): {
  previous: TableOfContentsItem | null;
  next: TableOfContentsItem | null;
} {
  const toc = getTableOfContents();
  const currentIndex = toc.findIndex(item => item.slug === currentSlug);

  return {
    previous: currentIndex > 0 ? toc[currentIndex - 1] : null,
    next: currentIndex < toc.length - 1 ? toc[currentIndex + 1] : null,
  };
}

export function getAllChapterSlugs(): string[] {
  return parseChapters().map(chapter => chapter.slug);
}

// Group TOC items by part for display
export function getGroupedTableOfContents(): { part: string | null; items: TableOfContentsItem[] }[] {
  const toc = getTableOfContents();
  const groups: { part: string | null; items: TableOfContentsItem[] }[] = [];

  // First, add intro items (no part)
  const introItems = toc.filter(item => item.type === 'intro');
  if (introItems.length > 0) {
    groups.push({ part: null, items: introItems });
  }

  // Then add part-grouped items
  for (const partDef of PARTS) {
    const partItems = toc.filter(item => item.part === partDef.title);
    if (partItems.length > 0) {
      groups.push({ part: partDef.title, items: partItems });
    }
  }

  return groups;
}
