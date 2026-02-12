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
  registrationDurationValidator,
} from "../lib/validators";
import { ServiceCategory } from "../lib/constants";
import { countryCodeValidator } from "../lib/countryCodeValidator";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Safely format a timestamp to YYYY-MM-DD string for form display.
 */
function formatDate(ts: number | undefined | null): string | undefined {
  if (!ts) return undefined;
  try {
    return new Date(ts).toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

/**
 * Build formData that maps profile fields to the consular registration
 * form template section/field IDs. This is the data that gets stored
 * with the request so the admin can see all submitted information.
 *
 * Keys follow the pattern: "sectionId.fieldId" matching formTemplates.ts
 * consular-card-registration template.
 */
function buildRegistrationFormData(
  profile: Record<string, any>,
  duration: string,
): Record<string, unknown> {
  const identity = profile.identity ?? {};
  const passportInfo = profile.passportInfo ?? {};
  const family = profile.family ?? {};
  const addresses = profile.addresses ?? {};
  const contacts = profile.contacts ?? {};
  const profession = profile.profession ?? {};
  const residence = addresses.residence ?? {};
  const homeland = addresses.homeland ?? {};
  const emergencyRes = contacts.emergencyResidence ?? {};
  const emergencyHome = contacts.emergencyHomeland ?? {};

  return {
    // Meta
    type: "registration",
    profileId: profile._id,
    duration,

    // Section: basic_info
    basic_info: {
      last_name: identity.lastName || undefined,
      first_name: identity.firstName || undefined,
      nip: identity.nip || undefined,
      gender: identity.gender || undefined,
      birth_date: formatDate(identity.birthDate),
      birth_place: identity.birthPlace || undefined,
      birth_country: identity.birthCountry || undefined,
      nationality: identity.nationality || undefined,
      nationality_acquisition: identity.nationalityAcquisition || undefined,
    },

    // Section: passport_info
    passport_info: {
      passport_number: passportInfo.number || undefined,
      passport_issue_date: formatDate(passportInfo.issueDate),
      passport_expiry_date: formatDate(passportInfo.expiryDate),
      passport_issuing_authority: passportInfo.issuingAuthority || undefined,
    },

    // Section: family_info
    family_info: {
      marital_status: family.maritalStatus || undefined,
      father_last_name: family.father?.lastName || undefined,
      father_first_name: family.father?.firstName || undefined,
      mother_last_name: family.mother?.lastName || undefined,
      mother_first_name: family.mother?.firstName || undefined,
      spouse_last_name: family.spouse?.lastName || undefined,
      spouse_first_name: family.spouse?.firstName || undefined,
    },

    // Section: contact_info
    contact_info: {
      email: contacts.email || profile.email || undefined,
      phone: contacts.phone || profile.phone || undefined,
    },

    // Section: residence_address
    residence_address: {
      residence_street: residence.street || undefined,
      residence_city: residence.city || undefined,
      residence_postal_code: residence.postalCode || undefined,
      residence_country: residence.country || undefined,
    },

    // Section: homeland_address
    homeland_address: {
      homeland_street: homeland.street || undefined,
      homeland_city: homeland.city || undefined,
      homeland_postal_code: homeland.postalCode || undefined,
      homeland_country: homeland.country || undefined,
    },

    // Section: emergency_residence
    emergency_residence: {
      emergency_residence_last_name: emergencyRes.lastName || undefined,
      emergency_residence_first_name: emergencyRes.firstName || undefined,
      emergency_residence_phone: emergencyRes.phone || undefined,
      emergency_residence_email: emergencyRes.email || undefined,
    },

    // Section: emergency_homeland
    emergency_homeland: {
      emergency_homeland_last_name: emergencyHome.lastName || undefined,
      emergency_homeland_first_name: emergencyHome.firstName || undefined,
      emergency_homeland_phone: emergencyHome.phone || undefined,
      emergency_homeland_email: emergencyHome.email || undefined,
    },

    // Section: professional_info
    professional_info: {
      work_status: profession.status || undefined,
      profession: profession.title || undefined,
      employer: profession.employer || undefined,
    },
  };
}

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
    duration: registrationDurationValidator,
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
      formData: buildRegistrationFormData(profile as any, args.duration || "permanent"),
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
      duration: args.duration,
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
 * Find the appropriate org for consular registration (read-only).
 * Does NOT create any request — just checks if an org exists.
 */
export const findRegistrationOrg = authQuery({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      return { status: "no_profile" as const };
    }

    if (profile.userType !== "long_stay") {
      return { status: "not_applicable" as const };
    }

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
          return {
            status: "found" as const,
            orgId: org._id,
            orgName: org.name,
            country: userCountry,
          };
        }
      }
    }

    return { status: "no_org_found" as const, country: userCountry };
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
          // Note: No existing registration check — allow re-registration freely

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
            formData: buildRegistrationFormData(profile as any, profile.userType || "permanent"),
            documents: documentIds,
            submittedAt: now,
            updatedAt: now,
          });

          // Create entry in consularRegistrations table
          await ctx.db.insert("consularRegistrations", {
            profileId: profile._id,
            orgId: org._id,
            requestId: requestId,
            duration: profile.userType,
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

// ============================================================================
// SIGNALEMENT CONSULAIRE (Short-Stay Notification)
// ============================================================================

/**
 * Find the appropriate org for consular notification / signalement (read-only).
 * User specifies the destination country they are traveling to.
 * Available to both long_stay and short_stay Gabonese citizens.
 */
export const findNotificationOrg = authQuery({
  args: {
    destinationCountry: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      return { status: "no_profile" as const };
    }

    if (profile.userType !== "long_stay" && profile.userType !== "short_stay") {
      return { status: "not_applicable" as const };
    }

    const targetCountry = args.destinationCountry;

    // Find the specific consular-notification service by slug
    const notificationService = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", "consular-notification"))
      .unique();

    if (!notificationService || !notificationService.isActive) {
      return { status: "no_service" as const, country: targetCountry };
    }

    // Find an org with this service activated and jurisdiction over the destination country
    const orgServices = await ctx.db
      .query("orgServices")
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceId"), notificationService._id),
          q.eq(q.field("isActive"), true),
        ),
      )
      .collect();

    for (const orgService of orgServices) {
      const org = await ctx.db.get(orgService.orgId);
      if (!org || !org.isActive || org.deletedAt) continue;

      const jurisdictions = org.jurisdictionCountries ?? [];
      if (jurisdictions.includes(targetCountry as CountryCode)) {
        return {
          status: "found" as const,
          orgId: org._id,
          orgName: org.name,
          country: targetCountry,
        };
      }
    }

    return { status: "no_org_found" as const, country: targetCountry };
  },
});

