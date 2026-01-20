import { defineTable } from "convex/server";
import { v } from "convex/values";
import { documentStatusValidator } from "../lib/types";

export const documentsTable = defineTable({
  requestId: v.optional(v.id("serviceRequests")),
  userId: v.id("users"),
  name: v.string(),
  type: v.string(), 
  storageId: v.id("_storage"),
  size: v.number(),
  status: documentStatusValidator,
  rejectionReason: v.optional(v.string()),
  uploadedAt: v.number(),
})
  .index("by_requestId", ["requestId"])
  .index("by_userId", ["userId"]);
