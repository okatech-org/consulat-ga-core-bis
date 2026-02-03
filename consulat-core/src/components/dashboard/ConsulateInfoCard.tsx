/**
 * ConsulateInfoCard Component
 * Displays the consulate/embassy information for the current user
 */

import React from 'react';
import { useUserConsulate } from '@/hooks/useUserConsulate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Clock,
    Globe,
    AlertCircle,
    ChevronRight,
    ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCountryName } from '@/utils/consulate-utils';

interface ConsulateInfoCardProps {
    /** Whether to show a compact version */
    compact?: boolean;
    /** Custom className */
    className?: string;
}

/**
 * Card that automatically displays the user's assigned consulate information
 */
export function ConsulateInfoCard({ compact = false, className = '' }: ConsulateInfoCardProps) {
    const { consulate, residenceCountry, availableServices, allOrganizations, isRegistered } = useUserConsulate();

    // No consulate assigned
    if (!consulate) {
        return (
            <Card className={`border-amber-200 bg-amber-50/50 ${className}`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                        <AlertCircle className="h-5 w-5" />
                        Aucun consulat associé
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-amber-800">
                        Veuillez mettre à jour votre profil avec votre pays de résidence pour voir les informations de votre consulat.
                    </p>
                    {!isRegistered && (
                        <Button asChild size="sm">
                            <Link to="/register">
                                S'inscrire maintenant
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    const metadata = consulate.metadata;
    const contact = metadata?.contact;

    // Compact version
    if (compact) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{consulate.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {metadata?.city}, {getCountryName(residenceCountry || '')}
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary">{availableServices.length} services</Badge>
                </CardContent>
            </Card>
        );
    }

    // Full version
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {consulate.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Votre représentation consulaire en {getCountryName(residenceCountry || '')}
                        </CardDescription>
                    </div>
                    <Badge variant="outline">{getOrganizationTypeLabel(consulate.type)}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-2">
                    {contact?.address && (
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <span>{contact.address}</span>
                        </div>
                    )}

                    {contact?.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${contact.phone}`} className="hover:underline">
                                {contact.phone}
                            </a>
                        </div>
                    )}

                    {contact?.email && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${contact.email}`} className="hover:underline">
                                {contact.email}
                            </a>
                        </div>
                    )}

                    {contact?.website && (
                        <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                                href={`https://${contact.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline"
                            >
                                {contact.website}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Opening Hours */}
                {metadata?.hours && (
                    <div className="border-t pt-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            Horaires d'ouverture
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                            {Object.entries(metadata.hours).slice(0, 5).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                    <span>{day}</span>
                                    <span>
                                        {(hours as { isOpen: boolean; open: string; close: string }).isOpen
                                            ? `${(hours as { open: string }).open} - ${(hours as { close: string }).close}`
                                            : 'Fermé'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Services Badge */}
                <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                        {availableServices.length} service{availableServices.length > 1 ? 's' : ''} disponible{availableServices.length > 1 ? 's' : ''}
                    </span>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/services">
                            Voir les services
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Other organizations in territory */}
                {allOrganizations.length > 1 && (
                    <div className="border-t pt-3">
                        <p className="mb-2 text-xs text-muted-foreground">
                            Autres représentations en {getCountryName(residenceCountry || '')}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {allOrganizations
                                .filter(org => org.id !== consulate.id)
                                .slice(0, 3)
                                .map(org => (
                                    <Badge key={org.id} variant="secondary" className="text-xs">
                                        {org.name.replace('du Gabon', '').replace('en France', '').trim()}
                                    </Badge>
                                ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Get human-readable label for organization type
 */
function getOrganizationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        CONSULAT_GENERAL: 'Consulat Général',
        CONSULAT: 'Consulat',
        AMBASSADE: 'Ambassade',
        HAUT_COMMISSARIAT: 'Haut-Commissariat',
        MISSION_PERMANENTE: 'Mission Permanente',
        CONSULAT_HONORAIRE: 'Consulat Honoraire',
        AUTRE: 'Autre',
    };
    return labels[type] || type;
}

export default ConsulateInfoCard;
