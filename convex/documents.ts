import { v } from "convex/values";
import { authMutation, authQuery } from "./lib/customFunctions";
import { DocumentStatus } from "./lib/types";

export const generateUploadUrl = authMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = authMutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    size: v.number(),
    type: v.string(), // MIME type
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      userId: ctx.user._id,
      name: args.name,
      storageId: args.storageId,
      size: args.size,
      type: args.type,
      status: DocumentStatus.PENDING,
      uploadedAt: Date.now(),
    });
  },
});

export const getUrl = authMutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    }
});

export const deleteDocument = authMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== ctx.user._id) throw new Error("Unauthorized");

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(args.documentId);
    
    // Also remove from any profile or request referencing it?
    // For now, allow orphan deletion if manual. 
    // Ideally we'd remove references, but that requires knowing where it is used.
  },
});

export const getDocumentsByIds = authQuery({
    args: { ids: v.array(v.id("documents")) },
    handler: async (ctx, args) => {
        const docs = await Promise.all(args.ids.map(id => ctx.db.get(id)));
        return docs.filter(doc => doc !== null);
    }
});

export const listMyDocuments = authQuery({
    args: {},
    handler: async (ctx) => {
        const docs = await ctx.db
            .query("documents")
            .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
            .order("desc")
            .collect();
        return docs;
    }
});
