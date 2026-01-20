import { v } from "convex/values";
import { authQuery } from "../lib/customFunctions";
import { requestStatusValidator } from "../lib/validators";

/**
 * List appointments for current user
 * (Wraps requests that are appointments)
 */
export const listByUser = authQuery({
  args: {
    status: v.optional(requestStatusValidator),
  },
  handler: async (ctx, args) => {
    // 1. Get all requests for user
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

    // 2. Fetch related data (org, service)
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

    // 3. Fetch services to check if they require appointment
    const serviceIds = [
      ...new Set(orgServices.filter(Boolean).map((os) => os!.serviceId)),
    ];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(services.filter(Boolean).map((s) => [s!._id, s!]));

    // 4. Transform to appointments
    const appointments = requests
      .map((r) => {
        const orgService = orgServiceMap.get(r.orgServiceId);
        const service = orgService ? serviceMap.get(orgService.serviceId) : null;
        
        // Filter: only include if service requires appointment (or if formData has date?)
        // For now, let's assume if it has date in formData, it's an appointment
        // OR if service defaults says so.
        // Let's rely on formData for date/time presence
        const formData = r.formData || {};
        if (!formData.date || !formData.time) return null;

        return {
          _id: r._id,
          date: formData.date, // ISO date string or timestamp? Frontend expects Date constructor compat
          startTime: formData.time,
          status: r.status,
          notes: "", // r.notes is not on request object directly usually, maybe events? Sticking to basic
          service: service ? { name: service.name.fr || service.name } : null, // Handle localized name
          org: orgMap.get(r.orgId),
        };
      })
      .filter(Boolean); // generic filter

    return appointments;
  },
});
