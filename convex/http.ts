import { httpRouter } from "convex/server";
import { canvasStream } from "./canvasStream";
import { httpAction } from "./_generated/server";

const http = httpRouter();

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
