/**
 * AI Assistant Tool Definitions for Gemini Function Calling
 * Each tool maps to a Convex query/mutation
 */
import {
  PUBLIC_ROUTES,
  MY_SPACE_ROUTES,
  ADMIN_ROUTES,
} from "./routes_manifest";

// Tool names that require user confirmation before execution
export const MUTATIVE_TOOLS = [
  "updateProfile",
  "createRequest",
  "cancelRequest",
  "markNotificationRead",
  "markAllNotificationsRead",
  "sendMail",
  "markMailRead",
  "createAssociation",
  "createCompany",
  "respondToAssociationInvite",
] as const;

// Tool names that are UI actions (handled by frontend)
export const UI_TOOLS = ["navigateTo", "fillForm"] as const;

// Gemini FunctionDeclaration format
export const tools = [
  // ============ READ TOOLS (no confirmation) ============
  {
    name: "getProfile",
    description:
      "Récupère le profil consulaire complet de l'utilisateur connecté, incluant identité, passeport, adresses, famille et documents.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getServices",
    description:
      "Liste les services consulaires disponibles. Peut filtrer par catégorie.",
    parameters: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          description:
            "Catégorie de service: identity, travel, civil_status, legalization, social, registration",
        },
      },
    },
  },
  {
    name: "getRequests",
    description:
      "Liste les demandes de services de l'utilisateur connecté avec leur statut actuel.",
    parameters: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          description:
            "Filtrer par statut: draft, submitted, processing, completed, rejected, cancelled",
        },
      },
    },
  },
  {
    name: "getAppointments",
    description:
      "Liste les rendez-vous planifiés de l'utilisateur avec le consulat.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getNotifications",
    description:
      "Liste les notifications récentes de l'utilisateur (messages, mises à jour de statut, actions requises).",
    parameters: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description:
            "Nombre maximum de notifications à retourner (défaut: 10)",
        },
      },
    },
  },
  {
    name: "getUnreadNotificationCount",
    description:
      "Retourne le nombre de notifications non lues de l'utilisateur.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getUserContext",
    description:
      "Récupère le contexte complet de l'utilisateur: profil, carte consulaire, demande active, et compteur de notifications. Utilise cet outil pour avoir une vue d'ensemble de la situation de l'utilisateur.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getServicesByCountry",
    description:
      "Liste les services disponibles pour un pays de résidence spécifique. Utilise le pays de résidence de l'utilisateur par défaut.",
    parameters: {
      type: "object" as const,
      properties: {
        country: {
          type: "string",
          description:
            "Code pays ISO (ex: FR, GA, BE). Si non fourni, utilise le pays de résidence de l'utilisateur.",
        },
        category: {
          type: "string",
          description:
            "Catégorie de service: identity, travel, civil_status, legalization, social, registration",
        },
      },
    },
  },
  {
    name: "getOrganizationInfo",
    description:
      "Récupère les informations d'un consulat ou ambassade: adresse, horaires, contact.",
    parameters: {
      type: "object" as const,
      properties: {
        orgId: {
          type: "string",
          description:
            "Identifiant de l'organisation. Si non fourni, retourne l'organisation correspondant au pays de résidence de l'utilisateur.",
        },
      },
    },
  },
  {
    name: "getLatestNews",
    description: "Récupère les dernières actualités et annonces du consulat.",
    parameters: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Nombre d'actualités à retourner (défaut: 5)",
        },
      },
    },
  },
  {
    name: "getMyAssociations",
    description: "Liste les associations dont l'utilisateur est membre.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getMyConsularCard",
    description:
      "Récupère les informations de la carte consulaire de l'utilisateur: numéro, date d'émission, date d'expiration.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getRequestDetails",
    description:
      "Récupère les détails complets d'une demande spécifique: statut, documents, historique, prochaines étapes.",
    parameters: {
      type: "object" as const,
      properties: {
        requestId: {
          type: "string",
          description: "Identifiant de la demande",
        },
      },
      required: ["requestId"],
    },
  },

  // ============ iBOÎTE (MESSAGERIE INTERNE) ============
  {
    name: "getMyMailboxes",
    description:
      "Liste toutes les boîtes mail de l'utilisateur (profil personnel, organisations, associations, entreprises) avec le nombre de messages non lus pour chacune.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getMailInbox",
    description:
      "Liste les messages d'une boîte mail spécifique. Peut filtrer par dossier (inbox, sent, trash, starred).",
    parameters: {
      type: "object" as const,
      properties: {
        ownerId: {
          type: "string",
          description:
            "Identifiant du propriétaire de la boîte (profil, organisation, association ou entreprise). Si omis, utilise le profil de l'utilisateur.",
        },
        ownerType: {
          type: "string",
          description:
            "Type du propriétaire: profile, organization, association, company. Requis si ownerId est fourni.",
        },
        folder: {
          type: "string",
          description:
            "Dossier à consulter: inbox (défaut), sent, trash, starred",
        },
      },
    },
  },
  {
    name: "getMailMessage",
    description:
      "Récupère le contenu complet d'un message spécifique dans iBoîte.",
    parameters: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Identifiant du message",
        },
      },
      required: ["id"],
    },
  },

  // ============ ENTREPRISES ============
  {
    name: "getMyCompanies",
    description: "Liste les entreprises dont l'utilisateur est membre.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "getCompanyDetails",
    description:
      "Récupère les détails complets d'une entreprise: informations, membres, secteur d'activité.",
    parameters: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Identifiant de l'entreprise",
        },
      },
      required: ["id"],
    },
  },

  // ============ ASSOCIATIONS (renforcé) ============
  {
    name: "getAssociationDetails",
    description:
      "Récupère les détails complets d'une association: informations, membres, type.",
    parameters: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Identifiant de l'association",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "getAssociationInvites",
    description:
      "Liste les invitations d'associations en attente pour l'utilisateur.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },

  // ============ UI TOOLS (handled by frontend) ============
  {
    name: "navigateTo",
    description:
      "Navigue l'utilisateur vers une page de l'application. Routes disponibles:\n" +
      "PUBLIQUES: " +
      Object.keys(PUBLIC_ROUTES).join(", ") +
      "\n" +
      "ESPACE PERSONNEL: " +
      Object.keys(MY_SPACE_ROUTES).join(", ") +
      "\n" +
      "ADMIN: " +
      Object.keys(ADMIN_ROUTES).join(", ") +
      "\n" +
      "Remplace $slug, $requestId, etc. par les vraies valeurs. xId correspond typiqument à l'id de la ressource en base de données, souvent disponible dans les données retournées par les autres outils.",
    parameters: {
      type: "object" as const,
      properties: {
        route: {
          type: "string",
          description: "La route vers laquelle naviguer",
        },
        reason: {
          type: "string",
          description: "Explication de pourquoi naviguer vers cette page",
        },
      },
      required: ["route"],
    },
  },
  {
    name: "fillForm",
    description:
      "Pré-remplit un formulaire avec les données fournies. Utilise pour aider l'utilisateur à compléter son profil ou une demande.",
    parameters: {
      type: "object" as const,
      properties: {
        formId: {
          type: "string",
          description:
            "Identifiant du formulaire: profile, profile.identity, profile.addresses, profile.family, profile.contacts, request",
        },
        fields: {
          type: "object",
          description:
            "Données à pré-remplir. Pour profile.identity: firstName, lastName, birthDate (YYYY-MM-DD), birthPlace, birthCountry, gender (male/female), nationality. Pour profile.addresses.residence: street, city, postalCode, country. Pour profile.contacts: phone, email.",
        },
        navigateFirst: {
          type: "boolean",
          description:
            "Si true, navigue d'abord vers la page du formulaire avant de le pré-remplir.",
        },
      },
      required: ["formId", "fields"],
    },
  },

  // ============ MUTATIVE TOOLS (require confirmation) ============
  {
    name: "createRequest",
    description:
      "Crée une nouvelle demande de service consulaire pour l'utilisateur. Nécessite l'identifiant du service et optionnellement des données de formulaire.",
    parameters: {
      type: "object" as const,
      properties: {
        serviceSlug: {
          type: "string",
          description:
            "Slug du service (ex: passport-renewal, consular-card-registration)",
        },
        submitNow: {
          type: "boolean",
          description:
            "Si true, soumet directement la demande. Sinon crée un brouillon.",
        },
      },
      required: ["serviceSlug"],
    },
  },
  {
    name: "cancelRequest",
    description:
      "Annule une demande existante de l'utilisateur. Fonctionne uniquement pour les demandes en brouillon ou soumises.",
    parameters: {
      type: "object" as const,
      properties: {
        requestId: {
          type: "string",
          description: "Identifiant de la demande à annuler",
        },
      },
      required: ["requestId"],
    },
  },
  {
    name: "markNotificationRead",
    description: "Marque une notification comme lue.",
    parameters: {
      type: "object" as const,
      properties: {
        notificationId: {
          type: "string",
          description: "Identifiant de la notification à marquer comme lue",
        },
      },
      required: ["notificationId"],
    },
  },
  {
    name: "markAllNotificationsRead",
    description: "Marque toutes les notifications de l'utilisateur comme lues.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },

  // ============ iBOÎTE MUTATIONS ============
  {
    name: "sendMail",
    description:
      "Envoie un message interne via iBoîte à un destinataire (profil, organisation, association ou entreprise). Nécessite confirmation.",
    parameters: {
      type: "object" as const,
      properties: {
        recipientOwnerId: {
          type: "string",
          description: "Identifiant du destinataire",
        },
        recipientOwnerType: {
          type: "string",
          description:
            "Type du destinataire: profile, organization, association, company",
        },
        subject: {
          type: "string",
          description: "Objet du message",
        },
        body: {
          type: "string",
          description: "Contenu du message",
        },
        senderOwnerId: {
          type: "string",
          description:
            "Identifiant de l'expéditeur (si différent du profil personnel). Optionnel.",
        },
        senderOwnerType: {
          type: "string",
          description:
            "Type de l'expéditeur: profile, organization, association, company. Optionnel.",
        },
      },
      required: ["recipientOwnerId", "recipientOwnerType", "subject", "body"],
    },
  },
  {
    name: "markMailRead",
    description: "Marque un message iBoîte comme lu.",
    parameters: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Identifiant du message à marquer comme lu",
        },
      },
      required: ["id"],
    },
  },

  // ============ ASSOCIATIONS MUTATIONS ============
  {
    name: "createAssociation",
    description:
      "Crée une nouvelle association. L'utilisateur en devient le président. Nécessite confirmation.",
    parameters: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Nom de l'association",
        },
        associationType: {
          type: "string",
          description:
            "Type: cultural, sports, religious, professional, solidarity, education, youth, women, student, other",
        },
        description: {
          type: "string",
          description: "Description de l'association",
        },
        email: {
          type: "string",
          description: "Email de contact",
        },
        phone: {
          type: "string",
          description: "Numéro de téléphone",
        },
      },
      required: ["name", "associationType"],
    },
  },
  {
    name: "respondToAssociationInvite",
    description:
      "Accepte ou refuse une invitation à rejoindre une association. Nécessite confirmation.",
    parameters: {
      type: "object" as const,
      properties: {
        associationId: {
          type: "string",
          description: "Identifiant de l'association",
        },
        accept: {
          type: "boolean",
          description: "true pour accepter, false pour refuser",
        },
      },
      required: ["associationId", "accept"],
    },
  },

  // ============ ENTREPRISES MUTATIONS ============
  {
    name: "createCompany",
    description:
      "Crée une nouvelle entreprise. L'utilisateur en devient le CEO. Nécessite confirmation.",
    parameters: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Nom commercial de l'entreprise",
        },
        legalName: {
          type: "string",
          description: "Raison sociale (nom légal)",
        },
        companyType: {
          type: "string",
          description:
            "Type: sarl, sa, sas, sasu, eurl, auto_entrepreneur, sci, snc, cooperative, association_loi_1901, other",
        },
        activitySector: {
          type: "string",
          description:
            "Secteur: technology, finance, health, education, agriculture, commerce, construction, transport, tourism, media, energy, mining, fishing, forestry, manufacturing, services, real_estate, legal, consulting, ngo, other",
        },
        description: {
          type: "string",
          description: "Description de l'entreprise",
        },
        email: {
          type: "string",
          description: "Email de contact",
        },
        phone: {
          type: "string",
          description: "Numéro de téléphone",
        },
      },
      required: ["name", "companyType", "activitySector"],
    },
  },
];

// Type for tool execution results
export type ToolResult = {
  name: string;
  success: boolean;
  data?: unknown;
  error?: string;
};

// Type for actions sent to frontend
export type AIAction = {
  type: string;
  args: Record<string, unknown>;
  requiresConfirmation: boolean;
  reason?: string;
};
