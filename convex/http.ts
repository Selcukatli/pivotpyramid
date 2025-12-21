import { httpRouter } from "convex/server";
import { canvasStream } from "./canvasStream";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svix = new Webhook(webhookSecret);
    const payload = await request.text();
    const headers = {
      "svix-id": request.headers.get("svix-id") || "",
      "svix-timestamp": request.headers.get("svix-timestamp") || "",
      "svix-signature": request.headers.get("svix-signature") || "",
    };

    let event: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    try {
      event = svix.verify(payload, headers) as typeof event;
    } catch (err) {
      console.error("Invalid webhook signature:", err);
      return new Response("Invalid signature", { status: 401 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsert, {
          clerkId: event.data.id,
          email: event.data.email_addresses?.[0]?.email_address,
          name: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim() || undefined,
          imageUrl: event.data.image_url,
        });
        break;
      case "user.deleted":
        await ctx.runMutation(internal.users.remove, {
          clerkId: event.data.id,
        });
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

// Canvas AI streaming endpoint
http.route({
  path: "/canvas-stream",
  method: "POST",
  handler: canvasStream,
});

// CORS preflight for canvas stream
http.route({
  path: "/canvas-stream",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
