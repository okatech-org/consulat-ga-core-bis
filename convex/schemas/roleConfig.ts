import { defineTable } from "convex/server";
import { v } from "convex/values";
import { localizedStringValidator } from "../lib/validators";

/**
 * Role Modules — Custom or system-defined groups of tasks
 */
export const roleModulesTable = defineTable({
  code: v.string(), // Unique identifier (e.g. "civil_status")
  label: localizedStringValidator, // LocalizedString: { fr: "...", en: "..." }
  description: localizedStringValidator,
  icon: v.optional(v.string()), // Lucide icon name (e.g. "Crown")
  color: v.optional(v.string()), // Tailwind color class
  tasks: v.array(v.string()), // Task codes (e.g. ["requests.view", "documents.validate"])
  isSystem: v.boolean(), // System-defined (cannot be deleted)
  orgId: v.optional(v.id("orgs")), // null = global, set = org-specific
  isActive: v.boolean(),
  createdBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
})
  .index("by_code", ["code"])
  .index("by_org", ["orgId", "isActive"])
  .index("by_system", ["isSystem", "isActive"]);

/**
 * Positions — Job titles within an organization
 */
export const positionsTable = defineTable({
  orgId: v.id("orgs"), // Which organization this position belongs to
  code: v.string(), // Unique within org (e.g. "vice_consul")
  title: localizedStringValidator, // LocalizedString: { fr: "...", en: "..." }
  description: v.optional(localizedStringValidator),
  level: v.number(), // Hierarchy level (1 = highest)
  grade: v.optional(v.string()), // PositionGrade: "chief" | "counselor" | "agent" | "external"
  ministryGroupId: v.optional(v.id("ministryGroups")),
  roleModuleCodes: v.array(v.string()), // Assigned role modules (by code, resolved at runtime)
  isRequired: v.boolean(), // Must always exist in this org
  isActive: v.boolean(),
  createdBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
})
  .index("by_org", ["orgId", "isActive"])
  .index("by_org_code", ["orgId", "code"])
  .index("by_org_level", ["orgId", "level"]);

/**
 * Org Role Config — Tracks which template an org uses
 */
export const orgRoleConfigTable = defineTable({
  orgId: v.id("orgs"), // One config per org
  templateType: v.optional(v.string()), // OrganizationType value: "embassy" | "general_consulate" | etc.
  isCustomized: v.boolean(), // Has deviated from template
  initializedAt: v.number(), // When the template was applied
  lastModifiedAt: v.optional(v.number()),
  lastModifiedBy: v.optional(v.id("users")),
}).index("by_org", ["orgId"]);

/**
 * Ministry Groups — Organizational sub-groups within a diplomatic post
 */
export const ministryGroupsTable = defineTable({
  orgId: v.id("orgs"), // Which org this group belongs to
  code: v.string(), // e.g. "mae", "finances", "defense"
  label: localizedStringValidator, // LocalizedString: { fr: "...", en: "..." }
  description: v.optional(localizedStringValidator),
  icon: v.optional(v.string()), // Lucide icon name
  sortOrder: v.number(), // Display order
  parentCode: v.optional(v.string()), // For sub-directions
  isActive: v.boolean(),
  createdBy: v.optional(v.id("users")),
  deletedAt: v.optional(v.number()),
})
  .index("by_org", ["orgId", "isActive"])
  .index("by_org_code", ["orgId", "code"]);
