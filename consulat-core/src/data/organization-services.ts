/**
 * Organization Services Configuration
 * Defines which services are available for each consular organization
 */

export interface OrganizationServicesConfig {
    organizationId: string;
    enabledServiceIds: string[];
    disabledCategories?: string[];
    notes?: string;
}

// ============================================================================
// DEFAULT SERVICES BY ORGANIZATION TYPE
// ============================================================================

/**
 * Services de base disponibles dans tous les consulats/ambassades
 */
export const UNIVERSAL_SERVICES = [
    'legalization',
    'certified-copy',
    'consular-card',
    'certificate-residence',
    'power-attorney',
];

/**
 * Services d'état civil (disponibles dans la plupart des représentations)
 */
export const CIVIL_STATUS_SERVICES = [
    'civil-birth',
    'civil-marriage',
    'civil-death',
    'civil-cert-capacity',
];

/**
 * Services passeports/documents de voyage
 */
export const PASSPORT_SERVICES = [
    'passport-ordinary',
    'passport-emergency',
    'laissez-passer',
];

/**
 * Services visas
 */
export const VISA_SERVICES = [
    'visa-tourist',
    'visa-business',
    'visa-long-stay',
];

// ============================================================================
// CONFIGURATION PAR ORGANISATION
// ============================================================================

export const ORGANIZATION_SERVICES: OrganizationServicesConfig[] = [
    // --- FRANCE ---
    {
        organizationId: 'fr-consulat-paris',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            'laissez-passer', // Document d'urgence uniquement
            'certificate-change-residence',
        ],
        disabledCategories: ['travel_document', 'visa'],
        notes: 'Le Consulat Général à Paris ne gère pas les passeports biométriques ni les visas. Les passeports sont délivrés uniquement au Gabon via la DGDI.'
    },
    {
        organizationId: 'fr-ambassade-paris',
        enabledServiceIds: [], // Ambassade = fonctions diplomatiques, pas consulaires
        notes: 'L\'Ambassade gère les relations diplomatiques. Les services consulaires sont au Consulat Général.'
    },
    {
        organizationId: 'fr-consulat-bordeaux',
        enabledServiceIds: [...UNIVERSAL_SERVICES],
        notes: 'Consulat honoraire - services limités'
    },
    {
        organizationId: 'fr-consulat-lyon',
        enabledServiceIds: [...UNIVERSAL_SERVICES],
        notes: 'Consulat honoraire - services limités'
    },

    // --- MAROC ---
    {
        organizationId: 'ma-ambassade-rabat',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Services consulaires complets disponibles'
    },
    {
        organizationId: 'ma-consulat-laayoune',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Consulat Général de plein exercice'
    },

    // --- ÉTATS-UNIS ---
    {
        organizationId: 'us-ambassade-washington',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Services complets'
    },
    {
        organizationId: 'us-consulat-new-york',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            'laissez-passer',
            ...VISA_SERVICES,
        ],
        notes: 'Visas et légalisations pour la côte Est'
    },

    // --- BELGIQUE ---
    {
        organizationId: 'be-ambassade-bruxelles',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Couvre le Benelux et les relations avec l\'UE'
    },

    // --- ALLEMAGNE ---
    {
        organizationId: 'de-ambassade-berlin',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Couvre Allemagne et Autriche'
    },

    // --- ROYAUME-UNI ---
    {
        organizationId: 'uk-haut-commissariat-londres',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Couvre UK, Irlande et Scandinavie'
    },

    // --- CAMEROUN ---
    {
        organizationId: 'cm-ambassade-yaounde',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Couvre Cameroun, RCA et Tchad'
    },

    // --- SÉNÉGAL ---
    {
        organizationId: 'sn-ambassade-dakar',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Couvre Sénégal, Cap-Vert, Gambie, Guinée Bissau, Guinée'
    },

    // --- CHINE ---
    {
        organizationId: 'cn-ambassade-pekin',
        enabledServiceIds: [
            ...UNIVERSAL_SERVICES,
            ...CIVIL_STATUS_SERVICES,
            ...PASSPORT_SERVICES,
            ...VISA_SERVICES,
        ],
        notes: 'Couvre Chine, Singapour, Vietnam'
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Récupère la configuration des services pour une organisation
 */
export function getOrganizationServicesConfig(organizationId: string): OrganizationServicesConfig | undefined {
    return ORGANIZATION_SERVICES.find(config => config.organizationId === organizationId);
}

/**
 * Récupère les IDs des services activés pour une organisation
 * Retourne les services universels par défaut si aucune config spécifique
 */
export function getEnabledServicesForOrganization(organizationId: string): string[] {
    const config = getOrganizationServicesConfig(organizationId);
    if (config) {
        return config.enabledServiceIds;
    }
    // Par défaut: services universels + état civil
    return [...UNIVERSAL_SERVICES, ...CIVIL_STATUS_SERVICES];
}

/**
 * Vérifie si un service est activé pour une organisation
 */
export function isServiceEnabledForOrganization(organizationId: string, serviceId: string): boolean {
    const enabledServices = getEnabledServicesForOrganization(organizationId);
    return enabledServices.includes(serviceId);
}

/**
 * Récupère la note explicative pour une organisation
 */
export function getOrganizationServiceNotes(organizationId: string): string | undefined {
    const config = getOrganizationServicesConfig(organizationId);
    return config?.notes;
}
