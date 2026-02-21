import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// Better Auth route handlers
authComponent.registerRoutes(http, createAuth);

/**
 * Stripe Webhook Handler
 * Handles payment confirmations from Stripe
 */
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    const payload = await request.text();

    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    try {
      await ctx.runAction(internal.functions.payments.handleWebhook, {
        payload,
        signature,
      });
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      return new Response(error.message || "Webhook error", { status: 400 });
    }
  }),
});

export default http;
