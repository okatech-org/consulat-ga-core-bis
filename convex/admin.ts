import { v } from "convex/values";
import { superadminQuery, superadminMutation } from "./lib/customFunctions";
import { logAuditAction } from "./lib/auth";
import { UserRole, AuditAction, userRoleValidator, orgTypeValidator, addressValidator } from "./lib/types";

/**
 * Search users by email (for member selector)
 */
export const searchUsers = superadminQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    const limit = args.limit ?? 10;

    if (!searchQuery || searchQuery.length < 3) {
      return [];
    }

    const users = await ctx.db.query("users").collect();

    // Filter users by email only
    const filtered = users.filter((user) => {
      const email = (user.email ?? "").toLowerCase();
      return email.includes(searchQuery);
    });

    return filtered.slice(0, limit).map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    }));
  },
});

/**
 * Get system-wide statistics
 */
export const getStats = superadminQuery({
  args: {},
  handler: async (ctx) => {
    const [users, orgs, services, requests, appointments] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("orgs").collect(),
      ctx.db.query("orgServices").collect(),
      ctx.db.query("serviceRequests").collect(),
      ctx.db.query("appointments").collect(),
    ]);

    const activeUsers = users.filter((u) => u.isActive !== false);
    const activeOrgs = orgs.filter((o) => o.isActive);
    const activeOrgServices = services.filter((s) => s.isActive);

    const requestsByStatus = requests.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      users: {
        total: users.length,
        active: activeUsers.length,
        superadmins: users.filter((u) => u.role === UserRole.SUPERADMIN).length,
      },
      orgs: {
        total: orgs.length,
        active: activeOrgs.length,
      },
      services: {
        total: services.length,
        active: activeOrgServices.length,
      },
      requests: {
        total: requests.length,
        byStatus: requestsByStatus,
      },
      appointments: {
        total: appointments.length,
      },
    };
  },
});

/**
 * List all users with optional filters
 */
export const listUsers = superadminQuery({
  args: {
    role: v.optional(userRoleValidator),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    if (args.role !== undefined) {
      users = users.filter((u) => u.role === args.role);
    }

    if (args.isActive !== undefined) {
      users = users.filter((u) => u.isActive === args.isActive);
    }

    if (args.limit) {
      users = users.slice(0, args.limit);
    }

    return users;
  },
});

/**
 * List all organizations
 */
export const listOrgs = superadminQuery({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let orgs = await ctx.db.query("orgs").collect();

    if (args.isActive !== undefined) {
      orgs = orgs.filter((o) => o.isActive === args.isActive);
    }

    return orgs;
  },
});

/**
 * Update a user's role
 */
export const updateUserRole = superadminMutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("errors.users.notFound");
    }

    // Prevent demoting yourself
    if (user._id === ctx.user._id && args.role !== UserRole.SUPERADMIN) {
      throw new Error("errors.admin.cannotDemoteSelf");
    }

    const previousRole = user.role;

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, ctx.user._id, AuditAction.USER_ROLE_CHANGED, "user", args.userId, {
      previousRole,
      newRole: args.role,
    });

    return args.userId;
  },
});

/**
 * Disable a user account (soft delete)
 */
export const disableUser = superadminMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("errors.users.notFound");
    }

    // Prevent disabling yourself
    if (user._id === ctx.user._id) {
      throw new Error("errors.admin.cannotDisableSelf");
    }

    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, ctx.user._id, AuditAction.USER_DISABLED, "user", args.userId, {
      email: user.email,
    });

    return args.userId;
  },
});

/**
 * Re-enable a user account
 */
export const enableUser = superadminMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("errors.users.notFound");
    }

    await ctx.db.patch(args.userId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, ctx.user._id, AuditAction.USER_UPDATED, "user", args.userId, {
      action: "enabled",
    });

    return args.userId;
  },
});

/**
 * Disable an organization
 */
export const disableOrg = superadminMutation({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) {
      throw new Error("errors.orgs.notFound");
    }

    await ctx.db.patch(args.orgId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, ctx.user._id, AuditAction.ORG_DISABLED, "org", args.orgId, {
      name: org.name,
    });

    return args.orgId;
  },
});

/**
 * Re-enable an organization
 */
export const enableOrg = superadminMutation({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) {
      throw new Error("errors.orgs.notFound");
    }

    await ctx.db.patch(args.orgId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, ctx.user._id, AuditAction.ORG_UPDATED, "org", args.orgId, {
      action: "enabled",
    });

    return args.orgId;
  },
});

/**
 * Create a new organization (superadmin only)
 */
export const createOrg = superadminMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: orgTypeValidator,
    address: addressValidator,
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug is unique
    const existingOrg = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingOrg) {
      throw new Error("errors.orgs.slugAlreadyExists");
    }

    const orgId = await ctx.db.insert("orgs", {
      name: args.name,
      slug: args.slug,
      type: args.type,
      address: args.address,
      email: args.email,
      phone: args.phone,
      website: args.website,
      timezone: args.timezone ?? "Europe/Paris",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, ctx.user._id, AuditAction.ORG_CREATED, "org", orgId, {
      name: args.name,
      slug: args.slug,
    });

    return orgId;
  },
});

/**
 * Get audit logs
 */
export const getAuditLogs = superadminQuery({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
    targetType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .collect();

    if (args.action) {
      logs = logs.filter((l) => l.action === args.action);
    }

    if (args.targetType) {
      logs = logs.filter((l) => l.targetType === args.targetType);
    }

    const limit = args.limit ?? 100;
    logs = logs.slice(0, limit);

    // Enrich with user info
    return await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user: user
            ? { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName }
            : null,
        };
      })
    );
  },
});
