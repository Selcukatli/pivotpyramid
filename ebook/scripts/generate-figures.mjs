#!/usr/bin/env node

/**
 * Generate ebook figures using Convex actions with FAL AI (Nano Banana Pro)
 *
 * UNIFIED ART STYLE: Corporate Isometric Infographic
 * - Clean isometric or 2.5D perspective
 * - Primary color: Amber gold (#F59E0B)
 * - Secondary: Navy blue (#1E3A5A), Teal (#0D9488)
 * - Flat design with subtle shadows and gradients
 * - Clean sans-serif typography (Inter/Helvetica style)
 * - White or light gray backgrounds
 * - Professional business aesthetic (McKinsey/HBR quality)
 *
 * Run with: node ebook/scripts/generate-figures.mjs
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIGURES_DIR = join(__dirname, "..", "figures");

// Ensure figures directory exists
if (!existsSync(FIGURES_DIR)) {
  mkdirSync(FIGURES_DIR, { recursive: true });
}

/**
 * UNIFIED ART STYLE - Appended to all prompts for consistency
 */
const UNIFIED_STYLE = `

Art Style Requirements (CRITICAL - follow exactly):
- Use a clean, modern corporate infographic style with subtle isometric perspective
- Color palette: Primary amber-gold (#F59E0B), secondary navy blue (#1E3A5A), accent teal (#0D9488), neutral warm grays
- Flat design aesthetic with subtle drop shadows and smooth gradients
- Clean sans-serif typography similar to Inter or Helvetica
- White or very light warm gray background (#FAFAF9)
- Professional business quality suitable for Harvard Business Review or McKinsey presentations
- No photorealistic elements - use clean vector-style illustrations
- Consistent visual weight and spacing throughout
- Subtle rounded corners on shapes (8-12px radius feel)
- No busy patterns or textures - keep it minimal and elegant`;

/**
 * Figure specifications with unified style
 */
