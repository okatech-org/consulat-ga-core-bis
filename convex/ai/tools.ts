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

  // ============ MUTATIVE TOOLS (require confirmation) ============
  // Phase 2: These will be added later
  // {
  //   name: "createRequest",
  //   description: "Crée une nouvelle demande de service consulaire",
  //   parameters: {...}
  // },
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
