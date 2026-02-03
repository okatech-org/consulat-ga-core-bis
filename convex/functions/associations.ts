/**
 * Associations Functions
 * 
 * CRUD operations for associations (via orgs table with type: 'association').
 * Uses the existing memberships table for members.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import { OrganizationType, MemberRole, CountryCode } from "../lib/constants";
import {
  associationTypeValidator,
  addressValidator,
} from "../lib/validators";

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List all associations (public)
 */
export const list = query({
  args: {
    type: v.optional(associationTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allOrgs = await ctx.db.query("orgs").collect();
    
    // Filter for associations that are active
    let associations = allOrgs.filter(
      (org) => org.type === OrganizationType.Association && org.isActive && !org.deletedAt
    );
    
    // Filter by association type if provided (stored in settings)
    if (args.type) {
      associations = associations.filter(
        (a) => (a.settings as Record<string, unknown>)?.associationType === args.type
      );
    }

    // Apply limit
    if (args.limit) {
      associations = associations.slice(0, args.limit);
    }

    return associations;
  },
});

/**
 * Get association by ID with members
 */
export const getById = query({
  args: { id: v.id("orgs") },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.id);
    
    if (!association || association.type !== OrganizationType.Association) {
      return null;
    }

    // Get members via memberships table (active = no deletedAt)
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.id))
      .collect();

    const activeMemberships = memberships.filter((m) => !m.deletedAt);

    // Enrich with user info
    const members = await Promise.all(
      activeMemberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        const profile = user
          ? await ctx.db
              .query("profiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .unique()
          : null;

        return {
          ...m,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
              }
            : null,
          profile: profile
            ? {
                firstName: profile.identity?.firstName,
                lastName: profile.identity?.lastName,
              }
            : null,
        };
      })
    );

    return {
      ...association,
      members,
    };
  },
});

/**
 * Get my associations (where I'm a member)
 */
export const getMine = authQuery({
  args: {},
  handler: async (ctx) => {
    // Get all my memberships
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const activeMemberships = memberships.filter((m) => !m.deletedAt);

    // Get associated orgs that are associations
    const associations = await Promise.all(
      activeMemberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        if (org?.type === OrganizationType.Association && org.isActive && !org.deletedAt) {
          return {
            ...org,
            myRole: m.role,
          };
        }
        return null;
      })
    );

    return associations.filter((a) => a !== null);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new association
 */
export const create = authMutation({
  args: {
    name: v.string(),
    associationType: associationTypeValidator,
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

    // Create the association as an org
    const associationId = await ctx.db.insert("orgs", {
      slug,
      name: args.name,
      type: OrganizationType.Association,
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
      updatedAt: Date.now(),
    });

    // Add creator as Admin (using Admin for associations instead of Ambassador)
    await ctx.db.insert("memberships", {
      userId: ctx.user._id,
      orgId: associationId,
      role: MemberRole.Admin,
    });

    return associationId;
  },
});

/**
 * Update association (only for admin members)
 */
export const update = authMutation({
  args: {
    id: v.id("orgs"),
    name: v.optional(v.string()),
    associationType: v.optional(associationTypeValidator),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(addressValidator),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.id);

    if (!association || association.type !== OrganizationType.Association) {
      throw error(ErrorCode.NOT_FOUND, "Association not found");
    }

    // Check if user is admin of this association
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.id)
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this association");
    }

    // Only Admin roles can update
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

/**
 * Invite member to association
 */
export const inviteMember = authMutation({
  args: {
    associationId: v.id("orgs"),
    userId: v.id("users"),
    role: v.optional(v.union(
      v.literal(MemberRole.Admin),
      v.literal(MemberRole.Agent),
      v.literal(MemberRole.Viewer)
    )),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.associationId);

    if (!association || association.type !== OrganizationType.Association) {
      throw error(ErrorCode.NOT_FOUND, "Association not found");
    }

    // Check if inviter is admin
    const inviterMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.associationId)
      )
      .unique();

    if (!inviterMembership || inviterMembership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this association");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.associationId)
      )
      .unique();

    if (existingMembership && !existingMembership.deletedAt) {
      throw error(ErrorCode.INVALID_ARGUMENT, "User is already a member");
    }

    // If there was a soft-deleted membership, reactivate it
    if (existingMembership && existingMembership.deletedAt) {
      await ctx.db.patch(existingMembership._id, {
        role: args.role ?? MemberRole.Viewer,
        deletedAt: undefined,
      });
      return existingMembership._id;
    }

    // Create membership
    const membershipId = await ctx.db.insert("memberships", {
      userId: args.userId,
      orgId: args.associationId,
      role: args.role ?? MemberRole.Viewer,
    });

    return membershipId;
  },
});

/**
 * Leave association
 */
export const leave = authMutation({
  args: { associationId: v.id("orgs") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.associationId)
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Membership not found");
    }

    // Soft delete
    await ctx.db.patch(membership._id, {
      deletedAt: Date.now(),
    });

    return membership._id;
  },
});

/**
 * Remove member from association (admin only)
 */
export const removeMember = authMutation({
  args: {
    associationId: v.id("orgs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if remover is admin
    const removerMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.associationId)
      )
      .unique();

    if (!removerMembership || removerMembership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this association");
    }

    if (removerMembership.role !== MemberRole.Admin) {
      throw error(ErrorCode.FORBIDDEN, "Insufficient permissions");
    }

    // Can't remove yourself this way
    if (args.userId === ctx.user._id) {
      throw error(ErrorCode.INVALID_ARGUMENT, "Use leave() to remove yourself");
    }

    const targetMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.associationId)
      )
      .unique();

    if (!targetMembership || targetMembership.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Member not found");
    }

    await ctx.db.patch(targetMembership._id, {
      deletedAt: Date.now(),
    });

    return targetMembership._id;
  },
});
