/**
 * Appointment Types for Consulat.ga-core
 * Complete appointment types with participants and scheduling
 * Migrated from consulat (Next.js/Convex)
 */

import {
    AppointmentStatus,
    AppointmentType,
    ParticipantRole,
    ParticipantStatus,
} from '@/lib/constants';
import { Address } from './profile';

// Re-export for convenience
export { AppointmentStatus } from '@/lib/constants';

// ============================================================================
// PARTICIPANT TYPES
// ============================================================================

export interface AppointmentParticipant {
    id: string; // Profile ID or Membership ID
    user_id: string;
    role: ParticipantRole | string;
    status: ParticipantStatus | string;
}

// ============================================================================
// ACTION TYPES (for tracking changes)
// ============================================================================

export interface AppointmentAction {
    authorId: string;
    type: 'cancel' | 'reschedule';
    date: number; // Unix timestamp
    reason?: string;
}

// ============================================================================
// FULL APPOINTMENT TYPE (Enhanced)
// ============================================================================

export interface Appointment {
    id: string;

    // Scheduling
    start_time: string; // ISO timestamp
    end_time: string; // ISO timestamp
    timezone?: string; // e.g., 'Europe/Paris'

    // Type and status
    type?: AppointmentType | string;
    status: AppointmentStatus | string;

    // Relations
    organization_id: string;
    service_id?: string;
    request_id?: string;
    user_id?: string; // Legacy field
    profile_id?: string;

    // Participants
    participants?: AppointmentParticipant[];

    // Location
    location?: Address;

    // Actions history
    actions?: AppointmentAction[];

    // Notes
    notes?: string;

    // Timestamps
    created_at: string;
    updated_at: string;

    // Joined fields (optional, from queries)
    service?: {
        name: string;
        type?: string;
    };
    profile?: {
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
    };
    organization?: {
        name: string;
    };
}

// ============================================================================
// AVAILABILITY TYPES
// ============================================================================

export interface TimeSlot {
    startAt: number; // Unix timestamp
    endAt: number; // Unix timestamp
}

export interface DaySchedule {
    isOpen: boolean;
    slots: {
        start: string; // HH:mm format
        end: string; // HH:mm format
    }[];
}

export interface WeeklySchedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

// ============================================================================
// APPOINTMENT CREATION/UPDATE DTOs
// ============================================================================

export interface CreateAppointmentDTO {
    start_time: string;
    end_time: string;
    timezone?: string;
    type?: AppointmentType | string;
    organization_id: string;
    service_id?: string;
    request_id?: string;
    profile_id?: string;
    participants?: Omit<AppointmentParticipant, 'status'>[];
    location?: Address;
    notes?: string;
}

export interface UpdateAppointmentDTO {
    start_time?: string;
    end_time?: string;
    timezone?: string;
    type?: AppointmentType | string;
    status?: AppointmentStatus | string;
    participants?: AppointmentParticipant[];
    location?: Address;
    notes?: string;
}

export interface RescheduleAppointmentDTO {
    start_time: string;
    end_time: string;
    reason?: string;
}

// ============================================================================
// APPOINTMENT FILTERS
// ============================================================================

export interface AppointmentFilters {
    organization_id?: string;
    service_id?: string;
    request_id?: string;
    profile_id?: string;
    status?: AppointmentStatus | string | (AppointmentStatus | string)[];
    type?: AppointmentType | string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
}

// ============================================================================
// AVAILABILITY REQUEST
// ============================================================================

export interface AvailabilityRequest {
    organization_id: string;
    date: string; // YYYY-MM-DD
    duration: number; // minutes
    service_id?: string;
}
