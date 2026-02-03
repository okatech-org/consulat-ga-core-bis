import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Search, Filter, FileText, Clock, CheckCircle2, XCircle, AlertCircle,
    ChevronRight, Calendar, ArrowLeft, Loader2, Eye, Send, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Status configuration with icons and colors
const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bgColor: string; label: string }> = {
    'DRAFT': { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Brouillon' },
    'PENDING': { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'En attente' },
    'SUBMITTED': { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Soumis' },
    'UNDER_REVIEW': { icon: Eye, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'En examen' },
    'IN_PRODUCTION': { icon: Play, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'En production' },
    'VALIDATED': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Validé' },
    'REJECTED': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Rejeté' },
    'READY_FOR_PICKUP': { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Prêt à retirer' },
    'COMPLETED': { icon: CheckCircle2, color: 'text-green-700', bgColor: 'bg-green-200', label: 'Terminé' },
    'PENDING_COMPLETION': { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Documents requis' },
    'APPOINTMENT_SCHEDULED': { icon: Calendar, color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'RDV programmé' },
};

// Mock data for citizen requests
const MOCK_CITIZEN_REQUESTS = [
    {
        id: 'req-001',
        number: 'GAB-2026-00125',
        service: { name: 'Passeport Ordinaire Biométrique', category: 'PASSPORT' },
        status: 'UNDER_REVIEW',
        priority: 'NORMAL',
        created_at: '2026-01-15T10:30:00Z',
        updated_at: '2026-01-18T14:20:00Z',
        submitted_at: '2026-01-15T10:35:00Z',
        metadata: {
            activities: [
                { type: 'request_created', timestamp: Date.now() - 86400000 * 4 },
                { type: 'request_submitted', timestamp: Date.now() - 86400000 * 4 },
                { type: 'request_assigned', timestamp: Date.now() - 86400000 * 2, data: { assigneeName: 'Agent Moussavou' } },
                { type: 'document_validated', timestamp: Date.now() - 86400000, data: { documentName: 'Photo ID' } },
            ]
        }
    },
    {
        id: 'req-002',
        number: 'GAB-2026-00098',
        service: { name: 'Carte Consulaire', category: 'CONSULAR_CARD' },
        status: 'READY_FOR_PICKUP',
        priority: 'NORMAL',
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-17T16:00:00Z',
        completed_at: '2026-01-17T16:00:00Z',
        metadata: {
            activities: [
                { type: 'request_created', timestamp: Date.now() - 86400000 * 9 },
                { type: 'request_submitted', timestamp: Date.now() - 86400000 * 9 },
                { type: 'status_changed', timestamp: Date.now() - 86400000 * 2, data: { to: 'Prêt à retirer' } },
            ]
        }
    },
    {
        id: 'req-003',
        number: 'GAB-2026-00142',
        service: { name: 'Acte de Naissance', category: 'ETAT_CIVIL' },
        status: 'PENDING_COMPLETION',
        priority: 'HIGH',
        created_at: '2026-01-18T11:00:00Z',
        updated_at: '2026-01-19T09:00:00Z',
        metadata: {
            requiredAction: 'Veuillez fournir la copie certifiée du livret de famille',
            activities: [
                { type: 'request_created', timestamp: Date.now() - 86400000 },
                { type: 'request_submitted', timestamp: Date.now() - 86400000 },
                { type: 'document_rejected', timestamp: Date.now() - 43200000, data: { documentName: 'Livret de famille', reason: 'Copie non certifiée' } },
            ]
        }
    },
    {
        id: 'req-004',
        number: 'GAB-2025-00456',
        service: { name: 'Légalisation de Document', category: 'ADMINISTRATIF' },
        status: 'COMPLETED',
        priority: 'NORMAL',
        created_at: '2025-12-20T14:00:00Z',
        updated_at: '2025-12-28T10:00:00Z',
        completed_at: '2025-12-28T10:00:00Z',
        metadata: {
            activities: [
                { type: 'request_created', timestamp: Date.now() - 86400000 * 30 },
                { type: 'request_completed', timestamp: Date.now() - 86400000 * 22 },
            ]
        }
    },
];

// Filter options
const STATUS_FILTERS = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'En cours' },
    { value: 'PENDING_COMPLETION', label: 'Action requise' },
    { value: 'READY_FOR_PICKUP', label: 'Prêt à retirer' },
    { value: 'COMPLETED', label: 'Terminées' },
    { value: 'REJECTED', label: 'Rejetées' },
];

export default function CitizenTimelinePage() {
    const navigate = useNavigate();
    const { userSpaceTheme } = useThemeStyle();
    const isIDN = userSpaceTheme === 'idn';

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

    // Filter requests
    const filteredRequests = useMemo(() => {
        return MOCK_CITIZEN_REQUESTS.filter(request => {
            // Search filter
            const matchesSearch = !searchQuery ||
                request.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.service.name.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            let matchesStatus = true;
            if (statusFilter === 'active') {
                matchesStatus = !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status);
            } else if (statusFilter !== 'all') {
                matchesStatus = request.status === statusFilter;
            }

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    // Statistics
    const stats = useMemo(() => ({
        total: MOCK_CITIZEN_REQUESTS.length,
        active: MOCK_CITIZEN_REQUESTS.filter(r => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)).length,
        actionRequired: MOCK_CITIZEN_REQUESTS.filter(r => r.status === 'PENDING_COMPLETION').length,
        completed: MOCK_CITIZEN_REQUESTS.filter(r => r.status === 'COMPLETED').length,
    }), []);

    const toggleExpand = (id: string) => {
        setExpandedRequest(expandedRequest === id ? null : id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 text-muted-foreground"
                        onClick={() => navigate('/dashboard/citizen')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au tableau de bord
                    </Button>
                    <h1 className="text-2xl font-bold">Suivi de mes Démarches</h1>
                    <p className="text-muted-foreground">Visualisez la progression de toutes vos demandes consulaires</p>
                </div>
                <Button onClick={() => navigate('/dashboard/citizen/services')} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Nouvelle démarche
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className={cn(isIDN && "glass-card")}>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total demandes</p>
                    </CardContent>
                </Card>
                <Card className={cn(isIDN && "glass-card")}>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                        <p className="text-xs text-muted-foreground">En cours</p>
                    </CardContent>
                </Card>
                <Card className={cn(isIDN && "glass-card", "border-orange-200 bg-orange-50/50")}>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-orange-600">{stats.actionRequired}</p>
                        <p className="text-xs text-muted-foreground">Action requise</p>
                    </CardContent>
                </Card>
                <Card className={cn(isIDN && "glass-card")}>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        <p className="text-xs text-muted-foreground">Terminées</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className={cn(isIDN && "glass-card")}>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Rechercher par numéro ou service..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all text-sm",
                                    isIDN
                                        ? "bg-white/50 dark:bg-black/20 border-white/30 focus:border-primary"
                                        : "bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                                )}
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {STATUS_FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setStatusFilter(filter.value)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                                        statusFilter === filter.value
                                            ? "bg-primary text-primary-foreground"
                                            : isIDN
                                                ? "bg-white/30 hover:bg-white/50 text-muted-foreground"
                                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <Card className={cn(isIDN && "glass-card")}>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Aucune demande trouvée</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Essayez de modifier vos critères de recherche.'
                                    : 'Vous n\'avez pas encore de demandes.'}
                            </p>
                            <Button onClick={() => navigate('/dashboard/citizen/services')}>
                                Commencer une démarche
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRequests.map((request) => {
                        const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG['PENDING'];
                        const StatusIcon = statusConfig.icon;
                        const isExpanded = expandedRequest === request.id;
                        const hasActionRequired = request.status === 'PENDING_COMPLETION';

                        return (
                            <Card
                                key={request.id}
                                className={cn(
                                    "overflow-hidden transition-all cursor-pointer",
                                    isIDN && "glass-card",
                                    hasActionRequired && "border-orange-300 bg-orange-50/30"
                                )}
                                onClick={() => toggleExpand(request.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('p-2.5 rounded-xl', statusConfig.bgColor)}>
                                                <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                                    {request.service.name}
                                                    <Badge variant="outline" className={cn(statusConfig.color, 'border-current text-xs')}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                    {request.priority === 'HIGH' && (
                                                        <Badge variant="destructive" className="text-xs">Prioritaire</Badge>
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <span className="font-mono text-xs">{request.number}</span>
                                                    <span>•</span>
                                                    <span>Créée {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: fr })}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-5 w-5 text-muted-foreground transition-transform",
                                            isExpanded && "rotate-90"
                                        )} />
                                    </div>

                                    {/* Action Required Alert */}
                                    {hasActionRequired && request.metadata?.requiredAction && (
                                        <div className="mt-3 p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 border border-orange-200">
                                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span className="text-sm font-medium">{request.metadata.requiredAction}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <CardContent className="pt-0 border-t">
                                        <div className="pt-4 space-y-4">
                                            {/* Timeline */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Historique</h4>
                                                <div className="relative pl-6 space-y-4">
                                                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                                                    {request.metadata?.activities?.slice().reverse().map((activity, index) => (
                                                        <div key={index} className="relative flex gap-3">
                                                            <div className={cn(
                                                                "absolute -left-6 w-4 h-4 rounded-full border-2 border-background",
                                                                index === 0 ? "bg-primary" : "bg-muted"
                                                            )} />
                                                            <div className={cn(
                                                                "flex-1 p-2 rounded-lg text-sm",
                                                                index === 0 ? "bg-primary/5" : "bg-muted/50"
                                                            )}>
                                                                <div className="flex justify-between">
                                                                    <span className="font-medium">{getActivityLabel(activity.type)}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
                                                                    </span>
                                                                </div>
                                                                {activity.data && (
                                                                    <p className="text-muted-foreground text-xs mt-1">
                                                                        {getActivityDescription(activity)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                                    Voir les détails
                                                </Button>
                                                {hasActionRequired && (
                                                    <Button size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                                        Compléter ma demande
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Helper functions
function getActivityLabel(type: string): string {
    const labels: Record<string, string> = {
        'request_created': 'Demande créée',
        'request_submitted': 'Demande soumise',
        'request_assigned': 'Demande assignée',
        'document_uploaded': 'Document téléchargé',
        'document_validated': 'Document validé',
        'document_rejected': 'Document rejeté',
        'status_changed': 'Statut modifié',
        'request_completed': 'Demande terminée',
    };
    return labels[type] || type;
}

function getActivityDescription(activity: { type: string; data?: Record<string, any> }): string {
    if (!activity.data) return '';
    switch (activity.type) {
        case 'request_assigned':
            return `Assignée à ${activity.data.assigneeName || 'un agent'}`;
        case 'document_validated':
            return `Document "${activity.data.documentName}" validé`;
        case 'document_rejected':
            return `Document "${activity.data.documentName}" rejeté: ${activity.data.reason || ''}`;
        case 'status_changed':
            return `Nouveau statut: ${activity.data.to}`;
        default:
            return activity.data.description || '';
    }
}
