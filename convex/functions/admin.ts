import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { superadminQuery, superadminMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import { globalCounts, requestsByOrg } from "../lib/aggregates";

// Helper to enrich user with profile data
async function enrichUser(ctx: any, user: any) {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", user._id))
    .unique();

  return {
    ...user,
    role: user.isSuperadmin ? "superadmin" : "user",
    phone: profile?.contacts?.phone,
    nationality: profile?.identity?.nationality,
    residenceCountry: profile?.addresses?.residence?.country,
    createdAt: user._creationTime,
    isVerified: !!user.externalId, // Basic check
    profileId: profile?._id,
  };
}

/**
 * List all users with enriched data (paginated)
 */
export const listUsers = superadminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedResult = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich with profile data for the current page only
    const enrichedPage = await Promise.all(
      paginatedResult.page.map((user) => enrichUser(ctx, user)),
    );

    return {
      ...paginatedResult,
      page: enrichedPage,
    };
  },
});

/**
 * Get single enriched user
 */
export const getUser = superadminQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return await enrichUser(ctx, user);
  },
});

/**
 * List all organizations
 */
export const listOrgs = superadminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orgs").collect();
  },
});

/**
 * Get user memberships
 */
export const getUserMemberships = superadminQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) => q.eq("userId", args.userId))
      .collect();

    const orgIds = memberships.map((m) => m.orgId);

    const orgs = await Promise.all(orgIds.map((id) => ctx.db.get(id)));
    const orgMap = new Map(orgs.filter(Boolean).map((o) => [o!._id, o!]));

    return memberships.map((m) => ({
      ...m,
      org: orgMap.get(m.orgId),
      joinedAt: m._creationTime,
    }));
  },
});

/**
 * Get user audit logs
 */
export const getUserAuditLogs = superadminQuery({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_actor", (q) => q.eq("actorId", args.userId))
      .order("desc")
      .take(args.limit || 10);

    return events.map((e) => ({
      _id: e._id,
      action: e.type,
      details: JSON.stringify(e.data),
      timestamp: e._creationTime,
    }));
  },
});

/**
 * Get global stats for dashboard — uses Aggregate for users count.
 * Superadmin-only, called rarely, so lightweight DB scans for other tables are acceptable.
 * Returns enriched data for KPI cards, status chart, and recent requests table.
 */
export const getStats = superadminQuery({
  args: {},
  handler: async (ctx) => {
    // Users count via aggregate (O(log n))
    const totalUsers = await globalCounts.count(ctx, {});

    // These are superadmin-only, rarely called — lightweight queries are acceptable
    const [orgs, activeServices, requests, registrations, appointments] =
      await Promise.all([
        ctx.db.query("orgs").collect(),
        ctx.db
          .query("services")
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect(),
        ctx.db.query("requests").collect(),
        ctx.db.query("consularRegistrations").collect(),
        ctx.db.query("appointments").collect(),
      ]);

    // Request status breakdown for chart
    const statusBreakdown: Record<string, number> = {};
    for (const r of requests) {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    }

    // Recent 10 requests (most recent first)
    const sortedRequests = requests
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10);

    // Batch-fetch related entities for the recent requests
    const userIds = [...new Set(sortedRequests.map((r) => r.userId))];
    const orgIds = [...new Set(sortedRequests.map((r) => r.orgId))];
    const orgServiceIds = [
      ...new Set(sortedRequests.map((r) => r.orgServiceId)),
    ];

    const [users, orgsForReqs, orgServices] = await Promise.all([
      Promise.all(userIds.map((id) => ctx.db.get(id))),
      Promise.all(orgIds.map((id) => ctx.db.get(id))),
      Promise.all(orgServiceIds.map((id) => ctx.db.get(id))),
    ]);

    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));
    const orgMap = new Map(
      orgsForReqs.filter(Boolean).map((o) => [o!._id, o!]),
    );
    const orgServiceMap = new Map(
      orgServices.filter(Boolean).map((os) => [os!._id, os!]),
    );

    // Fetch services for the orgServices
    const serviceIds = [
      ...new Set(orgServices.filter(Boolean).map((os) => os!.serviceId)),
    ];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!]),
    );

    const recentRequests = sortedRequests.map((r) => {
      const user = userMap.get(r.userId);
      const org = orgMap.get(r.orgId);
      const orgService = orgServiceMap.get(r.orgServiceId);
      const service = orgService
        ? serviceMap.get(orgService.serviceId)
        : null;
      return {
        _id: r._id,
        reference: r.reference,
        status: r.status,
        priority: r.priority,
        createdAt: r._creationTime,
        submittedAt: r.submittedAt,
        userName: user?.name ?? "—",
        orgName: org?.name ?? "—",
        serviceName: service?.name ?? "—",
      };
    });

    // Upcoming appointments (future only)
    const now = Date.now();
    const upcomingAppointments = appointments.filter(
      (a) => typeof a.date === "string" && new Date(a.date).getTime() > now,
    ).length;

    return {
      users: { total: totalUsers },
      orgs: { total: orgs.length },
      services: { active: activeServices.length },
      requests: {
        total: requests.length,
        statusBreakdown,
      },
      registrations: { total: registrations.length },
      appointments: { upcoming: upcomingAppointments },
      recentRequests,
    };
  },
});

