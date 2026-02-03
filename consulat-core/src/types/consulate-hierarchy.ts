import { OrganizationType } from './organization';

export enum ConsularRole {
    CONSUL_GENERAL = 'CONSUL_GENERAL',
    CONSUL = 'CONSUL',
    VICE_CONSUL = 'VICE_CONSUL',
    CHARGE_AFFAIRES_CONSULAIRES = 'CHARGE_AFFAIRES_CONSULAIRES',
    AGENT_CONSULAIRE = 'AGENT_CONSULAIRE',
    STAGIAIRE = 'STAGIAIRE'
}

export enum EmploymentStatus {
    FONCTIONNAIRE = 'FONCTIONNAIRE',
    CONTRACTUEL = 'CONTRACTUEL',
    VACATAIRE = 'VACATAIRE',
    STAGIAIRE_INTERNE = 'STAGIAIRE_INTERNE'
}

export interface RoleEntityMapping {
    role: ConsularRole;
    allowedEntityTypes: OrganizationType[];
    employmentStatus: EmploymentStatus;
    hierarchyLevel: number;
    canManageRoles: ConsularRole[];
    label: string;
    description: string;
}

export const ROLE_ENTITY_MAPPING: Record<ConsularRole, RoleEntityMapping> = {
    [ConsularRole.CONSUL_GENERAL]: {
        role: ConsularRole.CONSUL_GENERAL,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 1,
        canManageRoles: [
            ConsularRole.CONSUL,
            ConsularRole.VICE_CONSUL,
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Consul Général',
        description: 'Supervision globale, direction stratégique, administration générale',
    },

    [ConsularRole.CONSUL]: {
        role: ConsularRole.CONSUL,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 2,
        canManageRoles: [
            ConsularRole.VICE_CONSUL,
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Consul',
        description: 'Direction du consulat/ambassade, adjoint du Consul Général',
    },

    [ConsularRole.VICE_CONSUL]: {
        role: ConsularRole.VICE_CONSUL,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: [
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Vice-Consul',
        description: 'Gestion des opérations consulaires, légalisations, supervision des agents',
    },

    [ConsularRole.CHARGE_AFFAIRES_CONSULAIRES]: {
        role: ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 4,
        canManageRoles: [
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Chargé d\'Affaires Consulaires',
        description: 'Traitement des dossiers spécialisés (visas, passeports, état civil)',
    },

    [ConsularRole.AGENT_CONSULAIRE]: {
        role: ConsularRole.AGENT_CONSULAIRE,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 5,
        canManageRoles: [],
        label: 'Agent Consulaire',
        description: 'Accueil, saisie, traitement administratif standard',
    },

    [ConsularRole.STAGIAIRE]: {
        role: ConsularRole.STAGIAIRE,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
        employmentStatus: EmploymentStatus.STAGIAIRE_INTERNE,
        hierarchyLevel: 6,
        canManageRoles: [],
        label: 'Stagiaire',
        description: 'Formation, assistance, tâches non sensibles',
    }
};

// Helper functions
export function canManageRole(managerRole: ConsularRole, targetRole: ConsularRole): boolean {
    return ROLE_ENTITY_MAPPING[managerRole]?.canManageRoles.includes(targetRole) || false;
}

export function isAuthorizedForEntityType(role: ConsularRole, entityType: OrganizationType): boolean {
    return ROLE_ENTITY_MAPPING[role]?.allowedEntityTypes.includes(entityType) || false;
}

export function getRoleLabel(role: ConsularRole): string {
    return ROLE_ENTITY_MAPPING[role]?.label || role;
}

export function getRoleDescription(role: ConsularRole): string {
    return ROLE_ENTITY_MAPPING[role]?.description || '';
}

export function getHierarchyLevel(role: ConsularRole): number {
    return ROLE_ENTITY_MAPPING[role]?.hierarchyLevel || 999;
}

export function getAllowedRolesForEntityType(entityType: OrganizationType): ConsularRole[] {
    return Object.values(ConsularRole).filter(role =>
        isAuthorizedForEntityType(role, entityType)
    );
}

// ============== Validation Rules ==============

export interface HierarchyValidation {
    isValid: boolean;
    message?: string;
}

/**
 * Validates if a user with a given role can be assigned to a specific entity
 */
export function validateRoleEntityAssignment(
    role: ConsularRole,
    entityType: OrganizationType
): HierarchyValidation {
    if (!isAuthorizedForEntityType(role, entityType)) {
        return {
            isValid: false,
            message: `Le rôle "${getRoleLabel(role)}" n'est pas autorisé pour ce type d'entité.`
        };
    }
    return { isValid: true };
}

/**
 * Validates if a manager can assign/manage a subordinate role
 */
export function validateHierarchyManagement(
    managerRole: ConsularRole,
    targetRole: ConsularRole
): HierarchyValidation {
    if (!canManageRole(managerRole, targetRole)) {
        return {
            isValid: false,
            message: `Le rôle "${getRoleLabel(managerRole)}" ne peut pas gérer le rôle "${getRoleLabel(targetRole)}".`
        };
    }
    return { isValid: true };
}
