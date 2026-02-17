import { v } from "convex/values";
import { query } from "../_generated/server";
import { createInvitedUserHelper } from "../lib/users";

// ... existing imports

import { authQuery, authMutation } from "../lib/customFunctions";
import { getMembership } from "../lib/auth";
import { assertCanDoTask } from "../lib/permissions";
import { error, ErrorCode } from "../lib/errors";
import { notDeleted } from "../lib/utils";
import {
  RequestStatus,
  orgTypeValidator,
  addressValidator,
  orgSettingsValidator,
  memberRoleValidator,
  MemberRole,
  localizedStringValidator,
} from "../lib/validators";
import { countryCodeValidator, CountryCode } from "../lib/countryCodeValidator";
import {
  requestsByOrg,
  membershipsByOrg,
  orgServicesByOrg,
} from "../lib/aggregates";

/**
 * List all active organizations
 */
export const list = query({
  args: {
    type: v.optional(orgTypeValidator),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orgs = await ctx.db
      .query("orgs")
      .withIndex("by_active_notDeleted", (q) =>
        q.eq("isActive", true).eq("deletedAt", undefined),
      )
      .collect();

    // Filter by type/country if provided
    if (args.type) {
      orgs = orgs.filter((org) => org.type === args.type);
    }
    if (args.country) {
      orgs = orgs.filter((org) => org.country === args.country);
    }

    return orgs;
  },
});

/**
 * List organizations by jurisdiction country
 * Returns consulates/embassies whose jurisdiction includes the given country
 */
export const listByJurisdiction = query({
  args: {
    residenceCountry: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all active orgs
    const orgs = await ctx.db
      .query("orgs")
      .withIndex("by_active_notDeleted", (q) =>
        q.eq("isActive", true).eq("deletedAt", undefined),
      )
      .collect();

    // Filter to consulates/embassies that have this country in their jurisdiction
    const consulateTypes = ["embassy", "consulate", "general_consulate"];

    return orgs.filter((org) => {
      if (!consulateTypes.includes(org.type)) return false;
      if (!org.jurisdictionCountries || org.jurisdictionCountries.length === 0)
        return false;
      return org.jurisdictionCountries.includes(
        args.residenceCountry as CountryCode,
      );
    });
  },
});

/**
 * Get organization by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (org?.deletedAt) return null;
    return org;
  },
});

/**
 * Get organization by ID
 */
export const getById = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (org?.deletedAt) return null;
    return org;
  },
});

/**
 * Create a new organization
 */
export const create = authMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: orgTypeValidator,
    country: countryCodeValidator,
    timezone: v.string(),
    address: addressValidator,
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    // Positions to create (pre-filled from template, possibly edited)
    positions: v.optional(
      v.array(
        v.object({
          code: v.string(),
          title: localizedStringValidator,
          description: v.optional(localizedStringValidator),
          level: v.number(),
          grade: v.optional(v.string()),
          roleModuleCodes: v.array(v.string()),
          isRequired: v.optional(v.boolean()),
        }),
      ),
    ),
    // Template type used (to track in orgRoleConfig)
    templateType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check slug uniqueness
    const existing = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw error(ErrorCode.ORG_SLUG_EXISTS);
    }

    const { positions, templateType, ...orgData } = args;

    const orgId = await ctx.db.insert("orgs", {
      ...orgData,
      isActive: true,
      updatedAt: Date.now(),
    });

    // Add creator as admin
    await ctx.db.insert("memberships", {
      orgId,
      userId: ctx.user._id,
      role: MemberRole.Admin,
    });

    // Create positions from template/edited list
    if (positions && positions.length > 0) {
      const now = Date.now();
      for (const pos of positions) {
        await ctx.db.insert("positions", {
          orgId,
          code: pos.code,
          title: pos.title,
          description: pos.description,
          level: pos.level,
          grade: pos.grade,
          roleModuleCodes: pos.roleModuleCodes,
          isRequired: pos.isRequired ?? false,
          isActive: true,
          createdBy: ctx.user._id,
          updatedAt: now,
        });
      }

      // Track role config
      await ctx.db.insert("orgRoleConfig", {
        orgId,
        templateType: templateType ?? args.type,
        isCustomized: false,
        initializedAt: now,
      });
    }

    return orgId;
  },
});

