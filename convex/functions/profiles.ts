import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import { calculateCompletionScore } from "../lib/utils";
import {
  genderValidator,
  passportInfoValidator,
  EventType,
  profileAddressesValidator,
  profileContactsValidator,
  profileFamilyValidator,
  professionValidator,
  nationalityAcquisitionValidator,
  RequestStatus,
  RequestPriority,
  RegistrationDuration,
  RegistrationType,
  RegistrationStatus,
  publicUserTypeValidator,
  CountryCode,
} from "../lib/validators";
import { ServiceCategory } from "../lib/constants";
import { countryCodeValidator } from "../lib/countryCodeValidator";

/**
 * Get current user's profile
 */
export const getMine = authQuery({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    return profile;
  },
});

/**
 * Get profile by user ID
 */
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

/**
 * Update full profile (bulk)
 */
export const update = authMutation({
  args: {
    id: v.id("profiles"),
    countryOfResidence: v.optional(countryCodeValidator),
    identity: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        birthDate: v.optional(v.number()),
        birthPlace: v.optional(v.string()),
        birthCountry: v.optional(countryCodeValidator),
        gender: v.optional(genderValidator),
        nationality: v.optional(countryCodeValidator),
        nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
      }),
    ),
    contacts: v.optional(profileContactsValidator),
    family: v.optional(profileFamilyValidator),
    profession: v.optional(professionValidator),
    addresses: v.optional(profileAddressesValidator),
    passportInfo: v.optional(passportInfoValidator),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    const { id, ...rest } = args;

    const updates: Record<string, unknown> = {
      ...rest,
      updatedAt: Date.now(),
    };

    // Recalculate completion score
    const updatedProfile = { ...profile, ...updates };
    updates.completionScore = calculateCompletionScore(updatedProfile as any);

    await ctx.db.patch(profile._id, updates);

    // Log event
    await ctx.db.insert("events", {
      targetType: "profile",
      targetId: profile._id,
      actorId: ctx.user._id,
      type: EventType.ProfileUpdate,
      data: { method: "bulk_update" },
    });

    return profile._id;
  },
});

/**
 * Get profile with auth status for frontend routing
 */
export const getMyProfileSafe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { status: "unauthenticated", profile: null };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return { status: "user_not_synced", profile: null };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return { status: "ready", profile };
  },
});

/**
 * Request consular registration
 */
export const requestRegistration = authMutation({
  args: {
    orgId: v.id("orgs"),
    duration: v.optional(
      v.union(v.literal("temporary"), v.literal("permanent")),
    ),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    // Check existing registrations in consularRegistrations table
    const existingRegistrations = await ctx.db
      .query("consularRegistrations")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    const activeAtOrg = existingRegistrations.find(
      (r) => r.orgId === args.orgId && r.status === "active",
    );

    if (activeAtOrg) {
      throw new Error("Déjà immatriculé auprès de cet organisme");
    }

    // Check for pending request at this org
    const pendingAtOrg = existingRegistrations.find(
      (r) => r.orgId === args.orgId && r.status === "requested",
    );

    if (pendingAtOrg) {
      // Already have pending request, return success
      return profile._id;
    }

    // Get registration service for this org
    const orgServices = await ctx.db
      .query("orgServices")
      .withIndex("by_org_active", (q) =>
        q.eq("orgId", args.orgId).eq("isActive", true),
      )
      .collect();

    // Find the registration category service
    let registrationOrgService = null;
    for (const os of orgServices) {
      const service = await ctx.db.get(os.serviceId);
      if (service?.category === "registration" && service.isActive) {
        registrationOrgService = os;
        break;
      }
    }

    if (!registrationOrgService) {
      throw error(ErrorCode.SERVICE_NOT_AVAILABLE);
    }

    // Generate reference number
    const now = Date.now();
    const year = new Date(now).getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `REG-${year}-${random}`;

    // Create actual request in requests table
    // Auto-attach documents from profile's Document Vault (convert typed object to array)
    const profileDocs = profile.documents ?? {};
    const documentIds = Object.values(profileDocs).filter(
      (id): id is typeof id & string => id !== undefined,
    );

    const requestId = await ctx.db.insert("requests", {
      userId: ctx.user._id,
      profileId: profile._id,
      orgId: args.orgId,
      orgServiceId: registrationOrgService._id,
      reference,
      status: RequestStatus.Pending,
      priority: RequestPriority.Normal,
      formData: {
        type: "registration",
        profileId: profile._id,
        duration: args.duration || "permanent",
      },
      // Auto-attach documents from profile vault
      documents: documentIds,
      submittedAt: now,
      updatedAt: now,
    });

    // Create entry in consularRegistrations table
    await ctx.db.insert("consularRegistrations", {
      profileId: profile._id,
      orgId: args.orgId,
      requestId: requestId,
      duration:
        args.duration === "temporary" ?
          RegistrationDuration.Temporary
        : RegistrationDuration.Permanent,
      type: RegistrationType.Inscription,
      status: RegistrationStatus.Requested,
      registeredAt: now,
    });

    // Log event
    await ctx.db.insert("events", {
      targetType: "request",
      targetId: requestId as unknown as string,
      actorId: ctx.user._id,
      type: EventType.RequestSubmitted,
      data: {
        orgId: args.orgId,
        serviceCategory: "registration",
      },
    });

    return profile._id;
  },
});

