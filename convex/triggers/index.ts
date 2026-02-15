import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import {
  RequestStatus,
  RegistrationStatus,
  ServiceCategory,
  NotificationType,
} from "../lib/constants";
import {
  requestsByOrg,
  membershipsByOrg,
  orgServicesByOrg,
  globalCounts,
} from "../lib/aggregates";
import triggers from "../lib/triggerSetup";

// ============================================================================
// AGGREGATE TRIGGERS — Keep denormalized counts in sync
// ============================================================================
// Using idempotentTrigger so backfill migrations work safely
triggers.register("requests", requestsByOrg.idempotentTrigger());
triggers.register("memberships", membershipsByOrg.idempotentTrigger());
triggers.register("orgServices", orgServicesByOrg.idempotentTrigger());
triggers.register("users", globalCounts.idempotentTrigger());

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

    if (event.data.to === RequestStatus.Pending) {
      updates.submittedAt = Date.now();
    }
    if (event.data.to === RequestStatus.Completed) {
      updates.completedAt = Date.now();
    }
  } else if (event.type === "request_submitted") {
    // Explicit submission event
    updates.status = RequestStatus.Pending;
    updates.submittedAt = Date.now();
  }

  // Only patch if there are meaningful updates
  if (Object.keys(updates).length > 1) {
    // updatedAt is always there
    await ctx.db.patch(requestId, updates);
  }
});

// ============================================================================
// REQUEST STATUS CHANGE → SYNC REGISTRATION + NOTIFY
// ============================================================================

triggers.register("requests", async (ctx, change) => {
  // Only handle updates where status changed
  if (change.operation === "delete") return;
  if (!change.oldDoc || !change.newDoc) return;
  if (change.oldDoc.status === change.newDoc.status) return;

  const newStatus = change.newDoc.status;
  const requestId = change.id;

  // 1. Sync status to consularRegistrations if applicable
  const orgService = await ctx.db.get(change.newDoc.orgServiceId);
  const service = orgService ? await ctx.db.get(orgService.serviceId) : null;

  if (service?.category === ServiceCategory.Registration) {
    let regStatus:
      | (typeof RegistrationStatus)[keyof typeof RegistrationStatus]
      | null = null;

    if (newStatus === RequestStatus.Completed) {
      regStatus = RegistrationStatus.Active;
    } else if (newStatus === RequestStatus.Cancelled) {
      regStatus = RegistrationStatus.Expired;
    }

    if (regStatus) {
      // Check consularRegistrations first
      const registration = await ctx.db
        .query("consularRegistrations")
        .withIndex("by_request", (q) => q.eq("requestId", requestId))
        .unique();

      if (registration && registration.status !== regStatus) {
        await ctx.db.patch(registration._id, {
          status: regStatus,
        });
      }

      // Also check consularNotifications (signalements)
      const notification = await ctx.db
        .query("consularNotifications")
        .withIndex("by_request", (q) => q.eq("requestId", requestId))
        .unique();

      if (notification && notification.status !== regStatus) {
        const notifUpdates: Record<string, unknown> = { status: regStatus };
        if (regStatus === RegistrationStatus.Active) {
          notifUpdates.activatedAt = Date.now();
        }
        await ctx.db.patch(notification._id, notifUpdates);
      }
    }
  }

  // 2. Create in-app notification for status update
  const statusLabels: Record<string, string> = {
    pending: "En attente",
    processing: "En traitement",
    pending_completion: "Compléments requis",
    validated: "Validée",
    completed: "Terminée",
    cancelled: "Annulée",
    rejected: "Rejetée",
    ready_for_pickup: "Prête à retirer",
  };

  await ctx.scheduler.runAfter(
    0,
    internal.functions.notifications.createNotification,
    {
      userId: change.newDoc.userId,
      type: NotificationType.StatusUpdate,
      title: "Mise à jour de votre demande",
      body: `Votre demande ${change.newDoc.reference || ""} est maintenant: ${statusLabels[newStatus] || newStatus}`,
      link: `/my-space/requests/${requestId}`,
      relatedId: requestId as unknown as string,
      relatedType: "request",
    },
  );

  // 3. Send status notification email
  await ctx.scheduler.runAfter(
    0,
    internal.functions.notifications.notifyStatusUpdate,
    {
      requestId: requestId,
      newStatus: newStatus,
    },
  );
});

