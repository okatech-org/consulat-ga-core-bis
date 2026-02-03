import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, FileText, 
  Calendar, User, MessageSquare, Paperclip, ChevronRight,
  Play, Send, Eye
} from 'lucide-react';
import { RequestStatus } from '@/lib/constants';
import { ServiceRequest, RequestActivity, RequestNote } from '@/types/request';
import { cn } from '@/lib/utils';

interface RequestTimelineProps {
  request: ServiceRequest;
  showDetails?: boolean;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bgColor: string; label: string }> = {
  [RequestStatus.Draft]: { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Brouillon' },
  [RequestStatus.Pending]: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'En attente' },
  [RequestStatus.Submitted]: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Soumis' },
  [RequestStatus.UnderReview]: { icon: Eye, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'En cours d\'examen' },
  [RequestStatus.InProduction]: { icon: Play, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'En production' },
  [RequestStatus.Validated]: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Validé' },
  [RequestStatus.Rejected]: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Rejeté' },
  [RequestStatus.ReadyForPickup]: { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Prêt à retirer' },
  [RequestStatus.Completed]: { icon: CheckCircle2, color: 'text-green-700', bgColor: 'bg-green-200', label: 'Terminé' },
  [RequestStatus.Cancelled]: { icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Annulé' },
  [RequestStatus.PendingCompletion]: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Documents requis' },
  [RequestStatus.AppointmentScheduled]: { icon: Calendar, color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'RDV programmé' },
};

export function RequestTimeline({ request, showDetails = true }: RequestTimelineProps) {
  const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG[RequestStatus.Pending];
  const StatusIcon = statusConfig.icon;

  // Generate timeline events from metadata activities
  const activities = request.metadata?.activities || [];
  
  // Sort activities by timestamp (newest first for display)
  const sortedActivities = [...activities].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card className="neu-raised overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
              <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {request.service?.name || 'Demande de service'}
                <Badge variant="outline" className={cn(statusConfig.color, 'border-current')}>
                  {statusConfig.label}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs">N° {request.number || request.id.substring(0, 8)}</span>
                <span>•</span>
                <span>Créée {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: fr })}</span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0 space-y-6">
          {/* Status Progress */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {Object.entries(STATUS_CONFIG)
              .filter(([key]) => !['draft', 'cancelled'].includes(key))
              .slice(0, 6)
              .map(([key, config], index, arr) => {
                const isActive = key === request.status;
                const isPassed = getStatusOrder(request.status) > getStatusOrder(key as RequestStatus);
                
                return (
                  <div key={key} className="flex items-center">
                    <div
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap transition-all',
                        isActive && `${config.bgColor} ${config.color} font-medium`,
                        isPassed && 'bg-green-100 text-green-600',
                        !isActive && !isPassed && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <config.icon className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">{config.label}</span>
                    </div>
                    {index < arr.length - 1 && (
                      <ChevronRight className={cn(
                        'h-4 w-4 mx-1',
                        isPassed ? 'text-green-400' : 'text-muted-foreground/30'
                      )} />
                    )}
                  </div>
                );
              })}
          </div>

          <Separator />

          {/* Timeline Events */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Historique des activités
            </h4>
            
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune activité enregistrée pour le moment.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                
                {sortedActivities.map((activity, index) => (
                  <TimelineEvent
                    key={`${activity.type}-${activity.timestamp}`}
                    activity={activity}
                    isFirst={index === 0}
                    isLast={index === sortedActivities.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Notes Section */}
          {request.notes && request.notes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Notes
                </h4>
                <div className="space-y-3">
                  {request.notes.map((note, index) => (
                    <NoteCard key={index} note={note} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Documents Section */}
          {request.document_ids && request.document_ids.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Documents ({request.document_ids.length})
                </h4>
                <div className="grid gap-2">
                  {request.document_ids.map((docId, index) => (
                    <div
                      key={docId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">Document {index + 1}</span>
                      <Badge variant="outline" className="text-xs">Téléchargé</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface TimelineEventProps {
  activity: RequestActivity;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineEvent({ activity, isFirst }: TimelineEventProps) {
  const eventConfig = getActivityConfig(activity.type);
  const EventIcon = eventConfig.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute -left-6 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center',
          isFirst ? 'bg-primary' : 'bg-muted'
        )}
      >
        {isFirst && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>

      {/* Event content */}
      <div className={cn(
        'flex-1 p-3 rounded-lg',
        isFirst ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <EventIcon className={cn('h-4 w-4', eventConfig.color)} />
            <span className="font-medium text-sm">{eventConfig.label}</span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
          </span>
        </div>
        {activity.data && (
          <p className="text-sm text-muted-foreground mt-1">
            {getActivityDescription(activity)}
          </p>
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: RequestNote;
}

function NoteCard({ note }: NoteCardProps) {
  const isInternal = note.type === 'internal';

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      isInternal ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-muted/50'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className={cn('h-4 w-4', isInternal ? 'text-amber-600' : 'text-muted-foreground')} />
        <Badge variant="outline" className="text-xs">
          {isInternal ? 'Note interne' : 'Commentaire'}
        </Badge>
        {note.createdAt && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(note.createdAt), 'dd MMM yyyy', { locale: fr })}
          </span>
        )}
      </div>
      <p className="text-sm">{note.content}</p>
    </div>
  );
}

// Helper functions
function getStatusOrder(status: RequestStatus | string): number {
  const order: Record<string, number> = {
    [RequestStatus.Draft]: 0,
    [RequestStatus.Pending]: 1,
    [RequestStatus.Submitted]: 2,
    [RequestStatus.UnderReview]: 3,
    [RequestStatus.PendingCompletion]: 3,
    [RequestStatus.InProduction]: 4,
    [RequestStatus.Validated]: 5,
    [RequestStatus.ReadyForPickup]: 6,
    [RequestStatus.Completed]: 7,
    [RequestStatus.Rejected]: -1,
    [RequestStatus.Cancelled]: -2,
  };
  return order[status] ?? 0;
}

function getActivityConfig(type: string): { icon: typeof Clock; color: string; label: string } {
  const configs: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    'request_created': { icon: FileText, color: 'text-blue-500', label: 'Demande créée' },
    'request_submitted': { icon: Send, color: 'text-green-500', label: 'Demande soumise' },
    'request_assigned': { icon: User, color: 'text-purple-500', label: 'Demande assignée' },
    'document_uploaded': { icon: Paperclip, color: 'text-indigo-500', label: 'Document téléchargé' },
    'document_validated': { icon: CheckCircle2, color: 'text-green-500', label: 'Document validé' },
    'document_rejected': { icon: XCircle, color: 'text-red-500', label: 'Document rejeté' },
    'status_changed': { icon: Play, color: 'text-blue-500', label: 'Statut modifié' },
    'comment_added': { icon: MessageSquare, color: 'text-gray-500', label: 'Commentaire ajouté' },
    'appointment_scheduled': { icon: Calendar, color: 'text-cyan-500', label: 'Rendez-vous programmé' },
    'request_completed': { icon: CheckCircle2, color: 'text-green-600', label: 'Demande terminée' },
    'request_cancelled': { icon: XCircle, color: 'text-red-500', label: 'Demande annulée' },
  };
  return configs[type] || { icon: Clock, color: 'text-gray-500', label: type };
}

function getActivityDescription(activity: RequestActivity): string {
  if (!activity.data) return '';
  
  switch (activity.type) {
    case 'request_assigned':
      return `Assignée à ${activity.data.assigneeName || 'un agent'}`;
    case 'status_changed':
      return `Statut changé de "${activity.data.from}" vers "${activity.data.to}"`;
    case 'document_uploaded':
      return `Document "${activity.data.documentName || 'fichier'}" téléchargé`;
    case 'document_validated':
      return `Document "${activity.data.documentName || 'fichier'}" validé`;
    case 'document_rejected':
      return `Document "${activity.data.documentName || 'fichier'}" rejeté: ${activity.data.reason || ''}`;
    default:
      return activity.data.description || '';
  }
}
