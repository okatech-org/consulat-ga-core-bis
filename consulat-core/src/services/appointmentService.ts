/**
 * Appointment Service for Consulat.ga-core
 * Enhanced service with availability, participants, and scheduling
 * Migrated from consulat (Next.js/Convex)
 */

import { supabase } from "@/integrations/supabase/client";
import {
    Appointment,
    AppointmentFilters,
    CreateAppointmentDTO,
    UpdateAppointmentDTO,
    RescheduleAppointmentDTO,
    TimeSlot,
    AppointmentParticipant,
    AvailabilityRequest,
} from "@/types/appointment";
import { AppointmentStatus, ParticipantStatus } from "@/lib/constants";

export const appointmentService = {
    // ============================================================================
    // READ OPERATIONS
    // ============================================================================

    async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
        let query = supabase
            .from("appointments")
            .select(`
        *,
        service:consular_services(name, type),
        profile:profiles(first_name, last_name, email, phone),
        organization:organizations(name)
      `)
            .order("start_time", { ascending: true });

        if (filters?.organization_id) {
            query = query.eq("organization_id", filters.organization_id);
        }
        if (filters?.service_id) {
            query = query.eq("service_id", filters.service_id);
        }
        if (filters?.profile_id) {
            query = query.eq("profile_id", filters.profile_id);
        }
        if (filters?.request_id) {
            query = query.eq("request_id", filters.request_id);
        }
        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                query = query.in("status", filters.status);
            } else {
                query = query.eq("status", filters.status);
            }
        }
        if (filters?.type) {
            query = query.eq("type", filters.type);
        }
        if (filters?.from_date) {
            query = query.gte("start_time", filters.from_date);
        }
        if (filters?.to_date) {
            query = query.lte("start_time", filters.to_date);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as unknown as Appointment[];
    },

    async getById(id: string): Promise<Appointment | null> {
        const { data, error } = await supabase
            .from("appointments")
            .select(`
        *,
        service:consular_services(name, type),
        profile:profiles(first_name, last_name, email, phone),
        organization:organizations(name)
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as unknown as Appointment;
    },

    async getUpcoming(filters?: {
        profile_id?: string;
        organization_id?: string;
        limit?: number;
    }): Promise<Appointment[]> {
        const now = new Date().toISOString();
        let query = supabase
            .from("appointments")
            .select(`
        *,
        service:consular_services(name, type),
        profile:profiles(first_name, last_name, email, phone),
        organization:organizations(name)
      `)
            .gte("start_time", now)
            .in("status", [AppointmentStatus.Scheduled, AppointmentStatus.Confirmed, AppointmentStatus.Pending])
            .order("start_time", { ascending: true });

        if (filters?.profile_id) {
            query = query.eq("profile_id", filters.profile_id);
        }
        if (filters?.organization_id) {
            query = query.eq("organization_id", filters.organization_id);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as unknown as Appointment[];
    },

    async getByDate(organizationId: string, date: string): Promise<Appointment[]> {
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;

        const { data, error } = await supabase
            .from("appointments")
            .select(`
        *,
        service:consular_services(name, type),
        profile:profiles(first_name, last_name, email, phone)
      `)
            .eq("organization_id", organizationId)
            .gte("start_time", startOfDay)
            .lte("start_time", endOfDay)
            .order("start_time", { ascending: true });

        if (error) throw error;
        return data as unknown as Appointment[];
    },

    // ============================================================================
    // AVAILABILITY
    // ============================================================================

    async getAvailability(request: AvailabilityRequest): Promise<TimeSlot[]> {
        const { organization_id, date, duration } = request;

        // Get existing appointments for the day
        const existingAppointments = await this.getByDate(organization_id, date);

        // Define working hours (9:00 - 17:00 by default)
        const workingHoursStart = 9 * 60; // minutes from midnight
        const workingHoursEnd = 17 * 60;
        const slotDuration = duration || 30;

        // Generate all possible slots
        const allSlots: TimeSlot[] = [];
        const dateObj = new Date(date);

        for (let minutes = workingHoursStart; minutes + slotDuration <= workingHoursEnd; minutes += slotDuration) {
            const startTime = new Date(dateObj);
            startTime.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + slotDuration);

            allSlots.push({
                startAt: startTime.getTime(),
                endAt: endTime.getTime(),
            });
        }

        // Filter out slots that conflict with existing appointments
        const availableSlots = allSlots.filter((slot) => {
            return !existingAppointments.some((appt) => {
                const apptStart = new Date(appt.start_time).getTime();
                const apptEnd = new Date(appt.end_time).getTime();
                return slot.startAt < apptEnd && slot.endAt > apptStart;
            });
        });

        return availableSlots;
    },

    // ============================================================================
    // CREATE OPERATIONS
    // ============================================================================

    async create(appointment: CreateAppointmentDTO): Promise<Appointment> {
        const participants: AppointmentParticipant[] = (appointment.participants || []).map((p) => ({
            ...p,
            status: ParticipantStatus.Tentative,
        }));

        const { data, error } = await supabase
            .from("appointments")
            .insert({
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                timezone: appointment.timezone || "Europe/Paris",
                type: appointment.type,
                status: AppointmentStatus.Pending,
                organization_id: appointment.organization_id,
                service_id: appointment.service_id,
                request_id: appointment.request_id,
                profile_id: appointment.profile_id,
                participants,
                location: appointment.location,
                notes: appointment.notes,
                actions: [],
            })
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    // ============================================================================
    // UPDATE OPERATIONS
    // ============================================================================

    async update(id: string, updates: UpdateAppointmentDTO): Promise<Appointment> {
        const { data, error } = await supabase
            .from("appointments")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    async updateStatus(id: string, status: AppointmentStatus | string): Promise<Appointment> {
        const { data, error } = await supabase
            .from("appointments")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    // ============================================================================
    // STATUS TRANSITIONS
    // ============================================================================

    async confirm(id: string): Promise<Appointment> {
        return this.updateStatus(id, AppointmentStatus.Confirmed);
    },

    async cancel(id: string, reason?: string, authorId?: string): Promise<Appointment> {
        // First, add the cancel action to the appointment
        const { data: currentAppt, error: fetchError } = await supabase
            .from("appointments")
            .select("actions")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const actions = (currentAppt?.actions as any[]) || [];
        actions.push({
            authorId: authorId || "system",
            type: "cancel",
            date: Date.now(),
            reason,
        });

        const { data, error } = await supabase
            .from("appointments")
            .update({
                status: AppointmentStatus.Cancelled,
                actions,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    async complete(id: string): Promise<Appointment> {
        return this.updateStatus(id, AppointmentStatus.Completed);
    },

    async miss(id: string): Promise<Appointment> {
        return this.updateStatus(id, AppointmentStatus.Missed);
    },

    async reschedule(id: string, dto: RescheduleAppointmentDTO, authorId?: string): Promise<Appointment> {
        const { data: currentAppt, error: fetchError } = await supabase
            .from("appointments")
            .select("actions")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const actions = (currentAppt?.actions as any[]) || [];
        actions.push({
            authorId: authorId || "system",
            type: "reschedule",
            date: Date.now(),
            reason: dto.reason,
        });

        const { data, error } = await supabase
            .from("appointments")
            .update({
                start_time: dto.start_time,
                end_time: dto.end_time,
                status: AppointmentStatus.Rescheduled,
                actions,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    // ============================================================================
    // PARTICIPANTS
    // ============================================================================

    async addParticipant(id: string, participant: Omit<AppointmentParticipant, "status">): Promise<Appointment> {
        const { data: currentAppt, error: fetchError } = await supabase
            .from("appointments")
            .select("participants")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const participants = (currentAppt?.participants as AppointmentParticipant[]) || [];
        participants.push({
            ...participant,
            status: ParticipantStatus.Tentative,
        });

        const { data, error } = await supabase
            .from("appointments")
            .update({ participants })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    async updateParticipantStatus(
        id: string,
        participantId: string,
        status: ParticipantStatus | string
    ): Promise<Appointment> {
        const { data: currentAppt, error: fetchError } = await supabase
            .from("appointments")
            .select("participants")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const participants = (currentAppt?.participants as AppointmentParticipant[]) || [];
        const updatedParticipants = participants.map((p) =>
            p.id === participantId ? { ...p, status } : p
        );

        const { data, error } = await supabase
            .from("appointments")
            .update({ participants: updatedParticipants })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Appointment;
    },

    // ============================================================================
    // DELETE OPERATIONS
    // ============================================================================

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from("appointments").delete().eq("id", id);
        if (error) throw error;
    },
};
