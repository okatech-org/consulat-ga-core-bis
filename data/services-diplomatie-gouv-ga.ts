/**
 * Services data extracted from https://diplomatie.gouv.ga
 * Menu: "Services aux usagers"
 *
 * These are informational services from the Gabonese Ministry of Foreign Affairs
 * that can be imported into Convex.
 */

import type { ServiceCategory } from "../convex/lib/constants";

// Type for localized strings
type LocalizedString = { fr: string; en?: string };

export interface ServiceData {
  slug: string;
  code: string;
  name: LocalizedString;
  description: LocalizedString;
  content?: LocalizedString;
  category: ServiceCategory;
  icon?: string;
  estimatedDays: number;
  requiresAppointment: boolean;
  requiresPickupAppointment: boolean;
  isActive: boolean;
  sourceUrl: string;
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
    estimatedDays: 30,
    requiresAppointment: true,
    requiresPickupAppointment: true,
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
    estimatedDays: 30,
    requiresAppointment: true,
    requiresPickupAppointment: true,
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
    estimatedDays: 15,
    requiresAppointment: true,
    requiresPickupAppointment: true,
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
    estimatedDays: 15,
    requiresAppointment: true,
    requiresPickupAppointment: true,
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
    estimatedDays: 1,
    requiresAppointment: true,
    requiresPickupAppointment: true,
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
    estimatedDays: 30,
    requiresAppointment: true,
    requiresPickupAppointment: true,
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
    estimatedDays: 45,
    requiresAppointment: true,
    requiresPickupAppointment: false,
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
    estimatedDays: 45,
    requiresAppointment: true,
    requiresPickupAppointment: false,
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
    estimatedDays: 30,
    requiresAppointment: false,
    requiresPickupAppointment: false,
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
    estimatedDays: 90,
    requiresAppointment: true,
    requiresPickupAppointment: false,
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
    estimatedDays: 15,
    requiresAppointment: false,
    requiresPickupAppointment: false,
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
    estimatedDays: 30,
    requiresAppointment: false,
    requiresPickupAppointment: false,
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
    content: {
      fr: "<p>Document téléchargeable : <a href='https://diplomatie.gouv.ga/object.getObject.do?id=1681'>Télécharger la liste</a></p>",
      en: "<p>Downloadable document: <a href='https://diplomatie.gouv.ga/object.getObject.do?id=1681'>Download the list</a></p>",
    },
    category: "visa" as ServiceCategory,
    icon: "globe",
    estimatedDays: 0,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/pays-exempts-de-visa",
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
    content: {
      fr: `<h3>Consulat Général de France</h3>
<p>Représente également : Allemagne, Autriche, Belgique, Estonie, Grèce, Hongrie, Lituanie, Luxembourg, Pays-Bas, République Tchèque</p>

<h3>Ambassade d'Espagne</h3>
<p>Représente également : Portugal, Suède</p>

<h3>Ambassade d'Italie</h3>
<p>Italie uniquement</p>

<p><a href="https://diplomatie.gouv.ga/object.getObject.do?id=551">Télécharger les informations complètes</a></p>`,
    },
    category: "visa" as ServiceCategory,
    icon: "plane",
    estimatedDays: 0,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/visa-schengen",
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
    content: {
      fr: `<h3>Qu'est-ce que la légalisation ?</h3>
<p>La légalisation certifie l'origine des documents. Elle authentifie la signature, la capacité du signataire, l'identité du timbre ou le cachet sur le document.</p>

<h3>Procédure</h3>
<ol>
  <li>Légalisation par le Ministère des Affaires Étrangères</li>
  <li>Puis légalisation par l'Ambassade ou le Consulat étranger au Gabon</li>
</ol>

<h3>Documents NON légalisables</h3>
<ul>
  <li>Photographies</li>
  <li>Passeports</li>
  <li>Cartes d'identité</li>
  <li>Titres de séjour</li>
  <li>Documents délivrés par une organisation internationale</li>
</ul>

<h3>Horaires</h3>
<p>Lundi à Vendredi, 7h30 à 15h30</p>

<h3>Délais</h3>
<p>48h pour plus de 15 pièces, immédiat pour moins de 15 pièces</p>

<h3>Contact</h3>
<p>Direction Générale des Affaires Consulaires<br>
Ministère des Affaires Étrangères<br>
Boulevard Triomphal Omar BONGO<br>
BP : 2245, Libreville<br>
Tél : (241) 01-74-23-70</p>`,
    },
    category: "certification" as ServiceCategory,
    icon: "stamp",
    estimatedDays: 2,
    requiresAppointment: false,
    requiresPickupAppointment: true,
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/legalisation-",
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
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: true,
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
    content: {
      fr: `<h3>Situations couvertes</h3>
<ul>
  <li>Assistance en cas de décès</li>
  <li>Assistance en cas de maladie ou d'accident grave</li>
  <li>Assistance en cas d'arrestation ou de détention</li>
  <li>Aide aux victimes de violence</li>
  <li>Aide et rapatriement en cas de difficulté</li>
</ul>

<h3>Ce que l'Ambassade/Consulat PEUT faire</h3>
<ul>
  <li>Donner des conseils</li>
  <li>Aider en cas de perte de passeport</li>
  <li>Aider à contacter vos proches si vous êtes détenu</li>
  <li>Aider en cas de crises (guerre, catastrophes naturelles)</li>
</ul>

<h3>Ce que l'Ambassade/Consulat NE PEUT PAS faire</h3>
<ul>
  <li>Payer vos frais (médicaux, hôtel, voyage)</li>
  <li>Intervenir dans le système judiciaire local</li>
  <li>Agir comme garant ou sponsor</li>
  <li>Choisir ou imposer un avocat</li>
  <li>Payer les frais de justice</li>
</ul>

<p><strong>Note importante :</strong> Les représentants consulaires ne peuvent pas intervenir en faveur de Gabonais bipatrides dans le pays de leur autre nationalité.</p>`,
    },
    category: "assistance" as ServiceCategory,
    icon: "life-buoy",
    estimatedDays: 1,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/assistance-et-protection",
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
    content: {
      fr: `<h3>Services proposés</h3>
<ul>
  <li>Collecte d'informations sur les circonstances du décès</li>
  <li>Transmission des informations à la famille au Gabon</li>
  <li>Aide aux proches pour contacter la famille</li>
  <li>Assistance pour l'établissement de l'acte de décès</li>
  <li>Délivrance du laissez-passer mortuaire pour rapatriement</li>
  <li>Délivrance d'attestation consulaire pour urne funéraire</li>
  <li>Inventaire et rapatriement des effets personnels</li>
</ul>

<p><strong>Note :</strong> Les frais de rapatriement sont à la charge de la famille.</p>`,
    },
    category: "assistance" as ServiceCategory,
    icon: "heart-handshake",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl: "https://diplomatie.gouv.ga/assistance-et-protection",
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
    content: {
      fr: "<p>Document téléchargeable : <a href='https://diplomatie.gouv.ga/object.getObject.do?id=1685'>Télécharger la liste</a></p>",
    },
    category: "other" as ServiceCategory,
    icon: "users",
    estimatedDays: 0,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl:
      "https://diplomatie.gouv.ga/liste-protocolaire-des-ambassadeurs-et-charges-daffaires-accredites-en-republique-gabonaise",
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
    estimatedDays: 0,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl:
      "https://diplomatie.gouv.ga/carte-diplomatique-de-la-republique-gabonaise",
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
    estimatedDays: 0,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    isActive: true,
    sourceUrl:
      "https://diplomatie.gouv.ga/annuaire-et-situation-geographique-du-corps-diplomatque-",
  },
];

// Export as plain objects for Convex seeding
export const servicesForConvex = servicesFromDiplomatie.map((service) => ({
  slug: service.slug,
  code: service.code,
  name: service.name,
  description: service.description,
  content: service.content,
  category: service.category,
  icon: service.icon,
  estimatedDays: service.estimatedDays,
  requiresAppointment: service.requiresAppointment,
  requiresPickupAppointment: service.requiresPickupAppointment,
  isActive: service.isActive,
}));
