import { v } from "convex/values";
import { authMutation, authQuery } from "../lib/customFunctions";
import { query } from "../_generated/server";
import { error, ErrorCode } from "../lib/errors";
import { EventType } from "../lib/validators";

/**
 * Generate card number in format: [CC][YY][DDMMYY]-[NNNNN]
 * Example: FR25280467-00407
 * - CC = Country code (from profile's countryOfResidence)
 * - YY = Current year (2026 -> 26)
 * - DDMMYY = Birth date (28/04/1967 -> 280467)
 * - NNNNN = Sequential number
 */
async function generateCardNumber(
  ctx: { db: any },
  countryCode: string,
  birthDate?: number
): Promise<string> {
  const now = new Date();
  const currentYear = String(now.getFullYear()).slice(-2); // "26" for 2026

  // Format birth date as DDMMYY
  let birthDatePart = "000000";
  if (birthDate) {
    const birth = new Date(birthDate);
    const day = String(birth.getDate()).padStart(2, "0");
    const month = String(birth.getMonth() + 1).padStart(2, "0");
    const year = String(birth.getFullYear()).slice(-2);
    birthDatePart = `${day}${month}${year}`;
  }

  // Get next sequence number
  const profiles = await ctx.db.query("profiles").collect();
  let maxSequence = 0;

  for (const profile of profiles) {
    if (profile.consularCard?.cardNumber) {
      // Extract sequence from format CC26XXXXXX-NNNNN
      const parts = profile.consularCard.cardNumber.split("-");
      if (parts.length === 2) {
        const seq = parseInt(parts[1], 10);
        if (!isNaN(seq) && seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }
  }

  const nextSequence = String(maxSequence + 1).padStart(5, "0");

  return `${countryCode}${currentYear}${birthDatePart}-${nextSequence}`;
}

/**
 * Generate a consular card for a profile
 * Called when a registration request is completed
 */
export const generate = authMutation({
  args: {
    profileId: v.id("profiles"),
    orgId: v.id("orgs"), // The org issuing the card (for template)
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    // Check if already has a valid card
    if (profile.consularCard?.cardNumber) {
      const now = Date.now();
      if (profile.consularCard.cardExpiresAt > now) {
        // Card is still valid
        return {
          success: false,
          message: "Une carte consulaire valide existe déjà",
          cardNumber: profile.consularCard.cardNumber,
        };
      }
    }

    // Generate card data
    const birthDate = profile.identity?.birthDate;
    const countryCode = profile.countryOfResidence || "FR";
    const cardNumber = await generateCardNumber(ctx, countryCode, birthDate);
    const cardIssuedAt = Date.now();
    // Card valid for 5 years
    const cardExpiresAt = cardIssuedAt + 5 * 365.25 * 24 * 60 * 60 * 1000;

    // Update profile with card data
    await ctx.db.patch(args.profileId, {
      consularCard: {
        orgId: args.orgId,
        cardNumber,
        cardIssuedAt,
        cardExpiresAt,
      },
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "profile",
      targetId: args.profileId,
      actorId: ctx.user._id,
      type: EventType.ProfileUpdate,
      data: { event: "consular_card_generated", cardNumber },
    });

    return {
      success: true,
      message: "Carte consulaire générée avec succès",
      cardNumber,
    };
  },
});

/**
 * Regenerate a consular card (lost, stolen, expired)
 */
export const regenerate = authMutation({
  args: {
    profileId: v.id("profiles"),
    reason: v.string(), // "lost", "stolen", "damaged", "expired"
    orgId: v.optional(v.id("orgs")), // Optional: use existing if not provided
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    const previousCardNumber = profile.consularCard?.cardNumber;
    // Use provided orgId, existing orgId, or first registration's orgId
    const orgId = args.orgId || profile.consularCard?.orgId || profile.registrations?.[0]?.orgId;
    
    if (!orgId) {
      throw error(ErrorCode.ORG_NOT_FOUND);
    }

    // Generate new card data
    const birthDate = profile.identity?.birthDate;
    const countryCode = profile.countryOfResidence || "FR";
    const cardNumber = await generateCardNumber(ctx, countryCode, birthDate);
    const cardIssuedAt = Date.now();
    const cardExpiresAt = cardIssuedAt + 5 * 365.25 * 24 * 60 * 60 * 1000;

    // Update profile with new card data
    await ctx.db.patch(args.profileId, {
      consularCard: {
        orgId,
        cardNumber,
        cardIssuedAt,
        cardExpiresAt,
      },
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "profile",
      targetId: args.profileId,
      actorId: ctx.user._id,
      type: EventType.ProfileUpdate,
      data: {
        event: "consular_card_regenerated",
        cardNumber,
        previousCardNumber,
        reason: args.reason,
      },
    });

    return {
      success: true,
      message: "Nouvelle carte consulaire générée",
      cardNumber,
      previousCardNumber,
    };
  },
});

/**
 * Get card info for current user
 */
export const getMyCard = authQuery({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile?.consularCard) {
      return null;
    }

    return {
      cardNumber: profile.consularCard.cardNumber,
      cardIssuedAt: profile.consularCard.cardIssuedAt,
      cardExpiresAt: profile.consularCard.cardExpiresAt,
      isExpired: profile.consularCard.cardExpiresAt < Date.now(),
      identity: profile.identity,
    };
  },
});

/**
 * Verify a card by number (public endpoint for QR scanning)
 */
export const verifyCard = query({
  args: {
    cardNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("profiles").collect();

    const profile = profiles.find(
      (p) => p.consularCard?.cardNumber === args.cardNumber
    );

    if (!profile) {
      return {
        valid: false,
        message: "Carte non trouvée",
      };
    }

    const isExpired = profile.consularCard!.cardExpiresAt < Date.now();

    return {
      valid: !isExpired,
      message: isExpired ? "Carte expirée" : "Carte valide",
      holder: profile.identity
        ? {
            firstName: profile.identity.firstName,
            lastName: profile.identity.lastName,
          }
        : null,
      cardIssuedAt: profile.consularCard!.cardIssuedAt,
      cardExpiresAt: profile.consularCard!.cardExpiresAt,
    };
  },
});
