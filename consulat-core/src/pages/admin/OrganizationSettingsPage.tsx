/**
 * OrganizationSettingsPage
 * Admin page for configuring a specific organization
 */

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Building2,
    Settings,
    Package,
    Globe,
    Save,
    Loader2,
} from 'lucide-react';
import { DIPLOMATIC_NETWORK } from '@/data/mock-diplomatic-network';
import { OrganizationServicesManager } from '@/components/admin/OrganizationServicesManager';
import { CountrySettingsPanel } from '@/components/admin/CountrySettingsPanel';
import { getCountryName } from '@/utils/consulate-utils';

/**
 * Page for configuring a specific organization's settings
 */
export function OrganizationSettingsPage() {
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Find organization
    const organization = useMemo(() => {
        return DIPLOMATIC_NETWORK.find(org => org.id === id);
    }, [id]);

    // Form state for general settings
    const [formData, setFormData] = useState({
        name: organization?.name || '',
        type: organization?.type || '',
        status: organization?.isActive ? 'active' : 'inactive',
    });

    // Country settings state
    const countryCodes = organization?.metadata?.jurisdiction ||
        (organization?.metadata?.countryCode ? [organization.metadata.countryCode] : []);

    const [countrySettings, setCountrySettings] = useState<Record<string, any>>({});

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Saved organization settings:', { formData, countrySettings });
        } finally {
            setIsLoading(false);
        }
    };

    if (!organization) {
        return (
            <div className="container mx-auto py-12 text-center">
                <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h1 className="mb-2 text-2xl font-bold">Organisation non trouvée</h1>
                <p className="mb-6 text-muted-foreground">
                    L'organisation demandée n'existe pas ou a été supprimée.
                </p>
                <Button asChild>
                    <Link to="/admin/organizations">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la liste
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6 py-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/admin/organizations">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{organization.name}</h1>
                        <p className="text-muted-foreground">
                            {organization.metadata?.city}, {organization.metadata?.country}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={organization.isActive ? 'default' : 'secondary'}>
                        {organization.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant="outline">{getTypeLabel(organization.type)}</Badge>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Général
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Services
                    </TabsTrigger>
                    <TabsTrigger value="countries" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Par pays ({countryCodes.length})
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                            <CardDescription>
                                Configurez les paramètres de base de l'organisation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom de l'organisation</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AMBASSADE">Ambassade</SelectItem>
                                            <SelectItem value="CONSULAT_GENERAL">Consulat Général</SelectItem>
                                            <SelectItem value="CONSULAT">Consulat</SelectItem>
                                            <SelectItem value="HAUT_COMMISSARIAT">Haut-Commissariat</SelectItem>
                                            <SelectItem value="MISSION_PERMANENTE">Mission Permanente</SelectItem>
                                            <SelectItem value="CONSULAT_HONORAIRE">Consulat Honoraire</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Statut</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Actif</SelectItem>
                                            <SelectItem value="inactive">Inactif</SelectItem>
                                            <SelectItem value="suspended">Suspendu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Enregistrer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services">
                    <OrganizationServicesManager
                        organizationId={organization.id}
                        organizationName={organization.name}
                    />
                </TabsContent>

                {/* Countries Tab */}
                <TabsContent value="countries" className="space-y-6">
                    {countryCodes.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="mb-2 text-lg font-medium">Aucun pays configuré</p>
                                <p className="text-sm text-muted-foreground">
                                    Cette organisation n'a pas de juridiction définie
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        countryCodes.map(code => (
                            <CountrySettingsPanel
                                key={code}
                                countryCode={code}
                                settings={countrySettings[code] || {
                                    countryCode: code,
                                    contact: {},
                                    schedule: {},
                                    holidays: [],
                                    closures: [],
                                }}
                                onChange={(settings) => {
                                    setCountrySettings(prev => ({
                                        ...prev,
                                        [code]: settings,
                                    }));
                                }}
                            />
                        ))
                    )}

                    {countryCodes.length > 0 && (
                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Enregistrer les paramètres pays
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        AMBASSADE: 'Ambassade',
        CONSULAT_GENERAL: 'Consulat Général',
        CONSULAT: 'Consulat',
        HAUT_COMMISSARIAT: 'Haut-Commissariat',
        MISSION_PERMANENTE: 'Mission Permanente',
        CONSULAT_HONORAIRE: 'Consulat Honoraire',
        AUTRE: 'Autre',
    };
    return labels[type] || type;
}

export default OrganizationSettingsPage;
