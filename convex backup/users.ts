import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authQuery, authMutation } from "./lib/customFunctions";
import { getCurrentUser } from "./lib/auth";
import { UserRole } from "./lib/types";

/**
 * Get or create a user from Clerk identity
 * Note: This mutation is special - it doesn't use authMutation because
 * the user might not exist in the database yet
 */
export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("errors.auth.noAuthentication");
    }


    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {

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

      await ctx.db.patch(existingUser._id, updates);
      return existingUser._id;
    }


    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      firstName: identity.givenName,
      lastName: identity.familyName,
      role: UserRole.USER,
      isVerified: identity.emailVerified ?? false,
      isActive: true,
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
export const update = authMutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    nationality: v.optional(v.string()),
    residenceCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return ctx.user._id;
  },
});

/**
 * Get user's organization memberships
 */
export const getOrgMemberships = authQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("orgMembers")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
      .collect();


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
