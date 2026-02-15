import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAuth } from "../lib/auth";
import { isSuperAdmin } from "../lib/permissions";
import { error, ErrorCode } from "../lib/errors";

// Module categories
const moduleCategoryValidator = v.union(
  v.literal("core"),
  v.literal("service"),
  v.literal("admin"),
  v.literal("communication"),
);

// ═══════════════════════════════════════════════════════════════
// MODULE DEFINITIONS — Global catalog
// ═══════════════════════════════════════════════════════════════

/**
 * List all module definitions
 */
export const listModules = query({
  args: {
    category: v.optional(moduleCategoryValidator),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let modules;

    if (args.category) {
      modules = await ctx.db
        .query("moduleDefinitions")
        .withIndex("by_category", (idx: any) =>
          args.activeOnly !== false
            ? idx.eq("category", args.category).eq("isActive", true)
            : idx.eq("category", args.category),
        )
        .collect();
    } else if (args.activeOnly !== false) {
      modules = await ctx.db
        .query("moduleDefinitions")
        .withIndex("by_active", (idx: any) => idx.eq("isActive", true))
        .collect();
    } else {
      modules = await ctx.db.query("moduleDefinitions").collect();
    }

    return modules.filter((m: any) => !m.deletedAt);
  },
});

/**
 * Get a single module definition
 */
export const getModule = query({
  args: { id: v.id("moduleDefinitions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new module definition
 */
export const createModule = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    category: moduleCategoryValidator,
    version: v.optional(v.string()),
    isCore: v.optional(v.boolean()),
    dependencies: v.optional(v.array(v.string())),
    requiredPermissions: v.optional(v.array(v.string())),
    defaultConfig: v.optional(v.string()),
    configSchema: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    targetRoles: v.optional(v.array(v.string())),
    targetOrgTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // Check uniqueness
    const existing = await ctx.db
      .query("moduleDefinitions")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .first();

    if (existing && !existing.deletedAt) {
      throw error(ErrorCode.MODULE_KEY_EXISTS);
    }

    return await ctx.db.insert("moduleDefinitions", {
      ...args,
      isCore: args.isCore ?? false,
      displayOrder: args.displayOrder ?? 99,
      isActive: true,
      createdBy: user._id,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a module definition
 */
export const updateModule = mutation({
  args: {
    id: v.id("moduleDefinitions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    category: v.optional(moduleCategoryValidator),
    version: v.optional(v.string()),
    isCore: v.optional(v.boolean()),
    dependencies: v.optional(v.array(v.string())),
    requiredPermissions: v.optional(v.array(v.string())),
    defaultConfig: v.optional(v.string()),
    configSchema: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    targetRoles: v.optional(v.array(v.string())),
    targetOrgTypes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw error(ErrorCode.MODULE_NOT_FOUND);
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Delete a module definition (soft delete)
 */
export const removeModule = mutation({
  args: { id: v.id("moduleDefinitions") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw error(ErrorCode.MODULE_NOT_FOUND);
    }

    if (existing.isCore) {
      throw error(ErrorCode.MODULE_CORE_IMMUTABLE);
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      deletedAt: Date.now(),
    });

    return true;
  },
});

// ═══════════════════════════════════════════════════════════════
// ORG MODULE CONFIGS — per-org activation
// ═══════════════════════════════════════════════════════════════

/**
 * Get all module configs for an organization
 */
export const getOrgModules = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    const configs = await ctx.db
      .query("orgModuleConfigs")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId).eq("isEnabled", true))
      .collect();

    // Enrich with module definitions
    const enriched = await Promise.all(
      configs.map(async (config: any) => {
        const moduleDef = await ctx.db
          .query("moduleDefinitions")
          .withIndex("by_key", (q: any) => q.eq("key", config.moduleKey))
          .first();

        return {
          ...config,
          module: moduleDef
            ? {
                name: moduleDef.name,
                description: moduleDef.description,
                icon: moduleDef.icon,
                color: moduleDef.color,
                category: moduleDef.category,
                isCore: moduleDef.isCore,
              }
            : null,
        };
      }),
    );

    return enriched;
  },
});

/**
 * Toggle a module for an organization
 */
export const toggleOrgModule = mutation({
  args: {
    orgId: v.id("orgs"),
    moduleKey: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, { orgId, moduleKey, isEnabled }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // Verify module exists
    const moduleDef = await ctx.db
      .query("moduleDefinitions")
      .withIndex("by_key", (q: any) => q.eq("key", moduleKey))
      .first();

    if (!moduleDef) {
      throw error(ErrorCode.MODULE_NOT_FOUND);
    }

    if (moduleDef.isCore && !isEnabled) {
      throw error(ErrorCode.MODULE_CORE_IMMUTABLE);
    }

    // Check dependencies
    if (isEnabled && moduleDef.dependencies?.length) {
      const orgConfigs = await ctx.db
        .query("orgModuleConfigs")
        .withIndex("by_org", (q: any) => q.eq("orgId", orgId).eq("isEnabled", true))
        .collect();

      const enabledKeys = new Set(orgConfigs.map((c: any) => c.moduleKey));

      for (const dep of moduleDef.dependencies) {
        if (!enabledKeys.has(dep)) {
          throw error(ErrorCode.MODULE_DEPENDENCY_MISSING);
        }
      }
    }

    const now = Date.now();

    // Upsert
    const existing = await ctx.db
      .query("orgModuleConfigs")
      .withIndex("by_org_module", (q: any) =>
        q.eq("orgId", orgId).eq("moduleKey", moduleKey),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isEnabled,
        ...(isEnabled
          ? { enabledAt: now, enabledBy: user._id }
          : { disabledAt: now, disabledBy: user._id }),
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("orgModuleConfigs", {
      orgId,
      moduleKey,
      isEnabled,
      enabledAt: isEnabled ? now : undefined,
      enabledBy: isEnabled ? user._id : undefined,
      updatedAt: now,
    });
  },
});

/**
 * Configure a module for an organization (custom settings)
 */
export const configureOrgModule = mutation({
  args: {
    orgId: v.id("orgs"),
    moduleKey: v.string(),
    customConfig: v.string(),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, { orgId, moduleKey, customConfig, displayOrder }) => {
    const user = await requireAuth(ctx);
    if (!isSuperAdmin(user)) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const existing = await ctx.db
      .query("orgModuleConfigs")
      .withIndex("by_org_module", (q: any) =>
        q.eq("orgId", orgId).eq("moduleKey", moduleKey),
      )
      .first();

    if (!existing) {
      throw error(ErrorCode.MODULE_NOT_CONFIGURED);
    }

    await ctx.db.patch(existing._id, {
      customConfig,
      ...(displayOrder !== undefined ? { displayOrder } : {}),
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});
