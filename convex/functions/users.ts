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
