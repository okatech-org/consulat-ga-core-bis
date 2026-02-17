import { defineTable } from "convex/server";
import { v } from "convex/values";
import { taskCodeValidator } from "../lib/taskCodes";
import { permissionEffectValidator } from "../lib/validators";

/**
 * Memberships table - User ↔ Org relationship
 *
 * Permissions are derived from:
 *   positionId → position.roleModuleCodes → roleModules.tasks
 *
 * Per-member overrides are stored inline in `specialPermissions`.
 */
export const membershipsTable = defineTable({
  userId: v.id("users"),
  orgId: v.id("orgs"),

  // Position-based role — links to position → roleModules → tasks
  positionId: v.optional(v.id("positions")),

  // Per-member permission overrides (grant/deny specific task codes)
  specialPermissions: v.optional(v.array(v.object({
    taskCode: taskCodeValidator,
    effect: permissionEffectValidator, // "grant" | "deny"
  }))),

  // Contact
  isPublicContact: v.optional(v.boolean()), // Visible in public contact directory

  deletedAt: v.optional(v.number()), // Soft delete
})
  // Note: by_user_org can be used for "by_user" queries via prefix matching
  .index("by_user_org", ["userId", "orgId"])
  .index("by_org", ["orgId"]);