/**
 * Submit registration request - finds appropriate org by user's country of residence
 * and creates a registration request automatically.
 * Only for long_stay and short_stay users.
 */
export const submitRegistrationRequest = authMutation({
  args: {},
  handler: async (ctx) => {
    // Get user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      return { status: "no_profile" as const };
    }

    // Only for long_stay and short_stay
    if (profile.userType !== "long_stay" && profile.userType !== "short_stay") {
      return { status: "not_applicable" as const };
    }

    // Get user's country of residence
    const userCountry =
      profile.countryOfResidence || profile.addresses?.residence?.country;

    if (!userCountry) {
      return { status: "no_country" as const };
    }

    // Find registration services
    const allServices = await ctx.db
      .query("services")
      .filter((q) =>
        q.and(
          q.eq(q.field("category"), ServiceCategory.Registration),
          q.eq(q.field("isActive"), true),
        ),
      )
      .collect();

    if (allServices.length === 0) {
      return { status: "no_service" as const, country: userCountry };
    }

    // Find an org with this service that has jurisdiction over user's country
    for (const service of allServices) {
      const orgServices = await ctx.db
        .query("orgServices")
        .filter((q) =>
          q.and(
            q.eq(q.field("serviceId"), service._id),
            q.eq(q.field("isActive"), true),
          ),
        )
        .collect();

      for (const orgService of orgServices) {
        const org = await ctx.db.get(orgService.orgId);
        if (!org || !org.isActive || org.deletedAt) continue;

        const jurisdictions = org.jurisdictionCountries ?? [];
        if (jurisdictions.includes(userCountry as CountryCode)) {
          // Check if already have active or pending registration at this org
          const existingRegistrations = await ctx.db
            .query("consularRegistrations")
            .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
            .collect();

          const activeOrPending = existingRegistrations.find(
            (r) =>
              r.orgId === org._id &&
              (r.status === "active" || r.status === "requested"),
          );

          if (activeOrPending) {
            return {
              status: "already_registered" as const,
              orgId: org._id,
              orgName: org.name,
            };
          }

          // Generate reference number
          const now = Date.now();
          const year = new Date(now).getFullYear();
          const random = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          const reference = `REG-${year}-${random}`;

          // Auto-attach documents from profile's Document Vault
          const profileDocs = profile.documents ?? {};
          const documentIds = Object.values(profileDocs).filter(
            (id): id is typeof id & string => id !== undefined,
          );

          // Create request
          const requestId = await ctx.db.insert("requests", {
            userId: ctx.user._id,
            profileId: profile._id,
            orgId: org._id,
            orgServiceId: orgService._id,
            reference,
            status: RequestStatus.Pending,
            priority: RequestPriority.Normal,
            formData: {
              type: "registration",
              profileId: profile._id,
              duration: "permanent",
            },
            documents: documentIds,
            submittedAt: now,
            updatedAt: now,
          });

          // Create entry in consularRegistrations table
          await ctx.db.insert("consularRegistrations", {
            profileId: profile._id,
            orgId: org._id,
            requestId: requestId,
            duration: RegistrationDuration.Permanent,
            type: RegistrationType.Inscription,
            status: RegistrationStatus.Requested,
            registeredAt: now,
          });

          // Log event
          await ctx.db.insert("events", {
            targetType: "request",
            targetId: requestId as unknown as string,
            actorId: ctx.user._id,
            type: EventType.RequestSubmitted,
            data: {
              orgId: org._id,
              serviceCategory: "registration",
            },
          });

          return {
            status: "success" as const,
            orgId: org._id,
            orgName: org.name,
            reference,
            requestId,
          };
        }
      }
    }

    // No org found with jurisdiction over user's country
    return { status: "no_org_found" as const, country: userCountry };
  },
});

// Note: Documents are now only attached to requests, not profiles
// Use the documents functions when creating/managing requests

/**
 * Upsert profile (create or update)
 */
