import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { getMembership } from "../lib/auth";
import { assertCanDoTask } from "../lib/permissions";
import { TaskCode } from "../lib/taskCodes";
import { error, ErrorCode } from "../lib/errors";

/**
 * Internal query: Get meeting by ID (for use in actions).
 * Skips permission checks — the calling action handles auth.
 */
export const getForToken = internalQuery({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, { meetingId }) => {
    return await ctx.db.get(meetingId);
  },
});

// ============================================
// Helpers
// ============================================

/**
 * Generate a unique room name for a LiveKit session.
 * Format: mtg-{orgSlug}-{timestamp36}-{random}
 */
function generateRoomName(orgSlug: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `mtg-${orgSlug}-${ts}-${rand}`;
}

// ============================================
// QUERIES
// ============================================

/**
 * Get a single meeting by ID.
 */
export const get = authQuery({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw error(ErrorCode.NOT_FOUND, "Réunion non trouvée");

    // Verify user is a participant or has org membership
    const isParticipant = meeting.participants.some(
      (p) => p.userId === ctx.user._id,
    );
    if (!isParticipant) {
      const membership = await getMembership(ctx, ctx.user._id, meeting.orgId);
      if (!membership) {
        throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
      }
    }

    return meeting;
  },
});

/**
 * List meetings for an organization (agent view).
 */
export const listByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("active"),
        v.literal("ended"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Only require org membership — no specific task code needed to view org meetings
    await getMembership(ctx, ctx.user._id, args.orgId);

    if (args.status) {
      return await ctx.db
        .query("meetings")
        .withIndex("by_org_status", (q) =>
          q.eq("orgId", args.orgId).eq("status", args.status as any),
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("meetings")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(50);
  },
});

/**
 * List meetings the current user is participating in.
 */
export const listMine = authQuery({
  args: {},
  handler: async (ctx) => {
    // Get all meetings created by the user
    const created = await ctx.db
      .query("meetings")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", ctx.user._id))
      .order("desc")
      .take(50);

    return created;
  },
});

/**
 * Get meetings linked to a specific request.
 */
export const listByRequest = authQuery({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetings")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .order("desc")
      .collect();
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new meeting or call.
 */
export const create = authMutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("call"), v.literal("meeting")),
    orgId: v.id("orgs"),
    participantIds: v.array(v.id("users")),
    requestId: v.optional(v.id("requests")),
    appointmentId: v.optional(v.id("appointments")),
    scheduledAt: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Permission check: user must be a member with create permission
    const membership = await getMembership(ctx, ctx.user._id, args.orgId);
    await assertCanDoTask(ctx, ctx.user, membership, TaskCode.meetings.create);

    // Get org for slug
    const org = await ctx.db.get(args.orgId);
    if (!org) throw error(ErrorCode.NOT_FOUND, "Organisation non trouvée");

    const roomName = generateRoomName(org.slug);

    // Build participants array with the creator as host
    const participants = [
      {
        userId: ctx.user._id,
        role: "host" as const,
      },
      ...args.participantIds
        .filter((id) => id !== ctx.user._id)
        .map((userId) => ({
          userId,
          role: "participant" as const,
        })),
    ];

    const meetingId = await ctx.db.insert("meetings", {
      title: args.title,
      type: args.type,
      status: args.scheduledAt ? "scheduled" : "active",
      roomName,
      orgId: args.orgId,
      createdBy: ctx.user._id,
      participants,
      requestId: args.requestId,
      appointmentId: args.appointmentId,
      maxParticipants: args.maxParticipants ?? (args.type === "call" ? 2 : 20),
      scheduledAt: args.scheduledAt,
      startedAt: args.scheduledAt ? undefined : Date.now(),
    });

    return { meetingId, roomName };
  },
});

/**
 * Join a meeting — adds the user to participants if not already present.
 */
export const join = authMutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw error(ErrorCode.NOT_FOUND, "Réunion non trouvée");

    if (meeting.status === "ended" || meeting.status === "cancelled") {
      throw error(ErrorCode.INVALID_ARGUMENT, "Cette réunion est terminée");
    }

    // Check max participants
    const activeParticipants = meeting.participants.filter((p) => !p.leftAt);
    if (
      meeting.maxParticipants &&
      activeParticipants.length >= meeting.maxParticipants
    ) {
      throw error(ErrorCode.INVALID_ARGUMENT, "Nombre max de participants atteint");
    }

    // Add or re-add participant
    const existingIndex = meeting.participants.findIndex(
      (p) => p.userId === ctx.user._id,
    );

    const participants = [...meeting.participants];

    if (existingIndex >= 0) {
      // Re-joining — update timestamps
      participants[existingIndex] = {
        ...participants[existingIndex],
        joinedAt: Date.now(),
        leftAt: undefined,
      };
    } else {
      participants.push({
        userId: ctx.user._id,
        joinedAt: Date.now(),
        role: "participant",
      });
    }

    // Auto-activate if still scheduled
    const patch: any = { participants };
    if (meeting.status === "scheduled") {
      patch.status = "active";
      patch.startedAt = Date.now();
    }

    await ctx.db.patch(args.meetingId, patch);

    return meeting.roomName;
  },
});

/**
 * Leave a meeting — marks the user as having left.
 */
export const leave = authMutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw error(ErrorCode.NOT_FOUND);

    const idx = meeting.participants.findIndex(
      (p) => p.userId === ctx.user._id,
    );
    if (idx < 0) return; // Not a participant, no-op

    const participants = [...meeting.participants];
    participants[idx] = {
      ...participants[idx],
      leftAt: Date.now(),
    };

    // Auto-end if all participants have left
    const stillActive = participants.filter((p) => !p.leftAt);
    const patch: any = { participants };
    if (stillActive.length === 0 && meeting.status === "active") {
      patch.status = "ended";
      patch.endedAt = Date.now();
    }

    await ctx.db.patch(args.meetingId, patch);
  },
});

/**
 * End a meeting (host or manager only).
 */
export const end = authMutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw error(ErrorCode.NOT_FOUND);

    // Only host or someone with manage permission
    const isHost = meeting.participants.some(
      (p) => p.userId === ctx.user._id && p.role === "host",
    );
    if (!isHost) {
      const membership = await getMembership(ctx, ctx.user._id, meeting.orgId);
      await assertCanDoTask(ctx, ctx.user, membership, TaskCode.meetings.manage);
    }

    await ctx.db.patch(args.meetingId, {
      status: "ended",
      endedAt: Date.now(),
    });
  },
});
