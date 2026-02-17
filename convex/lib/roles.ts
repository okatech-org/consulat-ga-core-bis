/**
 * ═══════════════════════════════════════════════════════════════
 * ROLE MODULE SYSTEM
 * ═══════════════════════════════════════════════════════════════
 *
 * Architecture:
 *   TaskCode (atomic permission — defined in taskCodes.ts)
 *     └─ RoleModule (group of tasks)
 *         └─ Position (job title with multiple role modules)
 *             └─ OrganizationTemplate (preset positions per org type)
 *
 * CONVENTIONS:
 *   - All user-facing text uses i18n keys (roles.modules.<code>.label, etc.)
 *   - Icons use Lucide React icon names (string), rendered on frontend
 *   - Task codes are typed via TaskCodeValue import
 */

import { OrganizationType } from "./constants";
import { TaskCode, type TaskCodeValue } from "./taskCodes";
import type { LocalizedString } from "./validators";

// ═══════════════════════════════════════════════════════════════
// ROLE MODULES — Groups of tasks
// ═══════════════════════════════════════════════════════════════

export interface TaskPresetDefinition {
  code: string;
  /** i18n key: roles.modules.<code>.label */
  label: LocalizedString;
  /** i18n key: roles.modules.<code>.description */
  description: LocalizedString;
  /** Lucide icon name (e.g. "Crown", "FileText") */
  icon: string;
  /** Tailwind color class */
  color: string;
  tasks: TaskCodeValue[];
}

