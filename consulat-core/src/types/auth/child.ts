import { RegistrationStatus } from "./citizen";

export enum ParentalRole {
    FATHER = 'FATHER',
    MOTHER = 'MOTHER',
    GUARDIAN = 'GUARDIAN'
}

export enum ProfileStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export interface ParentInfo {
    profileId?: string; // ID of the parent's profile if they are in the system
    role: ParentalRole;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    address?: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
}

export interface ChildProfile {
    id: string;
    authorUserId: string; // ID of the parent who created this profile
    status: ProfileStatus;
    residenceCountry?: string;

    consularCard?: {
        cardNumber?: string;
        cardIssuedAt?: Date;
        cardExpiresAt?: Date;
    };

    personal: {
        firstName: string;
        lastName: string;
        birthDate?: Date;
        birthPlace?: string;
        birthCountry?: string;
        gender?: 'M' | 'F';
        nationality?: string;
        acquisitionMode?: 'BIRTH' | 'NATURALIZATION' | 'DECLARATION';
        passportInfos?: {
            number?: string;
            issueDate?: Date;
            expiryDate?: Date;
            issueAuthority?: string;
        };
        nipCode?: string;
    };

    registrationRequest?: string; // ID of the request

    parents: ParentInfo[];

    documents: {
        passport?: { id: string; fileUrl: string };
        birthCertificate?: { id: string; fileUrl: string };
        residencePermit?: { id: string; fileUrl: string };
        addressProof?: { id: string; fileUrl: string };
        identityPicture?: { id: string; fileUrl: string };
    };

    createdAt: Date;
    updatedAt: Date;
}
