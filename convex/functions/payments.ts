import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { internal } from "../_generated/api";
import Stripe from "stripe";

// ============================================================================
// INTERNAL QUERIES
// ============================================================================

export const getRequestInternal = internalQuery({
	args: { requestId: v.id("requests") },
	handler: async (ctx, args) => {
		const request = await ctx.db.get(args.requestId);
		if (!request) return null;

		// Get orgService for pricing
		const orgService = await ctx.db.get(request.orgServiceId);
		if (!orgService) return null;

		// Get service for name
		const service = await ctx.db.get(orgService.serviceId);

		// Get user
		const user = await ctx.db.get(request.userId);

		// Get org
		const org = await ctx.db.get(request.orgId);

		return {
			request,
			orgService,
			service,
			user,
			org,
		};
	},
});

export const getPaymentByIntentInternal = internalQuery({
	args: { stripePaymentIntentId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("payments")
			.withIndex("by_stripe_intent", (q) =>
				q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
			)
			.unique();
	},
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

export const createPaymentRecord = internalMutation({
	args: {
		requestId: v.id("requests"),
		userId: v.id("users"),
		orgId: v.id("orgs"),
		stripePaymentIntentId: v.string(),
		amount: v.number(),
		currency: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Create payment record
		const paymentId = await ctx.db.insert("payments", {
			...args,
			status: "pending",
			updatedAt: Date.now(),
		});

		// Update request paymentStatus
		await ctx.db.patch(args.requestId, {
			paymentStatus: "pending",
			updatedAt: Date.now(),
		});

		return paymentId;
	},
});

export const updatePaymentStatus = internalMutation({
	args: {
		stripePaymentIntentId: v.string(),
		status: v.union(
			v.literal("processing"),
			v.literal("succeeded"),
			v.literal("failed"),
			v.literal("refunded")
		),
		receiptUrl: v.optional(v.string()),
		paidAt: v.optional(v.number()),
		failedAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const payment = await ctx.db
			.query("payments")
			.withIndex("by_stripe_intent", (q) =>
				q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
			)
			.unique();

		if (!payment) {
			console.error("Payment not found for intent:", args.stripePaymentIntentId);
			return null;
		}

		// Update payment
		await ctx.db.patch(payment._id, {
			status: args.status,
			receiptUrl: args.receiptUrl,
			paidAt: args.paidAt,
			failedAt: args.failedAt,
			updatedAt: Date.now(),
		});

		// Update request paymentStatus
		await ctx.db.patch(payment.requestId, {
			paymentStatus: args.status,
			updatedAt: Date.now(),
		});

		return payment._id;
	},
});

// ============================================================================
// ACTIONS (HTTP endpoints for Stripe)
// ============================================================================

/**
 * Create a PaymentIntent for a request
 */
export const createPaymentIntent = action({
	args: {
		requestId: v.id("requests"),
	},
	handler: async (ctx, args): Promise<{ clientSecret: string; amount: number; currency: string }> => {
		// Get request details
		const data = await ctx.runQuery(internal.functions.payments.getRequestInternal, {
			requestId: args.requestId,
		});

		if (!data || !data.request || !data.orgService || !data.user) {
			throw new Error("Request not found or incomplete");
		}

		const { request, orgService, service, user, org } = data;

		// Check if already paid
		if (request.paymentStatus === "succeeded") {
			throw new Error("Request already paid");
		}

		// Get amount from orgService pricing
		const pricing = orgService.pricing;
		if (!pricing || pricing.amount <= 0) {
			throw new Error("No payment required for this service");
		}

		// Initialize Stripe
		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			throw new Error("Stripe not configured");
		}

		const stripe = new Stripe(stripeSecretKey);

		// Create PaymentIntent
		const serviceName =
			typeof service?.name === "object" ? service.name.fr : service?.name || "Service";
		const orgName = org?.name || "Consulat";

		const paymentIntent = await stripe.paymentIntents.create({
			amount: pricing.amount, // Already in cents
			currency: pricing.currency.toLowerCase(),
			metadata: {
				requestId: args.requestId,
				userId: request.userId,
				orgId: request.orgId,
				serviceName,
			},
			description: `${serviceName} - ${orgName}`,
			receipt_email: user.email,
		});

		// Create payment record in DB
		await ctx.runMutation(internal.functions.payments.createPaymentRecord, {
			requestId: args.requestId,
			userId: request.userId,
			orgId: request.orgId,
			stripePaymentIntentId: paymentIntent.id,
			amount: pricing.amount,
			currency: pricing.currency.toLowerCase(),
			description: `${serviceName} - ${orgName}`,
		});

		return {
			clientSecret: paymentIntent.client_secret!,
			amount: pricing.amount,
			currency: pricing.currency.toLowerCase(),
		};
	},
});

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = internalAction({
	args: {
		payload: v.string(),
		signature: v.string(),
	},
	handler: async (ctx, args): Promise<{ received: boolean }> => {
		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

		if (!stripeSecretKey || !webhookSecret) {
			throw new Error("Stripe not configured");
		}

		const stripe = new Stripe(stripeSecretKey);

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(args.payload, args.signature, webhookSecret);
		} catch (err: any) {
			console.error("Webhook signature verification failed:", err.message);
			throw new Error("Invalid signature");
		}

		// Handle events
		switch (event.type) {
			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				await ctx.runMutation(internal.functions.payments.updatePaymentStatus, {
					stripePaymentIntentId: paymentIntent.id,
					status: "succeeded",
					paidAt: Date.now(),
					receiptUrl: paymentIntent.receipt_email || undefined,
				});
				
				// Send payment confirmation email
				if (paymentIntent.metadata.requestId) {
					await ctx.runMutation(internal.functions.notifications.notifyPaymentSuccess, {
						requestId: paymentIntent.metadata.requestId as any,
						amount: paymentIntent.amount,
						currency: paymentIntent.currency,
					});
				}
				break;
			}

			case "payment_intent.processing": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				await ctx.runMutation(internal.functions.payments.updatePaymentStatus, {
					stripePaymentIntentId: paymentIntent.id,
					status: "processing",
				});
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				await ctx.runMutation(internal.functions.payments.updatePaymentStatus, {
					stripePaymentIntentId: paymentIntent.id,
					status: "failed",
					failedAt: Date.now(),
				});
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object as Stripe.Charge;
				if (charge.payment_intent) {
					await ctx.runMutation(internal.functions.payments.updatePaymentStatus, {
						stripePaymentIntentId: charge.payment_intent as string,
						status: "refunded",
					});
				}
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return { received: true };
	},
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get payment for a request
 */
export const getByRequest = authQuery({
	args: { requestId: v.id("requests") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("payments")
			.withIndex("by_request", (q) => q.eq("requestId", args.requestId))
			.order("desc")
			.first();
	},
});

/**
 * List payments for an organization
 */
export const listByOrg = authQuery({
	args: {
		orgId: v.id("orgs"),
		status: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("processing"),
				v.literal("succeeded"),
				v.literal("failed"),
				v.literal("refunded")
			)
		),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		let query = ctx.db
			.query("payments")
			.withIndex("by_org", (q) => q.eq("orgId", args.orgId))
			.order("desc");

		let payments = await query.collect();

		// Filter by status if provided
		if (args.status) {
			payments = payments.filter((p) => p.status === args.status);
		}

		// Apply limit
		if (args.limit) {
			payments = payments.slice(0, args.limit);
		}

		// Enrich with user info
		const userIds = [...new Set(payments.map((p) => p.userId))];
		const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
		const userMap = new Map(users.filter(Boolean).map((u) => [u!._id.toString(), u!]));

		return payments.map((payment) => ({
			...payment,
			user: userMap.get(payment.userId.toString()),
		}));
	},
});

/**
 * Get payment statistics for org dashboard
 */
export const getStats = authQuery({
	args: { orgId: v.id("orgs") },
	handler: async (ctx, args) => {
		const payments = await ctx.db
			.query("payments")
			.withIndex("by_org", (q) => q.eq("orgId", args.orgId))
			.collect();

		const succeeded = payments.filter((p) => p.status === "succeeded");
		const pending = payments.filter((p) => p.status === "pending" || p.status === "processing");
		const failed = payments.filter((p) => p.status === "failed");

		const totalRevenue = succeeded.reduce((sum, p) => sum + p.amount, 0);
		const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);

		// This month
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
		const thisMonthRevenue = succeeded
			.filter((p) => p.paidAt && p.paidAt >= startOfMonth)
			.reduce((sum, p) => sum + p.amount, 0);

		return {
			totalRevenue,
			thisMonthRevenue,
			pendingAmount,
			successCount: succeeded.length,
			pendingCount: pending.length,
			failedCount: failed.length,
		};
	},
});
