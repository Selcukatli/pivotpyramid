"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

/**
 * Ebook Actions
 *
 * Actions that need Node.js runtime (fetch, file operations, etc.)
 * These are separated from mutations because only actions can use "use node"
 */

// Action to upload a figure from URL (used by migration script)
export const uploadFigureFromUrl = action({
  args: {
    draftId: v.id("ebookDrafts"),
    figureId: v.string(),
    imageUrl: v.string(),
    alt: v.string(),
    caption: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    figureDocId: v.optional(v.id("ebookFigures")),
    storageId: v.optional(v.id("_storage")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    figureDocId?: Id<"ebookFigures">;
    storageId?: Id<"_storage">;
    error?: string;
  }> => {
    try {
      // Fetch the image
      const response = await fetch(args.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Store in Convex storage
      const storageId = await ctx.storage.store(blob);

      // Create the figure record
      const figureDocId: Id<"ebookFigures"> = await ctx.runMutation(
        internal.ebook.mutations.storeFigureFromUpload,
        {
          draftId: args.draftId,
          figureId: args.figureId,
          storageId,
          alt: args.alt,
          caption: args.caption,
        }
      );

      return {
        success: true,
        figureDocId,
        storageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// Action to upload figure from file bytes (for migration script reading local files)
export const uploadFigureFromBytes = action({
  args: {
    draftId: v.id("ebookDrafts"),
    figureId: v.string(),
    base64Data: v.string(),
    mimeType: v.string(),
    alt: v.string(),
    caption: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    figureDocId: v.optional(v.id("ebookFigures")),
    storageId: v.optional(v.id("_storage")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    figureDocId?: Id<"ebookFigures">;
    storageId?: Id<"_storage">;
    error?: string;
  }> => {
    try {
      // Convert base64 to blob
      const buffer = Buffer.from(args.base64Data, "base64");
      const blob = new Blob([buffer], { type: args.mimeType });

      // Store in Convex storage
      const storageId = await ctx.storage.store(blob);

      // Create the figure record
      const figureDocId: Id<"ebookFigures"> = await ctx.runMutation(
        internal.ebook.mutations.storeFigureFromUpload,
        {
          draftId: args.draftId,
          figureId: args.figureId,
          storageId,
          alt: args.alt,
          caption: args.caption,
        }
      );

      return {
        success: true,
        figureDocId,
        storageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
