import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  PersistentTextStreaming,
  StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { components } from "./_generated/api";

// Initialize the streaming component
const streaming = new PersistentTextStreaming(components.persistentTextStreaming);

// Create a user message
export const createUserMessage = mutation({
  args: {
    canvasId: v.id("canvases"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("canvasMessages", {
      canvasId: args.canvasId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

// Create an assistant message with streaming support
export const createAssistantMessage = mutation({
  args: {
    canvasId: v.id("canvases"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Create stream for AI response
    const streamId = await streaming.createStream(ctx);

    // Create assistant message placeholder
    const messageId = await ctx.db.insert("canvasMessages", {
      canvasId: args.canvasId,
      role: "assistant",
      content: "", // Will be filled by streaming
      streamId: streamId as string,
      userMessage: args.userMessage, // Store for HTTP action context
      createdAt: Date.now(),
    });

    return { messageId, streamId };
  },
});

// List all messages for a canvas
export const listByCanvas = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("canvasMessages")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .order("asc")
      .collect();
  },
});

// Get stream body for useStream hook
export const getStreamBody = query({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, args) => {
    return await streaming.getStreamBody(ctx, args.streamId as StreamId);
  },
});

// Internal query to get message by streamId (for HTTP action)
export const getMessageByStreamId = internalQuery({
  args: { streamId: v.string() },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("canvasMessages")
      .filter((q) => q.eq(q.field("streamId"), args.streamId))
      .first();

    if (!message) {
      throw new Error(`Message not found for streamId: ${args.streamId}`);
    }

    return {
      canvasId: message.canvasId,
      userMessage: message.userMessage || "",
    };
  },
});

// Internal query to get chat history for a canvas (for HTTP action context)
export const getHistory = internalQuery({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("canvasMessages")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .order("asc")
      .collect();

    // Return only completed messages (not the current streaming one)
    return messages
      .filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
  },
});

// Update assistant message content after streaming completes
export const updateAssistantContent = mutation({
  args: {
    messageId: v.id("canvasMessages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

// Clear all messages for a canvas
export const clearMessages = mutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("canvasMessages")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
