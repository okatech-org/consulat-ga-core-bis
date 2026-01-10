import { v } from "convex/values";
import { query } from "./_generated/server";
import { authMutation, superadminMutation } from "./lib/customFunctions";
import { requireOrgAdmin } from "./lib/auth";
import {
  serviceCategoryValidator,
  requiredDocumentValidator,
} from "./lib/types";





/**
 * List all active common services (global catalog)
 */
export const listCommonServices = query({
  args: {
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("commonServices")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    if (args.category) {
      return services.filter((s) => s.category === args.category);
    }

    return services;
  },
});

/**
 * Get a common service by slug
 */
export const getCommonServiceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("commonServices")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Create a common service (superadmin only)
 */
export const createCommonService = superadminMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    category: serviceCategoryValidator,
    defaultDocuments: v.array(requiredDocumentValidator),
  },
  handler: async (ctx, args) => {

    const existing = await ctx.db
      .query("commonServices")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("errors.services.slugExists");
    }

    const now = Date.now();
    return await ctx.db.insert("commonServices", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Toggle common service active status (superadmin only)
 */
export const toggleCommonServiceActive = superadminMutation({
  args: { serviceId: v.id("commonServices") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error("errors.services.notFound");
    }

    await ctx.db.patch(args.serviceId, {
      isActive: !service.isActive,
      updatedAt: Date.now(),
    });

    return args.serviceId;
  },
});

/**
 * Update common service (superadmin only)
 */
export const updateCommonService = superadminMutation({
  args: {
    serviceId: v.id("commonServices"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(serviceCategoryValidator),
    defaultDocuments: v.optional(v.array(requiredDocumentValidator)),
  },
  handler: async (ctx, args) => {
    const { serviceId, ...updates } = args;
    await ctx.db.patch(serviceId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return serviceId;
  },
});

/**
 * Get common service by ID
 */
export const getCommonServiceById = query({
  args: { serviceId: v.id("commonServices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId);
  },
});





/**
 * List org services by organization (with global service details)
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let orgServices;

    if (args.activeOnly !== false) {
      orgServices = await ctx.db
        .query("orgServices")
        .withIndex("by_orgId_isActive", (q) =>
          q.eq("orgId", args.orgId).eq("isActive", true)
        )
        .collect();
    } else {
      orgServices = await ctx.db
        .query("orgServices")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
    }


    return await Promise.all(
      orgServices.map(async (os) => {
        const commonService = await ctx.db.get(os.serviceId);
        return {
          ...os,
          commonService,

          name: commonService?.name,
          category: commonService?.category,
          description: os.customDescription ?? commonService?.description,
          requiredDocuments: os.customDocuments ?? commonService?.defaultDocuments,
        };
      })
    );
  },
});

/**
 * List services available in a country (for user service discovery)
 */
export const listByCountry = query({
  args: {
    country: v.string(),
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {

    const orgs = await ctx.db
      .query("orgs")
      .withIndex("by_country", (q) => q.eq("address.country", args.country))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (orgs.length === 0) return [];


    const allOrgServices = await Promise.all(
      orgs.map(async (org) => {
        const services = await ctx.db
          .query("orgServices")
          .withIndex("by_orgId_isActive", (q) =>
            q.eq("orgId", org._id).eq("isActive", true)
          )
          .collect();
        return services.map((s) => ({ ...s, org }));
      })
    );

    const flatServices = allOrgServices.flat();


    const enrichedServices = await Promise.all(
      flatServices.map(async (os) => {
        const commonService = await ctx.db.get(os.serviceId);
        return {
          ...os,
          commonService,
          name: commonService?.name,
          category: commonService?.category,
          description: os.customDescription ?? commonService?.description,
        };
      })
    );

    if (args.category) {
      return enrichedServices.filter((s) => s.category === args.category);
    }

    return enrichedServices;
  },
});

/**
 * Get org service by ID (with all related data)
 */
export const getById = query({
  args: { serviceId: v.id("orgServices") },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.serviceId);
    if (!orgService) return null;

    const [commonService, org] = await Promise.all([
      ctx.db.get(orgService.serviceId),
      ctx.db.get(orgService.orgId),
    ]);

    return {
      ...orgService,
      commonService,
      org,

      name: commonService?.name,
      category: commonService?.category,
      description: orgService.customDescription ?? commonService?.description,
      requiredDocuments: orgService.customDocuments ?? commonService?.defaultDocuments,
    };
  },
});

/**
 * Link a common service to an org (activate it for the org)
 */
export const activateForOrg = authMutation({
  args: {
    orgId: v.id("orgs"),
    commonServiceId: v.id("commonServices"),
    fee: v.number(),
    currency: v.string(),
    estimatedDays: v.optional(v.number()),
    customDescription: v.optional(v.string()),
    customDocuments: v.optional(v.array(requiredDocumentValidator)),
    instructions: v.optional(v.string()),
    requiresAppointment: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);


    const existing = await ctx.db
      .query("orgServices")
      .withIndex("by_orgId_serviceId", (q) =>
        q.eq("orgId", args.orgId).eq("serviceId", args.commonServiceId)
      )
      .unique();

    if (existing) {
      throw new Error("errors.services.alreadyActivated");
    }

    const now = Date.now();
    return await ctx.db.insert("orgServices", {
      orgId: args.orgId,
      serviceId: args.commonServiceId,
      isActive: true,
      fee: args.fee,
      currency: args.currency,
      estimatedDays: args.estimatedDays,
      customDescription: args.customDescription,
      customDocuments: args.customDocuments,
      instructions: args.instructions,
      requiresAppointment: args.requiresAppointment,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an org service configuration
 */
export const update = authMutation({
  args: {
    orgServiceId: v.id("orgServices"),
    fee: v.optional(v.number()),
    currency: v.optional(v.string()),
    estimatedDays: v.optional(v.number()),
    customDescription: v.optional(v.string()),
    customDocuments: v.optional(v.array(requiredDocumentValidator)),
    instructions: v.optional(v.string()),
    requiresAppointment: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw new Error("errors.services.notFound");
    }

    await requireOrgAdmin(ctx, orgService.orgId);

    const { orgServiceId, ...updates } = args;
    await ctx.db.patch(orgServiceId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return orgServiceId;
  },
});

/**
 * Toggle org service active status
 */
export const toggleActive = authMutation({
  args: { orgServiceId: v.id("orgServices") },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw new Error("errors.services.notFound");
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
 * Get services by category with org info (legacy compatibility)
 */
export const listByCategory = query({
  args: {
    category: serviceCategoryValidator,
  },
  handler: async (ctx, args) => {

    const commonServices = await ctx.db
      .query("commonServices")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();


    const allOrgServices = await Promise.all(
      commonServices.map(async (cs) => {
        const orgServices = await ctx.db
          .query("orgServices")
          .withIndex("by_serviceId", (q) => q.eq("serviceId", cs._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return Promise.all(
          orgServices.map(async (os) => {
            const org = await ctx.db.get(os.orgId);
            return {
              ...os,
              commonService: cs,
              org,
              name: cs.name,
              category: cs.category,
            };
          })
        );
      })
    );

    return allOrgServices.flat();
  },
});
