import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSuperadmin, logAuditAction } from "./lib/auth";
import { UserRole, AuditAction, userRoleValidator } from "./lib/types";

/**
 * Get system-wide statistics
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperadmin(ctx);

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
export const listUsers = query({
  args: {
    role: v.optional(userRoleValidator),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperadmin(ctx);

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
export const listOrgs = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireSuperadmin(ctx);

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
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperadmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Prevent demoting yourself
    if (user._id === admin._id && args.role !== UserRole.SUPERADMIN) {
      throw new Error("Cannot demote yourself");
    }

    const previousRole = user.role;

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, admin._id, AuditAction.USER_ROLE_CHANGED, "user", args.userId, {
      previousRole,
      newRole: args.role,
    });

    return args.userId;
  },
});

/**
 * Disable a user account (soft delete)
 */
export const disableUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperadmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Prevent disabling yourself
    if (user._id === admin._id) {
      throw new Error("Cannot disable yourself");
    }

    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, admin._id, AuditAction.USER_DISABLED, "user", args.userId, {
      email: user.email,
    });

    return args.userId;
  },
});

/**
 * Re-enable a user account
 */
export const enableUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperadmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, admin._id, AuditAction.USER_UPDATED, "user", args.userId, {
      action: "enabled",
    });

    return args.userId;
  },
});

/**
 * Disable an organization
 */
export const disableOrg = mutation({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperadmin(ctx);

    const org = await ctx.db.get(args.orgId);
    if (!org) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(args.orgId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    await logAuditAction(ctx, admin._id, AuditAction.ORG_DISABLED, "org", args.orgId, {
      name: org.name,
    });

    return args.orgId;
  },
});

/**
 * Get audit logs
 */
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
    targetType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperadmin(ctx);

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
