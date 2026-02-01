import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * AppointmentSlot - Available time slots for booking
 * These are created by the organization admin to define when appointments can be booked.
 */
export const appointmentSlotsTable = defineTable({
  // Organization that owns this slot
  orgId: v.id("orgs"),
  
  // Optional: restrict slot to specific service
  serviceId: v.optional(v.id("services")),
  
  // Date and time
  date: v.string(), // YYYY-MM-DD format
  startTime: v.string(), // HH:mm format
  endTime: v.string(), // HH:mm format
  
  // Capacity management
  capacity: v.number(), // Max number of appointments for this slot
  bookedCount: v.number(), // Current number booked
  
  // Slot state
  isBlocked: v.boolean(), // If true, slot is unavailable (holiday, absence)
  blockReason: v.optional(v.string()), // Why it's blocked
  
  // Metadata
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_org_date", ["orgId", "date"])
  .index("by_org_service_date", ["orgId", "serviceId", "date"]);

/**
 * Appointment status enum values
 */
export const AppointmentStatus = {
  Confirmed: "confirmed",
  Cancelled: "cancelled",
  Completed: "completed",
  NoShow: "no_show",
  Rescheduled: "rescheduled",
} as const;

export const appointmentStatusValidator = v.union(
  v.literal(AppointmentStatus.Confirmed),
  v.literal(AppointmentStatus.Cancelled),
  v.literal(AppointmentStatus.Completed),
  v.literal(AppointmentStatus.NoShow),
  v.literal(AppointmentStatus.Rescheduled)
);

/**
 * Appointment - A booked appointment by a citizen
 */
export const appointmentsTable = defineTable({
  // Link to the request that triggered this appointment
  requestId: v.optional(v.id("requests")),
  
  // Link to the slot being booked
  slotId: v.id("appointmentSlots"),
  
  // User who booked
  userId: v.id("users"),
  
  // Organization
  orgId: v.id("orgs"),
  
  // Denormalized from slot for easier querying
  date: v.string(), // YYYY-MM-DD
  time: v.string(), // HH:mm
  
  // Status
  status: appointmentStatusValidator,
  
  // Timestamps
  confirmedAt: v.optional(v.number()),
  cancelledAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  reminderSentAt: v.optional(v.number()),
  
  // Notes
  notes: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_org_date", ["orgId", "date"])
  .index("by_slot", ["slotId"])
  .index("by_request", ["requestId"])
  .index("by_user_status", ["userId", "status"]);
