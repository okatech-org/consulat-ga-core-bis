import { internalMutation } from "../_generated/server";
import { RequestStatus } from "../lib/constants";


/**
 * Refresh stats for all active organizations
 * This is a heavy operation, run via cron
 */
export const refreshAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all active orgs
    const orgs = await ctx.db
      .query("orgs")
      .withIndex("by_active_notDeleted", (q) =>
        q.eq("isActive", true).eq("deletedAt", undefined)
      )
      .collect();

    for (const org of orgs) {
      // Calculate stats
      const [memberships, pendingRequests, activeServices, upcomingAppointments] = await Promise.all([
        ctx.db
          .query("memberships")
          .withIndex("by_org", (q) => q.eq("orgId", org._id))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .collect(),
        ctx.db
          .query("requests")
          .withIndex("by_org_status", (q) =>
            q.eq("orgId", org._id).eq("status", RequestStatus.Pending)
          )
          .collect(),
        ctx.db
          .query("orgServices")
          .withIndex("by_org_active", (q) =>
            q.eq("orgId", org._id).eq("isActive", true)
          )
          .collect(),
        ctx.db
          .query("requests")
          .withIndex("by_org_date", (q) => q.eq("orgId", org._id))
          .filter((q) => q.gte(q.field("appointmentDate"), Date.now()))
          .collect(),
      ]);

      const stats = {
        memberCount: memberships.length,
        pendingRequests: pendingRequests.length,
        activeServices: activeServices.length,
        upcomingAppointments: upcomingAppointments.length,
        updatedAt: Date.now(),
      };

      // Update org
      await ctx.db.patch(org._id, { stats });
    }
  },
});
