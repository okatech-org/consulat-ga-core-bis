import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "../_generated/dataModel";
import { Id } from "../_generated/dataModel";
import { RequestStatus } from "../lib/validators";
import { calculateCompletionScore } from "../lib/utils";

const triggers = new Triggers<DataModel>();

// ============================================================================
// REQUESTS TRIGGERS
// ============================================================================

// Sync status and timestamps from events to requests (Event Sourcing hydration)
triggers.register("events", async (ctx, change) => {
  if (change.operation !== "insert") return;
  
  const event = change.newDoc;
  
  // Only handle events targeting requests
  if (event.targetType !== "request") return;
  
  const requestId = event.targetId as Id<"requests">;
  
  // We need to check if the request actually exists (it might have been deleted)
  // Note: triggers run in the same transaction, so this `get` is consistent
  const request = await ctx.db.get(requestId);
  if (!request) return;

  const updates: Partial<any> = {
    updatedAt: Date.now(),
  };

  // Handle specific event types
  if (event.type === "status_changed" && event.data?.to) {
    updates.status = event.data.to;

    if (event.data.to === RequestStatus.SUBMITTED) {
      updates.submittedAt = Date.now();
    }
    if (event.data.to === RequestStatus.COMPLETED) {
      updates.completedAt = Date.now();
    }
  } else if (event.type === "request_submitted") {
    // Explicit submission event
     updates.status = RequestStatus.SUBMITTED;
     updates.submittedAt = Date.now();
  }

  // Only patch if there are meaningful updates
  if (Object.keys(updates).length > 1) { // updatedAt is always there
     await ctx.db.patch(requestId, updates);
  }
});

// ============================================================================
// PROFILES TRIGGERS
// ============================================================================


// re-calculate completion score on every update
triggers.register("profiles", async (ctx, change) => {
  if (change.operation === "delete") return;

  const profile = change.newDoc;
  const score = calculateCompletionScore(profile as any);

  // Avoid infinite loops: only patch if different
  if (profile.completionScore !== score) {
    await ctx.db.patch(profile._id, { completionScore: score });
  }
});

export default triggers;
