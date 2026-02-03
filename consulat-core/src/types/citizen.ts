// Énumération des types d'usagers
export enum CitizenType {
    GABONAIS = 'GABONAIS',
    ETRANGER = 'ETRANGER'
}

// Énumération des statuts dans le pays d'accueil
export enum ForeignerStatus {
    RESIDENT = 'RESIDENT',
    WORKER = 'WORKER',
    STUDENT = 'STUDENT',
    TEMPORARY_VISITOR = 'TEMPORARY_VISITOR',
    OTHER = 'OTHER'
}

// Énumération des statuts d'inscription
export enum RegistrationStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',      // Pour étrangers
    APPROVED = 'APPROVED',
    INCOMPLETE = 'INCOMPLETE',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED'
}

// Énumération des types de motifs (étrangers)
export enum RequestReason {
    VISA_REQUEST = 'VISA_REQUEST',
    LEGALIZATION = 'LEGALIZATION',
    CERTIFICATE_OF_LIFE = 'CERTIFICATE_OF_LIFE',
    SPECIAL_ASSISTANCE = 'SPECIAL_ASSISTANCE',
    DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
    OTHER = 'OTHER'
}

// Interface pour les documents téléchargés
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
    verifiedBy?: string; // ID de l'agent
}

// Interface pour l'usager Gabonais
export interface GabonaisCitizen {
    id: string;
    citizenType: CitizenType.GABONAIS;

    // Identification
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    birthPlace: string; // Région gabonaise
    gender: 'M' | 'F' | 'O';

    // Documents d'identification
    cniNumber: string;
    cniExpireDate: Date;
    passportNumber?: string;
    passportExpireDate?: Date;

    // État civil
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    profession: string;

    // Adresses
    currentAddress: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    addressInGabon?: {
        street: string;
        city: string;
        region: string;
        postalCode: string;
    };

    // Contact
    phone: string;
    email: string;
    preferredLanguage: 'FR' | 'EN';
    preferredContact: 'EMAIL' | 'SMS' | 'PHONE';

    // Consulat
    assignedConsulate: string; // ID du consulat de compétence
    consulateFile?: string; // Numéro dossier au consulat

    // Inscription
    registrationStatus: RegistrationStatus.APPROVED; // Toujours approuvé
    registrationDate: Date;
    approvalDate: Date;

    // Droits d'accès
    accessLevel: 'FULL'; // Accès complet

    // Documents
    uploadedDocuments: DocumentFile[];

    // Métadonnées
    createdAt: Date;
    updatedAt: Date;
    verifiedAt: Date;
}

// Interface pour l'usager Étranger
export interface ForeignerUser {
    id: string;
    citizenType: CitizenType.ETRANGER;

    // Identification
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    birthPlace: string; // Pays d'origine
    gender: 'M' | 'F' | 'O';
    nationality: string; // Pays de nationalité

    // Documents d'identification
    documentType: 'PASSPORT' | 'RESIDENCE_CARD' | 'WORK_PERMIT' | 'ID_CARD';
    documentNumber: string;
    documentIssuingCountry: string;
    documentExpireDate: Date;

    // Statut et situation
    statusInCountry: ForeignerStatus;
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    profession: string;
    employer?: string;

    // Motif de la demande
    requestReason: RequestReason;
    requestDescription?: string;

    // Adresse actuelle
    currentAddress: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };

    // Contact
    phone: string;
    email: string;
    preferredLanguage: 'FR' | 'EN';

    // Consulat
    assignedConsulate: string; // ID du consulat de compétence
    consultantFileNumber?: string; // Généré après approbation

    // Inscription
    registrationStatus: RegistrationStatus; // PENDING_APPROVAL, APPROVED, etc.
    registrationDate: Date;
    approvalDate?: Date;
    rejectionReason?: string;
    approvedBy?: string; // ID de l'agent qui a approuvé

    // Droits d'accès
    accessLevel: 'LIMITED'; // Accès limité aux services demandés

    // Documents
    uploadedDocuments: DocumentFile[];

    // Métadonnées
    createdAt: Date;
    updatedAt: Date;
    approvalDeadline?: Date;
}

// Union type pour les usagers
export type Citizen = GabonaisCitizen | ForeignerUser;
