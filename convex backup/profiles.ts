import { v } from "convex/values";
import { query } from "./_generated/server";
import { authMutation, authQuery } from "./lib/customFunctions";
import { countryCodeValidator } from "./lib/validators";

type DocTypeKey = "passport" | "nationalId" | "birthCertificate" | "residencePermit" | "proofOfAddress" | "photo" | "otherDocs";

export const getMyProfile = authQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("consularProfiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();
  },
});

/**
 * Safe version that returns null if user not synced yet (no error thrown).
 * Use this on routes where user might just have signed up via Clerk.
 */
export const getMyProfileSafe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { status: "unauthenticated" as const, profile: null, user: null };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { status: "user_not_synced" as const, profile: null, user: null };
    }

    const profile = await ctx.db
      .query("consularProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return { status: "ready" as const, profile, user };
  },
});

export const create = authMutation({
  args: {
    isNational: v.boolean(),
    nationality: countryCodeValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("consularProfiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("consularProfiles", {
      userId: ctx.user._id,
      isNational: args.isNational,
      nationality: args.nationality,
      status: "draft",
      personal: {
        firstName: ctx.user.firstName || "",
        lastName: ctx.user.lastName || "",
      },
      contacts: {
        email: ctx.user.email,
        phoneHome: ctx.user.phone,
      },
      family: {},
      professionSituation: {},
      emergencyContacts: [],
      documents: {},
      registrations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = authMutation({
  args: {
    id: v.id("consularProfiles"),
    personal: v.optional(v.any()), 
    contacts: v.optional(v.any()),
    family: v.optional(v.any()),
    professionSituation: v.optional(v.any()),
    emergencyContacts: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);
    if (!profile) throw new Error("Profile not found");

    if (profile.userId !== ctx.user._id) throw new Error("Unauthorized");

    const updates: any = { updatedAt: Date.now() };
    

    if (args.personal) updates.personal = { ...profile.personal, ...args.personal };
    if (args.contacts) updates.contacts = { ...profile.contacts, ...args.contacts };
    if (args.family) updates.family = { ...profile.family, ...args.family };
    if (args.professionSituation) updates.professionSituation = { ...profile.professionSituation, ...args.professionSituation };
    

    if (args.emergencyContacts) updates.emergencyContacts = args.emergencyContacts;

    await ctx.db.patch(args.id, updates);
  },
});

export const requestRegistration = authMutation({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consularProfiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) throw new Error("Profile not found");
    if (!profile.isNational) throw new Error("Only nationals can register");


    const existing = profile.registrations?.find((r) => r.orgId === args.orgId);
    if (existing) throw new Error("Already registered or pending with this organization");

    const newRegistration = {
      orgId: args.orgId,
      registrationNumber: "",
      registeredAt: Date.now(),
      status: "pending",
    };

    const registrations = [...(profile.registrations || []), newRegistration];

    await ctx.db.patch(profile._id, {
      registrations,
      updatedAt: Date.now(),
    });
  },
});

export const addDocument = authMutation({
  args: {
    docType: v.string(), 
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consularProfiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const currentDocs = profile.documents || {};

    const currentArray = currentDocs[args.docType as DocTypeKey] || [];


    if (currentArray.includes(args.documentId)) return;

    const newArray = [...currentArray, args.documentId];
    
    await ctx.db.patch(profile._id, {
      documents: {
        ...currentDocs,
        [args.docType]: newArray,
      },
      updatedAt: Date.now(),
    });
  },
});

export const removeDocument = authMutation({
  args: {
    docType: v.string(),
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consularProfiles")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const currentDocs = profile.documents || {};

    const currentArray = currentDocs[args.docType as DocTypeKey] || [];
    const newArray = currentArray.filter((id: any) => id !== args.documentId);

    await ctx.db.patch(profile._id, {
        documents: {
            ...currentDocs,
            [args.docType]: newArray,
        },
        updatedAt: Date.now(),
    });

    const doc = await ctx.db.get(args.documentId);
    if(doc) {
        await ctx.storage.delete(doc.storageId);
        await ctx.db.delete(args.documentId);
    }
  },
});
