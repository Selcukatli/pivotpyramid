#!/usr/bin/env node

/**
 * Migrate Ebook Figures to Convex Storage
 *
 * This script:
 * 1. Creates a "main" draft if it doesn't exist
 * 2. Reads all PNG files from ebook/figures/optimized/
 * 3. Uploads each to Convex storage
 * 4. Creates ebookFigures records with metadata
 *
 * Usage:
 *   npm run ebook:migrate-figures
 *   # or with custom draft name:
 *   npm run ebook:migrate-figures -- --draft "v2"
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
  console.error("Make sure you have a .env.local file with NEXT_PUBLIC_CONVEX_URL set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Figure metadata - alt text based on filename
const FIGURE_METADATA = {
  "anti-pivot-warning": {
    alt: "Anti-Pivot Warning Signs",
    caption: "Warning signs that indicate a pivot may not be the right choice",
  },
  "assessment-canvas-full": {
    alt: "Pivot Pyramid Assessment Canvas",
    caption: "Complete assessment canvas for evaluating your startup's pyramid layers",
  },
  "cascade-customer-pivot": {
    alt: "Customer Pivot Cascade Effect",
    caption: "How a customer pivot affects all layers of the pyramid",
  },
  "cascade-growth-pivot": {
    alt: "Growth Pivot Cascade Effect",
    caption: "How a growth pivot affects the pyramid layers",
  },
  "cascade-problem-pivot": {
    alt: "Problem Pivot Cascade Effect",
    caption: "How a problem pivot cascades through the layers",
  },
  "cascade-solution-pivot": {
    alt: "Solution Pivot Cascade Effect",
    caption: "How a solution pivot impacts other layers",
  },
  "cascade-technology-pivot": {
    alt: "Technology Pivot Cascade Effect",
    caption: "How a technology pivot affects the pyramid",
  },
  "cost-impact-matrix": {
    alt: "Pivot Cost-Impact Matrix",
    caption: "Matrix showing the cost and impact of different pivot types",
  },
  "customer-pivot-playbook": {
    alt: "Customer Pivot Playbook",
    caption: "Step-by-step guide for executing a customer pivot",
  },
  "diagnostic-flowchart": {
    alt: "Pivot Diagnostic Flowchart",
    caption: "Flowchart to help diagnose which pivot type you need",
  },
  "growth-channels-matrix": {
    alt: "Growth Channels Matrix",
    caption: "Matrix of growth channels and their characteristics",
  },
  "layer-documentation-card": {
    alt: "Layer Documentation Card",
    caption: "Template for documenting each layer of your pyramid",
  },
  "multi-track-trap": {
    alt: "Multi-Track Trap Warning",
    caption: "The dangers of pursuing multiple pivots simultaneously",
  },
  "over-under-pivot": {
    alt: "Over-Pivot vs Under-Pivot",
    caption: "Understanding the spectrum between over-pivoting and under-pivoting",
  },
  "pivot-cost-curve": {
    alt: "Pivot Cost Curve",
    caption: "How pivot costs change as you move down the pyramid",
  },
  "pivot-planning-canvas": {
    alt: "Pivot Planning Canvas",
    caption: "Canvas for planning and executing your pivot strategy",
  },
  "pivot-pyramid-foundation": {
    alt: "The Pivot Pyramid Foundation",
    caption: "The five layers of the Pivot Pyramid framework",
  },
  "pyramid-audit-template": {
    alt: "Pyramid Audit Template",
    caption: "Template for auditing your current pyramid state",
  },
  "solution-pivot-playbook": {
    alt: "Solution Pivot Playbook",
    caption: "Step-by-step guide for executing a solution pivot",
  },
  "toolkit-overview": {
    alt: "Pivot Pyramid Toolkit Overview",
    caption: "Overview of all tools in the Pivot Pyramid toolkit",
  },
  // Test figure (skip this one)
  "test-pyramid-diagram": {
    skip: true,
  },
};

async function getOrCreateDraft(draftName) {
  // Check for existing drafts
  const drafts = await client.query("ebook/queries:listDrafts", {});

  // Find existing draft with this name
  const existingDraft = drafts.find((d) => d.name === draftName);
  if (existingDraft) {
    console.log(`Found existing draft: "${draftName}" (${existingDraft._id})`);
    return existingDraft._id;
  }

  // Create new draft
  console.log(`Creating new draft: "${draftName}"`);
  const draftId = await client.mutation("ebook/mutations:createDraft", {
    name: draftName,
    description: "Main ebook content imported from markdown",
    isPublished: true,
  });
  console.log(`Created draft: ${draftId}`);
  return draftId;
}

async function uploadFigure(draftId, figureId, filePath, metadata) {
  console.log(`  Uploading ${figureId}...`);

  // Read file as base64
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  // Upload to Convex
  const result = await client.action("ebook/actions:uploadFigureFromBytes", {
    draftId,
    figureId,
    base64Data,
    mimeType: "image/png",
    alt: metadata.alt,
    caption: metadata.caption,
  });

  if (result.success) {
    console.log(`  ✓ Uploaded ${figureId} (storageId: ${result.storageId})`);
    return result;
  } else {
    console.error(`  ✗ Failed to upload ${figureId}: ${result.error}`);
    return result;
  }
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

  console.log("\n=== Ebook Figure Migration ===\n");
  console.log(`Convex URL: ${CONVEX_URL}`);
  console.log(`Draft name: ${draftName}`);

  // Get or create draft
  const draftId = await getOrCreateDraft(draftName);

  // Check existing figures
  const existingFigures = await client.query("ebook/queries:getFigures", {
    draftId,
  });
  const existingFigureIds = new Set(existingFigures.map((f) => f.figureId));
  console.log(`\nExisting figures in draft: ${existingFigures.length}`);

  // Find figure files
  const figuresDir = path.join(__dirname, "..", "ebook", "figures", "optimized");

  if (!fs.existsSync(figuresDir)) {
    console.error(`Figures directory not found: ${figuresDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(figuresDir).filter((f) => f.endsWith(".png"));
  console.log(`Found ${files.length} PNG files in ${figuresDir}\n`);

  // Upload each figure
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const figureId = file.replace(".png", "");
    const metadata = FIGURE_METADATA[figureId];

    // Skip test figures
    if (metadata?.skip) {
      console.log(`Skipping test figure: ${figureId}`);
      skipped++;
      continue;
    }

    // Skip if already exists
    if (existingFigureIds.has(figureId)) {
      console.log(`Skipping existing figure: ${figureId}`);
      skipped++;
      continue;
    }

    // Get metadata (or use defaults)
    const meta = metadata || {
      alt: figureId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      caption: undefined,
    };

    const filePath = path.join(figuresDir, file);
    const result = await uploadFigure(draftId, figureId, filePath, meta);

    if (result.success) {
      uploaded++;
    } else {
      errors++;
    }
  }

  console.log("\n=== Migration Complete ===\n");
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
