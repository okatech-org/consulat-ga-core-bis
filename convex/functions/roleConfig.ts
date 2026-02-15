import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireAuth, requireOrgAdmin } from "../lib/auth";
import { isSuperAdmin } from "../lib/permissions";
import { error, ErrorCode } from "../lib/errors";
import { localizedStringValidator } from "../lib/validators";
import {
  TASK_CATALOG,
  DEFAULT_ROLE_MODULES,
  ORGANIZATION_TEMPLATES,
  getOrgTemplate,
  type OrgTemplateType,
} from "../lib/roles";

// ═══════════════════════════════════════════════════════════════
// QUERIES — Static catalogs
// ═══════════════════════════════════════════════════════════════

/**
 * Get the full task catalog (static, from code)
 */
export const getTaskCatalog = query({
  args: {},
  handler: async () => {
    return TASK_CATALOG;
  },
});

/**
 * Get all available organization templates (static)
 */
export const getOrgTemplates = query({
  args: {},
  handler: async () => {
    return ORGANIZATION_TEMPLATES;
  },
});

/**
 * Get default system role modules (static)
 */
export const getSystemRoleModules = query({
  args: {},
  handler: async () => {
    return DEFAULT_ROLE_MODULES;
  },
});

/**
 * Get all role modules for an organization
 * Merges system defaults + org-specific custom modules
 */
export const getOrgRoleModules = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    // Get system modules
    const systemModules = DEFAULT_ROLE_MODULES.map((m) => ({
      ...m,
      source: "system" as const,
    }));

    // Get org-specific custom modules
    const customModules = await ctx.db
      .query("roleModules")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    const customMapped = customModules
      .filter((m) => !m.deletedAt)
      .map((m) => ({
        code: m.code,
        label: m.label,
        description: m.description,
        icon: m.icon ?? "",
        color: m.color ?? "",
        tasks: m.tasks,
        isSystem: m.isSystem,
        source: "custom" as const,
        _id: m._id,
      }));

    // Merge: custom modules override system modules with same code
    const codeSet = new Set(customMapped.map((m) => m.code));
    const merged = [
      ...systemModules.filter((m) => !codeSet.has(m.code)),
      ...customMapped,
    ];

    return merged;
  },
});

/**
 * Get all positions for an organization
 */
export const getOrgPositions = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    return await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();
  },
});

/**
 * List all positions across all organizations (superadmin)
 */
export const listAllPositions = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const positions = await ctx.db.query("positions").collect();
    // Enrich with org info
    const enriched = await Promise.all(
      positions.map(async (p) => {
        const org = await ctx.db.get(p.orgId);
        return {
          ...p,
          orgName: org?.name ?? "",
          orgSlug: org?.slug ?? "",
        };
      }),
    );
    return enriched;
  },
});

/**
 * Get the role config for an organization
 */
export const getOrgRoleConfig = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    return await ctx.db
      .query("orgRoleConfig")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .unique();
  },
});

/**
 * Get full role configuration for an organization
 * (config + positions + modules combined)
 */
export const getOrgFullRoleConfig = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    const config = await ctx.db
      .query("orgRoleConfig")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .unique();

    const positions = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    const customModules = await ctx.db
      .query("roleModules")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    const ministryGroups = await ctx.db
      .query("ministryGroups")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    return {
      config,
      positions: positions.filter((p) => !p.deletedAt),
      customModules: customModules.filter((m) => !m.deletedAt),
      ministryGroups: ministryGroups.filter((m) => !m.deletedAt),
      systemModules: DEFAULT_ROLE_MODULES,
    };
  },
});

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize organization roles from a template
 * Creates positions and optionally custom role modules
 */
export const initializeFromTemplate = mutation({
  args: {
    orgId: v.id("orgs"),
    templateType: v.string(),
  },
  handler: async (ctx, { orgId, templateType }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const template = getOrgTemplate(templateType as OrgTemplateType);
    if (!template) {
      throw error(ErrorCode.TEMPLATE_NOT_FOUND);
    }

    const now = Date.now();

    // Check if already initialized
    const existing = await ctx.db
      .query("orgRoleConfig")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .unique();

    if (existing) {
      throw error(ErrorCode.ROLE_CONFIG_ALREADY_INITIALIZED);
    }

    // Create ministry groups if the template has them
    const ministryGroupIds: Record<string, Id<"ministryGroups">> = {};
    if (template.ministryGroups) {
      for (const group of template.ministryGroups) {
        const id = await ctx.db.insert("ministryGroups", {
          orgId,
          code: group.code,
          label: group.label,
          description: group.description,
          icon: group.icon,
          sortOrder: group.sortOrder,
          parentCode: group.parentCode,
          isActive: true,
          createdBy: user._id,
        });
        ministryGroupIds[group.code] = id;
      }
    }

    // Create positions
    for (const pos of template.positions) {
      await ctx.db.insert("positions", {
        orgId,
        code: pos.code,
        title: pos.title,
        description: pos.description,
        level: pos.level,
        grade: pos.grade,
        ministryGroupId: pos.ministryCode
          ? ministryGroupIds[pos.ministryCode]
          : undefined,
        roleModuleCodes: pos.roleModules,
        isRequired: pos.isRequired,
        isActive: true,
        createdBy: user._id,
        updatedAt: now,
      });
    }

    // Create the config record
    await ctx.db.insert("orgRoleConfig", {
      orgId,
      templateType,
      isCustomized: false,
      initializedAt: now,
    });

    return { success: true, positionsCreated: template.positions.length };
  },
});

