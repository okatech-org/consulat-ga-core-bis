/**
 * useUserConsulate Hook
 * Automatically detects the consulate/embassy for a user based on their residence country
 */

import { useMemo } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Organization } from '@/types/organization';
import {
    getPrimaryConsulateForUser,
    findAllOrganizationsForCountry,
    isServiceAvailableForOrganization,
    getServiceUnavailableReason,
} from '@/utils/consulate-utils';
import { getEnabledServicesForOrganization } from '@/data/organization-services';

interface UserConsulateResult {
    /** The primary consulate/embassy for the user's residence country */
    consulate: Organization | null;
    /** All organizations covering the user's territory (embassy, consulates, etc.) */
    allOrganizations: Organization[];
    /** The user's residence country code */
    residenceCountry: string | null;
    /** List of enabled service IDs for the primary consulate */
    availableServices: string[];
    /** Check if a specific service is available */
    isServiceAvailable: (serviceId: string) => boolean;
    /** Get explanation for why a service is unavailable */
    getUnavailableReason: (serviceId: string) => string;
    /** Whether the user is registered (has a validated profile) */
    isRegistered: boolean;
    /** Loading state */
    isLoading: boolean;
}

export function useUserConsulate(): UserConsulateResult {
    const { currentUser } = useDemo();

    // Get residence country from user (direct field on DemoUser)
    const residenceCountry = useMemo(() => {
        // Use residenceCountry field directly from DemoUser
        if (currentUser?.residenceCountry) {
            return currentUser.residenceCountry;
        }
        // Fallback to entity country if available
        if (currentUser?.entityId) {
            // Infer country from entity ID prefix for demo purposes
            if (currentUser.entityId.includes('fr-')) return 'FR';
            if (currentUser.entityId.includes('ma-')) return 'MA';
            if (currentUser.entityId.includes('us-')) return 'US';
            if (currentUser.entityId.includes('be-')) return 'BE';
            if (currentUser.entityId.includes('de-')) return 'DE';
            if (currentUser.entityId.includes('uk-')) return 'GB';
        }
        return null;
    }, [currentUser]);

    // Find the primary consulate for the user
    const consulate = useMemo(() => {
        if (!residenceCountry) return null;
        return getPrimaryConsulateForUser(residenceCountry);
    }, [residenceCountry]);

    // Find all organizations covering this territory
    const allOrganizations = useMemo(() => {
        if (!residenceCountry) return [];
        return findAllOrganizationsForCountry(residenceCountry);
    }, [residenceCountry]);

    // Get available services for the primary consulate
    const availableServices = useMemo(() => {
        if (!consulate) return [];
        return getEnabledServicesForOrganization(consulate.id);
    }, [consulate]);

    // Check if a service is available
    const isServiceAvailable = useMemo(() => {
        return (serviceId: string): boolean => {
            if (!consulate) return false;
            return isServiceAvailableForOrganization(consulate.id, serviceId);
        };
    }, [consulate]);

    // Get unavailable reason
    const getUnavailableReason = useMemo(() => {
        return (serviceId: string): string => {
            if (!consulate) {
                return 'Aucun consulat n\'est associé à votre profil. Veuillez mettre à jour votre pays de résidence.';
            }
            return getServiceUnavailableReason(consulate.id, serviceId, consulate.name);
        };
    }, [consulate]);

    // Check if user is registered
    // A user with a role and entityId is considered registered in the demo context
    const isRegistered = useMemo(() => {
        if (!currentUser) return false;
        // Any user with an entityId is considered registered
        return !!currentUser.entityId || !!currentUser.role;
    }, [currentUser]);

    return {
        consulate,
        allOrganizations,
        residenceCountry,
        availableServices,
        isServiceAvailable,
        getUnavailableReason,
        isRegistered,
        isLoading: false,
    };
}

/**
 * Hook variant that only returns service availability
 * Use this for lightweight service checks
 */
export function useServiceAvailability(serviceId: string): {
    isAvailable: boolean;
    reason: string | null;
} {
    const { consulate, isRegistered, isServiceAvailable, getUnavailableReason } = useUserConsulate();

    return useMemo(() => {
        // Not registered
        if (!isRegistered) {
            return {
                isAvailable: false,
                reason: 'Vous devez être inscrit pour accéder aux services consulaires.',
            };
        }

        // No consulate
        if (!consulate) {
            return {
                isAvailable: false,
                reason: 'Aucun consulat n\'est associé à votre profil.',
            };
        }

        // Check service availability
        if (!isServiceAvailable(serviceId)) {
            return {
                isAvailable: false,
                reason: getUnavailableReason(serviceId),
            };
        }

        return { isAvailable: true, reason: null };
    }, [consulate, isRegistered, serviceId, isServiceAvailable, getUnavailableReason]);
}
