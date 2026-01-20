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
      firstName: v.string(),
      lastName: v.string(),
      birthDate: v.number(),
      birthPlace: v.string(),
      birthCountry: v.string(),
      gender: genderValidator,
      nationality: v.string(),
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
