import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// List all outreach contacts
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const contacts = await ctx.db.query("outreachContacts").collect();
    // Sort by tier, then by name
    return contacts.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.name.localeCompare(b.name);
    });
  },
});

// Get stats for dashboard
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const contacts = await ctx.db.query("outreachContacts").collect();

    const total = contacts.length;
    const sent = contacts.filter((c) => c.isSent).length;
    const pending = total - sent;

    // Count by tier
    const byTier: Record<number, { total: number; sent: number }> = {};
    for (const contact of contacts) {
      if (!byTier[contact.tier]) {
        byTier[contact.tier] = { total: 0, sent: 0 };
      }
      byTier[contact.tier].total++;
      if (contact.isSent) {
        byTier[contact.tier].sent++;
      }
    }

    return { total, sent, pending, byTier };
  },
});

// Toggle sent status
export const toggleSent = mutation({
  args: { id: v.id("outreachContacts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const contact = await ctx.db.get(id);
    if (!contact) throw new Error("Contact not found");

    const newIsSent = !contact.isSent;
    await ctx.db.patch(id, {
      isSent: newIsSent,
      sentAt: newIsSent ? Date.now() : undefined,
    });

    return { isSent: newIsSent };
  },
});

// Create a new contact
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organization: v.string(),
    tier: v.number(),
    emailSubject: v.string(),
    emailBody: v.string(),
    background: v.optional(v.string()),
    relationship: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const id = await ctx.db.insert("outreachContacts", {
      ...args,
      isSent: false,
      createdAt: Date.now(),
    });

    return id;
  },
});

// Update a contact
export const update = mutation({
  args: {
    id: v.id("outreachContacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    organization: v.optional(v.string()),
    tier: v.optional(v.number()),
    emailSubject: v.optional(v.string()),
    emailBody: v.optional(v.string()),
    background: v.optional(v.string()),
    relationship: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const contact = await ctx.db.get(id);
    if (!contact) throw new Error("Contact not found");

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

// Delete a contact
export const remove = mutation({
  args: { id: v.id("outreachContacts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

// Seed initial data (for importing from HTML) - requires admin auth
export const seed = mutation({
  args: {
    contacts: v.array(
      v.object({
        name: v.string(),
        email: v.string(),
        organization: v.string(),
        tier: v.number(),
        emailSubject: v.string(),
        emailBody: v.string(),
      })
    ),
  },
  handler: async (ctx, { contacts }) => {
    await requireAdmin(ctx);

    // Check if we already have contacts (don't re-seed)
    const existing = await ctx.db.query("outreachContacts").first();
    if (existing) {
      throw new Error("Contacts already exist. Clear table before re-seeding.");
    }

    const ids = [];
    for (const contact of contacts) {
      const id = await ctx.db.insert("outreachContacts", {
        ...contact,
        isSent: false,
        createdAt: Date.now(),
      });
      ids.push(id);
    }

    return { inserted: ids.length };
  },
});

// Internal seed function (no auth required - for CLI usage only)
// This is safe because it can only be run via npx convex run, not from client
export const seedInternal = internalMutation({
  args: {
    contacts: v.array(
      v.object({
        name: v.string(),
        email: v.string(),
        organization: v.string(),
        tier: v.number(),
        emailSubject: v.string(),
        emailBody: v.string(),
      })
    ),
  },
  handler: async (ctx, { contacts }) => {
    // Check if we already have contacts (don't re-seed)
    const existing = await ctx.db.query("outreachContacts").first();
    if (existing) {
      throw new Error("Contacts already exist. Clear table before re-seeding.");
    }

    const ids = [];
    for (const contact of contacts) {
      const id = await ctx.db.insert("outreachContacts", {
        ...contact,
        isSent: false,
        createdAt: Date.now(),
      });
      ids.push(id);
    }

    return { inserted: ids.length };
  },
});

// Internal function to update context fields for existing contacts (matches by email)
export const updateContextInternal = internalMutation({
  args: {
    contactContext: v.array(
      v.object({
        email: v.string(),
        background: v.optional(v.string()),
        relationship: v.optional(v.string()),
        context: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { contactContext }) => {
    let updated = 0;
    let notFound = 0;

    for (const { email, background, relationship, context } of contactContext) {
      const contact = await ctx.db
        .query("outreachContacts")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (contact) {
        await ctx.db.patch(contact._id, { background, relationship, context });
        updated++;
      } else {
        notFound++;
        console.log(`Contact not found for email: ${email}`);
      }
    }

    return { updated, notFound };
  },
});
