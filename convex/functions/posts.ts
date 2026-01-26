import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import {
  postCategoryValidator,
  postStatusValidator,
  PostCategory,
  PostStatus,
} from "../lib/validators";
import { requireAuth, requireOrgAgent, requireSuperadmin } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";

// ============================================================================
// PUBLIC QUERIES
// ============================================================================

/**
 * List published posts with optional category filter
 */
export const list = query({
  args: {
    category: v.optional(postCategoryValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("status", PostStatus.Published))
      .order("desc");

    const posts = await postsQuery.take(100);

    // Filter by category if specified
    let filtered = args.category
      ? posts.filter((p) => p.category === args.category)
      : posts;

    // Get cover image URLs
    const postsWithImages = await Promise.all(
      filtered.slice(0, limit).map(async (post) => {
        const coverImageUrl = post.coverImageStorageId
          ? await ctx.storage.getUrl(post.coverImageStorageId)
          : null;
        const documentUrl = post.documentStorageId
          ? await ctx.storage.getUrl(post.documentStorageId)
          : null;

        return {
          ...post,
          coverImageUrl,
          documentUrl,
        };
      })
    );

    return postsWithImages;
  },
});

/**
 * Get latest posts for homepage
 */
export const getLatest = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 4;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("status", PostStatus.Published))
      .order("desc")
      .take(limit);

    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const coverImageUrl = post.coverImageStorageId
          ? await ctx.storage.getUrl(post.coverImageStorageId)
          : null;

        return {
          ...post,
          coverImageUrl,
        };
      })
    );

    return postsWithImages;
  },
});

/**
 * Get a single post by slug (public)
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), PostStatus.Published))
      .unique();

    if (!post) return null;

    const coverImageUrl = post.coverImageStorageId
      ? await ctx.storage.getUrl(post.coverImageStorageId)
      : null;
    const documentUrl = post.documentStorageId
      ? await ctx.storage.getUrl(post.documentStorageId)
      : null;

    // Get org info if linked
    const org = post.orgId ? await ctx.db.get(post.orgId) : null;

    return {
      ...post,
      coverImageUrl,
      documentUrl,
      org: org ? { name: org.name, slug: org.slug } : null,
    };
  },
});

// ============================================================================
// SUPERADMIN QUERIES
// ============================================================================

/**
 * List all posts (superadmin only)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    // Auth check done on frontend - this returns all for superadmin use
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .collect();

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const coverImageUrl = post.coverImageStorageId
          ? await ctx.storage.getUrl(post.coverImageStorageId)
          : null;

        // Get author and org names
        const author = await ctx.db.get(post.authorId);
        const org = post.orgId ? await ctx.db.get(post.orgId) : null;

        return {
          ...post,
          coverImageUrl,
          authorName: author?.name ?? "Inconnu",
          orgName: org?.name ?? "Global",
        };
      })
    );

    return postsWithDetails;
  },
});

// ============================================================================
// DASHBOARD QUERIES (Org context)
// ============================================================================

/**
 * List posts for a specific organization (dashboard)
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();

    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const coverImageUrl = post.coverImageStorageId
          ? await ctx.storage.getUrl(post.coverImageStorageId)
          : null;

        // Get author name
        const author = await ctx.db.get(post.authorId);

        return {
          ...post,
          coverImageUrl,
          authorName: author?.name ?? "Inconnu",
        };
      })
    );

    return postsWithImages;
  },
});

/**
 * Get a single post by ID (for editing)
 */