/**
 * Update organization details
 */
export const update = authMutation({
  args: {
    orgId: v.id("orgs"),
    name: v.optional(v.string()),
    address: v.optional(addressValidator),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    timezone: v.optional(v.string()),
    settings: v.optional(orgSettingsValidator),
    logoUrl: v.optional(v.string()),
    jurisdictionCountries: v.optional(v.array(countryCodeValidator)),
  },
  handler: async (ctx, args) => {
    const membership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, membership, "settings.manage");

    const { orgId, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );

    await ctx.db.patch(orgId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return orgId;
  },
});

/**
 * Get organization members
 */
export const getMembers = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    const activeMembers = notDeleted(memberships);

    // Batch fetch users
    const userIds = [...new Set(activeMembers.map((m) => m.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));

    return activeMembers
      .map((membership) => {
        const user = userMap.get(membership.userId);
        if (!user) return null;
        return {
          ...user,
          role: membership.role,
          membershipId: membership._id,
          positionId: membership.positionId,
          joinedAt: membership._creationTime,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  },
});

/**
 * Get org chart data: positions with occupants + unassigned members.
 * Used by the team/org chart page.
 */
export const getOrgChart = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const membership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, membership, "org.view");

    // 1. Get all positions for this org
    const positions = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // 2. Get all active memberships for this org
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
    const activeMembers = notDeleted(memberships);

    // 3. Batch fetch users
    const userIds = [...new Set(activeMembers.map((m) => m.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));

    // 4. Build a map: positionId → membership+user
    const positionOccupants = new Map<
      string,
      { membership: typeof activeMembers[0]; user: NonNullable<typeof users[0]> }
    >();
    const assignedMembershipIds = new Set<string>();

    for (const m of activeMembers) {
      if (m.positionId) {
        const user = userMap.get(m.userId);
        if (user) {
          positionOccupants.set(m.positionId as string, { membership: m, user });
          assignedMembershipIds.add(m._id as string);
        }
      }
    }

    // 5. Build position list with occupants
    const positionsWithOccupants = positions
      .sort((a, b) => (a.level ?? 99) - (b.level ?? 99))
      .map((pos) => {
        const occupant = positionOccupants.get(pos._id as string);
        return {
          _id: pos._id,
          code: pos.code,
          title: pos.title,
          description: pos.description,
          level: pos.level,
          grade: pos.grade,
          isRequired: pos.isRequired,
          roleModuleCodes: pos.roleModuleCodes,
          occupant: occupant
            ? {
                userId: occupant.user._id,
                name: occupant.user.name,
                firstName: occupant.user.firstName,
                lastName: occupant.user.lastName,
                email: occupant.user.email,
                avatarUrl: occupant.user.avatarUrl,
                membershipId: occupant.membership._id,
                role: occupant.membership.role,
              }
            : null,
        };
      });

    // 6. Unassigned members (members without a positionId)
    const unassignedMembers = activeMembers
      .filter((m) => !assignedMembershipIds.has(m._id as string))
      .map((m) => {
        const user = userMap.get(m.userId);
        if (!user) return null;
        return {
          userId: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          membershipId: m._id,
          role: m.role,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    return {
      positions: positionsWithOccupants,
      unassignedMembers,
      totalPositions: positions.length,
      filledPositions: positionOccupants.size,
      vacantPositions: positions.length - positionOccupants.size,
    };
  },
});

/**
 * Add member to organization
 */
export const addMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
    role: memberRoleValidator,
    positionId: v.optional(v.id("positions")),
  },
  handler: async (ctx, args) => {
    const membership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, membership, "settings.manage");

    // Check if already member
    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (existing) {
      throw error(ErrorCode.MEMBER_ALREADY_EXISTS);
    }

    // Validate position belongs to org if provided
    if (args.positionId) {
      const position = await ctx.db.get(args.positionId);
      if (!position || position.orgId !== args.orgId) {
        throw error(ErrorCode.POSITION_NOT_FOUND);
      }

      // Unassign any existing holder
      const existingHolder = await ctx.db
        .query("memberships")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .filter((q) =>
          q.and(
            q.eq(q.field("positionId"), args.positionId),
            q.eq(q.field("deletedAt"), undefined),
          ),
        )
        .first();

      if (existingHolder) {
        await ctx.db.patch(existingHolder._id, { positionId: undefined });
      }
    }

    return await ctx.db.insert("memberships", {
      orgId: args.orgId,
      userId: args.userId,
      role: args.role,
      positionId: args.positionId,
    });
  },
});

