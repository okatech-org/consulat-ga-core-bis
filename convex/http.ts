import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCountryCodeFromPhoneNumber } from "./lib/utils";


type WebhookEvent = {
  type: string;
  data: {
    id: string;
    primary_email_address_id?: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    primary_phone_number_id?: string;
    phone_numbers?: Array<{ id: string; phone_number: string }>;
  };
};

/**
 * Validates the incoming webhook request from Clerk using Svix.
 * Returns the parsed event if valid, null otherwise.
 */
async function validateClerkWebhook(
  request: Request
): Promise<WebhookEvent | null> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return null;
  }


  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing Svix headers");
    return null;
  }

  try {
    const body = await request.text();


    const { Webhook } = await import("svix");
    const wh = new Webhook(WEBHOOK_SECRET);


    const event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;

    return event;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return null;
  }
}

/**
 * HTTP action handler for Clerk webhooks.
 * Handles user.created, user.updated, and user.deleted events.
 */
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateClerkWebhook(request);

  if (!event) {
    return new Response("Webhook verification failed", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url, phone_numbers, primary_phone_number_id } =
        event.data;


      const primaryEmail = email_addresses?.find(
        (email: { id: string; email_address: string }) => email.id === event.data.primary_email_address_id
      );


       const primaryPhoneObj = phone_numbers?.find(
        (phone: { id: string; phone_number: string }) => phone.id === primary_phone_number_id
      );
      const primaryPhoneNumber = primaryPhoneObj?.phone_number;
      const countryCode = getCountryCodeFromPhoneNumber(primaryPhoneNumber ?? "");

      await ctx.runMutation(internal.webhooks.upsertUser, {
        clerkId: id,
        email: primaryEmail?.email_address ?? "",
        firstName: first_name ?? undefined,
        lastName: last_name ?? undefined,
        profileImageUrl: image_url ?? undefined,
        phoneNumber: primaryPhoneNumber,
        country: countryCode,
      });
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        await ctx.runMutation(internal.webhooks.deleteUser, {
          clerkId: id,
        });
      }
      break;
    }

    default: {
      console.log("Unhandled Clerk webhook event:", event.type);
    }
  }

  return new Response(null, { status: 200 });
});


const http = httpRouter();


http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
