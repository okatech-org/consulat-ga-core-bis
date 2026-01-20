import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { requireOrgAgent } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import { generateReferenceNumber } from "../lib/utils";
import {
  requestStatusValidator,
  requestPriorityValidator,
  RequestStatus,
  RequestPriority,
  EventType,
} from "../lib/validators";


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
      ? RequestStatus.SUBMITTED
      : RequestStatus.DRAFT;

    const now = Date.now();
    const requestId = await ctx.db.insert("requests", {
      userId: ctx.user._id,
      orgId: orgService.orgId,
      orgServiceId: args.orgServiceId,
      reference: args.submitNow ? generateReferenceNumber() : `DRAFT-${now}`,
      status,
      priority: RequestPriority.NORMAL,
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
        ? EventType.REQUEST_SUBMITTED
        : EventType.REQUEST_CREATED,
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
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", "request").eq("ownerId", args.requestId as unknown as string)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Get notes from events
    const notesEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetType", "request").eq("targetId", args.requestId as unknown as string)
      )
      .filter((q) => q.eq(q.field("type"), EventType.NOTE_ADDED))
      .collect();

    const notes = notesEvents.map((e) => ({
      _id: e._id,
      content: e.data.content,
      isInternal: e.data.isInternal,
      createdAt: e._creationTime,
      userId: e.actorId,
    }));

    return {
      ...request,
      user,
      org,
      orgService,
      service,
      assignedTo,
      documents,
      notes,
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
    await requireOrgAgent(ctx, args.orgId);

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
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw error(ErrorCode.REQUEST_NOT_FOUND);
    }
    if (request.userId !== ctx.user._id) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    if (request.status !== RequestStatus.DRAFT) {
      throw error(ErrorCode.REQUEST_NOT_DRAFT);
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: RequestStatus.SUBMITTED,
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
      type: EventType.REQUEST_SUBMITTED,
      data: { from: RequestStatus.DRAFT, to: RequestStatus.SUBMITTED },
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

    if (args.status === RequestStatus.COMPLETED) {
      updates.completedAt = now;
    }

    await ctx.db.patch(args.requestId, updates);

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.STATUS_CHANGED,
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
      type: EventType.ASSIGNED,
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
      type: EventType.NOTE_ADDED,
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
      ![RequestStatus.DRAFT, RequestStatus.SUBMITTED].includes(
        request.status as any
      )
    ) {
      throw error(ErrorCode.REQUEST_CANNOT_CANCEL);
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.CANCELLED,
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: args.requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.STATUS_CHANGED,
      data: { from: request.status, to: RequestStatus.CANCELLED },
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
