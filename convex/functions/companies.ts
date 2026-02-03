/**
 * Companies Functions
 * 
 * CRUD operations for companies (via orgs table with type: 'company').
 * Similar pattern to associations.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import { OrganizationType, MemberRole, CountryCode } from "../lib/constants";
import {
  companyTypeValidator,
  activitySectorValidator,
  addressValidator,
} from "../lib/validators";

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List all companies (public)
 */
export const list = query({
  args: {
    sector: v.optional(activitySectorValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allOrgs = await ctx.db.query("orgs").collect();
    
    // Filter for companies that are active
    let companies = allOrgs.filter(
      (org) => org.type === OrganizationType.Company && org.isActive && !org.deletedAt
    );
    
    // Filter by sector if provided (stored in settings)
    if (args.sector) {
      companies = companies.filter(
        (c) => (c.settings as Record<string, unknown>)?.activitySector === args.sector
      );
    }

    // Apply limit
    if (args.limit) {
      companies = companies.slice(0, args.limit);
    }

    return companies;
  },
});

/**
 * Get company by ID
 */
export const getById = query({
  args: { id: v.id("orgs") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    
    if (!company || company.type !== OrganizationType.Company) {
      return null;
    }

    // Get members via memberships table
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.id))
      .collect();

    const activeMemberships = memberships.filter((m) => !m.deletedAt);

    return {
      ...company,
      memberCount: activeMemberships.length,
    };
  },
});

/**
 * Get my companies (where I'm owner/member)
 */
export const getMine = authQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const activeMemberships = memberships.filter((m) => !m.deletedAt);

    const companies = await Promise.all(
      activeMemberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        if (org?.type === OrganizationType.Company && org.isActive && !org.deletedAt) {
          return {
            ...org,
            myRole: m.role,
          };
        }
        return null;
      })
    );

    return companies.filter((c) => c !== null);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new company
 */
export const create = authMutation({
  args: {
    name: v.string(),
    legalName: v.optional(v.string()),
    companyType: companyTypeValidator,
    activitySector: activitySectorValidator,
    siret: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(addressValidator),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate slug
    const slug =
      args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);

    const companyId = await ctx.db.insert("orgs", {
      slug,
      name: args.name,
      type: OrganizationType.Company,
      country: CountryCode.GA,
      timezone: "Africa/Libreville",
      isActive: true,
      email: args.email,
      phone: args.phone,
      website: args.website,
      description: args.description,
      logoUrl: args.logoUrl,
      address: args.address ?? {
        street: "",
        city: "",
        postalCode: "",
        country: CountryCode.GA,
      },
      notes: args.legalName ? `Legal name: ${args.legalName}` : undefined,
      updatedAt: Date.now(),
    });

    // Add creator as Admin
    await ctx.db.insert("memberships", {
      userId: ctx.user._id,
      orgId: companyId,
      role: MemberRole.Admin,
    });

    return companyId;
  },
});

/**
 * Update company (admin only)
 */
export const update = authMutation({
  args: {
    id: v.id("orgs"),
    name: v.optional(v.string()),
    companyType: v.optional(companyTypeValidator),
    activitySector: v.optional(activitySectorValidator),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(addressValidator),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);

    if (!company || company.type !== OrganizationType.Company) {
      throw error(ErrorCode.NOT_FOUND, "Company not found");
    }

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.id)
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this company");
    }

    if (membership.role !== MemberRole.Admin) {
      throw error(ErrorCode.FORBIDDEN, "Insufficient permissions");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
