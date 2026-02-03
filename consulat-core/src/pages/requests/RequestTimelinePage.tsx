import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { RequestTimeline } from '@/components/requests/RequestTimeline';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FileText } from 'lucide-react';
import { requestService } from '@/services/requestService';
import { ServiceRequest } from '@/types/request';
import { RequestStatus } from '@/lib/constants';

export default function RequestTimelinePage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await requestService.getAll();
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.number || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suivi des Demandes</h1>
          <p className="text-muted-foreground mt-1">
            Visualisez l'historique complet de vos démarches consulaires.
          </p>
        </div>

        {/* Filters */}
        <Card className="neu-raised">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 neu-inset"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] neu-inset">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.values(RequestStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Request List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Chargement des demandes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="neu-raised">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune demande trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Vous n\'avez pas encore de demandes en cours.'}
              </p>
              <Button>Créer une nouvelle demande</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <RequestTimeline key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
