import { v } from "convex/values";
import { query } from "../_generated/server";
import { authMutation, authQuery } from "../lib/customFunctions";
import { requireOrgAgent } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import { notDeleted } from "../lib/utils";
import { ownerTypeValidator, documentStatusValidator, EventType, DocumentStatus, OwnerType } from "../lib/validators";
import { Id } from "../_generated/dataModel";

/**
 * Get documents for an owner (profile or request)
 */
export const getByOwner = query({
  args: {
    ownerType: ownerTypeValidator,
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", args.ownerType).eq("ownerId", args.ownerId)
      )
      .collect();

    return notDeleted(docs);
  },
});

/**
 * List documents for current user (My Space)
 */
export const listMine = authQuery({
  args: {},
  handler: async (ctx) => {
    // 1. Get profile to get profile documents
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) return [];

    // 2. We could fetch by ownerType=profile and ownerId=profile._id
    // But mistakes in frontend might have used userId.
    // Let's search for ownerType="profile" and ownerId=profile._id
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Profile).eq("ownerId", profile._id as unknown as string)
      )
      .collect();

    return notDeleted(docs);
  },
});

/**
 * Get document by ID
 */
export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (doc?.deletedAt) return null;
    return doc;
  },
});

/**
 * Get multiple documents by ID
 */
export const getDocumentsByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, args) => {
    const documents = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return documents.filter((doc) => doc && !doc.deletedAt).filter(Boolean);
  },
});

/**
 * Generate upload URL for a new document
 */
export const generateUploadUrl = authMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create document record after upload
 */
export const create = authMutation({
  args: {
    ownerType: ownerTypeValidator,
    ownerId: v.string(),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    documentType: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("documents", {
      ...args,
      status: DocumentStatus.Pending,
      updatedAt: Date.now(),
    });

    // If document belongs to a request, link it to request.documents array
    if (args.ownerType === OwnerType.Request) {
      const request = await ctx.db.get(args.ownerId as Id<"requests">);
      if (request) {
        const currentDocs = request.documents || [];
        await ctx.db.patch(request._id, {
          documents: [...currentDocs, docId],
          updatedAt: Date.now(),
        });
      }
    }

    // Log event
    await ctx.db.insert("events", {
      targetType: "document",
      targetId: docId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.DocumentUploaded,
      data: {
        ownerType: args.ownerType,
        ownerId: args.ownerId,
        documentType: args.documentType,
      },
    });

    return docId;
  },
});

/**
 * Validate a document (org agent only)
 */
export const validate = authMutation({
  args: {
    documentId: v.id("documents"),
    status: documentStatusValidator,
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw error(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    // Need to determine org from owner
    // If owner is request, get org from request
    if (doc.ownerType === OwnerType.Request) {
      const request = await ctx.db.get(doc.ownerId as Id<"requests">);
      if (request) {
        await requireOrgAgent(ctx, request.orgId);
      }
    }
    // For profile documents, require superadmin or specific logic

    await ctx.db.patch(args.documentId, {
      status: args.status,
      validatedBy: ctx.user._id,
      validatedAt: Date.now(),
      rejectionReason:
        args.status === DocumentStatus.Rejected
          ? args.rejectionReason
          : undefined,
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "document",
      targetId: args.documentId as unknown as string,
      actorId: ctx.user._id,
      type:
        args.status === DocumentStatus.Validated
          ? EventType.DocumentValidated
          : EventType.DocumentRejected,
      data: {
        status: args.status,
        reason: args.rejectionReason,
      },
    });

    return args.documentId;
  },
});

/**
 * Delete a document (soft delete)
 */
export const remove = authMutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw error(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    // Delete from storage
    await ctx.storage.delete(doc.storageId);

    // Soft delete record
    await ctx.db.patch(args.documentId, {
      deletedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Get document URL
 */
export const getUrl = authMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
