import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus, UserCheck, Calendar, MapPin, FileText,
    MoreVertical, Edit, Trash2, Eye, Baby
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickChildProfileModal } from "@/components/registration/QuickChildProfileModal";
import { MOCK_CHILDREN } from "@/data/mock-children";
import { MOCK_GABONAIS_CITIZENS } from "@/data/mock-citizens";
import { ProfileStatus } from "@/types/auth/child";

export default function CitizenChildrenPage() {
    const navigate = useNavigate();
    const user = MOCK_GABONAIS_CITIZENS[0];
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const getStatusBadge = (status: ProfileStatus) => {
        switch (status) {
            case ProfileStatus.ACTIVE:
                return <Badge className="bg-green-100 text-green-700 border-green-200">Actif</Badge>;
            case ProfileStatus.PENDING:
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En attente</Badge>;
            case ProfileStatus.SUSPENDED:
                return <Badge className="bg-red-100 text-red-700 border-red-200">Suspendu</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const calculateAge = (birthDate: Date | undefined) => {
        if (!birthDate) return "N/A";
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Baby className="w-7 h-7 text-primary" />
                        Mes Enfants
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez les profils de vos enfants mineurs rattachés à votre dossier consulaire.
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter un enfant
                </Button>
            </div>

            {/* Children Grid */}
            {MOCK_CHILDREN.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_CHILDREN.map((child) => (
                        <Card key={child.id} className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {child.personal.firstName.charAt(0)}{child.personal.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {child.personal.firstName} {child.personal.lastName}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {calculateAge(child.personal.birthDate)} ans
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => navigate(`/dashboard/citizen/child/${child.id}`)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Voir le profil
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(child.status)}
                                    <Badge variant="outline" className="gap-1">
                                        <span className="text-lg">🇬🇦</span>
                                        Gabonais
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Né(e) le {child.personal.birthDate?.toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{child.personal.birthPlace}, {child.personal.birthCountry}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <UserCheck className="w-4 h-4" />
                                        <span>{child.parents.length} parent(s) lié(s)</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-border/50 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => navigate(`/dashboard/citizen/child/${child.id}`)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Détails
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Documents
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="bg-card border-border/50 shadow-sm">
                    <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
                            <Baby className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Aucun enfant enregistré</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Vous n'avez pas encore enregistré d'enfant mineur sur votre dossier consulaire.
                            Ajoutez vos enfants pour bénéficier des services consulaires les concernant.
                        </p>
                        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Ajouter mon premier enfant
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-900">Pièces justificatives</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Pour chaque enfant, vous devrez fournir : acte de naissance,
                                justificatif de nationalité gabonaise, et une photo d'identité récente.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Child Modal */}
            <QuickChildProfileModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                residenceCountry={user.currentAddress.country}
                onSuccess={(childId) => {
                    console.log("Child created:", childId);
                    setIsAddModalOpen(false);
                }}
            />
        </div>
    );
}
