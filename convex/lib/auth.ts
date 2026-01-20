import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { error, ErrorCode } from "./errors";
import { MemberRole } from "./validators";

type AuthContext = QueryCtx | MutationCtx;

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

/**
 * Require user to have a specific role in an org
 */
export async function requireOrgRole(
  ctx: AuthContext,
  orgId: Id<"orgs">,
  allowedRoles: (typeof MemberRole)[keyof typeof MemberRole][]
) {
  const user = await requireAuth(ctx);

  // Superadmin bypass
  if (user.isSuperadmin) {
    return { user, membership: null };
  }

  const membership = await getMembership(ctx, user._id, orgId);

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  return { user, membership };
}

/**
 * Require org admin role
 */
export async function requireOrgAdmin(ctx: AuthContext, orgId: Id<"orgs">) {
  return requireOrgRole(ctx, orgId, [MemberRole.Admin]);
}

/**
 * Require org agent role (admin or agent)
 */
export async function requireOrgAgent(ctx: AuthContext, orgId: Id<"orgs">) {
  return requireOrgRole(ctx, orgId, [MemberRole.Admin, MemberRole.Agent]);
}

/**
 * Require org member role (any role)
 */
export async function requireOrgMember(ctx: AuthContext, orgId: Id<"orgs">) {
  return requireOrgRole(ctx, orgId, [
    MemberRole.Admin,
    MemberRole.Agent,
    MemberRole.Viewer,
  ]);
}

/**
 * Require superadmin role
 */
export async function requireSuperadmin(ctx: AuthContext) {
  const user = await requireAuth(ctx);

  if (!user.isSuperadmin) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  return user;
}

/**
 * Check if current user is superadmin
 */
export async function isSuperadmin(ctx: AuthContext): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  return user?.isSuperadmin ?? false;
}
