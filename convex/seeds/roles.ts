/**
 * Seed du système de rôles
 *
 * Initialise les rôles, positions et groupes ministériels
 * pour toutes les organisations existantes en base.
 *
 * Utilisation:
 *   npx convex run seeds/roles:seedSystemModules
 *   npx convex run seeds/roles:seedOrgRoles
 *
 * Ordre d'exécution:
 *   1. seedDiplomaticNetwork (si pas déjà fait)
 *   2. seedSystemModules  — crée les roleModules système
 *   3. seedOrgRoles       — crée positions + ministryGroups + orgRoleConfig pour chaque org
 */
import { mutation } from "../_generated/server";
import {
  POSITION_TASK_PRESETS,
  getOrgTemplate,
  type OrgTemplateType,
} from "../lib/roles";

// ═══════════════════════════════════════════════════════════════
// 1. SEED SYSTEM ROLE MODULES
// ═══════════════════════════════════════════════════════════════

/**
 * Crée ou met à jour les role modules système (isSystem: true)
 * dans la table `roleModules` (sans orgId = global).
 *
 * Idempotent — safe to re-run.
 */
export const seedSystemModules = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const mod of POSITION_TASK_PRESETS) {
      try {
        const existing = await ctx.db
          .query("roleModules")
          .withIndex("by_code", (q) => q.eq("code", mod.code))
          .first();

        if (existing) {
          // Update if system module to keep in sync with code
          if (existing.isSystem) {
            await ctx.db.patch(existing._id, {
              label: mod.label,
              description: mod.description,
              icon: mod.icon,
              color: mod.color,
              tasks: mod.tasks,
              updatedAt: Date.now(),
            });
            results.updated++;
          } else {
            results.skipped++;
          }
          continue;
        }

        await ctx.db.insert("roleModules", {
          code: mod.code,
          label: mod.label,
          description: mod.description,
          icon: mod.icon,
          color: mod.color,
          tasks: mod.tasks,
          isSystem: true,
          isActive: true,
          updatedAt: Date.now(),
        });
        results.created++;
      } catch (error) {
        results.errors.push(
          `${mod.code}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return results;
  },
});

// ═══════════════════════════════════════════════════════════════
// 2. SEED ORG ROLES (positions + ministry groups + config)
// ═══════════════════════════════════════════════════════════════

/**
 * Pour chaque organisation existante sans config de rôles,
 * applique le template correspondant à son `type`.
 *
 * Crée:
 *   - ministryGroups (si le template en a)
 *   - positions (avec lien vers ministryGroupId)
 *   - orgRoleConfig (snapshot)
 *
 * Idempotent — skip les orgs déjà initialisées.
 */
export const seedOrgRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      orgsProcessed: 0,
      orgsSkipped: 0,
      positionsCreated: 0,
      ministryGroupsCreated: 0,
      errors: [] as string[],
    };

    // Get all orgs
    const allOrgs = await ctx.db.query("orgs").collect();

    for (const org of allOrgs) {
      try {
        // Skip if already has a role config
        const existingConfig = await ctx.db
          .query("orgRoleConfig")
          .withIndex("by_org", (q) => q.eq("orgId", org._id))
          .unique();

        if (existingConfig) {
          results.orgsSkipped++;
          continue;
        }

        // Find the matching template
        const orgType = (org as any).type as string | undefined;
        if (!orgType) {
          results.errors.push(`${org.slug}: no type field`);
          continue;
        }

        const template = getOrgTemplate(orgType as OrgTemplateType);
        if (!template) {
          results.errors.push(`${org.slug}: no template for type "${orgType}"`);
          continue;
        }

        const now = Date.now();

        // Create ministry groups
        const ministryGroupIds: Record<string, string> = {};
        if (template.ministryGroups) {
          for (const group of template.ministryGroups) {
            const id = await ctx.db.insert("ministryGroups", {
              orgId: org._id,
              code: group.code,
              label: group.label,
              description: group.description,
              icon: group.icon,
              sortOrder: group.sortOrder,
              parentCode: group.parentCode,
              isActive: true,
            });
            ministryGroupIds[group.code] = id;
            results.ministryGroupsCreated++;
          }
        }

        // Create positions
        for (const pos of template.positions) {
          await ctx.db.insert("positions", {
            orgId: org._id,
            code: pos.code,
            title: pos.title,
            description: pos.description,
            level: pos.level,
            grade: pos.grade,
            ministryGroupId: pos.ministryCode
              ? (ministryGroupIds[pos.ministryCode] as any)
              : undefined,
            roleModuleCodes: pos.taskPresets,
            isRequired: pos.isRequired,
            isActive: true,
            updatedAt: now,
          });
          results.positionsCreated++;
        }

        // Create org role config
        await ctx.db.insert("orgRoleConfig", {
          orgId: org._id,
          templateType: orgType,
          isCustomized: false,
          initializedAt: now,
        });

        results.orgsProcessed++;
      } catch (error) {
        results.errors.push(
          `${org.slug}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return results;
  },
});

// ═══════════════════════════════════════════════════════════════
// 3. CLEANUP — Remove all role data (dev only)
// ═══════════════════════════════════════════════════════════════

/**
 * Supprime TOUTES les données de rôles (dev/reset uniquement).
 * ⚠️  Destructif — ne pas utiliser en production.
 */
export const purgeAllRoleData = mutation({
  args: {},
  handler: async (ctx) => {
    let deleted = 0;

    // Delete all positions
    const positions = await ctx.db.query("positions").collect();
    for (const p of positions) {
      await ctx.db.delete(p._id);
      deleted++;
    }

    // Delete all ministry groups
    const groups = await ctx.db.query("ministryGroups").collect();
    for (const g of groups) {
      await ctx.db.delete(g._id);
      deleted++;
    }

    // Delete all role modules
    const modules = await ctx.db.query("roleModules").collect();
    for (const m of modules) {
      await ctx.db.delete(m._id);
      deleted++;
    }

    // Delete all org role configs
    const configs = await ctx.db.query("orgRoleConfig").collect();
    for (const c of configs) {
      await ctx.db.delete(c._id);
      deleted++;
    }

    return { deleted };
  },
});
