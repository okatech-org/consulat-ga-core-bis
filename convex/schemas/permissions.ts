import { defineTable } from "convex/server";
import { v } from "convex/values";
import { permissionEffectValidator } from "../lib/validators";

/**
 * Dynamic Permissions table
 *
 * Supplements the hardcoded role-based permission system.
 * Allows SuperAdmins to grant or deny specific permissions per member,
 * covering both resource actions (e.g. "requests.process")
 * and feature access (e.g. "feature.email").
 *
 * Check order: SuperAdmin bypass → deny entry → grant entry → hardcoded logic
 */
export const permissionsTable = defineTable({
  membershipId: v.id("memberships"),
  permission: v.string(), // "resource.action" or "feature.name"
  effect: permissionEffectValidator, // grant | deny
  grantedBy: v.id("users"), // SuperAdmin who set this
  reason: v.optional(v.string()), // Optional justification
})
  .index("by_membership", ["membershipId"])
  .index("by_membership_permission", ["membershipId", "permission"]);
