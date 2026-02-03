/**
 * Registration Schemas by User Type
 * Different registration forms for each user category
 */

import * as z from 'zod';
import {
    NameSchema,
    EmailSchema,
    PhoneSchema,
    DateSchema,
    BasicAddressSchema,
    PassportInfoSchema,
    GenderSchema,
    CountryCodeSchema,
} from './inputs';
import { RessortissantType, VisiteurType } from '@/types/user-account-types';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

const PersonNameSchema = z.object({
    firstName: NameSchema.optional(),
    lastName: NameSchema.optional(),
});

// ============================================================================
// RESSORTISSANT SCHEMAS (Gabonais)
// ============================================================================

/**
 * Base schema for all Gabonese nationals
 */
const RessortissantBaseSchema = z.object({
    // Personal info
    firstName: NameSchema,
    lastName: NameSchema,
    gender: GenderSchema,
    birthDate: DateSchema,
    birthPlace: z.string().min(1, 'Lieu de naissance requis'),
    birthCountry: CountryCodeSchema.default('GA'),
    nationality: z.literal('GA'),

    // Passport
    passportInfos: PassportInfoSchema,
    nipCode: z.string().optional(), // NIP Gabonais

    // Contact
    email: EmailSchema,
    phone: PhoneSchema,

    // Current location abroad
    residenceCountry: CountryCodeSchema,
    residenceAddress: BasicAddressSchema,

    // Emergency contact
    emergencyContact: z.object({
        name: NameSchema,
        phone: PhoneSchema,
        relationship: z.string(),
    }).optional(),
});

/**
 * Gabonais Résident (+6 mois) - Full registration
 */
export const RessortissantResidentSchema = RessortissantBaseSchema.extend({
    userType: z.literal(RessortissantType.RESIDENT),

    // Duration confirms +6 months
    stayDuration: z.literal('more_than_6_months'),
    arrivalDate: DateSchema, // Date of arrival in host country

    // Family situation (for consular registration)
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'pacs']),
    spouse: PersonNameSchema.optional(),
    numberOfChildren: z.number().min(0).default(0),
    father: PersonNameSchema.optional(),
    mother: PersonNameSchema.optional(),

    // Professional situation
    workStatus: z.enum(['employed', 'self_employed', 'unemployed', 'student', 'retired', 'other']),
    profession: z.string().optional(),
    employer: z.string().optional(),
    employerAddress: z.string().optional(),

    // Documents
    identityPhoto: z.any().optional(), // Photo file
    proofOfResidence: z.any().optional(), // Proof of address abroad
});

export type RessortissantResidentFormData = z.infer<typeof RessortissantResidentSchema>;

/**
 * Gabonais De Passage (-6 mois) - Simplified declaration
 */
export const RessortissantDePassageSchema = RessortissantBaseSchema.extend({
    userType: z.literal(RessortissantType.DE_PASSAGE),

    // Duration confirms -6 months
    stayDuration: z.literal('less_than_6_months'),
    arrivalDate: DateSchema,
    plannedDepartureDate: DateSchema, // When they plan to leave

    // Purpose of travel
    travelPurpose: z.enum(['tourism', 'business', 'family', 'medical', 'studies', 'other']),
    travelPurposeDetails: z.string().optional(),

    // Accommodation abroad
    accommodationType: z.enum(['hotel', 'family', 'rental', 'other']),
    accommodationAddress: z.string().optional(),
});

export type RessortissantDePassageFormData = z.infer<typeof RessortissantDePassageSchema>;

// ============================================================================
// VISITEUR SCHEMAS (Étrangers)
// ============================================================================

/**
 * Base schema for all foreign visitors
 */
const VisiteurBaseSchema = z.object({
    // Personal info
    firstName: NameSchema,
    lastName: NameSchema,
    gender: GenderSchema,
    birthDate: DateSchema,
    birthPlace: z.string().min(1, 'Lieu de naissance requis'),
    birthCountry: CountryCodeSchema,
    nationality: CountryCodeSchema, // Their nationality (not GA)

    // Passport
    passportInfos: PassportInfoSchema,

    // Contact
    email: EmailSchema,
    phone: PhoneSchema,

    // Current residence
    residenceCountry: CountryCodeSchema,
    residenceAddress: BasicAddressSchema,
});

/**
 * Visiteur - Visa Tourisme
 */
