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
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.number(),
    birthPlace: v.string(),
    birthCountry: v.string(),
    gender: genderValidator,
    nationality: v.string(),
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

  // Computed (updated via trigger or on save)
  completionScore: v.number(),

  updatedAt: v.optional(v.number()),
}).index("by_user", ["userId"]);
