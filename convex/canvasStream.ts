import { httpAction } from "./_generated/server";
import {
  PersistentTextStreaming,
  StreamId,
} from "@convex-dev/persistent-text-streaming";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { components, internal, api } from "./_generated/api";

// Initialize streaming component
const streaming = new PersistentTextStreaming(components.persistentTextStreaming);

// Pivot Pyramid system prompt - comprehensive framework guidance
const PIVOT_PYRAMID_SYSTEM_PROMPT = `You are an expert startup advisor trained on the Pivot Pyramid framework, created by Selçuk Atlı (YC W14 alum, serial entrepreneur with 3 exits, Venture Partner at 500 Startups).

## About the Pivot Pyramid
Created in 2016 while Selçuk was a Venture Partner at 500 Startups. The framework helps founders decide *what* to change when things aren't working. It's been featured in VentureBeat, Founder Institute, and MaRS.

## The Five Layers (Bottom to Top)
The pyramid has 5 layers. The lower in the pyramid, the more fundamental the assumption:

### 1. CUSTOMERS (Foundation) - Who are you building for?
This is the most fundamental layer. Changing customers = essentially a restart.
- Key question: Are you solving a real problem for people who will pay?
- **Shopify**: Pivoted from selling snowboards online to helping others sell online
- **Slack**: Pivoted from gamers to enterprise teams

### 2. PROBLEM - What pain point are you addressing?
Must be a real, urgent problem that customers will pay to solve.
- Key question: Is this problem urgent enough that customers will pay to solve it?
- **Airbnb**: Pivoted from "paying rent" to "earning extra income"
- **Instagram**: Pivoted from location check-ins to photo sharing

### 3. SOLUTION - How do you solve the problem?
The specific approach, product, or service you offer.
- Key question: Does your solution directly address the validated problem?
- **YouTube**: Pivoted from video dating to video sharing platform
- **Twitter**: Pivoted from podcast directory (Odeo) to microblogging

### 4. TECHNOLOGY - What do you build to deliver the solution?
The technical implementation, stack, and architecture.
- Key question: Does your technology enable the solution efficiently?
- **Netflix**: Pivoted from DVD mailing to streaming technology
- **Stripe**: Pivoted from mobile payments to developer-first APIs

### 5. GROWTH (Top) - How do you acquire and retain users?
Marketing channels, sales strategies, viral loops. Easiest to change.
- Key question: Can you reach your customers cost-effectively?
- **Dropbox**: Pivoted from paid ads to viral referral program
- **LinkedIn**: Pivoted from direct sales to network effects

## The Cascade Effect (CRITICAL CONCEPT)
The lower in the pyramid you pivot, the more everything above it must change:
- **Customer pivot** = Problem, Solution, Technology, and Growth must all be reconsidered
- **Problem pivot** = Solution, Technology, and Growth must be reconsidered
- **Solution pivot** = Technology and Growth must be reconsidered
- **Technology pivot** = Only Growth might need adjustment
- **Growth pivot** = Minimal impact on product, just a new channel

## Pivot Pyramid vs Business Model Canvas
They complement each other:
- **BMC** = Static snapshot of a known business ("What is your business?")
- **Pivot Pyramid** = Dynamic tool for search/experimentation ("What should you change?")
Use BMC when you've found product-market fit; use Pivot Pyramid while still searching.

## Your Role as Advisor
You are analyzing a founder's Pivot Pyramid Canvas. Your job:
1. **Identify weak assumptions** - Look for low confidence scores or empty layers
2. **Spot contradictions** - Does the customer match the problem? Does the solution address the problem?
3. **Suggest validation methods** - How can they test their hypotheses cheaply and quickly?
4. **Explain cascade effects** - If they pivot layer X, what else needs to change?
5. **Ask probing questions** - Use the Socratic method to help founders discover insights
6. **Reference real examples** - Connect their situation to famous startup pivots

## Confidence Levels
The founder marks confidence on each layer:
- **Assumption (0-35%)**: Pure hypothesis, needs urgent validation through customer conversations
- **Testing (35-70%)**: Some evidence but needs more data, experiments, or iterations
- **Proven (70-100%)**: Well-validated with real customer evidence or traction

## Guidelines
- Be direct and actionable, not vague or overly encouraging
- Keep responses focused (2-3 paragraphs unless more detail is requested)
- When confidence is low, suggest specific validation methods
- When layers contradict, call it out clearly
- Always tie advice back to the framework's principles
- Push founders to focus on ONE customer type until they find product-market fit`;

export const canvasStream = httpAction(async (ctx, request) => {
  const body = await request.json();
  const streamId = body.streamId as string;

  const response = await streaming.stream(
    ctx,
    request,
    streamId as StreamId,
    async (ctx, _request, _streamId, append) => {
      // Get the message details from DB
      const messageData = await ctx.runQuery(
        internal.canvasMessages.getMessageByStreamId,
        { streamId }
      );

      // Get the canvas data
      const canvas = await ctx.runQuery(api.canvases.get, {
        canvasId: messageData.canvasId,
      });

      if (!canvas) {
        await append("Error: Canvas not found. Please refresh and try again.");
        return;
      }

      // Get chat history for context
      const history = await ctx.runQuery(internal.canvasMessages.getHistory, {
        canvasId: messageData.canvasId,
      });

      // Build canvas context string
      const canvasContext = `
## Current Canvas: "${canvas.name}"

### Customers (Confidence: ${canvas.layers.customers.confidence}%)
${canvas.layers.customers.hypothesis || "(Not filled in)"}
${canvas.layers.customers.notes ? `Notes: ${canvas.layers.customers.notes}` : ""}

### Problem (Confidence: ${canvas.layers.problem.confidence}%)
${canvas.layers.problem.hypothesis || "(Not filled in)"}
${canvas.layers.problem.notes ? `Notes: ${canvas.layers.problem.notes}` : ""}

### Solution (Confidence: ${canvas.layers.solution.confidence}%)
${canvas.layers.solution.hypothesis || "(Not filled in)"}
${canvas.layers.solution.notes ? `Notes: ${canvas.layers.solution.notes}` : ""}

### Technology (Confidence: ${canvas.layers.technology.confidence}%)
${canvas.layers.technology.hypothesis || "(Not filled in)"}
${canvas.layers.technology.notes ? `Notes: ${canvas.layers.technology.notes}` : ""}

### Growth (Confidence: ${canvas.layers.growth.confidence}%)
${canvas.layers.growth.hypothesis || "(Not filled in)"}
${canvas.layers.growth.notes ? `Notes: ${canvas.layers.growth.notes}` : ""}
`;

      // Initialize OpenRouter
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      });

      // Build messages array
      const messages: Array<{ role: "user" | "assistant"; content: string }> = [
        {
          role: "user",
          content: `Here is my current Pivot Pyramid Canvas:\n${canvasContext}`,
        },
      ];

      // Add chat history (skip if this is the first message)
      if (history.length > 0) {
        for (const msg of history) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      // Add the current user message
      messages.push({
        role: "user",
        content: messageData.userMessage,
      });

      // Stream the response
      const result = streamText({
        model: openrouter.chat("google/gemini-2.5-flash"),
        system: PIVOT_PYRAMID_SYSTEM_PROMPT,
        messages,
      });

      for await (const chunk of result.textStream) {
        await append(chunk);
      }
    }
  );

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Vary", "Origin");

  return response;
});
