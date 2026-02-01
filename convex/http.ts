import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 * Syncs user data when users are created/updated in Clerk
 */
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();


    try {
      // In a real app, verify Svix signature here
      // const svix_id = headerPayload.get("svix-id");
      // const svix_timestamp = headerPayload.get("svix-timestamp");
      // const svix_signature = headerPayload.get("svix-signature");
      
      const result = JSON.parse(payloadString);
      const { type, data } = result;

      if (type === "user.created" || type === "user.updated") {
        const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
        
        await ctx.runMutation(internal.functions.users.syncFromClerk, {
           externalId: data.id,
           email: data.email_addresses[0]?.email_address ?? "",
           name: name || data.email_addresses[0]?.email_address || "User",
           avatarUrl: data.image_url,
        });
      }

      return new Response(null, { status: 200 });
    } catch (err) {
      console.error(err);
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

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
