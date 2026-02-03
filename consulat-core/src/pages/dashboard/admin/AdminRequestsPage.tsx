import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Mail,
  RefreshCw,
  AlertTriangle,
  User,
  Calendar,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { generateAndDownloadPDF } from "@/services/pdfGenerationService";

interface Request {
  id: string;
  subject: string;
  type: string;
  status: string;
  priority: string;
  citizen_name: string;
  citizen_email: string;
  citizen_phone: string | null;
  description: string | null;
  internal_notes: string | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
  IN_PROGRESS: { label: "En cours", color: "bg-blue-500", icon: <RefreshCw className="h-4 w-4" /> },
  AWAITING_DOCUMENTS: { label: "Documents requis", color: "bg-orange-500", icon: <FileText className="h-4 w-4" /> },
  VALIDATED: { label: "Validée", color: "bg-green-500", icon: <CheckCircle className="h-4 w-4" /> },
  REJECTED: { label: "Rejetée", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
  COMPLETED: { label: "Terminée", color: "bg-emerald-500", icon: <CheckCircle className="h-4 w-4" /> },
};

const typeLabels: Record<string, string> = {
  PASSPORT: "Passeport",
  VISA: "Visa",
  CONSULAR_CARD: "Carte consulaire",
  LEGALIZATION: "Légalisation",
  CIVIL_REGISTRY: "État civil",
  ATTESTATION: "Attestation",
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Basse", color: "bg-gray-400" },
  NORMAL: { label: "Normale", color: "bg-blue-400" },
  HIGH: { label: "Haute", color: "bg-orange-500" },
  URGENT: { label: "Urgente", color: "bg-red-500" },
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [agentNotes, setAgentNotes] = useState("");

  useEffect(() => {
    loadRequests();
    
    // Realtime subscription
    const channel = supabase
      .channel('admin-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        loadRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !newStatus) return;

    setIsUpdating(true);
    try {
      const oldStatus = selectedRequest.status;
      
      // Update the request
      const { error: updateError } = await supabase
        .from("requests")
        .update({ 
          status: newStatus,
          internal_notes: agentNotes || selectedRequest.internal_notes
        })
        .eq("id", selectedRequest.id);

      if (updateError) throw updateError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-status-notification", {
        body: {
          request_id: selectedRequest.id,
          new_status: newStatus,
          old_status: oldStatus,
          citizen_email: selectedRequest.citizen_email,
          citizen_name: selectedRequest.citizen_name,
          subject: selectedRequest.subject,
          notes: agentNotes || undefined,
        },
      });

      if (emailError) {
        console.error("Email notification error:", emailError);
        toast.warning("Statut mis à jour mais l'email n'a pas pu être envoyé");
      } else {
        toast.success("Statut mis à jour et notification envoyée");
      }

      setIsDetailOpen(false);
      setSelectedRequest(null);
      setNewStatus("");
      setAgentNotes("");
      loadRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.citizen_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Demandes</h1>
            <p className="text-muted-foreground">
              {requests.length} demande{requests.length > 1 ? "s" : ""} au total
            </p>
          </div>
          <Button onClick={loadRequests} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(status)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${config.color} text-white`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou sujet..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <SelectItem key={type} value={type}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredRequests.map((request) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{request.citizen_name}</p>
                            <p className="text-xs text-muted-foreground">{request.citizen_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabels[request.type] || request.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[request.status]?.color || 'bg-gray-500'} text-white`}>
                          {statusConfig[request.status]?.label || request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${priorityConfig[request.priority]?.color || 'bg-gray-400'} text-white`}>
                          {priorityConfig[request.priority]?.label || request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {format(new Date(request.created_at), "dd MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setNewStatus(request.status);
                            setAgentNotes(request.internal_notes || "");
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Request Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Request Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Demandeur</p>
                    <p className="font-medium">{selectedRequest.citizen_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedRequest.citizen_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{selectedRequest.citizen_phone || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{typeLabels[selectedRequest.type] || selectedRequest.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">
                      {format(new Date(selectedRequest.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                    <p className="font-medium">
                      {format(new Date(selectedRequest.updated_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>

                {/* Subject & Description */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sujet</p>
                  <p className="font-medium">{selectedRequest.subject}</p>
                </div>
                {selectedRequest.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {selectedRequest.description}
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Mettre à jour le statut
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nouveau statut</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Notes pour le citoyen (optionnel)</label>
                      <Textarea
                        placeholder="Ajoutez des informations qui seront envoyées dans l'email de notification..."
                        value={agentNotes}
                        onChange={(e) => setAgentNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {newStatus !== selectedRequest.status && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      Un email de notification sera envoyé au citoyen
                    </span>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedRequest && ["VALIDATED", "COMPLETED"].includes(selectedRequest.status) && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await generateAndDownloadPDF(selectedRequest.id);
                      toast.success("PDF généré avec succès");
                    } catch (error: any) {
                      toast.error(error.message || "Erreur lors de la génération du PDF");
                    }
                  }}
                  className="sm:mr-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleStatusUpdate} 
                disabled={isUpdating || newStatus === selectedRequest?.status}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
