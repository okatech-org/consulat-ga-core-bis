import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    Building2, MapPin, Globe, Phone, Mail, ArrowLeft,
    Save, Users, CreditCard, FileText, Settings, Activity, Calendar
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { COUNTRY_FLAGS } from "@/types/organization";
import { Organization } from "@/types/organization";
import { organizationService } from "@/services/organizationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function OrganizationDetails() {
    const { entityId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "general";
    const { toast } = useToast();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrganization = async () => {
            if (!entityId) return;
            try {
                const data = await organizationService.getById(entityId);
                setOrganization(data);
            } catch (error) {
                console.error("Failed to load organization", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger l'organisation.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        loadOrganization();
    }, [entityId, toast]);

    const handleSave = async () => {
        if (!organization) return;
        try {
            await organizationService.update(organization.id, organization);
            toast({
                title: "Modifications enregistrées",
                description: "Les informations de l'organisation ont été mises à jour.",
            });
        } catch (error) {
            console.error("Failed to update organization", error);
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les modifications.",
                variant: "destructive"
            });
        }
    };

    if (loading) return <DashboardLayout><div className="flex items-center justify-center h-96">Chargement...</div></DashboardLayout>;
    if (!organization) return <DashboardLayout><div className="flex items-center justify-center h-96">Organisation introuvable</div></DashboardLayout>;

    const firstJurisdictionFlag = organization.jurisdiction?.[0] ? COUNTRY_FLAGS[organization.jurisdiction[0]] : '🌐';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/super-admin/organizations')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{firstJurisdictionFlag}</span>
                            <h1 className="text-2xl font-bold text-foreground">{organization.name}</h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Actif
                            </span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" /> {organization.city || 'N/A'}, {organization.country || 'N/A'}
                        </p>
                    </div>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Enregistrer
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
                    <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 overflow-x-auto">
                        <TabsTrigger value="general" className="gap-2 px-4 py-2">
                            <Building2 className="w-4 h-4" /> Général
                        </TabsTrigger>
                        <TabsTrigger value="services" className="gap-2 px-4 py-2">
                            <FileText className="w-4 h-4" /> Services
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2 px-4 py-2">
                            <Users className="w-4 h-4" /> Personnel
                        </TabsTrigger>
                        <TabsTrigger value="finance" className="gap-2 px-4 py-2">
                            <CreditCard className="w-4 h-4" /> Finances
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="gap-2 px-4 py-2">
                            <Activity className="w-4 h-4" /> Activité
                        </TabsTrigger>
                    </TabsList>

                    {/* GENERAL TAB */}
                    <TabsContent value="general" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Identity Card */}
                            <div className="neu-raised p-6 rounded-xl space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Identité
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nom de l'entité</Label>
                                        <Input 
                                            value={organization.name}
                                            onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Input value={organization.type.replace(/_/g, ' ')} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Code Pays</Label>
                                            <Input value={organization.country_code || 'N/A'} disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="neu-raised p-6 rounded-xl space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Localisation
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Ville</Label>
                                        <Input 
                                            value={organization.city || ''}
                                            onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pays</Label>
                                        <Input 
                                            value={organization.country || ''}
                                            onChange={(e) => setOrganization({ ...organization, country: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Jurisdiction */}
                            <div className="neu-raised p-6 rounded-xl space-y-4 md:col-span-2">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    Juridiction
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {organization.jurisdiction.map(code => (
                                        <div key={code} className="neu-inset px-4 py-2 rounded-lg flex items-center gap-3">
                                            <span className="text-2xl">{COUNTRY_FLAGS[code] || '🌐'}</span>
                                            <div>
                                                <div className="font-semibold text-sm">{code}</div>
                                                <div className="text-xs text-muted-foreground">Actif</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SERVICES TAB */}
                    <TabsContent value="services">
                        <div className="neu-raised p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-6">Configuration des Services</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {['PASSPORT', 'VISA', 'ETAT_CIVIL', 'LEGALISATION'].map((service) => (
                                    <div key={service} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{service}</p>
                                                <p className="text-xs text-muted-foreground">Service consulaire standard</p>
                                            </div>
                                        </div>
                                        <Switch 
                                            checked={organization.enabled_services?.includes(service) || false}
                                            onCheckedChange={(checked) => {
                                                const services = organization.enabled_services || [];
                                                const newServices = checked 
                                                    ? [...services, service]
                                                    : services.filter(s => s !== service);
                                                setOrganization({ ...organization, enabled_services: newServices });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* USERS TAB */}
                    <TabsContent value="users">
                        <div className="neu-raised p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Personnel Rattaché</h3>
                                <Button size="sm" variant="outline"><Settings className="w-4 h-4 mr-2" /> Gérer les Rôles</Button>
                            </div>
                            <div className="space-y-4">
                                {/* Mock User List */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold">
                                                {['JD', 'AB', 'CM'][i - 1]}
                                            </div>
                                            <div>
                                                <p className="font-medium">{['Jean Dupont', 'Alice Bernard', 'Charles Martin'][i - 1]}</p>
                                                <p className="text-xs text-muted-foreground">{['Consul Général', 'Agent Consulaire', 'Secrétaire'][i - 1]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Actif</span>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Planning
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Planning Hebdomadaire - {['Jean Dupont', 'Alice Bernard', 'Charles Martin'][i - 1]}</DialogTitle>
                                                        <DialogDescription>Horaires de travail et disponibilité</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => (
                                                            <div key={day} className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-muted/50">
                                                                <Label className="font-medium">{day}</Label>
                                                                <Input type="time" defaultValue="09:00" className="h-9" />
                                                                <Input type="time" defaultValue="17:00" className="h-9" />
                                                                <Switch defaultChecked />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* FINANCE TAB */}
                    <TabsContent value="finance">
                        <div className="neu-raised p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Informations Bancaires
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nom de la Banque</Label>
                                    <Input placeholder="Banque Centrale..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Numéro de Compte</Label>
                                    <Input placeholder="1234567890" />
                                </div>
                                <div className="space-y-2">
                                    <Label>IBAN</Label>
                                    <Input placeholder="GA00 0000 0000 0000 0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Code SWIFT/BIC</Label>
                                    <Input placeholder="ABCDGAXX" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ACTIVITY TAB */}
                    <TabsContent value="activity">
                        <div className="neu-raised p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-6">Activité Récente</h3>
                            <div className="space-y-4">
                                <p className="text-muted-foreground text-center py-8">Aucune activité récente à afficher.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