export const getById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const coverImageUrl = post.coverImageStorageId
      ? await ctx.storage.getUrl(post.coverImageStorageId)
      : null;
    const documentUrl = post.documentStorageId
      ? await ctx.storage.getUrl(post.documentStorageId)
      : null;

    return {
      ...post,
      coverImageUrl,
      documentUrl,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new post
 */
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: postCategoryValidator,
    coverImageStorageId: v.optional(v.id("_storage")),
    orgId: v.optional(v.id("orgs")),

    // Event-specific
    eventStartAt: v.optional(v.number()),
    eventEndAt: v.optional(v.number()),
    eventLocation: v.optional(v.string()),
    eventTicketUrl: v.optional(v.string()),

    // Communique-specific
    documentStorageId: v.optional(v.id("_storage")),

    // Optional: publish immediately
    publish: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Auth check
    let user;
    if (args.orgId) {
      const result = await requireOrgAgent(ctx, args.orgId);
      user = result.user;
    } else {
      // Global post requires superadmin
      user = await requireSuperadmin(ctx);
    }

    // Validate communique has document
    if (args.category === PostCategory.Communique && !args.documentStorageId) {
      throw error(ErrorCode.POST_DOCUMENT_REQUIRED, "Les communiqués officiels doivent avoir un document PDF joint");
    }

    // Check slug uniqueness
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw error(ErrorCode.POST_SLUG_EXISTS, "Un article avec ce slug existe déjà");
    }

    const now = Date.now();
    const status = args.publish ? PostStatus.Published : PostStatus.Draft;

    const postId = await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      category: args.category,
      coverImageStorageId: args.coverImageStorageId,
      status,
      publishedAt: args.publish ? now : undefined,
      createdAt: now,
      orgId: args.orgId,
      authorId: user._id,

      // Event fields
      eventStartAt: args.eventStartAt,
      eventEndAt: args.eventEndAt,
      eventLocation: args.eventLocation,
      eventTicketUrl: args.eventTicketUrl,

      // Communique fields
      documentStorageId: args.documentStorageId,
    });

    return postId;
  },
});

/**
 * Update an existing post
 */
export const update = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(postCategoryValidator),
    coverImageStorageId: v.optional(v.id("_storage")),

    // Event-specific
    eventStartAt: v.optional(v.number()),
    eventEndAt: v.optional(v.number()),
    eventLocation: v.optional(v.string()),
    eventTicketUrl: v.optional(v.string()),

    // Communique-specific
    documentStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw error(ErrorCode.POST_NOT_FOUND, "Article non trouvé");
    }

    // Auth check
    if (post.orgId) {
      await requireOrgAgent(ctx, post.orgId);
    } else {
      await requireSuperadmin(ctx);
    }

    // If slug is changing, check uniqueness
    if (args.slug && args.slug !== post.slug) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .unique();

      if (existing) {
        throw error(ErrorCode.POST_SLUG_EXISTS, "Un article avec ce slug existe déjà");
      }
    }

    // Validate communique has document
    const newCategory = args.category ?? post.category;
    const newDocumentId = args.documentStorageId ?? post.documentStorageId;

    if (newCategory === PostCategory.Communique && !newDocumentId) {
      throw error(ErrorCode.POST_DOCUMENT_REQUIRED, "Les communiqués officiels doivent avoir un document PDF joint");
    }

    const { postId, ...updates } = args;

    await ctx.db.patch(postId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return postId;
  },
});

/**
 * Publish or unpublish a post
 */
export const setStatus = mutation({
  args: {
    postId: v.id("posts"),
    status: postStatusValidator,
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw error(ErrorCode.POST_NOT_FOUND, "Article non trouvé");
    }

    // Auth check
    if (post.orgId) {
      await requireOrgAgent(ctx, post.orgId);
    } else {
      await requireSuperadmin(ctx);
    }

    // Validate communique has document before publishing
    if (
      args.status === PostStatus.Published &&
      post.category === PostCategory.Communique &&
      !post.documentStorageId
    ) {
      throw error(ErrorCode.POST_DOCUMENT_REQUIRED, "Impossible de publier un communiqué sans document PDF");
    }

    await ctx.db.patch(args.postId, {
      status: args.status,
      publishedAt:
        args.status === PostStatus.Published ? Date.now() : post.publishedAt,
      updatedAt: Date.now(),
    });

    return args.postId;
  },
});

/**
 * Delete a post
 */
export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw error(ErrorCode.POST_NOT_FOUND, "Article non trouvé");
    }

    // Auth check
    if (post.orgId) {
      await requireOrgAgent(ctx, post.orgId);
    } else {
      await requireSuperadmin(ctx);
    }

    // Delete associated files from storage
    if (post.coverImageStorageId) {
      await ctx.storage.delete(post.coverImageStorageId);
    }
    if (post.documentStorageId) {
      await ctx.storage.delete(post.documentStorageId);
    }

    await ctx.db.delete(args.postId);

    return args.postId;
  },
});
