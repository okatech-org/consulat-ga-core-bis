/**
 * Staff Templates by Organization Type
 * 
 * Defines which roles are available for each type of organization.
 * Implements the consular hierarchy logic from consulat-core.
 */

import { MemberRole, OrganizationType } from "./constants";

// ═══════════════════════════════════════════════════════════════════════════
// ROLE HIERARCHY LEVELS
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  // Diplomatic roles
  [MemberRole.Ambassador]: 1,
  [MemberRole.FirstCounselor]: 2,
  [MemberRole.Paymaster]: 3,
  [MemberRole.EconomicCounselor]: 3,
  [MemberRole.SocialCounselor]: 3,
  [MemberRole.CommunicationCounselor]: 3,
  [MemberRole.Chancellor]: 4,
  [MemberRole.FirstSecretary]: 4,
  [MemberRole.Receptionist]: 5,

  // Consular roles
  [MemberRole.ConsulGeneral]: 1,
  [MemberRole.Consul]: 2,
  [MemberRole.ViceConsul]: 3,
  [MemberRole.ConsularAffairsOfficer]: 4,
  [MemberRole.ConsularAgent]: 5,
  [MemberRole.Intern]: 6,

  // Generic roles
  [MemberRole.Admin]: 1,
  [MemberRole.Agent]: 3,
  [MemberRole.Viewer]: 5,
};

// ═══════════════════════════════════════════════════════════════════════════
// STAFF TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Diplomatic staff template (Embassy, High Commission, Permanent Mission)
 * Used for the diplomatic section of an embassy
 */
const DIPLOMATIC_STAFF_TEMPLATE: MemberRole[] = [
  MemberRole.Ambassador,
  MemberRole.FirstCounselor,
  MemberRole.Paymaster,
  MemberRole.EconomicCounselor,
  MemberRole.SocialCounselor,
  MemberRole.CommunicationCounselor,
  MemberRole.Chancellor,
  MemberRole.FirstSecretary,
  MemberRole.Receptionist,
];

/**
 * Consular staff template (Consulate General, Consulate, or Embassy consular section)
 * Added to embassies that don't have a separate Consulate General in the country
 */
const CONSULAR_STAFF_TEMPLATE: MemberRole[] = [
  MemberRole.Consul,
  MemberRole.ViceConsul,
  MemberRole.ConsularAffairsOfficer,
  MemberRole.ConsularAgent,
  MemberRole.Intern,
];

/**
 * Consul General template (head of Consulate General)
 */
const CONSUL_GENERAL_STAFF_TEMPLATE: MemberRole[] = [
  MemberRole.ConsulGeneral,
  ...CONSULAR_STAFF_TEMPLATE,
];

/**
 * Honorary Consulate template (minimal staff)
 */
const HONORARY_CONSULATE_TEMPLATE: MemberRole[] = [
  MemberRole.Consul, // Consul Honoraire
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export interface StaffTemplateContext {
  /** Whether there's a Consulate General in the same country */
  hasConsulateGeneralInCountry: boolean;
}

/**
 * Get the staff template for an organization based on its type and context.
 * 
 * Rules:
 * 1. Embassy + CG in country → Diplomatic staff ONLY (no consular section)
 * 2. Embassy WITHOUT CG → Diplomatic + Consular staff
 * 3. Consulate General → Consul General + full consular staff
 * 4. Consulate → Consul + limited consular staff
 * 5. Honorary Consulate → Honorary Consul only
 * 6. High Commission → Same as Embassy (Commonwealth countries)
 * 7. Permanent Mission → Same as Embassy (international orgs)
 * 
 * @param orgType The type of organization
 * @param context Additional context (e.g., whether there's a CG in the country)
 * @returns Array of MemberRole values representing available positions
 */
export function getStaffTemplateForOrg(
  orgType: OrganizationType,
  context: StaffTemplateContext = { hasConsulateGeneralInCountry: false }
): MemberRole[] {
  const { hasConsulateGeneralInCountry } = context;

  switch (orgType) {
    // Diplomatic missions (Embassy, High Commission, Permanent Mission)
    case OrganizationType.Embassy:
    case OrganizationType.HighCommission:
    case OrganizationType.PermanentMission:
      if (hasConsulateGeneralInCountry) {
        // Embassy with separate CG → diplomatic staff only
        return [...DIPLOMATIC_STAFF_TEMPLATE];
      }
      // Embassy without CG → diplomatic + consular section
      return [...DIPLOMATIC_STAFF_TEMPLATE, ...CONSULAR_STAFF_TEMPLATE];

    // Consulate General
    case OrganizationType.GeneralConsulate:
      return [...CONSUL_GENERAL_STAFF_TEMPLATE];

    // Regular Consulate
    case OrganizationType.Consulate:
      return [...CONSULAR_STAFF_TEMPLATE];

    // Honorary Consulate (minimal staff)
    case OrganizationType.HonoraryConsulate:
      return [...HONORARY_CONSULATE_TEMPLATE];

    // Other organization types (associations, etc.)
    default:
      return [MemberRole.Admin, MemberRole.Agent, MemberRole.Viewer];
  }
}

/**
 * Check if a role is valid for an organization type
 */
export function isRoleValidForOrgType(
  role: MemberRole,
  orgType: OrganizationType,
  context: StaffTemplateContext = { hasConsulateGeneralInCountry: false }
): boolean {
  const validRoles = getStaffTemplateForOrg(orgType, context);
  return validRoles.includes(role);
}

/**
 * Get the hierarchy level of a role (lower = more senior)
 */
export function getRoleHierarchyLevel(role: MemberRole): number {
  return ROLE_HIERARCHY[role] ?? 99;
}

/**
 * Check if roleA outranks roleB
 */
export function outranks(roleA: MemberRole, roleB: MemberRole): boolean {
  return getRoleHierarchyLevel(roleA) < getRoleHierarchyLevel(roleB);
}
