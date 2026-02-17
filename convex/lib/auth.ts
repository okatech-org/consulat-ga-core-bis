import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { error, ErrorCode } from "./errors";
import { UserRole } from "./constants";

type AuthContext = QueryCtx | MutationCtx;

// ============================================
// Core Auth Functions
// ============================================

/**
 * Get user identity from auth provider (Clerk)
 */
export async function getIdentity(ctx: AuthContext | ActionCtx) {
  return await ctx.auth.getUserIdentity();
}

/**
 * Get the current user from database
 * Returns null if not authenticated or user not found
 */
export async function getCurrentUser(ctx: AuthContext) {
  const identity = await getIdentity(ctx);
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  return user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(ctx: AuthContext) {
  const identity = await getIdentity(ctx);
  if (!identity) {
    throw error(ErrorCode.NOT_AUTHENTICATED);
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) {
    throw error(ErrorCode.USER_NOT_FOUND);
  }

  if (!user.isActive) {
    throw error(ErrorCode.USER_INACTIVE);
  }

  return user;
}

/**
 * Check if user has membership in an org
 */
export async function getMembership(
  ctx: AuthContext,
  userId: Id<"users">,
  orgId: Id<"orgs">
) {
  return await ctx.db
    .query("memberships")
    .withIndex("by_user_org", (q) => q.eq("userId", userId).eq("orgId", orgId))
    .filter((q) => q.eq(q.field("deletedAt"), undefined))
    .unique();
}

// ============================================
// Permission Helpers
// ============================================

/**
 * Check if user is superadmin (platform-level)
 */
export function isSuperadminUser(user: { isSuperadmin: boolean; role?: string }) {
  return user.isSuperadmin || user.role === UserRole.SuperAdmin;
}

/**
 * Require superadmin role (platform-level)
 */
export async function requireSuperadmin(ctx: AuthContext) {
  const user = await requireAuth(ctx);

  if (!isSuperadminUser(user)) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  return user;
}

/**
 * Check if current user is superadmin
 */
export async function isSuperadmin(ctx: AuthContext): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  return user ? isSuperadminUser(user) : false;
}
