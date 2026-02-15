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

  role: memberRoleValidator, // Base role fallback: admin, agent, viewer

  // Position-based role (replaces diplomaticRole)
  positionId: v.optional(v.id("positions")), // Links to position → roleModules → tasks

  // @deprecated — use positionId instead. Kept for migration compatibility.
  diplomaticRole: v.optional(v.string()),

  permissions: v.optional(v.array(v.string())), // Fine-grained overrides

  // Contact
  isPublicContact: v.optional(v.boolean()), // Visible in public contact directory

  deletedAt: v.optional(v.number()), // Soft delete
})
  // Note: by_user_org can be used for "by_user" queries via prefix matching
  .index("by_user_org", ["userId", "orgId"])
  .index("by_org", ["orgId"]);
