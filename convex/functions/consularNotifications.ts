import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query, internalMutation } from "../_generated/server";
import { authQuery } from "../lib/customFunctions";
import {
  RegistrationStatus,
  RegistrationType,
  registrationStatusValidator,
} from "../lib/validators";

/**
 * List notifications by organization with optional status filter (paginated)
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(registrationStatusValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let paginatedResult;

    if (args.status) {
      paginatedResult = await ctx.db
        .query("consularNotifications")
        .withIndex("by_org_status", (q) =>
          q.eq("orgId", args.orgId).eq("status", args.status!),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      paginatedResult = await ctx.db
        .query("consularNotifications")
        .withIndex("by_org_status", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Enrich with profile and user data for current page only
    const enrichedPage = await Promise.all(
      paginatedResult.page.map(async (notif) => {
        const profile = await ctx.db.get(notif.profileId);
        const user = profile ? await ctx.db.get(profile.userId) : null;
        const request = await ctx.db.get(notif.requestId);
        return {
          ...notif,
          requestReference: request?.reference,
          profile:
            profile ?
              {
                _id: profile._id,
                identity: profile.identity,
                contacts: profile.contacts,
                addresses: profile.addresses,
                passportInfo: profile.passportInfo,
              }
            : null,
          user:
            user ?
              {
                _id: user._id,
                email: user.email,
                avatarUrl: user.avatarUrl,
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
 * List notifications for the current user's profile
 */
export const listByProfile = authQuery({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) return [];

    return await ctx.db
      .query("consularNotifications")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();
  },
});

/**
 * Get notification by request ID
 */
export const getByRequest = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("consularNotifications")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .unique();
  },
});

/**
 * Create notification from request submission (internal, called by profiles.submitNotificationRequest)
 */
export const createFromRequest = internalMutation({
  args: {
    profileId: v.id("profiles"),
    orgId: v.id("orgs"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    // Check for existing active or pending notification at this org
    const existing = await ctx.db
      .query("consularNotifications")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .collect();

    const activeAtOrg = existing.find(
      (n) =>
        n.orgId === args.orgId &&
        (n.status === RegistrationStatus.Active ||
          n.status === RegistrationStatus.Requested),
    );

    if (activeAtOrg) {
      return activeAtOrg._id;
    }

    // Create new notification entry
    return await ctx.db.insert("consularNotifications", {
      profileId: args.profileId,
      orgId: args.orgId,
      requestId: args.requestId,
      type: RegistrationType.Inscription,
      status: RegistrationStatus.Requested,
      signaledAt: Date.now(),
    });
  },
});

/**
 * Sync notification status when request status changes
 */
export const syncStatus = internalMutation({
  args: {
    requestId: v.id("requests"),
    newStatus: registrationStatusValidator,
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db
      .query("consularNotifications")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .unique();

    if (!notification) return;

    const updates: Record<string, unknown> = { status: args.newStatus };

    if (args.newStatus === RegistrationStatus.Active) {
      updates.activatedAt = Date.now();
    }

    await ctx.db.patch(notification._id, updates);
  },
});
