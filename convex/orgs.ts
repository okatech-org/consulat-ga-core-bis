import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireOrgAdmin } from "./lib/auth";
import {
  orgTypeValidator,
  orgMemberRoleValidator,
  addressValidator,
  openingHoursValidator,
  OrgMemberRole,
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
export const create = mutation({
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
    const user = await requireAuth(ctx);

    // Check if slug is already taken
    const existingOrg = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingOrg) {
      throw new Error("Organization slug already exists");
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
      userId: user._id,
      role: OrgMemberRole.ADMIN,
      joinedAt: now,
    });

    return orgId;
  },
});

/**
 * Update organization details
 */
export const update = mutation({
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
export const addMember = mutation({
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
      throw new Error("User is already a member of this organization");
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
 * Update member role
 */
export const updateMemberRole = mutation({
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
      throw new Error("User is not a member of this organization");
    }

    await ctx.db.patch(membership._id, { role: args.role });
    return membership._id;
  },
});

/**
 * Remove a member from organization
 */
export const removeMember = mutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireOrgAdmin(ctx, args.orgId);

    // Cannot remove yourself
    if (user._id === args.userId) {
      throw new Error("Cannot remove yourself from the organization");
    }

    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) =>
        q.eq("orgId", args.orgId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("User is not a member of this organization");
    }

    await ctx.db.delete(membership._id);
    return true;
  },
});