/**
 * Reset organization roles and re-apply template
 */
export const resetToTemplate = mutation({
  args: {
    orgId: v.id("orgs"),
    templateType: v.string(),
  },
  handler: async (ctx, { orgId, templateType }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const template = getOrgTemplate(templateType as OrgTemplateType);
    if (!template) {
      throw error(ErrorCode.TEMPLATE_NOT_FOUND);
    }

    const now = Date.now();

    // Soft-delete existing positions
    const existingPositions = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    for (const pos of existingPositions) {
      await ctx.db.patch(pos._id, { isActive: false, deletedAt: now });
    }

    // Soft-delete existing ministry groups
    const existingGroups = await ctx.db
      .query("ministryGroups")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    for (const group of existingGroups) {
      await ctx.db.patch(group._id, { isActive: false, deletedAt: now });
    }

    // Soft-delete custom role modules
    const existingModules = await ctx.db
      .query("roleModules")
      .withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
      .collect();

    for (const mod of existingModules) {
      await ctx.db.patch(mod._id, { isActive: false, deletedAt: now });
    }

    // Re-create ministry groups
    const ministryGroupIds: Record<string, Id<"ministryGroups">> = {};
    if (template.ministryGroups) {
      for (const group of template.ministryGroups) {
        const id = await ctx.db.insert("ministryGroups", {
          orgId,
          code: group.code,
          label: group.label,
          description: group.description,
          icon: group.icon,
          sortOrder: group.sortOrder,
          parentCode: group.parentCode,
          isActive: true,
          createdBy: user._id,
        });
        ministryGroupIds[group.code] = id;
      }
    }

    // Re-create positions
    for (const pos of template.positions) {
      await ctx.db.insert("positions", {
        orgId,
        code: pos.code,
        title: pos.title,
        description: pos.description,
        level: pos.level,
        grade: pos.grade,
        ministryGroupId: pos.ministryCode
          ? ministryGroupIds[pos.ministryCode]
          : undefined,
        roleModuleCodes: pos.roleModules,
        isRequired: pos.isRequired,
        isActive: true,
        createdBy: user._id,
        updatedAt: now,
      });
    }

    // Update or create config
    const existingConfig = await ctx.db
      .query("orgRoleConfig")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .unique();

    if (existingConfig) {
      await ctx.db.patch(existingConfig._id, {
        templateType,
        isCustomized: false,
        lastModifiedAt: now,
        lastModifiedBy: user._id,
      });
    } else {
      await ctx.db.insert("orgRoleConfig", {
        orgId,
        templateType,
        isCustomized: false,
        initializedAt: now,
      });
    }

    return { success: true, positionsCreated: template.positions.length };
  },
});

// ─── Position CRUD ──────────────────────────────────────

/**
 * Create a new position in an organization
 */
export const createPosition = mutation({
  args: {
    orgId: v.id("orgs"),
    code: v.string(),
    title: localizedStringValidator,
    description: v.optional(localizedStringValidator),
    level: v.number(),
    grade: v.optional(v.string()),
    ministryGroupId: v.optional(v.id("ministryGroups")),
    roleModuleCodes: v.array(v.string()),
    isRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireOrgAdmin(ctx, args.orgId);

    // Check uniqueness of code within org
    const existing = await ctx.db
      .query("positions")
      .withIndex("by_org_code", (q) =>
        q.eq("orgId", args.orgId).eq("code", args.code),
      )
      .first();

    if (existing && !existing.deletedAt) {
      throw error(ErrorCode.POSITION_CODE_EXISTS);
    }

    const id = await ctx.db.insert("positions", {
      ...args,
      isRequired: args.isRequired ?? false,
      isActive: true,
      createdBy: user._id,
      updatedAt: Date.now(),
    });

    // Mark org config as customized
    await _markCustomized(ctx, args.orgId, user._id);

    return id;
  },
});

/**
 * Update an existing position
 */
export const updatePosition = mutation({
  args: {
    positionId: v.id("positions"),
    title: v.optional(localizedStringValidator),
    description: v.optional(localizedStringValidator),
    level: v.optional(v.number()),
    grade: v.optional(v.string()),
    ministryGroupId: v.optional(v.id("ministryGroups")),
    roleModuleCodes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { positionId, ...updates }) => {
    const existing = await ctx.db.get(positionId);
    if (!existing || existing.deletedAt) {
      throw error(ErrorCode.POSITION_NOT_FOUND);
    }
    const { user } = await requireOrgAdmin(ctx, existing.orgId);

    await ctx.db.patch(positionId, {
      ...updates,
      updatedAt: Date.now(),
    });

    await _markCustomized(ctx, existing.orgId, user._id);

    return positionId;
  },
});

