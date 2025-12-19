"use node";

import { callFalModel } from "../falClient";
import { logger } from "../../../logger";

const logInfo = (...args: unknown[]) => logger.info(...args);
const logError = (...args: unknown[]) => logger.error(...args);

// Nano Banana Pro (Gemini 3.0 Flash) - Text to Image
export interface NanoBananaProInput {
  prompt: string;
  aspect_ratio?: "21:9" | "16:9" | "3:2" | "4:3" | "5:4" | "1:1" | "4:5" | "3:4" | "2:3" | "9:16";
  num_images?: number;
  resolution?: "1K" | "2K" | "4K";
  output_format?: "jpeg" | "png" | "webp";
  sync_mode?: boolean;
  enable_web_search?: boolean;
  limit_generations?: boolean;
}

// Nano Banana Pro Edit - Image to Image
export interface NanoBananaProEditInput extends Omit<NanoBananaProInput, "aspect_ratio"> {
  image_urls: string[];
  aspect_ratio?: "auto" | "21:9" | "16:9" | "3:2" | "4:3" | "5:4" | "1:1" | "4:5" | "3:4" | "2:3" | "9:16";
}

export interface NanoBananaProOutput {
  images: Array<{
    url: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
    width?: number;
    height?: number;
  }>;
  description: string;
}

export class NanoBananaClient {
  static readonly MODEL = "fal-ai/nano-banana-pro";
  static readonly EDIT_MODEL = "fal-ai/nano-banana-pro/edit";

  /**
   * Generate images using Nano Banana Pro (Gemini 3.0 Flash)
   * Supports up to 4K resolution and web search for latest information
   */
  static async generateImage(
    input: NanoBananaProInput
  ): Promise<NanoBananaProOutput> {
    logInfo(`Generating image with Nano Banana Pro (Gemini 3.0 Flash)`);
    logInfo(`Nano Banana Pro Parameters:`, {
      num_images: input.num_images || 1,
      aspect_ratio: input.aspect_ratio || "1:1",
      resolution: input.resolution || "1K",
      output_format: input.output_format || "png",
      enable_web_search: input.enable_web_search || false,
      sync_mode: input.sync_mode || false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(
        this.MODEL,
        input as unknown as Record<string, unknown>
      );

      logInfo(`Success! Got result from ${this.MODEL}`);
      return result as NanoBananaProOutput;
    } catch (error) {
      logError(`Error with Nano Banana Pro generation:`, error);
      throw error;
    }
  }

  /**
   * Edit images using Nano Banana Pro Edit (Gemini 3.0 Flash)
   * Supports multiple input images for editing/composition
   */
  static async editImage(
    input: NanoBananaProEditInput
  ): Promise<NanoBananaProOutput> {
    logInfo(`Editing image with Nano Banana Pro Edit (Gemini 3.0 Flash)`);
    logInfo(`Nano Banana Pro Edit Parameters:`, {
      num_images: input.num_images || 1,
      aspect_ratio: input.aspect_ratio || "auto",
      resolution: input.resolution || "1K",
      output_format: input.output_format || "png",
      enable_web_search: input.enable_web_search || false,
      image_count: input.image_urls.length,
      sync_mode: input.sync_mode || false,
    });

    try {
      logInfo(`Calling fal.ai model: ${this.EDIT_MODEL}`);
      logInfo(`Input:`, input);

      const result = await callFalModel(
        this.EDIT_MODEL,
        input as unknown as Record<string, unknown>
      );

      logInfo(`Success! Got result from ${this.EDIT_MODEL}`);
      return result as NanoBananaProOutput;
    } catch (error) {
      logError(`Error with Nano Banana Pro edit:`, error);
      throw error;
    }
  }
}
