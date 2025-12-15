import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
