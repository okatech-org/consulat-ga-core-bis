import { defineTable } from "convex/server";
import { v } from "convex/values";
import { serviceCategoryValidator, requiredDocumentValidator } from "../lib/types";

/**
 * Global service catalog - canonical definitions shared across all consulates.
 * Individual orgs link to these via the orgServices table with local overrides.
 */
export const commonServicesTable = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  category: serviceCategoryValidator,
  defaultDocuments: v.array(requiredDocumentValidator),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_category", ["category"])
  .index("by_isActive", ["isActive"]);
