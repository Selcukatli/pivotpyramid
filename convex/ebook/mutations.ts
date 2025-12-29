import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Ebook Content Mutations
 *
 * Mutations for managing ebook content including drafts, parts, chapters, blocks, and figures.
 * These are designed to be used by AI agents for editing.
 */

// ===========================================
// DRAFT MUTATIONS
// ===========================================

export const createDraft = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("ebookDrafts"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // If publishing, unpublish all other drafts first
    if (args.isPublished) {
      const publishedDrafts = await ctx.db
        .query("ebookDrafts")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .collect();

      for (const draft of publishedDrafts) {
        await ctx.db.patch(draft._id, { isPublished: false, updatedAt: now });
      }
    }

    return await ctx.db.insert("ebookDrafts", {
      name: args.name,
      description: args.description,
      isPublished: args.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const publishDraft = mutation({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Unpublish all other drafts
    const publishedDrafts = await ctx.db
      .query("ebookDrafts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    for (const draft of publishedDrafts) {
      await ctx.db.patch(draft._id, { isPublished: false, updatedAt: now });
    }

    // Publish the target draft
    await ctx.db.patch(args.draftId, { isPublished: true, updatedAt: now });
  },
});

// ===========================================
// PART MUTATIONS
// ===========================================

export const createPart = mutation({
  args: {
    draftId: v.id("ebookDrafts"),
    title: v.string(),
    order: v.number(),
  },
  returns: v.id("ebookParts"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ebookParts", {
      draftId: args.draftId,
      title: args.title,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ===========================================
// CHAPTER MUTATIONS
// ===========================================

export const createChapter = mutation({
  args: {
    draftId: v.id("ebookDrafts"),
    partId: v.optional(v.id("ebookParts")),
    slug: v.string(),
    title: v.string(),
    type: v.union(v.literal("intro"), v.literal("chapter"), v.literal("appendix")),
    chapterNumber: v.optional(v.number()),
    order: v.number(),
  },
  returns: v.id("ebookChapters"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ebookChapters", {
      draftId: args.draftId,
      partId: args.partId,
      slug: args.slug,
      title: args.title,
      type: args.type,
      chapterNumber: args.chapterNumber,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateChapter = mutation({
  args: {
    chapterId: v.id("ebookChapters"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.slug !== undefined) updates.slug = args.slug;
    await ctx.db.patch(args.chapterId, updates);
  },
});

// ===========================================
// BLOCK MUTATIONS (for AI editing)
// ===========================================

export const insertBlock = mutation({
  args: {
    chapterId: v.id("ebookChapters"),
    type: v.union(
      v.literal("paragraph"),
      v.literal("heading2"),
      v.literal("heading3"),
      v.literal("heading4"),
      v.literal("blockquote"),
      v.literal("list"),
      v.literal("table"),
      v.literal("figure"),
      v.literal("code")
    ),
    content: v.string(),
    afterBlockId: v.optional(v.id("ebookBlocks")),
    figureId: v.optional(v.id("ebookFigures")),
    listType: v.optional(v.union(v.literal("bullet"), v.literal("numbered"))),
  },
  returns: v.id("ebookBlocks"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all blocks in chapter to determine order
    const blocks = await ctx.db
      .query("ebookBlocks")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", args.chapterId))
      .collect();

    let newOrder: number;

    if (args.afterBlockId) {
      // Find the block to insert after
      const afterBlock = blocks.find((b) => b._id === args.afterBlockId);
      if (!afterBlock) {
        throw new Error("Block to insert after not found");
      }

      // Calculate new order (midpoint between afterBlock and next block)
      const afterIndex = blocks.findIndex((b) => b._id === args.afterBlockId);
      const nextBlock = blocks[afterIndex + 1];

      if (nextBlock) {
        newOrder = (afterBlock.order + nextBlock.order) / 2;
      } else {
        newOrder = afterBlock.order + 1;
      }
    } else {
      // Insert at the end (append)
      const lastBlock = blocks[blocks.length - 1];
      newOrder = lastBlock ? lastBlock.order + 1 : 0;
    }

    return await ctx.db.insert("ebookBlocks", {
      chapterId: args.chapterId,
      type: args.type,
      content: args.content,
      figureId: args.figureId,
      listType: args.listType,
      order: newOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBlock = mutation({
  args: {
    blockId: v.id("ebookBlocks"),
    content: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("paragraph"),
        v.literal("heading2"),
        v.literal("heading3"),
        v.literal("heading4"),
        v.literal("blockquote"),
        v.literal("list"),
        v.literal("table"),
        v.literal("figure"),
        v.literal("code")
      )
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.content !== undefined) updates.content = args.content;
    if (args.type !== undefined) updates.type = args.type;
    await ctx.db.patch(args.blockId, updates);
  },
});

export const deleteBlock = mutation({
  args: {
    blockId: v.id("ebookBlocks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.blockId);
  },
});

export const moveBlock = mutation({
  args: {
    blockId: v.id("ebookBlocks"),
    afterBlockId: v.optional(v.id("ebookBlocks")),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db.get(args.blockId);
    if (!block) throw new Error("Block not found");

    const blocks = await ctx.db
      .query("ebookBlocks")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", block.chapterId))
      .collect();

    let newOrder: number;

    if (args.afterBlockId) {
      const afterBlock = blocks.find((b) => b._id === args.afterBlockId);
      if (!afterBlock) throw new Error("Target block not found");

      const afterIndex = blocks.findIndex((b) => b._id === args.afterBlockId);
      const nextBlock = blocks[afterIndex + 1];

      if (nextBlock && nextBlock._id !== args.blockId) {
        newOrder = (afterBlock.order + nextBlock.order) / 2;
      } else {
        newOrder = afterBlock.order + 1;
      }
    } else {
      const firstBlock = blocks[0];
      newOrder = firstBlock ? firstBlock.order - 1 : 0;
    }

    await ctx.db.patch(args.blockId, { order: newOrder, updatedAt: Date.now() });
  },
});

// Batch edit for AI agents - execute multiple operations atomically
export const batchEditBlocks = mutation({
  args: {
    operations: v.array(
      v.object({
        op: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
        blockId: v.optional(v.id("ebookBlocks")),
        chapterId: v.optional(v.id("ebookChapters")),
        type: v.optional(
          v.union(
            v.literal("paragraph"),
            v.literal("heading2"),
            v.literal("heading3"),
            v.literal("heading4"),
            v.literal("blockquote"),
            v.literal("list"),
            v.literal("table"),
            v.literal("figure"),
            v.literal("code")
          )
        ),
        content: v.optional(v.string()),
        afterBlockId: v.optional(v.id("ebookBlocks")),
        figureId: v.optional(v.id("ebookFigures")),
        listType: v.optional(v.union(v.literal("bullet"), v.literal("numbered"))),
      })
    ),
  },
  returns: v.array(v.union(v.id("ebookBlocks"), v.null())),
  handler: async (ctx, args) => {
    const results: (Id<"ebookBlocks"> | null)[] = [];
    const now = Date.now();

    for (const op of args.operations) {
      if (op.op === "insert") {
        if (!op.chapterId || !op.type || op.content === undefined) {
          results.push(null);
          continue;
        }

        const blocks = await ctx.db
          .query("ebookBlocks")
          .withIndex("by_chapter_order", (q) => q.eq("chapterId", op.chapterId!))
          .collect();

        let newOrder: number;
        if (op.afterBlockId) {
          const afterBlock = blocks.find((b) => b._id === op.afterBlockId);
          if (afterBlock) {
            const afterIndex = blocks.findIndex((b) => b._id === op.afterBlockId);
            const nextBlock = blocks[afterIndex + 1];
            newOrder = nextBlock
              ? (afterBlock.order + nextBlock.order) / 2
              : afterBlock.order + 1;
          } else {
            newOrder = blocks.length;
          }
        } else {
          const firstBlock = blocks[0];
          newOrder = firstBlock ? firstBlock.order - 1 : 0;
        }

        const id = await ctx.db.insert("ebookBlocks", {
          chapterId: op.chapterId,
          type: op.type,
          content: op.content,
          figureId: op.figureId,
          listType: op.listType,
          order: newOrder,
          createdAt: now,
          updatedAt: now,
        });
        results.push(id);
      } else if (op.op === "update") {
        if (!op.blockId) {
          results.push(null);
          continue;
        }
        const updates: Record<string, unknown> = { updatedAt: now };
        if (op.content !== undefined) updates.content = op.content;
        if (op.type !== undefined) updates.type = op.type;
        await ctx.db.patch(op.blockId, updates);
        results.push(op.blockId);
      } else if (op.op === "delete") {
        if (!op.blockId) {
          results.push(null);
          continue;
        }
        await ctx.db.delete(op.blockId);
        results.push(op.blockId);
      }
    }

    return results;
  },
});

// ===========================================
// FIGURE MUTATIONS
// ===========================================

export const createFigure = mutation({
  args: {
    draftId: v.id("ebookDrafts"),
    figureId: v.string(),
    storageId: v.id("_storage"),
    alt: v.string(),
    caption: v.optional(v.string()),
    prompt: v.optional(v.string()),
    enhancedPrompt: v.optional(v.string()),
    style: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  returns: v.id("ebookFigures"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ebookFigures", {
      draftId: args.draftId,
      figureId: args.figureId,
      storageId: args.storageId,
      alt: args.alt,
      caption: args.caption,
      prompt: args.prompt,
      enhancedPrompt: args.enhancedPrompt,
      style: args.style,
      width: args.width,
      height: args.height,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Clear all chapters, parts, and blocks from a draft (for reimport)
export const clearDraftContent = mutation({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    // Get all chapters in draft
    const chapters = await ctx.db
      .query("ebookChapters")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();

    // Delete all blocks for each chapter
    for (const chapter of chapters) {
      const blocks = await ctx.db
        .query("ebookBlocks")
        .withIndex("by_chapter_order", (q) => q.eq("chapterId", chapter._id))
        .collect();

      for (const block of blocks) {
        await ctx.db.delete(block._id);
      }

      // Delete the chapter
      await ctx.db.delete(chapter._id);
    }

    // Delete all parts
    const parts = await ctx.db
      .query("ebookParts")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();

    for (const part of parts) {
      await ctx.db.delete(part._id);
    }

    return {
      chaptersDeleted: chapters.length,
      partsDeleted: parts.length,
    };
  },
});

// Internal mutation for storing uploaded figure (called from actions.ts)
export const storeFigureFromUpload = internalMutation({
  args: {
    draftId: v.id("ebookDrafts"),
    figureId: v.string(),
    storageId: v.id("_storage"),
    alt: v.string(),
    caption: v.optional(v.string()),
  },
  returns: v.id("ebookFigures"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ebookFigures", {
      draftId: args.draftId,
      figureId: args.figureId,
      storageId: args.storageId,
      alt: args.alt,
      caption: args.caption,
      createdAt: now,
      updatedAt: now,
    });
  },
});
