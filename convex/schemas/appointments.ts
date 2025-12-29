import { defineTable } from "convex/server";
import { v } from "convex/values";
import { appointmentStatusValidator } from "../lib/types";

export const appointmentsTable = defineTable({
  userId: v.id("users"),
  orgId: v.id("orgs"),
  serviceId: v.optional(v.id("services")),
  requestId: v.optional(v.id("serviceRequests")),
  date: v.string(), // YYYY-MM-DD
  startTime: v.string(), // HH:MM
  endTime: v.string(), // HH:MM
  status: appointmentStatusValidator,
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_orgId", ["orgId"])
  .index("by_date", ["date"])
  .index("by_orgId_date", ["orgId", "date"])
  .index("by_status", ["status"]);
