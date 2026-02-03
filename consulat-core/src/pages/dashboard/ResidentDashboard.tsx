import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText, UserCheck, Stamp, Plus, TrendingUp, Building2,
    MapPin, Bell, Calendar, Clock, ArrowRight, ShieldCheck,
    Users, FileCheck, Home
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MOCK_GABONAIS_CITIZENS } from "@/data/mock-citizens";
import { MOCK_SERVICES } from "@/data/mock-services";
import { PublicServiceCard } from "@/components/services/PublicServiceCard";

// Services available for Residents
const RESIDENT_SERVICE_IDS = [
    'consular-protection', 'passport-ordinary', 'tenant-lieu-passeport', 'laissez-passer',
    'consular-card', 'certificate-residence', 'civil-birth', 'civil-marriage',
    'civil-death', 'civil-cert-capacity', 'legalization', 'certified-copy', 'power-attorney'
];

export default function ResidentDashboard() {
    const navigate = useNavigate();
    const user = MOCK_GABONAIS_CITIZENS[0]; // Simulate logged in user

    const residentServices = MOCK_SERVICES.filter(s =>
        RESIDENT_SERVICE_IDS.includes(s.id) || s.category === 'PASSPORT' || s.category === 'ETAT_CIVIL'
    ).slice(0, 6);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🇬🇦</span>
                        <h1 className="text-3xl font-bold text-foreground">
                            Bienvenue, {user.firstName}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-700 border-green-200">
                            <UserCheck className="w-3.5 h-3.5" />
                            Résident Immatriculé
                        </Badge>
                        <span className="text-muted-foreground">
                            Dossier : <span className="font-mono font-medium text-primary">{user.consulateFile}</span>
                        </span>
                        <Badge variant="outline" className="gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Consulat de France
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <MapPin className="w-4 h-4" />
                        Signaler un déplacement
                    </Button>
                    <Button className="gap-2 bg-primary">
                        <Plus className="w-4 h-4" />
                        Nouvelle Demande
                    </Button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                Actif
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Statut Consulaire</p>
                        <h3 className="text-xl font-bold">Vérifié</h3>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Demandes en cours</p>
                        <h3 className="text-xl font-bold">1</h3>
                        <p className="text-xs text-muted-foreground mt-1">Renouvellement Passeport</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                                <FileCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Documents disponibles</p>
                        <h3 className="text-xl font-bold">3</h3>
                        <p className="text-xs text-muted-foreground mt-1">À retirer ou télécharger</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Prochain RDV</p>
                        <h3 className="text-xl font-bold">15 Fév</h3>
                        <p className="text-xs text-muted-foreground mt-1">Retrait Passeport</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Actions Rapides
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: FileText, label: "Demander un Passeport", color: "bg-blue-100 text-blue-600" },
                        { icon: Users, label: "Gérer mes enfants", color: "bg-purple-100 text-purple-600" },
                        { icon: Stamp, label: "Légaliser un document", color: "bg-amber-100 text-amber-600" },
                        { icon: Bell, label: "Mes notifications", color: "bg-green-100 text-green-600" },
                    ].map((action, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            className="h-auto py-4 flex-col gap-2 hover:shadow-md transition-all border-border/50"
                        >
                            <div className={`p-2 rounded-lg ${action.color}`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Available Services */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Stamp className="w-5 h-5 text-primary" />
                        Services Disponibles
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/services')} className="gap-1">
                        Voir tous les services
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {residentServices.map((service) => (
                        <PublicServiceCard
                            key={service.id}
                            service={service}
                            className="h-full"
                            onRegisterClick={() => navigate('/login')}
                        />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
