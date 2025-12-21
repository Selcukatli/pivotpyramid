import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get user from the current authenticated identity
 */
async function getUserFromIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  return existingUser;
}

/**
 * Require admin access - throws if not authenticated or not admin
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getUserFromIdentity(ctx);
  if (!user) throw new Error("Not authenticated");
  if (!user.isAdmin) throw new Error("Admin access required");

  return { userId: user._id, user };
}

/**
 * Get the current user if authenticated, otherwise return null
 */
export async function getOptionalUser(ctx: QueryCtx | MutationCtx) {
  return await getUserFromIdentity(ctx);
}
