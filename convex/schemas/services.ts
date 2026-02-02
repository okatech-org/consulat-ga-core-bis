import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  serviceCategoryValidator,
  localizedStringValidator,
  formSchemaValidator,
} from "../lib/validators";

/**
 * Services table - global catalog (read-only for orgs)
 * Managed by superadmins
 * 
 * Note: Required documents are now part of formSchema.joinedDocuments
 */
export const servicesTable = defineTable({
  slug: v.string(),
  code: v.string(), // ex: "PASSPORT_NEW", "CONSULAR_CARD"

  // Localized content
  name: localizedStringValidator,
  description: localizedStringValidator,
  content: v.optional(localizedStringValidator), // HTML from Tiptap editor

  category: serviceCategoryValidator,
  icon: v.optional(v.string()),

  // Processing info
  estimatedDays: v.number(),
  requiresAppointment: v.boolean(),

  // Form schema - typed structure for dynamic forms
  // Includes sections, joinedDocuments, and showRecap
  formSchema: v.optional(formSchemaValidator),

  // Status
  isActive: v.boolean(),
  updatedAt: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_code", ["code"])
  .index("by_category_active", ["category", "isActive"]);

