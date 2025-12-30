"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { NanoBananaClient } from "../clients/image/nanoBananaClient";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

/**
 * Style presets for ebook figures
 * Each preset defines visual requirements for consistent branding
 *
 * Visual identity based on existing figures:
 * - 3D isometric perspective with depth and polish
 * - Color palette: dark teal/navy (#1e3a5f), amber/gold (#f59e0b), muted teal-greens, warm stone neutrals
 * - Glossy, polished look with gradients and subtle lighting
 * - Clean light gray/off-white backgrounds
 * - Professional business illustration style
 */
const STYLE_PRESETS = {
  diagram: {
    description: "Technical diagram or framework visualization (like the Pivot Pyramid)",
    requirements:
      "3D isometric perspective with depth and polish, glossy surfaces with subtle gradients and lighting effects, color palette of dark teal/navy (#1e3a5f), amber/gold (#f59e0b), muted teal-greens, and warm stone neutrals, clean light gray or off-white background, professional business illustration style, small iconic symbols or figures for visual interest, subtle drop shadows and reflections, high-quality polished render",
  },
  flowchart: {
    description: "Process flow or decision tree",
    requirements:
      "3D isometric flowchart with depth, rounded rectangular boxes with glossy surfaces, color palette of dark teal/navy (#1e3a5f) for boxes, amber/gold (#f59e0b) for highlights and decision points, muted teal-green for positive paths, directional arrows with depth, clean light gray background, professional business style, subtle shadows and gradients, polished render quality",
  },
  matrix: {
    description: "Grid or comparison matrix",
    requirements:
      "3D isometric grid/matrix with depth and perspective, glossy cell surfaces with rounded corners, color palette of dark teal/navy (#1e3a5f), amber/gold (#f59e0b), muted teal-greens, and warm stone neutrals, alternating subtle gradients, clean light gray background, professional business illustration, small icons in cells for visual interest, polished render with subtle shadows",
  },
  canvas: {
    description: "Worksheet or planning canvas",
    requirements:
      "3D isometric worksheet template with depth, glossy section panels with rounded corners, color palette of dark teal/navy (#1e3a5f), amber/gold (#f59e0b) for headers and accents, muted teal-greens, clean light gray background, professional business style, subtle shadows and lighting effects, high-quality polished render",
  },
  conceptual: {
    description: "Abstract concept illustration",
    requirements:
      "3D isometric conceptual illustration with depth and polish, metaphorical visual representation, color palette of dark teal/navy (#1e3a5f), amber/gold (#f59e0b), muted teal-greens, and warm stone neutrals, glossy surfaces with gradients and lighting, clean light gray or off-white background, professional business illustration style, small human figures or icons for scale, subtle reflections and shadows, high-quality polished render",
  },
} as const;

type StylePreset = keyof typeof STYLE_PRESETS;

/**
 * Enhance a user prompt with style-specific requirements using LLM
 */
async function enhancePrompt(
  userPrompt: string,
  style: StylePreset
): Promise<string> {
  const preset = STYLE_PRESETS[style];

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const result = await generateText({
    model: openrouter.chat("google/gemini-2.5-flash"),
    prompt: `You are enhancing an image generation prompt for a professional business ebook figure.

Original prompt: "${userPrompt}"

Style: ${style} - ${preset.description}

Style requirements: ${preset.requirements}

Create an enhanced prompt that:
1. Preserves the user's intent and core concept
2. Incorporates ALL the style requirements listed above
3. Is specific and detailed for image generation
4. Ensures the result will be professional, on-brand, and suitable for a business ebook
5. Keeps the image simple and clean - avoid cluttered or overly complex designs

Return ONLY the enhanced prompt, no explanation or additional text.`,
  });

  return result.text.trim();
}

/**
 * Generate an ebook figure using Nano Banana Pro and store in Convex storage
 * Returns a clean HTTP URL for easy downloading
 *
 * Pattern from minimoji:
 * 1. Enhance prompt with style requirements (via LLM)
 * 2. Generate with FAL AI
 * 3. Download/decode the image
 * 4. Store in Convex storage
 * 5. Return Convex storage URL
 *
 * Usage:
 * npx convex run lib/fal/actions/generateEbookFigure:generateFigure '{"prompt": "...", "filename": "pyramid.png", "style": "diagram"}'
 */