// ============================================================================
// MESSAGES TRIGGERS - Auto-notification on new message
// ============================================================================

triggers.register("messages", async (ctx, change) => {
  if (change.operation !== "insert") return;

  const message = change.newDoc;

  // Get request to find recipient user
  const request = await ctx.db.get(message.requestId);
  if (!request) return;

  // Determine recipient (the one who didn't send the message)
  const recipientId =
    message.senderId === request.userId ?
      null // Agent received - handle separately if needed
    : request.userId; // Citizen received

  // For now, only notify citizens (when agents send messages)
  if (recipientId && recipientId !== message.senderId) {
    const sender = await ctx.db.get(message.senderId);

    // Create in-app notification
    await ctx.scheduler.runAfter(
      0,
      internal.functions.notifications.createNotification,
      {
        userId: recipientId,
        type: NotificationType.NewMessage,
        title: "Nouveau message",
        body: `${sender?.name || "Agent consulaire"}: ${message.content.substring(0, 100)}...`,
        link: `/my-space/requests/${message.requestId}`,
        relatedId: message.requestId,
        relatedType: "request",
      },
    );
  }

  // Schedule notification email (runs after transaction commits)
  await ctx.scheduler.runAfter(
    0,
    internal.functions.notifications.notifyNewMessage,
    {
      requestId: message.requestId,
      senderId: message.senderId,
      messagePreview: message.content.substring(0, 200),
    },
  );
});

// ============================================================================
// CHILD PROFILES TRIGGERS - Completion score (similar to profiles)
// ============================================================================

triggers.register("childProfiles", async (_ctx, change) => {
  if (change.operation === "delete") return;

  const child = change.newDoc;

  // Calculate child profile completion score
  let score = 0;
  const identity = child.identity;

  // Identity fields (50 points max)
  if (identity.firstName) score += 10;
  if (identity.lastName) score += 10;
  if (identity.birthDate) score += 10;
  if (identity.birthPlace) score += 5;
  if (identity.birthCountry) score += 5;
  if (identity.gender) score += 5;
  if (identity.nationality) score += 5;

  // Passport info (20 points max)
  if (child.passportInfo?.number) score += 10;
  if (child.passportInfo?.expiryDate) score += 10;

  // Parents (15 points max)
  if (child.parents && child.parents.length > 0) {
    score += Math.min(15, child.parents.length * 8);
  }

  // Documents (15 points max)
  if (child.documents) {
    if (child.documents.passport) score += 5;
    if (child.documents.birthCertificate) score += 5;
    if (child.documents.photo) score += 5;
  }

  // Store score (add completionScore field if not already in schema)
  // For now, we can add it as metadata in a future schema update
  // This trigger is ready when the schema includes completionScore
});

// ============================================================================
// AUDIT LOGGING TRIGGERS - Critical tables
// ============================================================================

const AUDITED_TABLES = [
  "requests",
  "payments",
  "documents",
  "consularRegistrations",
  "consularNotifications",
] as const;

// Register audit triggers for each critical table
for (const tableName of AUDITED_TABLES) {
  triggers.register(tableName, async (ctx, change) => {
    const timestamp = Date.now();

    // Get actor from auth context if available
    let actorId: Id<"users"> | undefined;
    let actorTokenIdentifier: string | undefined;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        actorTokenIdentifier = identity.tokenIdentifier;
        // Try to find user by externalId
        const user = await ctx.db
          .query("users")
          .withIndex("by_externalId", (q) =>
            q.eq("externalId", identity.subject),
          )
          .unique();
        if (user) {
          actorId = user._id;
        }
      }
    } catch {
      // Auth context may not be available in all contexts
    }

    // Create audit log entry
    await ctx.db.insert("auditLog", {
      table: tableName,
      docId: change.id as unknown as string,
      operation: change.operation,
      actorId,
      actorTokenIdentifier,
      changes: {
        oldDoc:
          change.oldDoc ? JSON.parse(JSON.stringify(change.oldDoc)) : null,
        newDoc:
          change.newDoc ? JSON.parse(JSON.stringify(change.newDoc)) : null,
      },
      timestamp,
    });
  });
}

export default triggers;
