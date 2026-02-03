/**
 * Notification Service for Consulat.ga-core
 * Service for managing user notifications across channels
 * Migrated from consulat (Next.js/Convex)
 */

import { supabase } from "@/integrations/supabase/client";
import { NotificationStatus, NotificationType, NotificationChannel } from "@/lib/constants";

// ============================================================================
// TYPES
// ============================================================================

export interface Notification {
    id: string;
    user_id: string;
    profile_id?: string;
    type: NotificationType | string;
    channel: NotificationChannel | string;
    status: NotificationStatus | string;
    title: string;
    message: string;
    data?: Record<string, any>;
    read_at?: string;
    sent_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateNotificationDTO {
    user_id: string;
    profile_id?: string;
    type: NotificationType | string;
    channel?: NotificationChannel | string;
    title: string;
    message: string;
    data?: Record<string, any>;
}

export interface NotificationFilters {
    user_id?: string;
    profile_id?: string;
    type?: NotificationType | string;
    status?: NotificationStatus | string;
    channel?: NotificationChannel | string;
    unread_only?: boolean;
    limit?: number;
    offset?: number;
}

// ============================================================================
// SERVICE
// ============================================================================

export const notificationService = {
    // ============================================================================
    // READ OPERATIONS
    // ============================================================================

    async getAll(filters?: NotificationFilters): Promise<Notification[]> {
        let query = supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false });

        if (filters?.user_id) {
            query = query.eq("user_id", filters.user_id);
        }
        if (filters?.profile_id) {
            query = query.eq("profile_id", filters.profile_id);
        }
        if (filters?.type) {
            query = query.eq("type", filters.type);
        }
        if (filters?.status) {
            query = query.eq("status", filters.status);
        }
        if (filters?.channel) {
            query = query.eq("channel", filters.channel);
        }
        if (filters?.unread_only) {
            query = query.is("read_at", null);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Notification[];
    },

    async getById(id: string): Promise<Notification | null> {
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as Notification;
    },

    async getForUser(userId: string, options?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> {
        let query = supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (options?.unreadOnly) {
            query = query.is("read_at", null);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Notification[];
    },

    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .is("read_at", null);

        if (error) throw error;
        return count || 0;
    },

    // ============================================================================
    // CREATE OPERATIONS
    // ============================================================================

    async create(notification: CreateNotificationDTO): Promise<Notification> {
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                user_id: notification.user_id,
                profile_id: notification.profile_id,
                type: notification.type,
                channel: notification.channel || NotificationChannel.App,
                status: NotificationStatus.Pending,
                title: notification.title,
                message: notification.message,
                data: notification.data || {},
            })
            .select()
            .single();

        if (error) throw error;
        return data as Notification;
    },

    async createMultiple(notifications: CreateNotificationDTO[]): Promise<Notification[]> {
        const notificationsToInsert = notifications.map((n) => ({
            user_id: n.user_id,
            profile_id: n.profile_id,
            type: n.type,
            channel: n.channel || NotificationChannel.App,
            status: NotificationStatus.Pending,
            title: n.title,
            message: n.message,
            data: n.data || {},
        }));

        const { data, error } = await supabase
            .from("notifications")
            .insert(notificationsToInsert)
            .select();

        if (error) throw error;
        return data as Notification[];
    },

    // ============================================================================
    // UPDATE OPERATIONS
    // ============================================================================

    async markAsRead(id: string): Promise<Notification> {
        const { data, error } = await supabase
            .from("notifications")
            .update({
                read_at: new Date().toISOString(),
                status: NotificationStatus.Read,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Notification;
    },

    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from("notifications")
            .update({
                read_at: new Date().toISOString(),
                status: NotificationStatus.Read,
            })
            .eq("user_id", userId)
            .is("read_at", null);

        if (error) throw error;
    },

    async markAsSent(id: string): Promise<Notification> {
        const { data, error } = await supabase
            .from("notifications")
            .update({
                sent_at: new Date().toISOString(),
                status: NotificationStatus.Sent,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Notification;
    },

    async updateStatus(id: string, status: NotificationStatus | string): Promise<Notification> {
        const { data, error } = await supabase
            .from("notifications")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Notification;
    },

    // ============================================================================
    // DELETE OPERATIONS
    // ============================================================================

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from("notifications").delete().eq("id", id);
        if (error) throw error;
    },

    async deleteAllForUser(userId: string): Promise<void> {
        const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
        if (error) throw error;
    },

    // ============================================================================
    // CONVENIENCE METHODS FOR SPECIFIC NOTIFICATIONS
    // ============================================================================

    async notifyRequestSubmitted(userId: string, profileId: string, requestNumber: string): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.ConsularRegistrationSubmitted,
            title: "Demande soumise",
            message: `Votre demande ${requestNumber} a été soumise avec succès. Vous recevrez une notification lorsqu'elle sera traitée.`,
            data: { requestNumber },
        });
    },

    async notifyRequestValidated(userId: string, profileId: string, requestNumber: string): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.ConsularRegistrationValidated,
            title: "Demande validée",
            message: `Votre demande ${requestNumber} a été validée. Veuillez consulter votre espace pour les prochaines étapes.`,
            data: { requestNumber },
        });
    },

    async notifyRequestRejected(userId: string, profileId: string, requestNumber: string, reason?: string): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.ConsularRegistrationRejected,
            title: "Demande rejetée",
            message: reason
                ? `Votre demande ${requestNumber} a été rejetée: ${reason}`
                : `Votre demande ${requestNumber} a été rejetée. Veuillez consulter votre espace pour plus de détails.`,
            data: { requestNumber, reason },
        });
    },

    async notifyAppointmentConfirmation(
        userId: string,
        profileId: string,
        appointmentDate: string,
        serviceName: string
    ): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.AppointmentConfirmation,
            title: "Rendez-vous confirmé",
            message: `Votre rendez-vous pour "${serviceName}" est confirmé pour le ${appointmentDate}.`,
            data: { appointmentDate, serviceName },
        });
    },

    async notifyAppointmentReminder(
        userId: string,
        profileId: string,
        appointmentDate: string,
        serviceName: string
    ): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.AppointmentReminder,
            title: "Rappel de rendez-vous",
            message: `N'oubliez pas votre rendez-vous pour "${serviceName}" prévu le ${appointmentDate}.`,
            data: { appointmentDate, serviceName },
        });
    },

    async notifyAppointmentCancellation(
        userId: string,
        profileId: string,
        appointmentDate: string,
        serviceName: string,
        reason?: string
    ): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.AppointmentCancellation,
            title: "Rendez-vous annulé",
            message: reason
                ? `Votre rendez-vous pour "${serviceName}" du ${appointmentDate} a été annulé: ${reason}`
                : `Votre rendez-vous pour "${serviceName}" du ${appointmentDate} a été annulé.`,
            data: { appointmentDate, serviceName, reason },
        });
    },

    async notifyConsularCardReady(userId: string, profileId: string): Promise<Notification> {
        return this.create({
            user_id: userId,
            profile_id: profileId,
            type: NotificationType.ConsularCardReady,
            title: "Carte consulaire prête",
            message: "Votre carte consulaire est prête. Vous pouvez venir la récupérer au consulat.",
        });
    },
};
