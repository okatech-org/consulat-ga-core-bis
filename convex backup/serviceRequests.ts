import { v } from "convex/values";
import { query } from "./_generated/server";
import { authQuery, authMutation } from "./lib/customFunctions";
import { requireOrgAgent, generateReferenceNumber } from "./lib/auth";
import { requestStatusValidator, requestPriorityValidator, RequestStatus, RequestPriority } from "./lib/types";


const agentUpdatableStatusValidator = v.union(
  v.literal(RequestStatus.UNDER_REVIEW),
  v.literal(RequestStatus.PROCESSING),
  v.literal(RequestStatus.PENDING_DOCUMENTS),
  v.literal(RequestStatus.PENDING_PAYMENT),
  v.literal(RequestStatus.COMPLETED),
  v.literal(RequestStatus.REJECTED)
);

/**
 * Create a new service request
 */
export const create = authMutation({
  args: {
    serviceId: v.id("orgServices"),
    formData: v.optional(v.any()),
    submitNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.serviceId);
    if (!orgService) {
      throw new Error("errors.services.notFound");
    }

    if (!orgService.isActive) {
      throw new Error("errors.services.notAvailable");
    }

    const now = Date.now();
    const status = args.submitNow ? RequestStatus.SUBMITTED : RequestStatus.DRAFT;

    return await ctx.db.insert("serviceRequests", {
      userId: ctx.user._id,
      serviceId: args.serviceId,
      orgId: orgService.orgId,
      status,
      formData: args.formData,
      referenceNumber: args.submitNow ? generateReferenceNumber() : undefined,
      submittedAt: args.submitNow ? now : undefined,
      priority: RequestPriority.NORMAL,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Get request by ID (with related data)
 */
export const getById = query({
  args: { requestId: v.id("serviceRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const [user, service, org, assignedTo] = await Promise.all([
      ctx.db.get(request.userId),
      ctx.db.get(request.serviceId),
      ctx.db.get(request.orgId),
      request.assignedTo ? ctx.db.get(request.assignedTo) : null,
    ]);


    const notes = await ctx.db
      .query("requestNotes")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .collect();


    const documents = await ctx.db
      .query("documents")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .collect();

    return {
      ...request,
      user,
      service,
      org,
      assignedTo,
      notes,
      documents,
    };
  },
});

/**
 * List requests by current user
 */
export const listByUser = authQuery({
  args: {
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    let requests;
    if (args.status) {
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_userId_status", (q) =>
          q.eq("userId", ctx.user._id).eq("status", args.status!)
        )
        .collect();
    } else {
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
        .collect();
    }


    return await Promise.all(
      requests.map(async (request) => {
        const [service, org] = await Promise.all([
          ctx.db.get(request.serviceId),
          ctx.db.get(request.orgId),
        ]);
        return { ...request, service, org };
      })
    );
  },
});

/**
 * List requests by organization
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    let requests;
    if (args.status) {
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_orgId_status", (q) =>
          q.eq("orgId", args.orgId).eq("status", args.status!)
        )
        .collect();
    } else {
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
    }


    return await Promise.all(
      requests.map(async (request) => {
        const [user, service] = await Promise.all([
          ctx.db.get(request.userId),
          ctx.db.get(request.serviceId),
        ]);
        return { ...request, user, service };
      })
    );
  },
});

/**
 * Submit a draft request
 */
export const submit = authMutation({
  args: {
    requestId: v.id("serviceRequests"),
    formData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("errors.requests.notFound");
    }

    if (request.userId !== ctx.user._id) {
      throw new Error("errors.requests.notAuthorizedToSubmit");
    }

    if (request.status !== RequestStatus.DRAFT) {
      throw new Error("errors.requests.onlyDraftCanBeSubmitted");
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: RequestStatus.SUBMITTED,
      formData: args.formData ?? request.formData,
      referenceNumber: generateReferenceNumber(),
      submittedAt: now,
      updatedAt: now,
    });

    return args.requestId;
  },
});

/**
 * Update request status (org agent/admin only)
 */
export const updateStatus = authMutation({
  args: {
    requestId: v.id("serviceRequests"),
    status: agentUpdatableStatusValidator,
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("errors.requests.notFound");
    }

    await requireOrgAgent(ctx, request.orgId);

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === RequestStatus.COMPLETED) {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.requestId, updates);
    return args.requestId;
  },
});

/**
 * Assign request to an agent
 */
export const assignAgent = authMutation({
  args: {
    requestId: v.id("serviceRequests"),
    agentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("errors.requests.notFound");
    }

    await requireOrgAgent(ctx, request.orgId);

    await ctx.db.patch(args.requestId, {
      assignedTo: args.agentId,
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

/**
 * Add a note to a request
 */
export const addNote = authMutation({
  args: {
    requestId: v.id("serviceRequests"),
    content: v.string(),
    isInternal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("errors.requests.notFound");
    }


    const isOwner = request.userId === ctx.user._id;
    if (!isOwner) {

      await requireOrgAgent(ctx, request.orgId);
    }


    if (isOwner && args.isInternal) {
      throw new Error("errors.requests.onlyStaffCanAddInternalNotes");
    }

    return await ctx.db.insert("requestNotes", {
      requestId: args.requestId,
      authorId: ctx.user._id,
      content: args.content,
      isInternal: args.isInternal,
      createdAt: Date.now(),
    });
  },
});

/**
 * Cancel a request (user only, draft/submitted only)
 */
export const cancel = authMutation({
  args: { requestId: v.id("serviceRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("errors.requests.notFound");
    }

    if (request.userId !== ctx.user._id) {
      throw new Error("errors.requests.notAuthorizedToCancel");
    }

    if (![RequestStatus.DRAFT, RequestStatus.SUBMITTED].includes(request.status as RequestStatus)) {
      throw new Error("errors.requests.cannotCancelProcessing");
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.CANCELLED,
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

/**
 * Update request priority
 */
export const updatePriority = authMutation({
  args: {
    requestId: v.id("serviceRequests"),
    priority: requestPriorityValidator,
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("errors.requests.notFound");
    }

    await requireOrgAgent(ctx, request.orgId);

    await ctx.db.patch(args.requestId, {
      priority: args.priority,
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});
