import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Ebook Permission Helpers
 *
 * Handles authorization for ebook editing:
 * - Admins can edit any ebook
 * - Owners can edit their own ebooks (drafts they created)
 */

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
 * Check if user can edit a specific draft
 * Returns { canEdit: boolean, user, draft } without throwing
 */
export async function checkEbookEditAccess(
  ctx: QueryCtx | MutationCtx,
  draftId: Id<"ebookDrafts">
) {
  const user = await getUserFromIdentity(ctx);
  if (!user) {
    return { canEdit: false, user: null, draft: null, reason: "Not authenticated" };
  }

  const draft = await ctx.db.get(draftId);
  if (!draft) {
    return { canEdit: false, user, draft: null, reason: "Draft not found" };
  }

  // Admins can edit any draft
  if (user.isAdmin) {
    return { canEdit: true, user, draft, reason: null };
  }

  // Owners can edit their own drafts
  if (draft.createdById === user._id) {
    return { canEdit: true, user, draft, reason: null };
  }

  return { canEdit: false, user, draft, reason: "You don't have permission to edit this ebook" };
}

/**
 * Require edit access - throws if not authorized
 * Use this in mutations that modify ebook content
 */
export async function requireEbookEditAccess(
  ctx: QueryCtx | MutationCtx,
  draftId: Id<"ebookDrafts">
) {
  const result = await checkEbookEditAccess(ctx, draftId);

  if (!result.canEdit) {
    throw new Error(result.reason || "Access denied");
  }

  return { user: result.user!, draft: result.draft! };
}

/**
 * Get the current user if authenticated
 */
export async function getOptionalUser(ctx: QueryCtx | MutationCtx) {
  return await getUserFromIdentity(ctx);
}

/**
 * Check if user can edit any ebook (admin or has owned drafts)
 * Useful for showing/hiding edit buttons in UI
 */
export async function canUserEditAnyEbook(ctx: QueryCtx | MutationCtx) {
  const user = await getUserFromIdentity(ctx);
  if (!user) return false;

  // Admins can always edit
  if (user.isAdmin) return true;

  // Check if user owns any drafts
  const ownedDrafts = await ctx.db
    .query("ebookDrafts")
    .withIndex("by_creator", (q) => q.eq("createdById", user._id))
    .first();

  return ownedDrafts !== null;
}
