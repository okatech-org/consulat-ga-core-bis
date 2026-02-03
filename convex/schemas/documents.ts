import { defineTable } from "convex/server";
import { v } from "convex/values";
import { ownerTypeValidator, documentStatusValidator, documentCategoryValidator } from "../lib/validators";

/**
 * Documents table - uploaded files
 * Polymorphic owner (profile or request)
 * Also serves as the document vault (e-Documents)
 */
export const documentsTable = defineTable({
  // Owner (polymorphic)
  ownerType: ownerTypeValidator,
  ownerId: v.string(), // ID as string to support both profile and request IDs

  // File info
  storageId: v.id("_storage"),
  filename: v.string(),
  mimeType: v.string(),
  sizeBytes: v.number(),

  // Classification
  documentType: v.string(), // "passport", "birth_certificate", etc.
  
  // Category for document vault organization (e-Documents)
  category: v.optional(documentCategoryValidator),
  
  // User-facing description
  description: v.optional(v.string()),

  // Validation
  status: documentStatusValidator,
  validatedBy: v.optional(v.id("users")),
  validatedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  // Expiration tracking (for document vault alerts)
  expiresAt: v.optional(v.number()),
  
  // Whether this is a vault document (vs request attachment)
  isVaultDocument: v.optional(v.boolean()),

  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()), // Soft delete
})
  .index("by_owner", ["ownerType", "ownerId"])
  .index("by_owner_status", ["ownerType", "ownerId", "status"])
  .index("by_category", ["ownerType", "ownerId", "category"]);
