/**
 * ═══════════════════════════════════════════════════════════════
 * MODULE CODES — Single source of truth for application features
 * ═══════════════════════════════════════════════════════════════
 *
 * Modules represent application features/functionalities.
 * They control WHAT areas of the app a user or org can access.
 * (Tasks control WHAT ACTIONS a user can perform within those areas.)
 *
 * Modules are defined in code — adding a module requires code changes.
 * They are NOT customizable via the database.
 *
 * Usage:
 *   - org.modules: ModuleCodeValue[] — features activated for this org (superadmin)
 *   - position.modules: ModuleCodeValue[] — features this position can access
 */

import { v } from "convex/values";
import type { LocalizedString } from "./validators";

// ═══════════════════════════════════════════════════════════════
// MODULE CODE ENUM
// ═══════════════════════════════════════════════════════════════

export const ModuleCode = {
  // Core — always present
  requests: "requests",
  documents: "documents",
  appointments: "appointments",
  profiles: "profiles",

  // Consular services
  consular_registrations: "consular_registrations",
  consular_notifications: "consular_notifications",
  consular_cards: "consular_cards",
  civil_status: "civil_status",
  passports: "passports",
  visas: "visas",

  // Community
  associations: "associations",
  companies: "companies",
  community_events: "community_events",

  // Finance
  finance: "finance",
  payments: "payments",

  // Communication
  communication: "communication",
  digital_mail: "digital_mail",
  meetings: "meetings",

  // Admin
  team: "team",
  settings: "settings",
  analytics: "analytics",
  statistics: "statistics",

  // Special
  intelligence: "intelligence",
  cv: "cv",
} as const;

export type ModuleCodeValue = (typeof ModuleCode)[keyof typeof ModuleCode];

/** All module codes as a flat array */
export const ALL_MODULE_CODES: ModuleCodeValue[] = Object.values(ModuleCode);

// ═══════════════════════════════════════════════════════════════
// MODULE CATEGORIES
// ═══════════════════════════════════════════════════════════════

export type ModuleCategory = "core" | "consular" | "community" | "finance" | "communication" | "admin" | "special";

// ═══════════════════════════════════════════════════════════════
// CONVEX VALIDATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Convex validator for module codes.
 * Use in schema definitions: `modules: v.array(moduleCodeValidator)`
 */
export const moduleCodeValidator = v.union(
  // Core
  v.literal(ModuleCode.requests),
  v.literal(ModuleCode.documents),
  v.literal(ModuleCode.appointments),
  v.literal(ModuleCode.profiles),
  // Consular
  v.literal(ModuleCode.consular_registrations),
  v.literal(ModuleCode.consular_notifications),
  v.literal(ModuleCode.consular_cards),
  v.literal(ModuleCode.civil_status),
  v.literal(ModuleCode.passports),
  v.literal(ModuleCode.visas),
  // Community
  v.literal(ModuleCode.associations),
  v.literal(ModuleCode.companies),
  v.literal(ModuleCode.community_events),
  // Finance
  v.literal(ModuleCode.finance),
  v.literal(ModuleCode.payments),
  // Communication
  v.literal(ModuleCode.communication),
  v.literal(ModuleCode.digital_mail),
  v.literal(ModuleCode.meetings),
  // Admin
  v.literal(ModuleCode.team),
  v.literal(ModuleCode.settings),
  v.literal(ModuleCode.analytics),
  v.literal(ModuleCode.statistics),
  // Special
  v.literal(ModuleCode.intelligence),
  v.literal(ModuleCode.cv),
);

// ═══════════════════════════════════════════════════════════════
// MODULE REGISTRY — Metadata for each module
// ═══════════════════════════════════════════════════════════════

export interface ModuleDefinition {
  code: ModuleCodeValue;
  label: LocalizedString;
  description: LocalizedString;
  icon: string;      // Lucide icon name
  color: string;     // Tailwind color class
  category: ModuleCategory;
  isCore: boolean;   // Core modules cannot be disabled
}

