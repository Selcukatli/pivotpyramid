import { query } from "../_generated/server";
import { v } from "convex/values";
import { checkEbookEditAccess } from "./auth";

/**
 * Ebook Content Queries
 *
 * Queries for reading ebook content from Convex.
 * Used by the frontend to render chapters and by AI agents to understand context.
 */

// ===========================================
// DRAFT QUERIES
// ===========================================

export const getPublishedDraft = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("ebookDrafts"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      isPublished: v.boolean(),
      createdById: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query("ebookDrafts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    return drafts[0] ?? null;
  },
});

// Check if current user can edit a specific draft
export const canEditDraft = query({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const result = await checkEbookEditAccess(ctx, args.draftId);
    return result.canEdit;
  },
});

// Check if current user can edit the published draft
export const canEditPublishedDraft = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query("ebookDrafts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const draft = drafts[0];
    if (!draft) return false;

    const result = await checkEbookEditAccess(ctx, draft._id);
    return result.canEdit;
  },
});

export const getDraft = query({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.draftId);
  },
});

export const listDrafts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ebookDrafts").collect();
  },
});

// ===========================================
// PART QUERIES
// ===========================================

export const getParts = query({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ebookParts")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();
  },
});

// ===========================================
// CHAPTER QUERIES
// ===========================================

export const getChapters = query({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ebookChapters")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();
  },
});

export const getChapterBySlug = query({
  args: {
    draftId: v.id("ebookDrafts"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("ebookChapters")
      .withIndex("by_draft_slug", (q) =>
        q.eq("draftId", args.draftId).eq("slug", args.slug)
      )
      .collect();

    return chapters[0] ?? null;
  },
});

export const getChaptersByPart = query({
  args: {
    partId: v.id("ebookParts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ebookChapters")
      .withIndex("by_part", (q) => q.eq("partId", args.partId))
      .collect();
  },
});

// ===========================================
// BLOCK QUERIES
// ===========================================

export const getChapterBlocks = query({
  args: {
    chapterId: v.id("ebookChapters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ebookBlocks")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", args.chapterId))
      .collect();
  },
});

// Get chapter with all its blocks (for rendering)
export const getChapterWithBlocks = query({
  args: {
    draftId: v.id("ebookDrafts"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // Get chapter
    const chapters = await ctx.db
      .query("ebookChapters")
      .withIndex("by_draft_slug", (q) =>
        q.eq("draftId", args.draftId).eq("slug", args.slug)
      )
      .collect();

    const chapter = chapters[0];
    if (!chapter) return null;

    // Get blocks
    const blocks = await ctx.db
      .query("ebookBlocks")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", chapter._id))
      .collect();

    // Get figures referenced by blocks
    const figureIds = blocks
      .filter((b) => b.figureId)
      .map((b) => b.figureId!);

    const figures = await Promise.all(
      figureIds.map((id) => ctx.db.get(id))
    );

    // Get figure URLs from storage
    const figuresWithUrls = await Promise.all(
      figures.filter(Boolean).map(async (figure) => {
        if (!figure) return null;
        const url = await ctx.storage.getUrl(figure.storageId);
        return { ...figure, url };
      })
    );

    return {
      chapter,
      blocks,
      figures: figuresWithUrls.filter(Boolean),
    };
  },
});

// ===========================================
// FIGURE QUERIES
// ===========================================

export const getFigures = query({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    const figures = await ctx.db
      .query("ebookFigures")
      .withIndex("by_draft", (q) => q.eq("draftId", args.draftId))
      .collect();

    // Add URLs
    return await Promise.all(
      figures.map(async (figure) => {
        const url = await ctx.storage.getUrl(figure.storageId);
        return { ...figure, url };
      })
    );
  },
});

export const getFigureByFigureId = query({
  args: {
    draftId: v.id("ebookDrafts"),
    figureId: v.string(),
  },
  handler: async (ctx, args) => {
    const figures = await ctx.db
      .query("ebookFigures")
      .withIndex("by_draft_figure_id", (q) =>
        q.eq("draftId", args.draftId).eq("figureId", args.figureId)
      )
      .collect();

    const figure = figures[0];
    if (!figure) return null;

    const url = await ctx.storage.getUrl(figure.storageId);
    return { ...figure, url };
  },
});

// ===========================================
// TABLE OF CONTENTS QUERY
// ===========================================

export const getTableOfContents = query({
  args: {
    draftId: v.id("ebookDrafts"),
  },
  handler: async (ctx, args) => {
    // Get all parts
    const parts = await ctx.db
      .query("ebookParts")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();

    // Get all chapters
    const chapters = await ctx.db
      .query("ebookChapters")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();

    // Group chapters by part
    const groups: {
      part: { _id: string; title: string; order: number } | null;
      chapters: typeof chapters;
    }[] = [];

    // First add intro chapters (no part)
    const introChapters = chapters.filter((c) => !c.partId);
    if (introChapters.length > 0) {
      groups.push({ part: null, chapters: introChapters });
    }

    // Then add part-grouped chapters
    for (const part of parts) {
      const partChapters = chapters.filter(
        (c) => c.partId === part._id
      );
      if (partChapters.length > 0) {
        groups.push({
          part: { _id: part._id, title: part.title, order: part.order },
          chapters: partChapters,
        });
      }
    }

    return groups;
  },
});

// ===========================================
// ADJACENT CHAPTERS (for navigation)
// ===========================================

export const getAdjacentChapters = query({
  args: {
    draftId: v.id("ebookDrafts"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("ebookChapters")
      .withIndex("by_draft_order", (q) => q.eq("draftId", args.draftId))
      .collect();

    const currentIndex = chapters.findIndex((c) => c.slug === args.slug);

    return {
      previous: currentIndex > 0 ? chapters[currentIndex - 1] : null,
      next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
    };
  },
});
