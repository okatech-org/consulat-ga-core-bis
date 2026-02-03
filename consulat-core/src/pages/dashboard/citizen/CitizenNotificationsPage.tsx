import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useDemo } from '@/contexts/DemoContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function CitizenNotificationsPage() {
  const { currentUser } = useDemo();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useRealtimeNotifications(currentUser?.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">
          Suivez en temps réel l'avancement de vos démarches consulaires
        </p>
      </div>

      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
}
