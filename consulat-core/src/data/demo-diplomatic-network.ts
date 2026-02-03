/**
 * Demo Diplomatic Network Configuration
 * Pre-configured diplomatic representations for the demo page
 * Covers 13 countries across Europe, Asia, Americas, and Africa
 */

import { RessortissantType, VisiteurType } from '@/types/user-account-types';

// ============================================================================
// COUNTRY CONFIGURATIONS
// ============================================================================

export interface DemoCountryConfig {
    code: string;
    name: string;
    nameFr: string;
    region: 'europe' | 'asia' | 'americas' | 'africa';
    flag: string;
    representations: DemoRepresentationConfig[];
}

export interface DemoRepresentationConfig {
    id: string;
    type: 'ambassade' | 'consulat_general' | 'consulat' | 'consulat_honoraire' | 'delegation_permanente';
    city: string;
    isMainRepresentation: boolean;
    /** Services enabled for this representation */
    enabledServices: string[];
    /** User types allowed */
    allowedUserTypes: string[];
    /** Opening hours */
    schedule?: {
        weekdays: string;
        saturday?: string;
    };
    /** Contact info */
    contact: {
        address: string;
        phone: string;
        email: string;
        website?: string;
    };
}

// ============================================================================
// FULL SERVICE LIST
// ============================================================================

export const DEMO_SERVICES = {
    // Ressortissant services
    consularRegistration: 'consular-registration',
    consularCard: 'consular-card',
    passportOrdinary: 'passport-ordinary',
    passportService: 'passport-service',
    laissezPasser: 'laissez-passer',
    birthTranscription: 'birth-certificate-transcription',
    marriageTranscription: 'marriage-certificate-transcription',
    deathTranscription: 'death-certificate-transcription',
    certificateNationality: 'certificate-nationality',
    certificateCustoms: 'certificate-customs',
    certificateLife: 'certificate-life',
    certificateResidence: 'certificate-residence',
    legalization: 'legalization',
    notarialActs: 'notarial-acts',
    temporaryDeclaration: 'temporary-declaration',

    // Visa services
    visaTourisme: 'visa-tourisme',
    visaAffaires: 'visa-affaires',
    visaTransit: 'visa-transit',
    visaCourtSejour: 'visa-court-sejour',
    visaLongSejour: 'visa-long-sejour',

    // Other services
    apostille: 'apostille',
    documentCertification: 'document-certification',
} as const;

// Default services for full-service representation (Ambassade)
const FULL_SERVICES = Object.values(DEMO_SERVICES);

// Services for Consulat Général (no passports in some countries)
const CONSULAT_SERVICES_NO_PASSPORT = [
    DEMO_SERVICES.consularRegistration,
    DEMO_SERVICES.consularCard,
    DEMO_SERVICES.laissezPasser,
    DEMO_SERVICES.birthTranscription,
    DEMO_SERVICES.marriageTranscription,
    DEMO_SERVICES.deathTranscription,
    DEMO_SERVICES.certificateNationality,
    DEMO_SERVICES.certificateCustoms,
    DEMO_SERVICES.certificateLife,
    DEMO_SERVICES.certificateResidence,
    DEMO_SERVICES.legalization,
    DEMO_SERVICES.notarialActs,
    DEMO_SERVICES.temporaryDeclaration,
];

// Visa-only services
const VISA_SERVICES = [
    DEMO_SERVICES.visaTourisme,
    DEMO_SERVICES.visaAffaires,
    DEMO_SERVICES.visaTransit,
    DEMO_SERVICES.visaCourtSejour,
    DEMO_SERVICES.visaLongSejour,
    DEMO_SERVICES.legalization,
    DEMO_SERVICES.apostille,
];

// All user types
const ALL_USER_TYPES = [
    RessortissantType.RESIDENT,
    RessortissantType.DE_PASSAGE,
    VisiteurType.VISA_TOURISME,
    VisiteurType.VISA_AFFAIRES,
    VisiteurType.SERVICE_GABON,
];

