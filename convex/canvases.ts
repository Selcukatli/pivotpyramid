import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

// Default empty layer
const emptyLayer = {
  hypothesis: "",
  confidence: 50,
  notes: "",
};

// Default canvas structure
const defaultLayers = {
  customers: { ...emptyLayer },
  problem: { ...emptyLayer },
  solution: { ...emptyLayer },
  technology: { ...emptyLayer },
  growth: { ...emptyLayer },
};

// Layer validator for mutations
const layerValidator = v.object({
  hypothesis: v.string(),
  confidence: v.number(),
  notes: v.optional(v.string()),
});

const layersValidator = v.object({
  customers: layerValidator,
  problem: layerValidator,
  solution: layerValidator,
  technology: layerValidator,
  growth: layerValidator,
});

// Create a new canvas for a session
export const create = mutation({
  args: {
    sessionId: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const canvasId = await ctx.db.insert("canvases", {
      sessionId: args.sessionId,
      name: args.name || "My Startup Canvas",
      layers: defaultLayers,
      updatedAt: Date.now(),
    });
    return canvasId;
  },
});

// Get a canvas by ID
export const get = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.canvasId);
  },
});

// Get canvas by session ID (returns the most recent one)
export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(1);
    return canvases[0] || null;
  },
});

// List all canvases for a session
export const listBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("canvases")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});

// Update canvas layers
export const updateLayers = mutation({
  args: {
    canvasId: v.id("canvases"),
    layers: layersValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.canvasId, {
      layers: args.layers,
      updatedAt: Date.now(),
    });
  },
});

// Update canvas name
export const updateName = mutation({
  args: {
    canvasId: v.id("canvases"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.canvasId, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

// Update email for recovery
export const updateEmail = mutation({
  args: {
    canvasId: v.id("canvases"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.canvasId, {
      email: args.email,
      updatedAt: Date.now(),
    });
  },
});

// Startup profile validator for mutations
const startupProfileValidator = v.object({
  description: v.string(),
});

// Update startup profile
export const updateProfile = mutation({
  args: {
    canvasId: v.id("canvases"),
    profile: startupProfileValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.canvasId, {
      startupProfile: args.profile,
      updatedAt: Date.now(),
    });
  },
});

// Get or create canvas for session
export const getOrCreate = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for existing canvas
    const existing = await ctx.db
      .query("canvases")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new canvas
    const canvasId = await ctx.db.insert("canvases", {
      sessionId: args.sessionId,
      name: "My Startup Canvas",
      layers: defaultLayers,
      updatedAt: Date.now(),
    });

    return canvasId;
  },
});

// Generate canvas layers from startup profile using AI
export const generateFromProfile = action({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    // Get the canvas with profile
    const canvas = await ctx.runQuery(api.canvases.get, {
      canvasId: args.canvasId,
    });

    if (!canvas) {
      throw new Error("Canvas not found");
    }

    if (!canvas.startupProfile) {
      throw new Error("No startup profile found. Please fill out the profile first.");
    }

    const profile = canvas.startupProfile;

    // Initialize OpenRouter
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    });

    // Generate structured layers using AI
    const result = await generateObject({
      model: openrouter.chat("google/gemini-2.5-flash"),
      schema: z.object({
        canvasName: z.string().describe("A short name for the canvas based on the startup (e.g., 'Acme Canvas')"),
        customers: z.object({
          hypothesis: z.string().describe("A clear hypothesis about who the target customers are"),
          confidence: z.number().min(0).max(100).describe("Confidence level based on the evidence provided"),
        }),
        problem: z.object({
          hypothesis: z.string().describe("A clear hypothesis about what problem is being solved"),
          confidence: z.number().min(0).max(100).describe("Confidence level based on the evidence provided"),
        }),
        solution: z.object({
          hypothesis: z.string().describe("A clear hypothesis about how the problem is solved"),
          confidence: z.number().min(0).max(100).describe("Confidence level based on the evidence provided"),
        }),
        technology: z.object({
          hypothesis: z.string().describe("A clear hypothesis about what technology enables the solution"),
          confidence: z.number().min(0).max(100).describe("Confidence level based on the evidence provided"),
        }),
        growth: z.object({
          hypothesis: z.string().describe("A clear hypothesis about how the startup will grow"),
          confidence: z.number().min(0).max(100).describe("Confidence level based on the evidence provided"),
        }),
      }),
      prompt: `You are an expert startup advisor using the Pivot Pyramid framework by Selçuk Atlı.

Based on the founder's description below, generate hypotheses for each layer of the Pivot Pyramid.

## Founder's Description
${profile.description}

## The Pivot Pyramid Framework
The pyramid has 5 layers from bottom (most fundamental) to top (easiest to change):
1. **Customers** - Who are you building for? (Foundation)
2. **Problem** - What pain point are you solving?
3. **Solution** - How do you solve it?
4. **Technology** - What do you build?
5. **Growth** - How do you acquire users? (Top)

## Instructions
1. Extract or infer information for each layer from the description
2. Write a clear, specific hypothesis for each layer (1-2 sentences)
3. Assign a confidence score (0-100) based on evidence in the description:
   - 0-35: Pure assumption or not mentioned, needs validation
   - 35-70: Mentioned but vague, needs more evidence
   - 70-100: Clearly described with evidence or traction
4. If a layer isn't mentioned, make a reasonable inference and assign low confidence

Be specific and actionable. Each hypothesis should be testable.
Also suggest a short canvas name based on the startup (e.g., "Acme Canvas" or "Food Delivery Canvas").`,
    });

    // Update the canvas with generated layers
    await ctx.runMutation(api.canvases.updateLayers, {
      canvasId: args.canvasId,
      layers: {
        customers: {
          hypothesis: result.object.customers.hypothesis,
          confidence: result.object.customers.confidence,
          notes: "",
        },
        problem: {
          hypothesis: result.object.problem.hypothesis,
          confidence: result.object.problem.confidence,
          notes: "",
        },
        solution: {
          hypothesis: result.object.solution.hypothesis,
          confidence: result.object.solution.confidence,
          notes: "",
        },
        technology: {
          hypothesis: result.object.technology.hypothesis,
          confidence: result.object.technology.confidence,
          notes: "",
        },
        growth: {
          hypothesis: result.object.growth.hypothesis,
          confidence: result.object.growth.confidence,
          notes: "",
        },
      },
    });

    // Update the canvas name
    if (result.object.canvasName) {
      await ctx.runMutation(api.canvases.updateName, {
        canvasId: args.canvasId,
        name: result.object.canvasName,
      });
    }

    return { success: true };
  },
});
