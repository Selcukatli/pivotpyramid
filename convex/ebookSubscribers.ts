import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./adminAuth";

export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("ebookSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (existing) {
      // Already subscribed, just return success
      return { success: true, alreadySubscribed: true };
    }

    // Add new subscriber
    await ctx.db.insert("ebookSubscribers", {
      email: email.toLowerCase(),
      subscribedAt: Date.now(),
    });

    return { success: true, alreadySubscribed: false };
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db.query("ebookSubscribers").collect();
    return subscribers.length;
  },
});

/**
 * List all subscribers (admin only)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const subscribers = await ctx.db
      .query("ebookSubscribers")
      .order("desc")
      .collect();

    return subscribers.map((s) => ({
      _id: s._id,
      email: s.email,
      subscribedAt: s.subscribedAt,
    }));
  },
});

/**
 * Get subscriber stats (admin only)
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const subscribers = await ctx.db.query("ebookSubscribers").collect();

    // Calculate stats
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const last24h = subscribers.filter(
      (s) => now - s.subscribedAt < oneDay
    ).length;
    const lastWeek = subscribers.filter(
      (s) => now - s.subscribedAt < oneWeek
    ).length;
    const lastMonth = subscribers.filter(
      (s) => now - s.subscribedAt < oneMonth
    ).length;

    return {
      total: subscribers.length,
      last24h,
      lastWeek,
      lastMonth,
    };
  },
});

/**
 * Delete a subscriber (admin only)
 */
export const remove = mutation({
  args: {
    id: v.id("ebookSubscribers"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return true;
  },
});
