import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Layer data structure for canvas
const layerValidator = v.object({
  hypothesis: v.string(),
  confidence: v.number(), // 0-100
  notes: v.optional(v.string()),
});

// Startup profile - open-ended description
const startupProfileValidator = v.object({
  description: v.string(), // Freeform description of the startup
});

export default defineSchema({
  // Pivot Pyramid Canvases
  canvases: defineTable({
    // Anonymous session tracking (localStorage ID until auth is added)
    sessionId: v.string(),

    // Optional email for recovery
    email: v.optional(v.string()),

    // Canvas name/title
    name: v.string(),

    // Startup profile - flat form data (optional, filled in first tab)
    startupProfile: v.optional(startupProfileValidator),

    // The 5 layers - each with hypothesis and confidence
    layers: v.object({
      customers: layerValidator,
      problem: layerValidator,
      solution: layerValidator,
      technology: layerValidator,
      growth: layerValidator,
    }),

    // Timestamps
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_email", ["email"]),

  // Ebook notification subscribers
  ebookSubscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
  }).index("by_email", ["email"]),

  // Chat messages for canvas diagnostics
  canvasMessages: defineTable({
    canvasId: v.id("canvases"),

    // Message content
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),

    // For streaming AI responses
    streamId: v.optional(v.string()),

    // Store user message for context in HTTP action
    userMessage: v.optional(v.string()),

    // Timestamp
    createdAt: v.number(),
  }).index("by_canvas", ["canvasId"]),
});
