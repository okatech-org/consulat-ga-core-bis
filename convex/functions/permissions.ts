import { v } from "convex/values";
import {
  authQuery,
  authMutation,
  superadminQuery,
  superadminMutation,
} from "../lib/customFunctions";
import { permissionEffectValidator } from "../lib/validators";
import { getMembership } from "../lib/auth";
import { getTasksForMembership, isSuperAdmin, assertCanDoTask } from "../lib/permissions";
import { ALL_TASK_CODES, taskCodeValidator } from "../lib/taskCodes";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current user's resolved task codes for an org.
 * Returns an array of task code strings like ["requests.view", "requests.process", ...].
 * Used by the frontend `useCanDoTask` hook.
 */
export const getMyTasks = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    // Superadmin gets all tasks
    if (isSuperAdmin(ctx.user)) {
      return [...ALL_TASK_CODES];
    }

    // Find user's membership in this org
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId)
      )
      .first();

    if (!membership || membership.deletedAt) {
      return [];
    }

    const tasks = await getTasksForMembership(ctx, membership);
    return Array.from(tasks);
  },
});

/**
 * List all special permissions for a given membership (SuperAdmin)
 */
export const listByMembership = superadminQuery({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("specialPermissions")
      .withIndex("by_membership", (q) => q.eq("membershipId", args.membershipId))
      .collect();
  },
});

/**
 * List all special permissions for a member in an org (Org Admin)
 */
export const listByOrgMember = authQuery({
  args: {
    orgId: v.id("orgs"),
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

    // Verify membership belongs to this org
    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.orgId !== args.orgId || membership.deletedAt) {
      return [];
    }

    return await ctx.db
      .query("specialPermissions")
      .withIndex("by_membership", (q) => q.eq("membershipId", args.membershipId))
      .collect();
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Set (create or update) a special permission for a membership (SuperAdmin)
 */
export const set = superadminMutation({
  args: {
    membershipId: v.id("memberships"),
    taskCode: taskCodeValidator,
    effect: permissionEffectValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertPermission(ctx, args);
  },
});

/**
 * Set a special permission for a member in an org (Org Admin)
 */
export const setForOrgMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    membershipId: v.id("memberships"),
    taskCode: taskCodeValidator,
    effect: permissionEffectValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

    // Verify membership belongs to this org
    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.orgId !== args.orgId || membership.deletedAt) {
      throw new Error("Membership not found in this organization");
    }

    return await upsertPermission(ctx, {
      membershipId: args.membershipId,
      taskCode: args.taskCode,
      effect: args.effect,
      reason: args.reason,
    });
  },
});

/**
 * Remove a specific permission entry (SuperAdmin)
 */
export const remove = superadminMutation({
  args: { permissionId: v.id("specialPermissions") },
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
    permissionId: v.id("specialPermissions"),
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

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
 * Reset all special permissions for a membership (SuperAdmin)
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
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

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
    taskCode: string;
    effect: string;
    reason?: string;
  }
) {
  const membership = await ctx.db.get(args.membershipId);
  if (!membership || membership.deletedAt) {
    throw new Error("Membership not found");
  }

  const existing = await ctx.db
    .query("specialPermissions")
    .withIndex("by_membership_taskCode", (q: any) =>
      q.eq("membershipId", args.membershipId).eq("taskCode", args.taskCode)
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

  return await ctx.db.insert("specialPermissions", {
    membershipId: args.membershipId,
    taskCode: args.taskCode,
    effect: args.effect,
    grantedBy: ctx.user._id,
    reason: args.reason,
  });
}

async function deleteAllPermissions(ctx: any, membershipId: any) {
  const entries = await ctx.db
    .query("specialPermissions")
    .withIndex("by_membership", (q: any) => q.eq("membershipId", membershipId))
    .collect();

  await Promise.all(entries.map((e: any) => ctx.db.delete(e._id)));
  return { deleted: entries.length };
}
