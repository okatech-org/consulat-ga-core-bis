import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Globe, Plane, Clock, CheckCircle2, Calendar, FileCheck,
    AlertTriangle, FileText, ArrowRight
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MOCK_SERVICES } from "@/data/mock-services";
import { PublicServiceCard } from "@/components/services/PublicServiceCard";

// Services for Visitors (foreigners)
const VISITOR_SERVICE_IDS = ['visa-tourist', 'visa-business', 'visa-long-stay', 'legalization', 'certified-copy'];

// Mock visa request status
type RequestStatus = 'pending' | 'approved' | 'rejected';

export default function VisitorDashboard() {
    const navigate = useNavigate();

    const visitorServices = MOCK_SERVICES.filter(s =>
        VISITOR_SERVICE_IDS.includes(s.id) || s.category === 'VISA'
    );

    // Mock data
    const requestStatus: RequestStatus = 'pending';
    const visaType = 'Tourisme';

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🌍</span>
                        <h1 className="text-3xl font-bold text-foreground">
                            Espace Visiteur
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="secondary" className="gap-1.5 bg-purple-100 text-purple-700 border-purple-200">
                            <Globe className="w-3.5 h-3.5" />
                            Demandeur de Visa
                        </Badge>
                        <span className="text-muted-foreground">
                            Suivi de vos démarches consulaires
                        </span>
                    </div>
                </div>
                {requestStatus === 'approved' && (
                    <Button className="gap-2 bg-primary">
                        <Calendar className="w-4 h-4" />
                        Prendre Rendez-vous
                    </Button>
                )}
            </div>

            {/* Status Banner */}
            <div className="mb-6">
                {requestStatus === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-amber-900">Dossier en cours d'analyse</h3>
                            <p className="text-amber-700">
                                Votre demande de Visa {visaType} est en cours de traitement.
                                Délai estimé : 48h à 72h.
                            </p>
                        </div>
                    </div>
                )}

                {requestStatus === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-green-900">Visa Approuvé !</h3>
                            <p className="text-green-700">
                                Félicitations ! Votre visa a été approuvé.
                                Prenez rendez-vous pour le retrait de votre passeport.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Current Request Card */}
                <div className="md:col-span-2">
                    <Card className="bg-card border-border/50 shadow-sm h-full">
                        <CardContent className="pt-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Ma Demande en Cours</h3>
                                <p className="text-muted-foreground">Détails de votre procédure actuelle</p>
                            </div>

                            <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Plane className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Visa {visaType}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">Réf: VIS-2024-001</p>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                                En attente de validation
                                            </Badge>
                                            <Badge variant="outline">
                                                Soumis le 26/11/2024
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Voir détails</Button>
                            </div>

                            {/* Timeline */}
                            <div className="relative pl-4 border-l-2 border-muted space-y-6 ml-2">
                                <div className="relative">
                                    <div className="absolute -left-[21px] bg-green-500 h-3 w-3 rounded-full border-2 border-white ring-2 ring-green-100"></div>
                                    <p className="text-sm font-medium">Dossier soumis</p>
                                    <p className="text-xs text-muted-foreground">26 Nov 2024 - 14:30</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] bg-blue-500 h-3 w-3 rounded-full border-2 border-white ring-2 ring-blue-100 animate-pulse"></div>
                                    <p className="text-sm font-medium text-blue-600">Analyse des pièces</p>
                                    <p className="text-xs text-muted-foreground">En cours...</p>
                                </div>
                                <div className="relative opacity-50">
                                    <div className="absolute -left-[21px] bg-gray-300 h-3 w-3 rounded-full border-2 border-white"></div>
                                    <p className="text-sm font-medium">Validation Consulaire</p>
                                </div>
                                <div className="relative opacity-50">
                                    <div className="absolute -left-[21px] bg-gray-300 h-3 w-3 rounded-full border-2 border-white"></div>
                                    <p className="text-sm font-medium">Rendez-vous / Délivrance</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div>
                    <Card className="bg-card border-border/50 shadow-sm h-full">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold mb-6">Actions Rapides</h3>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    disabled={requestStatus !== 'approved'}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Prendre Rendez-vous
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <FileCheck className="w-4 h-4" />
                                    Compléter mon dossier
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Signaler un problème
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Available Services */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Services pour Visiteurs
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/services')} className="gap-1">
                        Voir tous les services
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visitorServices.slice(0, 3).map((service) => (
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
