import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Meetings table — Audio/video calls and group meetings (LiveKit)
 *
 * Supports two modes:
 *   - "call": 1:1 audio/video call (agent ↔ citizen)
 *   - "meeting": group meeting (multiple participants)
 *
 * Linked to LiveKit rooms via `roomName`.
 */

const meetingParticipantValidator = v.object({
  userId: v.id("users"),
  joinedAt: v.optional(v.number()),
  leftAt: v.optional(v.number()),
  role: v.union(v.literal("host"), v.literal("participant")),
});

export const meetingsTable = defineTable({
  // Identity
  title: v.string(),
  type: v.union(v.literal("call"), v.literal("meeting")),
  status: v.union(
    v.literal("scheduled"),
    v.literal("active"),
    v.literal("ended"),
    v.literal("cancelled"),
  ),

  // LiveKit
  roomName: v.string(),
  roomSid: v.optional(v.string()),

  // Ownership
  orgId: v.id("orgs"),
  createdBy: v.id("users"),

  // Participants
  participants: v.array(meetingParticipantValidator),

  // Context linking (optional)
  requestId: v.optional(v.id("requests")),
  appointmentId: v.optional(v.id("appointments")),

  // Config
  maxParticipants: v.optional(v.number()),
  recordingEnabled: v.optional(v.boolean()),

  // Timestamps
  scheduledAt: v.optional(v.number()),
  startedAt: v.optional(v.number()),
  endedAt: v.optional(v.number()),
})
  .index("by_org", ["orgId"])
  .index("by_roomName", ["roomName"])
  .index("by_createdBy", ["createdBy"])
  .index("by_org_status", ["orgId", "status"])
  .index("by_request", ["requestId"]);