/**
 * Get global audit logs (paginated)
 */
export const getAuditLogs = superadminQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const paginatedResult = await ctx.db
      .query("events")
      .order("desc")
      .paginate(args.paginationOpts);

    // Provide user details for each event on the current page
    const enrichedPage = await Promise.all(
      paginatedResult.page.map(async (e) => {
        let user = null;
        if (e.actorId) {
          user = await ctx.db.get(e.actorId);
        }
        return {
          _id: e._id,
          action: e.type,
          details: JSON.stringify(e.data),
          timestamp: e._creationTime,
          createdAt: e._creationTime,
          _creationTime: e._creationTime,
          userId: e.actorId,
          targetType: e.targetType,
          targetId: e.targetId,
          user:
            user ?
              {
                _id: user._id,
                email: user.email || "",
                firstName: user.name.split(" ")[0],
                lastName: user.name.split(" ").slice(1).join(" ") || "",
              }
            : null,
        };
      }),
    );

    return {
      ...paginatedResult,
      page: enrichedPage,
    };
  },
});

/**
 * Update user role (global/admin)
 */
export const updateUserRole = superadminMutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Prevent changing own role
    if (ctx.user._id === args.userId) {
      throw error(ErrorCode.CANNOT_REMOVE_SELF);
    }

    const { userId, role } = args;
    const isSuperadmin = role === "superadmin";

    await ctx.db.patch(userId, { isSuperadmin });
    return true;
  },
});

/**
 * Disable user
 */
export const disableUser = superadminMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    if (ctx.user._id === args.userId) {
      throw error(ErrorCode.CANNOT_REMOVE_SELF);
    }

    await ctx.db.patch(args.userId, { isActive: false } as any);
  },
});

/**
 * Enable user
 */
export const enableUser = superadminMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // if (!ctx.user.isSuperadmin) throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    await ctx.db.patch(args.userId, { isActive: true } as any);
  },
});

/**
 * Disable organization
 */
export const disableOrg = superadminMutation({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    // Check if trying to disable own org? No, superadmin can disable any.
    await ctx.db.patch(args.orgId, { isActive: false });
  },
});

/**
 * Enable organization
 */
export const enableOrg = superadminMutation({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orgId, { isActive: true });
  },
});

/**
 * Create external user (wrapper for invite flow)
 * Following current architecture where we create a shadow user first.
 */
import { createInvitedUserHelper } from "../lib/users";
export const createExternalUser = superadminMutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const name = `${args.firstName} ${args.lastName}`;
    const userId = await createInvitedUserHelper(
      ctx,
      args.email,
      name,
      args.firstName,
      args.lastName,
    );
    return { userId };
  },
});