export const MODULE_REGISTRY: Record<ModuleCodeValue, ModuleDefinition> = {
  // ─── Core ─────────────────────────────────────────────────
  [ModuleCode.requests]: {
    code: ModuleCode.requests,
    label: { fr: "Demandes", en: "Requests" },
    description: { fr: "Gestion des demandes consulaires", en: "Consular request management" },
    icon: "FileEdit",
    color: "text-emerald-500",
    category: "core",
    isCore: true,
  },
  [ModuleCode.documents]: {
    code: ModuleCode.documents,
    label: { fr: "Documents", en: "Documents" },
    description: { fr: "Gestion et vérification des documents", en: "Document management and verification" },
    icon: "FileText",
    color: "text-blue-500",
    category: "core",
    isCore: true,
  },
  [ModuleCode.appointments]: {
    code: ModuleCode.appointments,
    label: { fr: "Rendez-vous", en: "Appointments" },
    description: { fr: "Planification des rendez-vous", en: "Appointment scheduling" },
    icon: "CalendarDays",
    color: "text-violet-500",
    category: "core",
    isCore: true,
  },
  [ModuleCode.profiles]: {
    code: ModuleCode.profiles,
    label: { fr: "Profils", en: "Profiles" },
    description: { fr: "Gestion des profils citoyens", en: "Citizen profile management" },
    icon: "User",
    color: "text-sky-500",
    category: "core",
    isCore: true,
  },

  // ─── Consular ─────────────────────────────────────────────
  [ModuleCode.consular_registrations]: {
    code: ModuleCode.consular_registrations,
    label: { fr: "Inscriptions consulaires", en: "Consular registrations" },
    description: { fr: "Inscription au registre des Français", en: "French citizen registration" },
    icon: "ClipboardList",
    color: "text-indigo-500",
    category: "consular",
    isCore: false,
  },
  [ModuleCode.consular_notifications]: {
    code: ModuleCode.consular_notifications,
    label: { fr: "Notifications consulaires", en: "Consular notifications" },
    description: { fr: "Notifications de passage consulaire", en: "Consular passage notifications" },
    icon: "Bell",
    color: "text-amber-500",
    category: "consular",
    isCore: false,
  },
  [ModuleCode.consular_cards]: {
    code: ModuleCode.consular_cards,
    label: { fr: "Cartes consulaires", en: "Consular cards" },
    description: { fr: "Gestion des cartes consulaires", en: "Consular card management" },
    icon: "CreditCard",
    color: "text-teal-500",
    category: "consular",
    isCore: false,
  },
  [ModuleCode.civil_status]: {
    code: ModuleCode.civil_status,
    label: { fr: "État civil", en: "Civil status" },
    description: { fr: "Actes d'état civil", en: "Civil status records" },
    icon: "ScrollText",
    color: "text-purple-500",
    category: "consular",
    isCore: false,
  },
  [ModuleCode.passports]: {
    code: ModuleCode.passports,
    label: { fr: "Passeports", en: "Passports" },
    description: { fr: "Demandes de passeport et biométrie", en: "Passport applications and biometrics" },
    icon: "BookOpen",
    color: "text-indigo-500",
    category: "consular",
    isCore: false,
  },
  [ModuleCode.visas]: {
    code: ModuleCode.visas,
    label: { fr: "Visas", en: "Visas" },
    description: { fr: "Instruction et délivrance des visas", en: "Visa processing and issuance" },
    icon: "Stamp",
    color: "text-orange-500",
    category: "consular",
    isCore: false,
  },

  // ─── Community ────────────────────────────────────────────
  [ModuleCode.associations]: {
    code: ModuleCode.associations,
    label: { fr: "Associations", en: "Associations" },
    description: { fr: "Gestion des associations de la diaspora", en: "Diaspora association management" },
    icon: "Users",
    color: "text-green-500",
    category: "community",
    isCore: false,
  },
  [ModuleCode.companies]: {
    code: ModuleCode.companies,
    label: { fr: "Entreprises", en: "Companies" },
    description: { fr: "Répertoire des entreprises", en: "Company directory" },
    icon: "Building2",
    color: "text-slate-500",
    category: "community",
    isCore: false,
  },
  [ModuleCode.community_events]: {
    code: ModuleCode.community_events,
    label: { fr: "Événements", en: "Events" },
    description: { fr: "Événements communautaires", en: "Community events" },
    icon: "Calendar",
    color: "text-pink-500",
    category: "community",
    isCore: false,
  },

  // ─── Finance ──────────────────────────────────────────────
  [ModuleCode.finance]: {
    code: ModuleCode.finance,
    label: { fr: "Finances", en: "Finance" },
    description: { fr: "Gestion financière consulaire", en: "Consular financial management" },
    icon: "Wallet",
    color: "text-yellow-600",
    category: "finance",
    isCore: false,
  },
  [ModuleCode.payments]: {
    code: ModuleCode.payments,
    label: { fr: "Paiements", en: "Payments" },
    description: { fr: "Traitement des paiements", en: "Payment processing" },
    icon: "CreditCard",
    color: "text-green-600",
    category: "finance",
    isCore: false,
  },

  // ─── Communication ────────────────────────────────────────
  [ModuleCode.communication]: {
    code: ModuleCode.communication,
    label: { fr: "Communication", en: "Communication" },
    description: { fr: "Publications et notifications", en: "Publications and notifications" },
    icon: "Megaphone",
    color: "text-sky-500",
    category: "communication",
    isCore: false,
  },
  [ModuleCode.digital_mail]: {
    code: ModuleCode.digital_mail,
    label: { fr: "Courrier numérique", en: "Digital mail" },
    description: { fr: "Envoi de courrier dématérialisé", en: "Digital mail delivery" },
    icon: "Mail",
    color: "text-blue-400",
    category: "communication",
    isCore: false,
  },
  [ModuleCode.meetings]: {
    code: ModuleCode.meetings,
    label: { fr: "Réunions & Appels", en: "Meetings & Calls" },
    description: { fr: "Appels audio/vidéo et réunions en ligne", en: "Audio/video calls and online meetings" },
    icon: "Video",
    color: "text-rose-500",
    category: "communication",
    isCore: false,
  },

  // ─── Admin ────────────────────────────────────────────────
  [ModuleCode.team]: {
    code: ModuleCode.team,
    label: { fr: "Équipe", en: "Team" },
    description: { fr: "Gestion de l'équipe", en: "Team management" },
    icon: "Users",
    color: "text-blue-500",
    category: "admin",
    isCore: true,
  },
  [ModuleCode.settings]: {
    code: ModuleCode.settings,
    label: { fr: "Paramètres", en: "Settings" },
    description: { fr: "Configuration de l'organisme", en: "Organization settings" },
    icon: "Settings",
    color: "text-zinc-500",
    category: "admin",
    isCore: true,
  },
  [ModuleCode.analytics]: {
    code: ModuleCode.analytics,
    label: { fr: "Analyses", en: "Analytics" },
    description: { fr: "Tableaux de bord et rapports", en: "Dashboards and reports" },
    icon: "BarChart3",
    color: "text-cyan-500",
    category: "admin",
    isCore: false,
  },
  [ModuleCode.statistics]: {
    code: ModuleCode.statistics,
    label: { fr: "Statistiques", en: "Statistics" },
    description: { fr: "Statistiques détaillées", en: "Detailed statistics" },
    icon: "LineChart",
    color: "text-emerald-600",
    category: "admin",
    isCore: false,
  },

  // ─── Special ──────────────────────────────────────────────
  [ModuleCode.intelligence]: {
    code: ModuleCode.intelligence,
    label: { fr: "Renseignement", en: "Intelligence" },
    description: { fr: "Notes de renseignement", en: "Intelligence notes" },
    icon: "ShieldAlert",
    color: "text-red-500",
    category: "special",
    isCore: false,
  },
  [ModuleCode.cv]: {
    code: ModuleCode.cv,
    label: { fr: "CV", en: "CV" },
    description: { fr: "Gestion des CV", en: "CV management" },
    icon: "FileUser",
    color: "text-indigo-400",
    category: "special",
    isCore: false,
  },
};

// ═══════════════════════════════════════════════════════════════
// DERIVED CONSTANTS
// ═══════════════════════════════════════════════════════════════

/** Core modules — always activated, cannot be disabled */
export const CORE_MODULE_CODES: ModuleCodeValue[] = Object.values(MODULE_REGISTRY)
  .filter((m) => m.isCore)
  .map((m) => m.code);

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Get module definition by code */
export function getModuleDefinition(code: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[code as ModuleCodeValue];
}

/** Get all modules in a category */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.category === category);
}

/** Get all core modules (cannot be disabled) */
export function getCoreModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.isCore);
}

