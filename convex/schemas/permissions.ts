import { defineTable } from "convex/server";
import { v } from "convex/values";
import { permissionEffectValidator } from "../lib/validators";
import { taskCodeValidator } from "../lib/taskCodes";

/**
 * Special Permissions table
 *
 * Per-member overrides for specific task codes.
 * Allows SuperAdmins to grant or deny specific permissions per member.
 *
 * Check order: SuperAdmin bypass → deny entry → grant entry → position tasks
 */
export const specialPermissionsTable = defineTable({
  membershipId: v.id("memberships"),
  taskCode: taskCodeValidator,
  effect: permissionEffectValidator, // grant | deny
  grantedBy: v.id("users"), // SuperAdmin who set this
  reason: v.optional(v.string()), // Optional justification
})
  .index("by_membership", ["membershipId"])
  .index("by_membership_taskCode", ["membershipId", "taskCode"]);
