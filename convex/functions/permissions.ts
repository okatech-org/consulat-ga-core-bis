import { v } from "convex/values";
import { superadminQuery, superadminMutation } from "../lib/customFunctions";
import { permissionEffectValidator } from "../lib/validators";

// ============================================================================
// QUERIES (SuperAdmin only)
// ============================================================================

/**
 * List all dynamic permissions for a given membership
 */
export const listByMembership = superadminQuery({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_membership", (q) => q.eq("membershipId", args.membershipId))
      .collect();

    return permissions;
  },
});

// ============================================================================
// MUTATIONS (SuperAdmin only)
// ============================================================================

/**
 * Set (create or update) a dynamic permission for a membership.
 * If a permission entry already exists for the same membership + permission key,
 * it will be updated. Otherwise, a new entry is created.
 */
export const set = superadminMutation({
  args: {
    membershipId: v.id("memberships"),
    permission: v.string(),
    effect: permissionEffectValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate membership exists
    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.deletedAt) {
      throw new Error("Membership not found");
    }

    // Check if entry already exists
    const existing = await ctx.db
      .query("permissions")
      .withIndex("by_membership_permission", (q) =>
        q.eq("membershipId", args.membershipId).eq("permission", args.permission)
      )
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        effect: args.effect,
        grantedBy: ctx.user._id,
        reason: args.reason,
      });
      return existing._id;
    }

    // Create new entry
    return await ctx.db.insert("permissions", {
      membershipId: args.membershipId,
      permission: args.permission,
      effect: args.effect,
      grantedBy: ctx.user._id,
      reason: args.reason,
    });
  },
});

/**
 * Remove a specific permission entry
 */
export const remove = superadminMutation({
  args: { permissionId: v.id("permissions") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.permissionId);
    if (!entry) {
      throw new Error("Permission entry not found");
    }
    await ctx.db.delete(args.permissionId);
  },
});

/**
 * Reset all dynamic permissions for a membership
 */
export const resetAll = superadminMutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("permissions")
      .withIndex("by_membership", (q) => q.eq("membershipId", args.membershipId))
      .collect();

    await Promise.all(entries.map((e) => ctx.db.delete(e._id)));

    return { deleted: entries.length };
  },
});
