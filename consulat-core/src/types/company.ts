import { DemoUser } from './roles';

export enum CompanyRole {
    CEO = 'CEO',
    OWNER = 'OWNER',
    PRESIDENT = 'PRESIDENT',
    DIRECTOR = 'DIRECTOR',
    MANAGER = 'MANAGER'
}

export enum CompanyType {
    SARL = 'SARL',
    SA = 'SA',
    SAS = 'SAS',
    SASU = 'SASU',
    EURL = 'EURL',
    EI = 'EI',
    AUTO_ENTREPRENEUR = 'AUTO_ENTREPRENEUR',
    OTHER = 'OTHER'
}

export enum ActivitySector {
    TECHNOLOGY = 'TECHNOLOGY',
    COMMERCE = 'COMMERCE',
    SERVICES = 'SERVICES',
    INDUSTRY = 'INDUSTRY',
    AGRICULTURE = 'AGRICULTURE',
    HEALTH = 'HEALTH',
    EDUCATION = 'EDUCATION',
    CULTURE = 'CULTURE',
    TOURISM = 'TOURISM',
    TRANSPORT = 'TRANSPORT',
    CONSTRUCTION = 'CONSTRUCTION',
    OTHER = 'OTHER'
}

export type EntityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AddressData {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
}

export interface Company {
    id: string;

    // Informations de base
    name: string;
    legalName?: string;
    companyType: CompanyType;
    activitySector: ActivitySector;
    siret?: string;
    registrationNumber?: string;

    // Statut et validation
    status: EntityStatus;
    validatedAt?: string; // ISO Date
    validatedById?: string;
    rejectionReason?: string;

    // Contact
    email: string;
    phone: string;
    website?: string;

    // Description
    description: string;
    shortDescription?: string;

    // Médias
    logoUrl?: string;

    // Adresse
    address: AddressData;
    coordinates?: [number, number];

    // Relation avec l'utilisateur créateur
    ownerId: string;
    ownerRole: CompanyRole;

    // Métadonnées
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
}

export interface CompanyWithDetails extends Company {
    owner?: DemoUser;
    validatedBy?: DemoUser;
}
