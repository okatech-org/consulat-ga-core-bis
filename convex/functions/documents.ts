import { v } from "convex/values";
import { query } from "../_generated/server";
import { authMutation, authQuery } from "../lib/customFunctions";
import { requireOrgAgent } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import {
  documentStatusValidator,
  documentTypeCategoryValidator,
  detailedDocumentTypeValidator,
} from "../lib/validators";
import { ActivityType as EventType, DocumentStatus } from "../lib/constants";
import { Id } from "../_generated/dataModel";
import { fileObjectValidator } from "../schemas/documents";

const MAX_FILES_PER_DOCUMENT = 10;

/**
 * Get documents for an owner (user or org)
 */
export const getByOwner = query({
  args: {
    ownerId: v.union(v.id("users"), v.id("orgs")),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    return docs;
  },
});

/**
 * List documents for current user (My Space / Document Vault)
 */
export const listMine = authQuery({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) => q.eq("ownerId", ctx.user._id))
      .collect();

    return docs;
  },
});

/**
 * Get document by ID
 */
export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Get multiple documents by ID
 */
export const getDocumentsByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, args) => {
    const documents = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return documents.filter(Boolean);
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
 * Create document with initial file
 * Documents are owned by the current user
 */
export const create = authMutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    documentType: v.optional(detailedDocumentTypeValidator),
    category: v.optional(documentTypeCategoryValidator),
    label: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create document with single file in files array, owned by current user
    const docId = await ctx.db.insert("documents", {
      ownerId: ctx.user._id,
      documentType: args.documentType,
      category: args.category,
      label: args.label,
      expiresAt: args.expiresAt,
      files: [
        {
          storageId: args.storageId,
          filename: args.filename,
          mimeType: args.mimeType,
          sizeBytes: args.sizeBytes,
          uploadedAt: now,
        },
      ],
      status: DocumentStatus.Pending,
      updatedAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "document",
      targetId: docId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.DocumentUploaded,
      data: {
        ownerId: ctx.user._id,
        documentType: args.documentType,
        fileCount: 1,
      },
    });

    return docId;
  },
});

/**
 * Create document for a specific owner (org agents can create for orgs)
 */
export const createForOwner = authMutation({
  args: {
    ownerId: v.union(v.id("users"), v.id("orgs")),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    documentType: v.optional(detailedDocumentTypeValidator),
    category: v.optional(documentTypeCategoryValidator),
    label: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const docId = await ctx.db.insert("documents", {
      ownerId: args.ownerId,
      documentType: args.documentType,
      category: args.category,
      label: args.label,
      expiresAt: args.expiresAt,
      files: [
        {
          storageId: args.storageId,
          filename: args.filename,
          mimeType: args.mimeType,
          sizeBytes: args.sizeBytes,
          uploadedAt: now,
        },
      ],
      status: DocumentStatus.Pending,
      updatedAt: now,
    });

    return docId;
  },
});

/**
 * Add file to existing document
 */
export const addFile = authMutation({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw error(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    // Check file limit
    if (doc.files.length >= MAX_FILES_PER_DOCUMENT) {
      throw new Error(`Maximum ${MAX_FILES_PER_DOCUMENT} files per document`);
    }

    const now = Date.now();
    const newFile = {
      storageId: args.storageId,
      filename: args.filename,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      uploadedAt: now,
    };

    await ctx.db.patch(args.documentId, {
      files: [...doc.files, newFile],
      updatedAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "document",
      targetId: args.documentId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.DocumentUploaded,
      data: {
        action: "file_added",
        filename: args.filename,
        fileCount: doc.files.length + 1,
      },
    });

    return args.documentId;
  },
});

/**
 * Remove file from document
 */
export const removeFile = authMutation({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw error(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    const fileToRemove = doc.files.find((f) => f.storageId === args.storageId);
    if (!fileToRemove) {
      throw new Error("File not found in document");
    }

    // Delete from storage
    await ctx.storage.delete(args.storageId);

    // Remove from files array
    const updatedFiles = doc.files.filter(
      (f) => f.storageId !== args.storageId,
    );

    // If no files left, delete the entire document
    if (updatedFiles.length === 0) {
      await ctx.db.delete(args.documentId);
    } else {
      await ctx.db.patch(args.documentId, {
        files: updatedFiles,
        updatedAt: Date.now(),
      });
    }

    return true;
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

    await ctx.db.patch(args.documentId, {
      status: args.status,
      validatedBy: ctx.user._id,
      validatedAt: Date.now(),
      rejectionReason:
        args.status === DocumentStatus.Rejected ?
          args.rejectionReason
        : undefined,
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "document",
      targetId: args.documentId as unknown as string,
      actorId: ctx.user._id,
      type:
        args.status === DocumentStatus.Validated ?
          EventType.DocumentValidated
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
 * Delete a document (hard delete) and all its files from storage
 */
export const remove = authMutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw error(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    // Delete all files from storage
    for (const file of doc.files) {
      await ctx.storage.delete(file.storageId);
    }

    // Hard delete the document record
    await ctx.db.delete(args.documentId);

    return true;
  },
});

/**
 * Get URLs for all files in a document
 */
export const getUrls = authMutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw error(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    const urls = await Promise.all(
      doc.files.map(async (file) => ({
        storageId: file.storageId,
        filename: file.filename,
        mimeType: file.mimeType,
        url: await ctx.storage.getUrl(file.storageId),
      })),
    );

    return urls;
  },
});

/**
 * Get single file URL (legacy compatibility)
 */
export const getUrl = authMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
