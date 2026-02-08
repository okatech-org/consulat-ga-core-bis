import { v } from "convex/values";
import { query } from "../_generated/server";
import { PostStatus } from "../lib/constants";
import { tutorialCategoryValidator } from "../lib/validators";

/**
 * List published tutorials with optional category filter
 */
export const list = query({
  args: {
    category: v.optional(tutorialCategoryValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let tutorials;
    if (args.category) {
      tutorials = await ctx.db
        .query("tutorials")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      // Filter published only
      tutorials = tutorials
        .filter((t) => t.status === "published")
        .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
        .slice(0, limit);
    } else {
      tutorials = await ctx.db
        .query("tutorials")
        .withIndex("by_published", (q) => q.eq("status", PostStatus.Published))
        .order("desc")
        .take(limit);
    }

    // Resolve cover images
    return Promise.all(
      tutorials.map(async (tutorial) => {
        let coverImageUrl: string | null = null;
        if (tutorial.coverImageStorageId) {
          coverImageUrl = await ctx.storage.getUrl(
            tutorial.coverImageStorageId,
          );
        }
        return { ...tutorial, coverImageUrl };
      }),
    );
  },
});

/**
 * Get a single tutorial by slug (public)
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const tutorial = await ctx.db
      .query("tutorials")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!tutorial || tutorial.status !== "published") {
      return null;
    }

    let coverImageUrl: string | null = null;
    if (tutorial.coverImageStorageId) {
      coverImageUrl = await ctx.storage.getUrl(tutorial.coverImageStorageId);
    }

    return { ...tutorial, coverImageUrl };
  },
});
