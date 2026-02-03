import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CitizenType } from "@/types/citizen";
import { User, Globe2, ArrowRight } from "lucide-react";

interface CitizenTypeSelectorProps {
    onSelect: (type: CitizenType) => void;
}

export function CitizenTypeSelector({ onSelect }: CitizenTypeSelectorProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Option Citoyen Gabonais */}
            <Card
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group relative overflow-hidden"
                onClick={() => onSelect(CitizenType.GABONAIS)}
            >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <User className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Citoyen Gabonais</CardTitle>
                    <CardDescription>
                        Pour les détenteurs de la nationalité gabonaise
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            ✓ Accès complet à tous les services
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ Renouvellement de passeport
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ Actes d'état civil
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ Cartes consulaires
                        </li>
                    </ul>
                    <Button className="w-full group-hover:translate-x-1 transition-transform" variant="default">
                        Commencer l'inscription <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            {/* Option Usager Étranger */}
            <Card
                className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group relative overflow-hidden"
                onClick={() => onSelect(CitizenType.ETRANGER)}
            >
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Globe2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Usager Étranger</CardTitle>
                    <CardDescription>
                        Pour les demandeurs de visa et autres services
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            ✓ Demandes de Visa
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ Légalisation de documents
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ Certificats spécifiques
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ Assistance administrative
                        </li>
                    </ul>
                    <Button className="w-full group-hover:translate-x-1 transition-transform" variant="outline">
                        Commencer l'inscription <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
