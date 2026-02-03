import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Globe } from "lucide-react";
import { KPITrendsCard } from "@/components/dashboard/admin/KPITrendsCard";
import { ServiceHealthWidget } from "@/components/dashboard/admin/ServiceHealthWidget";
import { SensitiveCasesSection } from "@/components/dashboard/admin/SensitiveCasesSection";
import { DiplomaticAgenda } from "@/components/dashboard/admin/DiplomaticAgenda";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WorldMapDashboard } from "@/components/admin/WorldMapDashboard";
import { ConsularRole } from "@/types/consular-roles";
import { AgentPerformanceChart } from "@/components/dashboard/admin/AdminStatsCard";
import { 
  RealTimeQuickStats, 
  RealTimeRequestsByType, 
  RealTimeMonthlyTrends 
} from "@/components/dashboard/admin/RealTimeStats";
import { AdminDashboardFilters, DashboardFilters } from "@/components/dashboard/admin/AdminDashboardFilters";
import { exportToPDF, exportToExcel } from "@/utils/dashboardExport";
import { subMonths } from "date-fns";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { currentUser } = useDemo();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { from: subMonths(new Date(), 1), to: new Date() },
    requestType: 'all',
    status: 'all',
  });

  // Mock data for export
  const exportData = {
    title: 'Rapport Consulaire',
    dateRange: filters.dateRange,
    stats: [
      { label: 'Total Demandes', value: 1234 },
      { label: 'En Attente', value: 89 },
      { label: 'Traitées ce mois', value: 456 },
      { label: 'Temps moyen', value: '3.2j' },
      { label: 'Satisfaction', value: '4.7/5' },
      { label: 'RDV planifiés', value: 78 },
    ],
    requestsByType: [
      { name: 'Passeport', value: 145 },
      { name: 'Visa', value: 89 },
      { name: 'État Civil', value: 234 },
      { name: 'Légalisation', value: 167 },
      { name: 'Carte Consulaire', value: 78 },
    ],
    monthlyTrends: [
      { month: 'Jan', demandes: 120, traitees: 98 },
      { month: 'Fév', demandes: 145, traitees: 130 },
      { month: 'Mar', demandes: 189, traitees: 165 },
      { month: 'Avr', demandes: 156, traitees: 142 },
      { month: 'Mai', demandes: 201, traitees: 178 },
      { month: 'Juin', demandes: 234, traitees: 210 },
    ],
    agentPerformance: [
      { agent: 'M. Nzoghe', traites: 45, enCours: 12, satisfaction: 4.8 },
      { agent: 'Mme Obiang', traites: 38, enCours: 8, satisfaction: 4.9 },
      { agent: 'M. Ndong', traites: 52, enCours: 15, satisfaction: 4.6 },
      { agent: 'Mme Essono', traites: 41, enCours: 10, satisfaction: 4.7 },
    ],
  };

  const handleExportPDF = () => {
    exportToPDF(exportData);
    toast.success("Rapport PDF généré avec succès");
  };

  const handleExportExcel = () => {
    exportToExcel(exportData);
    toast.success("Rapport Excel généré avec succès");
  };

  // Protection: Access for ADMIN (Super Admin) and CONSUL_GENERAL
  const hasAccess = currentUser?.role === "ADMIN" || currentUser?.role === ConsularRole.CONSUL_GENERAL;

  if (!hasAccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Alert className="max-w-md border-destructive">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle>Accès Refusé</AlertTitle>
          <AlertDescription>
            Cette section est réservée aux Consuls Généraux et Administrateurs.
            <div className="mt-4">
              <Button onClick={() => navigate("/")} variant="outline">
                Retour à l'accueil
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cockpit du Consul Général</h1>
          <p className="text-muted-foreground">
            Bienvenue, {currentUser?.name || 'Consul Général'}. Aperçu stratégique de l'activité consulaire.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="neu-raised gap-2">
            <Globe className="w-4 h-4" />
            Vue Réseau
          </Button>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="animate-slide-up">
        <AdminDashboardFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      </div>

      {/* Quick Stats Grid - Real Time Data */}
      <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <RealTimeQuickStats />
      </div>

      {/* KPI Trends - Strategic Indicators */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <KPITrendsCard />
      </div>

      {/* Charts Row - Real Time Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <RealTimeRequestsByType />
        <RealTimeMonthlyTrends />
      </div>

      {/* Two Column Layout: Service Health + Sensitive Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <ServiceHealthWidget />
        <SensitiveCasesSection />
      </div>

      {/* Agent Performance */}
      <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <AgentPerformanceChart />
      </div>

      {/* Geographic Distribution Map (Reusing existing component) */}
      <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <Card className="neu-raised">
          <CardHeader>
            <CardTitle>Répartition Géographique</CardTitle>
            <CardDescription>Visualisation des concentrations de profils consulaires</CardDescription>
          </CardHeader>
          <CardContent>
            <WorldMapDashboard />
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Diplomatic Agenda + Security Feed (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <DiplomaticAgenda />

        {/* Security Feed Placeholder */}
        <Card className="neu-raised h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Veille Sécuritaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <h4 className="font-bold text-sm text-orange-800">Alerte Voyageur - Zone B</h4>
                <p className="text-xs text-orange-600 mt-1">Manifestations prévues ce week-end. Message de vigilance envoyé aux ressortissants.</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-bold text-sm text-blue-800">Note Diplomatique</h4>
                <p className="text-xs text-blue-600 mt-1">Réception de la note verbale NV-2023-45 concernant les visas officiels.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