const FIGURES = [
  // Chapter 1: Why Startups Fail
  {
    filename: "over-under-pivot.png",
    prompt: `Create a split-screen business infographic showing two contrasting startup failure modes.

LEFT SIDE - "THE OVER-PIVOT":
A chaotic scene with a startup pyramid breaking apart into multiple fragments. Show 3-4 scattered arrows pointing in different directions. A small founder figure looks overwhelmed, surrounded by question marks. The pyramid pieces are floating apart with motion lines.

RIGHT SIDE - "THE UNDER-PIVOT":
A founder figure is obsessively polishing or painting the top layer of a pyramid, completely ignoring that the foundation (bottom layer) has visible cracks and is crumbling. Show a magnifying glass focused on a tiny detail while the base falls apart.

Divide the image with a clean vertical line. Add clear labels "THE OVER-PIVOT" and "THE UNDER-PIVOT" at the top of each section.`,
    aspect_ratio: "16:9",
  },

  // Chapter 2: The Five Layers - Main Pyramid
  {
    filename: "pivot-pyramid-foundation.png",
    prompt: `Create a beautiful 3D isometric pyramid diagram showing the five layers of a startup, viewed from a slight angle to show depth.

The pyramid has five horizontal layers stacked from bottom to top:
1. BOTTOM (largest): "CUSTOMERS" - Deep navy blue (#1E3A5A) with small people icons
2. SECOND: "PROBLEM" - Teal (#0D9488) with question mark icon
3. MIDDLE: "SOLUTION" - Green (#10B981) with lightbulb icon
4. FOURTH: "TECHNOLOGY" - Amber (#F59E0B) with gear icon
5. TOP (smallest): "GROWTH" - Coral/red (#EF4444) with upward arrow icon

Each layer should be clearly separated with visible edges. Add subtle shadows between layers. Include clean white labels on each layer. The pyramid should float slightly above a subtle shadow on the ground.`,
    aspect_ratio: "4:3",
  },

  // Chapter 3: Cascade Diagrams - All with consistent style
  {
    filename: "cascade-customer-pivot.png",
    prompt: `Create an isometric pyramid diagram showing the cascade effect of a Customer pivot.

Show the five-layer pyramid with:
- BOTTOM "CUSTOMERS" layer: Glowing bright with a pulsing red/orange aura, showing it's the change point
- All four layers above (PROBLEM, SOLUTION, TECHNOLOGY, GROWTH): Connected by elegant curved arrows flowing upward from the Customer layer
- Each arrow should carry a small icon showing what changes

Add a label "BLAST RADIUS: 4 LAYERS" prominently. The visual should clearly communicate that changing the foundation affects everything above it.`,
    aspect_ratio: "4:3",
  },
  {
    filename: "cascade-problem-pivot.png",
    prompt: `Create an isometric pyramid diagram showing the cascade effect of a Problem pivot.

Show the five-layer pyramid with:
- BOTTOM "CUSTOMERS" layer: Stable green with a checkmark icon
- SECOND "PROBLEM" layer: Glowing with amber/orange aura as the change point
- Three layers above (SOLUTION, TECHNOLOGY, GROWTH): Connected by curved arrows from Problem
- No arrow to Customers - it stays stable

Add a label "BLAST RADIUS: 3 LAYERS". Show that Customer foundation remains solid while everything above Problem must adapt.`,
    aspect_ratio: "4:3",
  },
  {
    filename: "cascade-solution-pivot.png",
    prompt: `Create an isometric pyramid diagram showing the cascade effect of a Solution pivot.

Show the five-layer pyramid with:
- BOTTOM two layers (CUSTOMERS, PROBLEM): Stable green with checkmarks
- MIDDLE "SOLUTION" layer: Glowing amber as the change point
- Two layers above (TECHNOLOGY, GROWTH): Connected by curved arrows from Solution
- Bottom two layers have no arrows - they stay stable

Add a label "BLAST RADIUS: 2 LAYERS". This shows a more contained change.`,
    aspect_ratio: "4:3",
  },
  {
    filename: "cascade-technology-pivot.png",
    prompt: `Create an isometric pyramid diagram showing the cascade effect of a Technology pivot.

Show the five-layer pyramid with:
- BOTTOM three layers (CUSTOMERS, PROBLEM, SOLUTION): Stable green with checkmarks and shield icons
- FOURTH "TECHNOLOGY" layer: Glowing amber as the change point with gear icons
- Only TOP "GROWTH" layer connected by a single thin arrow
- Most of the pyramid remains stable

Add a label "BLAST RADIUS: 1 LAYER". This is the second-safest pivot type.`,
    aspect_ratio: "4:3",
  },
  {
    filename: "cascade-growth-pivot.png",
    prompt: `Create an isometric pyramid diagram showing a Growth pivot - the safest pivot type.

Show the five-layer pyramid with:
- ALL FOUR bottom layers (CUSTOMERS, PROBLEM, SOLUTION, TECHNOLOGY): Stable and confident in greens and blues with checkmark icons
- Only the TOP "GROWTH" layer: Glowing with golden/amber light, showing optimization icons like charts and channel symbols
- NO cascade arrows needed - nothing else changes
- Add subtle celebration elements like small sparkles around the Growth layer

Add a label "BLAST RADIUS: 0 LAYERS - SAFEST PIVOT". The mood should feel optimistic and low-risk.`,
    aspect_ratio: "4:3",
  },

  // Chapter 3: Cost Analysis
  {
    filename: "pivot-cost-curve.png",
    prompt: `Create an elegant line chart showing the inverse relationship between pivot layer and cost.

X-AXIS: Shows the five layers from left to right: Customer, Problem, Solution, Technology, Growth
Y-AXIS: Shows "PIVOT COST" from Low to High

Draw a smooth descending curve from high (at Customer) to low (at Growth). Mark each data point with a circle containing an icon:
- Customer point (highest): Dollar signs and clock icons
- Growth point (lowest): Thumbs up icon

Add annotations:
- Near the top: "Foundation changes = Rebuild everything"
- Near the bottom: "Top-layer changes = Minimal disruption"

Use a subtle gradient background from red (left/high cost) to green (right/low cost).`,
    aspect_ratio: "16:9",
  },

  // Chapter 4: Assessment Template (replaces ASCII)
  {
    filename: "pyramid-audit-template.png",
    prompt: `Create a professional worksheet/canvas template for auditing a startup's pyramid state.

Design a form layout with:
- Header: "PIVOT PYRAMID AUDIT" with company name and date fields
- Main section: An outline of the 5-layer pyramid with input areas next to each layer
- For each layer, show:
  - Layer name (Customers, Problem, Solution, Technology, Growth)
  - A text input area for "Current Hypothesis"
  - A confidence indicator (three circles: Low/Med/High)
  - Space for "Supporting Evidence"

- Footer section with:
  - "Lowest Confidence Layer: ___"
  - "Recommended Action: ___"

Make it look like a premium business canvas or strategic planning worksheet - something a top consultant would use. Use subtle grid lines and a cream/warm white background.`,
    aspect_ratio: "3:4",
  },

  // Chapter 4: Layer Documentation Template (replaces ASCII)
  {
    filename: "layer-documentation-card.png",
    prompt: `Create a single-layer documentation card template for detailed hypothesis tracking.

Design a card/form with these sections:
- Header with "LAYER: [Name]" in bold
- "HYPOTHESIS:" section with lined input area
- "EVIDENCE LEVEL:" with visual scale showing: Assumed → Anecdotal → Pattern → Quantified → Validated
- "SUPPORTING EVIDENCE:" with 3 bullet point lines
- "OPEN QUESTIONS:" with 2 bullet point lines
- "LAST VALIDATED:" date field at bottom

Use a clean card design with subtle amber accent color on the header. Include small icons next to each section header. Make it look like a Notion or Airtable card template.`,
    aspect_ratio: "4:5",
  },

  // Chapter 5: Diagnostic Flowchart
  {
    filename: "diagnostic-flowchart.png",
    prompt: `Create a vertical decision tree flowchart for diagnosing which pyramid layer is broken.

START NODE (top): "Is your startup growing as expected?" in a rounded rectangle

Flow downward through diamond decision nodes:
1. "Reaching right customers?" (navy blue) → No leads to "CHECK CUSTOMER LAYER"
2. "Problem urgent enough?" (teal) → No leads to "CHECK PROBLEM LAYER"
3. "Solution resonates?" (green) → No leads to "CHECK SOLUTION LAYER"
4. "Technology scaling?" (amber) → No leads to "CHECK TECHNOLOGY LAYER"
5. Final "Yes" leads to: "OPTIMIZE GROWTH" (green success box)

Use clean connector lines with arrows. Each "No" branch goes to a color-coded action box matching the layer color. The "Yes" path continues downward through all checks.`,
    aspect_ratio: "3:4",
  },

  // Chapter 6: Anti-Pivot Warnings
  {
    filename: "anti-pivot-warning.png",
    prompt: `Create a warning infographic showing three common premature pivot mistakes.

Use a vertical layout with three warning sections, each with an icon and description:

1. TOP - "THE IMPATIENT PIVOT"
   Icon: Clock showing only 2 weeks with X mark
   Brief text: "Not enough time to validate"

2. MIDDLE - "THE GRASS-IS-GREENER PIVOT"
   Icon: Figure looking over a fence at a seemingly perfect competitor garden
   Brief text: "Abandoning progress for unproven assumptions"

3. BOTTOM - "THE PRESSURE PIVOT"
   Icon: Figure being pushed by hands from outside (investors/board)
   Brief text: "External pressure without evidence"

Use warning colors (amber/orange) with cautionary styling. Add a red warning triangle icon at the top of the whole infographic.`,
    aspect_ratio: "4:3",
  },

  // Chapter 7: Planning Matrix
  {
    filename: "cost-impact-matrix.png",
    prompt: `Create a 2x2 strategic matrix for pivot decision-making.

X-AXIS: "EXPECTED IMPACT" from Low to High
Y-AXIS: "IMPLEMENTATION COST" from Low to High

Four quadrants with distinct colors and labels:
- BOTTOM-LEFT (green): "QUICK WINS" - small experiment icons
- BOTTOM-RIGHT (gold, highlighted): "STRATEGIC PRIORITIES" - star icon, this is the sweet spot
- TOP-LEFT (gray): "AVOID" - prohibition sign
- TOP-RIGHT (orange): "MAJOR PIVOTS" - warning icon, proceed carefully

Add small dots in each quadrant representing example pivot types. Include a legend showing what the dots mean. Add axis labels and clean grid lines.`,
    aspect_ratio: "4:3",
  },

  // Chapter 7: Pivot Planning Canvas (replaces ASCII)
  {
    filename: "pivot-planning-canvas.png",
    prompt: `Create a side-by-side planning template showing Current State vs Target State.

Design a two-column layout:

LEFT COLUMN - "CURRENT STATE":
- Show a pyramid outline with 5 layers
- Next to each layer, a text input field
- Use muted/gray styling to indicate "where we are now"

RIGHT COLUMN - "TARGET STATE":
- Show another pyramid outline
- Each layer has text input field
- Layers that change could be highlighted
- Use amber/gold styling to indicate "where we're going"

CENTER: A large arrow pointing from left to right

BOTTOM SECTION:
- "Layers Changing: ___"
- "Expected Cascade: ___"
- "Success Criteria: ___"

Make it look like a strategic planning worksheet with clean lines and professional formatting.`,
    aspect_ratio: "16:9",
  },

  // Chapter 8: Customer Pivot Playbook
  {
    filename: "customer-pivot-playbook.png",
    prompt: `Create a horizontal journey map showing the 5-step Customer pivot process.

Show 5 connected stages in a horizontal flow:

1. "IDENTIFY" - Magnifying glass over user persona icons
2. "VALIDATE" - Interview/conversation icons with checkmarks
3. "TEST PAYMENT" - Dollar sign with thumbs up/down
4. "REBUILD" - Pyramid being modified/reconstructed
5. "MIGRATE" - Forked path showing old vs new direction

Connect stages with flowing arrows. Add small time estimate badges under each step (e.g., "2-4 weeks"). Use a journey-map aesthetic with a subtle path/road metaphor.`,
    aspect_ratio: "16:9",
  },

  // Chapter 9: Solution Pivot Playbook
  {
    filename: "solution-pivot-playbook.png",
    prompt: `Create a transformation journey diagram for Solution pivots.

LEFT SIDE: "CURRENT SOLUTION" - Show version 1.0 product box in muted gray

CENTER: Four connected phases in a horizontal flow:
1. "HYPOTHESIS" - Lightbulb icon
2. "PROTOTYPE" - Wireframe/sketch icon
3. "TEST" - User feedback icon
4. "COMMIT" - Decision diamond

RIGHT SIDE: "NEW SOLUTION" - Version 2.0 product box in vibrant amber

BOTTOM: Show two stable foundation layers (Customer, Problem) as a solid base that doesn't change. Label them "VALIDATED FOUNDATION".`,
    aspect_ratio: "16:9",
  },

  // Chapter 10: Growth Channels
  {
    filename: "growth-channels-matrix.png",
    prompt: `Create a comparison matrix of startup growth channels.

Design a table-style visualization:

ROWS (channels): Content, Paid Ads, Viral/Referral, Direct Sales, Partnerships, SEO

COLUMNS:
- Cost to Test ($ symbols)
- Time to Results (clock icons)
- Scalability (chart icons)
- Best For (customer type)

Use color-coded cells from green (favorable) to red (challenging) to show relative performance for each factor.

Add small icons for each channel type. Include a "Channel Selection Guide" callout showing which channels work best for different pyramid configurations.`,
    aspect_ratio: "4:3",
  },

  // Chapter 11: Multi-Track Trap
  {
    filename: "multi-track-trap.png",
    prompt: `Create a warning illustration about the dangers of running multiple pivots simultaneously.

MAIN IMAGE: A stressed founder figure in the center, surrounded by 3-4 different incomplete pyramids. Show the founder's attention and resources splitting into thin, strained lines trying to reach all pyramids at once. Each pyramid is partially built and unstable.

INSET (bottom right corner): Show the correct approach - one solid, focused pyramid with all resources concentrated on it. Label it "FOCUSED APPROACH".

Add visual elements showing:
- Cognitive overload (thought bubbles with too many ideas)
- Resource fragmentation (splitting arrows)
- Incomplete execution (partial pyramids)

Use warning colors (reds, oranges) for the main chaotic scene, green for the focused inset.`,
    aspect_ratio: "4:3",
  },

  // Chapter 14: Toolkit Overview
  {
    filename: "toolkit-overview.png",
    prompt: `Create a visual dashboard showing all tools in the Pivot Pyramid Toolkit.

Design a grid layout with 6 tool cards:

1. "Pyramid Audit Canvas" - Small pyramid icon
2. "Layer Documentation" - Card/form icon
3. "Diagnostic Flowchart" - Decision tree icon
4. "Cost-Impact Matrix" - 2x2 grid icon
5. "Pivot Planning Template" - Side-by-side icon
6. "Interview Guides" - Conversation icon

Each card shows a thumbnail preview and brief description. Draw connecting arrows between the cards showing the recommended workflow sequence.

Highlight a "START HERE" badge on the Pyramid Audit Canvas. Use a clean dashboard aesthetic with subtle shadows on each card.`,
    aspect_ratio: "16:9",
  },

  // NEW: Pivot Assessment Canvas (replaces complex ASCII)
  {
    filename: "assessment-canvas-full.png",
    prompt: `Create a comprehensive one-page assessment canvas for the Pivot Pyramid.

Design a premium business worksheet with:

TOP: "PIVOT PYRAMID ASSESSMENT CANVAS" header with Company and Date fields

CENTER: Large isometric pyramid diagram with 5 layers. Next to each layer:
- Text input field for hypothesis
- Confidence meter (visual scale from Low to High)
- Evidence strength indicator

SIDEBAR:
- Evidence Level Legend (Assumed → Validated)
- Color key for confidence levels

BOTTOM:
- "Lowest Confidence Layer: ___"
- "Primary Concern: ___"
- "Recommended Action: ___"
- "Next Steps: ___"

Make this look like a premium $500 consulting deliverable - clean, professional, and comprehensive.`,
    aspect_ratio: "3:4",
  },
];

