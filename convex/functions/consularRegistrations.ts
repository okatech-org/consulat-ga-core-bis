import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query, internalMutation } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { Id } from "../_generated/dataModel";
import {
  RegistrationStatus,
  RegistrationType,
  RegistrationDuration,
  registrationDurationValidator,
  registrationTypeValidator,
  registrationStatusValidator,
} from "../lib/validators";
import { PublicUserType } from "../lib/constants";
import { assertCanDoTask } from "../lib/permissions";
import { TaskCode } from "../lib/taskCodes";

/**
 * List registrations by organization with optional status filter (paginated)
 */
export const listByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(registrationStatusValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Permission check: must be org member with consular_registrations.view
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();
    await assertCanDoTask(ctx, ctx.user, membership, TaskCode.consular_registrations.view);

    let paginatedResult;

    if (args.status) {
      paginatedResult = await ctx.db
        .query("consularRegistrations")
        .withIndex("by_org_status", (q) =>
          q.eq("orgId", args.orgId).eq("status", args.status!),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      paginatedResult = await ctx.db
        .query("consularRegistrations")
        .withIndex("by_org_status", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Enrich with profile and user data for current page only
    const enrichedPage = await Promise.all(
      paginatedResult.page.map(async (reg) => {
        const profile = await ctx.db.get(reg.profileId);
        const user = profile ? await ctx.db.get(profile.userId) : null;
        const request = await ctx.db.get(reg.requestId);
        return {
          ...reg,
          requestReference: request?.reference,
          profile:
            profile ?
              {
                _id: profile._id,
                identity: profile.identity,
                contacts: profile.contacts,
                addresses: profile.addresses,
                passportInfo: profile.passportInfo,
              }
            : null,
          user:
            user ?
              {
                _id: user._id,
                email: user.email,
                avatarUrl: user.avatarUrl,
              }
            : null,
        };
      }),
    );

    return {
      ...paginatedResult,
      page: enrichedPage,
    };
  },
});

/**
 * List registrations for a profile
 */
export const listByProfile = authQuery({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) return [];

    return await ctx.db
      .query("consularRegistrations")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();
  },
});

/**
 * Get registration by request ID
 */
export const getByRequest = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("consularRegistrations")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .unique();
  },
});

/**
 * Get active registrations ready for card generation (permanent, active, no card yet)
 */
export const getReadyForCard = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    // Permission check: must be org member with consular_cards.manage
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();
    await assertCanDoTask(ctx, ctx.user, membership, TaskCode.consular_cards.manage);
    const registrations = await ctx.db
      .query("consularRegistrations")
      .withIndex("by_org_status", (q) =>
        q.eq("orgId", args.orgId).eq("status", RegistrationStatus.Active),
      )
      .collect();

    // Filter to permanent registrations without card
    const readyForCard = registrations.filter(
      (r) => r.duration === PublicUserType.LongStay && !r.cardNumber,
    );

    // Enrich with profile data
    return await Promise.all(
      readyForCard.map(async (reg) => {
        const profile = await ctx.db.get(reg.profileId);
        return {
          ...reg,
          profile:
            profile ?
              {
                _id: profile._id,
                identity: profile.identity,
                passportInfo: profile.passportInfo,
                countryOfResidence: profile.countryOfResidence,
              }
            : null,
        };
      }),
    );
  },
});

/**
 * Get registrations ready for printing (has card, not printed)
 */
export const getReadyForPrint = authQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    // Permission check: must be org member with consular_cards.manage
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", args.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();
    await assertCanDoTask(ctx, ctx.user, membership, TaskCode.consular_cards.manage);
    const registrations = await ctx.db
      .query("consularRegistrations")
      .withIndex("by_org_status", (q) =>
        q.eq("orgId", args.orgId).eq("status", RegistrationStatus.Active),
      )
      .collect();

    // Filter to those with card but not printed
    const readyForPrint = registrations.filter(
      (r) => r.cardNumber && !r.printedAt,
    );

    // Enrich with profile data
    return await Promise.all(
      readyForPrint.map(async (reg) => {
        const profile = await ctx.db.get(reg.profileId);
        return {
          ...reg,
          profile:
            profile ?
              {
                _id: profile._id,
                identity: profile.identity,
                passportInfo: profile.passportInfo,
              }
            : null,
        };
      }),
    );
  },
});

/**
 * Create a new registration (called when submitting registration request)
 */
export const create = authMutation({
  args: {
    orgId: v.id("orgs"),
    requestId: v.id("requests"),
    duration: registrationDurationValidator,
    type: registrationTypeValidator,
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Check if already registered at this org with active status
    const existing = await ctx.db
      .query("consularRegistrations")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    const activeAtOrg = existing.find(
      (r) => r.orgId === args.orgId && r.status === RegistrationStatus.Active,
    );

    if (activeAtOrg) {
      throw new Error("Already registered at this organization");
    }

    // Create registration entry
    return await ctx.db.insert("consularRegistrations", {
      profileId: profile._id,
      orgId: args.orgId,
      requestId: args.requestId,
      duration: args.duration,
      type: args.type,
      status: RegistrationStatus.Requested,
      registeredAt: Date.now(),
    });
  },
});

/**
 * Create registration from request submission (internal, called by requests.submit)
 */
