import { v } from "convex/values";
import { authQuery, authMutation } from "../lib/customFunctions";
import { requireOrgAdmin, requireOrgAgent } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import {
  dayOfWeekValidator,
  scheduleTimeRangeValidator,
  scheduleExceptionValidator,
} from "../schemas/agentSchedules";

// ============================================================================
// AGENT SCHEDULE QUERIES
// ============================================================================

/**
 * List all agent schedules for an organization
 */
export const listByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const schedules = await ctx.db
      .query("agentSchedules")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    // Enrich with agent info
    const enriched = await Promise.all(
      schedules.map(async (schedule) => {
        const agent = await ctx.db.get(schedule.agentId);
        const orgService = schedule.orgServiceId
          ? await ctx.db.get(schedule.orgServiceId)
          : null;

        let serviceName = null;
        if (orgService) {
          const service = await ctx.db.get(orgService.serviceId);
          serviceName = service?.name;
        }

        return {
          ...schedule,
          agent: agent
            ? {
                _id: agent._id,
                firstName: agent.firstName,
                lastName: agent.lastName,
                email: agent.email,
                avatarUrl: agent.avatarUrl,
              }
            : null,
          serviceName,
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get schedule for a specific agent
 */
export const getByAgent = authQuery({
  args: {
    orgId: v.id("orgs"),
    agentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const schedules = await ctx.db
      .query("agentSchedules")
      .withIndex("by_org_agent", (q) =>
        q.eq("orgId", args.orgId).eq("agentId", args.agentId),
      )
      .collect();

    return schedules;
  },
});

// ============================================================================
// AGENT SCHEDULE MUTATIONS
// ============================================================================

/**
 * Create or update an agent schedule
 */
export const upsert = authMutation({
  args: {
    orgId: v.id("orgs"),
    agentId: v.id("users"),
    orgServiceId: v.optional(v.id("orgServices")),
    weeklySchedule: v.array(
      v.object({
        day: dayOfWeekValidator,
        timeRanges: v.array(scheduleTimeRangeValidator),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Verify the agent is a member of the org
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.agentId).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();

    if (!membership) {
      throw error(
        ErrorCode.NOT_FOUND,
        "Agent is not a member of this organization",
      );
    }

    // Check if schedule already exists for this agent + orgService combo
    const existing = await ctx.db
      .query("agentSchedules")
      .withIndex("by_org_agent", (q) =>
        q.eq("orgId", args.orgId).eq("agentId", args.agentId),
      )
      .collect();

    const matchingSchedule = existing.find(
      (s) =>
        (s.orgServiceId === args.orgServiceId) ||
        (!s.orgServiceId && !args.orgServiceId),
    );

    const now = Date.now();

    if (matchingSchedule) {
      // Update existing
      await ctx.db.patch(matchingSchedule._id, {
        weeklySchedule: args.weeklySchedule,
        updatedAt: now,
      });
      return matchingSchedule._id;
    }

    // Create new
    const scheduleId = await ctx.db.insert("agentSchedules", {
      orgId: args.orgId,
      agentId: args.agentId,
      orgServiceId: args.orgServiceId,
      weeklySchedule: args.weeklySchedule,
      exceptions: [],
      isActive: true,
      createdAt: now,
    });

    return scheduleId;
  },
});

/**
 * Add an exception to an agent schedule (day off, modified hours)
 */
export const addException = authMutation({
  args: {
    scheduleId: v.id("agentSchedules"),
    exception: scheduleExceptionValidator,
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAdmin(ctx, schedule.orgId);

    const exceptions = schedule.exceptions ?? [];

    // Replace if same date already exists
    const filtered = exceptions.filter(
      (e) => e.date !== args.exception.date,
    );
    filtered.push(args.exception);

    await ctx.db.patch(args.scheduleId, {
      exceptions: filtered,
      updatedAt: Date.now(),
    });

    return args.scheduleId;
  },
});

/**
 * Remove an exception by date
 */
export const removeException = authMutation({
  args: {
    scheduleId: v.id("agentSchedules"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAdmin(ctx, schedule.orgId);

    const exceptions = (schedule.exceptions ?? []).filter(
      (e) => e.date !== args.date,
    );

    await ctx.db.patch(args.scheduleId, {
      exceptions,
      updatedAt: Date.now(),
    });

    return args.scheduleId;
  },
});

/**
 * Toggle schedule active state
 */
export const toggleActive = authMutation({
  args: {
    scheduleId: v.id("agentSchedules"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAdmin(ctx, schedule.orgId);

    await ctx.db.patch(args.scheduleId, {
      isActive: !schedule.isActive,
      updatedAt: Date.now(),
    });

    return { isActive: !schedule.isActive };
  },
});

/**
 * Delete an agent schedule
 */
export const deleteSchedule = authMutation({
  args: {
    scheduleId: v.id("agentSchedules"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAdmin(ctx, schedule.orgId);

    await ctx.db.delete(args.scheduleId);
    return true;
  },
});

/**
 * List org members (agents) for schedule assignment dropdowns
 */
export const listOrgAgents = authQuery({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const agents = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return user
          ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatarUrl: user.avatarUrl,
              role: m.role,
            }
          : null;
      }),
    );

    return agents.filter(Boolean);
  },
});