export const POSITION_TASK_PRESETS: TaskPresetDefinition[] = [
  {
    code: "direction",
    label: { fr: "Direction", en: "Leadership" },
    description: { fr: "Supervision générale du poste diplomatique", en: "General oversight of the diplomatic post" },
    icon: "Crown",
    color: "text-amber-500",
    tasks: [
      TaskCode.requests.view, TaskCode.requests.validate, TaskCode.requests.assign,
      TaskCode.documents.view, TaskCode.documents.validate, TaskCode.documents.generate,
      TaskCode.appointments.view, TaskCode.profiles.view, TaskCode.profiles.manage,
      TaskCode.finance.view, TaskCode.finance.manage,
      TaskCode.team.view, TaskCode.team.manage, TaskCode.team.assign_roles,
      TaskCode.settings.view, TaskCode.settings.manage,
      TaskCode.analytics.view, TaskCode.analytics.export,
      TaskCode.communication.publish, TaskCode.communication.notify,
      TaskCode.org.view, TaskCode.statistics.view,
      TaskCode.schedules.view, TaskCode.schedules.manage,
    ],
  },
  {
    code: "management",
    label: { fr: "Encadrement", en: "Management" },
    description: { fr: "Gestion des opérations courantes et supervision des agents", en: "Daily operations management and agent supervision" },
    icon: "ClipboardList",
    color: "text-blue-500",
    tasks: [
      TaskCode.requests.view, TaskCode.requests.validate, TaskCode.requests.assign, TaskCode.requests.complete,
      TaskCode.documents.view, TaskCode.documents.validate,
      TaskCode.appointments.view, TaskCode.appointments.manage,
      TaskCode.profiles.view, TaskCode.team.view, TaskCode.team.manage,
      TaskCode.analytics.view, TaskCode.communication.publish,
      TaskCode.org.view, TaskCode.statistics.view,
      TaskCode.schedules.view, TaskCode.schedules.manage,
    ],
  },
  {
    code: "request_processing",
    label: { fr: "Traitement des demandes", en: "Request processing" },
    description: { fr: "Instruction et traitement des demandes courantes", en: "Processing and handling of standard requests" },
    icon: "FileEdit",
    color: "text-emerald-500",
    tasks: [
      TaskCode.requests.view, TaskCode.requests.create, TaskCode.requests.process, TaskCode.requests.complete,
      TaskCode.documents.view, TaskCode.documents.validate,
      TaskCode.appointments.view, TaskCode.appointments.manage,
      TaskCode.profiles.view,
      TaskCode.org.view,
      TaskCode.schedules.view,
    ],
  },
  {
    code: "validation",
    label: { fr: "Validation", en: "Validation" },
    description: { fr: "Vérification et validation des documents et demandes", en: "Verification and validation of documents and requests" },
    icon: "CheckCircle",
    color: "text-green-600",
    tasks: [
      TaskCode.requests.view, TaskCode.requests.validate,
      TaskCode.documents.view, TaskCode.documents.validate, TaskCode.documents.generate,
      TaskCode.profiles.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "civil_status",
    label: { fr: "État civil", en: "Civil status" },
    description: { fr: "Gestion des actes d'état civil", en: "Civil status records management" },
    icon: "ScrollText",
    color: "text-purple-500",
    tasks: [
      TaskCode.civil_status.transcribe, TaskCode.civil_status.register, TaskCode.civil_status.certify,
      TaskCode.requests.view, TaskCode.requests.process,
      TaskCode.documents.view, TaskCode.documents.validate, TaskCode.documents.generate,
      TaskCode.profiles.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "passports",
    label: { fr: "Passeports", en: "Passports" },
    description: { fr: "Gestion des demandes de passeport et biométrie", en: "Passport applications and biometrics management" },
    icon: "BookOpen",
    color: "text-indigo-500",
    tasks: [
      TaskCode.passports.process, TaskCode.passports.biometric, TaskCode.passports.deliver,
      TaskCode.requests.view, TaskCode.requests.process,
      TaskCode.documents.view, TaskCode.documents.validate,
      TaskCode.profiles.view, TaskCode.appointments.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "visas",
    label: { fr: "Visas", en: "Visas" },
    description: { fr: "Instruction et délivrance des visas", en: "Visa processing and issuance" },
    icon: "Stamp",
    color: "text-orange-500",
    tasks: [
      TaskCode.visas.process, TaskCode.visas.approve, TaskCode.visas.stamp,
      TaskCode.requests.view, TaskCode.requests.process,
      TaskCode.documents.view, TaskCode.documents.validate,
      TaskCode.profiles.view, TaskCode.appointments.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "finance",
    label: { fr: "Finances", en: "Finance" },
    description: { fr: "Gestion financière et comptabilité consulaire", en: "Financial management and consular accounting" },
    icon: "Wallet",
    color: "text-yellow-600",
    tasks: [
      TaskCode.finance.view, TaskCode.finance.collect, TaskCode.finance.manage,
      TaskCode.analytics.view, TaskCode.analytics.export,
      TaskCode.org.view,
    ],
  },
  {
    code: "communication",
    label: { fr: "Communication", en: "Communication" },
    description: { fr: "Publications et notifications aux usagers", en: "Publications and user notifications" },
    icon: "Megaphone",
    color: "text-sky-500",
    tasks: [
      TaskCode.communication.publish, TaskCode.communication.notify,
      TaskCode.analytics.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "reception",
    label: { fr: "Accueil", en: "Reception" },
    description: { fr: "Accueil du public et prise de rendez-vous", en: "Public reception and appointment scheduling" },
    icon: "HandHelping",
    color: "text-teal-500",
    tasks: [
      TaskCode.requests.view, TaskCode.requests.create,
      TaskCode.appointments.view, TaskCode.appointments.manage,
      TaskCode.profiles.view,
      TaskCode.org.view,
      TaskCode.schedules.view,
    ],
  },
  {
    code: "consultation",
    label: { fr: "Consultation", en: "Read-only access" },
    description: { fr: "Accès en lecture seule aux données du poste", en: "Read-only access to post data" },
    icon: "Eye",
    color: "text-zinc-400",
    tasks: [
      TaskCode.requests.view, TaskCode.documents.view,
      TaskCode.appointments.view, TaskCode.profiles.view,
      TaskCode.analytics.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "intelligence",
    label: { fr: "Renseignement", en: "Intelligence" },
    description: { fr: "Gestion des notes de renseignement", en: "Intelligence notes management" },
    icon: "ShieldAlert",
    color: "text-red-500",
    tasks: [
      TaskCode.intelligence.view, TaskCode.intelligence.manage,
      TaskCode.profiles.view,
      TaskCode.org.view,
    ],
  },
  {
    code: "system_admin",
    label: { fr: "Administration système", en: "System administration" },
    description: { fr: "Configuration technique et gestion des accès", en: "Technical configuration and access management" },
    icon: "Settings",
    color: "text-zinc-500",
    tasks: [
      TaskCode.settings.view, TaskCode.settings.manage,
      TaskCode.team.view, TaskCode.team.manage, TaskCode.team.assign_roles,
      TaskCode.analytics.view, TaskCode.analytics.export,
      TaskCode.org.view, TaskCode.statistics.view,
      TaskCode.schedules.view, TaskCode.schedules.manage,
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// GRADE SYSTEM — Named hierarchy ranks
// ═══════════════════════════════════════════════════════════════

export const POSITION_GRADES = {
  chief: {
    code: "chief" as const,
    label: { fr: "Chef de poste", en: "Head of post" } as LocalizedString,
    shortLabel: { fr: "Chef", en: "Chief" } as LocalizedString,
    level: 1,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-300 dark:border-red-800",
    icon: "Medal",
  },
  counselor: {
    code: "counselor" as const,
    label: { fr: "Conseiller", en: "Counselor" } as LocalizedString,
    shortLabel: { fr: "Cons.", en: "Coun." } as LocalizedString,
    level: 2,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-300 dark:border-blue-800",
    icon: "Briefcase",
  },
  agent: {
    code: "agent" as const,
    label: { fr: "Agent", en: "Agent" } as LocalizedString,
    shortLabel: { fr: "Ag.", en: "Ag." } as LocalizedString,
    level: 3,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-300 dark:border-green-800",
    icon: "User",
  },
  external: {
    code: "external" as const,
    label: { fr: "Externe", en: "External" } as LocalizedString,
    shortLabel: { fr: "Ext.", en: "Ext." } as LocalizedString,
    level: 4,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    borderColor: "border-gray-300 dark:border-gray-800",
    icon: "Link",
  },
} as const;

export type PositionGrade = keyof typeof POSITION_GRADES;

// ═══════════════════════════════════════════════════════════════
// MINISTRY GROUP TEMPLATES
// ═══════════════════════════════════════════════════════════════

export interface MinistryGroupTemplate {
  code: string;
  label: LocalizedString;
  description?: LocalizedString;
  /** Lucide icon name */
  icon: string;
  sortOrder: number;
  parentCode?: string;
}

export const EMBASSY_MINISTRY_GROUPS: MinistryGroupTemplate[] = [
  { code: "presidence", label: { fr: "Présidence", en: "Presidency" }, description: { fr: "Cabinet de la Présidence", en: "Presidency Cabinet" }, icon: "Landmark", sortOrder: 1 },
  { code: "mae", label: { fr: "Affaires Étrangères", en: "Foreign Affairs" }, description: { fr: "Ministère des Affaires Étrangères", en: "Ministry of Foreign Affairs" }, icon: "Globe", sortOrder: 2 },
  { code: "finances", label: { fr: "Finances", en: "Finance" }, description: { fr: "Ministère des Finances", en: "Ministry of Finance" }, icon: "Wallet", sortOrder: 3 },
  { code: "tresor_public", label: { fr: "Trésor Public", en: "Public Treasury" }, description: { fr: "Direction du Trésor Public", en: "Public Treasury Department" }, icon: "Building2", sortOrder: 4, parentCode: "finances" },
  { code: "direction_budget", label: { fr: "Direction du Budget", en: "Budget Department" }, description: { fr: "Direction Générale du Budget", en: "General Budget Department" }, icon: "BarChart3", sortOrder: 5, parentCode: "finances" },
  { code: "defense", label: { fr: "Défense", en: "Defense" }, description: { fr: "Ministère de la Défense", en: "Ministry of Defense" }, icon: "Shield", sortOrder: 6 },
  { code: "interieur", label: { fr: "Intérieur", en: "Interior" }, description: { fr: "Ministère de l'Intérieur", en: "Ministry of the Interior" }, icon: "Lock", sortOrder: 7 },
];

export const CONSULATE_MINISTRY_GROUPS: MinistryGroupTemplate[] = [
  { code: "mae", label: { fr: "Affaires Étrangères", en: "Foreign Affairs" }, description: { fr: "Ministère des Affaires Étrangères", en: "Ministry of Foreign Affairs" }, icon: "Globe", sortOrder: 1 },
  { code: "finances", label: { fr: "Finances", en: "Finance" }, description: { fr: "Ministère des Finances", en: "Ministry of Finance" }, icon: "Wallet", sortOrder: 2 },
];

// ═══════════════════════════════════════════════════════════════
// POSITION TEMPLATES — Job titles with role modules
// ═══════════════════════════════════════════════════════════════

export interface PositionTemplate {
  code: string;
  title: LocalizedString;
  description: LocalizedString;
  level: number;
  grade?: PositionGrade;
  ministryCode?: string;
  taskPresets: string[];
  isRequired: boolean;
}

// ─── EMBASSY positions ──────────────────────────────────

export const EMBASSY_POSITIONS: PositionTemplate[] = [
  { code: "ambassador", title: { fr: "Ambassadeur", en: "Ambassador" }, description: { fr: "Chef de mission diplomatique", en: "Head of diplomatic mission" }, level: 1, grade: "chief", ministryCode: "presidence", taskPresets: ["direction", "intelligence"], isRequired: true },
  { code: "first_counselor", title: { fr: "Premier Conseiller", en: "First Counselor" }, description: { fr: "Adjoint du chef de mission", en: "Deputy head of mission" }, level: 2, grade: "counselor", ministryCode: "mae", taskPresets: ["management", "validation", "communication"], isRequired: true },
  { code: "economic_counselor", title: { fr: "Conseiller Économique", en: "Economic Counselor" }, description: { fr: "Chargé des affaires économiques", en: "In charge of economic affairs" }, level: 3, grade: "counselor", ministryCode: "mae", taskPresets: ["consultation", "communication"], isRequired: false },
  { code: "social_counselor", title: { fr: "Conseiller Social", en: "Social Counselor" }, description: { fr: "Chargé des affaires sociales", en: "In charge of social affairs" }, level: 3, grade: "counselor", ministryCode: "mae", taskPresets: ["request_processing", "validation"], isRequired: false },
  { code: "communication_counselor", title: { fr: "Conseiller Communication", en: "Communication Counselor" }, description: { fr: "Chargé de la communication", en: "In charge of communications" }, level: 3, grade: "counselor", ministryCode: "mae", taskPresets: ["communication", "consultation"], isRequired: false },
  { code: "first_secretary", title: { fr: "Premier Secrétaire", en: "First Secretary" }, description: { fr: "Secrétaire de chancellerie", en: "Chancellery secretary" }, level: 4, grade: "agent", ministryCode: "mae", taskPresets: ["request_processing", "communication"], isRequired: false },
  { code: "receptionist", title: { fr: "Réceptionniste", en: "Receptionist" }, description: { fr: "Accueil du public", en: "Public reception" }, level: 6, grade: "external", ministryCode: "mae", taskPresets: ["reception"], isRequired: false },
  { code: "chancellor", title: { fr: "Chancelier", en: "Chancellor" }, description: { fr: "Responsable administratif et financier", en: "Administrative and financial manager" }, level: 4, grade: "agent", ministryCode: "tresor_public", taskPresets: ["management", "finance", "system_admin"], isRequired: true },
  { code: "paymaster", title: { fr: "Payeur", en: "Paymaster" }, description: { fr: "Agent comptable et financier", en: "Accounting and financial agent" }, level: 5, grade: "agent", ministryCode: "direction_budget", taskPresets: ["finance"], isRequired: false },
  { code: "defense_attache", title: { fr: "Attaché de Défense", en: "Defense Attaché" }, description: { fr: "Représentant militaire", en: "Military representative" }, level: 3, grade: "counselor", ministryCode: "defense", taskPresets: ["intelligence", "consultation"], isRequired: false },
  { code: "security_attache", title: { fr: "Attaché de Sécurité", en: "Security Attaché" }, description: { fr: "Représentant de la sécurité intérieure", en: "Interior security representative" }, level: 3, grade: "counselor", ministryCode: "interieur", taskPresets: ["intelligence", "consultation"], isRequired: false },
];

// ─── CONSULATE positions ────────────────────────────────

export const CONSULATE_POSITIONS: PositionTemplate[] = [
  { code: "consul_general", title: { fr: "Consul Général", en: "Consul General" }, description: { fr: "Chef du poste consulaire", en: "Head of consular post" }, level: 1, taskPresets: ["direction", "validation"], isRequired: true },
  { code: "consul", title: { fr: "Consul", en: "Consul" }, description: { fr: "Consul adjoint", en: "Deputy consul" }, level: 2, taskPresets: ["management", "validation", "civil_status"], isRequired: false },
  { code: "vice_consul", title: { fr: "Vice-Consul", en: "Vice Consul" }, description: { fr: "Responsable des affaires consulaires", en: "Consular affairs manager" }, level: 3, taskPresets: ["validation", "request_processing", "civil_status"], isRequired: true },
  { code: "chancellor", title: { fr: "Chancelier", en: "Chancellor" }, description: { fr: "Responsable administratif et financier", en: "Administrative and financial manager" }, level: 3, taskPresets: ["management", "finance", "system_admin"], isRequired: true },
  { code: "head_of_chancellery", title: { fr: "Chef de Chancellerie", en: "Head of Chancellery" }, description: { fr: "Responsable des opérations de chancellerie", en: "Head of chancellery operations" }, level: 3, grade: "agent", taskPresets: ["management", "request_processing", "finance"], isRequired: false },
  { code: "consular_affairs_officer", title: { fr: "Agent des Affaires Consulaires", en: "Consular Affairs Officer" }, description: { fr: "Agent chargé des demandes consulaires", en: "Agent handling consular requests" }, level: 4, taskPresets: ["request_processing", "validation", "passports"], isRequired: false },
  { code: "civil_status_officer", title: { fr: "Officier d'État Civil", en: "Civil Status Officer" }, description: { fr: "Officier chargé de l'état civil", en: "Officer in charge of civil status" }, level: 4, taskPresets: ["civil_status", "request_processing"], isRequired: true },
  { code: "passport_officer", title: { fr: "Agent Passeports", en: "Passport Officer" }, description: { fr: "Agent chargé des passeports", en: "Agent handling passports" }, level: 4, taskPresets: ["passports", "request_processing"], isRequired: false },
  { code: "visa_officer", title: { fr: "Agent Visas", en: "Visa Officer" }, description: { fr: "Agent chargé des visas", en: "Agent handling visas" }, level: 4, taskPresets: ["visas", "request_processing"], isRequired: false },
  { code: "economic_counselor", title: { fr: "Conseiller Économique", en: "Economic Counselor" }, description: { fr: "Chargé des affaires économiques", en: "In charge of economic affairs" }, level: 3, grade: "counselor", taskPresets: ["consultation", "communication"], isRequired: false },
  { code: "communication_counselor", title: { fr: "Conseiller Communication", en: "Communication Counselor" }, description: { fr: "Chargé de la communication", en: "In charge of communications" }, level: 3, grade: "counselor", taskPresets: ["communication", "consultation"], isRequired: false },
  { code: "secretary", title: { fr: "Secrétaire", en: "Secretary" }, description: { fr: "Secrétaire administrative", en: "Administrative secretary" }, level: 5, grade: "agent", taskPresets: ["request_processing", "reception"], isRequired: false },
  { code: "consular_agent", title: { fr: "Agent Consulaire", en: "Consular Agent" }, description: { fr: "Agent polyvalent", en: "General consular agent" }, level: 5, taskPresets: ["request_processing"], isRequired: true },
  { code: "reception_agent", title: { fr: "Agent d'Accueil", en: "Reception Agent" }, description: { fr: "Agent d'accueil du public", en: "Public reception agent" }, level: 6, taskPresets: ["reception"], isRequired: false },
  { code: "intern", title: { fr: "Stagiaire", en: "Intern" }, description: { fr: "Stagiaire en observation", en: "Observation intern" }, level: 7, taskPresets: ["consultation"], isRequired: false },
];

// ─── HONORARY CONSULATE positions ───────────────────────

export const HONORARY_CONSULATE_POSITIONS: PositionTemplate[] = [
  { code: "honorary_consul", title: { fr: "Consul Honoraire", en: "Honorary Consul" }, description: { fr: "Représentant honoraire", en: "Honorary representative" }, level: 1, taskPresets: ["direction", "communication"], isRequired: true },
  { code: "assistant", title: { fr: "Assistant", en: "Assistant" }, description: { fr: "Assistant du consul honoraire", en: "Honorary consul assistant" }, level: 2, taskPresets: ["request_processing", "reception"], isRequired: false },
  { code: "agent", title: { fr: "Agent", en: "Agent" }, description: { fr: "Agent d'accueil", en: "Reception agent" }, level: 3, taskPresets: ["reception", "consultation"], isRequired: false },
];

// ─── HIGH COMMISSION positions ──────────────────────────

export const HIGH_COMMISSION_POSITIONS: PositionTemplate[] = [
  { code: "high_commissioner", title: { fr: "Haut-Commissaire", en: "High Commissioner" }, description: { fr: "Chef du Haut-Commissariat", en: "Head of High Commission" }, level: 1, taskPresets: ["direction", "intelligence"], isRequired: true },
  { code: "deputy_high_commissioner", title: { fr: "Haut-Commissaire Adjoint", en: "Deputy High Commissioner" }, description: { fr: "Adjoint du Haut-Commissaire", en: "Deputy to the High Commissioner" }, level: 2, taskPresets: ["management", "validation", "communication"], isRequired: true },
  { code: "counselor", title: { fr: "Conseiller", en: "Counselor" }, description: { fr: "Conseiller du Haut-Commissariat", en: "High Commission Counselor" }, level: 3, taskPresets: ["management", "consultation"], isRequired: false },
  { code: "first_secretary", title: { fr: "Premier Secrétaire", en: "First Secretary" }, description: { fr: "Secrétaire de chancellerie", en: "Chancellery secretary" }, level: 4, taskPresets: ["request_processing", "communication"], isRequired: false },
  { code: "chancellor", title: { fr: "Chancelier", en: "Chancellor" }, description: { fr: "Responsable administratif et financier", en: "Administrative and financial manager" }, level: 4, taskPresets: ["management", "finance", "system_admin"], isRequired: true },
  { code: "consular_section_head", title: { fr: "Chef de Section Consulaire", en: "Consular Section Head" }, description: { fr: "Responsable de la section consulaire", en: "Head of consular section" }, level: 4, taskPresets: ["request_processing", "validation", "civil_status"], isRequired: false },
  { code: "consular_agent", title: { fr: "Agent Consulaire", en: "Consular Agent" }, description: { fr: "Agent polyvalent", en: "General consular agent" }, level: 5, taskPresets: ["request_processing"], isRequired: true },
  { code: "receptionist", title: { fr: "Réceptionniste", en: "Receptionist" }, description: { fr: "Accueil du public", en: "Public reception" }, level: 6, taskPresets: ["reception"], isRequired: false },
];

// ─── PERMANENT MISSION positions ────────────────────────

export const PERMANENT_MISSION_POSITIONS: PositionTemplate[] = [
  { code: "permanent_representative", title: { fr: "Représentant Permanent", en: "Permanent Representative" }, description: { fr: "Chef de la Mission Permanente", en: "Head of Permanent Mission" }, level: 1, taskPresets: ["direction", "intelligence"], isRequired: true },
  { code: "deputy_representative", title: { fr: "Représentant Permanent Adjoint", en: "Deputy Permanent Representative" }, description: { fr: "Adjoint du Représentant Permanent", en: "Deputy to the Permanent Representative" }, level: 2, taskPresets: ["management", "validation", "communication"], isRequired: false },
  { code: "counselor", title: { fr: "Conseiller", en: "Counselor" }, description: { fr: "Conseiller de la Mission", en: "Mission Counselor" }, level: 3, taskPresets: ["management", "consultation"], isRequired: true },
  { code: "first_secretary", title: { fr: "Premier Secrétaire", en: "First Secretary" }, description: { fr: "Secrétaire de la Mission", en: "Mission Secretary" }, level: 4, taskPresets: ["request_processing", "communication"], isRequired: false },
  { code: "attache", title: { fr: "Attaché", en: "Attaché" }, description: { fr: "Attaché de la Mission", en: "Mission Attaché" }, level: 5, taskPresets: ["request_processing", "consultation"], isRequired: false },
];

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION TEMPLATES — Presets per org type
// Uses OrganizationType enum from constants.ts
// ═══════════════════════════════════════════════════════════════

export type OrgTemplateType = OrganizationType | "custom";

export interface OrganizationTemplate {
  type: OrgTemplateType;
  label: LocalizedString;
  description: LocalizedString;
  /** Lucide icon name */
  icon: string;
  positions: PositionTemplate[];
  ministryGroups?: MinistryGroupTemplate[];
}

export const ORGANIZATION_TEMPLATES: OrganizationTemplate[] = [
  {
    type: OrganizationType.Embassy,
    label: { fr: "Ambassade", en: "Embassy" },
    description: { fr: "Représentation diplomatique complète", en: "Full diplomatic representation" },
    icon: "Landmark",
    positions: EMBASSY_POSITIONS,
    ministryGroups: EMBASSY_MINISTRY_GROUPS,
  },
  {
    type: OrganizationType.GeneralConsulate,
    label: { fr: "Consulat Général", en: "General Consulate" },
    description: { fr: "Poste consulaire de première catégorie", en: "First-class consular post" },
    icon: "Building",
    positions: CONSULATE_POSITIONS,
  },
  {
    type: OrganizationType.Consulate,
    label: { fr: "Consulat", en: "Consulate" },
    description: { fr: "Poste consulaire standard", en: "Standard consular post" },
    icon: "Home",
    positions: CONSULATE_POSITIONS.filter((p) => p.level <= 5 && p.code !== "visa_officer"),
  },
  {
    type: OrganizationType.PermanentMission,
    label: { fr: "Mission Permanente", en: "Permanent Mission" },
    description: { fr: "Mission auprès d'une organisation internationale", en: "Mission to an international organization" },
    icon: "Globe",
    positions: PERMANENT_MISSION_POSITIONS,
  },
  {
    type: OrganizationType.HonoraryConsulate,
    label: { fr: "Consulat Honoraire", en: "Honorary Consulate" },
    description: { fr: "Représentation consulaire honoraire", en: "Honorary consular representation" },
    icon: "Award",
    positions: HONORARY_CONSULATE_POSITIONS,
  },
  {
    type: OrganizationType.HighCommission,
    label: { fr: "Haut-Commissariat", en: "High Commission" },
    description: { fr: "Représentation de type Commonwealth", en: "Commonwealth-type representation" },
    icon: "Landmark",
    positions: HIGH_COMMISSION_POSITIONS,
  },
  {
    type: OrganizationType.ThirdParty,
    label: { fr: "Partenaire Tiers", en: "Third Party" },
    description: { fr: "Organisation partenaire externe", en: "External partner organization" },
    icon: "Handshake",
    positions: [],
  },
  {
    type: OrganizationType.Other,
    label: { fr: "Autre", en: "Other" },
    description: { fr: "Autre type d'organisation", en: "Other organization type" },
    icon: "Wrench",
    positions: [],
  },
  {
    type: "custom",
    label: { fr: "Personnalisé", en: "Custom" },
    description: { fr: "Configuration entièrement personnalisée", en: "Fully custom configuration" },
    icon: "Settings",
    positions: [],
  },
];

// ═══════════════════════════════════════════════════════════════
// TASK CATEGORY METADATA (icons + labels for UI)
// ═══════════════════════════════════════════════════════════════

import type { TaskCategory } from "./taskCodes";
export type { TaskCategory };

export const TASK_CATEGORY_META: Record<TaskCategory, { label: LocalizedString; icon: string }> = {
  requests: { label: { fr: "Demandes", en: "Requests" }, icon: "FileEdit" },
  documents: { label: { fr: "Documents", en: "Documents" }, icon: "FileText" },
  appointments: { label: { fr: "Rendez-vous", en: "Appointments" }, icon: "CalendarDays" },
  profiles: { label: { fr: "Profils", en: "Profiles" }, icon: "User" },
  civil_status: { label: { fr: "État civil", en: "Civil status" }, icon: "ScrollText" },
  passports: { label: { fr: "Passeports", en: "Passports" }, icon: "BookOpen" },
  visas: { label: { fr: "Visas", en: "Visas" }, icon: "Stamp" },
  finance: { label: { fr: "Finances", en: "Finance" }, icon: "Wallet" },
  communication: { label: { fr: "Communication", en: "Communication" }, icon: "Megaphone" },
  team: { label: { fr: "Équipe", en: "Team" }, icon: "Users" },
  settings: { label: { fr: "Paramètres", en: "Settings" }, icon: "Settings" },
  org: { label: { fr: "Organisation", en: "Organization" }, icon: "Building" },
  schedules: { label: { fr: "Plannings", en: "Schedules" }, icon: "Calendar" },
  analytics: { label: { fr: "Statistiques", en: "Analytics" }, icon: "BarChart3" },
  statistics: { label: { fr: "Statistiques", en: "Statistics" }, icon: "LineChart" },
  intelligence: { label: { fr: "Renseignement", en: "Intelligence" }, icon: "ShieldAlert" },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Get a task preset by code */
export function getTaskPreset(code: string): TaskPresetDefinition | undefined {
  return POSITION_TASK_PRESETS.find((m) => m.code === code);
}

/** Get all tasks for a position template (union of all its presets) */
export function getPresetTasks(presetCodes: string[]): TaskCodeValue[] {
  const taskSet = new Set<TaskCodeValue>();
  for (const code of presetCodes) {
    const preset = getTaskPreset(code);
    if (preset) {
      for (const task of preset.tasks) {
        taskSet.add(task);
      }
    }
  }
  return Array.from(taskSet);
}

/** Get template by org type */
export function getOrgTemplate(type: OrgTemplateType): OrganizationTemplate | undefined {
  return ORGANIZATION_TEMPLATES.find((t) => t.type === type);
}

// ═══════════════════════════════════════════════════════════════
// TASK CATALOG — Enriched flat array for UI
// ═══════════════════════════════════════════════════════════════

import { ALL_TASK_CODES, TASK_RISK, type TaskRisk } from "./taskCodes";

/** Full task definition for UI display */
export interface TaskDefinition {
  code: TaskCodeValue;
  category: TaskCategory;
  risk: TaskRisk;
  label: LocalizedString;
}

/** Enriched flat array of all tasks with category metadata for UI */
export const TASK_CATALOG: TaskDefinition[] = ALL_TASK_CODES.map((code) => {
  const category = code.split(".")[0] as TaskCategory;
  const meta = TASK_CATEGORY_META[category];
  return {
    code,
    category,
    risk: TASK_RISK[code],
    label: meta?.label ?? { fr: code, en: code },
  };
});

/** Group tasks by category */
export function getTasksByCategory(): Record<string, TaskDefinition[]> {
  const grouped: Record<string, TaskDefinition[]> = {};
  for (const task of TASK_CATALOG) {
    if (!grouped[task.category]) grouped[task.category] = [];
    grouped[task.category].push(task);
  }
  return grouped;
}

/** Get all task definitions for a position template (from its presets) */
export function getPositionTasks(position: PositionTemplate): TaskDefinition[] {
  const taskCodes = getPresetTasks(position.taskPresets);
  return taskCodes
    .map((code) => TASK_CATALOG.find((t) => t.code === code))
    .filter((t): t is TaskDefinition => t !== undefined);
}
