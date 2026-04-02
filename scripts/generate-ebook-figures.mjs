#!/usr/bin/env node

/**
 * Generate Ebook Figures
 *
 * This script scans the ebook markdown for figure specs (```figure code fences)
 * without src paths, generates images via Fal AI with LLM-enhanced prompts,
 * downloads them, and updates the markdown with the src path.
 *
 * Figure Spec Syntax:
 *   ```figure
 *   id: my-diagram
 *   prompt: "Description of the figure"
 *   alt: Alt text for accessibility
 *   style: diagram|flowchart|matrix|canvas|conceptual
 *   aspect_ratio: 4:3
 *   resolution: 2K
 *   ```
 *   *Caption text*
 *
 * Usage:
 *   npm run ebook:generate-figures              # Generate pending figures
 *   npm run ebook:generate-figures -- --force   # Regenerate ALL figures
 *
 * How it works:
 *   1. Parses markdown for ```figure specs without src paths
 *   2. For each pending figure:
 *      - Calls Convex action which enhances prompt with style requirements via LLM
 *      - Generates image using Fal AI (nano-banana-pro)
 *      - Stores in Convex storage
 *   3. Downloads images to ebook/figures/optimized/
 *   4. Copies to public/ebook/figures/ for web serving
 *   5. Updates markdown with src: path (locks the figure)
 *
 * Prerequisites:
 *   - Convex dev server running (npx convex dev)
 *   - OPENROUTER_API_KEY set in Convex environment (for LLM prompt enhancement)
 *   - FAL_KEY set in Convex environment (for image generation)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, "..");

// Paths
const EBOOK_PATH = path.join(PROJECT_ROOT, "ebook", "pivot-pyramid-ebook.md");
const FIGURES_DIR = path.join(PROJECT_ROOT, "ebook", "figures", "optimized");
const PUBLIC_FIGURES_DIR = path.join(PROJECT_ROOT, "public", "ebook", "figures");

function log(message) {
  console.log(`[generate-figures] ${message}`);
}

function error(message) {
  console.error(`[generate-figures] ERROR: ${message}`);
}

/**
 * Parse figure specs from markdown content
 */
function extractFigureSpecs(markdown) {
  const figures = [];
  const figureRegex = /```figure\n([\s\S]*?)```/g;
  let match;

  while ((match = figureRegex.exec(markdown)) !== null) {
    const raw = match[0];
    const specContent = match[1];
    const startIndex = match.index;
    const endIndex = match.index + raw.length;

    const spec = {};
    const lines = specContent.trim().split("\n");

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes from value if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      spec[key] = value;
    }

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
  }

  return figures;
}

/**
 * Call Convex action to generate a figure
 */
