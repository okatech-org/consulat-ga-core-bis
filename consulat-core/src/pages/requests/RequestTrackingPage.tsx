import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Clock, FileText, CheckCircle, XCircle, AlertCircle, 
  Loader2, Eye, Calendar, ArrowRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Request {
  id: string;
  type: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  description?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; progress: number }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500", icon: Clock, progress: 10 },
  IN_PROGRESS: { label: "En cours", color: "bg-blue-500", icon: Loader2, progress: 40 },
  AWAITING_DOCUMENTS: { label: "Documents requis", color: "bg-orange-500", icon: FileText, progress: 30 },
  VALIDATED: { label: "Validée", color: "bg-green-500", icon: CheckCircle, progress: 80 },
  REJECTED: { label: "Refusée", color: "bg-red-500", icon: XCircle, progress: 100 },
  COMPLETED: { label: "Terminée", color: "bg-green-600", icon: CheckCircle, progress: 100 },
};

const typeLabels: Record<string, string> = {
  PASSPORT: "Passeport",
  VISA: "Visa",
  CONSULAR_CARD: "Carte Consulaire",
  LEGALIZATION: "Légalisation",
  CIVIL_REGISTRY: "État Civil",
  ATTESTATION: "Attestation",
};

export default function RequestTrackingPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [payload.new as Request, ...prev]);
            toast.info("Nouvelle demande créée");
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id ? (payload.new as Request) : req
              )
            );
            const newStatus = statusConfig[(payload.new as Request).status];
            toast.success(`Demande mise à jour: ${newStatus?.label || 'Nouveau statut'}`);
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("citizen_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: "bg-gray-500", icon: AlertCircle };
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white gap-1`}>
        <Icon className={`h-3 w-3 ${status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="bg-gradient-hero text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Suivi de mes demandes</h1>
          <p className="text-primary-foreground/80">Suivez l'avancement de vos démarches consulaires en temps réel</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Mes demandes ({requests.length})</h2>
            <Button variant="ghost" size="sm" onClick={fetchRequests}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button asChild>
            <Link to="/services">Nouvelle demande</Link>
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">Aucune demande</h3>
                <p className="text-muted-foreground">Vous n'avez pas encore soumis de demande consulaire.</p>
              </div>
              <Button asChild>
                <Link to="/services">Faire une demande</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request, index) => {
              const config = statusConfig[request.status] || { progress: 0 };
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline">{typeLabels[request.type] || request.type}</Badge>
                            {getStatusBadge(request.status)}
                            {request.priority === 'URGENT' && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg">{request.subject}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(request.created_at), "d MMMM yyyy", { locale: fr })}
                            </span>
                            <span className="text-xs">
                              Réf: {request.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-32 space-y-1">
                            <Progress value={config.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">{config.progress}%</p>
                          </div>
                          <ArrowRight className={`h-5 w-5 transition-transform ${
                            selectedRequest?.id === request.id ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>

                      {selectedRequest?.id === request.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6"
                        >
                          <Separator className="mb-4" />
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">Détails de la demande</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {request.description || "Aucune description disponible"}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Historique</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  <span>Demande créée - {format(new Date(request.created_at), "d/MM/yyyy HH:mm", { locale: fr })}</span>
                                </div>
                                {request.updated_at !== request.created_at && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Dernière mise à jour - {format(new Date(request.updated_at), "d/MM/yyyy HH:mm", { locale: fr })}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Voir les documents
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
