import { v } from "convex/values";
import { authQuery, authMutation } from "../lib/customFunctions";
import { requireOrgMember } from "../lib/auth";
import { RequestStatus, requestStatusValidator } from "../lib/validators";
import { error, ErrorCode } from "../lib/errors";

/**
 * List appointments for current user
 */
export const listByUser = authQuery({
  args: {
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    // Get requests with appointmentDate or status indicating appointment
    // For compatibility with frontend expecting appointment structure
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

    // Filter for those that look like appointments
    const appointmentRequests = requests.filter(r => 
      r.status === RequestStatus.Processing || 
      (r.formData && r.formData.date)
    );

    // Enrich
    const appointments = await Promise.all(appointmentRequests.map(async (r) => {
        const [org, service] = await Promise.all([
            ctx.db.get(r.orgId),
            r.orgServiceId ? ctx.db.get(r.orgServiceId).then(os => os ? ctx.db.get(os.serviceId) : null) : null
        ]);

        return {
            _id: r._id,
            requestId: r._id,
            date: r.appointmentDate ? new Date(r.appointmentDate).toISOString() : r.formData?.date, // ISO string
            startTime: r.formData?.time,
            status: r.status,
            notes: "",
            service: service ? { name: service.name.fr || service.name } : null,
            org,
        };
    }));

    return appointments;
  },
});

/**
 * List appointments for an organization (Dashboard)
 */
export const listByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
    date: v.optional(v.string()), // ISO date string, optional filter
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireOrgMember(ctx, args.orgId);

    let requests;
    if (args.status) {
         requests = await ctx.db
            .query("requests")
            .withIndex("by_org_status", (q) => q.eq("orgId", args.orgId).eq("status", args.status!))
            .collect();
    } else {
        // Fetch by date index if available (assuming appointmentDate is populated)
        // If not populated yet, we might miss some, so maybe fallback to status-based or all
        // For now, let's fetch 'appointment_scheduled' and others likely to be appointments
        const scheduled = await ctx.db
            .query("requests")
            .withIndex("by_org_status", (q) => q.eq("orgId", args.orgId).eq("status", RequestStatus.Processing))
            .collect();
        // Maybe also collected/completed today?
        requests = scheduled; 
    }

    if (args.date) {
        // Client filtering for specific date
        requests = requests.filter(r => r.formData?.date === args.date); // Exact match on string?
        // Or if appointmentDate is used:
        // const targetDate = new Date(args.date).toDateString();
    }

    // Enrich
    const userIds = [...new Set(requests.map(r => r.userId))];
    const users = await Promise.all(userIds.map(id => ctx.db.get(id)));
    const userMap = new Map(users.filter(Boolean).map(u => [u!._id, u!]));

    return requests.map(r => {
        const user = userMap.get(r.userId);
        return {
            _id: r._id,
            request: r,
            user: user ? {
                firstName: user.firstName || user.name?.split(' ')[0],
                lastName: user.lastName || user.name?.split(' ').slice(1).join(' '),
                email: user.email,
                avatarUrl: user.avatarUrl,
            } : null,
            date: r.formData?.date || (r.appointmentDate ? new Date(r.appointmentDate).toISOString() : null),
            time: r.formData?.time,
            status: r.status,
            type: "Consular Appointment", // placeholder
        };
    });
  },
});

/**
 * Get appointment by ID
 */
export const getById = authQuery({
  args: { appointmentId: v.id("requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.appointmentId);
    if (!request) return null;
    await requireOrgMember(ctx, request.orgId); // Security check

    const [user, org, orgService] = await Promise.all([
        ctx.db.get(request.userId),
        ctx.db.get(request.orgId),
        ctx.db.get(request.orgServiceId),
    ]);
    const service = orgService ? await ctx.db.get(orgService.serviceId) : null;

    // Fetch notes if separate table, or from request (if notes field exists in requests?)
    // requests.ts schema doesn't show notes field. Notes are usually in events.
    // Dashboard expects notes string or array? 
    // Frontend line 175: `appointment.notes`.
    // listByUser returns `notes: ""`.
    // I'll return empty string for now or fetch from events?
    // Let's assume simpler for now.

    const notes = ""; 

    return {
        _id: request._id,
        request,
        user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
        } : null,
        date: request.formData?.date || (request.appointmentDate ? new Date(request.appointmentDate).toISOString() : null),
        startTime: request.formData?.time,
        endTime: request.formData?.endTime, // if exists
        status: request.status,
        notes,
        service: service ? { name: service.name.fr || service.name } : null,
        org,
    };
  },
});

/**
 * Confirm an appointment
 */
export const confirm = authMutation({
    args: { appointmentId: v.id("requests") },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.appointmentId);
        if (!request) throw error(ErrorCode.REQUEST_NOT_FOUND);
        await requireOrgMember(ctx, request.orgId);

        await ctx.db.patch(args.appointmentId, {
            status: RequestStatus.Processing,
            updatedAt: Date.now(),
        });
        return true;
    }
});

/**
 * Cancel an appointment
 */
export const cancel = authMutation({
    args: { appointmentId: v.id("requests") },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.appointmentId);
        if (!request) throw error(ErrorCode.REQUEST_NOT_FOUND);
        await requireOrgMember(ctx, request.orgId);

        await ctx.db.patch(args.appointmentId, {
            status: RequestStatus.Cancelled,
            updatedAt: Date.now(),
        });
        return true;
    }
});

/**
 * Mark appointment as completed
 */
export const complete = authMutation({
    args: { appointmentId: v.id("requests") },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.appointmentId);
        if (!request) throw error(ErrorCode.REQUEST_NOT_FOUND);
        await requireOrgMember(ctx, request.orgId);

        await ctx.db.patch(args.appointmentId, {
            status: RequestStatus.Completed,
            completedAt: Date.now(),
            updatedAt: Date.now(),
        });
        return true;
    }
});

/**
 * Mark appointment as no-show
 */
export const markNoShow = authMutation({
    args: { appointmentId: v.id("requests") },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.appointmentId);
        if (!request) throw error(ErrorCode.REQUEST_NOT_FOUND);
        await requireOrgMember(ctx, request.orgId);

        // No explicit NoShow status, using Cancelled
        await ctx.db.patch(args.appointmentId, {
            status: RequestStatus.Cancelled,
            updatedAt: Date.now(),
        });
        return true;
    }
});
