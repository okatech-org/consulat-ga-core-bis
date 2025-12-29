import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { UserRole } from "./lib/types";

/**
 * Internal mutation to create or update a user from Clerk webhook data.
 * Called when user.created or user.updated events are received.
 */
export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        profileImageUrl: args.profileImageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      profileImageUrl: args.profileImageUrl,
      role: UserRole.USER,
      isVerified: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Internal mutation to delete a user from the database.
 * Called when user.deleted events are received from Clerk.
 */
export const deleteUser = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }
  },
});
