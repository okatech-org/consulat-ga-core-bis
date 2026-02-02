import { defineTable } from "convex/server";
import { v } from "convex/values";
import { pricingValidator, requiredDocumentValidator, formSchemaValidator } from "../lib/validators";

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
  
  // Required documents for this service (can override service defaults)
  requiredDocuments: v.optional(v.array(requiredDocumentValidator)),

  // Form schema - typed structure for dynamic forms
  formSchema: v.optional(formSchemaValidator),

  // Availability & Appointments
  isActive: v.boolean(),
  requiresAppointment: v.optional(v.boolean()), // Appointment for document submission
  requiresAppointmentForPickup: v.optional(v.boolean()), // Appointment for document pickup
  availableSlots: v.optional(v.number()), // Limit if needed

  updatedAt: v.optional(v.number()),
})
  // Note: by_org_service can be used for "by_org" queries via prefix matching
  .index("by_org_service", ["orgId", "serviceId"])
  .index("by_org_active", ["orgId", "isActive"]);
