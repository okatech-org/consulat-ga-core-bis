/**
 * useUserTypeServices Hook
 * Manages service availability based on user type and admin configuration
 */

import { useState, useMemo, useCallback } from 'react';
import {
    RessortissantType,
    VisiteurType,
    DEFAULT_SERVICES_BY_USER_TYPE,
    getDefaultServicesForUserType,
    isRessortissant,
    isVisiteur,
    UserCategory,
} from '@/types/user-account-types';
import { getEnabledServicesForOrganization } from '@/data/organization-services';
import { MOCK_SERVICES } from '@/data/mock-services';
import type { ConsularService } from '@/types/services';

interface UseUserTypeServicesResult {
    /** Services available for this user type */
    availableServices: ConsularService[];
    /** Service IDs available for this user type */
    availableServiceIds: string[];
    /** Check if a service is available */
    isServiceAvailable: (serviceId: string) => boolean;
    /** Get reason why a service is unavailable */
    getUnavailableReason: (serviceId: string) => string | null;
    /** User category */
    userCategory: UserCategory | null;
    /** Is Gabonese national */
    isGabonese: boolean;
    /** Is foreign visitor */
    isForeigner: boolean;
}

interface UseUserTypeServicesOptions {
    /** User type (RessortissantType or VisiteurType) */
    userType: string;
    /** Organization ID (to check organization-specific service config) */
    organizationId?: string;
    /** Admin overrides for services (from organization settings) */
    adminOverrides?: Record<string, string[]>;
}

/**
 * Hook that determines which services are available based on user type
 * Combines:
 * 1. Default services per user type
 * 2. Organization-specific service config
 * 3. Admin overrides
 */
export function useUserTypeServices(options: UseUserTypeServicesOptions): UseUserTypeServicesResult {
    const { userType, organizationId, adminOverrides } = options;

    // Determine user category
    const userCategory = useMemo(() => {
        if (isRessortissant(userType)) return UserCategory.RESSORTISSANT;
        if (isVisiteur(userType)) return UserCategory.VISITEUR;
        return null;
    }, [userType]);

    const isGabonese = userCategory === UserCategory.RESSORTISSANT;
    const isForeigner = userCategory === UserCategory.VISITEUR;

    // Get available service IDs
    const availableServiceIds = useMemo(() => {
        // Start with default services for user type
        let serviceIds = getDefaultServicesForUserType(userType);

        // Apply admin overrides if provided
        if (adminOverrides && adminOverrides[userType]) {
            serviceIds = adminOverrides[userType];
        }

        // Filter by organization config if organization is specified
        if (organizationId) {
            const orgServices = getEnabledServicesForOrganization(organizationId);
            // Intersection: services available for user type AND enabled for organization
            serviceIds = serviceIds.filter(id => orgServices.includes(id));
        }

        return serviceIds;
    }, [userType, organizationId, adminOverrides]);

    // Get full service objects
    const availableServices = useMemo(() => {
        return MOCK_SERVICES.filter(service =>
            availableServiceIds.includes(service.id)
        );
    }, [availableServiceIds]);

    // Check if a service is available
    const isServiceAvailable = useCallback((serviceId: string) => {
        return availableServiceIds.includes(serviceId);
    }, [availableServiceIds]);

    // Get unavailability reason
    const getUnavailableReason = useCallback((serviceId: string): string | null => {
        if (isServiceAvailable(serviceId)) return null;

        // Check if service exists at all
        const service = MOCK_SERVICES.find(s => s.id === serviceId);
        if (!service) {
            return 'Service non disponible';
        }

        // Check if it's a user type restriction
        const defaultForType = getDefaultServicesForUserType(userType);
        if (!defaultForType.includes(serviceId)) {
            if (isGabonese && userType === RessortissantType.DE_PASSAGE) {
                return 'Ce service est réservé aux résidents inscrits (+6 mois)';
            }
            if (isForeigner) {
                return 'Ce service est réservé aux ressortissants gabonais';
            }
            return 'Ce service n\'est pas disponible pour votre type de compte';
        }

        // Check if it's an organization restriction
        if (organizationId) {
            const orgServices = getEnabledServicesForOrganization(organizationId);
            if (!orgServices.includes(serviceId)) {
                return 'Ce service n\'est pas disponible dans votre consulat';
            }
        }

        return 'Service temporairement indisponible';
    }, [userType, organizationId, isGabonese, isForeigner, isServiceAvailable]);

    return {
        availableServices,
        availableServiceIds,
        isServiceAvailable,
        getUnavailableReason,
        userCategory,
        isGabonese,
        isForeigner,
    };
}

/**
 * Admin hook for configuring services per user type
 */
interface UseAdminUserTypeServicesResult {
    /** Current service config per user type */
    config: Record<string, string[]>;
    /** Update services for a user type */
    updateServicesForType: (userType: string, serviceIds: string[]) => void;
    /** Reset to defaults */
    resetToDefaults: () => void;
    /** Has unsaved changes */
    hasChanges: boolean;
    /** Save changes */
    save: () => Promise<void>;
}

export function useAdminUserTypeServices(
    organizationId: string
): UseAdminUserTypeServicesResult {
    // Initialize with defaults
    const [config, setConfig] = useState<Record<string, string[]>>(() => ({
        [RessortissantType.RESIDENT]: [...DEFAULT_SERVICES_BY_USER_TYPE[RessortissantType.RESIDENT]],
        [RessortissantType.DE_PASSAGE]: [...DEFAULT_SERVICES_BY_USER_TYPE[RessortissantType.DE_PASSAGE]],
        [VisiteurType.VISA_TOURISME]: [...DEFAULT_SERVICES_BY_USER_TYPE[VisiteurType.VISA_TOURISME]],
        [VisiteurType.VISA_AFFAIRES]: [...DEFAULT_SERVICES_BY_USER_TYPE[VisiteurType.VISA_AFFAIRES]],
        [VisiteurType.SERVICE_GABON]: [...DEFAULT_SERVICES_BY_USER_TYPE[VisiteurType.SERVICE_GABON]],
    }));

    const [hasChanges, setHasChanges] = useState(false);

    const updateServicesForType = useCallback((userType: string, serviceIds: string[]) => {
        setConfig(prev => ({
            ...prev,
            [userType]: serviceIds,
        }));
        setHasChanges(true);
    }, []);

    const resetToDefaults = useCallback(() => {
        setConfig({
            [RessortissantType.RESIDENT]: [...DEFAULT_SERVICES_BY_USER_TYPE[RessortissantType.RESIDENT]],
            [RessortissantType.DE_PASSAGE]: [...DEFAULT_SERVICES_BY_USER_TYPE[RessortissantType.DE_PASSAGE]],
            [VisiteurType.VISA_TOURISME]: [...DEFAULT_SERVICES_BY_USER_TYPE[VisiteurType.VISA_TOURISME]],
            [VisiteurType.VISA_AFFAIRES]: [...DEFAULT_SERVICES_BY_USER_TYPE[VisiteurType.VISA_AFFAIRES]],
            [VisiteurType.SERVICE_GABON]: [...DEFAULT_SERVICES_BY_USER_TYPE[VisiteurType.SERVICE_GABON]],
        });
        setHasChanges(false);
    }, []);

    const save = useCallback(async () => {
        // In a real app, this would save to the backend
        console.log(`[Organization ${organizationId}] User type services config saved:`, config);
        await new Promise(resolve => setTimeout(resolve, 500));
        setHasChanges(false);
    }, [organizationId, config]);

    return {
        config,
        updateServicesForType,
        resetToDefaults,
        hasChanges,
        save,
    };
}

export default useUserTypeServices;
