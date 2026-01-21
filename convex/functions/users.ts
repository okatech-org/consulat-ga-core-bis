import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";


/**
 * Get current authenticated user
 */
export const getMe = authQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.user;
  },
});

/**
 * Get user by ID
 */
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by external ID
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.clerkId))
      .unique();
  },
});

/**
 * Search users by name (for member search)
 */
export const search = authQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    const limit = args.limit ?? 10;

    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    // Use search index
    const results = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", searchQuery))
      .take(limit);

    return results.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }));
  },
});

/**
 * Update current user profile
 */
export const updateMe = authMutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(ctx.user._id, updates);
    return ctx.user._id;
  },
});

/**
 * Internal mutation to sync user from Clerk webhook
 */
export const syncFromClerk = internalMutation({
  args: {
    externalId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Attempt to link by email (for invited users)
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingByEmail) {
      // Update the placeholder user with real externalId
      await ctx.db.patch(existingByEmail._id, {
        externalId: args.externalId,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: Date.now(),
      });
      return existingByEmail._id;
    }

    return await ctx.db.insert("users", {
      externalId: args.externalId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      isActive: true,
      isSuperadmin: false,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Ensure user exists (upsert from client)
 */
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      externalId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? identity.email ?? "User",
      avatarUrl: identity.pictureUrl,
      isActive: true,
      isSuperadmin: false,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Internal: Create a placeholder user for an invite
 */
export const createInvitedUser = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) return existing._id;

    // Create placeholder
    return await ctx.db.insert("users", {
      externalId: `invite_${args.email}`,
      email: args.email,
      name: args.name,
      isActive: true,
      isSuperadmin: false,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get all organization memberships for the current user
 */
export const getOrgMemberships = authQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) => q.eq("userId", ctx.user._id))
      .collect();

    // Enrich with org details
    const results = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        if (!org) return null;
        
        return {
          ...m,
          org: {
            name: org.name,
            slug: org.slug,
            logoUrl: org.logoUrl,
          },
        };
      })
    );

    return results.filter((m) => m !== null);
  },
});
