import { defineTable } from "convex/server";
import { v } from "convex/values";
import { memberRoleValidator } from "../lib/validators";

/**
 * Memberships table - User ↔ Org relationship
 * Single source of truth for org permissions
 */
export const membershipsTable = defineTable({
  userId: v.id("users"),
  orgId: v.id("orgs"),

  role: memberRoleValidator, // Base role: admin, agent, viewer
  
  // Diplomatic hierarchy role (optional, for consular staff)
  diplomaticRole: v.optional(v.string()), // e.g. 'consul_general', 'chancellor'
  
  permissions: v.optional(v.array(v.string())), // Fine-grained if needed

  deletedAt: v.optional(v.number()), // Soft delete
})
  // Note: by_user_org can be used for "by_user" queries via prefix matching
  .index("by_user_org", ["userId", "orgId"])
  .index("by_org", ["orgId"]);
