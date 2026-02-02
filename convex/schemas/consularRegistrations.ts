import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  registrationDurationValidator,
  registrationTypeValidator,
  registrationStatusValidator,
} from "../lib/validators";

/**
 * Consular Registrations table - tracks consular inscriptions per organization
 * Replaces the embedded registrations[] array in profiles
 */
export const consularRegistrationsTable = defineTable({
  profileId: v.id("profiles"),
  orgId: v.id("orgs"),
  requestId: v.id("requests"),

  // Duration of stay
  duration: registrationDurationValidator,

  // Type of operation
  type: registrationTypeValidator,

  // Status (denormalized for efficient queries)
  status: registrationStatusValidator,

  // Dates
  registeredAt: v.number(),
  activatedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),

  // Card info (only for permanent duration)
  cardNumber: v.optional(v.string()),
  cardIssuedAt: v.optional(v.number()),
  cardExpiresAt: v.optional(v.number()),

  // EasyCard integration
  isPrinted: v.optional(v.boolean()),
  printedAt: v.optional(v.number()),
})
  // Composite index covers by_org queries (prefix matching)
  .index("by_org_status", ["orgId", "status"])
  .index("by_profile", ["profileId"])
  .index("by_request", ["requestId"])
  // For EasyCard: find active cards not yet printed
  .index("by_status_printed", ["status", "isPrinted"]);
