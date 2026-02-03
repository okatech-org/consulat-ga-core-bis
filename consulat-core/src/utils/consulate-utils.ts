/**
 * Consulate Utility Functions
 * Helpers for territory-based consulate detection and service availability
 */

import { DIPLOMATIC_NETWORK } from '@/data/mock-diplomatic-network';
import { Organization } from '@/types/organization';
import { getEnabledServicesForOrganization } from '@/data/organization-services';

/**
 * Find the consulate/embassy that covers a specific country
 * Uses both exact country code match and jurisdiction search
 */
export function findConsulateByCountry(countryCode: string): Organization | null {
    if (!countryCode) return null;

    const normalizedCode = countryCode.toUpperCase();

    // Priority 1: Exact country code match for consulates (not embassies)
    const exactConsulate = DIPLOMATIC_NETWORK.find(org =>
        org.metadata?.countryCode === normalizedCode &&
        (org.type === 'CONSULAT_GENERAL' || org.type === 'CONSULAT')
    );
    if (exactConsulate) return exactConsulate;

    // Priority 2: Exact country code match for any organization
    const exactMatch = DIPLOMATIC_NETWORK.find(org =>
        org.metadata?.countryCode === normalizedCode
    );
    if (exactMatch) return exactMatch;

    // Priority 3: Search in jurisdiction arrays
    const jurisdictionMatch = DIPLOMATIC_NETWORK.find(org =>
        org.metadata?.jurisdiction?.some(j =>
            j.toUpperCase().includes(normalizedCode) ||
            normalizedCode.includes(j.toUpperCase())
        )
    );

    return jurisdictionMatch || null;
}

/**
 * Find all organizations that cover a specific country
 * (e.g., both embassy and consulate in France)
 */
export function findAllOrganizationsForCountry(countryCode: string): Organization[] {
    if (!countryCode) return [];

    const normalizedCode = countryCode.toUpperCase();

    return DIPLOMATIC_NETWORK.filter(org =>
        org.metadata?.countryCode === normalizedCode ||
        org.metadata?.jurisdiction?.some(j =>
            j.toUpperCase().includes(normalizedCode)
        )
    );
}

/**
 * Get the primary consulate for a user based on their residence country
 * Prefers CONSULAT_GENERAL over CONSULAT over AMBASSADE
 */
export function getPrimaryConsulateForUser(residenceCountry: string): Organization | null {
    if (!residenceCountry) return null;

    const organizations = findAllOrganizationsForCountry(residenceCountry);
    if (organizations.length === 0) return null;

    // Sort by preference: CONSULAT_GENERAL > CONSULAT > AMBASSADE > others
    const typePriority: Record<string, number> = {
        'CONSULAT_GENERAL': 1,
        'CONSULAT': 2,
        'AMBASSADE': 3,
        'HAUT_COMMISSARIAT': 4,
        'MISSION_PERMANENTE': 5,
        'CONSULAT_HONORAIRE': 6,
        'AUTRE': 7,
    };

    organizations.sort((a, b) => {
        const priorityA = typePriority[a.type] || 99;
        const priorityB = typePriority[b.type] || 99;
        return priorityA - priorityB;
    });

    return organizations[0];
}

/**
 * Check if a specific service is available for a given organization
 */
export function isServiceAvailableForOrganization(
    organizationId: string,
    serviceId: string
): boolean {
    const enabledServices = getEnabledServicesForOrganization(organizationId);
    return enabledServices.includes(serviceId);
}

/**
 * Get a human-readable explanation for why a service is unavailable
 */
export function getServiceUnavailableReason(
    organizationId: string,
    serviceId: string,
    organizationName?: string
): string {
    const enabledServices = getEnabledServicesForOrganization(organizationId);

    if (enabledServices.length === 0) {
        return `${organizationName || 'Cette représentation'} n'offre pas de services consulaires directs.`;
    }

    // Check if it's a passport/visa service
    const passportServices = ['passport-ordinary', 'passport-emergency'];
    const visaServices = ['visa-tourist', 'visa-business', 'visa-long-stay'];

    if (passportServices.includes(serviceId)) {
        return `Les passeports biométriques ne sont pas délivrés au ${organizationName || 'consulat'}. Ils sont émis uniquement au Gabon par la DGDI.`;
    }

    if (visaServices.includes(serviceId)) {
        return `Les demandes de visa ne sont pas traitées au ${organizationName || 'consulat'}. Veuillez contacter l'ambassade ou une représentation habilitée.`;
    }

    return `Ce service n'est pas disponible au ${organizationName || 'consulat'}. Veuillez contacter votre représentation pour plus d'informations.`;
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
        'FR': 'France',
        'MA': 'Maroc',
        'US': 'États-Unis',
        'GB': 'Royaume-Uni',
        'DE': 'Allemagne',
        'BE': 'Belgique',
        'ES': 'Espagne',
        'IT': 'Italie',
        'CN': 'Chine',
        'SN': 'Sénégal',
        'CM': 'Cameroun',
        'GA': 'Gabon',
        'CA': 'Canada',
        'CH': 'Suisse',
        'RU': 'Russie',
        'TR': 'Turquie',
        'BR': 'Brésil',
    };

    return countryNames[countryCode.toUpperCase()] || countryCode;
}
