/**
 * OrganizationServicesManager Component
 * Admin interface for managing services available to an organization
 */

import React, { useState } from 'react';
import { useOrganizationServices } from '@/hooks/useOrganizationServices';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    AlertCircle,
    Check,
    Search,
    Save,
    RotateCcw,
    Loader2,
    Info,
} from 'lucide-react';
import type { ConsularService } from '@/types/services';

interface OrganizationServicesManagerProps {
    organizationId: string;
    organizationName?: string;
    onSave?: () => void;
}

/**
 * Admin component for managing which services are enabled for an organization
 */
export function OrganizationServicesManager({
    organizationId,
    organizationName = 'Organisation',
    onSave,
}: OrganizationServicesManagerProps) {
    const {
        allServices,
        enabledServiceIds,
        notes,
        toggleService,
        isServiceEnabled,
        isLoading,
        hasChanges,
        reset,
        save,
    } = useOrganizationServices(organizationId);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    // Filter services
    const filteredServices = allServices.filter(service => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = !categoryFilter || service.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = [...new Set(allServices.map(s => s.category))];

    // Group services by category
    const servicesByCategory = categories.reduce((acc, category) => {
        acc[category] = filteredServices.filter(s => s.category === category);
        return acc;
    }, {} as Record<string, ConsularService[]>);

    const handleSave = async () => {
        await save();
        onSave?.();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Services disponibles</CardTitle>
                        <CardDescription>
                            Configurez les services proposés par {organizationName}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {hasChanges && (
                            <>
                                <Button variant="outline" size="sm" onClick={reset} disabled={isLoading}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Annuler
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Enregistrer
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Notes about restrictions */}
                {notes && (
                    <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                        <Info className="mt-0.5 h-4 w-4 text-amber-600" />
                        <p className="text-sm text-amber-800">{notes}</p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Search and filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un service..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={categoryFilter === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter(null)}
                        >
                            Tous
                        </Button>
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={categoryFilter === category ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCategoryFilter(category)}
                            >
                                {getCategoryLabel(category)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                        <strong>{enabledServiceIds.length}</strong> services activés sur{' '}
                        <strong>{allServices.length}</strong>
                    </span>
                    {hasChanges && (
                        <Badge variant="outline" className="text-amber-600">
                            Modifications non enregistrées
                        </Badge>
                    )}
                </div>

                <Separator />

                {/* Services by category */}
                <div className="space-y-6">
                    {Object.entries(servicesByCategory).map(([category, services]) => {
                        if (services.length === 0) return null;

                        const enabledCount = services.filter(s => isServiceEnabled(s.id)).length;

                        return (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">{getCategoryLabel(category)}</h3>
                                    <Badge variant="secondary">
                                        {enabledCount}/{services.length}
                                    </Badge>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {services.map(service => (
                                        <ServiceToggleCard
                                            key={service.id}
                                            service={service}
                                            enabled={isServiceEnabled(service.id)}
                                            onToggle={() => toggleService(service.id)}
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredServices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <AlertCircle className="mb-2 h-8 w-8" />
                        <p>Aucun service trouvé</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ServiceToggleCardProps {
    service: ConsularService;
    enabled: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

function ServiceToggleCard({ service, enabled, onToggle, disabled }: ServiceToggleCardProps) {
    return (
        <div
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${enabled ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
                }`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {enabled && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    <span className={`text-sm font-medium truncate ${enabled ? 'text-primary' : ''}`}>
                        {service.name}
                    </span>
                </div>
                {service.pricing && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {service.pricing.isFree
                            ? 'Gratuit'
                            : `${service.pricing.price} ${service.pricing.currency || 'EUR'}`}
                    </p>
                )}
            </div>
            <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                disabled={disabled}
                className="ml-2 flex-shrink-0"
            />
        </div>
    );
}

/**
 * Get human-readable category label
 */
function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        identity: 'Identité',
        civil_status: 'État Civil',
        visa: 'Visas',
        certification: 'Certifications',
        transcript: 'Transcriptions',
        registration: 'Inscriptions',
        assistance: 'Assistance',
        travel_document: 'Documents de Voyage',
        other: 'Autres',
        passport: 'Passeports',
        administrative: 'Services Administratifs',
    };
    return labels[category] || category;
}

export default OrganizationServicesManager;
