import { v } from "convex/values";
import { query } from "../_generated/server";
import { PostStatus } from "../lib/constants";

/**
 * List published community events, sorted by date descending
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const events = await ctx.db
      .query("communityEvents")
      .withIndex("by_date", (q) => q.eq("status", PostStatus.Published))
      .order("desc")
      .take(limit);

    // Resolve cover images
    return Promise.all(
      events.map(async (event) => {
        let coverImageUrl: string | null = null;
        if (event.coverImageStorageId) {
          coverImageUrl = await ctx.storage.getUrl(event.coverImageStorageId);
        }
        return { ...event, coverImageUrl };
      }),
    );
  },
});

/**
 * List upcoming community events (date > now)
 */
export const listUpcoming = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const now = Date.now();

    const events = await ctx.db
      .query("communityEvents")
      .withIndex("by_date", (q) => q.eq("status", PostStatus.Published))
      .order("asc")
      .collect();

    const upcoming = events.filter((e) => e.date > now).slice(0, limit);

    return Promise.all(
      upcoming.map(async (event) => {
        let coverImageUrl: string | null = null;
        if (event.coverImageStorageId) {
          coverImageUrl = await ctx.storage.getUrl(event.coverImageStorageId);
        }
        return { ...event, coverImageUrl };
      }),
    );
  },
});

/**
 * Get a single community event by slug (public)
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("communityEvents")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!event || event.status !== "published") {
      return null;
    }

    let coverImageUrl: string | null = null;
    if (event.coverImageStorageId) {
      coverImageUrl = await ctx.storage.getUrl(event.coverImageStorageId);
    }

    // Resolve gallery images
    const galleryImageUrls: string[] = [];
    if (event.galleryImageStorageIds) {
      for (const id of event.galleryImageStorageIds) {
        const url = await ctx.storage.getUrl(id);
        if (url) galleryImageUrls.push(url);
      }
    }

    return { ...event, coverImageUrl, galleryImageUrls };
  },
});