async function generateFigure(spec) {
  const args = {
    prompt: spec.prompt,
    filename: `${spec.id}.png`,
    style: spec.style || "diagram",
    aspect_ratio: spec.aspect_ratio || "4:3",
    resolution: spec.resolution || "2K",
  };

  log(`Generating: ${spec.id}`);
  log(`  Prompt: ${spec.prompt.substring(0, 80)}...`);
  log(`  Style: ${args.style}`);

  try {
    const result = execSync(
      `npx convex run lib/fal/actions/generateEbookFigure:generateFigure '${JSON.stringify(args)}'`,
      {
        encoding: "utf-8",
        cwd: PROJECT_ROOT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    // Parse JSON result
    const parsed = JSON.parse(result.trim());

    if (!parsed.success) {
      throw new Error(parsed.error || "Unknown error");
    }

    return parsed;
  } catch (err) {
    error(`Failed to generate ${spec.id}: ${err.message}`);
    throw err;
  }
}

/**
 * Download image from URL to local file
 */
async function downloadImage(url, outputPath) {
  log(`Downloading to: ${outputPath}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  const sizeKB = (buffer.byteLength / 1024).toFixed(1);
  log(`  Downloaded: ${sizeKB} KB`);
}

/**
 * Update markdown with new src path for a figure
 */
function updateMarkdownSrc(markdown, figureId, srcPath) {
  const figures = extractFigureSpecs(markdown);
  const figure = figures.find((f) => f.spec.id === figureId);

  if (!figure) {
    throw new Error(`Figure not found: ${figureId}`);
  }

  const specContent = markdown.slice(figure.startIndex, figure.endIndex);

  let updatedSpec;
  if (figure.spec.src) {
    // Update existing src line
    updatedSpec = specContent.replace(/^src:.*$/m, `src: ${srcPath}`);
  } else {
    // Add new src line before the closing ```
    updatedSpec = specContent.replace(/```$/, `src: ${srcPath}\n\`\`\``);
  }

  return (
    markdown.slice(0, figure.startIndex) +
    updatedSpec +
    markdown.slice(figure.endIndex)
  );
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes("--force");

  log("Starting ebook figure generation...");
  log(`Ebook path: ${EBOOK_PATH}`);

  // Ensure directories exist
  if (!fs.existsSync(FIGURES_DIR)) {
    fs.mkdirSync(FIGURES_DIR, { recursive: true });
    log(`Created directory: ${FIGURES_DIR}`);
  }
  if (!fs.existsSync(PUBLIC_FIGURES_DIR)) {
    fs.mkdirSync(PUBLIC_FIGURES_DIR, { recursive: true });
    log(`Created directory: ${PUBLIC_FIGURES_DIR}`);
  }

  // Read markdown
  let markdown = fs.readFileSync(EBOOK_PATH, "utf-8");

  // Extract figure specs
  const allFigures = extractFigureSpecs(markdown);
  log(`Found ${allFigures.length} figure spec(s) in markdown`);

  // Filter to pending figures (or all if --force)
  const pendingFigures = forceAll
    ? allFigures
    : allFigures.filter((f) => !f.spec.src);

  if (pendingFigures.length === 0) {
    log("No figures to generate. All figures have src paths.");
    return;
  }

  log(`Generating ${pendingFigures.length} figure(s) in parallel...`);
  if (forceAll) {
    log("(--force flag: regenerating all figures)");
  }

  // Generate all figures in parallel
  const generationPromises = pendingFigures.map(async (figure) => {
    const { spec } = figure;

    if (!spec.id || !spec.prompt) {
      return { spec, success: false, error: "Missing id or prompt" };
    }

    try {
      log(`Starting: ${spec.id}`);
      const result = await generateFigure(spec);

      if (!result.storageUrl) {
        return { spec, success: false, error: "No storage URL returned" };
      }

      return { spec, success: true, result };
    } catch (err) {
      return { spec, success: false, error: err.message };
    }
  });

  const generationResults = await Promise.all(generationPromises);

  // Process results: download images and update markdown sequentially
  let successCount = 0;
  let errorCount = 0;

  for (const { spec, success, result, error: errMsg } of generationResults) {
    if (!success) {
      error(`Failed to generate ${spec.id}: ${errMsg}`);
      errorCount++;
      continue;
    }

    try {
      // Download to ebook/figures/optimized/
      const optimizedPath = path.join(FIGURES_DIR, `${spec.id}.png`);
      await downloadImage(result.storageUrl, optimizedPath);

      // Copy to public/ebook/figures/
      const publicPath = path.join(PUBLIC_FIGURES_DIR, `${spec.id}.png`);
      fs.copyFileSync(optimizedPath, publicPath);
      log(`  Copied to: ${publicPath}`);

      // Update markdown with src path
      const srcPath = `./figures/optimized/${spec.id}.png`;
      markdown = updateMarkdownSrc(markdown, spec.id, srcPath);

      log(`  Enhanced prompt: ${result.enhancedPrompt?.substring(0, 100)}...`);
      log(`Successfully generated: ${spec.id}`);
      successCount++;
    } catch (err) {
      error(`Failed to download/save ${spec.id}: ${err.message}`);
      errorCount++;
    }
  }

  // Write updated markdown
  fs.writeFileSync(EBOOK_PATH, markdown);
  log(`Updated markdown saved to: ${EBOOK_PATH}`);

  // Summary
  log("");
  log("=== Summary ===");
  log(`Total figures: ${allFigures.length}`);
  log(`Generated: ${successCount}`);
  log(`Errors: ${errorCount}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
