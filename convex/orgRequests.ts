import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authQuery, authMutation } from "./lib/customFunctions";
import { requireOrgAgent } from "./lib/auth";
import { RequestStatus, requestStatusValidator, requestPriorityValidator } from "./lib/types";

/**
 * List requests for an organization with optional filters
 */
export const list = authQuery({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(requestStatusValidator),
    assignedTo: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    let query = ctx.db
      .query("serviceRequests")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc");

    if (args.status) {
      query = ctx.db
        .query("serviceRequests")
        .withIndex("by_orgId_status", (q) => 
          q.eq("orgId", args.orgId).eq("status", args.status!)
        )
        .order("desc");
    }

    const requests = await query.collect();


    const filtered = args.assignedTo 
      ? requests.filter(r => r.assignedTo === args.assignedTo)
      : requests;


    const enriched = await Promise.all(
      filtered.slice(0, args.limit ?? 50).map(async (request) => {
        const [user, orgService] = await Promise.all([
          ctx.db.get(request.userId),
          ctx.db.get(request.serviceId),
        ]);

        let commonService = null;
        if (orgService) {
           commonService = await ctx.db.get(orgService.serviceId);
        }

        return {
          ...request,
          user: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : null,
          service: commonService ? {
            name: commonService.name,
            category: commonService.category,
          } : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Update request status
 */
export const updateStatus = authMutation({
  args: {
    orgId: v.id("orgs"),
    requestId: v.id("serviceRequests"),
    status: requestStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const request = await ctx.db.get(args.requestId);
    if (!request || request.orgId !== args.orgId) {
      throw new Error("errors.requests.notFound");
    }

    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: Date.now(),

      ...(args.status === RequestStatus.COMPLETED || args.status === RequestStatus.REJECTED 
        ? { completedAt: Date.now() } 
        : {}),
    });

    return true;
  },
});

/**
 * Assign request to a team member
 */
export const assign = authMutation({
  args: {
    orgId: v.id("orgs"),
    requestId: v.id("serviceRequests"),
    userId: v.id("users"), 
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const request = await ctx.db.get(args.requestId);
    if (!request || request.orgId !== args.orgId) {
      throw new Error("errors.requests.notFound");
    }




    await ctx.db.patch(args.requestId, {
      assignedTo: args.userId,
      updatedAt: Date.now(),
    });

    return true;
  },
});
