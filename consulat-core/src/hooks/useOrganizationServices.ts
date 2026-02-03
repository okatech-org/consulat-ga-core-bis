/**
 * useOrganizationServices Hook
 * Manages services for a specific organization
 */

import { useState, useMemo, useCallback } from 'react';
import {
    getEnabledServicesForOrganization,
    getOrganizationServicesConfig,
    getOrganizationServiceNotes,
    ORGANIZATION_SERVICES,
    type OrganizationServicesConfig,
} from '@/data/organization-services';
import { MOCK_SERVICES } from '@/data/mock-services';
import type { ConsularService } from '@/types/services';

interface UseOrganizationServicesResult {
    /** All available services from the catalog */
    allServices: ConsularService[];
    /** Services enabled for this organization */
    enabledServices: ConsularService[];
    /** IDs of enabled services */
    enabledServiceIds: string[];
    /** Organization config including notes */
    config: OrganizationServicesConfig | undefined;
    /** Notes about service restrictions */
    notes: string | undefined;
    /** Add a service to the organization */
    addService: (serviceId: string) => void;
    /** Remove a service from the organization */
    removeService: (serviceId: string) => void;
    /** Toggle a service on/off */
    toggleService: (serviceId: string) => void;
    /** Check if a specific service is enabled */
    isServiceEnabled: (serviceId: string) => boolean;
    /** Set all services at once */
    setServices: (serviceIds: string[]) => void;
    /** Loading state */
    isLoading: boolean;
    /** Has unsaved changes */
    hasChanges: boolean;
    /** Reset to original state */
    reset: () => void;
    /** Save changes (mock for now) */
    save: () => Promise<void>;
}

/**
 * Hook for managing services of a specific organization
 * In demo mode, changes are stored in local state
 * Can be extended to persist to backend later
 */
export function useOrganizationServices(organizationId: string): UseOrganizationServicesResult {
    // Get initial enabled services from config
    const initialEnabledIds = useMemo(
        () => getEnabledServicesForOrganization(organizationId),
        [organizationId]
    );

    // Local state for enabled services (allows editing)
    const [enabledServiceIds, setEnabledServiceIds] = useState<string[]>(initialEnabledIds);
    const [isLoading, setIsLoading] = useState(false);

    // Get all services from catalog
    const allServices = useMemo(() => MOCK_SERVICES, []);

    // Get enabled services as full objects
    const enabledServices = useMemo(
        () => allServices.filter(service => enabledServiceIds.includes(service.id)),
        [allServices, enabledServiceIds]
    );

    // Get organization config
    const config = useMemo(
        () => getOrganizationServicesConfig(organizationId),
        [organizationId]
    );

    // Get notes
    const notes = useMemo(
        () => getOrganizationServiceNotes(organizationId),
        [organizationId]
    );

    // Check if there are unsaved changes
    const hasChanges = useMemo(() => {
        if (enabledServiceIds.length !== initialEnabledIds.length) return true;
        return !enabledServiceIds.every(id => initialEnabledIds.includes(id));
    }, [enabledServiceIds, initialEnabledIds]);

    // Add a service
    const addService = useCallback((serviceId: string) => {
        setEnabledServiceIds(prev => {
            if (prev.includes(serviceId)) return prev;
            return [...prev, serviceId];
        });
    }, []);

    // Remove a service
    const removeService = useCallback((serviceId: string) => {
        setEnabledServiceIds(prev => prev.filter(id => id !== serviceId));
    }, []);

    // Toggle a service
    const toggleService = useCallback((serviceId: string) => {
        setEnabledServiceIds(prev => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            }
            return [...prev, serviceId];
        });
    }, []);

    // Check if enabled
    const isServiceEnabled = useCallback(
        (serviceId: string) => enabledServiceIds.includes(serviceId),
        [enabledServiceIds]
    );

    // Set all services at once
    const setServices = useCallback((serviceIds: string[]) => {
        setEnabledServiceIds(serviceIds);
    }, []);

    // Reset to original
    const reset = useCallback(() => {
        setEnabledServiceIds(initialEnabledIds);
    }, [initialEnabledIds]);

    // Save changes (mock - in real app would call API)
    const save = useCallback(async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // In a real implementation, this would update the backend
            // For now, we just log the change
            console.log(`[Organization ${organizationId}] Services updated:`, enabledServiceIds);

            // Update the local config (for demo purposes)
            const configIndex = ORGANIZATION_SERVICES.findIndex(
                c => c.organizationId === organizationId
            );

            if (configIndex !== -1) {
                ORGANIZATION_SERVICES[configIndex].enabledServiceIds = [...enabledServiceIds];
            } else {
                // Add new config
                ORGANIZATION_SERVICES.push({
                    organizationId,
                    enabledServiceIds: [...enabledServiceIds],
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [organizationId, enabledServiceIds]);

    return {
        allServices,
        enabledServices,
        enabledServiceIds,
        config,
        notes,
        addService,
        removeService,
        toggleService,
        isServiceEnabled,
        setServices,
        isLoading,
        hasChanges,
        reset,
        save,
    };
}

/**
 * Lightweight hook to just check service availability
 */
export function useIsServiceEnabled(organizationId: string, serviceId: string): boolean {
    const enabledServices = useMemo(
        () => getEnabledServicesForOrganization(organizationId),
        [organizationId]
    );

    return enabledServices.includes(serviceId);
}