export const upsert = authMutation({
  args: {
    countryOfResidence: v.optional(countryCodeValidator),
    identity: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        birthDate: v.optional(v.number()),
        birthPlace: v.optional(v.string()),
        birthCountry: v.optional(countryCodeValidator),
        gender: v.optional(genderValidator),
        nationality: v.optional(countryCodeValidator),
        nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
      }),
    ),
    contacts: v.optional(profileContactsValidator),
    family: v.optional(profileFamilyValidator),
    profession: v.optional(professionValidator),
    addresses: v.optional(profileAddressesValidator),
    passportInfo: v.optional(passportInfoValidator),
    isNational: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    const updates = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      // Update
      await ctx.db.patch(existing._id, { ...updates });
      return existing._id;
    } else {
      // Create
      const newProfile = {
        userId: ctx.user._id,
        identity: {},
        addresses: {},
        contacts: {},
        family: {},
        ...updates,
      };
      const completionScore = calculateCompletionScore(newProfile as any);

      const id = await ctx.db.insert("profiles", {
        ...newProfile,
        completionScore,
      } as any);

      // Log event
      await ctx.db.insert("events", {
        targetType: "profile",
        targetId: id,
        actorId: ctx.user._id,
        type: EventType.ProfileCreated,
        data: { method: "upsert" },
      });

      return id;
    }
  },
});

/**
 * Create profile from registration form
 * Adapts flat registration form data to profile schema
 */
export const createFromRegistration = authMutation({
  args: {
    userType: publicUserTypeValidator,
    identity: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        gender: v.optional(genderValidator),
        birthDate: v.optional(v.string()),
        birthPlace: v.optional(v.string()),
        birthCountry: v.optional(countryCodeValidator),
        nationality: v.optional(countryCodeValidator),
      }),
    ),
    addresses: v.optional(
      v.object({
        residence: v.optional(
          v.object({
            street: v.optional(v.string()),
            city: v.optional(v.string()),
            postalCode: v.optional(v.string()),
            country: v.optional(countryCodeValidator),
          }),
        ),
      }),
    ),
    family: v.optional(
      v.object({
        maritalStatus: v.optional(v.string()),
        father: v.optional(
          v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
          }),
        ),
        mother: v.optional(
          v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
          }),
        ),
        spouse: v.optional(
          v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
          }),
        ),
      }),
    ),
    profession: v.optional(
      v.object({
        status: v.optional(v.string()),
        title: v.optional(v.string()),
        employer: v.optional(v.string()),
      }),
    ),
    emergencyContact: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    const now = Date.now();

    // Convert birthDate string to timestamp if provided
    let birthDateTimestamp: number | undefined;
    if (args.identity?.birthDate) {
      const parsed = new Date(args.identity.birthDate);
      if (!isNaN(parsed.getTime())) {
        birthDateTimestamp = parsed.getTime();
      }
    }

    const profileData = {
      identity:
        args.identity ?
          {
            firstName: args.identity.firstName || "",
            lastName: args.identity.lastName || "",
            gender: args.identity.gender,
            birthDate: birthDateTimestamp,
            birthPlace: args.identity.birthPlace,
            birthCountry: args.identity.birthCountry,
            nationality: args.identity.nationality,
          }
        : {},
      addresses: args.addresses || {},
      family:
        args.family ?
          {
            maritalStatus: args.family.maritalStatus as any,
            father: args.family.father,
            mother: args.family.mother,
            spouse: args.family.spouse,
          }
        : {},
      profession:
        args.profession ?
          {
            status: args.profession.status as any,
            title: args.profession.title,
            employer: args.profession.employer,
          }
        : {},
      contacts:
        args.emergencyContact ?
          {
            emergencyResidence: {
              firstName: args.emergencyContact.firstName || "",
              lastName: args.emergencyContact.lastName || "",
              phone: args.emergencyContact.phone || "",
            },
          }
        : {},
      userType: args.userType as any,
      countryOfResidence: args.addresses?.residence?.country,
      updatedAt: now,
    };

    if (existing) {
      // Update existing profile
      await ctx.db.patch(existing._id, profileData as any);

      await ctx.db.insert("events", {
        targetType: "profile",
        targetId: existing._id,
        actorId: ctx.user._id,
        type: EventType.ProfileUpdate,
        data: { method: "registration_form" },
      });

      return existing._id;
    } else {
      const id = await ctx.db.insert("profiles", {
        userId: ctx.user._id,
        ...profileData,
      } as any);

      await ctx.db.insert("events", {
        targetType: "profile",
        targetId: id,
        actorId: ctx.user._id,
        type: EventType.ProfileCreated,
        data: { method: "registration_form" },
      });

      return id;
    }
  },
});
