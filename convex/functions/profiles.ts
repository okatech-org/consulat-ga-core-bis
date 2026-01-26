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
  countryCodeValidator,
  RequestStatus,
  RequestPriority,
} from "../lib/validators";
import { Id } from "../_generated/dataModel";

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
    identity: v.optional(v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      birthPlace: v.optional(v.string()),
      birthCountry: v.optional(countryCodeValidator),
      gender: v.optional(genderValidator),
      nationality: v.optional(countryCodeValidator),
      nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
    })),
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
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    // Check existing registrations
    const currentRegistrations = (profile as any).registrations || [];
    const existing = currentRegistrations.find((r: any) => r.orgId === args.orgId);
    if (existing) {
      if (existing.status === 'active') {
        throw new Error("Déjà immatriculé auprès de cet organisme");
      }
      // If pending, return success (don't create duplicate)
      return profile._id;
    }

    // Get registration service for this org
    const orgServices = await ctx.db
      .query("orgServices")
      .withIndex("by_org_active", (q) =>
        q.eq("orgId", args.orgId).eq("isActive", true)
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
    const requestId = await ctx.db.insert("requests", {
      userId: ctx.user._id,
      profileId: profile._id,
      orgId: args.orgId,
      orgServiceId: registrationOrgService._id,
      reference,
      status: RequestStatus.Submitted,
      priority: RequestPriority.Normal,
      formData: {
        type: "registration",
        profileId: profile._id,
      },
      submittedAt: now,
      updatedAt: now,
    });

    // Update profile registrations array
    const newRegistration = {
      orgId: args.orgId,
      status: "pending",
      registeredAt: now,
      requestId: requestId,
    };

    await ctx.db.patch(profile._id, {
      registrations: [...currentRegistrations, newRegistration],
      updatedAt: now,
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

export const addDocument = authMutation({
  args: {
    docType: v.string(),
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) throw error(ErrorCode.PROFILE_NOT_FOUND);

    const docs = (profile as any).documents || {};
    const list = docs[args.docType] || [];
    
    // Avoid duplicates
    if (!list.includes(args.documentId)) {
      list.push(args.documentId);
    }
    
    docs[args.docType] = list;

    await ctx.db.patch(profile._id, { documents: docs });
    return true;
  },
});

export const removeDocument = authMutation({
  args: {
    docType: v.string(),
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) throw error(ErrorCode.PROFILE_NOT_FOUND);

    const docs = (profile as any).documents || {};
    const list = docs[args.docType] || [];
    
    const newList = list.filter((id: string) => id !== args.documentId);
    docs[args.docType] = newList;

    await ctx.db.patch(profile._id, { documents: docs });
    
    return true;
  },
});

/**
 * Upsert profile (create or update)
 */
export const upsert = authMutation({
  args: {
    countryOfResidence: v.optional(countryCodeValidator),
    identity: v.optional(v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      birthPlace: v.optional(v.string()),
      birthCountry: v.optional(countryCodeValidator),
      gender: v.optional(genderValidator),
      nationality: v.optional(countryCodeValidator),
      nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
    })),
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
      const updatedProfile = { ...existing, ...updates };
      const completionScore = calculateCompletionScore(updatedProfile as any);
      
      await ctx.db.patch(existing._id, { ...updates, completionScore });
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
        completionScore 
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
