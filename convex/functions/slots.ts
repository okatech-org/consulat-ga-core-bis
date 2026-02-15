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
    agentId: v.optional(v.id("users")), // Filter by agent
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

    // Filter by agent if specified
    if (args.agentId) {
      slots = slots.filter(slot => slot.agentId === args.agentId);
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
    orgServiceId: v.optional(v.id("orgServices")),
    agentId: v.optional(v.id("users")),
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

    // Filter by orgService if specified
    if (args.orgServiceId) {
      return availableSlots.filter(slot =>
        slot.orgServiceId === args.orgServiceId || slot.orgServiceId === undefined
      );
    }

    // Filter by agent if specified
    if (args.agentId) {
      return availableSlots.filter(slot =>
        slot.agentId === args.agentId || slot.agentId === undefined
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
    agentId: v.optional(v.id("users")),
    orgServiceId: v.optional(v.id("orgServices")),
    serviceId: v.optional(v.id("services")),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    capacity: v.number(),
    durationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const slotId = await ctx.db.insert("appointmentSlots", {
      orgId: args.orgId,
      agentId: args.agentId,
      orgServiceId: args.orgServiceId,
      serviceId: args.serviceId,
      durationMinutes: args.durationMinutes,
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
    agentId: v.optional(v.id("users")),
    orgServiceId: v.optional(v.id("orgServices")),
    serviceId: v.optional(v.id("services")),
    dates: v.array(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    capacity: v.number(),
    durationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOrgAgent(ctx, args.orgId);

    const now = Date.now();
    const slotIds = [];

    for (const date of args.dates) {
      const slotId = await ctx.db.insert("appointmentSlots", {
        orgId: args.orgId,
        agentId: args.agentId,
        orgServiceId: args.orgServiceId,
        serviceId: args.serviceId,
        durationMinutes: args.durationMinutes,
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

    // Create appointment with denormalized agent/service/duration
    const appointmentId = await ctx.db.insert("appointments", {
      slotId: args.slotId,
      requestId: args.requestId,
      userId: ctx.user._id,
      orgId: slot.orgId,
      agentId: slot.agentId,
      orgServiceId: slot.orgServiceId,
      durationMinutes: slot.durationMinutes,
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

    // Decrement slot booked count (legacy slot-based appointments)
    if (appointment.slotId) {
      const slot = await ctx.db.get(appointment.slotId);
      if (slot && slot.bookedCount > 0) {
        await ctx.db.patch(appointment.slotId, {
          bookedCount: slot.bookedCount - 1,
          updatedAt: now,
        });
      }
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
          apt.slotId ? ctx.db.get(apt.slotId) : null,
        ]);

        return {
          ...apt,
          org,
          slot,
          endTime: apt.endTime ?? slot?.endTime,
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
          apt.slotId ? ctx.db.get(apt.slotId) : null,
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
          endTime: apt.endTime ?? slot?.endTime,
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
      appointment.slotId ? ctx.db.get(appointment.slotId) : null,
    ]);

    // Get service: from appointment.orgServiceId or from legacy slot.serviceId
    let service = null;
    if (appointment.orgServiceId) {
      const orgSvc = await ctx.db.get(appointment.orgServiceId);
      if (orgSvc) service = await ctx.db.get(orgSvc.serviceId);
    } else if (slot?.serviceId) {
      service = await ctx.db.get(slot.serviceId as any);
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
      endTime: appointment.endTime ?? slot?.endTime,
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
          apt.slotId ? ctx.db.get(apt.slotId) : null,
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
          endTime: apt.endTime ?? slot?.endTime,
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
    agentId: v.optional(v.id("users")),
    orgServiceId: v.optional(v.id("orgServices")),
    serviceId: v.optional(v.id("services")),
    dates: v.array(v.string()), // Array of dates (YYYY-MM-DD)
    startHour: v.string(), // Start time of day (HH:MM)
    endHour: v.string(), // End time of day (HH:MM)
    slotDuration: v.number(), // Duration in minutes (5, 10, 15, 20, 30, 45, 60)
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
          agentId: args.agentId,
          orgServiceId: args.orgServiceId,
          serviceId: args.serviceId,
          durationMinutes: args.slotDuration,
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

/**
 * Generate slots from an agent's schedule template
 * Reads the agent's agentSchedule and creates concrete slots for a date range
 */
export const generateSlotsFromSchedule = authMutation({
  args: {
    scheduleId: v.id("agentSchedules"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
    durationMinutes: v.number(), // Slot duration to use
    breakMinutes: v.optional(v.number()), // Break between slots
    capacity: v.optional(v.number()), // Capacity per slot (default: 1)
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw error(ErrorCode.NOT_FOUND, "Schedule not found");
    }

    await requireOrgAgent(ctx, schedule.orgId);

    if (!schedule.isActive) {
      throw error(ErrorCode.VALIDATION_ERROR, "Schedule is not active");
    }

    const breakMins = args.breakMinutes ?? 0;
    const capacity = args.capacity ?? 1;
    const slotIds: string[] = [];
    const now = Date.now();

    // Map day names to JS day numbers (0=Sunday ... 6=Saturday)
    const dayNameToNumber: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const dayNumberToName: Record<number, string> = {};
    for (const [name, num] of Object.entries(dayNameToNumber)) {
      dayNumberToName[num] = name;
    }

    // Build a map of day -> timeRanges from the weekly schedule
    const scheduleByDay: Record<string, { start: string; end: string }[]> = {};
    for (const entry of schedule.weeklySchedule) {
      scheduleByDay[entry.day] = entry.timeRanges;
    }

    // Build exceptions map
    const exceptionsByDate: Record<string, typeof schedule.exceptions extends (infer T)[] | undefined ? T : never> = {};
    for (const exc of schedule.exceptions ?? []) {
      exceptionsByDate[exc.date] = exc;
    }

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

    // Iterate through each date in the range
    const start = new Date(args.startDate + "T00:00:00");
    const end = new Date(args.endDate + "T00:00:00");

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      const dayName = dayNumberToName[dayOfWeek];

      // Check for exceptions
      const exception = exceptionsByDate[dateStr];
      if (exception && !exception.available) {
        // Day off — skip
        continue;
      }

      // Get time ranges: use exception's custom hours if available, otherwise weekly template
      const timeRanges = exception?.timeRanges ?? scheduleByDay[dayName];
      if (!timeRanges || timeRanges.length === 0) {
        continue;
      }

      // Generate slots for each time range
      for (const range of timeRanges) {
        const startMinutes = parseTime(range.start);
        const endMinutes = parseTime(range.end);
        let currentMinute = startMinutes;

        while (currentMinute + args.durationMinutes <= endMinutes) {
          const startTime = formatTime(currentMinute);
          const endTime = formatTime(currentMinute + args.durationMinutes);

          const slotId = await ctx.db.insert("appointmentSlots", {
            orgId: schedule.orgId,
            agentId: schedule.agentId,
            orgServiceId: schedule.orgServiceId,
            durationMinutes: args.durationMinutes,
            date: dateStr,
            startTime,
            endTime,
            capacity,
            bookedCount: 0,
            isBlocked: false,
            createdAt: now,
          });

          slotIds.push(slotId);
          currentMinute += args.durationMinutes + breakMins;
        }
      }
    }

    return {
      slotsCreated: slotIds.length,
      slotIds,
    };
  },
});

/**
 * ============================================================================
 * DYNAMIC SLOT COMPUTATION (No pre-generated slots needed)
 * ============================================================================
 */

// --- Helpers for time manipulation ---

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Compute available appointment slots dynamically for a given date.
 * 
 * Algorithm:
 * 1. Get org opening hours for the requested day
 * 2. Get all active agent schedules for the org
 * 3. Get slot duration from orgService config
 * 4. For each agent: intersect(openingHours, agentSchedule) → time ranges
 * 5. Generate possible slots from time ranges
 * 6. Subtract already-booked appointments
 * 7. Aggregate across agents → return slots with available count
 */
export const computeAvailableSlots = authQuery({
  args: {
    orgId: v.id("orgs"),
    orgServiceId: v.id("orgServices"),
    date: v.string(), // YYYY-MM-DD
    appointmentType: v.optional(v.union(v.literal("deposit"), v.literal("pickup"))),
  },
  handler: async (ctx, args) => {
    const appointmentType = args.appointmentType ?? "deposit";
    
    // 1. Get org and opening hours
    const org = await ctx.db.get(args.orgId);
    if (!org) return [];
    
    // 2. Get orgService config (duration, break, capacity)
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) return [];
    
    // Determine duration based on appointment type
    const slotDuration = appointmentType === "pickup"
      ? (orgService.pickupAppointmentDurationMinutes ?? orgService.appointmentDurationMinutes ?? 30)
      : (orgService.appointmentDurationMinutes ?? 30);
    
    const breakMinutes = appointmentType === "pickup"
      ? (orgService.pickupAppointmentBreakMinutes ?? orgService.appointmentBreakMinutes ?? 0)
      : (orgService.appointmentBreakMinutes ?? 0);
    
    const maxCapacity = orgService.appointmentCapacity ?? 1;
    
    // 3. Get the day of week for the requested date
    const dateObj = new Date(args.date + "T00:00:00");
    const dayOfWeek = dateObj.getDay(); // 0=Sunday
    const dayName = DAY_NAMES[dayOfWeek];
    
    // 4. Get org opening hours for this day
    const openingHours = org.openingHours as Record<string, { open?: string; close?: string; closed?: boolean }> | undefined;
    const dayHours = openingHours?.[dayName];
    
    if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) {
      return [];
    }
    
    const orgOpenMinutes = parseTimeToMinutes(dayHours.open);
    const orgCloseMinutes = parseTimeToMinutes(dayHours.close);
    
    // 5. Get all active agent schedules for this org
    const agentSchedules = await ctx.db
      .query("agentSchedules")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Filter schedules: unscoped (available for all services) or matching this orgService
    const relevantSchedules = agentSchedules.filter(
      (s) => !s.orgServiceId || s.orgServiceId === args.orgServiceId,
    );
    
    if (relevantSchedules.length === 0) return [];
    
    // 6. For each agent, compute their available time ranges for this date
    type AgentTimeRange = { agentId: string; start: number; end: number };
    const agentRanges: AgentTimeRange[] = [];
    
    for (const schedule of relevantSchedules) {
      // Check for exceptions on this date
      const exception = schedule.exceptions?.find((e) => e.date === args.date);
      if (exception && !exception.available) continue;
      
      // Get time ranges: exception override or weekly template
      const dayEntry = schedule.weeklySchedule.find((e) => e.day === dayName);
      const timeRanges = exception?.timeRanges ?? dayEntry?.timeRanges;
      if (!timeRanges || timeRanges.length === 0) continue;
      
      // Intersect each agent range with org opening hours
      for (const range of timeRanges) {
        const agentStart = parseTimeToMinutes(range.start);
        const agentEnd = parseTimeToMinutes(range.end);
        const intersectStart = Math.max(agentStart, orgOpenMinutes);
        const intersectEnd = Math.min(agentEnd, orgCloseMinutes);
        
        if (intersectStart < intersectEnd) {
          agentRanges.push({
            agentId: schedule.agentId as string,
            start: intersectStart,
            end: intersectEnd,
          });
        }
      }
    }
    
    if (agentRanges.length === 0) return [];
    
    // 7. Generate all possible time slots from agent ranges
    // startTime → Set of agentIds that can serve at that time
    const slotAgents = new Map<string, Set<string>>();
    
    for (const range of agentRanges) {
      let current = range.start;
      while (current + slotDuration <= range.end) {
        const startTime = minutesToTimeString(current);
        if (!slotAgents.has(startTime)) {
          slotAgents.set(startTime, new Set());
        }
        slotAgents.get(startTime)!.add(range.agentId);
        current += slotDuration + breakMinutes;
      }
    }
    
    // 8. Get existing appointments for this date (exclude cancelled)
    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId).eq("date", args.date))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
    
    // Build map: agentId → Set of startTimes they are booked for
    const bookedByAgent = new Map<string, Set<string>>();
    for (const apt of existingAppointments) {
      if (!apt.agentId) continue;
      const agentId = apt.agentId as string;
      if (!bookedByAgent.has(agentId)) {
        bookedByAgent.set(agentId, new Set());
      }
      bookedByAgent.get(agentId)!.add(apt.time);
    }
    
    // 9. Compute final available slots
    const result: { startTime: string; endTime: string; availableCount: number }[] = [];
    const sortedStartTimes = [...slotAgents.keys()].sort();
    
    for (const startTime of sortedStartTimes) {
      const agents = slotAgents.get(startTime)!;
      let availableCount = 0;
      
      for (const agentId of agents) {
        const agentBookings = bookedByAgent.get(agentId);
        if (!agentBookings || !agentBookings.has(startTime)) {
          availableCount++;
        }
      }
      
      // Respect max capacity per slot
      availableCount = Math.min(availableCount, maxCapacity);
      
      if (availableCount > 0) {
        const endMinutes = parseTimeToMinutes(startTime) + slotDuration;
        result.push({
          startTime,
          endTime: minutesToTimeString(endMinutes),
          availableCount,
        });
      }
    }
    
    return result;
  },
});

/**
 * Compute which dates in a month have at least one available slot.
 * Used by the frontend calendar to highlight bookable days.
 */
export const computeAvailableDates = authQuery({
  args: {
    orgId: v.id("orgs"),
    orgServiceId: v.id("orgServices"),
    month: v.string(), // YYYY-MM
    appointmentType: v.optional(v.union(v.literal("deposit"), v.literal("pickup"))),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return [];
    
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) return [];
    
    const openingHours = org.openingHours as Record<string, { open?: string; close?: string; closed?: boolean }> | undefined;
    if (!openingHours) return [];

    // Get all active agent schedules
    const agentSchedules = await ctx.db
      .query("agentSchedules")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const relevantSchedules = agentSchedules.filter(
      (s) => !s.orgServiceId || s.orgServiceId === args.orgServiceId,
    );
    
    if (relevantSchedules.length === 0) return [];
    
    // Iterate all dates in the month
    const [year, month] = args.month.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date().toISOString().split("T")[0];
    
    const availableDates: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (dateStr < today) continue;
      
      const dateObj = new Date(dateStr + "T00:00:00");
      const dayOfWeek = dateObj.getDay();
      const dayName = DAY_NAMES[dayOfWeek];
      
      // Check if org is open this day
      const dayHours = openingHours[dayName];
      if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) continue;
      
      // Check if at least one agent has availability
      const hasAgent = relevantSchedules.some((schedule) => {
        const exception = schedule.exceptions?.find((e) => e.date === dateStr);
        if (exception && !exception.available) return false;
        const dayEntry = schedule.weeklySchedule.find((e) => e.day === dayName);
        const timeRanges = exception?.timeRanges ?? dayEntry?.timeRanges;
        return timeRanges && timeRanges.length > 0;
      });
      
      if (hasAgent) {
        availableDates.push(dateStr);
      }
    }
    
    return availableDates;
  },
});

/**
 * Book an appointment dynamically (no pre-generated slot needed).
 * Verifies availability in real time, auto-assigns an available agent, creates the appointment record.
 */
export const bookDynamicAppointment = authMutation({
  args: {
    orgId: v.id("orgs"),
    orgServiceId: v.id("orgServices"),
    date: v.string(), // YYYY-MM-DD
    startTime: v.string(), // HH:mm
    appointmentType: v.optional(v.union(v.literal("deposit"), v.literal("pickup"))),
    requestId: v.optional(v.id("requests")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointmentType = args.appointmentType ?? "deposit";
    
    const org = await ctx.db.get(args.orgId);
    if (!org) throw error(ErrorCode.NOT_FOUND, "Organization not found");
    
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) throw error(ErrorCode.SERVICE_NOT_FOUND);
    
    // Get duration
    const slotDuration = appointmentType === "pickup"
      ? (orgService.pickupAppointmentDurationMinutes ?? orgService.appointmentDurationMinutes ?? 30)
      : (orgService.appointmentDurationMinutes ?? 30);

    const maxCapacity = orgService.appointmentCapacity ?? 1;
    
    // Validate against org opening hours
    const dateObj = new Date(args.date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    const dayName = DAY_NAMES[dayOfWeek];
    
    const openingHours = org.openingHours as Record<string, { open?: string; close?: string; closed?: boolean }> | undefined;
    const dayHours = openingHours?.[dayName];
    
    if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) {
      throw error(ErrorCode.SLOT_NOT_AVAILABLE, "Organization is closed on this day");
    }
    
    const requestedStart = parseTimeToMinutes(args.startTime);
    const requestedEnd = requestedStart + slotDuration;
    const orgOpen = parseTimeToMinutes(dayHours.open);
    const orgClose = parseTimeToMinutes(dayHours.close);
    
    if (requestedStart < orgOpen || requestedEnd > orgClose) {
      throw error(ErrorCode.SLOT_NOT_AVAILABLE, "Requested time is outside opening hours");
    }
    
    // Find agents available at this time
    const agentSchedules = await ctx.db
      .query("agentSchedules")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const relevantSchedules = agentSchedules.filter(
      (s) => !s.orgServiceId || s.orgServiceId === args.orgServiceId,
    );
    
    const availableAgentIds: string[] = [];
    
    for (const schedule of relevantSchedules) {
      const exception = schedule.exceptions?.find((e) => e.date === args.date);
      if (exception && !exception.available) continue;
      
      const dayEntry = schedule.weeklySchedule.find((e) => e.day === dayName);
      const timeRanges = exception?.timeRanges ?? dayEntry?.timeRanges;
      if (!timeRanges) continue;
      
      const coversTime = timeRanges.some((range) => {
        const start = parseTimeToMinutes(range.start);
        const end = parseTimeToMinutes(range.end);
        return requestedStart >= start && requestedEnd <= end;
      });
      
      if (coversTime) {
        availableAgentIds.push(schedule.agentId as string);
      }
    }
    
    if (availableAgentIds.length === 0) {
      throw error(ErrorCode.SLOT_NOT_AVAILABLE, "No agents available at this time");
    }
    
    // Check existing bookings at this time
    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_org_date", (q) => q.eq("orgId", args.orgId).eq("date", args.date))
      .filter((q) =>
        q.and(
          q.eq(q.field("time"), args.startTime),
          q.neq(q.field("status"), "cancelled"),
        ),
      )
      .collect();
    
    // Check if user already has an appointment at this time
    if (existingAppointments.some((apt) => apt.userId === ctx.user._id)) {
      throw error(ErrorCode.APPOINTMENT_ALREADY_EXISTS, "You already have an appointment at this time");
    }
    
    // Check overall capacity
    if (existingAppointments.length >= maxCapacity * availableAgentIds.length) {
      throw error(ErrorCode.SLOT_FULLY_BOOKED, "This slot is fully booked");
    }
    
    // Find an unbooked agent
    const bookedAgentIds = new Set(
      existingAppointments.filter((apt) => apt.agentId).map((apt) => apt.agentId as string),
    );
    
    const assignedAgentId = availableAgentIds.find((id) => !bookedAgentIds.has(id));
    if (!assignedAgentId) {
      throw error(ErrorCode.SLOT_FULLY_BOOKED, "All agents are booked at this time");
    }
    
    const now = Date.now();
    const endTime = minutesToTimeString(requestedEnd);
    
    // Create the appointment
    const appointmentId = await ctx.db.insert("appointments", {
      requestId: args.requestId,
      userId: ctx.user._id,
      orgId: args.orgId,
      agentId: assignedAgentId as any,
      orgServiceId: args.orgServiceId,
      appointmentType,
      date: args.date,
      time: args.startTime,
      endTime,
      durationMinutes: slotDuration,
      status: AppointmentStatus.Confirmed,
      confirmedAt: now,
      notes: args.notes,
    });
    
    // Update request with appointment date if linked
    if (args.requestId) {
      const dateTimestamp = new Date(`${args.date}T${args.startTime}:00`).getTime();
      await ctx.db.patch(args.requestId, {
        appointmentDate: dateTimestamp,
        updatedAt: now,
      });
    }
    
    return appointmentId;
  },
});
