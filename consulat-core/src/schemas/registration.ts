/**
 * Registration Schemas
 * Zod schemas for user registration forms
 * Adapted from reference project for consulat.ga-core
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
    MaritalStatusSchema,
    WorkStatusSchema,
    NationalityAcquisitionSchema,
    CountryCodeSchema,
} from './inputs';

// ============================================================================
// BASIC INFO (STEP 1)
// ============================================================================

/**
 * Personal information schema
 */
export const BasicInfoSchema = z.object({
    firstName: NameSchema,
    lastName: NameSchema,
    gender: GenderSchema,
    acquisitionMode: NationalityAcquisitionSchema.optional(),
    birthDate: DateSchema.optional(),
    birthPlace: z.string().min(1, 'Lieu de naissance requis'),
    birthCountry: CountryCodeSchema,
    nationality: CountryCodeSchema,
    passportInfos: PassportInfoSchema.optional(),
    nipCode: z.string().optional(), // National Identification Number
    identityPicture: z.any().optional(), // Photo file
});

export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;

// ============================================================================
// FAMILY INFO (STEP 2)
// ============================================================================

/**
 * Parent/spouse info
 */
const PersonNameSchema = z.object({
    firstName: NameSchema.optional(),
    lastName: NameSchema.optional(),
});

/**
 * Family information schema
 */
export const FamilyInfoSchema = z.object({
    maritalStatus: MaritalStatusSchema,
    father: PersonNameSchema.optional(),
    mother: PersonNameSchema.optional(),
    spouse: PersonNameSchema.optional(),
    numberOfChildren: z.number().min(0).optional(),
});

export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>;

// ============================================================================
// CONTACT INFO (STEP 3)
// ============================================================================

/**
 * Contact information schema
 */
export const ContactInfoSchema = z.object({
    email: EmailSchema.optional(),
    phone: PhoneSchema.optional(),
    address: BasicAddressSchema.optional(),
});

export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>;

// ============================================================================
// PROFESSIONAL INFO (STEP 4)
// ============================================================================

/**
 * Professional information schema
 */
export const ProfessionalInfoSchema = z.object({
    workStatus: WorkStatusSchema,
    profession: NameSchema.optional(),
    employer: NameSchema.optional(),
    employerAddress: z.string().optional(),
    activityInGabon: z.string().max(200).optional(),
});

export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>;

// ============================================================================
// DOCUMENTS (STEP 5)
// ============================================================================

/**
 * User document schema
 */
const UserDocumentSchema = z.object({
    type: z.enum([
        'passport',
        'birth_certificate',
        'residence_permit',
        'address_proof',
        'identity_picture',
        'marriage_certificate',
        'other',
    ]),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileType: z.string().optional(),
    fileSize: z.number().optional(),
});

/**
 * Documents schema for registration
 */
export const DocumentsSchema = z.object({
    passport: UserDocumentSchema.nullable().optional(),
    birthCertificate: UserDocumentSchema.nullable().optional(),
    residencePermit: UserDocumentSchema.nullable().optional(),
    addressProof: UserDocumentSchema.nullable().optional(),
    identityPicture: UserDocumentSchema.nullable().optional(),
});

export type DocumentsFormData = z.infer<typeof DocumentsSchema>;
export type UserDocument = z.infer<typeof UserDocumentSchema>;

// ============================================================================
// COMPLETE REGISTRATION
// ============================================================================

/**
 * Complete registration schema (all steps combined)
 */
export const CompleteRegistrationSchema = z.object({
    basicInfo: BasicInfoSchema,
    familyInfo: FamilyInfoSchema,
    contactInfo: ContactInfoSchema,
    professionalInfo: ProfessionalInfoSchema,
    documents: DocumentsSchema,
});

export type CompleteRegistrationData = z.infer<typeof CompleteRegistrationSchema>;

// ============================================================================
// REGISTRATION STEP FIELDS
// ============================================================================

/**
 * Field names for each registration step
 * Used for progress calculation and validation
 */
export const registrationSteps = {
    basicInfo: [
        'firstName',
        'lastName',
        'gender',
        'acquisitionMode',
        'birthDate',
        'birthPlace',
        'birthCountry',
        'nationality',
        'passportInfos',
        'nipCode',
        'identityPicture',
    ] as const,

    familyInfo: [
        'maritalStatus',
        'father',
        'mother',
        'spouse',
        'numberOfChildren',
    ] as const,

    contactInfo: [
        'email',
        'phone',
        'address',
    ] as const,

    professionalInfo: [
        'workStatus',
        'profession',
        'employer',
        'employerAddress',
        'activityInGabon',
    ] as const,

    documents: [
        'passport',
        'birthCertificate',
        'residencePermit',
        'addressProof',
        'identityPicture',
    ] as const,
};

export type RegistrationStepKey = keyof typeof registrationSteps;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Get default values for registration form
 */
export function getRegistrationDefaults(existingData?: Partial<CompleteRegistrationData>) {
    return {
        basicInfo: {
            firstName: existingData?.basicInfo?.firstName || '',
            lastName: existingData?.basicInfo?.lastName || '',
            gender: existingData?.basicInfo?.gender || undefined,
            acquisitionMode: existingData?.basicInfo?.acquisitionMode || 'birth',
            birthDate: existingData?.basicInfo?.birthDate || '',
            birthPlace: existingData?.basicInfo?.birthPlace || '',
            birthCountry: existingData?.basicInfo?.birthCountry || 'GA',
            nationality: existingData?.basicInfo?.nationality || 'GA',
            passportInfos: existingData?.basicInfo?.passportInfos || undefined,
            nipCode: existingData?.basicInfo?.nipCode || '',
        },
        familyInfo: {
            maritalStatus: existingData?.familyInfo?.maritalStatus || 'single',
            father: existingData?.familyInfo?.father || undefined,
            mother: existingData?.familyInfo?.mother || undefined,
            spouse: existingData?.familyInfo?.spouse || undefined,
            numberOfChildren: existingData?.familyInfo?.numberOfChildren || 0,
        },
        contactInfo: {
            email: existingData?.contactInfo?.email || '',
            phone: existingData?.contactInfo?.phone || '',
            address: existingData?.contactInfo?.address || undefined,
        },
        professionalInfo: {
            workStatus: existingData?.professionalInfo?.workStatus || 'unemployed',
            profession: existingData?.professionalInfo?.profession || '',
            employer: existingData?.professionalInfo?.employer || '',
            employerAddress: existingData?.professionalInfo?.employerAddress || '',
            activityInGabon: existingData?.professionalInfo?.activityInGabon || '',
        },
        documents: {
            passport: existingData?.documents?.passport || null,
            birthCertificate: existingData?.documents?.birthCertificate || null,
            residencePermit: existingData?.documents?.residencePermit || null,
            addressProof: existingData?.documents?.addressProof || null,
            identityPicture: existingData?.documents?.identityPicture || null,
        },
    };
}
