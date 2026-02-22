/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIGRATION MUTATIONS — Internal endpoints for the ETL migration script
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These mutations are called by `scripts/migrate.ts` via ConvexHttpClient.
 * They perform direct inserts without auth checks (migration-only).
 *
 * ⚠️  DELETE THIS FILE AFTER MIGRATION IS COMPLETE.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Users ────────────────────────────────────────────────────────────────

export const insertUser = mutation({
  args: {
    externalId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.boolean(),
    isSuperadmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      externalId: args.externalId,
      email: args.email,
      name: args.name,
      phone: args.phone,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role as any,
      isActive: args.isActive,
      isSuperadmin: args.isSuperadmin,
      updatedAt: Date.now(),
    });
  },
});

// ─── Organizations ────────────────────────────────────────────────────────

export const insertOrg = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    type: v.string(),
    isActive: v.boolean(),
    jurisdictionCountries: v.array(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if org already exists by slug
    const existing = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("orgs", {
      slug: args.slug,
      name: args.name,
      type: args.type as any,
      isActive: args.isActive,
      jurisdictionCountries: args.jurisdictionCountries as any,
      email: args.email,
      phone: args.phone,
      country: "",
      address: {},
      timezone: "Europe/Paris",
    } as any);
  },
});

// ─── Documents ────────────────────────────────────────────────────────────

export const insertDocument = mutation({
  args: {
    ownerId: v.string(),
    files: v.array(
      v.object({
        storageId: v.string(),
        filename: v.string(),
        mimeType: v.string(),
        sizeBytes: v.number(),
        uploadedAt: v.number(),
      }),
    ),
    documentType: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.string(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ownerId: args.ownerId as any,
      files: args.files as any,
      documentType: args.documentType as any,
      category: args.category as any,
      status: args.status as any,
      label: args.label,
    });
  },
});

// ─── Services (global catalog) ────────────────────────────────────────────

export const insertService = mutation({
  args: {
    slug: v.string(),
    code: v.string(),
    name: v.object({ fr: v.string(), en: v.string() }),
    description: v.object({ fr: v.string(), en: v.string() }),
    category: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if service already exists by code
    const existing = await ctx.db
      .query("services")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("services", {
      slug: args.slug,
      code: args.code,
      name: args.name,
      description: args.description,
      category: args.category as any,
      isActive: args.isActive,
      estimatedDays: 7,
      requiresAppointment: false,
      requiresPickupAppointment: false,
    });
  },
});

// ─── OrgServices ──────────────────────────────────────────────────────────

export const insertOrgService = mutation({
  args: {
    orgId: v.string(),
    serviceId: v.string(),
    isActive: v.boolean(),
    pricing: v.optional(
      v.object({
        amount: v.number(),
        currency: v.string(),
        isFree: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orgServices", {
      orgId: args.orgId as any,
      serviceId: args.serviceId as any,
      isActive: args.isActive,
      pricing: args.pricing as any,
    });
  },
});

// ─── Profiles ─────────────────────────────────────────────────────────────

export const insertProfile = mutation({
  args: {
    userId: v.string(),
    userType: v.string(),
    residenceCountry: v.optional(v.string()),
    identity: v.any(),
    passportInfo: v.optional(v.any()),
    addresses: v.optional(v.any()),
    contacts: v.optional(v.any()),
    family: v.optional(v.any()),
    profession: v.optional(v.any()),
    emergencyContacts: v.optional(v.any()),
    consularCard: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if profile for this user already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId: args.userId as any,
      userType: args.userType as any,
      residenceCountry: args.residenceCountry as any,
      identity: args.identity,
      passportInfo: args.passportInfo,
      addresses: args.addresses,
      contacts: args.contacts,
      family: args.family,
      profession: args.profession,
      emergencyContacts: args.emergencyContacts,
      consularCard: args.consularCard,
      updatedAt: Date.now(),
    } as any);
  },
});

// ─── Positions ────────────────────────────────────────────────────────────

export const insertPosition = mutation({
  args: {
    orgId: v.string(),
    code: v.string(),
    title: v.object({ fr: v.string(), en: v.string() }),
    level: v.number(),
    grade: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if position already exists
    const existing = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) =>
        q.eq("orgId", args.orgId as any).eq("isActive", true),
      )
      .collect();

    const match = existing.find((p) => p.code === args.code);
    if (match) {
      return match._id;
    }

    return await ctx.db.insert("positions", {
      orgId: args.orgId as any,
      code: args.code,
      title: args.title,
      level: args.level,
      grade: args.grade as any,
      isActive: args.isActive,
      isRequired: false,
      tasks: [], // Will be populated by the admin later
    });
  },
});

// ─── Memberships ──────────────────────────────────────────────────────────

export const insertMembership = mutation({
  args: {
    userId: v.string(),
    orgId: v.string(),
    positionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if membership already exists
    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId as any).eq("orgId", args.orgId as any),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("memberships", {
      userId: args.userId as any,
      orgId: args.orgId as any,
      positionId: args.positionId as any,
    });
  },
});

// ─── Requests ─────────────────────────────────────────────────────────────

export const insertRequest = mutation({
  args: {
    reference: v.string(),
    userId: v.string(),
    profileId: v.optional(v.string()),
    orgId: v.string(),
    orgServiceId: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    formData: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("requests", {
      reference: args.reference,
      userId: args.userId as any,
      profileId: args.profileId as any,
      orgId: args.orgId as any,
      orgServiceId: args.orgServiceId as any,
      status: args.status as any,
      priority: args.priority as any,
      formData: args.formData,
      metadata: args.metadata,
    } as any);
  },
});

// ─── Appointments ─────────────────────────────────────────────────────────

export const insertAppointment = mutation({
  args: {
    orgId: v.string(),
    attendeeProfileId: v.string(),
    orgServiceId: v.optional(v.string()),
    agentId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    date: v.string(),
    time: v.string(),
    endTime: v.optional(v.string()),
    status: v.string(),
    appointmentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      orgId: args.orgId as any,
      attendeeProfileId: args.attendeeProfileId as any,
      orgServiceId: args.orgServiceId as any,
      agentId: args.agentId as any,
      requestId: args.requestId as any,
      date: args.date,
      time: args.time,
      endTime: args.endTime,
      status: args.status as any,
      appointmentType: args.appointmentType as any,
    });
  },
});

// ─── Child Profiles ───────────────────────────────────────────────────────

export const insertChildProfile = mutation({
  args: {
    authorUserId: v.string(),
    status: v.string(),
    identity: v.any(),
    passportInfo: v.optional(v.any()),
    parents: v.any(),
    registrationRequestId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("childProfiles", {
      authorUserId: args.authorUserId as any,
      status: args.status as any,
      identity: args.identity,
      passportInfo: args.passportInfo,
      parents: args.parents,
      registrationRequestId: args.registrationRequestId as any,
    } as any);
  },
});
