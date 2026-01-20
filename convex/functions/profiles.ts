import { v } from "convex/values";
import { query } from "../_generated/server";
import { authQuery, authMutation } from "../lib/customFunctions";
import { error, ErrorCode } from "../lib/errors";
import { calculateCompletionScore } from "../lib/utils";
import {
  genderValidator,
  passportInfoValidator,
  addressValidator,
  emergencyContactValidator,
  parentValidator,
  spouseValidator,
  EventType,
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
 * Create or update profile
 */
export const upsert = authMutation({
  args: {
    identity: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      birthPlace: v.optional(v.string()),
      birthCountry: v.optional(v.string()),
      gender: v.optional(genderValidator),
      nationality: v.optional(v.string()),
      nationalityAcquisition: v.optional(v.string()),
    }),
    passportInfo: v.optional(passportInfoValidator),
    addresses: v.optional(
      v.object({
        residence: v.optional(addressValidator),
        homeland: v.optional(addressValidator),
      })
    ),
    contacts: v.optional(
      v.object({
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        emergency: v.array(emergencyContactValidator),
      })
    ),
    family: v.optional(
      v.object({
        maritalStatus: v.string(),
        father: v.optional(parentValidator),
        mother: v.optional(parentValidator),
        spouse: v.optional(spouseValidator),
      })
    ),
    profession: v.optional(
      v.object({
        status: v.string(),
        title: v.optional(v.string()),
        employer: v.optional(v.string()),
      })
    ),
    isNational: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    const profileData = {
      identity: args.identity,
      passportInfo: args.passportInfo,
      addresses: args.addresses ?? { residence: undefined, homeland: undefined },
      contacts: args.contacts ?? { phone: undefined, email: undefined, emergency: [] },
      family: args.family ?? {
        maritalStatus: "single",
        father: undefined,
        mother: undefined,
        spouse: undefined,
      },
      profession: args.profession,
      isNational: args.isNational ?? false,
      updatedAt: Date.now(),
    };

    // Calculate completion score
    const completionScore = calculateCompletionScore(profileData);

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...profileData,
        completionScore,
      });

      // Log event
      await ctx.db.insert("events", {
        targetType: "profile",
        targetId: existing._id as unknown as string,
        actorId: ctx.user._id,
        type: EventType.PROFILE_UPDATED,
        data: { completionScore },
      });

      return existing._id;
    }

    // Create new profile
    const profileId = await ctx.db.insert("profiles", {
      userId: ctx.user._id,
      ...profileData,
      completionScore,
    });

    return profileId;
  },
});

/**
 * Update full profile (bulk)
 */
export const update = authMutation({
  args: {
    id: v.optional(v.id("profiles")), // Optional, we rely on user ctx usually
    identity: v.optional(v.any()),
    contacts: v.optional(v.any()),
    family: v.optional(v.any()),
    profession: v.optional(v.any()),
    addresses: v.optional(v.any()),
    passportInfo: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.identity) updates.identity = args.identity;
    if (args.contacts) updates.contacts = args.contacts;
    if (args.family) updates.family = args.family;
    if (args.profession) updates.profession = args.profession;
    if (args.addresses) updates.addresses = args.addresses;
    if (args.passportInfo) updates.passportInfo = args.passportInfo;

    // Recalculate completion score
    const updatedProfile = { ...profile, ...updates };
    updates.completionScore = calculateCompletionScore(updatedProfile as any);

    await ctx.db.patch(profile._id, updates);

    // Log event
    await ctx.db.insert("events", {
      targetType: "profile",
      targetId: profile._id as unknown as string,
      actorId: ctx.user._id,
      type: EventType.PROFILE_UPDATED,
      data: { method: 'bulk_update' },
    });

    return profile._id;
  },
});

/**
 * Update specific section of profile
 */
export const updateSection = authMutation({
  args: {
    section: v.union(
      v.literal("identity"),
      v.literal("passportInfo"),
      v.literal("addresses"),
      v.literal("contacts"),
      v.literal("family"),
      v.literal("profession")
    ),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) {
      throw error(ErrorCode.PROFILE_NOT_FOUND);
    }

    const updates: Record<string, unknown> = {
      [args.section]: args.data,
      updatedAt: Date.now(),
    };

    // Recalculate completion score
    const updatedProfile = { ...profile, ...updates };
    updates.completionScore = calculateCompletionScore(updatedProfile as any);

    await ctx.db.patch(profile._id, updates);

    // Log event
    await ctx.db.insert("events", {
      targetType: "profile",
      targetId: profile._id as unknown as string,
      actorId: ctx.user._id,
      type: EventType.PROFILE_UPDATED,
      data: { section: args.section },
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

    const newRegistration = {
      orgId: args.orgId,
      status: "pending",
      registeredAt: Date.now(),
    };

    // Append to existing registrations or create new array
    // Note: Schema validation for 'registrations' field is assumed to exist in defineTable
    // If not, this might fail if schema is strict. 
    // Ideally we should check if already registered.
    const currentRegistrations = (profile as any).registrations || [];
    
    // Check if already registered or pending with this org
    const existing = currentRegistrations.find((r: any) => r.orgId === args.orgId);
    if (existing) {
       // If pending, do nothing or throw? If active, throw?
       // For now, allow re-request (maybe update date?) or throw if active.
       if (existing.status === 'active') {
          throw new Error("Déjà immatriculé auprès de cet organisme");
       }
       // If pending, just return success
       return profile._id; 
    }

    const updates = {
      registrations: [...currentRegistrations, newRegistration],
      updatedAt: Date.now(),
    };

    await ctx.db.patch(profile._id, updates);

    // Log event
    await ctx.db.insert("events", {
        targetType: "profile",
        targetId: profile._id as unknown as string,
        actorId: ctx.user._id,
        type: EventType.REGISTRATION_REQUESTED,
        data: { orgId: args.orgId },
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
