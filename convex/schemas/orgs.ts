import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  orgTypeValidator,
  addressValidator,
  orgSettingsValidator,
  orgStatsValidator,
  countryCodeValidator,
} from "../lib/validators";

/**
 * Organizations table - consulats/ambassades
 */
export const orgsTable = defineTable({
  // Identité
  slug: v.string(),
  name: v.string(),
  type: orgTypeValidator,

  // Localisation
  country: countryCodeValidator,
  timezone: v.string(),
  address: addressValidator,
  jurisdictionCountries: v.optional(v.array(countryCodeValidator)),

  // Contact
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  description: v.optional(v.string()),

  // Logo
  logoUrl: v.optional(v.string()),

  // Config
  settings: v.optional(orgSettingsValidator),

  // Computed (mis à jour par cron)
  stats: v.optional(orgStatsValidator),

  // Status
  isActive: v.boolean(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()), // Soft delete
})
  .index("by_slug", ["slug"])
  .index("by_country", ["country"])
  .index("by_active_notDeleted", ["isActive", "deletedAt"]);
