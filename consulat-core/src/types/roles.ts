import { ConsularRole, EmploymentStatus } from './consular-roles';
import { EntityType } from './entity';
import { UserFunction, ServiceAccess, UserQuotas, BillingFeature } from './user-management';

export type UserRole = 'ADMIN' | ConsularRole;

export interface DemoUser {
  id: string;
  role: UserRole;
  name: string;
  entityId?: string; // null pour ADMIN système
  permissions: string[];
  badge: string; // emoji
  description: string;

  // New Hierarchy Fields
  hierarchyLevel?: number;
  employmentStatus?: EmploymentStatus;
  allowedEntityTypes?: EntityType[];
  email?: string;

  // Territoriality & Residency
  residenceCountry?: string; // Country Code (e.g., 'FR')
  currentLocation?: string; // Country Code (e.g., 'MA')
  stayDuration?: number; // Months in current location
  managedByOrgId?: string; // ID of the organization managing the user
  signaledToOrgId?: string; // ID of the organization where user is signaled (short stay)

  // Advanced Management
  functions?: UserFunction[];
  accessibleServices?: ServiceAccess[];
  quotas?: UserQuotas;
  billingFeatures?: BillingFeature[];
}
