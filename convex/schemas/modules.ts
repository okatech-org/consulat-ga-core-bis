import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Module Definitions — Global catalog of platform modules
 */
export const moduleDefinitionsTable = defineTable({
  key: v.string(), // Unique slug (e.g. "passports", "civil_status")
  name: v.string(), // Display name
  description: v.string(),
  icon: v.optional(v.string()), // Lucide icon name
  color: v.optional(v.string()), // CSS class
  category: v.string(), // "core" | "service" | "admin" | "communication"
  version: v.optional(v.string()), // Semantic version
  isCore: v.boolean(), // Core module (always active, cannot be disabled)
  dependencies: v.optional(v.array(v.string())), // Required module keys
  requiredPermissions: v.optional(v.array(v.string())), // Required tasks to use this module
  defaultConfig: v.optional(v.string()), // JSON string of default config
  configSchema: v.optional(v.string()), // JSON Schema for validation
  displayOrder: v.number(), // Sort order in UI
  targetRoles: v.optional(v.array(v.string())), // Roles that can access this module
  targetOrgTypes: v.optional(v.array(v.string())), // Org types that can use this module
  isActive: v.boolean(),
  createdBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
})
  .index("by_key", ["key"])
  .index("by_category", ["category", "isActive"])
  .index("by_active", ["isActive", "displayOrder"]);

/**
 * Org Module Configs — Per-org module activation and configuration
 */
export const orgModuleConfigsTable = defineTable({
  orgId: v.id("orgs"),
  moduleKey: v.string(), // References moduleDefinitions.key
  isEnabled: v.boolean(),
  customConfig: v.optional(v.string()), // JSON string of custom config
  displayOrder: v.optional(v.number()), // Org-level sort override
  enabledAt: v.optional(v.number()),
  enabledBy: v.optional(v.id("users")),
  disabledAt: v.optional(v.number()),
  disabledBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
})
  .index("by_org", ["orgId", "isEnabled"])
  .index("by_org_module", ["orgId", "moduleKey"]);
