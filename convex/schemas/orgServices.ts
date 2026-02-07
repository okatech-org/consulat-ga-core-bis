import { defineTable } from "convex/server";
import { v } from "convex/values";
import { pricingValidator, formSchemaValidator } from "../lib/validators";

/**
 * OrgServices table - service configuration per org
 * Links services catalog to organizations with custom pricing/config
 *
 * Note: formSchema and joinedDocuments are now managed at the service level
 * by the super admin. Org admins only configure pricing, appointments, and instructions.
 */
export const orgServicesTable = defineTable({
  orgId: v.id("orgs"),
  serviceId: v.id("services"),

  // Pricing
  pricing: pricingValidator,
  estimatedDays: v.optional(v.number()), // Override service default

  // Custom content
  instructions: v.optional(v.string()),

  // @deprecated - formSchema is now on the parent service.
  // Kept temporarily for migration. Will be removed after data cleanup.
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
