import { v } from "convex/values";
import { query } from "./_generated/server";
import { authMutation, authQuery } from "./lib/customFunctions";
import { requireOrgAdmin, requireOrgAgent } from "./lib/auth";
import {
  orgTypeValidator,
  orgMemberRoleValidator,
  addressValidator,
  openingHoursValidator,
  OrgMemberRole,
  RequestStatus,
} from "./lib/types";

/**
 * List all active organizations
 */
export const list = query({
  args: {
    type: v.optional(orgTypeValidator),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgsQuery = ctx.db
      .query("orgs")
      .withIndex("by_isActive", (q) => q.eq("isActive", true));

    const orgs = await orgsQuery.collect();

    // Filter by type and country if specified
    return orgs.filter((org) => {
      if (args.type && org.type !== args.type) return false;
      if (args.country && org.address.country !== args.country) return false;
      return true;
    });
  },
});

/**
 * Get organization by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get organization by ID
 */
export const getById = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId);
  },
});

/**
 * Create a new organization (requires authenticated user)
 */
export const create = authMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: orgTypeValidator,
    address: addressValidator,
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug is already taken
    const existingOrg = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingOrg) {
      throw new Error("errors.orgs.slugExists");
    }

    const now = Date.now();
    const orgId = await ctx.db.insert("orgs", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as admin
    await ctx.db.insert("orgMembers", {
      orgId,
      userId: ctx.user._id,
      role: OrgMemberRole.ADMIN,
      joinedAt: now,
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
    timezone: v.optional(v.string()),
    openingHours: v.optional(openingHoursValidator),
    logoUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const { orgId, ...updates } = args;
    await ctx.db.patch(orgId, {
      ...updates,
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
      .query("orgMembers")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    // Fetch user details for each member
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...user,
          role: membership.role,
          joinedAt: membership.joinedAt,
          membershipId: membership._id,
        };
      })
    );

    return members.filter((m) => m !== null);
  },
});

/**
 * Add a member to organization
 */
export const addMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
    role: orgMemberRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Check if already a member
    const existing = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) =>
        q.eq("orgId", args.orgId).eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      throw new Error("errors.orgs.memberAlreadyExists");
    }

    return await ctx.db.insert("orgMembers", {
      orgId: args.orgId,
      userId: args.userId,
      role: args.role,
      joinedAt: Date.now(),
    });
  },
});

/**
 * Add a member to organization by email (for superadmin)
 */
export const addMemberByEmail = authMutation({
  args: {
    orgId: v.id("orgs"),
    email: v.string(),
    role: orgMemberRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("errors.users.notFound");
    }

    // Check if already a member
    const existing = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) =>
        q.eq("orgId", args.orgId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      throw new Error("errors.orgs.memberAlreadyExists");
    }

    return await ctx.db.insert("orgMembers", {
      orgId: args.orgId,
      userId: user._id,
      role: args.role,
      joinedAt: Date.now(),
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
    role: orgMemberRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) =>
        q.eq("orgId", args.orgId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("errors.orgs.memberNotFound");
    }

    await ctx.db.patch(membership._id, { role: args.role });
    return membership._id;
  },
});

/**
 * Remove a member from organization
 */
export const removeMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Cannot remove yourself
    if (ctx.user._id === args.userId) {
      throw new Error("errors.orgs.cannotRemoveSelf");
    }

    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) =>
        q.eq("orgId", args.orgId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("errors.orgs.memberNotFound");
    }

    await ctx.db.delete(membership._id);
    return true;
  },
});

/**
 * Get statistics for a specific organization
 */
export const getOrgStats = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const pendingRequests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_orgId_status", (q) => 
        q.eq("orgId", args.orgId).eq("status", RequestStatus.SUBMITTED)
      )
      .collect();

    const members = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const activeServices = await ctx.db
      .query("orgServices")
      .withIndex("by_orgId_isActive", (q) => 
        q.eq("orgId", args.orgId).eq("isActive", true)
      )
      .collect();

    return {
      pendingRequests: pendingRequests.length,
      members: members.length,
      activeServices: activeServices.length,
    };
  },
});
