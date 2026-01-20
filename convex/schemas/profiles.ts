import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  genderValidator,
  passportInfoValidator,
  addressValidator,
  emergencyContactValidator,
  parentValidator,
  spouseValidator,
} from "../lib/validators";

/**
 * Profiles table - consular data for users
 * One profile per user
 */
export const profilesTable = defineTable({
  userId: v.id("users"),

  // Core identity
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

  // Passport info
  passportInfo: v.optional(passportInfoValidator),

  // Addresses
  addresses: v.object({
    residence: v.optional(addressValidator),
    homeland: v.optional(addressValidator),
  }),

  // Contacts
  contacts: v.object({
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    emergency: v.array(emergencyContactValidator),
  }),

  // Family
  family: v.object({
    maritalStatus: v.string(),
    father: v.optional(parentValidator),
    mother: v.optional(parentValidator),
    spouse: v.optional(spouseValidator),
  }),

  // Profession
  profession: v.optional(
    v.object({
      status: v.string(),
      title: v.optional(v.string()),
      employer: v.optional(v.string()),
    })
  ),

  // Documents
  documents: v.optional(
    v.object({
      passport: v.optional(v.array(v.string())),
      nationalId: v.optional(v.array(v.string())),
      birthCertificate: v.optional(v.array(v.string())),
      residencePermit: v.optional(v.array(v.string())),
      proofOfAddress: v.optional(v.array(v.string())),
      photo: v.optional(v.array(v.string())),
    })
  ),

  // Registrations
  registrations: v.optional(
    v.array(
      v.object({
        orgId: v.id("orgs"),
        status: v.string(),
        registeredAt: v.number(),
        registrationNumber: v.optional(v.string()),
      })
    )
  ),

  // Status
  isNational: v.optional(v.boolean()),

  // Computed (updated via trigger or on save)
  completionScore: v.number(),

  updatedAt: v.optional(v.number()),
}).index("by_user", ["userId"]);
