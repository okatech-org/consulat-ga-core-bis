import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import {
  mailFolderValidator,
  mailAccountTypeValidator,
} from "../lib/validators";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List mail for the current user with optional filters (paginated).
 */
export const list = authQuery({
  args: {
    folder: v.optional(mailFolderValidator),
    accountType: v.optional(mailAccountTypeValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let paginatedResult;

    if (args.folder) {
      paginatedResult = await ctx.db
        .query("digitalMail")
        .withIndex("by_folder", (q) =>
          q.eq("userId", ctx.user._id).eq("folder", args.folder!),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      paginatedResult = await ctx.db
        .query("digitalMail")
        .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Filter by account type on page if specified
    if (args.accountType) {
      return {
        ...paginatedResult,
        page: paginatedResult.page.filter(
          (m) => m.accountType === args.accountType,
        ),
      };
    }

    return paginatedResult;
  },
});

/**
 * Get unread count for the current user.
 */
export const getUnreadCount = authQuery({
  args: {
    accountType: v.optional(mailAccountTypeValidator),
  },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("digitalMail")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", ctx.user._id).eq("isRead", false),
      )
      .collect();

    if (args.accountType) {
      return unread.filter((m) => m.accountType === args.accountType).length;
    }

    return unread.length;
  },
});

/**
 * Get a single mail item by ID.
 */
export const getById = authQuery({
  args: { id: v.id("digitalMail") },
  handler: async (ctx, args) => {
    const mail = await ctx.db.get(args.id);
    if (!mail || mail.userId !== ctx.user._id) {
      return null;
    }
    return mail;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mark a mail item as read.
 */
export const markRead = authMutation({
  args: { id: v.id("digitalMail") },
  handler: async (ctx, args) => {
    const mail = await ctx.db.get(args.id);
    if (!mail || mail.userId !== ctx.user._id) {
      throw new Error("Mail not found");
    }
    if (!mail.isRead) {
      await ctx.db.patch(args.id, {
        isRead: true,
        updatedAt: Date.now(),
      });
    }
    return true;
  },
});

/**
 * Toggle starred status.
 */
export const toggleStar = authMutation({
  args: { id: v.id("digitalMail") },
  handler: async (ctx, args) => {
    const mail = await ctx.db.get(args.id);
    if (!mail || mail.userId !== ctx.user._id) {
      throw new Error("Mail not found");
    }
    await ctx.db.patch(args.id, {
      isStarred: !mail.isStarred,
      updatedAt: Date.now(),
    });
    return !mail.isStarred;
  },
});

/**
 * Move mail to a different folder.
 */
export const move = authMutation({
  args: {
    id: v.id("digitalMail"),
    folder: mailFolderValidator,
  },
  handler: async (ctx, args) => {
    const mail = await ctx.db.get(args.id);
    if (!mail || mail.userId !== ctx.user._id) {
      throw new Error("Mail not found");
    }
    await ctx.db.patch(args.id, {
      folder: args.folder,
      updatedAt: Date.now(),
    });
    return true;
  },
});

/**
 * Delete a mail item permanently.
 */
export const remove = authMutation({
  args: { id: v.id("digitalMail") },
  handler: async (ctx, args) => {
    const mail = await ctx.db.get(args.id);
    if (!mail || mail.userId !== ctx.user._id) {
      throw new Error("Mail not found");
    }
    await ctx.db.delete(args.id);
    return true;
  },
});
