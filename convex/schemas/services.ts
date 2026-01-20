import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  serviceCategoryValidator,
  localizedStringValidator,
  serviceDefaultsValidator,
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

  category: serviceCategoryValidator,
  icon: v.optional(v.string()),

  // Default configuration
  defaults: serviceDefaultsValidator,

  // Form schema (JSON Schema or custom)
  formSchema: v.optional(v.any()),

  // Status
  isActive: v.boolean(),
  updatedAt: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_code", ["code"])
  .index("by_category_active", ["category", "isActive"]);