export const generateFigure = action({
  args: {
    prompt: v.string(),
    filename: v.string(),
    style: v.optional(
      v.union(
        v.literal("diagram"),
        v.literal("flowchart"),
        v.literal("matrix"),
        v.literal("canvas"),
        v.literal("conceptual")
      )
    ),
    aspect_ratio: v.optional(
      v.union(
        v.literal("21:9"),
        v.literal("16:9"),
        v.literal("4:3"),
        v.literal("3:2"),
        v.literal("5:4"),
        v.literal("1:1"),
        v.literal("4:5"),
        v.literal("3:4"),
        v.literal("2:3"),
        v.literal("9:16")
      )
    ),
    resolution: v.optional(v.union(v.literal("1K"), v.literal("2K"), v.literal("4K"))),
  },
  returns: v.object({
    success: v.boolean(),
    filename: v.string(),
    storageUrl: v.optional(v.string()),
    storageId: v.optional(v.string()),
    width: v.optional(v.union(v.number(), v.null())),
    height: v.optional(v.union(v.number(), v.null())),
    description: v.optional(v.string()),
    originalPrompt: v.optional(v.string()),
    enhancedPrompt: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    console.log(`📸 Generating figure: ${args.filename}`);
    console.log(`📝 Original prompt: ${args.prompt.substring(0, 100)}...`);

    try {
      // Step 1: Enhance prompt with style requirements
      const style = args.style || "diagram";
      console.log(`🎨 Style: ${style}`);

      const enhancedPrompt = await enhancePrompt(args.prompt, style);
      console.log(`✨ Enhanced prompt: ${enhancedPrompt.substring(0, 150)}...`);

      // Step 2: Generate image with FAL AI
      const result = await NanoBananaClient.generateImage({
        prompt: enhancedPrompt,
        aspect_ratio: args.aspect_ratio || "4:3",
        resolution: args.resolution || "2K",
        num_images: 1,
        sync_mode: true,
        output_format: "png",
      });

      if (!result?.images?.[0]?.url) {
        console.log(`❌ No image in result for ${args.filename}`);
        return {
          success: false,
          filename: args.filename,
          error: "No image returned from model",
        };
      }

      const image = result.images[0];
      const imageUrl = image.url;
      console.log(`✅ Image generated, processing...`);

      // Step 2: Convert to blob (handle both base64 and HTTP URLs)
      let blob: Blob;

      if (imageUrl.startsWith("data:")) {
        // Base64 data URL - decode it
        const base64Match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!base64Match) {
          throw new Error("Invalid base64 data URL format");
        }
        const mimeType = base64Match[1];
        const base64Data = base64Match[2];

        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: mimeType });
        console.log(`📦 Decoded base64 image: ${(blob.size / 1024).toFixed(1)} KB`);
      } else {
        // HTTP URL - fetch it
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }
        blob = await response.blob();
        console.log(`📦 Downloaded image: ${(blob.size / 1024).toFixed(1)} KB`);
      }

      // Step 3: Store in Convex storage
      const storageId = await ctx.storage.store(blob);
      console.log(`💾 Stored in Convex: ${storageId}`);

      // Step 4: Get public URL
      const storageUrl = await ctx.storage.getUrl(storageId);
      if (!storageUrl) {
        throw new Error("Failed to get storage URL");
      }

      console.log(`✅ Generated: ${args.filename}`);
      console.log(`🔗 URL: ${storageUrl}`);

      return {
        success: true,
        filename: args.filename,
        storageUrl,
        storageId: storageId.toString(),
        width: image.width,
        height: image.height,
        description: result.description,
        originalPrompt: args.prompt,
        enhancedPrompt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error generating ${args.filename}:`, errorMessage);
      return {
        success: false,
        filename: args.filename,
        error: errorMessage,
      };
    }
  },
});

/**
 * Generate multiple figures in a single action (sequential within action)
 * Each figure can have its own style for prompt enhancement
 */
export const generateMultipleFigures = action({
  args: {
    figures: v.array(
      v.object({
        prompt: v.string(),
        filename: v.string(),
        style: v.optional(v.string()),
        aspect_ratio: v.optional(v.string()),
        resolution: v.optional(v.string()),
      })
    ),
  },
  returns: v.array(
    v.object({
      success: v.boolean(),
      filename: v.string(),
      imageUrl: v.optional(v.string()),
      width: v.optional(v.union(v.number(), v.null())),
      height: v.optional(v.union(v.number(), v.null())),
      description: v.optional(v.string()),
      originalPrompt: v.optional(v.string()),
      enhancedPrompt: v.optional(v.string()),
      error: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    console.log(`📸 Generating ${args.figures.length} figures...`);

    const results = [];

    for (const fig of args.figures) {
      console.log(`\n📸 Processing: ${fig.filename}`);

      try {
        // Enhance prompt with style requirements
        const style = (fig.style as StylePreset) || "diagram";
        console.log(`🎨 Style: ${style}`);

        const enhancedPrompt = await enhancePrompt(fig.prompt, style);
        console.log(`✨ Enhanced: ${enhancedPrompt.substring(0, 100)}...`);

        const result = await NanoBananaClient.generateImage({
          prompt: enhancedPrompt,
          aspect_ratio: (fig.aspect_ratio as "4:3" | "16:9" | "1:1") || "4:3",
          resolution: (fig.resolution as "1K" | "2K" | "4K") || "2K",
          num_images: 1,
          sync_mode: true,
          output_format: "png",
        });

        if (result?.images?.[0]?.url) {
          const image = result.images[0];
          console.log(`✅ Generated: ${fig.filename}`);

          results.push({
            success: true,
            filename: fig.filename,
            imageUrl: image.url,
            width: image.width,
            height: image.height,
            description: result.description,
            originalPrompt: fig.prompt,
            enhancedPrompt,
          });
        } else {
          results.push({
            success: false,
            filename: fig.filename,
            error: "No image returned",
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error: ${errorMessage}`);
        results.push({
          success: false,
          filename: fig.filename,
          error: errorMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`\n✅ Generated ${successCount}/${args.figures.length} figures`);

    return results;
  },
});
