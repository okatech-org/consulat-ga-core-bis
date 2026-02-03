import { EntityType } from './entity';

// Énumération des rôles consulaires
export enum ConsularRole {
    // CONSULAT_GENERAL uniquement
    CONSUL_GENERAL = 'CONSUL_GENERAL',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    CONSUL = 'CONSUL',

    // CONSULAT_GENERAL, CONSULAT uniquement (PAS AMBASSADE)
    VICE_CONSUL = 'VICE_CONSUL',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    CHARGE_AFFAIRES_CONSULAIRES = 'CHARGE_AFFAIRES_CONSULAIRES',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    AGENT_CONSULAIRE = 'AGENT_CONSULAIRE',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    STAGIAIRE = 'STAGIAIRE',

    // AMBASSADE Spécifique
    AMBASSADEUR = 'AMBASSADEUR',
    PREMIER_CONSEILLER = 'PREMIER_CONSEILLER',
    PAYEUR = 'PAYEUR',
    CONSEILLER_ECONOMIQUE = 'CONSEILLER_ECONOMIQUE',
    CONSEILLER_SOCIAL = 'CONSEILLER_SOCIAL',
    CONSEILLER_COMMUNICATION = 'CONSEILLER_COMMUNICATION',
    CHANCELIER = 'CHANCELIER',
    PREMIER_SECRETAIRE = 'PREMIER_SECRETAIRE',
    RECEPTIONNISTE = 'RECEPTIONNISTE',

    // Utilisateur standard
    CITIZEN = 'CITIZEN',

    // Usager étranger
    FOREIGNER = 'FOREIGNER'
}

// Énumération du statut d'emploi
export enum EmploymentStatus {
    FONCTIONNAIRE = 'FONCTIONNAIRE',
    CONTRACTUEL = 'CONTRACTUEL',
    CITOYEN = 'CITOYEN'
}

// Interface pour valider les rôles par entité
export interface RoleEntityMapping {
    role: ConsularRole;
    allowedEntityTypes: EntityType[];
    employmentStatus: EmploymentStatus;
    hierarchyLevel: number;
    canManageRoles: ConsularRole[];
}

// Mapping complet de la hiérarchie
export const ROLE_ENTITY_MAPPING: Record<ConsularRole, RoleEntityMapping> = {
    [ConsularRole.CONSUL_GENERAL]: {
        role: ConsularRole.CONSUL_GENERAL,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 1,
        canManageRoles: [
            ConsularRole.CONSUL,
            ConsularRole.VICE_CONSUL,
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ]
    },

    [ConsularRole.CONSUL]: {
        role: ConsularRole.CONSUL,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT, EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT, EntityType.MISSION_PERMANENTE],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 2,
        canManageRoles: [
            ConsularRole.VICE_CONSUL,
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ]
    },

    [ConsularRole.VICE_CONSUL]: {
        role: ConsularRole.VICE_CONSUL,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: [
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ]
    },

    [ConsularRole.CHARGE_AFFAIRES_CONSULAIRES]: {
        role: ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT, EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT, EntityType.MISSION_PERMANENTE],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 4,
        canManageRoles: [
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ]
    },

    [ConsularRole.AGENT_CONSULAIRE]: {
        role: ConsularRole.AGENT_CONSULAIRE,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT, EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT, EntityType.MISSION_PERMANENTE],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 5,
        canManageRoles: [ConsularRole.STAGIAIRE]
    },

    [ConsularRole.STAGIAIRE]: {
        role: ConsularRole.STAGIAIRE,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT, EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT, EntityType.MISSION_PERMANENTE],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 6,
        canManageRoles: []
    },

    // --- RÔLES AMBASSADE ---

    [ConsularRole.AMBASSADEUR]: {
        role: ConsularRole.AMBASSADEUR,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 1,
        canManageRoles: [ConsularRole.PREMIER_CONSEILLER, ConsularRole.PAYEUR, ConsularRole.CONSEILLER_ECONOMIQUE, ConsularRole.CONSEILLER_SOCIAL, ConsularRole.CONSEILLER_COMMUNICATION, ConsularRole.CHANCELIER, ConsularRole.PREMIER_SECRETAIRE, ConsularRole.RECEPTIONNISTE]
    },
    [ConsularRole.PREMIER_CONSEILLER]: {
        role: ConsularRole.PREMIER_CONSEILLER,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 2,
        canManageRoles: [ConsularRole.CHANCELIER, ConsularRole.PREMIER_SECRETAIRE, ConsularRole.RECEPTIONNISTE]
    },
    [ConsularRole.PAYEUR]: {
        role: ConsularRole.PAYEUR,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: []
    },
    [ConsularRole.CONSEILLER_ECONOMIQUE]: {
        role: ConsularRole.CONSEILLER_ECONOMIQUE,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: []
    },
    [ConsularRole.CONSEILLER_SOCIAL]: {
        role: ConsularRole.CONSEILLER_SOCIAL,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: []
    },
    [ConsularRole.CONSEILLER_COMMUNICATION]: {
        role: ConsularRole.CONSEILLER_COMMUNICATION,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: []
    },
    [ConsularRole.CHANCELIER]: {
        role: ConsularRole.CHANCELIER,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 4,
        canManageRoles: [ConsularRole.RECEPTIONNISTE]
    },
    [ConsularRole.PREMIER_SECRETAIRE]: {
        role: ConsularRole.PREMIER_SECRETAIRE,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 4,
        canManageRoles: []
    },
    [ConsularRole.RECEPTIONNISTE]: {
        role: ConsularRole.RECEPTIONNISTE,
        allowedEntityTypes: [EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 5,
        canManageRoles: []
    },

    [ConsularRole.CITIZEN]: {
        role: ConsularRole.CITIZEN,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT, EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT, EntityType.MISSION_PERMANENTE],
        employmentStatus: EmploymentStatus.CITOYEN,
        hierarchyLevel: 0,
        canManageRoles: []
    },

    [ConsularRole.FOREIGNER]: {
        role: ConsularRole.FOREIGNER,
        allowedEntityTypes: [EntityType.CONSULAT_GENERAL, EntityType.CONSULAT, EntityType.AMBASSADE, EntityType.HAUT_COMMISSARIAT, EntityType.MISSION_PERMANENTE],
        employmentStatus: EmploymentStatus.CITOYEN, // Considered as user
        hierarchyLevel: 0,
        canManageRoles: []
    }
};
