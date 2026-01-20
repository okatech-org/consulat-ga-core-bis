import { defineTable } from "convex/server";
import { v } from "convex/values";
import { requestStatusValidator, requestPriorityValidator } from "../lib/validators";

/**
 * Requests table - service requests from users
 * Status is denormalized from events for fast queries
 */
export const requestsTable = defineTable({
  // References
  userId: v.id("users"),
  profileId: v.optional(v.id("profiles")),
  orgId: v.id("orgs"),
  orgServiceId: v.id("orgServices"),

  // Public reference
  reference: v.string(), // "REQ-2024-ABC123"

  // State (denormalized from events)
  status: requestStatusValidator,
  priority: requestPriorityValidator,

  // Form data (validated by service formSchema)
  formData: v.optional(v.any()),

  // Assignment
  assignedTo: v.optional(v.id("users")),

  // Denormalized timestamps
  submittedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  updatedAt: v.optional(v.number()),
})
  .index("by_reference", ["reference"])
  .index("by_org_status", ["orgId", "status"])
  .index("by_user_status", ["userId", "status"])
  .index("by_assigned", ["assignedTo"]);
