import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, CheckCircle2, Clock } from "lucide-react";

export default function AgentDashboard() {
    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Espace Agent</h1>
                    <p className="text-muted-foreground">
                        Gestion des demandes et rendez-vous
                    </p>
                </div>
                <Button className="neu-raised bg-primary text-primary-foreground hover:shadow-neo-md border-none">
                    <FileText className="mr-2 h-4 w-4" /> Nouvelle Demande
                </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="neu-raised p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <FileText size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">À Traiter</p>
                    <h3 className="text-2xl font-bold">12</h3>
                </div>
                <div className="neu-raised p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                            <Clock size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">En Attente</p>
                    <h3 className="text-2xl font-bold">5</h3>
                </div>
                <div className="neu-raised p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-green-100 text-green-600">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Validées (24h)</p>
                    <h3 className="text-2xl font-bold">28</h3>
                </div>
                <div className="neu-raised p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">RDV Aujourd'hui</p>
                    <h3 className="text-2xl font-bold">8</h3>
                </div>
            </div>

            <div className="neu-raised p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Dernières Demandes</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl neu-inset">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                                    JD
                                </div>
                                <div>
                                    <p className="font-bold">Jean Dupont</p>
                                    <p className="text-sm text-muted-foreground">Renouvellement Passeport • Il y a 2h</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="neu-raised border-none">
                                Voir le dossier
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
