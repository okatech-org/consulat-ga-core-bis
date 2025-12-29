import { defineTable } from "convex/server";
import { v } from "convex/values";
import { orgMemberRoleValidator } from "../lib/types";

export const orgMembersTable = defineTable({
  orgId: v.id("orgs"),
  userId: v.id("users"),
  role: orgMemberRoleValidator,
  joinedAt: v.number(),
})
  .index("by_orgId", ["orgId"])
  .index("by_userId", ["userId"])
  .index("by_orgId_userId", ["orgId", "userId"]);
