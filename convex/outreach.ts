import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import { api } from "./_generated/api";

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

// ==================
// CAMPAIGN SETTINGS
// ==================

// Get campaign settings (returns default if none exist)
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db.query("outreachSettings").first();
    // Return defaults if no settings exist - seeded with context for Pivot Pyramid launch
    return settings || {
      tone: "professional-friendly",
      campaignContext: "Pre-launch outreach for Pivot Pyramid framework. Goal: Get early feedback, testimonials, and distribution partners before Product Hunt launch. The framework is already cited organically by Founders Institute, VentureBeat, and 500 Startups blog.",
      additionalInstructions: "Keep emails concise (150-250 words). Always mention the free ebook. Reference specific work/background of the contact when available. Make the ask clear but low-friction.",
    };
  },
});

// Update campaign settings (upsert pattern)
export const updateSettings = mutation({
  args: {
    tone: v.string(),
    campaignContext: v.optional(v.string()),
    additionalInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if settings exist
    const existing = await ctx.db.query("outreachSettings").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("outreachSettings", {
        ...args,
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

// Internal settings update (no auth - for CLI seeding only)
export const updateSettingsInternal = internalMutation({
  args: {
    tone: v.string(),
    campaignContext: v.optional(v.string()),
    additionalInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("outreachSettings").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("outreachSettings", {
        ...args,
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

// ==================
// EMAIL GENERATION
// ==================

// Generate email subject and body using AI
export const generateEmail = action({
  args: {
    contactId: v.id("outreachContacts"),
    field: v.optional(v.union(v.literal("subject"), v.literal("body"), v.literal("both"))),
    userPrompt: v.optional(v.string()),
  },
  handler: async (ctx, { contactId, field = "both", userPrompt }) => {
    // Get the contact
    const contact = await ctx.runQuery(api.outreach.getById, { id: contactId });
    if (!contact) throw new Error("Contact not found");

    // Get campaign settings
    const settings = await ctx.runQuery(api.outreach.getSettings, {});

    // Initialize OpenRouter
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    });

    // Build the prompt with all available context
    const contextParts: string[] = [];

    contextParts.push(`**Contact Name:** ${contact.name}`);
    contextParts.push(`**Organization:** ${contact.organization}`);

    if (contact.background) {
      contextParts.push(`**Background:** ${contact.background}`);
    }
    if (contact.relationship) {
      contextParts.push(`**Relationship:** ${contact.relationship}`);
    }
    if (contact.context) {
      contextParts.push(`**Outreach Context:** ${contact.context}`);
    }

    const contextString = contextParts.join("\n");

    // Build tone instructions
    const toneMap: Record<string, string> = {
      "professional-friendly": "Write in a professional yet warm and approachable tone. Be personable without being overly casual.",
      "casual": "Write in a casual, conversational tone like you're reaching out to a friend or peer. Keep it relaxed and natural.",
      "formal": "Write in a formal, business-appropriate tone. Be respectful and polished.",
      "enthusiastic": "Write with energy and enthusiasm. Show genuine excitement about the connection and the framework.",
      "brief-direct": "Be very concise and direct. Get to the point quickly without unnecessary pleasantries.",
    };
    const toneInstruction = toneMap[settings.tone] || toneMap["professional-friendly"];

    // Generate based on what field is requested
    const result = await generateObject({
      model: openrouter.chat("google/gemini-2.5-flash"),
      schema: z.object({
        emailSubject: z.string().describe("A compelling, personalized email subject line (max 60 chars)"),
        emailBody: z.string().describe("The full email body - professional, personalized, concise"),
      }),
      prompt: `You are Selçuk Atlı (YC W14 alum, serial entrepreneur with 3 exits, Venture Partner at 500 Startups).
You are reaching out to people about your new book/framework: The Pivot Pyramid.

**About The Pivot Pyramid:**
- A strategic framework for startup founders to decide WHAT to change when things aren't working
- Has 5 layers: Customers → Problem → Solution → Technology → Growth (from most to least fundamental)
- The lower you pivot in the pyramid, the more everything above must change (cascade effect)
- Featured in VentureBeat, used at Founders Institute, MaRS
- Offers a free ebook and an interactive canvas tool at pivotpyramid.com

**Tone & Style:**
${toneInstruction}

${settings.campaignContext ? `**Campaign Context:**\n${settings.campaignContext}\n` : ""}
${settings.additionalInstructions ? `**Additional AI Instructions:**\n${settings.additionalInstructions}\n` : ""}

**Your Goal:**
Generate a personalized outreach email to introduce the Pivot Pyramid framework. The email should:
1. Feel personal and genuine - not spammy or templated
2. Reference their specific work/background when available
3. Explain why YOU specifically are reaching out to THEM
4. Make a clear, low-friction ask (usually: check it out, share feedback, or share with their community)
5. Be concise (150-250 words for the body)
6. Sound like a real human, not AI-generated

**Contact Information:**
${contextString}

${contact.emailSubject ? `**Current Subject (for reference):** ${contact.emailSubject}` : ""}
${contact.emailBody ? `**Current Body (for reference):** ${contact.emailBody}` : ""}
${userPrompt ? `\n**Additional Instructions from User:** ${userPrompt}` : ""}

Generate a ${field === "subject" ? "subject line only" : field === "body" ? "email body only" : "subject line and email body"} for this outreach.`,
    });

    // Update the contact with generated content
    const updates: { emailSubject?: string; emailBody?: string } = {};
    if (field === "subject" || field === "both") {
      updates.emailSubject = result.object.emailSubject;
    }
    if (field === "body" || field === "both") {
      updates.emailBody = result.object.emailBody;
    }

    await ctx.runMutation(api.outreach.update, {
      id: contactId,
      ...updates,
    });

    return updates;
  },
});

// Get a single contact by ID (for actions)
export const getById = query({
  args: { id: v.id("outreachContacts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(id);
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
