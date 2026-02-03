import { ConsularRole, ROLE_ENTITY_MAPPING } from '../types/consular-roles';
import { EntityType } from '../types/entity';

/**
 * Valide si un rôle est autorisé pour un type d'entité donné.
 */
export function validateRoleForEntity(role: ConsularRole, entityType: EntityType): boolean {
    const mapping = ROLE_ENTITY_MAPPING[role];
    return mapping.allowedEntityTypes.includes(entityType);
}

/**
 * Vérifie si un utilisateur avec un certain rôle peut gérer (créer/modifier) un autre rôle.
 * Prend également en compte le type d'entité pour valider la cohérence.
 */
export function canAssignRole(
    currentUserRole: ConsularRole,
    targetRole: ConsularRole,
    entityType: EntityType
): boolean {
    // 1. Valider que le rôle cible est valide pour ce type d'entité
    if (!validateRoleForEntity(targetRole, entityType)) {
        console.warn(`Le rôle ${targetRole} n'est pas autorisé pour une entité de type ${entityType}`);
        return false;
    }

    // 2. Vérifier que l'utilisateur actuel peut gérer ce rôle selon la hiérarchie
    const currentUserMapping = ROLE_ENTITY_MAPPING[currentUserRole];

    // Si l'utilisateur n'a pas de mapping (ex: CITIZEN), il ne peut rien gérer
    if (!currentUserMapping) {
        return false;
    }

    return currentUserMapping.canManageRoles.includes(targetRole);
}

/**
 * Retourne la liste des rôles disponibles pour un type d'entité donné.
 */
export function getAvailableRolesForEntity(entityType: EntityType): ConsularRole[] {
    return Object.values(ConsularRole).filter(role => {
        const mapping = ROLE_ENTITY_MAPPING[role];
        return mapping.allowedEntityTypes.includes(entityType);
    });
}
