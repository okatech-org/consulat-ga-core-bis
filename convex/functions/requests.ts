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
      ? RequestStatus.Submitted
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
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", OwnerType.Request).eq("ownerId", args.requestId as unknown as string)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Get notes from events
    const notesEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetType", "request").eq("targetId", args.requestId as unknown as string)
      )
      .filter((q) => q.eq(q.field("type"), EventType.NoteAdded))
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
    await requireOrgMember(ctx, args.orgId);

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
    if (request.status !== RequestStatus.Draft) {
      throw error(ErrorCode.REQUEST_NOT_DRAFT);
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: RequestStatus.Submitted,
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
      data: { from: RequestStatus.Draft, to: RequestStatus.Submitted },
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
      ![RequestStatus.Draft, RequestStatus.Submitted].includes(
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
      RequestStatus.Submitted,
      RequestStatus.UnderReview,
      RequestStatus.InProduction,
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
      RequestStatus.Submitted,
      RequestStatus.UnderReview,
      RequestStatus.InProduction,
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
