import { v } from "convex/values";
import { query } from "./_generated/server";
import { authQuery, authMutation } from "./lib/customFunctions";
import { requireOrgAgent } from "./lib/auth";
import { appointmentStatusValidator, AppointmentStatus } from "./lib/types";

/**
 * Book an appointment
 */
export const book = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.optional(v.id("orgServices")),
    requestId: v.optional(v.id("serviceRequests")),
    date: v.string(), 
    startTime: v.string(), 
    endTime: v.string(), 
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {

    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_orgId_date", (q) =>
        q.eq("orgId", args.orgId).eq("date", args.date)
      )
      .collect();

    const conflicting = existingAppointments.find((apt) => {
      if (apt.status === "cancelled") return false;

      return (
        (args.startTime >= apt.startTime && args.startTime < apt.endTime) ||
        (args.endTime > apt.startTime && args.endTime <= apt.endTime) ||
        (args.startTime <= apt.startTime && args.endTime >= apt.endTime)
      );
    });

    if (conflicting) {
      throw new Error("errors.appointments.slotNotAvailable");
    }

    const now = Date.now();
    return await ctx.db.insert("appointments", {
      userId: ctx.user._id,
      orgId: args.orgId,
      serviceId: args.serviceId,
      requestId: args.requestId,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      status: AppointmentStatus.SCHEDULED,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Get appointment by ID
 */
export const getById = query({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) return null;

    const [user, org, service] = await Promise.all([
      ctx.db.get(appointment.userId),
      ctx.db.get(appointment.orgId),
      appointment.serviceId ? ctx.db.get(appointment.serviceId) : null,
    ]);

    return { ...appointment, user, org, service };
  },
});

/**
 * List appointments for current user
 */
export const listByUser = authQuery({
  args: {
    status: v.optional(appointmentStatusValidator),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const filtered = args.status
      ? appointments.filter((a) => a.status === args.status)
      : appointments;


    return await Promise.all(
      filtered.map(async (apt) => {
        const [org, service] = await Promise.all([
          ctx.db.get(apt.orgId),
          apt.serviceId ? ctx.db.get(apt.serviceId) : null, 
        ]);
        return { ...apt, org, service };
      })
    );
  },
});

/**
 * List appointments for an organization
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
    date: v.optional(v.string()),
    status: v.optional(appointmentStatusValidator),
  },
  handler: async (ctx, args) => {
    let appointments;

    if (args.date) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_orgId_date", (q) =>
          q.eq("orgId", args.orgId).eq("date", args.date!)
        )
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
    }

    const filtered = args.status
      ? appointments.filter((a) => a.status === args.status)
      : appointments;


    return await Promise.all(
      filtered.map(async (apt) => {
        const [user, service] = await Promise.all([
          ctx.db.get(apt.userId),
          apt.serviceId ? ctx.db.get(apt.serviceId) : null, 
        ]);
        return { ...apt, user, service };
      })
    );
  },
});

/**
 * Get available time slots for a date
 */
export const listAvailable = query({
  args: {
    orgId: v.id("orgs"),
    date: v.string(),
    duration: v.optional(v.number()), 
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return [];


    const booked = await ctx.db
      .query("appointments")
      .withIndex("by_orgId_date", (q) =>
        q.eq("orgId", args.orgId).eq("date", args.date)
      )
      .collect();

    const activeBookings = booked.filter(
      (a) => a.status !== "cancelled"
    );


    const slots: { startTime: string; endTime: string }[] = [];
    const duration = args.duration ?? 30;
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const endMinute = minute + duration;
        const endHourAdjusted = hour + Math.floor(endMinute / 60);
        const endMinuteAdjusted = endMinute % 60;

        if (endHourAdjusted > endHour) continue;

        const endTime = `${endHourAdjusted.toString().padStart(2, "0")}:${endMinuteAdjusted.toString().padStart(2, "0")}`;


        const isBooked = activeBookings.some((apt) => {
          return (
            (startTime >= apt.startTime && startTime < apt.endTime) ||
            (endTime > apt.startTime && endTime <= apt.endTime)
          );
        });

        if (!isBooked) {
          slots.push({ startTime, endTime });
        }
      }
    }

    return slots;
  },
});

/**
 * Confirm an appointment (org staff)
 */
export const confirm = authMutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("errors.appointments.notFound");
    }

    await requireOrgAgent(ctx, appointment.orgId);

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.CONFIRMED,
      updatedAt: Date.now(),
    });

    return args.appointmentId;
  },
});

/**
 * Cancel an appointment
 */
export const cancel = authMutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);

    if (!appointment) {
      throw new Error("errors.appointments.notFound");
    }


    if (appointment.userId !== ctx.user._id) {

      await requireOrgAgent(ctx, appointment.orgId);
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.CANCELLED,
      updatedAt: Date.now(),
    });

    return args.appointmentId;
  },
});

/**
 * Reschedule an appointment
 */
export const reschedule = authMutation({
  args: {
    appointmentId: v.id("appointments"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);

    if (!appointment) {
      throw new Error("errors.appointments.notFound");
    }

    if (appointment.userId !== ctx.user._id) {
      await requireOrgAgent(ctx, appointment.orgId);
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      throw new Error("errors.appointments.cannotReschedule");
    }


    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_orgId_date", (q) =>
        q.eq("orgId", appointment.orgId).eq("date", args.date)
      )
      .collect();

    const conflicting = existingAppointments.find((apt) => {
      if (apt._id === args.appointmentId) return false;
      if (apt.status === "cancelled") return false;
      return (
        (args.startTime >= apt.startTime && args.startTime < apt.endTime) ||
        (args.endTime > apt.startTime && args.endTime <= apt.endTime)
      );
    });

    if (conflicting) {
      throw new Error("errors.appointments.slotNotAvailable");
    }

    await ctx.db.patch(args.appointmentId, {
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      status: AppointmentStatus.SCHEDULED,
      updatedAt: Date.now(),
    });

    return args.appointmentId;
  },
});

/**
 * Mark appointment as completed
 */
export const complete = authMutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("errors.appointments.notFound");
    }

    await requireOrgAgent(ctx, appointment.orgId);

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.COMPLETED,
      updatedAt: Date.now(),
    });

    return args.appointmentId;
  },
});

/**
 * Mark appointment as no-show
 */
export const markNoShow = authMutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("errors.appointments.notFound");
    }

    await requireOrgAgent(ctx, appointment.orgId);

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.NO_SHOW,
      updatedAt: Date.now(),
    });

    return args.appointmentId;
  },
});
