import { Organization, OrganizationType, OrganizationStatus } from '@/types/organization';
import { DIPLOMATIC_NETWORK } from './mock-diplomatic-network';

export const MOCK_ORGANIZATIONS: Organization[] = [
    ...DIPLOMATIC_NETWORK
];

// Re-export for compatibility
export const MOCK_ENTITIES = MOCK_ORGANIZATIONS;

// Helper function to get an organization by ID
export function getEntityById(id: string): Organization | undefined {
    return MOCK_ORGANIZATIONS.find(org => org.id === id);
}
