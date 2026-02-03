/**
 * Document Vault Functions (e-Documents)
 * 
 * Personal document storage with categorization and expiration tracking.
 */

import { v } from "convex/values";
import { authQuery, authMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import { OwnerType, DocumentStatus, DocumentCategory } from "../lib/constants";
import { documentCategoryValidator } from "../lib/validators";

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all vault documents for current user
 */
export const getMyVault = authQuery({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Profile).eq("ownerId", ctx.user._id)
      )
      .collect();

    // Filter vault documents only (not request attachments)
    return documents.filter((d) => d.isVaultDocument && !d.deletedAt);
  },
});

/**
 * Get vault documents by category
 */
export const getByCategory = authQuery({
  args: { category: documentCategoryValidator },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_category", (q) =>
        q
          .eq("ownerType", OwnerType.Profile)
          .eq("ownerId", ctx.user._id)
          .eq("category", args.category)
      )
      .collect();

    return documents.filter((d) => d.isVaultDocument && !d.deletedAt);
  },
});

/**
 * Get expiring documents (within X days)
 */
export const getExpiring = authQuery({
  args: { daysAhead: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.daysAhead ?? 30; // Default 30 days
    const threshold = Date.now() + days * 24 * 60 * 60 * 1000;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Profile).eq("ownerId", ctx.user._id)
      )
      .collect();

    return documents
      .filter(
        (d) =>
          d.isVaultDocument &&
          !d.deletedAt &&
          d.expiresAt &&
          d.expiresAt <= threshold
      )
      .sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0));
  },
});

/**
 * Get vault statistics
 */
export const getStats = authQuery({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Profile).eq("ownerId", ctx.user._id)
      )
      .collect();

    const vaultDocs = documents.filter((d) => d.isVaultDocument && !d.deletedAt);
    
    // Count by category
    const byCategory: Record<string, number> = {};
    for (const doc of vaultDocs) {
      const cat = doc.category ?? "other";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }

    // Count expiring
    const now = Date.now();
    const thirtyDays = now + 30 * 24 * 60 * 60 * 1000;
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;

    const expiringSoon = vaultDocs.filter(
      (d) => d.expiresAt && d.expiresAt <= thirtyDays
    ).length;
    const expiringUrgent = vaultDocs.filter(
      (d) => d.expiresAt && d.expiresAt <= sevenDays
    ).length;
    const expired = vaultDocs.filter(
      (d) => d.expiresAt && d.expiresAt <= now
    ).length;

    return {
      total: vaultDocs.length,
      byCategory,
      expiringSoon,
      expiringUrgent,
      expired,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add document to vault
 */
export const addToVault = authMutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    documentType: v.string(),
    category: documentCategoryValidator,
    description: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ownerType: OwnerType.Profile,
      ownerId: ctx.user._id,
      storageId: args.storageId,
      filename: args.filename,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      documentType: args.documentType,
      category: args.category,
      description: args.description,
      expiresAt: args.expiresAt,
      status: DocumentStatus.Pending, // Can be validated later
      isVaultDocument: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update vault document metadata
 */
export const updateDocument = authMutation({
  args: {
    id: v.id("documents"),
    category: v.optional(documentCategoryValidator),
    description: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);

    if (!doc || doc.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Document not found");
    }

    if (doc.ownerId !== ctx.user._id) {
      throw error(ErrorCode.FORBIDDEN, "Access denied");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Remove from vault (soft delete)
 */
export const removeFromVault = authMutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);

    if (!doc) {
      throw error(ErrorCode.NOT_FOUND, "Document not found");
    }

    if (doc.ownerId !== ctx.user._id) {
      throw error(ErrorCode.FORBIDDEN, "Access denied");
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Move document to different category
 */
export const changeCategory = authMutation({
  args: {
    id: v.id("documents"),
    category: documentCategoryValidator,
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);

    if (!doc || doc.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Document not found");
    }

    if (doc.ownerId !== ctx.user._id) {
      throw error(ErrorCode.FORBIDDEN, "Access denied");
    }

    await ctx.db.patch(args.id, {
      category: args.category,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Set expiration date
 */
export const setExpiration = authMutation({
  args: {
    id: v.id("documents"),
    expiresAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);

    if (!doc || doc.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Document not found");
    }

    if (doc.ownerId !== ctx.user._id) {
      throw error(ErrorCode.FORBIDDEN, "Access denied");
    }

    await ctx.db.patch(args.id, {
      expiresAt: args.expiresAt ?? undefined,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
