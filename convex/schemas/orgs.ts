import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  orgTypeValidator,
  addressValidator,
  openingHoursValidator,
} from "../lib/types";

export const orgsTable = defineTable({
  name: v.string(),
  slug: v.string(),
  type: orgTypeValidator,
  address: addressValidator,
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
  timezone: v.optional(v.string()),
  openingHours: v.optional(openingHoursValidator),
  logoUrl: v.optional(v.string()),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_country", ["address.country"])
  .index("by_type", ["type"])
  .index("by_isActive", ["isActive"]);
