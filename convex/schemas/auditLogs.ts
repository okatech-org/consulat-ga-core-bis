import { defineTable } from "convex/server";
import { v } from "convex/values";
import { auditActionValidator } from "../lib/types";

export const auditLogsTable = defineTable({
  userId: v.id("users"), // Who performed the action
  action: auditActionValidator,
  targetType: v.string(), // "user" | "org" | "service" | "request"
  targetId: v.string(), // ID of the affected entity
  details: v.optional(v.any()), // Additional context (before/after values)
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_action", ["action"])
  .index("by_targetType", ["targetType"])
  .index("by_createdAt", ["createdAt"]);
