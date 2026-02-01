import { v } from "convex/values";
import { authQuery, authMutation } from "../lib/customFunctions";
import { requireOrgAgent } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import { AppointmentStatus, appointmentStatusValidator } from "../schemas/appointments";

/**
 * ============================================================================
 * SLOT MANAGEMENT (Admin)
 * ============================================================================
 */

/**
 * List slots for an organization (admin view)
 */
export const listSlotsByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
    date: v.optional(v.string()), // YYYY-MM-DD
    month: v.optional(v.string()), // YYYY-MM
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    let slots;
    
    if (args.date) {
      // Filter by specific date
      slots = await ctx.db
        .query("appointmentSlots")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId).eq("date", args.date!))
        .collect();
    } else if (args.month) {
      // Filter by month (YYYY-MM)
      const startDate = `${args.month}-01`;
      const [year, month] = args.month.split("-").map(Number);
      const endDate = `${args.month}-${new Date(year, month, 0).getDate()}`;
      
      slots = await ctx.db
        .query("appointmentSlots")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .filter((q) => 
          q.and(
            q.gte(q.field("date"), startDate),
            q.lte(q.field("date"), endDate)
          )
        )
        .collect();
    } else {
      // Get all slots (limit for performance)
      slots = await ctx.db
        .query("appointmentSlots")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .take(500);
    }

    return slots;
  },
});

/**
 * List available slots for booking (public/citizen view)
 */
export const listAvailableSlots = authQuery({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.optional(v.id("services")),
    date: v.optional(v.string()),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // No agent requirement - accessible to citizens
    
    let slots;
    
    if (args.date) {
      slots = await ctx.db
        .query("appointmentSlots")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId).eq("date", args.date!))
        .collect();
    } else if (args.month) {
      const startDate = `${args.month}-01`;
      const [year, month] = args.month.split("-").map(Number);
      const endDate = `${args.month}-${new Date(year, month, 0).getDate()}`;
      
      slots = await ctx.db
        .query("appointmentSlots")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .filter((q) => 
          q.and(
            q.gte(q.field("date"), startDate),
            q.lte(q.field("date"), endDate)
          )
        )
        .collect();
    } else {
      // Default: next 30 days
      const today = new Date().toISOString().split("T")[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      slots = await ctx.db
        .query("appointmentSlots")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .filter((q) => 
          q.and(
            q.gte(q.field("date"), today),
            q.lte(q.field("date"), futureDate)
          )
        )
        .collect();
    }

    // Filter: only available (not blocked and has capacity)
    const availableSlots = slots.filter(slot => 
      !slot.isBlocked && slot.bookedCount < slot.capacity
    );

    // Filter by service if specified
    if (args.serviceId) {
      return availableSlots.filter(slot => 
        slot.serviceId === args.serviceId || slot.serviceId === undefined
      );
    }

    return availableSlots;
  },
});

/**
 * Create a single slot
 */
export const createSlot = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.optional(v.id("services")),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const slotId = await ctx.db.insert("appointmentSlots", {
      orgId: args.orgId,
      serviceId: args.serviceId,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      capacity: args.capacity,
      bookedCount: 0,
      isBlocked: false,
      createdAt: Date.now(),
    });

    return slotId;
  },
});

/**
 * Create multiple slots in bulk (e.g., recurring)
 */
export const createSlotsBulk = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.optional(v.id("services")),
    dates: v.array(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const now = Date.now();
    const slotIds = [];

    for (const date of args.dates) {
      const slotId = await ctx.db.insert("appointmentSlots", {
        orgId: args.orgId,
        serviceId: args.serviceId,
        date,
        startTime: args.startTime,
        endTime: args.endTime,
        capacity: args.capacity,
        bookedCount: 0,
        isBlocked: false,
        createdAt: now,
      });
      slotIds.push(slotId);
    }

    return slotIds;
  },
});

/**
 * Block a slot or date range
 */
