import { v } from "convex/values";
import { superadminQuery } from "../lib/customFunctions"; // Assuming superadminQuery exists

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
 * List all users with enriched data
 */
export const listUsers = superadminQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    // Enrich with profile data in parallel
    const enrichedUsers = await Promise.all(
      users.map((user) => enrichUser(ctx, user))
    );

    return enrichedUsers;
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
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_actor", (q) => q.eq("actorId", args.userId))
      .order("desc")
      .take(args.limit || 10);

    return events.map(e => ({
      _id: e._id,
      action: e.type,
      details: JSON.stringify(e.data),
      timestamp: e._creationTime,
    }));
  },
});

/**
 * Get global stats for dashboard
 */
export const getStats = superadminQuery({
  args: {},
  handler: async (ctx) => {
    // Naive implementation - for production should use counters or cached aggregates
    const [users, orgs, services, requests] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("orgs").collect(),
      ctx.db.query("services").filter(q => q.eq(q.field("isActive"), true)).collect(),
      ctx.db.query("requests").collect(),
    ]);

    return {
      users: { total: users.length },
      orgs: { total: orgs.length },
      services: { active: services.length },
      requests: { total: requests.length },
    };
  },
});

/**
 * Get global audit logs
 */
export const getAuditLogs = superadminQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const events = await ctx.db
      .query("events")
      .order("desc")
      .take(limit);

    // Provide user details for each event
    const eventsWithUser = await Promise.all(events.map(async (e) => {
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
        user: user ? { 
          _id: user._id,
          email: user.email || "", 
          firstName: user.name.split(' ')[0], 
          lastName: user.name.split(' ').slice(1).join(' ') || ''
        } : null
      };
    }));

    return eventsWithUser;
  },
});
