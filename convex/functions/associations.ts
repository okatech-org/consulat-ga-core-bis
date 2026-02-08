/**
 * Associations Functions
 *
 * CRUD operations for the dedicated `associations` table.
 * Uses `associationMembers` table for membership with AssociationRole.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import {
  AssociationRole,
  AssociationMemberStatus,
  CountryCode,
} from "../lib/constants";
import {
  associationTypeValidator,
  associationRoleValidator,
  addressValidator,
} from "../lib/validators";
import { countryCodeValidator } from "../lib/countryCodeValidator";

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List all associations (public)
 */
export const list = query({
  args: {
    type: v.optional(associationTypeValidator),
    country: v.optional(countryCodeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.type) {
      q = ctx.db
        .query("associations")
        .withIndex("by_type", (idx) => idx.eq("associationType", args.type!));
    } else if (args.country) {
      q = ctx.db
        .query("associations")
        .withIndex("by_country", (idx) => idx.eq("country", args.country!));
    } else {
      q = ctx.db
        .query("associations")
        .withIndex("by_active", (idx) =>
          idx.eq("isActive", true).eq("deletedAt", undefined),
        );
    }

    const all = await q.collect();
    const active = all.filter((a) => a.isActive && !a.deletedAt);
    return args.limit ? active.slice(0, args.limit) : active;
  },
});

/**
 * Get association by ID with members
 */
export const getById = query({
  args: { id: v.id("associations") },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.id);
    if (!association || association.deletedAt) return null;

    // Get active members
    const memberships = await ctx.db
      .query("associationMembers")
      .withIndex("by_assoc", (q) => q.eq("associationId", args.id))
      .collect();

    const activeMembers = memberships.filter(
      (m) => !m.deletedAt && m.status === AssociationMemberStatus.Accepted,
    );

    const members = await Promise.all(
      activeMembers.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        const profile =
          user ?
            await ctx.db
              .query("profiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .unique()
          : null;

        return {
          ...m,
          user:
            user ?
              {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
              }
            : null,
          profile:
            profile ?
              {
                firstName: profile.identity?.firstName,
                lastName: profile.identity?.lastName,
              }
            : null,
        };
      }),
    );

    return { ...association, members };
  },
});

/**
 * Get my associations (where I'm an accepted member)
 */
export const getMine = authQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("associationMembers")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const active = memberships.filter(
      (m) => !m.deletedAt && m.status === AssociationMemberStatus.Accepted,
    );

    const associations = await Promise.all(
      active.map(async (m) => {
        const assoc = await ctx.db.get(m.associationId);
        if (assoc && assoc.isActive && !assoc.deletedAt) {
          return { ...assoc, myRole: m.role };
        }
        return null;
      }),
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
    country: v.optional(countryCodeValidator),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(addressValidator),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const slug =
      args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      now.toString(36);

    const associationId = await ctx.db.insert("associations", {
      slug,
      name: args.name,
      associationType: args.associationType,
      country: args.country ?? CountryCode.GA,
      isActive: true,
      email: args.email,
      phone: args.phone,
      website: args.website,
      description: args.description,
      logoUrl: args.logoUrl,
      address: args.address,
      updatedAt: now,
    });

    // Add creator as President
    await ctx.db.insert("associationMembers", {
      userId: ctx.user._id,
      associationId,
      role: AssociationRole.President,
      status: AssociationMemberStatus.Accepted,
      joinedAt: now,
    });

    return associationId;
  },
});

/**
 * Update association (admin/president only)
 */
export const update = authMutation({
  args: {
    id: v.id("associations"),
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
    if (!association || association.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Association not found");
    }

    const membership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.id),
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this association");
    }

    if (
      membership.role !== AssociationRole.President &&
      membership.role !== AssociationRole.VicePresident
    ) {
      throw error(ErrorCode.FORBIDDEN, "Insufficient permissions");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(args.id, { ...updates, updatedAt: Date.now() });
    return args.id;
  },
});

/**
 * Invite member to association
 */
