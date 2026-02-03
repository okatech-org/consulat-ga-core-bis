import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plane, Clock, AlertTriangle, CheckCircle2, Calendar, FileCheck } from "lucide-react";
import { RegistrationStatus, RequestReason } from "@/types/citizen";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function ForeignerDashboard() {
    // Mock user state - Change this to test different states
    const userStatus = RegistrationStatus.PENDING_APPROVAL as RegistrationStatus;
    // const userStatus = RegistrationStatus.APPROVED as RegistrationStatus;

    const requestType = RequestReason.VISA_REQUEST;

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Espace Visiteur</h1>
                    <p className="text-muted-foreground">
                        Suivi de vos démarches consulaires
                    </p>
                </div>
                {userStatus === RegistrationStatus.APPROVED && (
                    <Button className="neu-raised bg-blue-600 hover:bg-blue-700 text-white border-none">
                        <Calendar className="mr-2 h-4 w-4" /> Prendre Rendez-vous
                    </Button>
                )}
            </div>

            {/* STATUS BANNER */}
            <div className="mb-8">
                {userStatus === RegistrationStatus.PENDING_APPROVAL && (
                    <div className="neu-inset bg-yellow-50/50 border border-yellow-200/50 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 neu-raised">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-yellow-900">Dossier en cours d'analyse</h3>
                                <p className="text-yellow-700">
                                    Votre demande d'inscription est en cours de traitement par nos services.
                                    Délai estimé : 48h à 72h.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {userStatus === RegistrationStatus.APPROVED && (
                    <div className="neu-inset bg-green-50/50 border border-green-200/50 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 neu-raised">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-900">Compte Validé</h3>
                                <p className="text-green-700">
                                    Vous pouvez désormais accéder aux services consulaires et prendre rendez-vous.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* CURRENT REQUEST CARD */}
                <div className="md:col-span-2 neu-raised p-6 rounded-2xl">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Ma Demande en Cours</h3>
                        <p className="text-muted-foreground">Détails de votre procédure actuelle</p>
                    </div>

                    <div className="flex items-start justify-between p-4 rounded-xl neu-inset mb-6">
                        <div className="flex gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg h-fit neu-raised">
                                {requestType === RequestReason.VISA_REQUEST ? (
                                    <Plane className="h-6 w-6 text-blue-600" />
                                ) : (
                                    <FileText className="h-6 w-6 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">
                                    {requestType === RequestReason.VISA_REQUEST ? "Demande de Visa Court Séjour" : "Légalisation de Documents"}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">Réf: VIS-2024-001</p>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                        En attente de validation
                                    </Badge>
                                    <Badge variant="outline">
                                        Soumis le 26/11/2024
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="neu-raised border-none">Voir détails</Button>
                    </div>

                    {/* Timeline / Steps */}
                    <div className="relative pl-4 border-l-2 border-muted space-y-6 ml-2">
                        <div className="relative">
                            <div className="absolute -left-[21px] bg-green-500 h-3 w-3 rounded-full border-2 border-white ring-2 ring-green-100 shadow-md"></div>
                            <p className="text-sm font-medium">Dossier soumis</p>
                            <p className="text-xs text-muted-foreground">26 Nov 2024 - 14:30</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] bg-blue-500 h-3 w-3 rounded-full border-2 border-white ring-2 ring-blue-100 animate-pulse shadow-md"></div>
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
                </div>

                {/* AVAILABLE ACTIONS */}
                <div className="neu-raised p-6 rounded-2xl h-fit">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Actions Rapides</h3>
                    </div>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start neu-raised border-none hover:shadow-neo-md" disabled={userStatus !== RegistrationStatus.APPROVED}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Prendre Rendez-vous
                        </Button>
                        <Button variant="outline" className="w-full justify-start neu-raised border-none hover:shadow-neo-md">
                            <FileCheck className="mr-2 h-4 w-4" />
                            Compléter mon dossier
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 neu-inset bg-transparent shadow-none">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Signaler un problème
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
