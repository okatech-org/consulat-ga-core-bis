/**
 * User Account Types
 * Defines the 3 main categories of consular service users
 */

// ============================================================================
// USER CATEGORIES
// ============================================================================

/**
 * Main user categories
 */
export enum UserCategory {
    /** Gabonese national abroad */
    RESSORTISSANT = 'ressortissant',
    /** Foreign visitor to Gabon */
    VISITEUR = 'visiteur',
}

/**
 * Subcategories for Gabonese nationals (Ressortissant)
 */
export enum RessortissantType {
    /** Resident abroad for 6+ months - Full consular registration */
    RESIDENT = 'resident',
    /** Visiting abroad for less than 6 months - Temporary declaration */
    DE_PASSAGE = 'de_passage',
}

/**
 * Subcategories for foreign visitors (Visiteur)
 */
export enum VisiteurType {
    /** Tourist visa applicant */
    VISA_TOURISME = 'visa_tourisme',
    /** Business visa applicant */
    VISA_AFFAIRES = 'visa_affaires',
    /** Other Gabon-related services */
    SERVICE_GABON = 'service_gabon',
}

// ============================================================================
// USER TYPE DEFINITIONS
// ============================================================================

export interface RessortissantUser {
    category: UserCategory.RESSORTISSANT;
    type: RessortissantType;
    /** Duration of stay abroad (for determining resident vs de_passage) */
    stayDuration: 'more_than_6_months' | 'less_than_6_months';
}

export interface VisiteurUser {
    category: UserCategory.VISITEUR;
    type: VisiteurType;
    /** Purpose of visit/request */
    purpose?: string;
}

export type UserAccountType = RessortissantUser | VisiteurUser;

// ============================================================================
// USER TYPE LABELS (French)
// ============================================================================

export const USER_CATEGORY_LABELS: Record<UserCategory, string> = {
    [UserCategory.RESSORTISSANT]: 'Ressortissant Gabonais',
    [UserCategory.VISITEUR]: 'Visiteur Étranger',
};

export const RESSORTISSANT_TYPE_LABELS: Record<RessortissantType, string> = {
    [RessortissantType.RESIDENT]: 'Résident (+6 mois)',
    [RessortissantType.DE_PASSAGE]: 'De Passage (-6 mois)',
};

export const VISITEUR_TYPE_LABELS: Record<VisiteurType, string> = {
    [VisiteurType.VISA_TOURISME]: 'Demandeur Visa Tourisme',
    [VisiteurType.VISA_AFFAIRES]: 'Demandeur Visa Affaires',
    [VisiteurType.SERVICE_GABON]: 'Demandeur Service lié au Gabon',
};

// ============================================================================
// USER TYPE DESCRIPTIONS
// ============================================================================

export const RESSORTISSANT_TYPE_DESCRIPTIONS: Record<RessortissantType, string> = {
    [RessortissantType.RESIDENT]:
        'Vous résidez à l\'étranger depuis plus de 6 mois et souhaitez vous inscrire au registre consulaire.',
    [RessortissantType.DE_PASSAGE]:
        'Vous êtes de passage à l\'étranger pour moins de 6 mois et souhaitez signaler votre présence.',
};

export const VISITEUR_TYPE_DESCRIPTIONS: Record<VisiteurType, string> = {
    [VisiteurType.VISA_TOURISME]:
        'Vous souhaitez obtenir un visa de tourisme pour visiter le Gabon.',
    [VisiteurType.VISA_AFFAIRES]:
        'Vous souhaitez obtenir un visa d\'affaires pour une mission professionnelle au Gabon.',
    [VisiteurType.SERVICE_GABON]:
        'Vous avez besoin d\'un service consulaire lié au Gabon (légalisation, apostille, etc.).',
};

// ============================================================================
// SERVICE AVAILABILITY BY USER TYPE
// ============================================================================

/**
 * Default services available per user type
 * Can be overridden by admin configuration
 */
export const DEFAULT_SERVICES_BY_USER_TYPE: Record<string, string[]> = {
    // Gabonais Résident - Full access
    [RessortissantType.RESIDENT]: [
        'consular-registration',
        'consular-card',
        'passport-ordinary',
        'passport-service',
        'laissez-passer',
        'birth-certificate-transcription',
        'marriage-certificate-transcription',
        'death-certificate-transcription',
        'certificate-nationality',
        'certificate-customs',
        'certificate-life',
        'certificate-residence',
        'legalization',
        'notarial-acts',
    ],

    // Gabonais De Passage - Limited services
    [RessortissantType.DE_PASSAGE]: [
        'temporary-declaration',
        'laissez-passer', // Emergency document only
        'certificate-life',
        'legalization',
    ],

    // Visiteur Visa Tourisme
    [VisiteurType.VISA_TOURISME]: [
        'visa-tourisme',
        'visa-transit',
    ],

    // Visiteur Visa Affaires
    [VisiteurType.VISA_AFFAIRES]: [
        'visa-affaires',
        'visa-court-sejour',
        'visa-long-sejour',
    ],

    // Visiteur Service Gabon
    [VisiteurType.SERVICE_GABON]: [
        'legalization',
        'apostille',
        'certificate-customs',
        'document-certification',
    ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available user types as options for select
 */
export function getUserTypeOptions() {
    return {
        ressortissant: Object.values(RessortissantType).map(type => ({
            value: type,
            label: RESSORTISSANT_TYPE_LABELS[type],
            description: RESSORTISSANT_TYPE_DESCRIPTIONS[type],
        })),
        visiteur: Object.values(VisiteurType).map(type => ({
            value: type,
            label: VISITEUR_TYPE_LABELS[type],
            description: VISITEUR_TYPE_DESCRIPTIONS[type],
        })),
    };
}

/**
 * Check if user type is a Gabonese national
 */
export function isRessortissant(type: string): boolean {
    return Object.values(RessortissantType).includes(type as RessortissantType);
}

/**
 * Check if user type is a foreign visitor
 */
export function isVisiteur(type: string): boolean {
    return Object.values(VisiteurType).includes(type as VisiteurType);
}

/**
 * Get category from user type
 */
export function getCategoryFromType(type: string): UserCategory | null {
    if (isRessortissant(type)) return UserCategory.RESSORTISSANT;
    if (isVisiteur(type)) return UserCategory.VISITEUR;
    return null;
}

/**
 * Get default services for a user type
 */
export function getDefaultServicesForUserType(userType: string): string[] {
    return DEFAULT_SERVICES_BY_USER_TYPE[userType] || [];
}

/**
 * Determine ressortissant type from stay duration
 */
export function getRessortissantTypeFromDuration(
    durationMonths: number
): RessortissantType {
    return durationMonths >= 6
        ? RessortissantType.RESIDENT
        : RessortissantType.DE_PASSAGE;
}
