#!/usr/bin/env node

/**
 * Import Ebook Content to Convex
 *
 * This script:
 * 1. Uses an existing draft (or creates one if needed)
 * 2. Parses the ebook markdown into parts, chapters, and blocks
 * 3. Creates all the necessary records in Convex
 *
 * IMPORTANT: Run migrate-figures-to-convex.mjs first to upload figures!
 *
 * Usage:
 *   npm run ebook:import-content
 *   # or with custom draft name:
 *   npm run ebook:import-content -- --draft "v2"
 */

import { ConvexHttpClient } from "convex/browser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL environment variable is required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Chapter configuration (same as ebook-parser.ts)
const CHAPTER_CONFIG = [
  { pattern: /^# The Pivot Pyramid$/m, slug: "title", type: "intro" },
  { pattern: /^# Why I Wrote This Book$/m, slug: "foreword", type: "intro" },
  { pattern: /^# Table of Contents$/m, slug: "toc", type: "intro" },
  { pattern: /^## Chapter 1:/m, slug: "chapter-1", type: "chapter" },
  { pattern: /^## Chapter 2:/m, slug: "chapter-2", type: "chapter" },
  { pattern: /^## Chapter 3:/m, slug: "chapter-3", type: "chapter" },
  { pattern: /^## Chapter 4:/m, slug: "chapter-4", type: "chapter" },
  { pattern: /^## Chapter 5:/m, slug: "chapter-5", type: "chapter" },
  { pattern: /^## Chapter 6:/m, slug: "chapter-6", type: "chapter" },
  { pattern: /^## Chapter 7:/m, slug: "chapter-7", type: "chapter" },
  { pattern: /^## Chapter 8:/m, slug: "chapter-8", type: "chapter" },
  { pattern: /^## Chapter 9:/m, slug: "chapter-9", type: "chapter" },
  { pattern: /^## Chapter 10:/m, slug: "chapter-10", type: "chapter" },
  { pattern: /^## Chapter 11:/m, slug: "chapter-11", type: "chapter" },
  { pattern: /^## Chapter 12:/m, slug: "chapter-12", type: "chapter" },
  { pattern: /^## Chapter 13:/m, slug: "chapter-13", type: "chapter" },
  { pattern: /^## Chapter 14:/m, slug: "chapter-14", type: "chapter" },
  { pattern: /^## Appendix A:/m, slug: "appendix-a", type: "appendix" },
  { pattern: /^## Appendix B:/m, slug: "appendix-b", type: "appendix" },
  { pattern: /^## Appendix C:/m, slug: "appendix-c", type: "appendix" },
];

// Part definitions
const PARTS = [
  { title: "Part I: The Framework", chapters: ["chapter-1", "chapter-2", "chapter-3"] },
  { title: "Part II: Diagnosis", chapters: ["chapter-4", "chapter-5", "chapter-6"] },
  { title: "Part III: Execution", chapters: ["chapter-7", "chapter-8", "chapter-9", "chapter-10"] },
  { title: "Part IV: Advanced Topics", chapters: ["chapter-11", "chapter-12", "chapter-13"] },
  { title: "Part V: Tools and Resources", chapters: ["chapter-14", "appendix-a", "appendix-b", "appendix-c"] },
];

function getPartForChapter(slug) {
  for (const part of PARTS) {
    if (part.chapters.includes(slug)) {
      return part.title;
    }
  }
  return null;
}

function extractTitle(content) {
  const match = content.match(/^#+ (.+)$/m);
  if (match) {
    return match[1].replace(/^(Chapter \d+|Appendix [A-C]): /, "");
  }
  return "Untitled";
}

function getChapterNumber(slug) {
  const match = slug.match(/chapter-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function stripPartHeaders(content) {
  return content.replace(/^# Part [IVX]+:.*$/gm, "").trim();
}

/**
 * Parse markdown content into blocks
 */
function parseContentIntoBlocks(content) {
  const blocks = [];
  const lines = content.split("\n");
  let currentBlock = null;
  let inCodeBlock = false;
  let inTable = false;
  let inList = false;
  let listType = null;

  function pushCurrentBlock() {
    if (currentBlock && currentBlock.content.trim()) {
      blocks.push({
        type: currentBlock.type,
        content: currentBlock.content.trim(),
        listType: currentBlock.listType,
      });
    }
    currentBlock = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        currentBlock.content += "\n" + line;
        pushCurrentBlock();
        inCodeBlock = false;
      } else {
        // Start of code block
        pushCurrentBlock();
        inCodeBlock = true;
        currentBlock = { type: "code", content: line };
      }
      continue;
    }

    if (inCodeBlock) {
      currentBlock.content += "\n" + line;
      continue;
    }

    // Handle figure blocks (```figure ... ```)
    if (trimmedLine.startsWith("```figure")) {
      pushCurrentBlock();
      let figureContent = line;
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        figureContent += "\n" + lines[i];
        i++;
      }
      if (i < lines.length) {
        figureContent += "\n" + lines[i]; // closing ```
      }
      blocks.push({ type: "figure", content: figureContent });
      continue;
    }

    // Handle tables
    if (trimmedLine.startsWith("|") || (inTable && trimmedLine.includes("|"))) {
      if (!inTable) {
        pushCurrentBlock();
        inTable = true;
        currentBlock = { type: "table", content: line };
      } else {
        currentBlock.content += "\n" + line;
      }
      continue;
    } else if (inTable) {
      pushCurrentBlock();
      inTable = false;
    }

    // Handle empty lines
    if (trimmedLine === "") {
      if (inList) {
        pushCurrentBlock();
        inList = false;
        listType = null;
      } else if (currentBlock && currentBlock.type === "paragraph") {
        pushCurrentBlock();
      }
      continue;
    }

    // Handle headings
    if (trimmedLine.startsWith("####")) {
      pushCurrentBlock();
      blocks.push({ type: "heading4", content: trimmedLine.replace(/^####\s*/, "") });
      continue;
    }
    if (trimmedLine.startsWith("###")) {
      pushCurrentBlock();
      blocks.push({ type: "heading3", content: trimmedLine.replace(/^###\s*/, "") });
      continue;
    }
    if (trimmedLine.startsWith("##")) {
      pushCurrentBlock();
      blocks.push({ type: "heading2", content: trimmedLine.replace(/^##\s*/, "") });
      continue;
    }

    // Handle blockquotes
    if (trimmedLine.startsWith(">")) {
      if (!currentBlock || currentBlock.type !== "blockquote") {
        pushCurrentBlock();
        currentBlock = { type: "blockquote", content: trimmedLine.replace(/^>\s*/, "") };
      } else {
        currentBlock.content += "\n" + trimmedLine.replace(/^>\s*/, "");
      }
      continue;
    }

    // Handle lists
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.*)$/);
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.*)$/);

    if (bulletMatch) {
      if (!inList || listType !== "bullet") {
        pushCurrentBlock();
        inList = true;
        listType = "bullet";
        currentBlock = { type: "list", listType: "bullet", content: line };
      } else {
        currentBlock.content += "\n" + line;
      }
      continue;
    }

    if (numberedMatch) {
      if (!inList || listType !== "numbered") {
        pushCurrentBlock();
        inList = true;
        listType = "numbered";
        currentBlock = { type: "list", listType: "numbered", content: line };
      } else {
        currentBlock.content += "\n" + line;
      }
      continue;
    }

    // Handle images (convert to figure blocks)
    const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      pushCurrentBlock();
      const [, alt, src] = imageMatch;
      // Extract figureId from path
      const figureIdMatch = src.match(/([^/]+)\.png$/);
      const figureId = figureIdMatch ? figureIdMatch[1] : null;
      blocks.push({
        type: "figure",
        content: trimmedLine,
        figureId,
        alt,
        src,
      });
      continue;
    }

    // Handle continuation of list items (indented lines)
    if (inList && line.match(/^\s+/) && trimmedLine) {
      currentBlock.content += "\n" + line;
      continue;
    }

    // Regular paragraph
    if (inList) {
      pushCurrentBlock();
      inList = false;
      listType = null;
    }

    if (!currentBlock || currentBlock.type !== "paragraph") {
      pushCurrentBlock();
      currentBlock = { type: "paragraph", content: trimmedLine };
    } else {
      currentBlock.content += " " + trimmedLine;
    }
  }

  // Push final block
  pushCurrentBlock();

  return blocks;
}

/**
 * Parse chapters from ebook markdown
 */
function parseChapters(content) {
  const chapters = [];
  const positions = [];

  for (const config of CHAPTER_CONFIG) {
    const match = content.match(config.pattern);
    if (match && match.index !== undefined) {
      positions.push({
        slug: config.slug,
        type: config.type,
        start: match.index,
      });
    }
  }

  positions.sort((a, b) => a.start - b.start);

  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const nextStart = i < positions.length - 1 ? positions[i + 1].start : content.length;

    // Skip title page and TOC
    if (current.slug === "title" || current.slug === "toc") continue;

    let chapterContent = content.slice(current.start, nextStart).trim();
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

async function getOrCreateDraft(draftName) {
  const drafts = await client.query("ebook/queries:listDrafts", {});
  const existingDraft = drafts.find((d) => d.name === draftName);

  if (existingDraft) {
    console.log(`Found existing draft: "${draftName}" (${existingDraft._id})`);
    return existingDraft._id;
  }

  console.log(`Creating new draft: "${draftName}"`);
  const draftId = await client.mutation("ebook/mutations:createDraft", {
    name: draftName,
    description: "Main ebook content imported from markdown",
    isPublished: true,
  });
  console.log(`Created draft: ${draftId}`);
  return draftId;
}

async function createParts(draftId) {
  console.log("\nCreating parts...");
  const partIds = {};

  for (let i = 0; i < PARTS.length; i++) {
    const part = PARTS[i];
    console.log(`  Creating ${part.title}...`);
    const partId = await client.mutation("ebook/mutations:createPart", {
      draftId,
      title: part.title,
      order: i,
    });
    partIds[part.title] = partId;
    console.log(`  ✓ Created ${part.title}`);
  }

  return partIds;
}

async function createChapterWithBlocks(draftId, chapter, partId, order, figureMap) {
  console.log(`  Creating chapter: ${chapter.slug} (${chapter.title})...`);

  // Create chapter
  const chapterId = await client.mutation("ebook/mutations:createChapter", {
    draftId,
    partId: partId || undefined,
    slug: chapter.slug,
    title: chapter.title,
    type: chapter.type,
    chapterNumber: chapter.chapterNumber || undefined,
    order,
  });

  // Parse content into blocks
  const parsedBlocks = parseContentIntoBlocks(chapter.content);
  console.log(`    Parsed ${parsedBlocks.length} blocks`);

  // Create blocks
  let blockOrder = 0;
  for (const block of parsedBlocks) {
    let figureId = undefined;

    // If it's a figure block, try to find the figure in Convex
    if (block.type === "figure" && block.figureId) {
      const figure = figureMap.get(block.figureId);
      if (figure) {
        figureId = figure._id;
      }
    }

    await client.mutation("ebook/mutations:insertBlock", {
      chapterId,
      type: block.type,
      content: block.content,
      figureId,
      listType: block.listType || undefined,
      afterBlockId: undefined, // Insert at end
    });

    blockOrder++;
  }

  console.log(`    ✓ Created ${parsedBlocks.length} blocks`);
  return chapterId;
}

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  let draftName = "main";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--draft" && args[i + 1]) {
      draftName = args[i + 1];
      i++;
    }
  }

  console.log("\n=== Ebook Content Import ===\n");
  console.log(`Convex URL: ${CONVEX_URL}`);
  console.log(`Draft name: ${draftName}`);

  // Read ebook content
  const ebookPath = path.join(__dirname, "..", "ebook", "pivot-pyramid-ebook.md");
  const content = fs.readFileSync(ebookPath, "utf-8");
  console.log(`\nRead ebook: ${ebookPath}`);

  // Get or create draft
  const draftId = await getOrCreateDraft(draftName);

  // Check if draft already has chapters
  const existingChapters = await client.query("ebook/queries:getChapters", { draftId });
  if (existingChapters.length > 0) {
    console.log(`\n⚠️  Draft "${draftName}" already has ${existingChapters.length} chapters.`);
    console.log("   Skipping import to avoid duplicates.");
    console.log("   To reimport, create a new draft with --draft flag.");
    process.exit(0);
  }

  // Get existing figures for linking
  const figures = await client.query("ebook/queries:getFigures", { draftId });
  const figureMap = new Map(figures.map((f) => [f.figureId, f]));
  console.log(`\nFound ${figures.length} figures in draft`);

  // Create parts
  const partIds = await createParts(draftId);

  // Parse chapters
  const chapters = parseChapters(content);
  console.log(`\nParsed ${chapters.length} chapters`);

  // Create chapters and blocks
  console.log("\nImporting chapters...");
  let chapterOrder = 0;

  for (const chapter of chapters) {
    const partId = chapter.part ? partIds[chapter.part] : null;
    await createChapterWithBlocks(draftId, chapter, partId, chapterOrder, figureMap);
    chapterOrder++;
  }

  console.log("\n=== Import Complete ===\n");
  console.log(`Chapters imported: ${chapters.length}`);
  console.log(`Parts created: ${PARTS.length}`);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
