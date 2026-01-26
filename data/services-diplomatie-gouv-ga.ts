/**
 * Services data extracted from https://diplomatie.gouv.ga
 * Menu: "Services aux usagers"
 * 
 * These are informational services from the Gabonese Ministry of Foreign Affairs
 * that can be imported into Convex.
 */

import type { ServiceCategory } from "../convex/lib/constants";

export interface ServiceData {
  slug: string;
  code: string;
  name: { fr: string; en?: string };
  description: { fr: string; en?: string };
  category: ServiceCategory;
  icon?: string;
  defaults: {
    estimatedDays: number;
    requiresAppointment: boolean;
    requiredDocuments: Array<{ type: string; label: string; required: boolean }>;
  };
  isActive: boolean;
  sourceUrl: string;
  content?: { fr: string; en?: string };
}

export const servicesFromDiplomatie: ServiceData[] = [
  // ============================================================================
  // PASSEPORTS
  // ============================================================================
  {
    slug: "passeport-ordinaire-premiere-demande",
    code: "PASSPORT_FIRST_REQUEST",
    name: {
      fr: "Passeport Ordinaire - Première Demande",
      en: "Ordinary Passport - First Request",
    },
    description: {
      fr: "Demande de premier passeport ordinaire pour les ressortissants gabonais au Gabon ou à l'étranger.",
      en: "First ordinary passport application for Gabonese citizens in Gabon or abroad.",
    },
    category: "passport" as ServiceCategory,
    icon: "passport",
    defaults: {
      estimatedDays: 30,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "form", label: "Formulaire de demande de passeport", required: true },
        { type: "photo", label: "Trois photos d'identité couleurs récentes", required: true },
        { type: "birth_certificate", label: "Copie acte de naissance légalisée", required: true },
        { type: "scholarship", label: "Copie Attestation de bourse (étudiants boursiers)", required: false },
        { type: "parental_authorization", label: "Prise en charge légalisée des parents (étudiants non boursiers)", required: false },
        { type: "mission_order", label: "Copie Ordre de mission (missions à l'étranger)", required: false },
        { type: "leave_decision", label: "Copie décision de congé ou autorisation d'absence", required: false },
        { type: "medical_evacuation", label: "Copie décision d'évacuation sanitaire", required: false },
        { type: "medical_certificate", label: "Copie attestation du médecin traitant local (visites médicales)", required: false },
        { type: "guardian_authorization", label: "Autorisation légalisée du tuteur juridique + pièce d'identité (mineurs)", required: false },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/passeports",
  },
  {
    slug: "passeport-renouvellement",
    code: "PASSPORT_RENEWAL",
    name: {
      fr: "Renouvellement de Passeport",
      en: "Passport Renewal",
    },
    description: {
      fr: "Renouvellement de passeport pour les ressortissants gabonais dont le passeport a expiré ou dont la validité est inférieure à trois mois.",
      en: "Passport renewal for Gabonese citizens whose passport has expired or has less than three months validity.",
    },
    category: "passport" as ServiceCategory,
    icon: "passport",
    defaults: {
      estimatedDays: 30,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "form", label: "Formulaire de demande de passeport", required: true },
        { type: "photo", label: "Trois photos d'identité couleurs récentes", required: true },
        { type: "birth_certificate", label: "Copie acte de naissance légalisée", required: true },
        { type: "old_passport", label: "Présentation de l'ancien passeport", required: true },
        { type: "passport_copy", label: "Photocopie des trois premières pages de l'ancien passeport (si visas en cours)", required: false },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/passeports",
  },
  {
    slug: "passeport-diplomatique",
    code: "PASSPORT_DIPLOMATIC",
    name: {
      fr: "Passeport Diplomatique",
      en: "Diplomatic Passport",
    },
    description: {
      fr: "Passeport diplomatique délivré par le Ministère des Affaires Étrangères pour les missions officielles.",
      en: "Diplomatic passport issued by the Ministry of Foreign Affairs for official missions.",
    },
    category: "passport" as ServiceCategory,
    icon: "shield",
    defaults: {
      estimatedDays: 15,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "form", label: "Formulaire de demande de passeport", required: true },
        { type: "birth_certificate", label: "Copie acte de naissance légalisée", required: true },
        { type: "nomination", label: "Copie Attestation de nomination", required: true },
        { type: "mission_order", label: "Copie Ordre de mission", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/passeports",
  },
  {
    slug: "passeport-service",
    code: "PASSPORT_SERVICE",
    name: {
      fr: "Passeport de Service",
      en: "Service Passport",
    },
    description: {
      fr: "Passeport de service délivré par le Ministère des Affaires Étrangères pour les agents de l'État en mission.",
      en: "Service passport issued by the Ministry of Foreign Affairs for government agents on mission.",
    },
    category: "passport" as ServiceCategory,
    icon: "briefcase",
    defaults: {
      estimatedDays: 15,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "form", label: "Formulaire de demande de passeport", required: true },
        { type: "birth_certificate", label: "Copie acte de naissance légalisée", required: true },
        { type: "nomination", label: "Copie Attestation de nomination", required: true },
        { type: "mission_order", label: "Copie Ordre de mission", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/passeports",
  },
  {
    slug: "attestation-tenant-lieu-passeport",
    code: "EMERGENCY_TRAVEL_DOC",
    name: {
      fr: "Attestation Tenant Lieu de Passeport",
      en: "Emergency Travel Document",
    },
    description: {
      fr: "Document d'urgence délivré aux Gabonais dépourvus de titre de voyage (perte, vol) pour permettre le retour au Gabon. Valable pour un seul voyage.",
      en: "Emergency document issued to Gabonese citizens without travel documents (loss, theft) to return to Gabon. Valid for a single journey.",
    },
    category: "travel_document" as ServiceCategory,
    icon: "alert-triangle",
    defaults: {
      estimatedDays: 1,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "form", label: "Demande de passeport en triple exemplaires", required: true },
        { type: "photo", label: "Quatre photos d'identité récentes", required: true },
        { type: "identity_proof", label: "Pièces justificatives de l'identité et nationalité gabonaise", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/passeports",
  },
  {
    slug: "passeport-mineur",
    code: "PASSPORT_MINOR",
    name: {
      fr: "Passeport pour Mineur",
      en: "Minor's Passport",
    },
    description: {
      fr: "Passeport individuel pour enfant ou inscription dans le passeport parental (moins de 15 ans). L'OACI recommande un passeport individuel pour chaque enfant.",
      en: "Individual passport for child or inscription in parent's passport (under 15 years). ICAO recommends individual passports for all children.",
    },
    category: "passport" as ServiceCategory,
    icon: "baby",
    defaults: {
      estimatedDays: 30,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "birth_certificate", label: "Photocopie légalisée de l'acte de naissance", required: true },
        { type: "parental_authorization", label: "Autorisation parentale légalisée du père", required: true },
        { type: "housing_certificate", label: "Certificat d'hébergement", required: true },
        { type: "ticket", label: "Photocopie du billet d'avion Aller et Retour", required: false },
        { type: "photo", label: "Trois photos d'identité couleur", required: true },
        { type: "form", label: "Formulaire de demande de passeport", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/passeports",
  },

  // ============================================================================
  // ÉTAT-CIVIL
  // ============================================================================
  {
    slug: "mariage-consulaire-gabonais",
    code: "MARRIAGE_CONSULAR_GABONESE",
    name: {
      fr: "Mariage Consulaire entre Gabonais",
      en: "Consular Marriage between Gabonese Citizens",
    },
    description: {
      fr: "Célébration de mariage par l'Ambassadeur ou le Consul du Gabon pour deux ressortissants gabonais dans les pays où c'est autorisé.",
      en: "Marriage celebration by the Ambassador or Consul of Gabon for two Gabonese citizens in authorized countries.",
    },
    category: "civil_status" as ServiceCategory,
    icon: "heart",
    defaults: {
      estimatedDays: 45,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "banns_publication", label: "Publication des bans (6 semaines avant)", required: true },
        { type: "birth_certificate", label: "Actes de naissance des deux époux", required: true },
        { type: "identity", label: "Pièces d'identité des deux époux", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/etatcivil",
  },
  {
    slug: "mariage-mixte",
    code: "MARRIAGE_MIXED",
    name: {
      fr: "Mariage entre Gabonais et Étranger",
      en: "Marriage between Gabonese and Foreign Citizen",
    },
    description: {
      fr: "Mariage d'un ressortissant gabonais avec un étranger, célébré devant les autorités locales. Nécessite publication des bans et certificat de capacité à mariage.",
      en: "Marriage of a Gabonese citizen with a foreigner, celebrated before local authorities. Requires banns publication and marriage capacity certificate.",
    },
    category: "civil_status" as ServiceCategory,
    icon: "heart",
    defaults: {
      estimatedDays: 45,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "banns_publication", label: "Publication des bans", required: true },
        { type: "capacity_certificate", label: "Certificat de capacité à mariage", required: true },
        { type: "nationality_proof", label: "Preuve de nationalité gabonaise", required: true },
        { type: "birth_certificate", label: "Actes de naissance des deux époux", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/etatcivil",
  },
  {
    slug: "transcription-mariage",
    code: "MARRIAGE_TRANSCRIPTION",
    name: {
      fr: "Transcription de Mariage",
      en: "Marriage Transcription",
    },
    description: {
      fr: "Transcription d'un acte de mariage étranger sur les registres de l'état civil consulaire gabonais. Permet d'obtenir un livret de famille gabonais.",
      en: "Transcription of a foreign marriage certificate onto the Gabonese consular civil registry. Allows obtaining a Gabonese family book.",
    },
    category: "transcript" as ServiceCategory,
    icon: "file-text",
    defaults: {
      estimatedDays: 30,
      requiresAppointment: false,
      requiredDocuments: [
        { type: "marriage_certificate", label: "Copie de l'acte de mariage étranger légalisé", required: true },
        { type: "nationality_proof", label: "Preuve de nationalité gabonaise", required: true },
        { type: "birth_certificate", label: "Actes de naissance des deux époux", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/etatcivil",
  },
  {
    slug: "divorce-reconnaissance",
    code: "DIVORCE_RECOGNITION",
    name: {
      fr: "Reconnaissance de Divorce Étranger",
      en: "Foreign Divorce Recognition",
    },
    description: {
      fr: "Reconnaissance d'un divorce prononcé à l'étranger au Gabon. Nécessite une procédure d'exequatur devant un juge gabonais.",
      en: "Recognition of a divorce pronounced abroad in Gabon. Requires an exequatur procedure before a Gabonese judge.",
    },
    category: "civil_status" as ServiceCategory,
    icon: "file-minus",
    defaults: {
      estimatedDays: 90,
      requiresAppointment: true,
      requiredDocuments: [
        { type: "divorce_decree", label: "Acte de divorce étranger légalisé", required: true },
        { type: "finality_certificate", label: "Attestation de caractère définitif du jugement", required: true },
        { type: "marriage_certificate", label: "Acte de mariage original", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/etatcivil",
  },
  {
    slug: "declaration-deces",
    code: "DEATH_DECLARATION",
    name: {
      fr: "Déclaration de Décès à l'Étranger",
      en: "Death Declaration Abroad",
    },
    description: {
      fr: "Déclaration et transcription d'un décès survenu à l'étranger. Assistance pour le rapatriement de la dépouille mortelle.",
      en: "Declaration and transcription of a death occurring abroad. Assistance for repatriation of mortal remains.",
    },
    category: "civil_status" as ServiceCategory,
    icon: "heart-off",
    defaults: {
      estimatedDays: 15,
      requiresAppointment: false,
      requiredDocuments: [
        { type: "death_certificate", label: "Acte de décès étranger légalisé", required: true },
        { type: "identity_deceased", label: "Pièce d'identité du défunt", required: true },
        { type: "family_book", label: "Livret de famille gabonais", required: false },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/etatcivil",
  },
  {
    slug: "transcription-acte-etranger",
    code: "CIVIL_STATUS_TRANSCRIPTION",
    name: {
      fr: "Transcription d'Actes d'État Civil",
      en: "Civil Status Document Transcription",
    },
    description: {
      fr: "Transcription dans les registres consulaires gabonais des actes établis à l'étranger (naissance, mariage, décès).",
      en: "Transcription into Gabonese consular registers of documents established abroad (birth, marriage, death).",
    },
    category: "transcript" as ServiceCategory,
    icon: "file-plus",
    defaults: {
      estimatedDays: 30,
      requiresAppointment: false,
      requiredDocuments: [
        { type: "original_document", label: "Acte original étranger légalisé", required: true },
        { type: "nationality_proof", label: "Preuve de nationalité gabonaise", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/etatcivil",
  },

  // ============================================================================
  // VISA
  // ============================================================================
  {
    slug: "pays-exempts-visa",
    code: "VISA_EXEMPT_COUNTRIES",
    name: {
      fr: "Pays Exempts de Visa avec le Gabon",
      en: "Visa-Exempt Countries with Gabon",
    },
    description: {
      fr: "Liste des pays dont les ressortissants sont exemptés de visa pour entrer au Gabon et vice versa.",
      en: "List of countries whose nationals are exempt from visa to enter Gabon and vice versa.",
    },
    category: "visa" as ServiceCategory,
    icon: "globe",
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/pays-exempts-de-visa",
    content: {
      fr: "Document téléchargeable : https://diplomatie.gouv.ga/object.getObject.do?id=1681",
      en: "Downloadable document: https://diplomatie.gouv.ga/object.getObject.do?id=1681",
    },
  },
  {
    slug: "visa-schengen-info",
    code: "VISA_SCHENGEN_INFO",
    name: {
      fr: "Information Visa Schengen",
      en: "Schengen Visa Information",
    },
    description: {
      fr: "Information sur les démarches pour obtenir un visa Schengen depuis le Gabon. Indique les ambassades compétentes par pays de destination.",
      en: "Information on procedures to obtain a Schengen visa from Gabon. Indicates competent embassies by destination country.",
    },
    category: "visa" as ServiceCategory,
    icon: "plane",
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/visa-schengen",
    content: {
      fr: `**Consulat Général de France** (représente également : Allemagne, Autriche, Belgique, Estonie, Grèce, Hongrie, Lituanie, Luxembourg, Pays-Bas, République Tchèque)

**Ambassade d'Espagne** (représente également : Portugal, Suède)

**Ambassade d'Italie** (Italie uniquement)

Document téléchargeable : https://diplomatie.gouv.ga/object.getObject.do?id=551`,
    },
  },

  // ============================================================================
  // LÉGALISATION
  // ============================================================================
  {
    slug: "legalisation-documents",
    code: "DOC_LEGALIZATION",
    name: {
      fr: "Légalisation de Documents",
      en: "Document Legalization",
    },
    description: {
      fr: "Légalisation de documents d'origine gabonaise destinés à être utilisés dans un pays étranger. Authentification de signatures et cachets officiels.",
      en: "Legalization of Gabonese-origin documents for use in a foreign country. Authentication of official signatures and stamps.",
    },
    category: "certification" as ServiceCategory,
    icon: "stamp",
    defaults: {
      estimatedDays: 2,
      requiresAppointment: false,
      requiredDocuments: [
        { type: "original", label: "Documents originaux avec cachet officiel et signature", required: true },
        { type: "french_text", label: "Documents rédigés en français", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/legalisation-",
    content: {
      fr: `**Qu'est-ce que la légalisation ?**
La légalisation certifie l'origine des documents. Elle authentifie la signature, la capacité du signataire, l'identité du timbre ou le cachet sur le document.

**Procédure :**
1. Légalisation par le Ministère des Affaires Étrangères
2. Puis légalisation par l'Ambassade ou le Consulat étranger au Gabon

**Documents NON légalisables :**
- Photographies
- Passeports
- Cartes d'identité
- Titres de séjour
- Documents délivrés par une organisation internationale

**Horaires :** Lundi à Vendredi, 7h30 à 15h30
**Délai :** 48h pour plus de 15 pièces, immédiat pour moins de 15 pièces

**Contact :**
Direction Générale des Affaires Consulaires
Ministère des Affaires Étrangères
Boulevard Triomphal Omar BONGO
BP : 2245, Libreville
Tél : (241) 01-74-23-70`,
    },
  },
  {
    slug: "traduction-documents",
    code: "DOC_TRANSLATION",
    name: {
      fr: "Traduction de Documents",
      en: "Document Translation",
    },
    description: {
      fr: "Traduction officielle de documents établis en langue étrangère par le Ministère des Affaires Étrangères.",
      en: "Official translation of documents in foreign languages by the Ministry of Foreign Affairs.",
    },
    category: "certification" as ServiceCategory,
    icon: "languages",
    defaults: {
      estimatedDays: 7,
      requiresAppointment: false,
      requiredDocuments: [
        { type: "original", label: "Document original en langue étrangère", required: true },
      ],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/legalisation-",
  },

  // ============================================================================
  // ASSISTANCE ET PROTECTION
  // ============================================================================
  {
    slug: "assistance-consulaire",
    code: "CONSULAR_ASSISTANCE",
    name: {
      fr: "Assistance et Protection Consulaire",
      en: "Consular Assistance and Protection",
    },
    description: {
      fr: "Protection diplomatique et assistance consulaire pour les ressortissants gabonais en difficulté à l'étranger (décès, maladie, arrestation, rapatriement...).",
      en: "Diplomatic protection and consular assistance for Gabonese citizens in difficulty abroad (death, illness, arrest, repatriation...).",
    },
    category: "assistance" as ServiceCategory,
    icon: "life-buoy",
    defaults: {
      estimatedDays: 1,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/assistance-et-protection",
    content: {
      fr: `**Situations couvertes :**
- Assistance en cas de décès
- Assistance en cas de maladie ou d'accident grave
- Assistance en cas d'arrestation ou de détention
- Aide aux victimes de violence
- Aide et rapatriement en cas de difficulté

**Ce que l'Ambassade/Consulat PEUT faire :**
- Donner des conseils
- Aider en cas de perte de passeport
- Aider à contacter vos proches si vous êtes détenu
- Aider en cas de crises (guerre, catastrophes naturelles)

**Ce que l'Ambassade/Consulat NE PEUT PAS faire :**
- Payer vos frais (médicaux, hôtel, voyage)
- Intervenir dans le système judiciaire local
- Agir comme garant ou sponsor
- Choisir ou imposer un avocat
- Payer les frais de justice

**Note importante :** Les représentants consulaires ne peuvent pas intervenir en faveur de Gabonais bipatrides dans le pays de leur autre nationalité.`,
    },
  },
  {
    slug: "assistance-deces-etranger",
    code: "DEATH_ASSISTANCE",
    name: {
      fr: "Assistance en Cas de Décès à l'Étranger",
      en: "Death Assistance Abroad",
    },
    description: {
      fr: "Accompagnement des familles lors du décès d'un proche à l'étranger : démarches administratives, établissement d'acte de décès, rapatriement de la dépouille.",
      en: "Family support when a relative dies abroad: administrative procedures, death certificate, repatriation of remains.",
    },
    category: "assistance" as ServiceCategory,
    icon: "heart-handshake",
    defaults: {
      estimatedDays: 7,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/assistance-et-protection",
    content: {
      fr: `**Services proposés :**
- Collecte d'informations sur les circonstances du décès
- Transmission des informations à la famille au Gabon
- Aide aux proches pour contacter la famille
- Assistance pour l'établissement de l'acte de décès
- Délivrance du laissez-passer mortuaire pour rapatriement
- Délivrance d'attestation consulaire pour urne funéraire
- Inventaire et rapatriement des effets personnels

**Note :** Les frais de rapatriement sont à la charge de la famille.`,
    },
  },

  // ============================================================================
  // INFORMATIONS PROTOCOLAIRES
  // ============================================================================
  {
    slug: "liste-ambassadeurs-gabon",
    code: "AMBASSADORS_LIST",
    name: {
      fr: "Liste Protocolaire des Ambassadeurs",
      en: "Protocol List of Ambassadors",
    },
    description: {
      fr: "Liste officielle des Ambassadeurs et Chargés d'Affaires accrédités en République Gabonaise.",
      en: "Official list of Ambassadors and Chargés d'Affaires accredited to the Gabonese Republic.",
    },
    category: "other" as ServiceCategory,
    icon: "users",
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/liste-protocolaire-des-ambassadeurs-et-charges-daffaires-accredites-en-republique-gabonaise",
    content: {
      fr: "Document téléchargeable : https://diplomatie.gouv.ga/object.getObject.do?id=1685",
    },
  },
  {
    slug: "carte-diplomatique-gabon",
    code: "DIPLOMATIC_MAP",
    name: {
      fr: "Carte Diplomatique du Gabon",
      en: "Diplomatic Map of Gabon",
    },
    description: {
      fr: "Annuaire des ambassades et consulats du Gabon dans le monde avec leurs coordonnées complètes.",
      en: "Directory of Gabonese embassies and consulates worldwide with full contact details.",
    },
    category: "other" as ServiceCategory,
    icon: "map",
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/carte-diplomatique-de-la-republique-gabonaise",
  },
  {
    slug: "annuaire-corps-diplomatique",
    code: "DIPLOMATIC_DIRECTORY",
    name: {
      fr: "Annuaire du Corps Diplomatique au Gabon",
      en: "Diplomatic Corps Directory in Gabon",
    },
    description: {
      fr: "Annuaire et situation géographique des ambassades et représentations diplomatiques étrangères au Gabon.",
      en: "Directory and geographic location of foreign embassies and diplomatic representations in Gabon.",
    },
    category: "other" as ServiceCategory,
    icon: "building",
    defaults: {
      estimatedDays: 0,
      requiresAppointment: false,
      requiredDocuments: [],
    },
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/annuaire-et-situation-geographique-du-corps-diplomatque-",
  },
];

// Export as plain objects for Convex seeding (without TypeScript types)
export const servicesForConvex = servicesFromDiplomatie.map(service => ({
  slug: service.slug,
  code: service.code,
  name: service.name,
  description: service.description,
  category: service.category,
  icon: service.icon,
  defaults: service.defaults,
  isActive: service.isActive,
}));
