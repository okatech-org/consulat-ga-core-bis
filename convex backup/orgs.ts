import { v } from "convex/values";
import { query, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { authMutation, authQuery, authAction } from "./lib/customFunctions";
import { requireOrgAdmin, requireOrgAgent } from "./lib/auth";
import { createClerkClient } from "@clerk/backend";
import {
  orgTypeValidator,
  orgMemberRoleValidator,
  addressValidator,
  openingHoursValidator,
  OrgMemberRole,
  RequestStatus,
  UserRole,
} from "./lib/types";
import { Id } from "./_generated/dataModel";

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


    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("errors.users.notFound");
    }


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


    const allAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    
    const upcomingAppointments = allAppointments.filter(
      apt => apt.status === "scheduled" || apt.status === "confirmed"
    );

    return {
      pendingRequests: pendingRequests.length,
      members: members.length,
      activeServices: activeServices.length,
      upcomingAppointments: upcomingAppointments.length,
    };
  },
});

/**
 * Search users by email (restricted to auth users)
 * Used for adding members to orgs
 */
export const searchCandidates = authQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    const limit = args.limit ?? 10;

    if (!searchQuery || searchQuery.length < 3) {
      return [];
    }

    const users = await ctx.db.query("users").collect();




    const filtered = users.filter((user) => {
      const email = (user.email ?? "").toLowerCase();
      return email.includes(searchQuery);
    });

    return filtered.slice(0, limit).map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }));
  },
});

/**
 * Internal mutation to sync a new user from Clerk
 * (Scoped to internal use only)
 */
export const syncNewUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: UserRole.USER, 
      isVerified: true,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create a new user account via Clerk (Org Admin only)
 * Then syncs it to Convex.
 */
export const createAccount = authAction({
  args: {
    orgId: v.id("orgs"),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"users"> }> => {







    const hasAccess = await ctx.runQuery(api.orgs.checkOrgAdminAccess, { 
      orgId: args.orgId
    });

    if (!hasAccess) {
      throw new Error("UNAUTHORIZED");
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new Error("CLERK_SECRET_KEY missing");
    }

    const clerk = createClerkClient({ secretKey: clerkSecretKey });

    try {

      const user = await clerk.users.createUser({
        emailAddress: [args.email],
        firstName: args.firstName,
        lastName: args.lastName,
      });


      const userId = await ctx.runMutation(internal.orgs.syncNewUser, {
        clerkId: user.id,
        email: args.email,
        firstName: args.firstName || "",
        lastName: args.lastName || "",
        profileImageUrl: user.imageUrl,
      });

      return { userId };
    } catch (error: any) {
      console.error("Clerk creation error:", error);
      const message = error.errors?.[0]?.message || "Failed to create user";
      throw new Error(message);
    }
  },
});

/**
 * Helper query to check permissions from an Action
 */
export const checkOrgAdminAccess = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;


    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.isActive) return false;


    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) => 
        q.eq("orgId", args.orgId).eq("userId", user._id)
      )
      .unique();

    return membership?.role === OrgMemberRole.ADMIN;
  },
});

/**
 * Check if current authenticated user is an admin of the org
 */
export const isUserOrgAdmin = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_orgId_userId", (q) => 
        q.eq("orgId", args.orgId).eq("userId", ctx.user._id)
      )
      .unique();

    return membership?.role === OrgMemberRole.ADMIN;
  },
});


/**
 * Update organization profile (Admin only)
 */
export const updateOrgProfile = authMutation({
  args: {
    orgId: v.id("orgs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(addressValidator),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const { orgId, ...updates } = args;
    

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(orgId, cleanUpdates);
    
    return { success: true };
  },
});
