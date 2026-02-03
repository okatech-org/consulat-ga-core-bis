import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { error, ErrorCode } from "./errors";
import { MemberRole, UserRole } from "./constants";

type AuthContext = QueryCtx | MutationCtx;

// ============================================
// Role Groupings
// ============================================

/**
 * Management-level roles (can manage org resources)
 */
const MANAGEMENT_ROLES: MemberRole[] = [
  MemberRole.Ambassador,
  MemberRole.ConsulGeneral,
  MemberRole.FirstCounselor,
  MemberRole.Consul,
  MemberRole.Admin,
];

/**
 * Processing-level roles (can process requests)
 */
const PROCESSING_ROLES: MemberRole[] = [
  ...MANAGEMENT_ROLES,
  MemberRole.ViceConsul,
  MemberRole.Chancellor,
  MemberRole.ConsularAffairsOfficer,
  MemberRole.ConsularAgent,
  MemberRole.SocialCounselor,
  MemberRole.Paymaster,
  MemberRole.FirstSecretary,
  MemberRole.Agent,
];

/**
 * All member roles that grant some access
 */
const ALL_MEMBER_ROLES = Object.values(MemberRole);

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
// Role-Based Permissions
// ============================================

/**
 * Check if user is superadmin (platform-level)
 */
export function isSuperadminUser(user: { isSuperadmin: boolean; role?: string }) {
  return user.isSuperadmin || user.role === UserRole.SuperAdmin;
}

/**
 * Require user to have specific roles in an org
 */
export async function requireOrgRole(
  ctx: AuthContext,
  orgId: Id<"orgs">,
  allowedRoles: MemberRole[]
) {
  const user = await requireAuth(ctx);

  // Superadmin bypass
  if (isSuperadminUser(user)) {
    return { user, membership: null };
  }

  const membership = await getMembership(ctx, user._id, orgId);

  if (!membership || !allowedRoles.includes(membership.role as MemberRole)) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  return { user, membership };
}

/**
 * Require org management role (admin-level access)
 */
export async function requireOrgAdmin(ctx: AuthContext, orgId: Id<"orgs">) {
  return requireOrgRole(ctx, orgId, MANAGEMENT_ROLES);
}

/**
 * Require org agent role (can process requests)
 */
export async function requireOrgAgent(ctx: AuthContext, orgId: Id<"orgs">) {
  return requireOrgRole(ctx, orgId, PROCESSING_ROLES);
}

/**
 * Require org member role (any role with membership)
 */
export async function requireOrgMember(ctx: AuthContext, orgId: Id<"orgs">) {
  return requireOrgRole(ctx, orgId, ALL_MEMBER_ROLES);
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
