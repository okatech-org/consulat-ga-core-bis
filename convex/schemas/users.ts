import { defineTable } from "convex/server";
import { v } from "convex/values";
import { addressValidator, userRoleValidator, countyCodeValidator } from "../lib/types";

export const usersTable = defineTable({
  clerkId: v.string(),
  email: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  nationality: v.optional(countyCodeValidator),
  residenceCountry: v.optional(countyCodeValidator),
  address: v.optional(addressValidator),
  profileImageUrl: v.optional(v.string()),
  role: v.optional(userRoleValidator),
  isVerified: v.boolean(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_role", ["role"])
  .index("by_isActive", ["isActive"])
  .index("by_residenceCountry", ["residenceCountry"]);
