/**
 * Document Notification Service
 * Handles expiration alerts and document status notifications
 */

import { VaultDocument, DocumentCategory, FOLDER_LABELS } from '@/types/document';
import { differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DocumentNotification {
    id: string;
    documentId: string;
    documentName: string;
    folderId: DocumentCategory;
    type: 'expiration_warning' | 'expired' | 'pending_verification' | 'verification_complete';
    severity: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    daysRemaining?: number;
    createdAt: string;
    readAt?: string;
}

// Expiration thresholds for notification
const EXPIRATION_THRESHOLDS = {
    critical: 7,    // 7 days - urgent
    warning: 30,    // 30 days - warning
    info: 90        // 90 days - informational
} as const;

/**
 * Check document expiration and generate notifications
 */
export function checkDocumentExpiration(doc: VaultDocument): DocumentNotification | null {
    // Skip documents that don't expire
    if (!doc.expiration_date) return null;

    const expirationDate = new Date(doc.expiration_date);
    const today = new Date();
    const daysRemaining = differenceInDays(expirationDate, today);

    // Already expired
    if (daysRemaining < 0) {
        return {
            id: `notif-${doc.id}-expired`,
            documentId: doc.id,
            documentName: doc.name,
            folderId: doc.folder_id as DocumentCategory,
            type: 'expired',
            severity: 'critical',
            title: `${doc.name} a expiré`,
            message: `Ce document a expiré le ${format(expirationDate, 'dd MMMM yyyy', { locale: fr })}. Veuillez le renouveler dès que possible.`,
            daysRemaining,
            createdAt: new Date().toISOString()
        };
    }

    // Critical - expires in less than 7 days
    if (daysRemaining <= EXPIRATION_THRESHOLDS.critical) {
        return {
            id: `notif-${doc.id}-critical`,
            documentId: doc.id,
            documentName: doc.name,
            folderId: doc.folder_id as DocumentCategory,
            type: 'expiration_warning',
            severity: 'critical',
            title: `${doc.name} expire bientôt !`,
            message: `Attention ! Ce document expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}. Veuillez prendre les mesures nécessaires.`,
            daysRemaining,
            createdAt: new Date().toISOString()
        };
    }

    // Warning - expires in less than 30 days
    if (daysRemaining <= EXPIRATION_THRESHOLDS.warning) {
        return {
            id: `notif-${doc.id}-warning`,
            documentId: doc.id,
            documentName: doc.name,
            folderId: doc.folder_id as DocumentCategory,
            type: 'expiration_warning',
            severity: 'warning',
            title: `${doc.name} expire dans ${daysRemaining} jours`,
            message: `Ce document expire le ${format(expirationDate, 'dd MMMM yyyy', { locale: fr })}. Pensez à son renouvellement.`,
            daysRemaining,
            createdAt: new Date().toISOString()
        };
    }

    // Info - expires in less than 90 days
    if (daysRemaining <= EXPIRATION_THRESHOLDS.info) {
        const months = Math.ceil(daysRemaining / 30);
        return {
            id: `notif-${doc.id}-info`,
            documentId: doc.id,
            documentName: doc.name,
            folderId: doc.folder_id as DocumentCategory,
            type: 'expiration_warning',
            severity: 'info',
            title: `${doc.name} expire dans ${months} mois`,
            message: `Ce document expire le ${format(expirationDate, 'dd MMMM yyyy', { locale: fr })}.`,
            daysRemaining,
            createdAt: new Date().toISOString()
        };
    }

    return null;
}

/**
 * Generate all notifications for a list of documents
 */
export function generateDocumentNotifications(docs: VaultDocument[]): DocumentNotification[] {
    const notifications: DocumentNotification[] = [];

    for (const doc of docs) {
        // Check expiration
        const expirationNotif = checkDocumentExpiration(doc);
        if (expirationNotif) {
            notifications.push(expirationNotif);
        }

        // Check pending verification
        if (doc.status === 'pending') {
            notifications.push({
                id: `notif-${doc.id}-pending`,
                documentId: doc.id,
                documentName: doc.name,
                folderId: doc.folder_id as DocumentCategory,
                type: 'pending_verification',
                severity: 'info',
                title: `${doc.name} en attente de vérification`,
                message: 'Ce document est en cours de vérification par nos services.',
                createdAt: new Date().toISOString()
            });
        }

        // Check rejected documents
        if (doc.status === 'rejected') {
            notifications.push({
                id: `notif-${doc.id}-rejected`,
                documentId: doc.id,
                documentName: doc.name,
                folderId: doc.folder_id as DocumentCategory,
                type: 'pending_verification',
                severity: 'critical',
                title: `${doc.name} a été rejeté`,
                message: 'Ce document n\'a pas été validé. Veuillez le soumettre à nouveau.',
                createdAt: new Date().toISOString()
            });
        }
    }

    // Sort by severity (critical first) then by date
    return notifications.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Get notification statistics
 */
export function getNotificationStats(notifications: DocumentNotification[]): {
    total: number;
    critical: number;
    warning: number;
    info: number;
    expired: number;
    expiringThisMonth: number;
} {
    return {
        total: notifications.length,
        critical: notifications.filter(n => n.severity === 'critical').length,
        warning: notifications.filter(n => n.severity === 'warning').length,
        info: notifications.filter(n => n.severity === 'info').length,
        expired: notifications.filter(n => n.type === 'expired').length,
        expiringThisMonth: notifications.filter(n =>
            n.type === 'expiration_warning' &&
            n.daysRemaining !== undefined &&
            n.daysRemaining <= 30 &&
            n.daysRemaining >= 0
        ).length
    };
}

export default {
    checkDocumentExpiration,
    generateDocumentNotifications,
    getNotificationStats,
    EXPIRATION_THRESHOLDS
};
