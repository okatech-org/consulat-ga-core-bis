import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireAuth } from "./lib/auth";
import { UserRole } from "./lib/types";

/**
 * Get or create a user from Clerk identity
 */
export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called getOrCreate without authentication");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Update user info from Clerk if changed
      const updates: Partial<{
        email: string;
        firstName: string;
        lastName: string;
        profileImageUrl: string;
        updatedAt: number;
      }> = { updatedAt: Date.now() };

      if (identity.email && identity.email !== existingUser.email) {
        updates.email = identity.email;
      }
      if (identity.givenName !== existingUser.firstName) {
        updates.firstName = identity.givenName;
      }
      if (identity.familyName !== existingUser.lastName) {
        updates.lastName = identity.familyName;
      }
      if (identity.pictureUrl !== existingUser.profileImageUrl) {
        updates.profileImageUrl = identity.pictureUrl;
      }

      await ctx.db.patch(existingUser._id, updates);
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      firstName: identity.givenName,
      lastName: identity.familyName,
      profileImageUrl: identity.pictureUrl,
      role: UserRole.USER,
      isVerified: identity.emailVerified ?? false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get the current authenticated user
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Get user by Clerk ID
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
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
 * Update user profile
 */
export const update = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    nationality: v.optional(v.string()),
    residenceCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

/**
 * Get user's organization memberships
 */
export const getOrgMemberships = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("orgMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Fetch org details for each membership
    const orgsWithRoles = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.orgId);
        return {
          ...org,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return orgsWithRoles.filter((org) => org !== null);
  },
});
