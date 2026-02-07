/**
 * Seed des services consulaires
 * Source: data/ministry_services_seed.ts
 *
 * Architecture:
 * - Table `services` = Catalogue global (slug, name, etc.)
 * - Table `orgServices` = Lien service <-> org avec config locale
 *
 * Utilisation:
 * npx convex run seeds/services:seedServices
 */
import { mutation } from "../_generated/server";
import { ministryServicesSeed } from "../../data/ministry_services_seed";
import type { ServiceCategory } from "../lib/constants";

export const seedServices = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      created: 0,
      linked: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Step 1: Create all services in the catalog (always works)
    for (const service of ministryServicesSeed) {
      try {
        const existing = await ctx.db
          .query("services")
          .withIndex("by_slug", (q) => q.eq("slug", service.slug))
          .first();

        if (existing) {
          results.skipped++;
          continue;
        }

        await ctx.db.insert("services", {
          slug: service.slug,
          code: service.code,
          name: service.name,
          description: service.description,
          content: service.content,
          category: service.category as ServiceCategory,
          icon: service.icon,
          estimatedDays: service.estimatedDays,
          requiresAppointment: service.requiresAppointment ?? false,
          requiresPickupAppointment: service.requiresPickupAppointment ?? false,
          joinedDocuments: service.joinedDocuments?.map((doc) => ({
            type: doc.type,
            label: doc.label,
            required: doc.required,
          })),
          isActive: service.isActive ?? true,
          updatedAt: Date.now(),
        });
        results.created++;
      } catch (error) {
        results.errors.push(
          `${service.slug}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Step 2: Link to Consulat Paris if it exists
    const consulatParis = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", "fr-consulat-paris"))
      .first();

    if (!consulatParis) {
      return {
        ...results,
        note: "Services créés mais orgServices non liés (exécutez seedDiplomaticNetwork puis relancez pour le linking).",
      };
    }

    for (const service of ministryServicesSeed) {
      try {
        const serviceDoc = await ctx.db
          .query("services")
          .withIndex("by_slug", (q) => q.eq("slug", service.slug))
          .first();

        if (!serviceDoc) continue;

        const existingLink = await ctx.db
          .query("orgServices")
          .withIndex("by_org_service", (q) =>
            q.eq("orgId", consulatParis._id).eq("serviceId", serviceDoc._id),
          )
          .first();

        if (!existingLink) {
          await ctx.db.insert("orgServices", {
            orgId: consulatParis._id,
            serviceId: serviceDoc._id,
            pricing: {
              amount: 0,
              currency: "EUR",
            },
            estimatedDays: service.estimatedDays,
            requiresAppointment: service.requiresAppointment ?? false,
            requiresAppointmentForPickup:
              service.requiresPickupAppointment ?? false,
            isActive: service.isActive ?? true,
            updatedAt: Date.now(),
          });
          results.linked++;
        }
      } catch (error) {
        results.errors.push(
          `link-${service.slug}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return results;
  },
});

/**
 * Propager les services vers TOUS les postes diplomatiques
 * Copie les liens orgServices du Consulat de Paris vers tous les postes
 *
 * Utilisation:
 * npx convex run seeds/services:propagateServices
 */
export const propagateServices = mutation({
  args: {},
  handler: async (ctx) => {
    // Get services from Consulat Paris
    const consulatParis = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", "fr-consulat-paris"))
      .first();

    if (!consulatParis) {
      return { error: "Source org not found", created: 0 };
    }

    const sourceOrgServices = await ctx.db
      .query("orgServices")
      .withIndex("by_org_service", (q) => q.eq("orgId", consulatParis._id))
      .collect();

    if (sourceOrgServices.length === 0) {
      return {
        error: "No source orgServices found. Run seedServices first.",
        created: 0,
      };
    }

    // Get all other orgs
    const allOrgs = await ctx.db.query("orgs").collect();
    const targetOrgs = allOrgs.filter((org) => org._id !== consulatParis._id);

    let created = 0;
    const errors: string[] = [];

    for (const org of targetOrgs) {
      for (const orgService of sourceOrgServices) {
        try {
          // Check if already exists
          const existing = await ctx.db
            .query("orgServices")
            .withIndex("by_org_service", (q) =>
              q.eq("orgId", org._id).eq("serviceId", orgService.serviceId),
            )
            .first();

          if (existing) continue;

          // Clone the orgService link
          await ctx.db.insert("orgServices", {
            orgId: org._id,
            serviceId: orgService.serviceId,
            pricing: orgService.pricing,
            estimatedDays: orgService.estimatedDays,
            requiresAppointment: orgService.requiresAppointment,
            requiresAppointmentForPickup:
              orgService.requiresAppointmentForPickup,
            isActive: orgService.isActive,
            updatedAt: Date.now(),
          });
          created++;
        } catch (error) {
          const service = await ctx.db.get(orgService.serviceId);
          errors.push(
            `${org.slug}/${service?.slug ?? "?"}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    return {
      created,
      targetOrgs: targetOrgs.length,
      services: sourceOrgServices.length,
      errors: errors.slice(0, 10), // Limit error output
    };
  },
});
