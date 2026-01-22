import { v } from "convex/values";
import { query } from "../_generated/server";
import { createInvitedUserHelper } from "../lib/users";

// ... existing imports


import { authQuery, authMutation } from "../lib/customFunctions";
import { requireOrgAdmin, requireOrgMember } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import { notDeleted } from "../lib/utils";
import {
  RequestStatus,
  orgTypeValidator,
  addressValidator,
  orgSettingsValidator,
  memberRoleValidator,
  MemberRole,
} from "../lib/validators";

/**
 * List all active organizations
 */
export const list = query({
  args: {
    type: v.optional(orgTypeValidator),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orgs = await ctx.db
      .query("orgs")
      .withIndex("by_active_notDeleted", (q) =>
        q.eq("isActive", true).eq("deletedAt", undefined)
      )
      .collect();

    // Filter by type/country if provided
    if (args.type) {
      orgs = orgs.filter((org) => org.type === args.type);
    }
    if (args.country) {
      orgs = orgs.filter((org) => org.country === args.country);
    }

    return orgs;
  },
});

/**
 * List organizations by jurisdiction country
 * Returns consulates/embassies whose jurisdiction includes the given country
 */
export const listByJurisdiction = query({
  args: {
    residenceCountry: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all active orgs
    const orgs = await ctx.db
      .query("orgs")
      .withIndex("by_active_notDeleted", (q) =>
        q.eq("isActive", true).eq("deletedAt", undefined)
      )
      .collect();

    // Filter to consulates/embassies that have this country in their jurisdiction
    const consulateTypes = ["embassy", "consulate", "general_consulate"];
    
    return orgs.filter((org) => {
      if (!consulateTypes.includes(org.type)) return false;
      if (!org.jurisdictionCountries || org.jurisdictionCountries.length === 0) return false;
      return org.jurisdictionCountries.includes(args.residenceCountry);
    });
  },
});

/**
 * Get organization by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (org?.deletedAt) return null;
    return org;
  },
});

/**
 * Get organization by ID
 */
export const getById = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (org?.deletedAt) return null;
    return org;
  },
});

/**
 * Create a new organization
 */
export const create = authMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: orgTypeValidator,
    country: v.string(),
    timezone: v.string(),
    address: addressValidator,
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check slug uniqueness
    const existing = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw error(ErrorCode.ORG_SLUG_EXISTS);
    }

    const orgId = await ctx.db.insert("orgs", {
      ...args,
      isActive: true,
      updatedAt: Date.now(),
    });

    // Add creator as admin
    await ctx.db.insert("memberships", {
      orgId,
      userId: ctx.user._id,
      role: MemberRole.Admin,
    });

    return orgId;
  },
});

/**
 * Update organization details
 */
export const update = authMutation({
  args: {
    orgId: v.id("orgs"),
    name: v.optional(v.string()),
    address: v.optional(addressValidator),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    timezone: v.optional(v.string()),
    settings: v.optional(orgSettingsValidator),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const { orgId, ...updates } = args;
    
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(orgId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return orgId;
  },
});

/**
 * Get organization members
 */
export const getMembers = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    const activeMembers = notDeleted(memberships);

    // Batch fetch users
    const userIds = [...new Set(activeMembers.map((m) => m.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));

    return activeMembers.map((membership) => {
      const user = userMap.get(membership.userId);
      if (!user) return null;
      return {
        ...user,
        role: membership.role,
        membershipId: membership._id,
        joinedAt: membership._creationTime,
      };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  },
});

/**
 * Add member to organization
 */
export const addMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
    role: memberRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Check if already member
    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (existing) {
      throw error(ErrorCode.MEMBER_ALREADY_EXISTS);
    }

    return await ctx.db.insert("memberships", {
      orgId: args.orgId,
      userId: args.userId,
      role: args.role,
    });
  },
});

/**
 * Update member role
 */
export const updateMemberRole = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
    role: memberRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (!membership) {
      throw error(ErrorCode.MEMBER_NOT_FOUND);
    }

    await ctx.db.patch(membership._id, { role: args.role });
    return membership._id;
  },
});

/**
 * Remove member from organization
 */
export const removeMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Cannot remove self
    if (ctx.user._id === args.userId) {
      throw error(ErrorCode.CANNOT_REMOVE_SELF);
    }

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (!membership) {
      throw error(ErrorCode.MEMBER_NOT_FOUND);
    }

    // Soft delete
    await ctx.db.patch(membership._id, { deletedAt: Date.now() });
    return true;
  },
});

/**
 * Get organization stats
 */
export const getStats = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    await requireOrgMember(ctx, args.orgId);

    const org = await ctx.db.get(args.orgId);
    if (org?._stats) {
      return org._stats;
    }

    // Calculate on the fly if not cached
    const [memberships, pendingRequests, activeServices, upcomingAppointments] = await Promise.all([
      ctx.db
        .query("memberships")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect(),
      ctx.db
        .query("requests")
        .withIndex("by_org_status", (q) =>
          q.eq("orgId", args.orgId).eq("status", RequestStatus.Submitted)
        )
        .collect(),
      ctx.db
        .query("orgServices")
        .withIndex("by_org_active", (q) =>
          q.eq("orgId", args.orgId).eq("isActive", true)
        )
        .collect(),
      ctx.db
        .query("requests")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .filter((q) => q.gte(q.field("appointmentDate"), Date.now()))
        .collect(),
    ]);

    return {
      memberCount: memberships.length,
      pendingRequests: pendingRequests.length,
      activeServices: activeServices.length,
      upcomingAppointments: upcomingAppointments.length,
      updatedAt: Date.now(),
    };
  },
});

/**
 * Check if current user is org admin
 */
export const isUserAdmin = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    if (ctx.user.isSuperadmin) return true;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    return membership?.role === MemberRole.Admin;
  },
});

/**
 * Get current user's role in the organization
 */
export const getCurrentRole = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    if (ctx.user.isSuperadmin) return MemberRole.Admin;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    return membership?.role ?? null;
  },
});

/**
 * Create a new user account (invite flow)
 */
export const createAccount = authMutation({
  args: {
    orgId: v.id("orgs"),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const { email, firstName, lastName } = args;
    const name = `${firstName} ${lastName}`;

    // Call helper directly to avoid circular dependency
    const userId = await createInvitedUserHelper(ctx, email, name, firstName, lastName);

    return { userId };
  },
});
