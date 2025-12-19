"use node";

import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";

/**
 * Public test action for FAL image generation
 *
 * Usage:
 * npx convex run lib/fal/test/testPublic:quickTest
 * npx convex run lib/fal/test/testPublic:testModel '{"model": "fal-ai/flux/schnell"}'
 */

type TestResult = {
  success: boolean;
  imageUrl?: string;
  model?: string;
  preference?: string;
  error?: string;
};

/**
 * Quick test using the fastest/cheapest model (FLUX Schnell)
 * Cost: ~$0.003
 */
export const quickTest = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    imageUrl: v.optional(v.string()),
    model: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx): Promise<TestResult> => {
    console.log("🎨 Running quick FAL test with FLUX Schnell...");

    const result = await ctx.runAction(
      internal.lib.fal.falImageActions.generateImage,
      {
        prompt: "A simple blue circle on white background",
        model: "fal-ai/flux/schnell",
      }
    );

    if (result.success && result.images?.[0]?.url) {
      console.log("✅ Success!");
      console.log(`📎 Image URL: ${result.images[0].url}`);
      return {
        success: true,
        imageUrl: result.images[0].url,
        model: result.model,
      };
    } else {
      console.log("❌ Failed:", result.error);
      return {
        success: false,
        error: result.error,
      };
    }
  },
});

/**
 * Test a specific model by FAL model ID
 */
export const testModel = action({
  args: {
    model: v.string(),
    prompt: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    imageUrl: v.optional(v.string()),
    model: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { model, prompt }): Promise<TestResult> => {
    console.log(`🎨 Testing model: ${model}`);

    const result = await ctx.runAction(
      internal.lib.fal.falImageActions.generateImage,
      {
        prompt: prompt || "A beautiful sunset over mountains",
        model,
      }
    );

    if (result.success && result.images?.[0]?.url) {
      console.log("✅ Success!");
      console.log(`📎 Image URL: ${result.images[0].url}`);
      return {
        success: true,
        imageUrl: result.images[0].url,
        model: result.model,
      };
    } else {
      console.log("❌ Failed:", result.error);
      return {
        success: false,
        error: result.error,
      };
    }
  },
});

/**
 * Test with preference tier (quality/default/fast)
 */
export const testPreference = action({
  args: {
    preference: v.union(v.literal("quality"), v.literal("default"), v.literal("fast")),
    prompt: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    imageUrl: v.optional(v.string()),
    model: v.optional(v.string()),
    preference: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { preference, prompt }): Promise<TestResult> => {
    console.log(`🎨 Testing ${preference} preference tier...`);

    const result = await ctx.runAction(
      internal.lib.fal.falImageActions.generateImage,
      {
        prompt: prompt || "A serene mountain landscape at golden hour",
        preference,
      }
    );

    if (result.success && result.images?.[0]?.url) {
      console.log("✅ Success!");
      console.log(`📎 Model used: ${result.model}`);
      console.log(`📎 Image URL: ${result.images[0].url}`);
      return {
        success: true,
        imageUrl: result.images[0].url,
        model: result.model,
        preference,
      };
    } else {
      console.log("❌ Failed:", result.error);
      return {
        success: false,
        error: result.error,
        preference,
      };
    }
  },
});
