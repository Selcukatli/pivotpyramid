"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { NanoBananaClient } from "../clients/image/nanoBananaClient";

/**
 * Test Nano Banana Pro text-to-image generation
 *
 * Usage:
 * npx convex run lib/fal/test/testNanoBanana:testNanoBananaPro
 * npx convex run lib/fal/test/testNanoBanana:testNanoBananaPro '{"prompt": "A pyramid diagram"}'
 */

export const testNanoBananaPro = action({
  args: {
    prompt: v.optional(v.string()),
    aspect_ratio: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    console.log("🍌 Testing Nano Banana Pro (Gemini 3.0 Flash)...");

    const prompt = args.prompt || "A beautiful pyramid diagram with five layers, professional infographic style";

    try {
      const result = await NanoBananaClient.generateImage({
        prompt,
        aspect_ratio: (args.aspect_ratio as "1:1" | "16:9" | "4:3") || "1:1",
        resolution: "1K",
        num_images: 1,
        sync_mode: true,
      });

      if (result?.images?.[0]?.url) {
        console.log("✅ Success!");
        console.log(`📎 Image URL: ${result.images[0].url}`);
        console.log(`📝 Description: ${result.description}`);
        return {
          success: true,
          imageUrl: result.images[0].url,
          description: result.description,
        };
      } else {
        console.log("❌ No image in result");
        return {
          success: false,
          error: "No image returned",
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Error:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