export const blockSlot = authMutation({
  args: {
    slotId: v.id("appointmentSlots"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAgent(ctx, slot.orgId);

    await ctx.db.patch(args.slotId, {
      isBlocked: true,
      blockReason: args.reason,
      updatedAt: Date.now(),
    });

    return args.slotId;
  },
});

/**
 * Unblock a slot
 */
export const unblockSlot = authMutation({
  args: {
    slotId: v.id("appointmentSlots"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAgent(ctx, slot.orgId);

    await ctx.db.patch(args.slotId, {
      isBlocked: false,
      blockReason: undefined,
      updatedAt: Date.now(),
    });

    return args.slotId;
  },
});

/**
 * Delete a slot (only if no bookings)
 */
export const deleteSlot = authMutation({
  args: {
    slotId: v.id("appointmentSlots"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAgent(ctx, slot.orgId);

    if (slot.bookedCount > 0) {
      throw error(ErrorCode.SLOT_HAS_BOOKINGS, "Cannot delete slot with existing bookings");
    }

    await ctx.db.delete(args.slotId);
    return true;
  },
});

/**
 * ============================================================================
 * APPOINTMENT BOOKING
 * ============================================================================
 */

/**
 * Book an appointment
 */
export const bookAppointment = authMutation({
  args: {
    slotId: v.id("appointmentSlots"),
    requestId: v.optional(v.id("requests")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw error(ErrorCode.NOT_FOUND);
    }

    if (slot.isBlocked) {
      throw error(ErrorCode.SLOT_NOT_AVAILABLE, "This slot is not available");
    }

    if (slot.bookedCount >= slot.capacity) {
      throw error(ErrorCode.SLOT_FULLY_BOOKED, "This slot is fully booked");
    }

    // Check if user already has appointment for this slot
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_slot", (q) => q.eq("slotId", args.slotId))
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), ctx.user._id),
          q.neq(q.field("status"), AppointmentStatus.Cancelled)
        )
      )
      .first();

    if (existingAppointment) {
      throw error(ErrorCode.APPOINTMENT_ALREADY_EXISTS, "You already have an appointment for this slot");
    }

    const now = Date.now();

    // Create appointment
    const appointmentId = await ctx.db.insert("appointments", {
      slotId: args.slotId,
      requestId: args.requestId,
      userId: ctx.user._id,
      orgId: slot.orgId,
      date: slot.date,
      time: slot.startTime,
      status: AppointmentStatus.Confirmed,
      confirmedAt: now,
      notes: args.notes,
    });

    // Update slot booked count
    await ctx.db.patch(args.slotId, {
      bookedCount: slot.bookedCount + 1,
      updatedAt: now,
    });

    return appointmentId;
  },
});

/**
 * Cancel an appointment (by citizen or agent)
 */
export const cancelAppointment = authMutation({
  args: {
    appointmentId: v.id("appointments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw error(ErrorCode.NOT_FOUND);
    }

    // Check authorization: owner or org agent
    const isOwner = appointment.userId === ctx.user._id;
    if (!isOwner) {
      await requireOrgAgent(ctx, appointment.orgId);
    }

    if (appointment.status === AppointmentStatus.Cancelled) {
      throw error(ErrorCode.APPOINTMENT_ALREADY_CANCELLED, "Appointment is already cancelled");
    }

    const now = Date.now();

    // Update appointment
    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Cancelled,
      cancelledAt: now,
      cancellationReason: args.reason,
    });

    // Decrement slot booked count
    const slot = await ctx.db.get(appointment.slotId);
    if (slot && slot.bookedCount > 0) {
      await ctx.db.patch(appointment.slotId, {
        bookedCount: slot.bookedCount - 1,
        updatedAt: now,
      });
    }

    return args.appointmentId;
  },
});

/**
 * Mark appointment as completed (agent only)
 */
export const completeAppointment = authMutation({
  args: {
    appointmentId: v.id("appointments"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAgent(ctx, appointment.orgId);

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Completed,
      completedAt: Date.now(),
      notes: args.notes ?? appointment.notes,
    });

    return args.appointmentId;
  },
});

/**
 * Mark appointment as no-show (agent only)
 */
export const markNoShow = authMutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw error(ErrorCode.NOT_FOUND);
    }

    await requireOrgAgent(ctx, appointment.orgId);

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.NoShow,
    });

    return args.appointmentId;
  },
});

/**
 * ============================================================================
 * APPOINTMENT QUERIES
 * ============================================================================
 */

/**
 * List appointments for the current user
 */
export const listMyAppointments = authQuery({
  args: {
    status: v.optional(appointmentStatusValidator),
  },
  handler: async (ctx, args) => {
    let appointments;

    if (args.status) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_user_status", (q) => 
          q.eq("userId", ctx.user._id).eq("status", args.status!)
        )
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
        .collect();
    }

    // Enrich with org and slot details
    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const [org, slot] = await Promise.all([
          ctx.db.get(apt.orgId),
          ctx.db.get(apt.slotId),
        ]);

        return {
          ...apt,
          org,
          slot,
          endTime: slot?.endTime,
        };
      })
    );

    return enriched;
  },
});

