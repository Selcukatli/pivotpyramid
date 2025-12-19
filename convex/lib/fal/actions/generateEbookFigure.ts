"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { NanoBananaClient } from "../clients/image/nanoBananaClient";

/**
 * Generate an ebook figure using Nano Banana Pro and store in Convex storage
 * Returns a clean HTTP URL for easy downloading
 *
 * Pattern from minimoji:
 * 1. Generate with FAL AI
 * 2. Download/decode the image
 * 3. Store in Convex storage
 * 4. Return Convex storage URL
 *
 * Usage:
 * npx convex run lib/fal/actions/generateEbookFigure:generateFigure '{"prompt": "...", "filename": "pyramid.png"}'
 */
export const generateFigure = action({
  args: {
    prompt: v.string(),
    filename: v.string(),
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
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    console.log(`📸 Generating figure: ${args.filename}`);
    console.log(`📝 Prompt: ${args.prompt.substring(0, 100)}...`);

    try {
      // Step 1: Generate image with FAL AI
      const result = await NanoBananaClient.generateImage({
        prompt: args.prompt,
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
 * Alternative to parallel external calls if needed
 */
export const generateMultipleFigures = action({
  args: {
    figures: v.array(
      v.object({
        prompt: v.string(),
        filename: v.string(),
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
      error: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    console.log(`📸 Generating ${args.figures.length} figures...`);

    const results = [];

    for (const fig of args.figures) {
      console.log(`\n📸 Processing: ${fig.filename}`);

      try {
        const result = await NanoBananaClient.generateImage({
          prompt: fig.prompt,
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

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Generated ${successCount}/${args.figures.length} figures`);

    return results;
  },
});
