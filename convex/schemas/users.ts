import { defineTable } from "convex/server";
import { v } from "convex/values";
import { addressValidator, userRoleValidator, UserRole } from "../lib/types";

export const usersTable = defineTable({
  clerkId: v.string(),
  email: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  nationality: v.optional(v.string()),
  residenceCountry: v.optional(v.string()),
  address: v.optional(addressValidator),
  profileImageUrl: v.optional(v.string()),
  role: v.optional(userRoleValidator), // defaults to "user"
  isVerified: v.boolean(),
  isActive: v.boolean(), // soft delete flag
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_role", ["role"])
  .index("by_isActive", ["isActive"])
  .index("by_residenceCountry", ["residenceCountry"]);