/**
 * List appointments by day for calendar view (agent)
 */
export const listByDay = authQuery({
  args: {
    orgId: v.id("orgs"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_org_date", (q) => 
        q.eq("orgId", args.orgId).eq("date", args.date)
      )
      .collect();

    // Enrich with user details
    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const [user, slot] = await Promise.all([
          ctx.db.get(apt.userId),
          ctx.db.get(apt.slotId),
        ]);

        return {
          ...apt,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          } : null,
          slot,
          endTime: slot?.endTime,
        };
      })
    );

    // Sort by time
    return enriched.sort((a, b) => a.time.localeCompare(b.time));
  },
});

/**
 * Get appointment by ID
 */
export const getAppointmentById = authQuery({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) return null;

    // Check access: owner or agent
    const isOwner = appointment.userId === ctx.user._id;
    if (!isOwner) {
      await requireOrgAgent(ctx, appointment.orgId);
    }

    const [user, org, slot] = await Promise.all([
      ctx.db.get(appointment.userId),
      ctx.db.get(appointment.orgId),
      ctx.db.get(appointment.slotId),
    ]);

    // Get service if slot has one
    let service = null;
    if (slot?.serviceId) {
      service = await ctx.db.get(slot.serviceId);
    }

    return {
      ...appointment,
      user: user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      } : null,
      org,
      slot,
      service,
      endTime: slot?.endTime,
    };
  },
});

/**
 * List all appointments for an organization (dashboard list view)
 */
export const listAppointmentsByOrg = authQuery({
  args: {
    orgId: v.id("orgs"),
    status: v.optional(appointmentStatusValidator),
    date: v.optional(v.string()),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    let appointments;

    if (args.date) {
      // Filter by specific date
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId).eq("date", args.date!))
        .collect();
    } else if (args.month) {
      // Filter by month
      const startDate = `${args.month}-01`;
      const [year, month] = args.month.split("-").map(Number);
      const endDate = `${args.month}-${new Date(year, month, 0).getDate()}`;
      
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .filter((q) => 
          q.and(
            q.gte(q.field("date"), startDate),
            q.lte(q.field("date"), endDate)
          )
        )
        .collect();
    } else {
      // All appointments (limit for performance)
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .take(200);
    }

    // Filter by status if specified
    if (args.status) {
      appointments = appointments.filter((apt) => apt.status === args.status);
    }

    // Enrich with user and slot details
    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const [user, slot, request] = await Promise.all([
          ctx.db.get(apt.userId),
          ctx.db.get(apt.slotId),
          apt.requestId ? ctx.db.get(apt.requestId) : null,
        ]);

        return {
          ...apt,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          } : null,
          slot,
          request: request ? { _id: request._id, reference: request.reference } : null,
          endTime: slot?.endTime,
        };
      })
    );

    // Sort by date and time descending
    return enriched.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  },
});

/**
 * ============================================================================
 * SLOT GENERATION (Advanced)
 * ============================================================================
 */

/**
 * Generate slots automatically based on parameters
 * This allows creating multiple slots with proper duration and breaks
 */
export const generateSlots = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.optional(v.id("services")),
    dates: v.array(v.string()), // Array of dates (YYYY-MM-DD)
    startHour: v.string(), // Start time of day (HH:MM)
    endHour: v.string(), // End time of day (HH:MM)
    slotDuration: v.number(), // Duration in minutes (15, 30, 45, 60)
    breakDuration: v.optional(v.number()), // Break between slots in minutes
    capacity: v.number(), // Capacity per slot
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const breakMinutes = args.breakDuration ?? 0;
    const slotIds: string[] = [];
    const now = Date.now();

    // Helper to parse time string to minutes since midnight
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Helper to format minutes back to time string
    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    const startMinutes = parseTime(args.startHour);
    const endMinutes = parseTime(args.endHour);

    for (const date of args.dates) {
      let currentMinute = startMinutes;

      while (currentMinute + args.slotDuration <= endMinutes) {
        const startTime = formatTime(currentMinute);
        const endTime = formatTime(currentMinute + args.slotDuration);

        const slotId = await ctx.db.insert("appointmentSlots", {
          orgId: args.orgId,
          serviceId: args.serviceId,
          date,
          startTime,
          endTime,
          capacity: args.capacity,
          bookedCount: 0,
          isBlocked: false,
          createdAt: now,
        });

        slotIds.push(slotId);
        currentMinute += args.slotDuration + breakMinutes;
      }
    }

    return {
      slotsCreated: slotIds.length,
      slotIds,
    };
  },
});
