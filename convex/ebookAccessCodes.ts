import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./adminAuth";

/**
 * List all access codes (admin only)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const codes = await ctx.db.query("ebookAccessCodes").order("desc").collect();

    return codes.map((code) => ({
      _id: code._id,
      code: code.code,
      description: code.description,
      maxUses: code.maxUses,
      usedCount: code.usedCount,
      isActive: code.isActive,
      createdAt: code.createdAt,
      expiresAt: code.expiresAt,
    }));
  },
});

/**
 * Create a new access code (admin only)
 */
export const create = mutation({
  args: {
    code: v.string(),
    description: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { code, description, maxUses, expiresAt }) => {
    await requireAdmin(ctx);

    // Check if code already exists
    const existing = await ctx.db
      .query("ebookAccessCodes")
      .withIndex("by_code", (q) => q.eq("code", code.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Access code already exists");
    }

    const id = await ctx.db.insert("ebookAccessCodes", {
      code: code.toLowerCase(),
      description,
      maxUses,
      usedCount: 0,
      isActive: true,
      createdAt: Date.now(),
      expiresAt,
    });

    return id;
  },
});

/**
 * Update an access code (admin only)
 */
export const update = mutation({
  args: {
    id: v.id("ebookAccessCodes"),
    description: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, description, maxUses, isActive, expiresAt }) => {
    await requireAdmin(ctx);

    const updates: Record<string, unknown> = {};
    if (description !== undefined) updates.description = description;
    if (maxUses !== undefined) updates.maxUses = maxUses;
    if (isActive !== undefined) updates.isActive = isActive;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt;

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Delete an access code (admin only)
 */
export const remove = mutation({
  args: {
    id: v.id("ebookAccessCodes"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    // Delete all redemptions for this code first
    const redemptions = await ctx.db
      .query("ebookCodeRedemptions")
      .withIndex("by_code", (q) => q.eq("codeId", id))
      .collect();

    for (const redemption of redemptions) {
      await ctx.db.delete(redemption._id);
    }

    // Delete the code
    await ctx.db.delete(id);
    return true;
  },
});

/**
 * Get redemptions for a specific code (admin only)
 */
export const getRedemptions = query({
  args: {
    codeId: v.id("ebookAccessCodes"),
  },
  handler: async (ctx, { codeId }) => {
    await requireAdmin(ctx);

    const redemptions = await ctx.db
      .query("ebookCodeRedemptions")
      .withIndex("by_code", (q) => q.eq("codeId", codeId))
      .order("desc")
      .collect();

    return redemptions;
  },
});

/**
 * Toggle code active status (admin only)
 */
export const toggleActive = mutation({
  args: {
    id: v.id("ebookAccessCodes"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const code = await ctx.db.get(id);
    if (!code) throw new Error("Code not found");

    await ctx.db.patch(id, { isActive: !code.isActive });
    return !code.isActive;
  },
});
