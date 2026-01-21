import { 
  CountryCode, 
  ServiceCategory, 
  DocumentType,
  OrganizationType
} from "../convex/lib/constants";

// Organization
export const consulateFrance = {
  slug: "consulat-general-paris",
  name: "Consulat Général du Gabon en France",
  type: OrganizationType.GeneralConsulate,
  country: CountryCode.FR,
  timezone: "Europe/Paris",
  address: {
    street: "26 bis Avenue Raphaël",
    city: "Paris",
    postalCode: "75016", // schema says postalCode, not zipCode
    country: CountryCode.FR
  },
  email: "contact@consulat.ga", 
  phone: "+33142996868", 
  website: "https://www.consulatgabonfrance.com",
  description: "Représentation consulaire de la République Gabonaise en France.",
  logoUrl: "https://gabonaisdefrance.org/wp-content/uploads/2023/10/cropped-Logo-CGF-1.png",
  isActive: true,
};

// Services
export const services = [
  {
    slug: "passport-renewal",
    code: "PASSPORT_RENEWAL",
    name: { fr: "Renouvellement de Passeport", en: "Passport Renewal" },
    description: { 
      fr: "Les compatriotes gabonais présents sur le territoire français peuvent renouveler leur passeport. Cette démarche est du ressort de l'Antenne extérieure de la DGDI.",
      en: "Gabonese citizens in France can renew their passport. This process is handled by the DGDI external office."
    },
    category: ServiceCategory.Identity,
    icon: "BookUser",
    isActive: true,
    defaults: {
      estimatedDays: 30,
      requiresAppointment: true,
      requiredDocuments: [
        { type: DocumentType.Other, label: "Formulaire de demande (PDF)", required: true },
        { type: DocumentType.Passport, label: "Ancien Passeport", required: true },
        { type: DocumentType.Photo, label: "Photos d'identité", required: true }
      ]
    }
  },
  {
    slug: "consular-card",
    code: "CONSULAR_CARD",
    name: { fr: "Carte Consulaire", en: "Consular Card" },
    description: {
      fr: "L'immatriculation consulaire est obligatoire pour tout Gabonais résidant en France. Elle permet de bénéficier de la protection consulaire.",
      en: "Consular registration is mandatory for all Gabonese residing in France. It provides consular protection."
    },
    category: ServiceCategory.Registration,
    icon: "IdCard",
    isActive: true,
    defaults: {
      estimatedDays: 7,
      requiresAppointment: false,
      requiredDocuments: [
        { type: DocumentType.Passport, label: "Passeport", required: true },
        { type: DocumentType.ProofOfAddress, label: "Justificatif de domicile", required: true },
        { type: DocumentType.Photo, label: "Photo d'identité", required: true }
      ]
    }
  },
  {
    slug: "mariage",
    code: "MARRIAGE",
    name: { fr: "Mariage", en: "Marriage" },
    description: {
      fr: "Célébration de mariage entre deux ressortissants gabonais au Consulat.",
      en: "Marriage celebration between two Gabonese nationals at the Consulate."
    },
    category: ServiceCategory.CivilStatus,
    icon: "HeartHandshake",
    isActive: true,
    defaults: {
      estimatedDays: 20,
      requiresAppointment: true,
      requiredDocuments: [
        { type: DocumentType.Other, label: "Demande manuscrite", required: true },
        { type: DocumentType.Other, label: "Formulaire de demande de mariage (PDF)", required: true }, // http://www.consulat-france.ga/object.getObject.do?id=385
        { type: DocumentType.BirthCertificate, label: "Acte de naissance", required: true },
        { type: DocumentType.Other, label: "Certificat de célibat", required: true },
        { type: DocumentType.Other, label: "Certificat médical", required: true }
      ]
    }
  },
  {
    slug: "pacs",
    code: "PACS",
    name: { fr: "Pacte Civil de Solidarité (PACS)", en: "Civil Solidarity Pact" },
    description: {
      fr: "Le PACS est reconnu en France mais pas par la loi gabonaise. Informations sur service-public.fr.",
      en: "PACS is recognized in France but not by Gabonese law. Information on service-public.fr."
    },
    category: ServiceCategory.CivilStatus,
    icon: "HeartHandshake",
    isActive: true,
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: []
    }
  },
  {
    slug: "divorce",
    code: "DIVORCE",
    name: { fr: "Divorce", en: "Divorce" },
    description: {
      fr: "Procédures de divorce pour les résidents en France (Voir service-public.fr).",
      en: "Divorce procedures for residents in France (See service-public.fr)."
    },
    category: ServiceCategory.CivilStatus,
    icon: "HeartCrack",
    isActive: true,
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: []
    }
  },
  {
    slug: "transcription-naissance",
    code: "BIRTH_TRANSCRIPTION",
    name: { fr: "Transcription d'Acte de Naissance", en: "Birth Certificate Transcription" },
    description: {
      fr: "Transcription de l'acte de naissance d'un enfant né en France dans les registres gabonais.",
      en: "Transcription of birth certificate for a child born in France into Gabonese registers."
    },
    category: ServiceCategory.CivilStatus,
    icon: "FileText",
    isActive: true,
    defaults: {
      estimatedDays: 7,
      requiresAppointment: false,
      requiredDocuments: [
         { type: DocumentType.BirthCertificate, label: "Acte de naissance (Mairie française)", required: true },
         { type: DocumentType.IdentityCard, label: "Pièces d'identité des parents", required: true },
         { type: DocumentType.Other, label: "Formulaire de demande (PDF)", required: true }
      ]
    }
  },
   {
    slug: "certificat-patronymique",
    code: "PATRONYMIC_CERTIFICATE",
    name: { fr: "Certificat Patronymique", en: "Patronymic Certificate" },
    description: {
      fr: "Document permettant d'attribuer un patronyme choisi à l'enfant à naître (selon art. 93-94 Code Civil).",
      en: "Document allowing assignment of a chosen surname to the unborn child."
    },
    category: ServiceCategory.CivilStatus,
    icon: "FileSignature",
    isActive: true,
    defaults: {
      estimatedDays: 1,
      requiresAppointment: false,
      requiredDocuments: [
        { type: DocumentType.IdentityCard, label: "Pièces d'identité des parents", required: true }
      ]
    }
  },
  {
    slug: "tenant-lieu-passeport",
    code: "EMERGENCY_PASSPORT",
    name: { fr: "Tenant Lieu de Passeport", en: "Emergency Passport" },
    description: {
      fr: "Document de voyage provisoire pour les ressortissants ne disposant pas de passeport valide.",
      en: "Temporary travel document for nationals without a valid passport."
    },
    category: ServiceCategory.Identity,
    icon: "FileWarning",
    isActive: true,
    defaults: {
      estimatedDays: 1,
      requiresAppointment: true,
      requiredDocuments: [
        { type: DocumentType.BirthCertificate, label: "Acte de naissance", required: true },
        { type: DocumentType.Photo, label: "2 Photos d'identité", required: true },
        { type: DocumentType.ResidencePermit, label: "Titre de séjour", required: true }
      ]
    }
  },
    {
    slug: "visa",
    code: "VISA",
    name: { fr: "Visa", en: "Visa" },
    description: {
      fr: "Demande de visa pour voyager au Gabon.",
      en: "Visa application for travel to Gabon."
    },
    category: ServiceCategory.Visa,
    icon: "Stamp",
    isActive: true,
    defaults: {
      estimatedDays: 7,
      requiresAppointment: true,
      requiredDocuments: [
         { type: DocumentType.Other, label: "Formulaire Visa", required: true },
         { type: DocumentType.Passport, label: "Passeport", required: true }
      ]
    }
  }
];
