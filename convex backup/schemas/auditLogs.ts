import { defineTable } from "convex/server";
import { v } from "convex/values";
import { auditActionValidator } from "../lib/types";

export const auditLogsTable = defineTable({
  userId: v.id("users"), 
  action: auditActionValidator,
  targetType: v.string(), 
  targetId: v.string(), 
  details: v.optional(v.any()), 
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_action", ["action"])
  .index("by_targetType", ["targetType"])
  .index("by_createdAt", ["createdAt"]);
