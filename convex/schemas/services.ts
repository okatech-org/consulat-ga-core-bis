import { defineTable } from "convex/server";
import { v } from "convex/values";
import { serviceCategoryValidator, requiredDocumentValidator } from "../lib/types";

export const servicesTable = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  category: serviceCategoryValidator,
  orgId: v.id("orgs"),
  baseFee: v.number(),
  currency: v.string(),
  estimatedDays: v.optional(v.number()),
  requiredDocuments: v.array(requiredDocumentValidator),
  instructions: v.optional(v.string()),
  isActive: v.boolean(),
  requiresAppointment: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_orgId", ["orgId"])
  .index("by_category", ["category"])
  .index("by_slug", ["slug"])
  .index("by_isActive", ["isActive"])
  .index("by_orgId_isActive", ["orgId", "isActive"]);
