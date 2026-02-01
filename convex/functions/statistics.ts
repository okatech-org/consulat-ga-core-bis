import { v } from "convex/values";
import { authQuery } from "../lib/customFunctions";
import { requireOrgMember } from "../lib/auth";
import { RequestStatus } from "../lib/validators";

/**
 * Get comprehensive statistics for an organization
 */
export const getOrgStats = authQuery({
	args: {
		orgId: v.id("orgs"),
		period: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("year"))),
	},
	handler: async (ctx, args) => {
		await requireOrgMember(ctx, args.orgId);

		const now = Date.now();
		const periodMs = {
			week: 7 * 24 * 60 * 60 * 1000,
			month: 30 * 24 * 60 * 60 * 1000,
			year: 365 * 24 * 60 * 60 * 1000,
		};
		const periodStart = now - (periodMs[args.period || "month"]);
		const previousPeriodStart = periodStart - (periodMs[args.period || "month"]);

		// Get all requests for this org
		const allRequests = await ctx.db
			.query("requests")
			.withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
			.collect();

		// Filter by period
		const currentPeriodRequests = allRequests.filter(
			(r) => r._creationTime >= periodStart
		);
		const previousPeriodRequests = allRequests.filter(
			(r) => r._creationTime >= previousPeriodStart && r._creationTime < periodStart
		);

		// Current status counts
		const statusCounts = {
			draft: 0,
			pending: 0,
			processing: 0,
			completed: 0,
			cancelled: 0,
		};

		for (const req of allRequests) {
			if (req.status && statusCounts[req.status as keyof typeof statusCounts] !== undefined) {
				statusCounts[req.status as keyof typeof statusCounts]++;
			}
		}

		// Completed in this period
		const completedThisPeriod = currentPeriodRequests.filter(
			(r) => r.status === RequestStatus.Completed
		).length;

		// Calculate average processing time (for completed requests)
		const completedRequests = allRequests.filter(
			(r) => r.status === RequestStatus.Completed && r.completedAt
		);
		let avgProcessingDays = 0;
		if (completedRequests.length > 0) {
			const totalDays = completedRequests.reduce((sum, r) => {
				const days = (r.completedAt! - r._creationTime) / (24 * 60 * 60 * 1000);
				return sum + days;
			}, 0);
			avgProcessingDays = Math.round(totalDays / completedRequests.length);
		}

		// Get services breakdown
		const serviceBreakdown: Record<string, number> = {};
		for (const req of allRequests) {
			const serviceId = req.orgServiceId.toString();
			serviceBreakdown[serviceId] = (serviceBreakdown[serviceId] || 0) + 1;
		}

		// Get OrgServices for labels
		const orgServiceIds = [...new Set(allRequests.map((r) => r.orgServiceId))];
		const orgServices = await Promise.all(
			orgServiceIds.map((id) => ctx.db.get(id))
		);
		const serviceIds = orgServices
			.filter(Boolean)
			.map((os) => os!.serviceId);
		const services = await Promise.all(
			serviceIds.map((id) => ctx.db.get(id))
		);

		const serviceLabels: Record<string, string> = {};
	orgServices.forEach((os, i) => {
		if (os && services[i]) {
			const name = services[i]!.name;
			serviceLabels[os._id.toString()] =
				typeof name === "object" ? name.fr : String(name);
		}
	});

		// Format service breakdown with labels
		const serviceStats = Object.entries(serviceBreakdown)
			.map(([id, count]) => ({
				serviceId: id,
				name: serviceLabels[id] || "Service inconnu",
				count,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10); // Top 10

		// Get appointments stats - try to get from requests with appointmentDate
		const requestsWithAppointments = allRequests.filter(
			(r) => r.appointmentDate && r.appointmentDate >= now
		);

		// Get daily requests trend (last 7 or 30 days)
		const trendDays = args.period === "week" ? 7 : 30;
		const trend: { date: string; count: number }[] = [];
		for (let i = trendDays - 1; i >= 0; i--) {
			const dayStart = new Date(now - i * 24 * 60 * 60 * 1000);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(dayStart);
			dayEnd.setHours(23, 59, 59, 999);

			const dayCount = allRequests.filter(
				(r) =>
					r._creationTime >= dayStart.getTime() &&
					r._creationTime <= dayEnd.getTime()
			).length;

			trend.push({
				date: dayStart.toISOString().split("T")[0],
				count: dayCount,
			});
		}

		// Growth percentage
		const currentCount = currentPeriodRequests.length;
		const previousCount = previousPeriodRequests.length || 1;
		const growthPercentage = Math.round(
			((currentCount - previousCount) / previousCount) * 100
		);

		// Get members
		const members = await ctx.db
			.query("memberships")
			.withIndex("by_org", (q) => q.eq("orgId", args.orgId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		return {
			// Overview
			totalRequests: allRequests.length,
			currentPeriodRequests: currentCount,
			growthPercentage,
			avgProcessingDays,

			// Status breakdown
			statusCounts,

			// By service
			serviceStats,

			// Trend data for charts
			trend,

			// Other stats
			completedThisPeriod,
			upcomingAppointments: requestsWithAppointments.length,
			memberCount: members.length,

			// Meta
			period: args.period || "month",
			generatedAt: now,
		};
	},
});

/**
 * Get agent performance stats
 */
export const getAgentStats = authQuery({
	args: {
		orgId: v.id("orgs"),
	},
	handler: async (ctx, args) => {
		await requireOrgMember(ctx, args.orgId);

		// Get members
		const memberships = await ctx.db
			.query("memberships")
			.withIndex("by_org", (q) => q.eq("orgId", args.orgId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		// Get all requests with assignedTo
		const requests = await ctx.db
			.query("requests")
			.withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
			.collect();

		// Calculate stats per agent
		const agentStats: Record<
			string,
			{
				assigned: number;
				completed: number;
				avgDays: number;
			}
		> = {};

		for (const m of memberships) {
			agentStats[m.userId.toString()] = {
				assigned: 0,
				completed: 0,
				avgDays: 0,
			};
		}

		// Count assignments
		for (const req of requests) {
			if (req.assignedTo) {
				const agentId = req.assignedTo.toString();
				if (agentStats[agentId]) {
					agentStats[agentId].assigned++;
					if (req.status === RequestStatus.Completed) {
						agentStats[agentId].completed++;
					}
				}
			}
		}

		// Get user info
		const userIds = memberships.map((m) => m.userId);
		const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

		const agentPerformance = memberships
			.map((m, i) => {
				const user = users[i];
				const stats = agentStats[m.userId.toString()];
				return {
					userId: m.userId,
					name: user?.name || user?.email || "Agent inconnu",
					role: m.role,
					assigned: stats.assigned,
					completed: stats.completed,
					completionRate:
						stats.assigned > 0
							? Math.round((stats.completed / stats.assigned) * 100)
							: 0,
				};
			})
			.sort((a, b) => b.completed - a.completed);

		return {
			agents: agentPerformance,
			totalAgents: memberships.length,
		};
	},
});

/**
 * Export requests data as JSON
 */
export const exportRequests = authQuery({
	args: {
		orgId: v.id("orgs"),
		status: v.optional(
			v.union(
				v.literal("draft"),
				v.literal("pending"),
				v.literal("processing"),
				v.literal("completed"),
				v.literal("cancelled")
			)
		),
		fromDate: v.optional(v.number()),
		toDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await requireOrgMember(ctx, args.orgId);

		let requests = await ctx.db
			.query("requests")
			.withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
			.collect();

		// Filter by status
		if (args.status) {
			requests = requests.filter((r) => r.status === args.status);
		}

		// Filter by date range
		if (args.fromDate) {
			requests = requests.filter((r) => r._creationTime >= args.fromDate!);
		}
		if (args.toDate) {
			requests = requests.filter((r) => r._creationTime <= args.toDate!);
		}

		// Get related data
		const userIds = [...new Set(requests.map((r) => r.userId))];
		const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
		const userMap = new Map(users.filter(Boolean).map((u) => [u!._id.toString(), u!]));

		const orgServiceIds = [...new Set(requests.map((r) => r.orgServiceId))];
		const orgServices = await Promise.all(orgServiceIds.map((id) => ctx.db.get(id)));
		
		const serviceIds = orgServices.filter(Boolean).map((os) => os!.serviceId);
		const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
		const serviceMap = new Map(
			orgServices.filter(Boolean).map((os, i) => [
				os!._id.toString(),
				services[i]?.name || "Service inconnu",
			])
		);

		// Format export data
		return requests.map((r) => {
			const user = userMap.get(r.userId.toString());
			const serviceTitle = serviceMap.get(r.orgServiceId.toString());

			return {
				reference: r.reference,
				status: r.status,
				service:
					typeof serviceTitle === "object"
						? (serviceTitle as any).fr
						: serviceTitle,
				userEmail: user?.email || "",
				userName: user?.name || "",
				createdAt: new Date(r._creationTime).toISOString(),
				completedAt: r.completedAt
					? new Date(r.completedAt).toISOString()
					: null,
				appointmentDate: r.appointmentDate
					? new Date(r.appointmentDate).toISOString()
					: null,
			};
		});
	},
});
