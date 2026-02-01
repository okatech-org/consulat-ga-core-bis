import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { requireOrgAgent, requireOrgMember } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import { generateReferenceNumber } from "../lib/utils";
import {
  requestStatusValidator,
  requestPriorityValidator,
  RequestStatus,
  RequestPriority,
  EventType,
  OwnerType,
} from "../lib/validators";

import { mutation } from "../_generated/server";

/**
 * Create a new service request from a dynamic form submission
 */
export const createFromForm = authMutation({
  args: {
    orgServiceId: v.id("orgServices"),
    formData: v.any(), // Validated by client-side Zod/JSON Schema
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw error(ErrorCode.SERVICE_NOT_FOUND);
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("requests", {
      userId: ctx.user._id,
      orgId: orgService.orgId,
      orgServiceId: args.orgServiceId,
      reference: generateReferenceNumber(),
      status: RequestStatus.Pending,
      priority: RequestPriority.Normal,
      formData: args.formData,
      submittedAt: now,
      updatedAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.RequestSubmitted,
      data: { status: RequestStatus.Pending },
    });

    return requestId;
  },
});

/**
 * Create a new service request
 */
export const create = authMutation({
  args: {
    orgServiceId: v.id("orgServices"),
    formData: v.optional(v.any()),
    submitNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw error(ErrorCode.SERVICE_NOT_FOUND);
    }
    if (!orgService.isActive) {
      throw error(ErrorCode.SERVICE_NOT_AVAILABLE);
    }

    const status = args.submitNow
      ? RequestStatus.Pending
      : RequestStatus.Draft;

    const now = Date.now();
    const requestId = await ctx.db.insert("requests", {
      userId: ctx.user._id,
      orgId: orgService.orgId,
      orgServiceId: args.orgServiceId,
      reference: args.submitNow ? generateReferenceNumber() : `DRAFT-${now}`,
      status,
      priority: RequestPriority.Normal,
      formData: args.formData,
      submittedAt: args.submitNow ? now : undefined,
      updatedAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: requestId as unknown as string,
      actorId: ctx.user._id,
      type: args.submitNow
        ? EventType.RequestSubmitted
        : EventType.RequestCreated,
      data: { status },
    });

    return requestId;
  },
});

/**
 * Get request by ID with all related data
 */
export const getById = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const [user, org, orgService, assignedTo] = await Promise.all([
      ctx.db.get(request.userId),
      ctx.db.get(request.orgId),
      ctx.db.get(request.orgServiceId),
      request.assignedTo ? ctx.db.get(request.assignedTo) : null,
    ]);

    const service = orgService
      ? await ctx.db.get(orgService.serviceId)
      : null;

    // Get documents for this request
    const rawDocuments = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Request).eq("ownerId", args.requestId as unknown as string)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Generate URLs for each document
    const documents = await Promise.all(
      rawDocuments.map(async (doc) => ({
        ...doc,
        url: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : null,
      }))
    );

    // Get ALL events for this request (notes, status changes, etc.)
    const allEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetType", "request").eq("targetId", args.requestId as unknown as string)
      )
      .collect();

    // Separate notes for backwards compatibility
    const notes = allEvents
      .filter((e) => e.type === EventType.NoteAdded)
      .map((e) => ({
        _id: e._id,
        content: e.data.content,
        isInternal: e.data.isInternal,
        createdAt: e._creationTime,
        userId: e.actorId,
      }));

    // Get status change events for timeline
    const statusHistory = allEvents
      .filter((e) => e.type === EventType.StatusChanged || e.type === EventType.RequestSubmitted)
      .map((e) => ({
        _id: e._id,
        type: e.type,
        from: e.data.from,
        to: e.data.to || e.data.status,
        note: e.data.note,
        createdAt: e._creationTime,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);

    // Get required documents (orgService override or service default)
    const requiredDocuments = orgService?.customDocuments ?? service?.requiredDocuments ?? [];

    return {
      ...request,
      user,
      org,
      orgService,
      service,
      assignedTo,
      documents,
      notes,
      statusHistory,
      requiredDocuments,
    };
  },
});

/**
 * List requests for current user
 */
export const listMine = authQuery({
  args: {
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    const requests = args.status
      ? await ctx.db
          .query("requests")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", ctx.user._id).eq("status", args.status!)
          )
          .collect()
      : await ctx.db
          .query("requests")
          .withIndex("by_user_status", (q) => q.eq("userId", ctx.user._id))
          .collect();

    // Batch fetch related data
    const orgServiceIds = [...new Set(requests.map((r) => r.orgServiceId))];
    const orgIds = [...new Set(requests.map((r) => r.orgId))];

    const [orgServices, orgs] = await Promise.all([
      Promise.all(orgServiceIds.map((id) => ctx.db.get(id))),
      Promise.all(orgIds.map((id) => ctx.db.get(id))),
    ]);

    const orgServiceMap = new Map(
      orgServices.filter(Boolean).map((os) => [os!._id, os!])
    );
    const orgMap = new Map(orgs.filter(Boolean).map((o) => [o!._id, o!]));

    // Get service details
    const serviceIds = [
      ...new Set(
        orgServices.filter(Boolean).map((os) => os!.serviceId)
      ),
    ];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    return requests.map((request) => {
      const orgService = orgServiceMap.get(request.orgServiceId);
      const service = orgService ? serviceMap.get(orgService.serviceId) : null;
      return {
        ...request,
        org: orgMap.get(request.orgId),
        orgService,
        service,
        serviceName: service?.name,
      };
    });
  },
});

