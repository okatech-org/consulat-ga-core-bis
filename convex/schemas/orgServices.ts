import { defineTable } from "convex/server";
import { v } from "convex/values";
import { pricingValidator, requiredDocumentValidator } from "../lib/validators";

/**
 * OrgServices table - service configuration per org
 * Links services catalog to organizations with custom pricing/config
 */
export const orgServicesTable = defineTable({
  orgId: v.id("orgs"),
  serviceId: v.id("services"),

  // Pricing
  pricing: pricingValidator,
  estimatedDays: v.optional(v.number()), // Override service default

  // Custom content
  instructions: v.optional(v.string()),
  customDocuments: v.optional(v.array(requiredDocumentValidator)),

  // Form schema (JSON Schema or custom) - org-specific
  formSchema: v.optional(v.any()),

  // Availability
  isActive: v.boolean(),
  availableSlots: v.optional(v.number()), // Limit if needed

  updatedAt: v.optional(v.number()),
})
  // Note: by_org_service can be used for "by_org" queries via prefix matching
  .index("by_org_service", ["orgId", "serviceId"])
  .index("by_org_active", ["orgId", "isActive"]);
