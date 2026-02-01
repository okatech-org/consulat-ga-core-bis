import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  genderValidator,
  passportInfoValidator,
  addressValidator,
  emergencyContactValidator,
  parentValidator,
  spouseValidator,
  maritalStatusValidator,
  professionValidator,
  countryCodeValidator,
  nationalityAcquisitionValidator,
} from "../lib/validators";

/**
 * Profiles table - consular data for users
 * One profile per user
 */
export const profilesTable = defineTable({
  userId: v.id("users"),

  // Pays de résidence (pour filtrer les services consulaires)
  countryOfResidence: v.optional(countryCodeValidator),

  // Core identity
  identity: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    birthCountry: v.optional(countryCodeValidator),
    gender: v.optional(genderValidator),
    nationality: v.optional(countryCodeValidator),
    nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
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
    phoneAbroad: v.optional(v.string()),
    email: v.optional(v.string()),
    emergencyHomeland: v.optional(emergencyContactValidator),
    emergencyResidence: v.optional(emergencyContactValidator),
    emergency: v.optional(v.any()), // Temporaire pour la migration
  }),

  // Family
  family: v.object({
    maritalStatus: v.optional(maritalStatusValidator),
    father: v.optional(parentValidator),
    mother: v.optional(parentValidator),
    spouse: v.optional(spouseValidator),
  }),

  // Profession
  profession: v.optional(professionValidator),

  // Note: Documents are attached to requests, not profiles
  // They are provided when submitting a service request to justify declared information

  // Registrations
  registrations: v.optional(
    v.array(
      v.object({
        orgId: v.id("orgs"),
        status: v.string(),
        registeredAt: v.number(),
        registrationNumber: v.optional(v.string()),
        requestId: v.optional(v.id("requests")),
      })
    )
  ),

  // Status
  isNational: v.optional(v.boolean()),

  // Computed (updated via trigger or on save)
  completionScore: v.number(),

  updatedAt: v.optional(v.number()),
}).index("by_user", ["userId"]);
