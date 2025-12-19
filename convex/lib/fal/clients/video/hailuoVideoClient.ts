"use node";

import { callFalModel } from "../falClient";
import {
  FalVideoResponse,
  FalVideo,
  FalResponse,
  FalContentPolicyError,
} from "../../types";
import { FAL_VIDEO_MODELS, VIDEO_SPEEDS } from "./videoModels";

/**
 * Parameters for Hailuo 2.3 Fast Standard Image-to-Video generation
 */
export interface HailuoImageToVideoParams {
  prompt: string; // Max 2000 characters
  image_url: string; // Required - source image
  duration?: "6" | "10"; // Duration in seconds (as string), default "6"
  aspect_ratio?: "16:9" | "9:16" | "1:1"; // Aspect ratio, default "1:1"
  prompt_optimizer?: boolean; // Whether to use prompt optimizer, default true
}

/**
 * Generate a video using Minimax Hailuo 2.3 Fast Standard (FAST & ECONOMICAL)
 *
 * @param params - Image-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing:
 * - 6 seconds: $0.19
 * - 10 seconds: $0.32
 *
 * Resolution: 512p (economical quality)
 * Speed: Blazing fast (~15-30s typical generation time)
 *
 * @example
 * const result = await generateHailuoImageToVideo({
 *   prompt: "Extremely realistic movement. An old samurai is breaking a stone in half",
 *   image_url: "https://example.com/samurai.jpg",
 *   duration: "6",
 *   aspect_ratio: "1:1"
 * });
 */
export async function generateHailuoImageToVideo(
  params: HailuoImageToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate prompt length
    if (params.prompt.length > 2000) {
      throw new Error("Prompt exceeds maximum length of 2000 characters");
    }

    // Validate required image URL
    if (!params.image_url) {
      throw new Error("Image URL is required for Hailuo video generation");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      image_url: params.image_url,
      duration: params.duration || "6",
      aspect_ratio: params.aspect_ratio || "1:1", // Default to square format
      prompt_optimizer: params.prompt_optimizer !== false, // Default true
    };

    const durationNum = parseInt(input.duration);
    const estimatedCost = durationNum === 6 ? "0.19" : "0.32";

    console.log(`🎬 Generating video with Hailuo 2.3 Fast Standard (economical)...`);
    console.log(`🖼️  Source image: ${params.image_url}`);
    console.log(`⏱️  Duration: ${durationNum}s`);
    console.log(`💸 Estimated cost: $${estimatedCost}`);

    // Calculate model-specific timeout: Hailuo can take longer during high load
    // Set to 5 minutes to handle peak times and complex generations
    const timeoutMs = 5 * 60 * 1000; // 300 seconds
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.HAILUO_IMAGE_TO_VIDEO,
      input,
      apiKey,
      timeoutMs
    );

    if (!result) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: "Failed to generate video - no result returned",
        },
      };
    }

    // Return successful response
    return {
      success: true,
      data: {
        video: result.video,
        prompt: params.prompt,
      },
    };
  } catch (error) {
    console.error("❌ Error in generateHailuoImageToVideo:", error);

    // Handle specific error types
    if (error instanceof FalContentPolicyError) {
      return {
        success: false,
        error: {
          type: "content_policy_violation",
          message: error.message,
          rejectedPrompt: error.rejectedPrompt,
          suggestion:
            "Try modifying your prompt to avoid potentially sensitive content",
          helpUrl: error.url,
        },
      };
    }

    // Generic error response
    return {
      success: false,
      error: {
        type: "api_error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}

/**
 * Parameters for Hailuo 2.3 Standard Text-to-Video generation
 */
export interface HailuoTextToVideoParams {
  prompt: string; // Max 2000 characters
  duration?: "6" | "10"; // Duration in seconds (as string), default "6"
  prompt_optimizer?: boolean; // Whether to use prompt optimizer, default true
}

/**
 * Generate a video using Minimax Hailuo 2.3 Standard Text-to-Video
 *
 * @param params - Text-to-video generation parameters
 * @param apiKey - Optional FAL API key (uses env var if not provided)
 * @returns FalResponse with generated video or error
 *
 * Pricing:
 * - 6 seconds: $0.28
 * - 10 seconds: $0.56
 *
 * Resolution: 512p (economical quality)
 * Speed: Fast (~15-30s typical generation time)
 *
 * @example
 * const result = await generateHailuoTextToVideo({
 *   prompt: "A samurai breaking a stone in half with extreme realistic movement",
 *   duration: "6"
 * });
 */
export async function generateHailuoTextToVideo(
  params: HailuoTextToVideoParams,
  apiKey?: string,
): Promise<FalResponse<FalVideoResponse>> {
  try {
    // Validate prompt length
    if (params.prompt.length > 2000) {
      throw new Error("Prompt exceeds maximum length of 2000 characters");
    }

    // Prepare input for FAL API
    const input = {
      prompt: params.prompt,
      duration: params.duration || "6",
      prompt_optimizer: params.prompt_optimizer !== false, // Default true
    };

    const durationNum = parseInt(input.duration);
    const estimatedCost = durationNum === 6 ? "0.28" : "0.56";

    console.log(`🎬 Generating video with Hailuo 2.3 Standard Text-to-Video (economical)...`);
    console.log(`📝 Prompt: ${params.prompt}`);
    console.log(`⏱️  Duration: ${durationNum}s`);
    console.log(`💸 Estimated cost: $${estimatedCost}`);

    // Calculate model-specific timeout: Hailuo can take longer during high load
    // Set to 5 minutes to handle peak times and complex generations
    const timeoutMs = 5 * 60 * 1000; // 300 seconds
    console.log(`⏰ Timeout: ${timeoutMs / 1000}s`);

    // Call the FAL model with timeout
    const result = await callFalModel<typeof input, { video: FalVideo }>(
      FAL_VIDEO_MODELS.HAILUO_TEXT_TO_VIDEO,
      input,
      apiKey,
      timeoutMs
    );

    if (!result) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: "Failed to generate video - no result returned",
        },
      };
    }

    // Return successful response
    return {
      success: true,
      data: {
        video: result.video,
        prompt: params.prompt,
      },
    };
  } catch (error) {
    console.error("❌ Error in generateHailuoTextToVideo:", error);

    // Handle specific error types
    if (error instanceof FalContentPolicyError) {
      return {
        success: false,
        error: {
          type: "content_policy_violation",
          message: error.message,
          rejectedPrompt: error.rejectedPrompt,
          suggestion:
            "Try modifying your prompt to avoid potentially sensitive content",
          helpUrl: error.url,
        },
      };
    }

    // Generic error response
    return {
      success: false,
      error: {
        type: "api_error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}

