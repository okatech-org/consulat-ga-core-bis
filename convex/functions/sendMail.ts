/**
 * Send Mail Function
 *
 * Internal messaging system — creates digitalMail records
 * for both sender (in "sent") and recipient (in "inbox").
 * No real email is sent.
 */

import { v } from "convex/values";
import { authMutation } from "../lib/customFunctions";
import { internalMutation } from "../_generated/server";
import {
  mailTypeValidator,
  mailAccountTypeValidator,
  mailSenderTypeValidator,
  letterTypeValidator,
  stampColorValidator,
} from "../lib/validators";
import { MailFolder, MailSenderType } from "../lib/constants";

/**
 * Send an internal message (email or letter).
 * Creates a copy in the sender's "sent" folder and the recipient's "inbox".
 */
export const send = authMutation({
  args: {
    recipientId: v.id("users"),
    accountType: mailAccountTypeValidator,
    type: mailTypeValidator,
    subject: v.string(),
    content: v.string(),
    preview: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          size: v.string(),
          storageId: v.optional(v.id("_storage")),
        }),
      ),
    ),
    // Letter-specific
    letterType: v.optional(letterTypeValidator),
    stampColor: v.optional(stampColorValidator),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sender = ctx.user;

    // Look up recipient for display name
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) {
      throw new Error("Recipient not found");
    }

    const preview =
      args.preview || args.content.substring(0, 120).replace(/\n/g, " ");

    const baseFields = {
      accountType: args.accountType,
      type: args.type,
      subject: args.subject,
      preview,
      content: args.content,
      attachments: args.attachments,
      isRead: false,
      isStarred: false,
      stampColor: args.stampColor,
      letterType: args.letterType,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    // Create in recipient's inbox
    const inboxId = await ctx.db.insert("digitalMail", {
      ...baseFields,
      userId: args.recipientId,
      folder: MailFolder.Inbox,
      sender: {
        name: sender.name || "Utilisateur",
        email: sender.email,
        type: MailSenderType.Citizen,
      },
      recipient: {
        name: recipient.name || "Utilisateur",
        email: recipient.email,
      },
    });

    // Create in sender's sent folder (marked as read)
    await ctx.db.insert("digitalMail", {
      ...baseFields,
      userId: sender._id,
      folder: MailFolder.Sent,
      isRead: true,
      sender: {
        name: sender.name || "Utilisateur",
        email: sender.email,
        type: MailSenderType.Citizen,
      },
      recipient: {
        name: recipient.name || "Utilisateur",
        email: recipient.email,
      },
    });

    return inboxId;
  },
});

/**
 * System send — for admin/system messages to users.
 * Only creates in the recipient's inbox (no sender copy).
 */
export const systemSend = internalMutation({
  args: {
    recipientId: v.id("users"),
    accountType: mailAccountTypeValidator,
    type: mailTypeValidator,
    subject: v.string(),
    content: v.string(),
    preview: v.optional(v.string()),
    senderName: v.string(),
    senderType: v.optional(mailSenderTypeValidator),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          size: v.string(),
          storageId: v.optional(v.id("_storage")),
        }),
      ),
    ),
    // Letter-specific
    letterType: v.optional(letterTypeValidator),
    stampColor: v.optional(stampColorValidator),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const preview =
      args.preview || args.content.substring(0, 120).replace(/\n/g, " ");

    return await ctx.db.insert("digitalMail", {
      userId: args.recipientId,
      accountType: args.accountType,
      type: args.type,
      folder: MailFolder.Inbox,
      sender: {
        name: args.senderName,
        type: args.senderType || MailSenderType.System,
      },
      subject: args.subject,
      preview,
      content: args.content,
      attachments: args.attachments,
      isRead: false,
      isStarred: false,
      stampColor: args.stampColor,
      letterType: args.letterType,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    });
  },
});
