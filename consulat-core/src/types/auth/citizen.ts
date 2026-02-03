export enum CitizenType {
    GABONAIS = 'GABONAIS',
    ETRANGER = 'ETRANGER'
}

export enum ForeignerStatus {
    RESIDENT = 'RESIDENT',
    WORKER = 'WORKER',
    STUDENT = 'STUDENT',
    TEMPORARY_VISITOR = 'TEMPORARY_VISITOR',
    OTHER = 'OTHER'
}

export enum RegistrationStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    INCOMPLETE = 'INCOMPLETE',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED'
}

export enum RequestReason {
    VISA_REQUEST = 'VISA_REQUEST',
    LEGALIZATION = 'LEGALIZATION',
    CERTIFICATE_OF_LIFE = 'CERTIFICATE_OF_LIFE',
    SPECIAL_ASSISTANCE = 'SPECIAL_ASSISTANCE',
    DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
    OTHER = 'OTHER'
}

export interface DocumentFile {
    id: string;
    userId: string;
    documentType: 'IDENTITY' | 'PHOTO' | 'ADDRESS_PROOF' | 'RESIDENCE_CARD' | 'OTHER';
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: Date;
    status: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
    rejectionReason?: string;
    verifiedBy?: string;
}

// Base User Interface
export interface BaseUser {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'M' | 'F' | 'O';
    currentAddress: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    preferredLanguage: 'FR' | 'EN';
    assignedConsulate: string;
    uploadedDocuments: DocumentFile[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GabonaisCitizen extends BaseUser {
    citizenType: CitizenType.GABONAIS;
    birthPlace: string; // Région gabonaise

    // Documents
    cniNumber: string;
    cniExpireDate: Date;
    passportNumber?: string;
    passportExpireDate?: Date;

    // État civil
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    profession: string;

    addressInGabon?: {
        street: string;
        city: string;
        region: string;
        postalCode: string;
    };

    preferredContact: 'EMAIL' | 'SMS' | 'PHONE';
    consulateFile?: string;

    registrationStatus: RegistrationStatus.APPROVED;
    registrationDate: Date;
    approvalDate: Date;
    verifiedAt: Date;

    accessLevel: 'FULL';

    childProfiles?: string[]; // IDs of child profiles
}

export interface ForeignerUser extends BaseUser {
    citizenType: CitizenType.ETRANGER;
    birthPlace: string; // Pays d'origine
    nationality: string;

    // Documents
    documentType: 'PASSPORT' | 'RESIDENCE_CARD' | 'WORK_PERMIT' | 'ID_CARD';
    documentNumber: string;
    documentIssuingCountry: string;
    documentExpireDate: Date;

    // Statut
    statusInCountry: ForeignerStatus;
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    profession: string;
    employer?: string;

    // Motif
    requestReason: RequestReason;
    requestDescription?: string;

    // Informations de voyage (si Visa)
    travelInformation?: {
        arrivalDate: Date;
        departureDate: Date;
        accommodationType: 'HOTEL' | 'FAMILY' | 'BUSINESS';
        accommodationAddress: string;
    };

    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };

    consultantFileNumber?: string;

    registrationStatus: RegistrationStatus;
    registrationDate: Date;
    approvalDate?: Date;
    rejectionReason?: string;
    approvedBy?: string;

    accessLevel: 'LIMITED';
    approvalDeadline?: Date;
}

export type Citizen = GabonaisCitizen | ForeignerUser;
