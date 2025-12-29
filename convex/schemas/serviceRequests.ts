import { defineTable } from "convex/server";
import { v } from "convex/values";
import { requestStatusValidator, requestPriorityValidator } from "../lib/types";

export const serviceRequestsTable = defineTable({
  userId: v.id("users"),
  serviceId: v.id("services"),
  orgId: v.id("orgs"),
  status: requestStatusValidator,
  formData: v.optional(v.any()),
  referenceNumber: v.optional(v.string()),
  submittedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  assignedTo: v.optional(v.id("users")),
  priority: v.optional(requestPriorityValidator),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_serviceId", ["serviceId"])
  .index("by_orgId", ["orgId"])
  .index("by_status", ["status"])
  .index("by_referenceNumber", ["referenceNumber"])
  .index("by_orgId_status", ["orgId", "status"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_assignedTo", ["assignedTo"]);

export const requestNotesTable = defineTable({
  requestId: v.id("serviceRequests"),
  authorId: v.id("users"),
  content: v.string(),
  isInternal: v.boolean(),
  createdAt: v.number(),
}).index("by_requestId", ["requestId"]);
