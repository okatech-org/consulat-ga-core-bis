import { v } from "convex/values";
import { authQuery } from "../lib/customFunctions";

/**
 * List organizations the current user is a member of
 */
export const listMyMemberships = authQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) => q.eq("userId", ctx.user._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Batch fetch orgs
    const orgIds = memberships.map((m) => m.orgId);
    const orgs = await Promise.all(orgIds.map((id) => ctx.db.get(id)));
    const orgMap = new Map(orgs.filter(Boolean).map((o) => [o!._id, o!]));

    return memberships
      .map((m) => {
        const org = orgMap.get(m.orgId);
        if (!org || !org.isActive || org.deletedAt) return null;
        return {
          ...m,
          org,
        };
      })
      .filter(Boolean);
  },
});

/**
 * Get membership details for a specific org
 */
export const getMyMembership = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    return membership;
  },
});
