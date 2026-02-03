import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Filter, Building2, User, Mail, Shield } from "lucide-react";
import { COUNTRY_FLAGS } from "@/types/entity";
import { UserDialog } from "@/components/super-admin/UserDialog";
import { useToast } from "@/components/ui/use-toast";
import { profileService } from "@/services/profileService";

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    organization_id?: string;
    organization?: {
        name: string;
        metadata?: any;
    };
}

export default function SuperAdminUsers() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const data = await profileService.getAll() as unknown as UserProfile[];
            setProfiles(data);
        } catch (error) {
            console.error("Failed to load profiles", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les utilisateurs.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedUser) {
                // Update existing user
                const [firstName, ...lastNameParts] = data.name.split(' ');
                const lastName = lastNameParts.join(' ');

                await profileService.update(selectedUser.id, {
                    personal: {
                        firstName,
                        lastName,
                    }
                });

                toast({
                    title: "Utilisateur modifié",
                    description: `L'utilisateur ${data.name} a été enregistré avec succès.`,
                });
            } else {
                // Create new user - Not fully implemented in this MVP without Auth integration
                toast({
                    title: "Non implémenté",
                    description: "La création d'utilisateur nécessite une intégration Auth complète.",
                    variant: "destructive"
                });
            }
            loadProfiles();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to save user", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue.",
                variant: "destructive"
            });
        }
    };

    // 1. Enrich Users with Entity Data
    const enrichedUsers = useMemo(() => {
        return profiles.map(user => {
            return {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role || 'CITIZEN',
                entityName: user.organization?.name || "Non assigné",
                country: user.organization?.metadata?.country || "Non assigné",
                countryCode: "GA", // Default to Gabon if unknown, or map from country name
                // Preserve other fields for dialog if needed, though they might be empty
                functions: [],
                billingFeatures: [],
                quotas: {}
            };
        });
    }, [profiles]);

    // 2. Filter Users (Smart Search)
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return enrichedUsers;
        const lowerTerm = searchTerm.toLowerCase();
        return enrichedUsers.filter(user =>
            user.name.toLowerCase().includes(lowerTerm) ||
            user.email?.toLowerCase().includes(lowerTerm) ||
            user.role.toLowerCase().includes(lowerTerm) ||
            user.entityName.toLowerCase().includes(lowerTerm) ||
            user.country.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, enrichedUsers]);

    // 3. Segment Users: Country -> Organization -> Users
    const segmentedData = useMemo(() => {
        const countries: Record<string, Record<string, typeof enrichedUsers>> = {};

        filteredUsers.forEach(user => {
            const countryKey = user.country;
            const orgKey = user.entityName;

            if (!countries[countryKey]) countries[countryKey] = {};
            if (!countries[countryKey][orgKey]) countries[countryKey][orgKey] = [];

            countries[countryKey][orgKey].push(user);
        });

        return countries;
    }, [filteredUsers]);

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
                        <p className="text-muted-foreground">
                            Vue segmentée du personnel diplomatique par pays et organisation.
                        </p>
                    </div>
                    <Button className="neu-raised gap-2" onClick={handleAdd}>
                        <User className="w-4 h-4" />
                        Ajouter un Utilisateur
                    </Button>
                </div>

                {/* Smart Search Bar */}
                <Card className="neu-raised">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Rechercher par nom, email, rôle, pays ou organisation..."
                                className="pl-9 neu-inset"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="neu-raised gap-2">
                            <Filter className="w-4 h-4" />
                            Filtres Avancés
                        </Button>
                    </CardContent>
                </Card>

                {/* Segmented View */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
                    ) : Object.keys(segmentedData).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Aucun utilisateur trouvé pour cette recherche.
                        </div>
                    ) : (
                        Object.entries(segmentedData).map(([country, orgs]) => (
                            <Card key={country} className="neu-raised overflow-hidden">
                                <CardHeader className="bg-muted/20 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <span className="text-2xl">{COUNTRY_FLAGS[Object.values(orgs)[0][0].countryCode] || '🏳️'}</span>
                                        {country}
                                        <Badge variant="secondary" className="ml-auto">
                                            {Object.values(orgs).reduce((acc, users) => acc + users.length, 0)} utilisateurs
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Accordion type="multiple" className="w-full">
                                        {Object.entries(orgs).map(([orgName, users]) => (
                                            <AccordionItem key={orgName} value={orgName} className="border-b last:border-0">
                                                <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/10">
                                                    <div className="flex items-center gap-3">
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                        <span className="font-medium">{orgName}</span>
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {users.length}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-6 pb-4 pt-2 bg-muted/5">
                                                    <div className="grid gap-3">
                                                        {users.map(user => (
                                                            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background border hover:shadow-sm transition-shadow">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                        {user.name.substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm">{user.name}</div>
                                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <Mail className="h-3 w-3" /> {user.email || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        {user.role}
                                                                    </Badge>
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleEdit(user)}>
                                                                        Gérer
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>


                <UserDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={selectedUser}
                    onSave={handleSave}
                />
            </div>
        </DashboardLayout >
    );
}
