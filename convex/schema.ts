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

// Block types for ebook content (Notion-like)
const ebookBlockTypeValidator = v.union(
  v.literal("paragraph"),
  v.literal("heading2"),
  v.literal("heading3"),
  v.literal("heading4"),
  v.literal("blockquote"),
  v.literal("list"),
  v.literal("table"),
  v.literal("figure"),
  v.literal("code")
);

// Chapter types
const ebookChapterTypeValidator = v.union(
  v.literal("intro"),
  v.literal("chapter"),
  v.literal("appendix")
);

export default defineSchema({
  // Users (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Pivot Pyramid Canvases
  canvases: defineTable({
    // Anonymous session tracking (localStorage ID until auth is added)
    sessionId: v.string(),

    // Optional user ID for authenticated users
    userId: v.optional(v.id("users")),

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
    .index("by_email", ["email"])
    .index("by_user", ["userId"]),

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

  // Ebook access codes
  ebookAccessCodes: defineTable({
    // The access code (e.g., "letspivot26", "LAUNCH2024")
    code: v.string(),

    // Optional description (e.g., "Product Hunt launch", "Newsletter subscribers")
    description: v.optional(v.string()),

    // Usage limits: null = unlimited, number = max uses
    maxUses: v.optional(v.number()),

    // Current usage count
    usedCount: v.number(),

    // Whether this code is currently active
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration date
  }).index("by_code", ["code"]),

  // Track individual code redemptions
  ebookCodeRedemptions: defineTable({
    // Which code was used
    codeId: v.id("ebookAccessCodes"),

    // Optional: track who redeemed (could be email, session ID, etc.)
    identifier: v.optional(v.string()),

    // When it was redeemed
    redeemedAt: v.number(),

    // Optional: user agent, referrer, etc. for analytics
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })),
  }).index("by_code", ["codeId"]),

  // GTM Outreach campaign settings (singleton - only one record)
  outreachSettings: defineTable({
    // Email tone/style
    tone: v.string(), // e.g., "professional", "casual", "friendly", "formal"

    // Additional campaign context that applies to all emails
    campaignContext: v.optional(v.string()),

    // Additional instructions for AI
    additionalInstructions: v.optional(v.string()),

    // Timestamps
    updatedAt: v.number(),
  }),

  // GTM Outreach contacts
  outreachContacts: defineTable({
    name: v.string(),
    email: v.string(),
    organization: v.string(),
    tier: v.number(), // 1-4 (priority tier)
    isSent: v.boolean(), // simple sent/pending status

    // Email content (one per contact)
    emailSubject: v.string(),
    emailBody: v.string(),

    // Context for outreach
    background: v.optional(v.string()), // Who they are, their work, books, focus areas
    relationship: v.optional(v.string()), // How you know them (warm/cold, shared history)
    context: v.optional(v.string()), // The angle, why relevant to them, what you're asking for
    notes: v.optional(v.string()), // DEPRECATED: legacy field, use background/relationship/context

    // Timestamps
    sentAt: v.optional(v.number()), // when marked as sent
    createdAt: v.number(),
  })
    .index("by_tier", ["tier"])
    .index("by_sent", ["isSent"])
    .index("by_email", ["email"]),

  // ===========================================
  // EBOOK CONTENT MANAGEMENT
  // Hierarchical structure: Draft → Parts → Chapters → Blocks
  // ===========================================

  // Ebook drafts (version control / branches)
  ebookDrafts: defineTable({
    name: v.string(), // "main", "v2-rewrite", etc.
    description: v.optional(v.string()),
    isPublished: v.boolean(), // Only one can be published at a time
    createdById: v.optional(v.id("users")), // Owner of the draft
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["isPublished"])
    .index("by_creator", ["createdById"]),

  // Parts (Part I, Part II, etc.)
  ebookParts: defineTable({
    draftId: v.id("ebookDrafts"),
    title: v.string(), // "Part I: The Framework"
    order: v.number(), // 0, 1, 2, 3, 4
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_draft", ["draftId"])
    .index("by_draft_order", ["draftId", "order"]),

  // Chapters
  ebookChapters: defineTable({
    draftId: v.id("ebookDrafts"),
    partId: v.optional(v.id("ebookParts")), // null for intro sections (foreword, etc.)
    slug: v.string(), // "chapter-1", "foreword", "appendix-a"
    title: v.string(), // "The Pivot Pyramid Foundation"
    type: ebookChapterTypeValidator,
    chapterNumber: v.optional(v.number()), // 1-14 for chapters
    order: v.number(), // Global order within draft
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_draft", ["draftId"])
    .index("by_draft_slug", ["draftId", "slug"])
    .index("by_part", ["partId"])
    .index("by_draft_order", ["draftId", "order"]),

  // Content blocks (Notion-like paragraphs/headings/etc.)
  ebookBlocks: defineTable({
    chapterId: v.id("ebookChapters"),
    type: ebookBlockTypeValidator,
    content: v.string(), // Markdown content

    // For figures only
    figureId: v.optional(v.id("ebookFigures")),

    // For list blocks
    listType: v.optional(v.union(v.literal("bullet"), v.literal("numbered"))),

    order: v.number(), // Position within chapter
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chapter", ["chapterId"])
    .index("by_chapter_order", ["chapterId", "order"]),

  // Figures (separate table for reusability and metadata)
  ebookFigures: defineTable({
    draftId: v.id("ebookDrafts"),

    // Identity
    figureId: v.string(), // "pivot-pyramid-foundation" (filename without extension)

    // Storage
    storageId: v.id("_storage"), // Convex storage reference

    // Display
    alt: v.string(), // Alt text for accessibility
    caption: v.optional(v.string()), // Figure caption

    // Generation metadata (from figure spec)
    prompt: v.optional(v.string()), // Original generation prompt
    enhancedPrompt: v.optional(v.string()), // LLM-enhanced prompt
    style: v.optional(v.string()), // diagram, flowchart, matrix, etc.

    // Dimensions
    width: v.optional(v.number()),
    height: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_draft", ["draftId"])
    .index("by_draft_figure_id", ["draftId", "figureId"]),
});
