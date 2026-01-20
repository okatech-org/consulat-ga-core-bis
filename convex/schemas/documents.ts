import { defineTable } from "convex/server";
import { v } from "convex/values";
import { ownerTypeValidator, documentStatusValidator } from "../lib/validators";

/**
 * Documents table - uploaded files
 * Polymorphic owner (profile or request)
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

  // Validation
  status: documentStatusValidator,
  validatedBy: v.optional(v.id("users")),
  validatedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  // Expiration if applicable
  expiresAt: v.optional(v.number()),

  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()), // Soft delete
})
  .index("by_owner", ["ownerType", "ownerId"])
  .index("by_owner_status", ["ownerType", "ownerId", "status"]);
