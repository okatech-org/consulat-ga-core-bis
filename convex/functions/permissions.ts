import { v } from "convex/values";
import {
  authQuery,
  authMutation,
  superadminQuery,
  superadminMutation,
} from "../lib/customFunctions";
import { permissionEffectValidator } from "../lib/validators";
import { requireOrgAdmin } from "../lib/auth";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all dynamic permissions for a given membership (SuperAdmin)
 */
export const listByMembership = superadminQuery({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("permissions")
      .withIndex("by_membership", (q) => q.eq("membershipId", args.membershipId))
      .collect();
  },
});

/**
 * List all dynamic permissions for a member in an org (Org Admin)
 */
export const listByOrgMember = authQuery({
  args: {
    orgId: v.id("orgs"),
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    // Superadmin bypass or org admin check
    if (!ctx.user.isSuperadmin) {
      await requireOrgAdmin(ctx, args.orgId);
    }

    // Verify membership belongs to this org
    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.orgId !== args.orgId || membership.deletedAt) {
      return [];
    }

    return await ctx.db
      .query("permissions")
      .withIndex("by_membership", (q) => q.eq("membershipId", args.membershipId))
      .collect();
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Set (create or update) a dynamic permission for a membership (SuperAdmin)
 */
export const set = superadminMutation({
  args: {
    membershipId: v.id("memberships"),
    permission: v.string(),
    effect: permissionEffectValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertPermission(ctx, args);
  },
});

/**
 * Set a dynamic permission for a member in an org (Org Admin)
 */
export const setForOrgMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    membershipId: v.id("memberships"),
    permission: v.string(),
    effect: permissionEffectValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!ctx.user.isSuperadmin) {
      await requireOrgAdmin(ctx, args.orgId);
    }

    // Verify membership belongs to this org
    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.orgId !== args.orgId || membership.deletedAt) {
      throw new Error("Membership not found in this organization");
    }

    return await upsertPermission(ctx, {
      membershipId: args.membershipId,
      permission: args.permission,
      effect: args.effect,
      reason: args.reason,
    });
  },
});

/**
 * Remove a specific permission entry (SuperAdmin)
 */
export const remove = superadminMutation({
  args: { permissionId: v.id("permissions") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.permissionId);
    if (!entry) throw new Error("Permission entry not found");
    await ctx.db.delete(args.permissionId);
  },
});

/**
 * Remove a permission entry for an org member (Org Admin)
 */
export const removeForOrgMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    permissionId: v.id("permissions"),
  },
  handler: async (ctx, args) => {
    if (!ctx.user.isSuperadmin) {
      await requireOrgAdmin(ctx, args.orgId);
    }

    const entry = await ctx.db.get(args.permissionId);
    if (!entry) throw new Error("Permission entry not found");

    // Verify the permission belongs to a membership in this org
    const membership = await ctx.db.get(entry.membershipId);
    if (!membership || membership.orgId !== args.orgId) {
      throw new Error("Permission does not belong to this organization");
    }

    await ctx.db.delete(args.permissionId);
  },
});

/**
 * Reset all dynamic permissions for a membership (SuperAdmin)
 */
export const resetAll = superadminMutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    return await deleteAllPermissions(ctx, args.membershipId);
  },
});

/**
 * Reset all permissions for an org member (Org Admin)
 */
export const resetAllForOrgMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    if (!ctx.user.isSuperadmin) {
      await requireOrgAdmin(ctx, args.orgId);
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.orgId !== args.orgId || membership.deletedAt) {
      throw new Error("Membership not found in this organization");
    }

    return await deleteAllPermissions(ctx, args.membershipId);
  },
});

// ============================================================================
// SHARED HELPERS
// ============================================================================

async function upsertPermission(
  ctx: any,
  args: {
    membershipId: any;
    permission: string;
    effect: string;
    reason?: string;
  }
) {
  const membership = await ctx.db.get(args.membershipId);
  if (!membership || membership.deletedAt) {
    throw new Error("Membership not found");
  }

  const existing = await ctx.db
    .query("permissions")
    .withIndex("by_membership_permission", (q: any) =>
      q.eq("membershipId", args.membershipId).eq("permission", args.permission)
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      effect: args.effect,
      grantedBy: ctx.user._id,
      reason: args.reason,
    });
    return existing._id;
  }

  return await ctx.db.insert("permissions", {
    membershipId: args.membershipId,
    permission: args.permission,
    effect: args.effect,
    grantedBy: ctx.user._id,
    reason: args.reason,
  });
}

async function deleteAllPermissions(ctx: any, membershipId: any) {
  const entries = await ctx.db
    .query("permissions")
    .withIndex("by_membership", (q: any) => q.eq("membershipId", membershipId))
    .collect();

  await Promise.all(entries.map((e: any) => ctx.db.delete(e._id)));
  return { deleted: entries.length };
}