export const VisiteurTourismeSchema = VisiteurBaseSchema.extend({
    userType: z.literal(VisiteurType.VISA_TOURISME),

    // Travel details
    plannedArrivalDate: DateSchema,
    plannedDepartureDate: DateSchema,
    stayDuration: z.number().min(1).max(90), // Days

    // Entry/Exit points
    entryPoint: z.string().min(1, 'Point d\'entrée requis'), // Airport, border

    // Accommodation in Gabon
    accommodationType: z.enum(['hotel', 'family', 'rental', 'other']),
    accommodationName: z.string().optional(),
    accommodationAddress: z.string().optional(),
    accommodationPhone: z.string().optional(),

    // Host in Gabon (if staying with family/friends)
    hasHost: z.boolean().default(false),
    hostInfo: z.object({
        name: NameSchema,
        relationship: z.string(),
        address: z.string(),
        phone: PhoneSchema,
    }).optional(),

    // Travel history
    previousVisitsToGabon: z.boolean().default(false),

    // Financial means
    proofOfFunds: z.any().optional(), // Bank statement

    // Documents
    returnTicket: z.any().optional(),
    hotelReservation: z.any().optional(),
    identityPhoto: z.any().optional(),
});

export type VisiteurTourismeFormData = z.infer<typeof VisiteurTourismeSchema>;

/**
 * Visiteur - Visa Affaires
 */
export const VisiteurAffairesSchema = VisiteurBaseSchema.extend({
    userType: z.literal(VisiteurType.VISA_AFFAIRES),

    // Travel details
    plannedArrivalDate: DateSchema,
    plannedDepartureDate: DateSchema,
    stayDuration: z.number().min(1).max(90),

    // Business purpose
    businessPurpose: z.enum([
        'meeting',
        'conference',
        'negotiation',
        'inspection',
        'training',
        'other',
    ]),
    businessPurposeDetails: z.string().min(1, 'Détails de la mission requis'),

    // Employer/Company info
    employerName: z.string().min(1, 'Employeur requis'),
    employerAddress: z.string(),
    employerPhone: z.string().optional(),
    jobTitle: z.string(),

    // Host company in Gabon
    hostCompanyName: z.string().min(1, 'Entreprise hôte requise'),
    hostCompanyAddress: z.string(),
    hostCompanyPhone: z.string().optional(),
    hostContactName: z.string(),
    hostContactEmail: EmailSchema.optional(),

    // Documents
    invitationLetter: z.any().optional(), // From Gabon company
    employerLetter: z.any().optional(), // Mission order
    identityPhoto: z.any().optional(),
});

export type VisiteurAffairesFormData = z.infer<typeof VisiteurAffairesSchema>;

/**
 * Visiteur - Service lié au Gabon (non-visa)
 */
export const VisiteurServiceGabonSchema = VisiteurBaseSchema.extend({
    userType: z.literal(VisiteurType.SERVICE_GABON),

    // Service requested
    serviceType: z.enum([
        'legalization',
        'apostille',
        'document_certification',
        'certificate_customs',
        'other',
    ]),
    serviceDetails: z.string().optional(),

    // Documents to process
    documentsToProcess: z.array(z.object({
        type: z.string(),
        description: z.string(),
        file: z.any().optional(),
    })).optional(),

    // Connection to Gabon
    connectionToGabon: z.enum([
        'business_partner',
        'property_owner',
        'family_connection',
        'legal_matter',
        'other',
    ]),
    connectionDetails: z.string().optional(),
});

export type VisiteurServiceGabonFormData = z.infer<typeof VisiteurServiceGabonSchema>;

// ============================================================================
// REGISTRATION STEP DEFINITIONS
// ============================================================================

export const RESSORTISSANT_RESIDENT_STEPS = [
    { key: 'identity', title: 'Identité', fields: ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'birthCountry', 'nationality', 'nipCode'] },
    { key: 'passport', title: 'Passeport', fields: ['passportInfos'] },
    { key: 'residence', title: 'Résidence', fields: ['residenceCountry', 'residenceAddress', 'arrivalDate', 'stayDuration'] },
    { key: 'family', title: 'Famille', fields: ['maritalStatus', 'spouse', 'numberOfChildren', 'father', 'mother'] },
    { key: 'profession', title: 'Profession', fields: ['workStatus', 'profession', 'employer', 'employerAddress'] },
    { key: 'contact', title: 'Contact', fields: ['email', 'phone', 'emergencyContact'] },
    { key: 'documents', title: 'Documents', fields: ['identityPhoto', 'proofOfResidence'] },
];