export const inviteMember = authMutation({
  args: {
    associationId: v.id("associations"),
    userId: v.id("users"),
    role: v.optional(associationRoleValidator),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.associationId);
    if (!association || association.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Association not found");
    }

    // Check inviter is a member
    const inviterMembership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.associationId),
      )
      .unique();

    if (!inviterMembership || inviterMembership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this association");
    }

    // Check if user is already a member
    const existing = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", args.userId).eq("associationId", args.associationId),
      )
      .unique();

    if (existing && !existing.deletedAt) {
      throw error(ErrorCode.INVALID_ARGUMENT, "User is already a member");
    }

    // Reactivate or create
    if (existing && existing.deletedAt) {
      await ctx.db.patch(existing._id, {
        role: args.role ?? AssociationRole.Member,
        status: AssociationMemberStatus.Pending,
        deletedAt: undefined,
      });
      return existing._id;
    }

    return await ctx.db.insert("associationMembers", {
      userId: args.userId,
      associationId: args.associationId,
      role: args.role ?? AssociationRole.Member,
      status: AssociationMemberStatus.Pending,
    });
  },
});

/**
 * Leave association
 */
export const leave = authMutation({
  args: { associationId: v.id("associations") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.associationId),
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Membership not found");
    }

    await ctx.db.patch(membership._id, { deletedAt: Date.now() });
    return membership._id;
  },
});

/**
 * Remove member from association (president/VP only)
 */
export const removeMember = authMutation({
  args: {
    associationId: v.id("associations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const removerMembership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.associationId),
      )
      .unique();

    if (!removerMembership || removerMembership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member of this association");
    }

    if (
      removerMembership.role !== AssociationRole.President &&
      removerMembership.role !== AssociationRole.VicePresident
    ) {
      throw error(ErrorCode.FORBIDDEN, "Insufficient permissions");
    }

    if (args.userId === ctx.user._id) {
      throw error(ErrorCode.INVALID_ARGUMENT, "Use leave() to remove yourself");
    }

    const target = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", args.userId).eq("associationId", args.associationId),
      )
      .unique();

    if (!target || target.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Member not found");
    }

    await ctx.db.patch(target._id, { deletedAt: Date.now() });
    return target._id;
  },
});

/**
 * Respond to a pending association invite (accept or decline)
 */
export const respondToInvite = authMutation({
  args: {
    associationId: v.id("associations"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.associationId),
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Invite not found");
    }

    if (membership.status !== AssociationMemberStatus.Pending) {
      throw error(ErrorCode.INVALID_ARGUMENT, "Invite already responded to");
    }

    await ctx.db.patch(membership._id, {
      status:
        args.accept ?
          AssociationMemberStatus.Accepted
        : AssociationMemberStatus.Declined,
    });
    return membership._id;
  },
});

/**
 * Update member role (President/VP only)
 */
export const updateMemberRole = authMutation({
  args: {
    associationId: v.id("associations"),
    userId: v.id("users"),
    role: associationRoleValidator,
  },
  handler: async (ctx, args) => {
    const adminMembership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.associationId),
      )
      .unique();

    if (!adminMembership || adminMembership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member");
    }

    if (
      adminMembership.role !== AssociationRole.President &&
      adminMembership.role !== AssociationRole.VicePresident
    ) {
      throw error(ErrorCode.FORBIDDEN, "Insufficient permissions");
    }

    const target = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", args.userId).eq("associationId", args.associationId),
      )
      .unique();

    if (!target || target.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Member not found");
    }

    await ctx.db.patch(target._id, { role: args.role });
    return target._id;
  },
});

/**
 * Soft-delete association (President only)
 */
export const deleteAssociation = authMutation({
  args: { id: v.id("associations") },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.id);
    if (!association || association.deletedAt) {
      throw error(ErrorCode.NOT_FOUND, "Association not found");
    }

    const membership = await ctx.db
      .query("associationMembers")
      .withIndex("by_user_assoc", (q) =>
        q.eq("userId", ctx.user._id).eq("associationId", args.id),
      )
      .unique();

    if (!membership || membership.deletedAt) {
      throw error(ErrorCode.FORBIDDEN, "Not a member");
    }

    if (membership.role !== AssociationRole.President) {
      throw error(ErrorCode.FORBIDDEN, "Only President can delete");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      deletedAt: Date.now(),
    });
    return args.id;
  },
});

/**
 * Get pending invites for the current user
 */
export const getPendingInvites = authQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("associationMembers")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const pending = memberships.filter(
      (m) => !m.deletedAt && m.status === AssociationMemberStatus.Pending,
    );

    const invites = await Promise.all(
      pending.map(async (m) => {
        const assoc = await ctx.db.get(m.associationId);
        if (assoc && assoc.isActive && !assoc.deletedAt) {
          return { ...m, association: assoc };
        }
        return null;
      }),
    );

    return invites.filter((i) => i !== null);
  },
});