/**
 * List requests for an organization
 */
export const listByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireOrgMember(ctx, args.orgId);

    // Active statuses that agents should see (exclude Draft, Cancelled, Completed)
    const activeStatuses = [RequestStatus.Pending, RequestStatus.Processing];

    const requests = args.status
      ? await ctx.db
          .query("requests")
          .withIndex("by_org_status", (q) =>
            q.eq("orgId", args.orgId).eq("status", args.status!)
          )
          .collect()
      : await ctx.db
          .query("requests")
          .withIndex("by_org_status", (q) => q.eq("orgId", args.orgId))
          .filter((q) =>
            q.or(
              q.eq(q.field("status"), RequestStatus.Pending),
              q.eq(q.field("status"), RequestStatus.Processing)
            )
          )
          .collect();

    // Batch fetch users and services
    const userIds = [...new Set(requests.map((r) => r.userId))];
    const orgServiceIds = [...new Set(requests.map((r) => r.orgServiceId))];

    const [users, orgServices] = await Promise.all([
      Promise.all(userIds.map((id) => ctx.db.get(id))),
      Promise.all(orgServiceIds.map((id) => ctx.db.get(id))),
    ]);

    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));
    const orgServiceMap = new Map(
      orgServices.filter(Boolean).map((os) => [os!._id, os!])
    );

    const serviceIds = [
      ...new Set(orgServices.filter(Boolean).map((os) => os!.serviceId)),
    ];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    return requests.map((request) => {
      const orgService = orgServiceMap.get(request.orgServiceId);
      const service = orgService ? serviceMap.get(orgService.serviceId) : null;
      return {
        ...request,
        user: userMap.get(request.userId),
        orgService,
        service,
        serviceName: service?.name,
      };
    });
  },
});

/**
 * Submit a draft request
 */
export const submit = authMutation({
  args: {
    requestId: v.id("requests"),
    formData: v.optional(v.any()),
    slotId: v.optional(v.id("appointmentSlots")),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }
    if (request.userId !== ctx.user._id) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    if (request.status !== RequestStatus.Draft) {
      throw error(ErrorCode.REQUEST_NOT_DRAFT);
    }

    const now = Date.now();

    // If a slot is provided, book the appointment
    let appointmentId: string | undefined;
    if (args.slotId) {
      const slot = await ctx.db.get(args.slotId);
      if (!slot) {
        throw error(ErrorCode.NOT_FOUND, "Slot not found");
      }
      if (slot.isBlocked) {
        throw error(ErrorCode.SLOT_NOT_AVAILABLE, "This slot is not available");
      }
      if (slot.bookedCount >= slot.capacity) {
        throw error(ErrorCode.SLOT_FULLY_BOOKED, "This slot is fully booked");
      }

      // Create the appointment
      const aptId = await ctx.db.insert("appointments", {
        slotId: args.slotId,
        requestId: args.requestId,
        userId: ctx.user._id,
        orgId: request.orgId,
        date: slot.date,
        time: slot.startTime,
        status: "confirmed",
        confirmedAt: now,
      });
      appointmentId = aptId;

      // Update slot booked count
      await ctx.db.patch(args.slotId, {
        bookedCount: slot.bookedCount + 1,
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.Pending,
      formData: args.formData ?? request.formData,
      reference: generateReferenceNumber(),
      submittedAt: now,
      updatedAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.RequestSubmitted,
      data: { 
        from: RequestStatus.Draft, 
        to: RequestStatus.Pending,
        ...(appointmentId && { appointmentId }),
      },
    });

    return args.requestId;
  },
});

/**
 * Update request status (org agent only)
 */
export const updateStatus = authMutation({
  args: {
    requestId: v.id("requests"),
    status: requestStatusValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }

    await requireOrgAgent(ctx, request.orgId);

    const oldStatus = request.status;
    const now = Date.now();

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === RequestStatus.Completed) {
      updates.completedAt = now;
    }

    await ctx.db.patch(args.requestId, updates);

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.StatusChanged,
      data: { from: oldStatus, to: args.status, note: args.note },
    });

    return args.requestId;
  },
});

/**
 * Assign request to an agent
 */
export const assign = authMutation({
  args: {
    requestId: v.id("requests"),
    agentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }

    await requireOrgAgent(ctx, request.orgId);

    await ctx.db.patch(args.requestId, {
      assignedTo: args.agentId,
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.Assigned,
      data: { agentId: args.agentId },
    });

    return args.requestId;
  },
});