export const RESSORTISSANT_DE_PASSAGE_STEPS = [
    { key: 'identity', title: 'Identité', fields: ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'birthCountry'] },
    { key: 'passport', title: 'Passeport', fields: ['passportInfos'] },
    { key: 'travel', title: 'Séjour', fields: ['residenceCountry', 'arrivalDate', 'plannedDepartureDate', 'travelPurpose'] },
    { key: 'accommodation', title: 'Hébergement', fields: ['accommodationType', 'accommodationAddress'] },
    { key: 'contact', title: 'Contact', fields: ['email', 'phone'] },
];

export const VISITEUR_TOURISME_STEPS = [
    { key: 'identity', title: 'Identité', fields: ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'nationality'] },
    { key: 'passport', title: 'Passeport', fields: ['passportInfos'] },
    { key: 'residence', title: 'Résidence actuelle', fields: ['residenceCountry', 'residenceAddress'] },
    { key: 'travel', title: 'Voyage au Gabon', fields: ['plannedArrivalDate', 'plannedDepartureDate', 'entryPoint'] },
    { key: 'accommodation', title: 'Hébergement', fields: ['accommodationType', 'accommodationName', 'hasHost', 'hostInfo'] },
    { key: 'documents', title: 'Justificatifs', fields: ['proofOfFunds', 'returnTicket', 'hotelReservation', 'identityPhoto'] },
];

export const VISITEUR_AFFAIRES_STEPS = [
    { key: 'identity', title: 'Identité', fields: ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'nationality'] },
    { key: 'passport', title: 'Passeport', fields: ['passportInfos'] },
    { key: 'employer', title: 'Employeur', fields: ['employerName', 'employerAddress', 'jobTitle'] },
    { key: 'mission', title: 'Mission', fields: ['businessPurpose', 'businessPurposeDetails', 'plannedArrivalDate', 'plannedDepartureDate'] },
    { key: 'host', title: 'Entreprise hôte', fields: ['hostCompanyName', 'hostCompanyAddress', 'hostContactName', 'hostContactEmail'] },
    { key: 'documents', title: 'Justificatifs', fields: ['invitationLetter', 'employerLetter', 'identityPhoto'] },
];

export const VISITEUR_SERVICE_GABON_STEPS = [
    { key: 'identity', title: 'Identité', fields: ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'nationality'] },
    { key: 'passport', title: 'Passeport', fields: ['passportInfos'] },
    { key: 'contact', title: 'Contact', fields: ['email', 'phone', 'residenceAddress'] },
    { key: 'service', title: 'Service demandé', fields: ['serviceType', 'serviceDetails', 'connectionToGabon'] },
    { key: 'documents', title: 'Documents', fields: ['documentsToProcess'] },
];

// ============================================================================
// HELPER: GET STEPS FOR USER TYPE
// ============================================================================

export function getRegistrationStepsForUserType(userType: string) {
    switch (userType) {
        case RessortissantType.RESIDENT:
            return RESSORTISSANT_RESIDENT_STEPS;
        case RessortissantType.DE_PASSAGE:
            return RESSORTISSANT_DE_PASSAGE_STEPS;
        case VisiteurType.VISA_TOURISME:
            return VISITEUR_TOURISME_STEPS;
        case VisiteurType.VISA_AFFAIRES:
            return VISITEUR_AFFAIRES_STEPS;
        case VisiteurType.SERVICE_GABON:
            return VISITEUR_SERVICE_GABON_STEPS;
        default:
            return [];
    }
}

export function getSchemaForUserType(userType: string) {
    switch (userType) {
        case RessortissantType.RESIDENT:
            return RessortissantResidentSchema;
        case RessortissantType.DE_PASSAGE:
            return RessortissantDePassageSchema;
        case VisiteurType.VISA_TOURISME:
            return VisiteurTourismeSchema;
        case VisiteurType.VISA_AFFAIRES:
            return VisiteurAffairesSchema;
        case VisiteurType.SERVICE_GABON:
            return VisiteurServiceGabonSchema;
        default:
            return z.object({});
    }
}