export const createFromRequest = internalMutation({
  args: {
    profileId: v.id("profiles"),
    orgId: v.id("orgs"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    // Check for existing active or pending registration
    const existing = await ctx.db
      .query("consularRegistrations")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .collect();

    const activeAtOrg = existing.find(
      (r) =>
        r.orgId === args.orgId &&
        (r.status === RegistrationStatus.Active ||
          r.status === RegistrationStatus.Requested),
    );

    if (activeAtOrg) {
      // Return existing registration ID
      return activeAtOrg._id;
    }

    // Create new registration entry
    return await ctx.db.insert("consularRegistrations", {
      profileId: args.profileId,
      orgId: args.orgId,
      requestId: args.requestId,
      type: RegistrationType.Inscription, // Always Initial for now
      status: RegistrationStatus.Requested,
      registeredAt: Date.now(),
      // duration: not set - will be set when card is generated
    });
  },
});

/**
 * Sync registration status when request status changes
 */
export const syncStatus = internalMutation({
  args: {
    requestId: v.id("requests"),
    newStatus: registrationStatusValidator,
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("consularRegistrations")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .unique();

    if (!registration) return;

    const updates: Record<string, unknown> = { status: args.newStatus };

    if (args.newStatus === RegistrationStatus.Active) {
      updates.activatedAt = Date.now();
    }

    await ctx.db.patch(registration._id, updates);
  },
});

/**
 * Update registration status (agent action)
 */
export const updateStatus = authMutation({
  args: {
    registrationId: v.id("consularRegistrations"),
    status: registrationStatusValidator,
  },
  handler: async (ctx, args) => {
    // Resolve org from registration for permission check
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found");
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", reg.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();
    await assertCanDoTask(ctx, ctx.user, membership, TaskCode.consular_registrations.manage);
    const now = Date.now();
    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === RegistrationStatus.Active) {
      updates.activatedAt = now;
      // Set expiration 5 years from activation
      updates.expiresAt = now + 5 * 365.25 * 24 * 60 * 60 * 1000;
    }

    await ctx.db.patch(args.registrationId, updates);
  },
});

/**
 * Generate consular card for a registration (manual action by agent)
 */
export const generateCard = authMutation({
  args: {
    registrationId: v.id("consularRegistrations"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    // Permission check: resolve org from registration
    if (registration) {
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", ctx.user._id).eq("orgId", registration.orgId),
        )
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .unique();
      await assertCanDoTask(ctx, ctx.user, membership, TaskCode.consular_cards.manage);
    }
    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status !== RegistrationStatus.Active) {
      throw new Error("Registration must be active to generate card");
    }

    if (registration.cardNumber) {
      throw new Error("Card already generated for this registration");
    }

    // Get profile for card number generation
    const profile = await ctx.db.get(registration.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Generate card number: [CC][YY][DDMMYY]-[NNNNN]
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const countryCode = profile.countryOfResidence || "XX";

    // Format birth date
    let birthDateStr = "010101";
    if (profile.identity?.birthDate) {
      const bd = new Date(profile.identity.birthDate);
      const day = bd.getDate().toString().padStart(2, "0");
      const month = (bd.getMonth() + 1).toString().padStart(2, "0");
      const yr = bd.getFullYear().toString().slice(-2);
      birthDateStr = `${day}${month}${yr}`;
    }

    // Get sequence number
    const allCards = await ctx.db.query("consularRegistrations").collect();
    const existingNumbers = allCards
      .filter((r) => r.cardNumber)
      .map((r) => {
        const match = r.cardNumber!.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    const maxSeq = Math.max(0, ...existingNumbers);
    const seq = (maxSeq + 1).toString().padStart(5, "0");

    const cardNumber = `${countryCode}${year}${birthDateStr}-${seq}`;
    const cardIssuedAt = Date.now();

    // Get org settings for duration (default: 5 years)
    const org = await ctx.db.get(registration.orgId);
    const durationYears = org?.settings?.registrationDurationYears ?? 5;
    const cardExpiresAt =
      cardIssuedAt + durationYears * 365.25 * 24 * 60 * 60 * 1000;

    // Determine duration type based on years
    const duration =
      durationYears >= 5 ? PublicUserType.LongStay : PublicUserType.ShortStay;

    // Update registration with card info and duration
    await ctx.db.patch(args.registrationId, {
      cardNumber,
      cardIssuedAt,
      cardExpiresAt,
      duration,
    });

    // Also update the profile's consularCard
    await ctx.db.patch(registration.profileId, {
      consularCard: {
        orgId: registration.orgId,
        cardNumber,
        cardIssuedAt,
        cardExpiresAt,
      },
    });

    return { success: true, cardNumber, message: "Carte générée avec succès" };
  },
});

/**
 * Mark a card as printed (called by EasyCard or agent)
 */
export const markAsPrinted = authMutation({
  args: {
    registrationId: v.id("consularRegistrations"),
  },
  handler: async (ctx, args) => {
    // Permission check: resolve org from registration
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found");
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", ctx.user._id).eq("orgId", reg.orgId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .unique();
    await assertCanDoTask(ctx, ctx.user, membership, TaskCode.consular_cards.manage);

    await ctx.db.patch(args.registrationId, {
      printedAt: Date.now(),
    });
  },
});
