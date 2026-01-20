import { v } from "convex/values";
import { query } from "./_generated/server";
import { authMutation, authQuery } from "./lib/customFunctions";
import { requireOrgAdmin, requireOrgAgent } from "./lib/auth";
import { requiredDocumentValidator } from "./lib/types";

/**
 * List all available global services (commonServices) combined with 
 * the organization's specific configuration (orgServices) for the given org.
 */
export const list = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {

    await requireOrgAgent(ctx, args.orgId);


    const commonServices = await ctx.db
      .query("commonServices")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();


    const orgServices = await ctx.db
      .query("orgServices")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();



    const orgServicesMap = new Map();
    orgServices.forEach((os) => {
      orgServicesMap.set(os.serviceId, os);
    });


    return commonServices.map((cs) => {
      const os = orgServicesMap.get(cs._id) || null;
      return {
        commonService: cs,
        orgService: os,

        isActive: os?.isActive ?? false,
        isConfigured: !!os,
      };
    });
  },
});

/**
 * Get a specific service configuration for an org
 */
export const get = authQuery({
  args: { 
    orgId: v.id("orgs"),
    serviceId: v.id("commonServices")
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const commonService = await ctx.db.get(args.serviceId);
    if (!commonService) {
      throw new Error("errors.services.notFound");
    }

    const orgService = await ctx.db
      .query("orgServices")
      .withIndex("by_orgId_serviceId", (q) => 
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    return {
      commonService,
      orgService,
    };
  },
});

/**
 * Update or Create organization-specific configuration for a service.
 */
export const updateConfig = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.id("commonServices"),
    isActive: v.boolean(),

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
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    const now = Date.now();

    if (existing) {

      await ctx.db.patch(existing._id, {
        isActive: args.isActive,
        fee: args.fee,
        currency: args.currency,
        estimatedDays: args.estimatedDays,
        customDescription: args.customDescription,
        customDocuments: args.customDocuments,
        instructions: args.instructions,
        requiresAppointment: args.requiresAppointment,
        updatedAt: now,
      });
      return existing._id;
    } else {

      const newId = await ctx.db.insert("orgServices", {
        orgId: args.orgId,
        serviceId: args.serviceId,
        isActive: args.isActive,
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
      return newId;
    }
  },
});

/**
 * Toggle active status quickly
 */
export const toggleActive = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.id("commonServices"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    const existing = await ctx.db
      .query("orgServices")
      .withIndex("by_orgId_serviceId", (q) =>
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    if (!existing) {

      throw new Error("errors.services.notConfigured");
    }

    await ctx.db.patch(existing._id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});
