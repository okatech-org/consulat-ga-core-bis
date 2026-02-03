import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, CheckCircle2, Clock, AlertCircle, Calendar, 
  FileText, Mail, Smartphone, X, Check, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  channel: 'app' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  title: string;
  message: string;
  request_id?: string;
  appointment_id?: string;
  created_at: string;
  read_at?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  'appointment_confirmation': { icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
  'appointment_reminder': { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'appointment_cancellation': { icon: X, color: 'text-red-600', bgColor: 'bg-red-100' },
  'consular_registration_submitted': { icon: FileText, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  'consular_registration_validated': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  'consular_registration_rejected': { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  'consular_card_ready': { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  'updated': { icon: Bell, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'reminder': { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  'confirmation': { icon: Check, color: 'text-green-600', bgColor: 'bg-green-100' },
  'communication': { icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  'important_communication': { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
};

const CHANNEL_ICONS = {
  'app': Bell,
  'email': Mail,
  'sms': Smartphone,
};

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete 
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => n.status !== 'read').length;
  const readNotifications = notifications.filter(n => n.status === 'read');
  const unreadNotifications = notifications.filter(n => n.status !== 'read');

  const filteredNotifications = activeTab === 'unread' 
    ? unreadNotifications 
    : activeTab === 'read' 
    ? readNotifications 
    : notifications;

  return (
    <Card className="neu-raised">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Restez informé de l'avancement de vos démarches
              </CardDescription>
            </div>
          </div>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">Toutes ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read">Lues ({readNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG['updated'];
  const TypeIcon = config.icon;
  const ChannelIcon = CHANNEL_ICONS[notification.channel];
  const isUnread = notification.status !== 'read';

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all hover:shadow-sm',
        isUnread ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-transparent'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg flex-shrink-0', config.bgColor)}>
          <TypeIcon className={cn('h-4 w-4', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn('font-medium text-sm', isUnread && 'font-semibold')}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ChannelIcon className="h-3 w-3 text-muted-foreground" />
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
            </span>

            <div className="flex items-center gap-2">
              {isUnread && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marquer comme lu
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(notification.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact notification badge for header/navbar
interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
}

export function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  );
}
