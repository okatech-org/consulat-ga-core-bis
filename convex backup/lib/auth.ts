import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { UserRole, AuditAction } from "./types";

/**
 * Throws ConvexError if the current user is not authenticated.
 * Used by custom auth functions to enforce authentication.
 */
export async function AuthenticationRequired(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError("Not authenticated!");
  }
  return identity;
}

/**
 * Get the current authenticated user from Clerk context
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  if (!user.isActive) {
    throw new Error("Account is disabled");
  }
  return user;
}

/**
 * Require superadmin role
 */
export async function requireSuperadmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== UserRole.SUPERADMIN) {
    throw new Error("Superadmin access required");
  }
  return user;
}

/**
 * Check if current user is superadmin
 */
export async function isSuperadmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  return user?.role === UserRole.SUPERADMIN;
}

/**
 * Check if user is a member of an organization
 */
export async function isOrgMember(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"orgs">,
  userId: Id<"users">
) {
  const membership = await ctx.db
    .query("orgMembers")
    .withIndex("by_orgId_userId", (q) => 
      q.eq("orgId", orgId).eq("userId", userId)
    )
    .unique();

  return membership;
}

/**
 * Require user to be a member of an organization
 */
export async function requireOrgMember(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"orgs">
) {
  const user = await requireAuth(ctx);
  const membership = await isOrgMember(ctx, orgId, user._id);

  if (!membership && user.role !== UserRole.SUPERADMIN) {
    throw new Error("Organization membership required");
  }

  return { user, membership };
}

/**
 * Require user to be an admin of an organization
 */
export async function requireOrgAdmin(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"orgs">
) {
  const { user, membership } = await requireOrgMember(ctx, orgId);

  if (user.role === UserRole.SUPERADMIN) {
    return { user, membership };
  }

  if (!membership || membership.role !== "admin") {
    throw new Error("Organization admin access required");
  }

  return { user, membership };
}

/**
 * Require user to be at least an agent (admin or agent) of an organization
 */
export async function requireOrgAgent(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"orgs">
) {
  const { user, membership } = await requireOrgMember(ctx, orgId);

  if (user.role === UserRole.SUPERADMIN) {
    return { user, membership };
  }

  if (!membership || membership.role === "viewer") {
    throw new Error("Organization agent access required");
  }

  return { user, membership };
}

/**
 * Generate a unique reference number for service requests
 */
export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-${timestamp}-${random}`;
}

/**
 * Log an admin action to the audit trail
 */
export async function logAuditAction(
  ctx: MutationCtx,
  userId: Id<"users">,
  action: AuditAction,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
) {
  await ctx.db.insert("auditLogs", {
    userId,
    action,
    targetType,
    targetId,
    details,
    createdAt: Date.now(),
  });
}