console.log("🎨 Generating ebook figures with Nano Banana Pro...\n");
console.log("🎯 UNIFIED STYLE: Corporate Isometric Infographic\n");
console.log(`📁 Output directory: ${FIGURES_DIR}\n`);
console.log(`📊 Generating ${FIGURES.length} figures in parallel...\n`);

/**
 * Execute a Convex action to generate a single figure
 */
function runConvexAction(figure) {
  return new Promise((resolve, reject) => {
    // Append unified style to all prompts
    const fullPrompt = figure.prompt + UNIFIED_STYLE;

    const args = JSON.stringify({
      prompt: fullPrompt,
      filename: figure.filename,
      aspect_ratio: figure.aspect_ratio || "4:3",
      resolution: "2K",
    });

    console.log(`🚀 Starting: ${figure.filename}`);

    const command = `npx convex run lib/fal/actions/generateEbookFigure:generateFigure '${args.replace(/'/g, "'\\''")}'`;

    const child = spawn("sh", ["-c", command], {
      cwd: join(__dirname, "..", ".."),
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      try {
        const jsonMatch = stdout.match(/\{[^{}]*"success"[^{}]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          if (result.success && result.storageUrl) {
            console.log(`✅ Generated: ${figure.filename}`);
            resolve({
              success: true,
              filename: figure.filename,
              storageUrl: result.storageUrl,
            });
            return;
          } else if (!result.success) {
            console.error(`❌ Failed: ${figure.filename} - ${result.error || "Unknown error"}`);
            resolve({ success: false, filename: figure.filename, error: result.error });
            return;
          }
        }
      } catch (e) {
        // JSON parse failed
      }

      const urlMarker = "🔗 URL: ";
      const markerIndex = stderr.indexOf(urlMarker);

      if (markerIndex !== -1) {
        const urlStart = markerIndex + urlMarker.length;
        const afterMarker = stderr.substring(urlStart);
        let endIndex = afterMarker.indexOf("\n");
        if (endIndex === -1) endIndex = afterMarker.indexOf("'");
        const storageUrl = endIndex !== -1
          ? afterMarker.substring(0, endIndex).trim()
          : afterMarker.trim();

        if (storageUrl.startsWith("https://")) {
          console.log(`✅ Generated: ${figure.filename}`);
          resolve({
            success: true,
            filename: figure.filename,
            storageUrl,
          });
          return;
        }
      }

      if (stderr.includes("❌") || code !== 0) {
        const errorMatch = stderr.match(/Error[^:]*:\s*([^\n]+)/);
        const errorMsg = errorMatch ? errorMatch[1] : stderr.substring(0, 200) || "Unknown error";
        console.error(`❌ Failed: ${figure.filename} - ${errorMsg}`);
        resolve({ success: false, filename: figure.filename, error: errorMsg });
        return;
      }

      console.log(`⚠️ No URL found for ${figure.filename}`);
      resolve({ success: false, filename: figure.filename, error: "No storage URL in output" });
    });
  });
}

/**
 * Download image from URL and save to file
 */
async function downloadImage(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const filePath = join(FIGURES_DIR, filename);
  writeFileSync(filePath, Buffer.from(buffer));
  return buffer.byteLength;
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  const results = await Promise.allSettled(
    FIGURES.map((figure) => runConvexAction(figure))
  );

  const successful = [];
  const failed = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success) {
      successful.push(result.value);
    } else if (result.status === "fulfilled") {
      failed.push(result.value);
    } else {
      failed.push({ filename: "unknown", error: result.reason?.message });
    }
  }

  if (successful.length > 0) {
    console.log(`\n📥 Downloading ${successful.length} images from Convex storage...\n`);

    for (const item of successful) {
      try {
        const bytes = await downloadImage(item.storageUrl, item.filename);
        console.log(`💾 Saved: ${item.filename} (${(bytes / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.error(`❌ Download failed: ${item.filename} - ${err.message}`);
        failed.push({ filename: item.filename, error: err.message });
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(50));

  if (failed.length === 0) {
    console.log(`✅ Complete! Generated ${successful.length}/${FIGURES.length} figures in ${elapsed}s`);
  } else {
    console.log(`⚠️ Completed with errors: ${successful.length}/${FIGURES.length} succeeded in ${elapsed}s`);
    console.log(`\n⚠️ Failed (${failed.length}):`);
    for (const f of failed) {
      console.log(`  - ${f.filename}: ${f.error}`);
    }
  }

  console.log(`📁 Images saved to: ${FIGURES_DIR}`);
  console.log("=".repeat(50));

  console.log("\n📝 Markdown image references:\n");
  for (const figure of FIGURES) {
    console.log(`![${figure.filename.replace(".png", "")}](./figures/${figure.filename})`);
  }
}

main().catch(console.error);
