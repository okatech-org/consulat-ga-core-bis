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
  nationalityAcquisitionValidator,
  publicUserTypeValidator,
} from "../lib/validators";
import { countryCodeValidator } from "../lib/countryCodeValidator";

/**
 * Profiles table - consular data for users
 * One profile per user
 */
export const profilesTable = defineTable({
  userId: v.id("users"),

  // Type d'utilisateur public (détermine les services accessibles)
  userType: v.optional(publicUserTypeValidator),

  // ═══════════════════════════════════════════════════════════════════════════
  // TERRITORIALITÉ
  // ═══════════════════════════════════════════════════════════════════════════

  // Pays de résidence (pour filtrer les services consulaires)
  countryOfResidence: v.optional(countryCodeValidator),

  // Localisation actuelle (si différente de résidence)
  currentLocation: v.optional(countryCodeValidator),

  // Durée du séjour actuel en mois (pour déterminer rattachement vs signalement)
  stayDuration: v.optional(v.number()),

  // Organisation de rattachement (gère les dossiers, résidence >= 6 mois)
  managedByOrgId: v.optional(v.id("orgs")),

  // Organisation de signalement (séjour temporaire < 6 mois)
  signaledToOrgId: v.optional(v.id("orgs")),

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

  // Consular Card - generated upon registration validation
  consularCard: v.optional(
    v.object({
      orgId: v.id("orgs"), // Org that issued the card (for template)
      cardNumber: v.string(), // Format: [CC][YY][DDMMYY]-[NNNNN]
      cardIssuedAt: v.number(), // timestamp
      cardExpiresAt: v.number(), // timestamp (+5 years)
    })
  ),

  documents: v.optional(v.object({
    passport: v.optional(v.id("documents")),
    proofOfAddress: v.optional(v.id("documents")),
    identityPhoto: v.optional(v.id("documents")),
    birthCertificate: v.optional(v.id("documents")),
    proofOfResidency: v.optional(v.id("documents")),
  })),

  // Status
  isNational: v.optional(v.boolean()),

  // Computed (updated via trigger or on save)
  completionScore: v.number(),

  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_card_number", ["consularCard.cardNumber"]);
