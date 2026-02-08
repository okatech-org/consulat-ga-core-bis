/**
 * Digital Mail Schema
 *
 * Internal messaging system (iBoîte) for letters and emails.
 * All messages stay within the app — no real email delivery.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  mailTypeValidator,
  mailFolderValidator,
  mailAccountTypeValidator,
  mailSenderValidator,
  mailRecipientValidator,
  mailAttachmentValidator,
  letterTypeValidator,
  stampColorValidator,
} from "../lib/validators";

export const digitalMailTable = defineTable({
  // Owner
  userId: v.id("users"),
  accountType: mailAccountTypeValidator,

  // Mail classification
  type: mailTypeValidator,
  folder: mailFolderValidator,

  // Sender & recipient
  sender: mailSenderValidator,
  recipient: v.optional(mailRecipientValidator),

  // Content
  subject: v.string(),
  preview: v.optional(v.string()),
  content: v.string(),
  attachments: v.optional(v.array(mailAttachmentValidator)),

  // Status
  isRead: v.boolean(),
  isStarred: v.boolean(),

  // Letter-specific fields
  stampColor: v.optional(stampColorValidator),
  letterType: v.optional(letterTypeValidator),
  dueDate: v.optional(v.number()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_folder", ["userId", "folder"])
  .index("by_user_unread", ["userId", "isRead"]);
