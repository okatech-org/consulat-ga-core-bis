import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOrgAdmin } from "./lib/auth";
import {
  serviceCategoryValidator,
  requiredDocumentValidator,
} from "./lib/types";

/**
 * List all active services
 */
export const list = query({
  args: {
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    if (args.category) {
      return services.filter((s) => s.category === args.category);
    }

    return services;
  },
});

/**
 * List services by organization
 */
export const listByOrg = query({
  args: { 
    orgId: v.id("orgs"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.activeOnly !== false) {
      return await ctx.db
        .query("services")
        .withIndex("by_orgId_isActive", (q) => 
          q.eq("orgId", args.orgId).eq("isActive", true)
        )
        .collect();
    }

    return await ctx.db
      .query("services")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

/**
 * Get service by ID
 */
export const getById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) return null;

    // Include org info
    const org = await ctx.db.get(service.orgId);
    return { ...service, org };
  },
});

/**
 * Get service by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!service) return null;

    const org = await ctx.db.get(service.orgId);
    return { ...service, org };
  },
});

/**
 * Create a new service
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    category: serviceCategoryValidator,
    orgId: v.id("orgs"),
    baseFee: v.number(),
    currency: v.string(),
    estimatedDays: v.optional(v.number()),
    requiredDocuments: v.array(requiredDocumentValidator),
    instructions: v.optional(v.string()),
    requiresAppointment: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Check if slug is already taken
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("Service slug already exists");
    }

    const now = Date.now();
    return await ctx.db.insert("services", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a service
 */
export const update = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    baseFee: v.optional(v.number()),
    currency: v.optional(v.string()),
    estimatedDays: v.optional(v.number()),
    requiredDocuments: v.optional(v.array(requiredDocumentValidator)),
    instructions: v.optional(v.string()),
    requiresAppointment: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    await requireOrgAdmin(ctx, service.orgId);

    const { serviceId, ...updates } = args;
    await ctx.db.patch(serviceId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return serviceId;
  },
});

/**
 * Toggle service active status
 */
export const toggleActive = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    await requireOrgAdmin(ctx, service.orgId);

    await ctx.db.patch(args.serviceId, {
      isActive: !service.isActive,
      updatedAt: Date.now(),
    });

    return !service.isActive;
  },
});

/**
 * Get services by category with org info
 */
export const listByCategory = query({
  args: {
    category: serviceCategoryValidator,
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    // Filter active and enrich with org info
    const activeServices = services.filter((s) => s.isActive);
    
    return await Promise.all(
      activeServices.map(async (service) => {
        const org = await ctx.db.get(service.orgId);
        return { ...service, org };
      })
    );
  },
});
