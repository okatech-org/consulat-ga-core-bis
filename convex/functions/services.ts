import { v } from "convex/values";
import { query } from "../_generated/server";
import { authMutation, superadminMutation } from "../lib/customFunctions";
import { requireOrgAdmin } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import {
  serviceCategoryValidator,
  localizedStringValidator,
  serviceDefaultsValidator,
  pricingValidator,
  requiredDocumentValidator,
} from "../lib/validators";

// ============================================================================
// GLOBAL SERVICES CATALOG (Superadmin)
// ============================================================================

/**
 * List all active services in catalog
 */
export const listCatalog = query({
  args: {
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    let services = await ctx.db
      .query("services")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.category) {
      services = services.filter((s) => s.category === args.category);
    }

    return services;
  },
});

/**
 * Get service by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get service by ID
 */
export const getById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId);
  },
});

/**
 * Create a new service (superadmin only)
 */
export const create = superadminMutation({
  args: {
    slug: v.string(),
    code: v.string(),
    name: localizedStringValidator,
    description: localizedStringValidator,
    category: serviceCategoryValidator,
    icon: v.optional(v.string()),
    defaults: serviceDefaultsValidator,
    formSchema: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check slug uniqueness
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw error(ErrorCode.SERVICE_SLUG_EXISTS);
    }

    return await ctx.db.insert("services", {
      ...args,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a service (superadmin only)
 */
export const update = superadminMutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(localizedStringValidator),
    description: v.optional(localizedStringValidator),
    category: v.optional(serviceCategoryValidator),
    icon: v.optional(v.string()),
    defaults: v.optional(serviceDefaultsValidator),
    formSchema: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { serviceId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(serviceId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return serviceId;
  },
});

// ============================================================================
// ORG SERVICES (Organization-specific)
// ============================================================================

/**
 * List services available for an organization
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const activeOnly = args.activeOnly !== false;

    const orgServices = activeOnly
      ? await ctx.db
          .query("orgServices")
          .withIndex("by_org_active", (q) =>
            q.eq("orgId", args.orgId).eq("isActive", true)
          )
          .collect()
      : await ctx.db
          .query("orgServices")
          .withIndex("by_org_service", (q) => q.eq("orgId", args.orgId))
          .collect();

    // Batch fetch services (avoid N+1)
    const serviceIds = [...new Set(orgServices.map((os) => os.serviceId))];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    return orgServices.map((os) => {
      const service = serviceMap.get(os.serviceId);
      return {
        ...os,
        service,
        // Merged view for convenience
        name: service?.name,
        category: service?.category,
        description: service?.description,
        requiredDocuments:
          os.customDocuments ?? service?.defaults.requiredDocuments,
      };
    });
  },
});

/**
 * Get org service by ID with full details
 */
export const getOrgServiceById = query({
  args: { orgServiceId: v.id("orgServices") },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) return null;

    const [service, org] = await Promise.all([
      ctx.db.get(orgService.serviceId),
      ctx.db.get(orgService.orgId),
    ]);

    return {
      ...orgService,
      service,
      org,
      // Merged view
      name: service?.name,
      category: service?.category,
      description: service?.description,
      requiredDocuments:
        orgService.customDocuments ?? service?.defaults.requiredDocuments,
      estimatedDays:
        orgService.estimatedDays ?? service?.defaults.estimatedDays,
    };
  },
});

/**
 * Activate a service for an organization
 */
export const activateForOrg = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.id("services"),
    pricing: pricingValidator,
    estimatedDays: v.optional(v.number()),
    instructions: v.optional(v.string()),
    customDocuments: v.optional(v.array(requiredDocumentValidator)),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Check if already activated
    const existing = await ctx.db
      .query("orgServices")
      .withIndex("by_org_service", (q) =>
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    if (existing) {
      throw error(ErrorCode.SERVICE_ALREADY_ACTIVATED);
    }

    return await ctx.db.insert("orgServices", {
      orgId: args.orgId,
      serviceId: args.serviceId,
      pricing: args.pricing,
      estimatedDays: args.estimatedDays,
      instructions: args.instructions,
      customDocuments: args.customDocuments,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update org service configuration
 */
export const updateOrgService = authMutation({
  args: {
    orgServiceId: v.id("orgServices"),
    pricing: v.optional(pricingValidator),
    estimatedDays: v.optional(v.number()),
    instructions: v.optional(v.string()),
    customDocuments: v.optional(v.array(requiredDocumentValidator)),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw error(ErrorCode.SERVICE_NOT_FOUND);
    }

    await requireOrgAdmin(ctx, orgService.orgId);

    const { orgServiceId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(orgServiceId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return orgServiceId;
  },
});

/**
 * Toggle org service active status
 */
export const toggleOrgServiceActive = authMutation({
  args: { orgServiceId: v.id("orgServices") },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw error(ErrorCode.SERVICE_NOT_FOUND);
    }

    await requireOrgAdmin(ctx, orgService.orgId);

    await ctx.db.patch(args.orgServiceId, {
      isActive: !orgService.isActive,
      updatedAt: Date.now(),
    });

    return !orgService.isActive;
  },
});

/**
 * Get org service by Org ID and Service ID
 */
export const getByOrgAndService = query({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db
      .query("orgServices")
      .withIndex("by_org_service", (q) =>
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    if (!orgService) return null;

    const [service, org] = await Promise.all([
      ctx.db.get(orgService.serviceId),
      ctx.db.get(orgService.orgId),
    ]);

    return {
      ...orgService,
      service,
      org,
      name: service?.name,
      category: service?.category,
      description: service?.description,
      requiredDocuments:
        orgService.customDocuments ?? service?.defaults.requiredDocuments,
      estimatedDays:
        orgService.estimatedDays ?? service?.defaults.estimatedDays,
    };
  },
});

/**
 * List services by country (for user discovery)
 */
export const listByCountry = query({
  args: {
    country: v.string(),
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    // Get orgs in country
    const orgs = await ctx.db
      .query("orgs")
      .withIndex("by_country", (q) => q.eq("country", args.country))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    if (orgs.length === 0) return [];

    // Get all active org services
    const allOrgServices = await Promise.all(
      orgs.map(async (org) => {
        const services = await ctx.db
          .query("orgServices")
          .withIndex("by_org_active", (q) =>
            q.eq("orgId", org._id).eq("isActive", true)
          )
          .collect();
        return services.map((s) => ({ ...s, org }));
      })
    );

    const flatServices = allOrgServices.flat();

    // Batch fetch service details
    const serviceIds = [...new Set(flatServices.map((os) => os.serviceId))];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    const enriched = flatServices.map((os) => {
      const service = serviceMap.get(os.serviceId);
      return {
        ...os,
        service,
        name: service?.name,
        category: service?.category,
        description: service?.description,
      };
    });

    if (args.category) {
      return enriched.filter((s) => s.category === args.category);
    }

    return enriched;
  },
});

/**
 * Get registration service availability for an organization
 * Returns the org service if registration category is active, null otherwise
 */
export const getRegistrationServiceForOrg = query({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    // Get all active org services for this org
    const orgServices = await ctx.db
      .query("orgServices")
      .withIndex("by_org_active", (q) =>
        q.eq("orgId", args.orgId).eq("isActive", true)
      )
      .collect();

    if (orgServices.length === 0) return null;

    // Get all service details to check category
    const serviceIds = [...new Set(orgServices.map((os) => os.serviceId))];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    // Find a registration service
    for (const os of orgServices) {
      const service = serviceMap.get(os.serviceId);
      if (service?.category === "registration" && service.isActive) {
        const org = await ctx.db.get(args.orgId);
        return {
          ...os,
          service,
          org,
          name: service.name,
          category: service.category,
          description: service.description,
          requiredDocuments:
            os.customDocuments ?? service.defaults.requiredDocuments,
          estimatedDays: os.estimatedDays ?? service.defaults.estimatedDays,
        };
      }
    }

    return null;
  },
});
