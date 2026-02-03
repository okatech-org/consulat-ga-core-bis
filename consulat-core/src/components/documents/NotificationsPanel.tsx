/**
 * Document Notifications Panel
 * Displays expiration alerts and document status notifications
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DocumentNotification } from '@/services/documentNotificationService';
import {
    Bell,
    BellRing,
    X,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Info,
    ChevronRight,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationsPanelProps {
    notifications: DocumentNotification[];
    onNotificationClick?: (notification: DocumentNotification) => void;
    onDismiss?: (notificationId: string) => void;
}

const severityConfig = {
    critical: {
        icon: AlertTriangle,
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        border: 'border-red-500/30',
        iconColor: 'text-red-500',
        dot: 'bg-red-500'
    },
    warning: {
        icon: Clock,
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-500',
        dot: 'bg-amber-500'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-500',
        dot: 'bg-blue-500'
    },
    success: {
        icon: CheckCircle2,
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        border: 'border-green-500/30',
        iconColor: 'text-green-500',
        dot: 'bg-green-500'
    }
};

export const NotificationsPanel = ({
    notifications,
    onNotificationClick,
    onDismiss
}: NotificationsPanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));
    const criticalCount = visibleNotifications.filter(n => n.severity === 'critical').length;
    const warningCount = visibleNotifications.filter(n => n.severity === 'warning').length;

    const handleDismiss = (notifId: string) => {
        setDismissed(prev => new Set([...prev, notifId]));
        onDismiss?.(notifId);
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-colors",
                    isOpen ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
            >
                {visibleNotifications.length > 0 ? (
                    <BellRing className="w-4 h-4" />
                ) : (
                    <Bell className="w-4 h-4" />
                )}

                {/* Badge count */}
                {visibleNotifications.length > 0 && (
                    <span className={cn(
                        "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center",
                        "text-[9px] font-bold rounded-full",
                        criticalCount > 0 ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                    )}>
                        {visibleNotifications.length}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className={cn(
                                "absolute right-0 top-full mt-2 z-50",
                                "w-80 max-h-[400px] overflow-hidden",
                                "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
                                "rounded-2xl shadow-2xl border border-slate-200/50 dark:border-white/10"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <BellRing className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold">Notifications</span>
                                    {visibleNotifications.length > 0 && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {visibleNotifications.length}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-auto max-h-[320px]">
                                {visibleNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                                        <p className="text-sm font-medium">Tout est en ordre !</p>
                                        <p className="text-xs text-muted-foreground">Aucune notification</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                                        {visibleNotifications.map((notif) => {
                                            const config = severityConfig[notif.severity];
                                            const Icon = config.icon;

                                            return (
                                                <motion.div
                                                    key={notif.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className={cn(
                                                        "group relative p-3 cursor-pointer transition-colors",
                                                        "hover:bg-slate-50 dark:hover:bg-white/5"
                                                    )}
                                                    onClick={() => {
                                                        onNotificationClick?.(notif);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <div className="flex gap-3">
                                                        {/* Icon */}
                                                        <div className={cn(
                                                            "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                                                            config.bg
                                                        )}>
                                                            <Icon className={cn("w-4 h-4", config.iconColor)} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-foreground truncate">
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                                                                {notif.message}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    config.dot
                                                                )} />
                                                                <span className="text-[9px] text-muted-foreground">
                                                                    {notif.daysRemaining !== undefined && notif.daysRemaining >= 0
                                                                        ? `${notif.daysRemaining}j restants`
                                                                        : notif.type === 'expired'
                                                                            ? 'Expiré'
                                                                            : 'Maintenant'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Arrow */}
                                                        <ChevronRight className="shrink-0 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>

                                                    {/* Dismiss button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDismiss(notif.id);
                                                        }}
                                                        className={cn(
                                                            "absolute top-2 right-2 p-1 rounded-full",
                                                            "opacity-0 group-hover:opacity-100 transition-opacity",
                                                            "hover:bg-slate-200 dark:hover:bg-white/10"
                                                        )}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Summary Footer */}
                            {visibleNotifications.length > 0 && (
                                <div className="p-3 border-t border-slate-200/50 dark:border-white/10 bg-muted/30">
                                    <div className="flex items-center justify-between text-[10px]">
                                        {criticalCount > 0 && (
                                            <span className="flex items-center gap-1 text-red-500">
                                                <AlertTriangle className="w-3 h-3" />
                                                {criticalCount} urgent{criticalCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {warningCount > 0 && (
                                            <span className="flex items-center gap-1 text-amber-500">
                                                <Clock className="w-3 h-3" />
                                                {warningCount} avertissement{warningCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsPanel;
