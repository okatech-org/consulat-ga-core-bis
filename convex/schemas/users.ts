import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Users table - minimal, synced from Clerk
 * Pas de role global - les rôles sont dans memberships
 */
export const usersTable = defineTable({
  // Auth externe (Clerk)
  externalId: v.string(),

  // Données de base (sync depuis Clerk)
  email: v.string(),
  name: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),

  // Flags système
  isActive: v.boolean(),
  isSuperadmin: v.boolean(),

  // Metadata (pas de _createdAt, utilise _creationTime natif)
  updatedAt: v.optional(v.number()),
})
  .index("by_externalId", ["externalId"])
  .index("by_email", ["email"])
  .searchIndex("search_name", { searchField: "name" });