const RESSORTISSANTS_ONLY = [
    RessortissantType.RESIDENT,
    RessortissantType.DE_PASSAGE,
];

// ============================================================================
// EUROPE
// ============================================================================

export const DEMO_EUROPE: DemoCountryConfig[] = [
    {
        code: 'FR',
        name: 'France',
        nameFr: 'France',
        region: 'europe',
        flag: '🇫🇷',
        representations: [
            {
                id: 'fr-ambassade-paris',
                type: 'ambassade',
                city: 'Paris',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00', saturday: '09:00 - 12:00' },
                contact: {
                    address: '26, Avenue Raphaël, 75016 Paris',
                    phone: '+33 1 44 05 00 00',
                    email: 'ambaga.france@diplomatie.gouv.ga',
                    website: 'https://www.ambassadedugabon.fr',
                },
            },
            {
                id: 'fr-consulat-paris',
                type: 'consulat_general',
                city: 'Paris',
                isMainRepresentation: false,
                enabledServices: CONSULAT_SERVICES_NO_PASSPORT, // Pas de passeports
                allowedUserTypes: RESSORTISSANTS_ONLY,
                schedule: { weekdays: '09:00 - 16:00' },
                contact: {
                    address: '29, Avenue Raphaël, 75016 Paris',
                    phone: '+33 1 44 05 00 10',
                    email: 'consulat.paris@diplomatie.gouv.ga',
                },
            },
            {
                id: 'fr-delegation-unesco',
                type: 'delegation_permanente',
                city: 'Paris (UNESCO)',
                isMainRepresentation: false,
                enabledServices: [DEMO_SERVICES.legalization, DEMO_SERVICES.documentCertification],
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '1, rue Miollis, 75015 Paris',
                    phone: '+33 1 45 68 33 50',
                    email: 'dl.gabon@unesco-delegations.org',
                },
            },
        ],
    },
    {
        code: 'BE',
        name: 'Belgium',
        nameFr: 'Belgique',
        region: 'europe',
        flag: '🇧🇪',
        representations: [
            {
                id: 'be-ambassade-bruxelles',
                type: 'ambassade',
                city: 'Bruxelles',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '112, Avenue Winston Churchill, 1180 Bruxelles',
                    phone: '+32 2 340 62 10',
                    email: 'ambaga.belgique@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'ES',
        name: 'Spain',
        nameFr: 'Espagne',
        region: 'europe',
        flag: '🇪🇸',
        representations: [
            {
                id: 'es-ambassade-madrid',
                type: 'ambassade',
                city: 'Madrid',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 16:00' },
                contact: {
                    address: 'Calle Francisco de Rojas 5, 28010 Madrid',
                    phone: '+34 91 413 64 40',
                    email: 'ambaga.espagne@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'DE',
        name: 'Germany',
        nameFr: 'Allemagne',
        region: 'europe',
        flag: '🇩🇪',
        representations: [
            {
                id: 'de-ambassade-berlin',
                type: 'ambassade',
                city: 'Berlin',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: 'Hohensteiner Strasse 16, 14197 Berlin',
                    phone: '+49 30 89 73 34 0',
                    email: 'ambaga.allemagne@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'GB',
        name: 'United Kingdom',
        nameFr: 'Royaume-Uni',
        region: 'europe',
        flag: '🇬🇧',
        representations: [
            {
                id: 'gb-hc-londres',
                type: 'ambassade', // High Commission
                city: 'Londres',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '27 Elvaston Place, London SW7 5NL',
                    phone: '+44 20 7823 9986',
                    email: 'ambaga.uk@diplomatie.gouv.ga',
                },
            },
        ],
    },
];

// ============================================================================
// ASIA
// ============================================================================

export const DEMO_ASIA: DemoCountryConfig[] = [
    {
        code: 'CN',
        name: 'China',
        nameFr: 'Chine',
        region: 'asia',
        flag: '🇨🇳',
        representations: [
            {
                id: 'cn-ambassade-pekin',
                type: 'ambassade',
                city: 'Pékin',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '36 Guang Hua Lu, Chaoyang District, Beijing',
                    phone: '+86 10 6532 3810',
                    email: 'ambaga.chine@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'KR',
        name: 'South Korea',
        nameFr: 'Corée du Sud',
        region: 'asia',
        flag: '🇰🇷',
        representations: [
            {
                id: 'kr-ambassade-seoul',
                type: 'ambassade',
                city: 'Séoul',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '16-1 Itaewon-dong, Yongsan-gu, Seoul',
                    phone: '+82 2 793 9575',
                    email: 'ambaga.coree@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'JP',
        name: 'Japan',
        nameFr: 'Japon',
        region: 'asia',
        flag: '🇯🇵',
        representations: [
            {
                id: 'jp-ambassade-tokyo',
                type: 'ambassade',
                city: 'Tokyo',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '1-34-11 Higashigaoka, Meguro-ku, Tokyo',
                    phone: '+81 3 5430 9171',
                    email: 'ambaga.japon@diplomatie.gouv.ga',
                },
            },
        ],
    },
];

// ============================================================================
// AMERICAS
// ============================================================================

export const DEMO_AMERICAS: DemoCountryConfig[] = [
    {
        code: 'US',
        name: 'United States',
        nameFr: 'États-Unis',
        region: 'americas',
        flag: '🇺🇸',
        representations: [
            {
                id: 'us-ambassade-washington',
                type: 'ambassade',
                city: 'Washington D.C.',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '2034 20th Street NW, Washington, DC 20009',
                    phone: '+1 202 797 1000',
                    email: 'ambaga.usa@diplomatie.gouv.ga',
                    website: 'https://www.gabonembassyusa.org',
                },
            },
            {
                id: 'us-consulat-new-york',
                type: 'consulat_general',
                city: 'New York',
                isMainRepresentation: false,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 16:00' },
                contact: {
                    address: '18 East 41st Street, 9th Floor, New York, NY 10017',
                    phone: '+1 212 686 9720',
                    email: 'consulat.newyork@diplomatie.gouv.ga',
                },
            },
            {
                id: 'us-consulat-los-angeles',
                type: 'consulat_honoraire',
                city: 'Los Angeles',
                isMainRepresentation: false,
                enabledServices: [DEMO_SERVICES.legalization, DEMO_SERVICES.certificateLife],
                allowedUserTypes: RESSORTISSANTS_ONLY,
                schedule: { weekdays: '10:00 - 14:00' },
                contact: {
                    address: '1100 Glendon Avenue, Los Angeles, CA 90024',
                    phone: '+1 310 441 8840',
                    email: 'consulat.losangeles@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'CA',
        name: 'Canada',
        nameFr: 'Canada',
        region: 'americas',
        flag: '🇨🇦',
        representations: [
            {
                id: 'ca-ambassade-ottawa',
                type: 'ambassade',
                city: 'Ottawa',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 17:00' },
                contact: {
                    address: '4 Range Road, Ottawa, Ontario K1N 8J5',
                    phone: '+1 613 232 5301',
                    email: 'ambaga.canada@diplomatie.gouv.ga',
                },
            },
        ],
    },
];

// ============================================================================
// AFRICA
// ============================================================================

export const DEMO_AFRICA: DemoCountryConfig[] = [
    {
        code: 'MA',
        name: 'Morocco',
        nameFr: 'Maroc',
        region: 'africa',
        flag: '🇲🇦',
        representations: [
            {
                id: 'ma-ambassade-rabat',
                type: 'ambassade',
                city: 'Rabat',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 16:00' },
                contact: {
                    address: '34, Avenue Lalla Asmaa, Souissi, Rabat',
                    phone: '+212 537 75 94 60',
                    email: 'ambaga.maroc@diplomatie.gouv.ga',
                },
            },
            {
                id: 'ma-consulat-casablanca',
                type: 'consulat_general',
                city: 'Casablanca',
                isMainRepresentation: false,
                enabledServices: CONSULAT_SERVICES_NO_PASSPORT,
                allowedUserTypes: RESSORTISSANTS_ONLY,
                schedule: { weekdays: '09:00 - 15:00' },
                contact: {
                    address: '5, Rue Tiddas, Quartier Racine, Casablanca',
                    phone: '+212 522 22 35 39',
                    email: 'consulat.casablanca@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'SN',
        name: 'Senegal',
        nameFr: 'Sénégal',
        region: 'africa',
        flag: '🇸🇳',
        representations: [
            {
                id: 'sn-ambassade-dakar',
                type: 'ambassade',
                city: 'Dakar',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '08:00 - 16:00' },
                contact: {
                    address: 'Rue 1 x Corniche Ouest, Point E, Dakar',
                    phone: '+221 33 825 29 00',
                    email: 'ambaga.senegal@diplomatie.gouv.ga',
                },
            },
        ],
    },
    {
        code: 'EG',
        name: 'Egypt',
        nameFr: 'Égypte',
        region: 'africa',
        flag: '🇪🇬',
        representations: [
            {
                id: 'eg-ambassade-le-caire',
                type: 'ambassade',
                city: 'Le Caire',
                isMainRepresentation: true,
                enabledServices: FULL_SERVICES,
                allowedUserTypes: ALL_USER_TYPES,
                schedule: { weekdays: '09:00 - 16:00' },
                contact: {
                    address: '17, Shagaret El Dorr Street, Zamalek, Cairo',
                    phone: '+20 2 2736 0040',
                    email: 'ambaga.egypte@diplomatie.gouv.ga',
                },
            },
        ],
    },
];

// ============================================================================
// ALL DEMO COUNTRIES
// ============================================================================

export const DEMO_COUNTRIES: DemoCountryConfig[] = [
    ...DEMO_EUROPE,
    ...DEMO_ASIA,
    ...DEMO_AMERICAS,
    ...DEMO_AFRICA,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all countries for demo
 */
export function getDemoCountries() {
    return DEMO_COUNTRIES;
}

/**
 * Get countries by region
 */
export function getDemoCountriesByRegion(region: 'europe' | 'asia' | 'americas' | 'africa') {
    return DEMO_COUNTRIES.filter(c => c.region === region);
}

/**
 * Get country by code
 */
export function getDemoCountryByCode(code: string) {
    return DEMO_COUNTRIES.find(c => c.code === code);
}

/**
 * Get all representations for a country
 */
export function getRepresentationsForCountry(countryCode: string) {
    const country = getDemoCountryByCode(countryCode);
    return country?.representations || [];
}

/**
 * Get main representation for a country
 */
export function getMainRepresentation(countryCode: string) {
    const reps = getRepresentationsForCountry(countryCode);
    return reps.find(r => r.isMainRepresentation) || reps[0];
}

/**
 * Get representation by ID
 */
export function getRepresentationById(id: string) {
    for (const country of DEMO_COUNTRIES) {
        const rep = country.representations.find(r => r.id === id);
        if (rep) {
            return { country, representation: rep };
        }
    }
    return null;
}

/**
 * Get all representation IDs
 */
export function getAllRepresentationIds() {
    return DEMO_COUNTRIES.flatMap(c => c.representations.map(r => r.id));
}

/**
 * Stats for demo
 */
export function getDemoStats() {
    const totalCountries = DEMO_COUNTRIES.length;
    const totalRepresentations = DEMO_COUNTRIES.reduce(
        (sum, c) => sum + c.representations.length,
        0
    );
    const byRegion = {
        europe: DEMO_EUROPE.length,
        asia: DEMO_ASIA.length,
        americas: DEMO_AMERICAS.length,
        africa: DEMO_AFRICA.length,
    };

    return { totalCountries, totalRepresentations, byRegion };
}
