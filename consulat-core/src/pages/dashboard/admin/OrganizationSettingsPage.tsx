import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, Globe, Shield, Save, MapPin, Info, CheckCircle2 } from "lucide-react";
import { MOCK_SERVICES } from "@/data/mock-services";
import { MOCK_ORGANIZATIONS } from "@/data/mock-organizations";
import { COUNTRY_FLAGS } from "@/types/entity";
import { Organization, CountrySettings } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";

export default function OrganizationSettingsPage() {
    const [searchParams] = useSearchParams();
    const orgId = searchParams.get("orgId");
    const { toast } = useToast();

    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("general");
    const [activeCountry, setActiveCountry] = useState<string>("");

    // Form state
    const [formData, setFormData] = useState<Partial<Organization>>({});

    useEffect(() => {
        if (orgId) {
            const found = MOCK_ORGANIZATIONS.find(o => o.id === orgId);
            if (found) {
                setOrganization(found);
                setFormData(JSON.parse(JSON.stringify(found))); // Deep copy
                if (found.jurisdiction && found.jurisdiction.length > 0) {
                    setActiveCountry(found.jurisdiction[0]);
                }
            }
        }
    }, [orgId]);

    const updateCountrySettings = (countryCode: string, updates: Partial<CountrySettings>) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [countryCode]: {
                    ...(prev.settings?.[countryCode] || {}),
                    ...updates
                }
            }
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update the organization (in a real app, this would be an API call)
        setOrganization(formData as Organization);

        toast({
            title: "Configuration enregistrée",
            description: "Les paramètres structurels ont été mis à jour avec succès.",
        });

        setIsLoading(false);
    };

    if (!organization) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-3">
                        <Building2 className="w-16 h-16 mx-auto text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold text-muted-foreground">Organisation non trouvée</h2>
                        <p className="text-sm text-muted-foreground">Veuillez sélectionner une organisation valide.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="neu-raised p-6 rounded-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="neu-inset w-14 h-14 rounded-full flex items-center justify-center text-2xl">
                                {formData.jurisdiction?.[0] ? COUNTRY_FLAGS[formData.jurisdiction[0]] : <Building2 className="w-7 h-7 text-primary" />}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground mb-1">Paramétrage Structurel</h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    <span className="font-semibold text-primary">{formData.name}</span>
                                    <Badge variant="outline" className="ml-2">{formData.type?.replace(/_/g, ' ')}</Badge>
                                </p>
                            </div>
                        </div>
                        <Button
                            className="neu-raised gap-2 px-6"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Enregistrer la configuration
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="neu-inset w-full justify-start p-1 mb-6 overflow-x-auto h-auto gap-1 bg-transparent">
                        <TabsTrigger value="general" className="gap-2">
                            <Building2 className="w-4 h-4" /> Général
                        </TabsTrigger>
                        {formData.jurisdiction?.map(code => (
                            <TabsTrigger
                                key={code}
                                value={code}
                                className="gap-2"
                                onClick={() => setActiveCountry(code)}
                            >
                                <span className="text-base">{COUNTRY_FLAGS[code]}</span>
                                {code}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-6">
                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Informations Générales
                                </CardTitle>
                                <CardDescription>Identité et structure administrative de l'organisation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="org-name">Nom officiel de l'organisation</Label>
                                        <Input
                                            id="org-name"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="neu-inset"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type de structure</Label>
                                        <Input
                                            value={formData.type?.replace(/_/g, ' ') || ''}
                                            disabled
                                            className="neu-inset bg-muted/50"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Juridiction (Pays couverts)
                                    </Label>
                                    <div className="flex flex-wrap gap-3">
                                        {formData.jurisdiction?.map(code => (
                                            <div key={code} className="neu-raised px-4 py-2 rounded-lg flex items-center gap-3">
                                                <span className="text-2xl">{COUNTRY_FLAGS[code]}</span>
                                                <div>
                                                    <div className="font-semibold text-sm">{code}</div>
                                                    <div className="text-xs text-muted-foreground">Actif</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="neu-inset p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Configuration Multi-Pays</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Cette organisation gère {formData.jurisdiction?.length} juridiction(s).
                                                Utilisez les onglets par pays pour configurer les paramètres spécifiques à chaque territoire.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Country-Specific Tabs */}
                    {formData.jurisdiction?.map(countryCode => {
                        const settings = formData.settings?.[countryCode] || {
                            contact: { address: '', phone: '', email: '', website: '' },
                            hours: {},
                            resources: {}
                        };

                        return (
                            <TabsContent key={countryCode} value={countryCode} className="space-y-6">
                                {/* Country Header */}
                                <div className="neu-raised p-4 rounded-xl flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
                                    <span className="text-4xl">{COUNTRY_FLAGS[countryCode]}</span>
                                    <div>
                                        <h3 className="text-lg font-bold">Configuration pour {countryCode}</h3>
                                        <p className="text-sm text-muted-foreground">Paramètres spécifiques à cette juridiction</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Contact Info */}
                                    <Card className="neu-raised">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <MapPin className="w-5 h-5 text-primary" />
                                                Coordonnées Locales
                                            </CardTitle>
                                            <CardDescription>Informations de contact pour ce territoire</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`address-${countryCode}`}>Adresse physique</Label>
                                                <Textarea
                                                    id={`address-${countryCode}`}
                                                    value={settings.contact.address}
                                                    onChange={(e) => updateCountrySettings(countryCode, {
                                                        contact: { ...settings.contact, address: e.target.value }
                                                    })}
                                                    className="neu-inset min-h-[80px]"
                                                    placeholder="Adresse complète..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`phone-${countryCode}`}>Téléphone</Label>
                                                    <Input
                                                        id={`phone-${countryCode}`}
                                                        value={settings.contact.phone}
                                                        onChange={(e) => updateCountrySettings(countryCode, {
                                                            contact: { ...settings.contact, phone: e.target.value }
                                                        })}
                                                        className="neu-inset"
                                                        placeholder="+33 1 23 45 67 89"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`email-${countryCode}`}>Email</Label>
                                                    <Input
                                                        id={`email-${countryCode}`}
                                                        type="email"
                                                        value={settings.contact.email}
                                                        onChange={(e) => updateCountrySettings(countryCode, {
                                                            contact: { ...settings.contact, email: e.target.value }
                                                        })}
                                                        className="neu-inset"
                                                        placeholder="contact@..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`website-${countryCode}`}>Site web (optionnel)</Label>
                                                <Input
                                                    id={`website-${countryCode}`}
                                                    value={settings.contact.website || ''}
                                                    onChange={(e) => updateCountrySettings(countryCode, {
                                                        contact: { ...settings.contact, website: e.target.value }
                                                    })}
                                                    className="neu-inset"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Opening Hours */}
                                    <Card className="neu-raised">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Clock className="w-5 h-5 text-primary" />
                                                Horaires d'Ouverture
                                            </CardTitle>
                                            <CardDescription>Plages horaires du bureau local</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => {
                                                const daySettings = settings.hours?.[day] || { open: '09:00', close: '17:00', isOpen: true };
                                                return (
                                                    <div key={day} className="neu-inset p-3 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <Switch
                                                                    checked={daySettings.isOpen}
                                                                    onCheckedChange={(checked) => {
                                                                        updateCountrySettings(countryCode, {
                                                                            hours: {
                                                                                ...settings.hours,
                                                                                [day]: { ...daySettings, isOpen: checked }
                                                                            }
                                                                        });
                                                                    }}
                                                                />
                                                                <span className="font-medium text-sm w-20">{day}</span>
                                                            </div>
                                                            {daySettings.isOpen ? (
                                                                <Badge variant="outline" className="text-xs">Ouvert</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-xs">Fermé</Badge>
                                                            )}
                                                        </div>
                                                        {daySettings.isOpen && (
                                                            <div className="flex items-center gap-2 ml-11">
                                                                <Input
                                                                    type="time"
                                                                    value={daySettings.open}
                                                                    onChange={(e) => {
                                                                        updateCountrySettings(countryCode, {
                                                                            hours: {
                                                                                ...settings.hours,
                                                                                [day]: { ...daySettings, open: e.target.value }
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-28 h-8 neu-inset text-xs"
                                                                />
                                                                <span className="text-muted-foreground">-</span>
                                                                <Input
                                                                    type="time"
                                                                    value={daySettings.close}
                                                                    onChange={(e) => {
                                                                        updateCountrySettings(countryCode, {
                                                                            hours: {
                                                                                ...settings.hours,
                                                                                [day]: { ...daySettings, close: e.target.value }
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-28 h-8 neu-inset text-xs"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Services */}
                                <Card className="neu-raised">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-primary" />
                                            Services Disponibles
                                        </CardTitle>
                                        <CardDescription>
                                            Activez ou désactivez les services pour la juridiction {countryCode}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {MOCK_SERVICES.map((service) => (
                                                <div key={service.id} className="neu-inset p-4 rounded-lg hover:shadow-inner transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <Switch defaultChecked />
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-sm">{service.name}</div>
                                                                <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 pl-11">
                                                        <Badge variant="outline" className="text-[10px]">Service</Badge>
                                                        <span className="text-xs text-muted-foreground">Actif</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