/**
 * Update member role
 */
export const updateMemberRole = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
    role: memberRoleValidator,
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (!membership) {
      throw error(ErrorCode.MEMBER_NOT_FOUND);
    }

    await ctx.db.patch(membership._id, { role: args.role });
    return membership._id;
  },
});

/**
 * Assign a position to a member (or remove position assignment)
 */
export const assignMemberPosition = authMutation({
  args: {
    orgId: v.id("orgs"),
    membershipId: v.id("memberships"),
    positionId: v.optional(v.id("positions")),
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.orgId !== args.orgId || membership.deletedAt) {
      throw error(ErrorCode.MEMBER_NOT_FOUND);
    }

    // If assigning a position, validate it belongs to this org
    if (args.positionId) {
      const position = await ctx.db.get(args.positionId);
      if (!position || position.orgId !== args.orgId) {
        throw new Error("Position not found in this organization");
      }

      // Check if another member already holds this position
      const existingHolder = await ctx.db
        .query("memberships")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .filter((q) =>
          q.and(
            q.eq(q.field("positionId"), args.positionId),
            q.eq(q.field("deletedAt"), undefined),
            q.neq(q.field("_id"), args.membershipId),
          ),
        )
        .first();

      if (existingHolder) {
        // Unassign the previous holder
        await ctx.db.patch(existingHolder._id, { positionId: undefined });
      }
    }

    await ctx.db.patch(args.membershipId, { positionId: args.positionId });
    return args.membershipId;
  },
});

/**
 * Remove member from organization
 */
export const removeMember = authMutation({
  args: {
    orgId: v.id("orgs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

    // Cannot remove self
    if (ctx.user._id === args.userId) {
      throw error(ErrorCode.CANNOT_REMOVE_SELF);
    }

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (!membership) {
      throw error(ErrorCode.MEMBER_NOT_FOUND);
    }

    // Soft delete
    await ctx.db.patch(membership._id, { deletedAt: Date.now() });
    return true;
  },
});

/**
 * Get organization stats — uses Aggregate for O(log n) counts.
 * Falls back to cached stats from the org document if available.
 */
export const getStats = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const membership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, membership, "org.view");

    const org = await ctx.db.get(args.orgId);
    if (org?.stats) {
      return org.stats;
    }

    // Calculate on the fly using Aggregate counts
    const ns = args.orgId as string;
    const [memberCount, pendingRequests, activeServices] = await Promise.all([
      membershipsByOrg.count(ctx, { namespace: ns }),
      requestsByOrg.count(ctx, {
        namespace: ns,
        bounds: { prefix: [RequestStatus.Pending] },
      }),
      orgServicesByOrg.count(ctx, {
        namespace: ns,
        bounds: { eq: 1 }, // isActive = true → sortKey = 1
      }),
    ]);

    // Upcoming appointments still need a DB query (filtered by date)
    const upcomingAppointments = await ctx.db
      .query("requests")
      .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.gte(q.field("appointmentDate"), Date.now()))
      .collect();

    return {
      memberCount,
      pendingRequests,
      activeServices,
      upcomingAppointments: upcomingAppointments.length,
      updatedAt: Date.now(),
    };
  },
});

/**
 * Check if current user is org admin
 */
export const isUserAdmin = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    if (ctx.user.isSuperadmin) return true;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    return membership?.role === MemberRole.Admin;
  },
});

/**
 * Get current user's role in the organization
 */
export const getCurrentRole = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    if (ctx.user.isSuperadmin) return MemberRole.Admin;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    return membership?.role ?? null;
  },
});

/**
 * Create a new user account (invite flow)
 */
export const createAccount = authMutation({
  args: {
    orgId: v.id("orgs"),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const callerMembership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, callerMembership, "settings.manage");

    const { email, firstName, lastName } = args;
    const name = `${firstName} ${lastName}`;

    // Call helper directly to avoid circular dependency
    const userId = await createInvitedUserHelper(
      ctx,
      email,
      name,
      firstName,
      lastName,
    );

    return { userId };
  },
});