/**
 * Delete a position (soft delete)
 */
export const deletePosition = mutation({
  args: { positionId: v.id("positions") },
  handler: async (ctx, { positionId }) => {
    const existing = await ctx.db.get(positionId);
    if (!existing) {
      throw error(ErrorCode.POSITION_NOT_FOUND);
    }
    const { user } = await requireOrgAdmin(ctx, existing.orgId);

    if (existing.isRequired) {
      throw error(ErrorCode.POSITION_REQUIRED);
    }

    await ctx.db.patch(positionId, {
      isActive: false,
      deletedAt: Date.now(),
    });

    await _markCustomized(ctx, existing.orgId, user._id);

    return true;
  },
});

/**
 * Move a position up or down in the hierarchy
 */
export const movePositionLevel = mutation({
  args: {
    positionId: v.id("positions"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, { positionId, direction }) => {
    const position = await ctx.db.get(positionId);
    if (!position || position.deletedAt) {
      throw error(ErrorCode.POSITION_NOT_FOUND);
    }
    const { user } = await requireOrgAdmin(ctx, position.orgId);

    const newLevel =
      direction === "up"
        ? Math.max(1, position.level - 1)
        : position.level + 1;

    await ctx.db.patch(positionId, {
      level: newLevel,
      updatedAt: Date.now(),
    });

    await _markCustomized(ctx, position.orgId, user._id);

    return newLevel;
  },
});

// ─── Role Module CRUD ───────────────────────────────────

/**
 * Create a custom role module for an organization
 */
export const createRoleModule = mutation({
  args: {
    orgId: v.optional(v.id("orgs")),
    code: v.string(),
    label: localizedStringValidator,
    description: localizedStringValidator,
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    tasks: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // Check uniqueness
    const existing = await ctx.db
      .query("roleModules")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing && !existing.deletedAt) {
      throw error(ErrorCode.ROLE_MODULE_CODE_EXISTS);
    }

    return await ctx.db.insert("roleModules", {
      ...args,
      isSystem: false,
      isActive: true,
      createdBy: user._id,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a custom role module
 */
export const updateRoleModule = mutation({
  args: {
    moduleId: v.id("roleModules"),
    label: v.optional(localizedStringValidator),
    description: v.optional(localizedStringValidator),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    tasks: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { moduleId, ...updates }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const existing = await ctx.db.get(moduleId);
    if (!existing || existing.deletedAt) {
      throw error(ErrorCode.ROLE_MODULE_NOT_FOUND);
    }

    await ctx.db.patch(moduleId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return moduleId;
  },
});

/**
 * Delete a custom role module (soft delete)
 */
export const deleteRoleModule = mutation({
  args: { moduleId: v.id("roleModules") },
  handler: async (ctx, { moduleId }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const existing = await ctx.db.get(moduleId);
    if (!existing) {
      throw error(ErrorCode.ROLE_MODULE_NOT_FOUND);
    }

    if (existing.isSystem) {
      throw error(ErrorCode.ROLE_MODULE_SYSTEM);
    }

    await ctx.db.patch(moduleId, {
      isActive: false,
      deletedAt: Date.now(),
    });

    return true;
  },
});

// ─── Ministry Group CRUD ────────────────────────────────

/**
 * Create a ministry group
 */
export const createMinistryGroup = mutation({
  args: {
    orgId: v.id("orgs"),
    code: v.string(),
    label: localizedStringValidator,
    description: v.optional(localizedStringValidator),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
    parentCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const existing = await ctx.db
      .query("ministryGroups")
      .withIndex("by_org_code", (q) =>
        q.eq("orgId", args.orgId).eq("code", args.code),
      )
      .first();

    if (existing && !existing.deletedAt) {
      throw error(ErrorCode.MINISTRY_GROUP_EXISTS);
    }

    return await ctx.db.insert("ministryGroups", {
      ...args,
      isActive: true,
      createdBy: user._id,
    });
  },
});

/**
 * Delete a ministry group (soft delete)
 */
export const deleteMinistryGroup = mutation({
  args: { groupId: v.id("ministryGroups") },
  handler: async (ctx, { groupId }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    await ctx.db.patch(groupId, {
      isActive: false,
      deletedAt: Date.now(),
    });

    return true;
  },
});

// ─── Internal helper ────────────────────────────────────

async function _markCustomized(
  ctx: { db: any },
  orgId: Id<"orgs">,
  userId: Id<"users">,
) {
  const config = await ctx.db
    .query("orgRoleConfig")
    .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
    .unique();

  if (config) {
    await ctx.db.patch(config._id, {
      isCustomized: true,
      lastModifiedAt: Date.now(),
      lastModifiedBy: userId,
    });
  }
}
