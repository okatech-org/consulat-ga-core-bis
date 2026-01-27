/**
 * AI Assistant Tool Definitions for Gemini Function Calling
 * Each tool maps to a Convex query/mutation
 */

// Tool names that require user confirmation before execution
export const MUTATIVE_TOOLS = [
  "updateProfile",
  "createRequest",
  "cancelRequest",
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

  // ============ UI TOOLS (handled by frontend) ============
  {
    name: "navigateTo",
    description:
      "Navigue vers une page de l'application. Utilise pour guider l'utilisateur.",
    parameters: {
      type: "object" as const,
      properties: {
        route: {
          type: "string",
          description:
            "Route: /my-space, /my-space/profile, /my-space/requests, /my-space/documents, /services, /services/[slug], /news",
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
          description: "Slug du service (ex: passeport-renouvellement, carte-consulaire)",
        },
        submitNow: {
          type: "boolean",
          description: "Si true, soumet directement la demande. Sinon crée un brouillon.",
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
