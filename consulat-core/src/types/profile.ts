/**
 * Profile Types for Consulat.ga-core
 * Complete citizen profile with all consular data fields
 * Migrated from consulat (Next.js/Convex)
 */

import {
    ProfileStatus,
    Gender,
    MaritalStatus,
    WorkStatus,
    NationalityAcquisition,
    FamilyLink,
    EmergencyContactType,
    CountryCode,
} from '@/lib/constants';

// ============================================================================
// ADDRESS TYPES
// ============================================================================

export interface Address {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: CountryCode | string;
    complement?: string;
    coordinates?: {
        latitude: string;
        longitude: string;
    };
}

// ============================================================================
// DOCUMENT REFERENCE TYPES
// ============================================================================

export interface DocumentReference {
    id: string;
    fileUrl: string;
}

export interface PassportInfo {
    number?: string;
    issueDate?: number; // Unix timestamp
    expiryDate?: number; // Unix timestamp
    issueAuthority?: string;
}

// ============================================================================
// CONSULAR CARD TYPES
// ============================================================================

export interface ConsularCard {
    cardNumber?: string;
    cardIssuedAt?: number; // Unix timestamp
    cardExpiresAt?: number; // Unix timestamp
}

// ============================================================================
// CONTACT TYPES
// ============================================================================

export interface ProfileContacts {
    email?: string;
    phone?: string;
    address?: Address;
}

// ============================================================================
// PERSONAL INFO TYPES
// ============================================================================

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    birthDate?: number; // Unix timestamp
    birthPlace?: string;
    birthCountry?: CountryCode | string;
    gender?: Gender | string;
    nationality?: CountryCode | string;
    acquisitionMode?: NationalityAcquisition | string;
    passportInfos?: PassportInfo;
    nipCode?: string; // National identification code
}

// ============================================================================
// FAMILY INFO TYPES
// ============================================================================

export interface ParentInfo {
    firstName?: string;
    lastName?: string;
}

export interface SpouseInfo {
    firstName?: string;
    lastName?: string;
}

export interface FamilyInfo {
    maritalStatus?: MaritalStatus | string;
    father?: ParentInfo;
    mother?: ParentInfo;
    spouse?: SpouseInfo;
}

// ============================================================================
// EMERGENCY CONTACT TYPES
// ============================================================================

export interface EmergencyContact {
    type: EmergencyContactType | string;
    firstName: string;
    lastName: string;
    email?: string;
    relationship: FamilyLink | string;
    phoneNumber?: string;
    address?: Address;
    profileId?: string;
}

// ============================================================================
// PROFESSION TYPES
// ============================================================================

export interface ProfessionSituation {
    workStatus?: WorkStatus | string;
    profession?: string;
    employer?: string;
    employerAddress?: string;
    activityInGabon?: string;
    cv?: string; // Document ID reference
}

// ============================================================================
// PROFILE DOCUMENTS
// ============================================================================

export interface ProfileDocuments {
    passport?: DocumentReference;
    birthCertificate?: DocumentReference;
    residencePermit?: DocumentReference;
    addressProof?: DocumentReference;
    identityPicture?: DocumentReference;
}

// ============================================================================
// FULL PROFILE TYPE
// ============================================================================

export interface Profile {
    id: string;
    user_id: string;
    status: ProfileStatus | string;
    residence_country?: CountryCode | string;

    // Consular card information
    consular_card?: ConsularCard;

    // Contact information
    contacts?: ProfileContacts;

    // Personal information
    personal: PersonalInfo;

    // Family information
    family?: FamilyInfo;

    // Emergency contacts
    emergency_contacts?: EmergencyContact[];

    // Professional situation
    profession_situation?: ProfessionSituation;

    // Registration request reference
    registration_request_id?: string;

    // Documents
    documents?: ProfileDocuments;

    // Timestamps
    created_at: string;
    updated_at: string;

    // Joined relations (optional, from queries)
    organization?: {
        id: string;
        name: string;
        type: string;
    };
}

// ============================================================================
// CHILD PROFILE TYPE (for minors)
// ============================================================================

export interface ParentalAuthority {
    profileId?: string;
    role: 'father' | 'mother' | 'legal_guardian';
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    address?: Address;
}

export interface ChildProfile {
    id: string;
    parent_profile_id: string;
    status: ProfileStatus | string;

    // Personal information
    personal: PersonalInfo;

    // Family information
    family?: {
        parentalAuthorities?: ParentalAuthority[];
    };

    // Documents
    documents?: ProfileDocuments;

    // Timestamps
    created_at: string;
    updated_at: string;
}

// ============================================================================
// PROFILE CREATION/UPDATE DTOs
// ============================================================================

export interface CreateProfileDTO {
    user_id: string;
    personal: PersonalInfo;
    residence_country?: string;
}

export interface UpdateProfileDTO {
    status?: ProfileStatus | string;
    residence_country?: string;
    consular_card?: ConsularCard;
    contacts?: ProfileContacts;
    personal?: Partial<PersonalInfo>;
    family?: FamilyInfo;
    emergency_contacts?: EmergencyContact[];
    profession_situation?: ProfessionSituation;
    documents?: Partial<ProfileDocuments>;
}

// ============================================================================
// PROFILE VALIDATION TYPES
// ============================================================================

export interface ProfileValidationResult {
    isValid: boolean;
    errors: {
        field: string;
        message: string;
    }[];
    warnings: {
        field: string;
        message: string;
    }[];
}

// ============================================================================
// LEGACY COMPATIBILITY (for existing code)
// ============================================================================

/** @deprecated Use Profile instead */
export interface LegacyProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    organization_id?: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    organization?: {
        name: string;
        metadata: any;
    };
}
