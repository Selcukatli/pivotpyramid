import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes - no auth required
const isPublicRoute = createRouteMatcher([
  "/",
  "/ebook(.*)",
  "/canvas(.*)",
]);

// Login route
const isLoginRoute = createRouteMatcher(["/login"]);

// Admin routes - require authentication
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Public routes are always accessible
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  // Redirect authenticated users away from login page
  if (isLoginRoute(request) && userId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Redirect unauthenticated users from admin to login
  if (isAdminRoute(request) && !userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
