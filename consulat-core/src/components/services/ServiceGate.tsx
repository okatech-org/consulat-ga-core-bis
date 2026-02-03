/**
 * ServiceGate Component
 * Conditionally renders children based on service availability
 */

import React from 'react';
import { useServiceAvailability } from '@/hooks/useUserConsulate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceGateProps {
    /** The service ID to check availability for */
    serviceId: string;
    /** Content to render if service is available */
    children: React.ReactNode;
    /** Custom fallback component when service is unavailable */
    fallback?: React.ReactNode;
    /** Whether to show registration CTA for unregistered users */
    showRegistrationCTA?: boolean;
}

/**
 * Gate component that checks if a service is available
 * Renders children if available, or fallback message if not
 */
export function ServiceGate({
    serviceId,
    children,
    fallback,
    showRegistrationCTA = true,
}: ServiceGateProps) {
    const { isAvailable, reason } = useServiceAvailability(serviceId);

    if (isAvailable) {
        return <>{children}</>;
    }

    // Custom fallback provided
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default unavailable message
    return (
        <ServiceUnavailableCard
            reason={reason || 'Ce service n\'est pas disponible.'}
            showRegistrationCTA={showRegistrationCTA}
        />
    );
}

interface ServiceUnavailableCardProps {
    reason: string;
    showRegistrationCTA?: boolean;
}

/**
 * Card displayed when a service is unavailable
 */
export function ServiceUnavailableCard({
    reason,
    showRegistrationCTA = true,
}: ServiceUnavailableCardProps) {
    const isRegistrationIssue = reason.includes('inscrit');

    return (
        <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                    {isRegistrationIssue ? (
                        <Lock className="h-5 w-5" />
                    ) : (
                        <AlertTriangle className="h-5 w-5" />
                    )}
                    Service non disponible
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-amber-800">{reason}</p>

                {isRegistrationIssue && showRegistrationCTA && (
                    <div className="flex gap-3">
                        <Button asChild variant="default" size="sm">
                            <Link to="/register">
                                S'inscrire
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/login">Se connecter</Link>
                        </Button>
                    </div>
                )}

                {!isRegistrationIssue && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                            Contactez votre consulat pour plus d'informations sur les services disponibles.
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Inline variant for smaller contexts (e.g., in a list)
 */
export function ServiceUnavailableBadge({ reason }: { reason: string }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            <span>Non disponible</span>
        </div>
    );
}

export default ServiceGate;
