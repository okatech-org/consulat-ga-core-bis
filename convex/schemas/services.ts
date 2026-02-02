import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  serviceCategoryValidator,
  localizedStringValidator,
  formDocumentValidator,
} from "../lib/validators";

/**
 * Services table - global catalog (read-only for orgs)
 * Managed by superadmins
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

  // Required documents (labels are localized)
  requiredDocuments: v.array(formDocumentValidator),

  // Status
  isActive: v.boolean(),
  updatedAt: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_code", ["code"])
  .index("by_category_active", ["category", "isActive"]);

