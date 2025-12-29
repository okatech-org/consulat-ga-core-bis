import { defineTable } from "convex/server";
import { v } from "convex/values";
import { requiredDocumentValidator } from "../lib/types";

/**
 * Organization-specific service configurations.
 * Links an org to a global commonService with local overrides (fees, instructions, etc).
 */
export const orgServicesTable = defineTable({
  orgId: v.id("orgs"),
  serviceId: v.id("commonServices"),
  isActive: v.boolean(),
  fee: v.number(),
  currency: v.string(),
  estimatedDays: v.optional(v.number()),
  customDescription: v.optional(v.string()),
  customDocuments: v.optional(v.array(requiredDocumentValidator)),
  instructions: v.optional(v.string()),
  requiresAppointment: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_orgId", ["orgId"])
  .index("by_serviceId", ["serviceId"])
  .index("by_orgId_isActive", ["orgId", "isActive"])
  .index("by_orgId_serviceId", ["orgId", "serviceId"]);
