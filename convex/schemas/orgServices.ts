import { defineTable } from "convex/server";
import { v } from "convex/values";
import { pricingValidator, formSchemaValidator } from "../lib/validators";

/**
 * OrgServices table - service configuration per org
 * Links services catalog to organizations with custom pricing/config
 * 
 * Note: Required documents are now part of formSchema.joinedDocuments
 */
export const orgServicesTable = defineTable({
  orgId: v.id("orgs"),
  serviceId: v.id("services"),

  // Pricing
  pricing: pricingValidator,
  estimatedDays: v.optional(v.number()), // Override service default

  // Custom content
  instructions: v.optional(v.string()),

  // Form schema - typed structure for dynamic forms
  // Includes sections, joinedDocuments, and showRecap
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
