import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { requestService } from '@/services/requestService';
import { ServiceRequest } from '@/types/request';
import { RequestStatus } from '@/lib/constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CitizenRequestsPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await requestService.getAll();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case RequestStatus.Completed:
            case RequestStatus.Validated:
                return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Terminé</Badge>;
            case RequestStatus.UnderReview:
            case RequestStatus.Pending:
            case RequestStatus.PendingCompletion:
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 gap-1"><Clock className="w-3 h-3" /> En cours</Badge>;
            case RequestStatus.Rejected:
                return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejeté</Badge>;
            default:
                return <Badge variant="outline" className="gap-1"><AlertCircle className="w-3 h-3" /> Inconnu</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Mes Demandes</h1>
                    <p className="text-muted-foreground">Suivez l'état de vos démarches administratives.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle Demande
                </Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Chargement...</div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="neu-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1 md:mt-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{req.service?.name || 'Demande'}</h3>
                                    <div className="text-sm text-muted-foreground flex flex-col md:flex-row gap-1 md:gap-4">
                                        <span>N° {req.id.substring(0, 8)}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span>Déposée le {format(new Date(req.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                {getStatusBadge(req.status)}
                                <span className="text-xs text-muted-foreground">Mis à jour le {format(new Date(req.updated_at), 'dd MMM yyyy', { locale: fr })}</span>
                            </div>
                        </div>
                    ))
                )}

                {!loading && requests.length === 0 && (
                    <div className="text-center py-12 neu-inset rounded-xl">
                        <p className="text-muted-foreground mb-4">Aucune demande en cours.</p>
                        <Button>Créer ma première demande</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