/**
 * Add note to a request
 */
export const addNote = authMutation({
  args: {
    requestId: v.id("requests"),
    content: v.string(),
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }

    // Check permissions
    const isOwner = request.userId === ctx.user._id;
    if (!isOwner) {
      await requireOrgAgent(ctx, request.orgId);
    }

    // Only agents can add internal notes
    if (isOwner && args.isInternal) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // Log event as a note
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.NoteAdded,
      data: {
        content: args.content,
        isInternal: args.isInternal ?? false,
      },
    });

    return args.requestId;
  },
});

/**
 * Cancel a request (user only, draft/submitted only)
 */
export const cancel = authMutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }
    if (request.userId !== ctx.user._id) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    if (
      ![RequestStatus.Draft, RequestStatus.Pending].includes(
        request.status as any
      )
    ) {
      throw error(ErrorCode.REQUEST_CANNOT_CANCEL);
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.Cancelled,
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.StatusChanged,
      data: { from: request.status, to: RequestStatus.Cancelled },
    });

    return args.requestId;
  },
});

/**
 * Set action required on a request (agent only)
 * Notifies the citizen that they need to provide additional info/documents
 */
export const setActionRequired = authMutation({
  args: {
    requestId: v.id("requests"),
    type: v.union(v.literal("documents"), v.literal("info"), v.literal("payment")),
    message: v.string(),
    documentTypes: v.optional(v.array(v.string())),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }

    await requireOrgAgent(ctx, request.orgId);

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      actionRequired: {
        type: args.type,
        message: args.message,
        documentTypes: args.documentTypes,
        deadline: args.deadline,
        createdAt: now,
      },
      updatedAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.ActionRequired,
      data: {
        actionType: args.type,
        message: args.message,
        documentTypes: args.documentTypes,
        deadline: args.deadline,
      },
    });

    return args.requestId;
  },
});

/**
 * Clear action required on a request (agent only)
 * Called when the citizen has provided the required info/documents
 */
export const clearActionRequired = authMutation({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }

    await requireOrgAgent(ctx, request.orgId);

    await ctx.db.patch(args.requestId, {
      actionRequired: undefined,
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.ActionCleared,
      data: {},
    });

    return args.requestId;
  },
});

/**
 * Update request priority
 */
export const updatePriority = authMutation({
  args: {
    requestId: v.id("requests"),
    priority: requestPriorityValidator,
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }

    await requireOrgAgent(ctx, request.orgId);

    await ctx.db.patch(args.requestId, {
      priority: args.priority,
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

/**
 * Get the latest active request for the current user (not completed, cancelled, or rejected)
 */
export const getLatestActive = authQuery({
  args: {},
  handler: async (ctx) => {
    // Get all requests for user and filter for active ones
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_user_status", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .collect();

    // Filter for active statuses
    const activeStatuses = [
      RequestStatus.Draft,
      RequestStatus.Pending,
      RequestStatus.Processing,
    ];

    const activeRequest = requests.find((r) =>
      activeStatuses.includes(r.status as typeof RequestStatus[keyof typeof RequestStatus])
    );

    if (!activeRequest) return null;

    // Get related data
    const [org, orgService] = await Promise.all([
      ctx.db.get(activeRequest.orgId),
      ctx.db.get(activeRequest.orgServiceId),
    ]);

    const service = orgService ? await ctx.db.get(orgService.serviceId) : null;

    return {
      ...activeRequest,
      org,
      orgService,
      service,
    };
  },
});

/**
 * Get dashboard stats for current user
 */
export const getDashboardStats = authQuery({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_user_status", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const activeStatuses = [
      RequestStatus.Draft,
      RequestStatus.Pending,
      RequestStatus.Processing,
    ];

    const totalRequests = requests.length;
    const activeRequests = requests.filter((r) =>
      activeStatuses.includes(r.status as typeof RequestStatus[keyof typeof RequestStatus])
    ).length;

    return {
      totalRequests,
      activeRequests,
    };
  },
});

/**
 * Get existing draft request for a specific service (if any)
 * Returns the draft so it can be resumed instead of creating a new one
 */
export const getDraftForService = authQuery({
  args: {
    orgServiceId: v.id("orgServices"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("requests")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", ctx.user._id).eq("status", RequestStatus.Draft)
      )
      .filter((q) => q.eq(q.field("orgServiceId"), args.orgServiceId))
      .first();

    return draft;
  },
});

/**
 * Delete a draft request permanently
 * Only works for drafts, only by the owner
 */
export const deleteDraft = authMutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }
    if (request.userId !== ctx.user._id) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    if (request.status !== RequestStatus.Draft) {
      throw error(ErrorCode.REQUEST_NOT_DRAFT);
    }

    // Delete associated documents
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Request).eq("ownerId", args.requestId as unknown as string)
      )
      .collect();

    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    // Delete events for this request
    const events = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetType", "request").eq("targetId", args.requestId as unknown as string)
      )
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Delete the request itself
    await ctx.db.delete(args.requestId);

    return true;
  },
});
