import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Redeem an access code for ebook access.
 * Validates the code, checks limits/expiration, and tracks usage.
 */
export const redeemCode = mutation({
  args: {
    code: v.string(),
    identifier: v.optional(v.string()), // Optional session ID or email
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        referrer: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { code, identifier, metadata }) => {
    // Find the access code (case-insensitive)
    const accessCode = await ctx.db
      .query("ebookAccessCodes")
      .withIndex("by_code", (q) => q.eq("code", code.toLowerCase()))
      .first();

    if (!accessCode) {
      return { valid: false, error: "Invalid code" };
    }

    // Check if code is active
    if (!accessCode.isActive) {
      return { valid: false, error: "This code is no longer active" };
    }

    // Check expiration
    if (accessCode.expiresAt && accessCode.expiresAt < Date.now()) {
      return { valid: false, error: "This code has expired" };
    }

    // Check usage limits
    if (
      accessCode.maxUses !== undefined &&
      accessCode.usedCount >= accessCode.maxUses
    ) {
      return { valid: false, error: "This code has reached its usage limit" };
    }

    // Increment usage count
    await ctx.db.patch(accessCode._id, {
      usedCount: accessCode.usedCount + 1,
    });

    // Track the redemption
    await ctx.db.insert("ebookCodeRedemptions", {
      codeId: accessCode._id,
      identifier,
      redeemedAt: Date.now(),
      metadata,
    });

    return { valid: true };
  },
});

/**
 * Create a new access code (admin use).
 */
export const createCode = mutation({
  args: {
    code: v.string(),
    description: v.optional(v.string()),
    maxUses: v.optional(v.number()), // undefined = unlimited
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { code, description, maxUses, expiresAt }) => {
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

    return { id };
  },
});

/**
 * Deactivate an access code.
 */
export const deactivateCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, { code }) => {
    const accessCode = await ctx.db
      .query("ebookAccessCodes")
      .withIndex("by_code", (q) => q.eq("code", code.toLowerCase()))
      .first();

    if (!accessCode) {
      throw new Error("Access code not found");
    }

    await ctx.db.patch(accessCode._id, { isActive: false });

    return { success: true };
  },
});

/**
 * Get all access codes with their stats (admin use).
 */
export const listCodes = query({
  args: {},
  handler: async (ctx) => {
    const codes = await ctx.db.query("ebookAccessCodes").collect();

    return codes.map((code) => ({
      id: code._id,
      code: code.code,
      description: code.description,
      maxUses: code.maxUses,
      usedCount: code.usedCount,
      isActive: code.isActive,
      createdAt: code.createdAt,
      expiresAt: code.expiresAt,
      isUnlimited: code.maxUses === undefined,
    }));
  },
});

/**
 * Get redemption history for a specific code.
 */
export const getCodeRedemptions = query({
  args: {
    codeId: v.id("ebookAccessCodes"),
  },
  handler: async (ctx, { codeId }) => {
    const redemptions = await ctx.db
      .query("ebookCodeRedemptions")
      .withIndex("by_code", (q) => q.eq("codeId", codeId))
      .collect();

    return redemptions;
  },
});

/**
 * Get total stats across all codes.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const codes = await ctx.db.query("ebookAccessCodes").collect();
    const totalRedemptions = codes.reduce((sum, code) => sum + code.usedCount, 0);
    const activeCodes = codes.filter((code) => code.isActive).length;

    return {
      totalCodes: codes.length,
      activeCodes,
      totalRedemptions,
    };
  },
});
