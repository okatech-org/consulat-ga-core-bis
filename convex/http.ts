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

export default http;
