import { DemoUser } from '@/types/roles';
import { Organization } from '@/types/organization';
import { MOCK_ORGANIZATIONS } from '@/data/mock-organizations';

/**
 * Determines the organization managing the user based on residence.
 * Rule: User is managed by the organization covering their residence country.
 */
export function getManagingOrganization(user: DemoUser): Organization | undefined {
    if (!user.residenceCountry) return undefined;
    return MOCK_ORGANIZATIONS.find(org => org.jurisdiction?.includes(user.residenceCountry!));
}

/**
 * Determines the organization where the user is signaled (short stay).
 * Rule: If user is in a location different from residence for < 6 months.
 */
export function getSignaledOrganization(user: DemoUser): Organization | undefined {
    if (!user.currentLocation || !user.residenceCountry) return undefined;

    // If location is same as residence, no signaling needed
    if (user.currentLocation === user.residenceCountry) return undefined;

    // If stay is less than 6 months, they are signaled to the local org
    if ((user.stayDuration || 0) < 6) {
        return MOCK_ORGANIZATIONS.find(org => org.jurisdiction?.includes(user.currentLocation!));
    }

    return undefined;
}

/**
 * Updates user status based on territoriality rules.
 * Returns updated partial user object.
 */
export function calculateUserTerritorialStatus(user: DemoUser): Partial<DemoUser> {
    const managingOrg = getManagingOrganization(user);
    const signaledOrg = getSignaledOrganization(user);

    return {
        managedByOrgId: managingOrg?.id,
        signaledToOrgId: signaledOrg?.id
    };
}

/**
 * Helper to get organization by country code
 */
export function getOrganizationByCountry(countryCode: string): Organization | undefined {
    return MOCK_ORGANIZATIONS.find(org => org.jurisdiction?.includes(countryCode));
}
