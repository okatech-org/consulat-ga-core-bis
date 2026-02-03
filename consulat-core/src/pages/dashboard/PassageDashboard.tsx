import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plane, Clock, ShieldAlert, Phone, MapPin, FileText,
    AlertTriangle, ArrowRight, Calendar, Info
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MOCK_SERVICES } from "@/data/mock-services";
import { PublicServiceCard } from "@/components/services/PublicServiceCard";

// Limited services for "De Passage" users
const PASSAGE_SERVICE_IDS = ['consular-protection', 'laissez-passer', 'tenant-lieu-passeport'];

export default function PassageDashboard() {
    const navigate = useNavigate();

    const passageServices = MOCK_SERVICES.filter(s =>
        PASSAGE_SERVICE_IDS.includes(s.id)
    );

    // Mock data
    const stayEndDate = new Date();
    stayEndDate.setMonth(stayEndDate.getMonth() + 2);
    const daysRemaining = Math.ceil((stayEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">✈️</span>
                        <h1 className="text-3xl font-bold text-foreground">
                            Espace Voyageur
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="secondary" className="gap-1.5 bg-blue-100 text-blue-700 border-blue-200">
                            <Plane className="w-3.5 h-3.5" />
                            De Passage
                        </Badge>
                        <span className="text-muted-foreground">
                            Déclaration temporaire active
                        </span>
                    </div>
                </div>
                <Button variant="destructive" className="gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Assistance d'Urgence
                </Button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">Séjour Temporaire</h3>
                    <p className="text-sm text-blue-700">
                        Votre déclaration de présence temporaire vous permet d'accéder aux services d'urgence.
                        Pour un séjour de plus de 6 mois, vous devrez vous immatriculer comme résident.
                    </p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-card border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                Actif
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Temps restant</p>
                        <h3 className="text-xl font-bold">{daysRemaining} jours</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Jusqu'au {stayEndDate.toLocaleDateString('fr-FR')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Localisation déclarée</p>
                        <h3 className="text-xl font-bold">Paris, France</h3>
                        <p className="text-xs text-muted-foreground mt-1">Consulat Général</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Demandes</p>
                        <h3 className="text-xl font-bold">0</h3>
                        <p className="text-xs text-muted-foreground mt-1">Aucune demande en cours</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    Actions Rapides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        className="h-auto py-5 flex-col gap-3 hover:shadow-md transition-all border-red-200 bg-red-50 hover:bg-red-100"
                    >
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-red-700">Signaler une urgence</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto py-5 flex-col gap-3 hover:shadow-md transition-all border-border/50"
                    >
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Phone className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Contacter le Consulat</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto py-5 flex-col gap-3 hover:shadow-md transition-all border-border/50"
                    >
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Demander un Laissez-Passer</span>
                    </Button>
                </div>
            </div>

            {/* Warning about limitations */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">Services Limités</h3>
                    <p className="text-sm text-amber-700">
                        En tant que voyageur de passage, vous avez accès uniquement aux services d'urgence
                        (Laissez-passer, Assistance). Pour les autres services (Passeport, État Civil),
                        une immatriculation comme Résident est requise.
                    </p>
                    <Button variant="link" className="text-amber-700 p-0 h-auto mt-2" onClick={() => navigate('/register')}>
                        Devenir Résident <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Available Services */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Services Disponibles
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {passageServices.map((service) => (
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