/**
 * Submit notification (signalement) request.
 * User specifies the destination country they are traveling to.
 * Available to both long_stay and short_stay Gabonese citizens.
 */
export const submitNotificationRequest = authMutation({
  args: {
    destinationCountry: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      return { status: "no_profile" as const };
    }

    if (profile.userType !== "long_stay" && profile.userType !== "short_stay") {
      return { status: "not_applicable" as const };
    }

    const targetCountry = args.destinationCountry;

    // Find the specific consular-notification service by slug
    const notificationService = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", "consular-notification"))
      .unique();

    if (!notificationService || !notificationService.isActive) {
      return { status: "no_service" as const, country: targetCountry };
    }

    // Find org with this service activated and jurisdiction over destination country
    const orgServices = await ctx.db
      .query("orgServices")
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceId"), notificationService._id),
          q.eq(q.field("isActive"), true),
        ),
      )
      .collect();

    for (const orgService of orgServices) {
      const org = await ctx.db.get(orgService.orgId);
      if (!org || !org.isActive || org.deletedAt) continue;

      const jurisdictions = org.jurisdictionCountries ?? [];
      if (jurisdictions.includes(targetCountry as CountryCode)) {
        // Generate reference number
        const now = Date.now();
        const year = new Date(now).getFullYear();
        const random = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        const reference = `SIG-${year}-${random}`;

        // Auto-attach documents from profile vault
        const profileDocs = profile.documents ?? {};
        const documentIds = Object.values(profileDocs).filter(
          (id): id is typeof id & string => id !== undefined,
        );

        // Create request linked to the notification service
        const requestId = await ctx.db.insert("requests", {
          userId: ctx.user._id,
          profileId: profile._id,
          orgId: org._id,
          orgServiceId: orgService._id,
          reference,
          status: RequestStatus.Pending,
          priority: RequestPriority.Normal,
          formData: buildRegistrationFormData(profile as any, profile.userType || "short_stay"),
          documents: documentIds,
          submittedAt: now,
          updatedAt: now,
        });

        // Create entry in consularNotifications table
        await ctx.db.insert("consularNotifications", {
          profileId: profile._id,
          orgId: org._id,
          requestId: requestId,
          type: RegistrationType.Inscription,
          status: RegistrationStatus.Requested,
          signaledAt: now,
        });

        // Update profile with signaledToOrgId
        await ctx.db.patch(profile._id, {
          signaledToOrgId: org._id,
        });

        // Log event
        await ctx.db.insert("events", {
          targetType: "request",
          targetId: requestId as unknown as string,
          actorId: ctx.user._id,
          type: EventType.RequestSubmitted,
          data: {
            orgId: org._id,
            serviceCategory: "notification",
            notificationType: "signalement",
            destinationCountry: targetCountry,
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

    return { status: "no_org_found" as const, country: targetCountry };
  },
});

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
        nip: v.optional(v.string()),
        gender: v.optional(genderValidator),
        birthDate: v.optional(v.string()),
        birthPlace: v.optional(v.string()),
        birthCountry: v.optional(countryCodeValidator),
        nationality: v.optional(countryCodeValidator),
        nationalityAcquisition: v.optional(v.string()),
      }),
    ),
    passportInfo: v.optional(
      v.object({
        number: v.optional(v.string()),
        issueDate: v.optional(v.string()),
        expiryDate: v.optional(v.string()),
        issuingAuthority: v.optional(v.string()),
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
        homeland: v.optional(
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
    emergencyResidence: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
      }),
    ),
    emergencyHomeland: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
      }),
    ),
    documents: v.optional(
      v.object({
        passport: v.optional(v.id("documents")),
        proofOfAddress: v.optional(v.id("documents")),
        identityPhoto: v.optional(v.id("documents")),
        birthCertificate: v.optional(v.id("documents")),
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

    // Convert passport dates (string) to timestamps
    let passportData:
      | {
          number: string;
          issueDate: number;
          expiryDate: number;
          issuingAuthority: string;
        }
      | undefined;
    if (args.passportInfo?.number) {
      const issueDate =
        args.passportInfo.issueDate ?
          new Date(args.passportInfo.issueDate).getTime()
        : 0;
      const expiryDate =
        args.passportInfo.expiryDate ?
          new Date(args.passportInfo.expiryDate).getTime()
        : 0;
      passportData = {
        number: args.passportInfo.number,
        issueDate: isNaN(issueDate) ? 0 : issueDate,
        expiryDate: isNaN(expiryDate) ? 0 : expiryDate,
        issuingAuthority: args.passportInfo.issuingAuthority || "",
      };
    }

    const profileData = {
      identity:
        args.identity ?
          {
            firstName: args.identity.firstName || "",
            lastName: args.identity.lastName || "",
            nip: args.identity.nip,
            gender: args.identity.gender,
            birthDate: birthDateTimestamp,
            birthPlace: args.identity.birthPlace,
            birthCountry: args.identity.birthCountry,
            nationality: args.identity.nationality,
            nationalityAcquisition: args.identity.nationalityAcquisition as any,
          }
        : {},
      passportInfo: passportData,
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
      contacts: {
        ...(args.emergencyResidence ?
          {
            emergencyResidence: {
              firstName: args.emergencyResidence.firstName || "",
              lastName: args.emergencyResidence.lastName || "",
              phone: args.emergencyResidence.phone || "",
              email: args.emergencyResidence.email,
            },
          }
        : {}),
        ...(args.emergencyHomeland ?
          {
            emergencyHomeland: {
              firstName: args.emergencyHomeland.firstName || "",
              lastName: args.emergencyHomeland.lastName || "",
              phone: args.emergencyHomeland.phone || "",
              email: args.emergencyHomeland.email,
            },
          }
        : {}),
      },
      userType: args.userType as any,
      countryOfResidence: args.addresses?.residence?.country,
      documents: args.documents ?? undefined,
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
