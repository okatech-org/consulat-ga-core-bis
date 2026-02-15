/**
 * ═══════════════════════════════════════════════════════════════
 * ROLE MODULE SYSTEM
 * ═══════════════════════════════════════════════════════════════
 *
 * Architecture:
 *   Task (atomic permission)
 *     └─ RoleModule (group of tasks)
 *         └─ Position (job title with multiple role modules)
 *             └─ OrganizationTemplate (preset positions per org type)
 *
 * CONVENTIONS:
 *   - All user-facing text uses LocalizedString ({ fr: "...", en: "..." })
 *   - Icons use Lucide React icon names (string), rendered on frontend
 *   - Types reference project enums (OrganizationType) when applicable
 */

import { OrganizationType } from "./constants";
import type { LocalizedString } from "./validators";

// ═══════════════════════════════════════════════════════════════
// TASKS — Atomic permissions
// ═══════════════════════════════════════════════════════════════

export type TaskCategory =
  | "requests"
  | "documents"
  | "appointments"
  | "profiles"
  | "civil_status"
  | "passports"
  | "visas"
  | "finance"
  | "communication"
  | "team"
  | "settings"
  | "analytics"
  | "intelligence";

export interface TaskDefinition {
  code: string;
  label: LocalizedString;
  description: LocalizedString;
  category: TaskCategory;
  risk: "low" | "medium" | "high" | "critical";
}

/**
 * Full catalog of available tasks in the system.
 */
export const TASK_CATALOG: TaskDefinition[] = [
  // ─── Requests ─────────────────────────────────────────
  { code: "requests.view", label: { fr: "Voir les demandes", en: "View requests" }, description: { fr: "Consulter la liste des demandes", en: "View the list of requests" }, category: "requests", risk: "low" },
  { code: "requests.create", label: { fr: "Créer une demande", en: "Create a request" }, description: { fr: "Soumettre une nouvelle demande", en: "Submit a new request" }, category: "requests", risk: "low" },
  { code: "requests.process", label: { fr: "Traiter les demandes", en: "Process requests" }, description: { fr: "Instruire et traiter les demandes", en: "Process and handle requests" }, category: "requests", risk: "medium" },
  { code: "requests.validate", label: { fr: "Valider les demandes", en: "Validate requests" }, description: { fr: "Approuver ou rejeter les demandes", en: "Approve or reject requests" }, category: "requests", risk: "high" },
  { code: "requests.assign", label: { fr: "Assigner les demandes", en: "Assign requests" }, description: { fr: "Attribuer les demandes à un agent", en: "Assign requests to an agent" }, category: "requests", risk: "medium" },
  { code: "requests.delete", label: { fr: "Supprimer les demandes", en: "Delete requests" }, description: { fr: "Supprimer définitivement une demande", en: "Permanently delete a request" }, category: "requests", risk: "critical" },
  { code: "requests.complete", label: { fr: "Clôturer les demandes", en: "Complete requests" }, description: { fr: "Marquer une demande comme terminée", en: "Mark a request as completed" }, category: "requests", risk: "medium" },

  // ─── Documents ────────────────────────────────────────
  { code: "documents.view", label: { fr: "Voir les documents", en: "View documents" }, description: { fr: "Consulter les documents", en: "View documents" }, category: "documents", risk: "low" },
  { code: "documents.validate", label: { fr: "Valider les documents", en: "Validate documents" }, description: { fr: "Vérifier et valider les documents", en: "Verify and validate documents" }, category: "documents", risk: "high" },
  { code: "documents.generate", label: { fr: "Générer les documents", en: "Generate documents" }, description: { fr: "Générer des documents officiels", en: "Generate official documents" }, category: "documents", risk: "high" },
  { code: "documents.delete", label: { fr: "Supprimer les documents", en: "Delete documents" }, description: { fr: "Supprimer définitivement un document", en: "Permanently delete a document" }, category: "documents", risk: "critical" },

  // ─── Appointments ─────────────────────────────────────
  { code: "appointments.view", label: { fr: "Voir les rendez-vous", en: "View appointments" }, description: { fr: "Consulter les rendez-vous", en: "View appointments" }, category: "appointments", risk: "low" },
  { code: "appointments.manage", label: { fr: "Gérer les rendez-vous", en: "Manage appointments" }, description: { fr: "Créer, modifier et annuler des rendez-vous", en: "Create, edit and cancel appointments" }, category: "appointments", risk: "medium" },
  { code: "appointments.configure", label: { fr: "Configurer les créneaux", en: "Configure slots" }, description: { fr: "Configurer les plages horaires disponibles", en: "Configure available time slots" }, category: "appointments", risk: "medium" },

  // ─── Profiles ─────────────────────────────────────────
  { code: "profiles.view", label: { fr: "Voir les profils", en: "View profiles" }, description: { fr: "Consulter les profils des usagers", en: "View user profiles" }, category: "profiles", risk: "low" },
  { code: "profiles.manage", label: { fr: "Gérer les profils", en: "Manage profiles" }, description: { fr: "Modifier les profils des usagers", en: "Edit user profiles" }, category: "profiles", risk: "high" },

  // ─── Civil Status ─────────────────────────────────────
  { code: "civil_status.transcribe", label: { fr: "Transcrire les actes", en: "Transcribe records" }, description: { fr: "Transcrire les actes d'état civil", en: "Transcribe civil status records" }, category: "civil_status", risk: "high" },
  { code: "civil_status.register", label: { fr: "Enregistrer les actes", en: "Register records" }, description: { fr: "Enregistrer de nouveaux actes d'état civil", en: "Register new civil status records" }, category: "civil_status", risk: "high" },
  { code: "civil_status.certify", label: { fr: "Certifier les actes", en: "Certify records" }, description: { fr: "Certifier la conformité des actes", en: "Certify record conformity" }, category: "civil_status", risk: "high" },

  // ─── Passports ────────────────────────────────────────
  { code: "passports.process", label: { fr: "Traiter les passeports", en: "Process passports" }, description: { fr: "Instruire les demandes de passeport", en: "Process passport applications" }, category: "passports", risk: "high" },
  { code: "passports.biometric", label: { fr: "Biométrie", en: "Biometrics" }, description: { fr: "Capturer les données biométriques", en: "Capture biometric data" }, category: "passports", risk: "medium" },
  { code: "passports.deliver", label: { fr: "Délivrer les passeports", en: "Deliver passports" }, description: { fr: "Remettre les passeports aux demandeurs", en: "Hand over passports to applicants" }, category: "passports", risk: "high" },

  // ─── Visas ────────────────────────────────────────────
  { code: "visas.process", label: { fr: "Traiter les visas", en: "Process visas" }, description: { fr: "Instruire les demandes de visa", en: "Process visa applications" }, category: "visas", risk: "high" },
  { code: "visas.approve", label: { fr: "Approuver les visas", en: "Approve visas" }, description: { fr: "Approuver ou refuser les demandes de visa", en: "Approve or deny visa applications" }, category: "visas", risk: "critical" },
  { code: "visas.stamp", label: { fr: "Apposer le visa", en: "Stamp visa" }, description: { fr: "Apposer le visa sur le passeport", en: "Stamp the visa on the passport" }, category: "visas", risk: "high" },

  // ─── Finance ──────────────────────────────────────────
  { code: "finance.view", label: { fr: "Voir les finances", en: "View finances" }, description: { fr: "Consulter les informations financières", en: "View financial information" }, category: "finance", risk: "medium" },
  { code: "finance.collect", label: { fr: "Encaisser", en: "Collect payments" }, description: { fr: "Encaisser les droits et frais consulaires", en: "Collect consular fees and duties" }, category: "finance", risk: "high" },
  { code: "finance.manage", label: { fr: "Gérer les finances", en: "Manage finances" }, description: { fr: "Gérer la comptabilité et les rapports financiers", en: "Manage accounting and financial reports" }, category: "finance", risk: "critical" },

  // ─── Communication ────────────────────────────────────
  { code: "communication.publish", label: { fr: "Publier du contenu", en: "Publish content" }, description: { fr: "Publier des articles et actualités", en: "Publish articles and news" }, category: "communication", risk: "medium" },
  { code: "communication.notify", label: { fr: "Envoyer des notifications", en: "Send notifications" }, description: { fr: "Envoyer des notifications aux usagers", en: "Send notifications to users" }, category: "communication", risk: "medium" },

  // ─── Team ─────────────────────────────────────────────
  { code: "team.view", label: { fr: "Voir l'équipe", en: "View team" }, description: { fr: "Consulter les membres de l'équipe", en: "View team members" }, category: "team", risk: "low" },
  { code: "team.manage", label: { fr: "Gérer l'équipe", en: "Manage team" }, description: { fr: "Ajouter et retirer des membres", en: "Add and remove members" }, category: "team", risk: "high" },
  { code: "team.assign_roles", label: { fr: "Attribuer les rôles", en: "Assign roles" }, description: { fr: "Attribuer des rôles et permissions", en: "Assign roles and permissions" }, category: "team", risk: "critical" },

  // ─── Settings ─────────────────────────────────────────
  { code: "settings.view", label: { fr: "Voir les paramètres", en: "View settings" }, description: { fr: "Consulter les paramètres du poste", en: "View post settings" }, category: "settings", risk: "low" },
  { code: "settings.manage", label: { fr: "Gérer les paramètres", en: "Manage settings" }, description: { fr: "Modifier les paramètres du poste", en: "Edit post settings" }, category: "settings", risk: "high" },

  // ─── Analytics ────────────────────────────────────────
  { code: "analytics.view", label: { fr: "Voir les statistiques", en: "View analytics" }, description: { fr: "Consulter les tableaux de bord", en: "View dashboards" }, category: "analytics", risk: "low" },
  { code: "analytics.export", label: { fr: "Exporter les données", en: "Export data" }, description: { fr: "Exporter les rapports et données", en: "Export reports and data" }, category: "analytics", risk: "medium" },

  // ─── Intelligence ─────────────────────────────────────
  { code: "intelligence.view", label: { fr: "Voir le renseignement", en: "View intelligence" }, description: { fr: "Consulter les notes de renseignement", en: "View intelligence notes" }, category: "intelligence", risk: "critical" },
  { code: "intelligence.manage", label: { fr: "Gérer le renseignement", en: "Manage intelligence" }, description: { fr: "Créer et gérer les notes de renseignement", en: "Create and manage intelligence notes" }, category: "intelligence", risk: "critical" },
];

// ═══════════════════════════════════════════════════════════════
// ROLE MODULES — Groups of tasks
// ═══════════════════════════════════════════════════════════════

export interface RoleModuleDefinition {
  code: string;
  label: LocalizedString;
  description: LocalizedString;
  /** Lucide icon name (e.g. "Crown", "FileText") */
  icon: string;
  /** Tailwind color class */
  color: string;
  tasks: string[];
  isSystem: boolean;
}

export const DEFAULT_ROLE_MODULES: RoleModuleDefinition[] = [
  {
    code: "direction",
    label: { fr: "Direction", en: "Leadership" },
    description: { fr: "Supervision générale du poste diplomatique", en: "General oversight of the diplomatic post" },
    icon: "Crown",
    color: "text-amber-500",
    tasks: [
      "requests.view", "requests.validate", "requests.assign",
      "documents.view", "documents.validate", "documents.generate",
      "appointments.view", "profiles.view", "profiles.manage",
      "finance.view", "finance.manage",
      "team.view", "team.manage", "team.assign_roles",
      "settings.view", "settings.manage",
      "analytics.view", "analytics.export",
      "communication.publish", "communication.notify",
    ],
    isSystem: true,
  },
  {
    code: "management",
    label: { fr: "Encadrement", en: "Management" },
    description: { fr: "Gestion des opérations courantes et supervision des agents", en: "Daily operations management and agent supervision" },
    icon: "ClipboardList",
    color: "text-blue-500",
    tasks: [
      "requests.view", "requests.validate", "requests.assign", "requests.complete",
      "documents.view", "documents.validate",
      "appointments.view", "appointments.manage",
      "profiles.view", "team.view", "team.manage",
      "analytics.view", "communication.publish",
    ],
    isSystem: true,
  },
  {
    code: "request_processing",
    label: { fr: "Traitement des demandes", en: "Request processing" },
    description: { fr: "Instruction et traitement des demandes courantes", en: "Processing and handling of standard requests" },
    icon: "FileEdit",
    color: "text-emerald-500",
    tasks: [
      "requests.view", "requests.create", "requests.process", "requests.complete",
      "documents.view", "documents.validate",
      "appointments.view", "appointments.manage",
      "profiles.view",
    ],
    isSystem: true,
  },
  {
    code: "validation",
    label: { fr: "Validation", en: "Validation" },
    description: { fr: "Vérification et validation des documents et demandes", en: "Verification and validation of documents and requests" },
    icon: "CheckCircle",
    color: "text-green-600",
    tasks: [
      "requests.view", "requests.validate",
      "documents.view", "documents.validate", "documents.generate",
      "profiles.view",
    ],
    isSystem: true,
  },
  {
    code: "civil_status",
    label: { fr: "État civil", en: "Civil status" },
    description: { fr: "Gestion des actes d'état civil", en: "Civil status records management" },
    icon: "ScrollText",
    color: "text-purple-500",
    tasks: [
      "civil_status.transcribe", "civil_status.register", "civil_status.certify",
      "requests.view", "requests.process",
      "documents.view", "documents.validate", "documents.generate",
      "profiles.view",
    ],
    isSystem: true,
  },
  {
    code: "passports",
    label: { fr: "Passeports", en: "Passports" },
    description: { fr: "Gestion des demandes de passeport et biométrie", en: "Passport applications and biometrics management" },
    icon: "BookOpen",
    color: "text-indigo-500",
    tasks: [
      "passports.process", "passports.biometric", "passports.deliver",
      "requests.view", "requests.process",
      "documents.view", "documents.validate",
      "profiles.view", "appointments.view",
    ],
    isSystem: true,
  },
  {
    code: "visas",
    label: { fr: "Visas", en: "Visas" },
    description: { fr: "Instruction et délivrance des visas", en: "Visa processing and issuance" },
    icon: "Stamp",
    color: "text-orange-500",
    tasks: [
      "visas.process", "visas.approve", "visas.stamp",
      "requests.view", "requests.process",
      "documents.view", "documents.validate",
      "profiles.view", "appointments.view",
    ],
    isSystem: true,
  },
  {
    code: "finance",
    label: { fr: "Finances", en: "Finance" },
    description: { fr: "Gestion financière et comptabilité consulaire", en: "Financial management and consular accounting" },
    icon: "Wallet",
    color: "text-yellow-600",
    tasks: [
      "finance.view", "finance.collect", "finance.manage",
      "analytics.view", "analytics.export",
    ],
    isSystem: true,
  },
  {
    code: "communication",
    label: { fr: "Communication", en: "Communication" },
    description: { fr: "Publications et notifications aux usagers", en: "Publications and user notifications" },
    icon: "Megaphone",
    color: "text-sky-500",
    tasks: [
      "communication.publish", "communication.notify",
      "analytics.view",
    ],
    isSystem: true,
  },
  {
    code: "reception",
    label: { fr: "Accueil", en: "Reception" },
    description: { fr: "Accueil du public et prise de rendez-vous", en: "Public reception and appointment scheduling" },
    icon: "HandHelping",
    color: "text-teal-500",
    tasks: [
      "requests.view", "requests.create",
      "appointments.view", "appointments.manage",
      "profiles.view",
    ],
    isSystem: true,
  },
  {
    code: "consultation",
    label: { fr: "Consultation", en: "Read-only access" },
    description: { fr: "Accès en lecture seule aux données du poste", en: "Read-only access to post data" },
    icon: "Eye",
    color: "text-zinc-400",
    tasks: [
      "requests.view", "documents.view",
      "appointments.view", "profiles.view",
      "analytics.view",
    ],
    isSystem: true,
  },
  {
    code: "intelligence",
    label: { fr: "Renseignement", en: "Intelligence" },
    description: { fr: "Gestion des notes de renseignement", en: "Intelligence notes management" },
    icon: "ShieldAlert",
    color: "text-red-500",
    tasks: [
      "intelligence.view", "intelligence.manage",
      "profiles.view",
    ],
    isSystem: true,
  },
  {
    code: "system_admin",
    label: { fr: "Administration système", en: "System administration" },
    description: { fr: "Configuration technique et gestion des accès", en: "Technical configuration and access management" },
    icon: "Settings",
    color: "text-zinc-500",
    tasks: [
      "settings.view", "settings.manage",
      "team.view", "team.manage", "team.assign_roles",
      "analytics.view", "analytics.export",
    ],
    isSystem: true,
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
  roleModules: string[];
  isRequired: boolean;
}

// ─── EMBASSY positions ──────────────────────────────────

export const EMBASSY_POSITIONS: PositionTemplate[] = [
  { code: "ambassador", title: { fr: "Ambassadeur", en: "Ambassador" }, description: { fr: "Chef de mission diplomatique", en: "Head of diplomatic mission" }, level: 1, grade: "chief", ministryCode: "presidence", roleModules: ["direction", "intelligence"], isRequired: true },
  { code: "first_counselor", title: { fr: "Premier Conseiller", en: "First Counselor" }, description: { fr: "Adjoint du chef de mission", en: "Deputy head of mission" }, level: 2, grade: "counselor", ministryCode: "mae", roleModules: ["management", "validation", "communication"], isRequired: true },
  { code: "economic_counselor", title: { fr: "Conseiller Économique", en: "Economic Counselor" }, description: { fr: "Chargé des affaires économiques", en: "In charge of economic affairs" }, level: 3, grade: "counselor", ministryCode: "mae", roleModules: ["consultation", "communication"], isRequired: false },
  { code: "social_counselor", title: { fr: "Conseiller Social", en: "Social Counselor" }, description: { fr: "Chargé des affaires sociales", en: "In charge of social affairs" }, level: 3, grade: "counselor", ministryCode: "mae", roleModules: ["request_processing", "validation"], isRequired: false },
  { code: "communication_counselor", title: { fr: "Conseiller Communication", en: "Communication Counselor" }, description: { fr: "Chargé de la communication", en: "In charge of communications" }, level: 3, grade: "counselor", ministryCode: "mae", roleModules: ["communication", "consultation"], isRequired: false },
  { code: "first_secretary", title: { fr: "Premier Secrétaire", en: "First Secretary" }, description: { fr: "Secrétaire de chancellerie", en: "Chancellery secretary" }, level: 4, grade: "agent", ministryCode: "mae", roleModules: ["request_processing", "communication"], isRequired: false },
  { code: "receptionist", title: { fr: "Réceptionniste", en: "Receptionist" }, description: { fr: "Accueil du public", en: "Public reception" }, level: 6, grade: "external", ministryCode: "mae", roleModules: ["reception"], isRequired: false },
  { code: "chancellor", title: { fr: "Chancelier", en: "Chancellor" }, description: { fr: "Responsable administratif et financier", en: "Administrative and financial manager" }, level: 4, grade: "agent", ministryCode: "tresor_public", roleModules: ["management", "finance", "system_admin"], isRequired: true },
  { code: "paymaster", title: { fr: "Payeur", en: "Paymaster" }, description: { fr: "Agent comptable et financier", en: "Accounting and financial agent" }, level: 5, grade: "agent", ministryCode: "direction_budget", roleModules: ["finance"], isRequired: false },
  { code: "defense_attache", title: { fr: "Attaché de Défense", en: "Defense Attaché" }, description: { fr: "Représentant militaire", en: "Military representative" }, level: 3, grade: "counselor", ministryCode: "defense", roleModules: ["intelligence", "consultation"], isRequired: false },
  { code: "security_attache", title: { fr: "Attaché de Sécurité", en: "Security Attaché" }, description: { fr: "Représentant de la sécurité intérieure", en: "Interior security representative" }, level: 3, grade: "counselor", ministryCode: "interieur", roleModules: ["intelligence", "consultation"], isRequired: false },
];

// ─── CONSULATE positions ────────────────────────────────

export const CONSULATE_POSITIONS: PositionTemplate[] = [
  { code: "consul_general", title: { fr: "Consul Général", en: "Consul General" }, description: { fr: "Chef du poste consulaire", en: "Head of consular post" }, level: 1, roleModules: ["direction", "validation"], isRequired: true },
  { code: "consul", title: { fr: "Consul", en: "Consul" }, description: { fr: "Consul adjoint", en: "Deputy consul" }, level: 2, roleModules: ["management", "validation", "civil_status"], isRequired: false },
  { code: "vice_consul", title: { fr: "Vice-Consul", en: "Vice Consul" }, description: { fr: "Responsable des affaires consulaires", en: "Consular affairs manager" }, level: 3, roleModules: ["validation", "request_processing", "civil_status"], isRequired: true },
  { code: "chancellor", title: { fr: "Chancelier", en: "Chancellor" }, description: { fr: "Responsable administratif et financier", en: "Administrative and financial manager" }, level: 3, roleModules: ["management", "finance", "system_admin"], isRequired: true },
  { code: "head_of_chancellery", title: { fr: "Chef de Chancellerie", en: "Head of Chancellery" }, description: { fr: "Responsable des opérations de chancellerie", en: "Head of chancellery operations" }, level: 3, grade: "agent", roleModules: ["management", "request_processing", "finance"], isRequired: false },
  { code: "consular_affairs_officer", title: { fr: "Agent des Affaires Consulaires", en: "Consular Affairs Officer" }, description: { fr: "Agent chargé des demandes consulaires", en: "Agent handling consular requests" }, level: 4, roleModules: ["request_processing", "validation", "passports"], isRequired: false },
  { code: "civil_status_officer", title: { fr: "Officier d'État Civil", en: "Civil Status Officer" }, description: { fr: "Officier chargé de l'état civil", en: "Officer in charge of civil status" }, level: 4, roleModules: ["civil_status", "request_processing"], isRequired: true },
  { code: "passport_officer", title: { fr: "Agent Passeports", en: "Passport Officer" }, description: { fr: "Agent chargé des passeports", en: "Agent handling passports" }, level: 4, roleModules: ["passports", "request_processing"], isRequired: false },
  { code: "visa_officer", title: { fr: "Agent Visas", en: "Visa Officer" }, description: { fr: "Agent chargé des visas", en: "Agent handling visas" }, level: 4, roleModules: ["visas", "request_processing"], isRequired: false },
  { code: "economic_counselor", title: { fr: "Conseiller Économique", en: "Economic Counselor" }, description: { fr: "Chargé des affaires économiques", en: "In charge of economic affairs" }, level: 3, grade: "counselor", roleModules: ["consultation", "communication"], isRequired: false },
  { code: "communication_counselor", title: { fr: "Conseiller Communication", en: "Communication Counselor" }, description: { fr: "Chargé de la communication", en: "In charge of communications" }, level: 3, grade: "counselor", roleModules: ["communication", "consultation"], isRequired: false },
  { code: "secretary", title: { fr: "Secrétaire", en: "Secretary" }, description: { fr: "Secrétaire administrative", en: "Administrative secretary" }, level: 5, grade: "agent", roleModules: ["request_processing", "reception"], isRequired: false },
  { code: "consular_agent", title: { fr: "Agent Consulaire", en: "Consular Agent" }, description: { fr: "Agent polyvalent", en: "General consular agent" }, level: 5, roleModules: ["request_processing"], isRequired: true },
  { code: "reception_agent", title: { fr: "Agent d'Accueil", en: "Reception Agent" }, description: { fr: "Agent d'accueil du public", en: "Public reception agent" }, level: 6, roleModules: ["reception"], isRequired: false },
  { code: "intern", title: { fr: "Stagiaire", en: "Intern" }, description: { fr: "Stagiaire en observation", en: "Observation intern" }, level: 7, roleModules: ["consultation"], isRequired: false },
];

// ─── HONORARY CONSULATE positions ───────────────────────

export const HONORARY_CONSULATE_POSITIONS: PositionTemplate[] = [
  { code: "honorary_consul", title: { fr: "Consul Honoraire", en: "Honorary Consul" }, description: { fr: "Représentant honoraire", en: "Honorary representative" }, level: 1, roleModules: ["direction", "communication"], isRequired: true },
  { code: "assistant", title: { fr: "Assistant", en: "Assistant" }, description: { fr: "Assistant du consul honoraire", en: "Honorary consul assistant" }, level: 2, roleModules: ["request_processing", "reception"], isRequired: false },
  { code: "agent", title: { fr: "Agent", en: "Agent" }, description: { fr: "Agent d'accueil", en: "Reception agent" }, level: 3, roleModules: ["reception", "consultation"], isRequired: false },
];

// ─── HIGH COMMISSION positions ──────────────────────────

export const HIGH_COMMISSION_POSITIONS: PositionTemplate[] = [
  { code: "high_commissioner", title: { fr: "Haut-Commissaire", en: "High Commissioner" }, description: { fr: "Chef du Haut-Commissariat", en: "Head of High Commission" }, level: 1, roleModules: ["direction", "intelligence"], isRequired: true },
  { code: "deputy_high_commissioner", title: { fr: "Haut-Commissaire Adjoint", en: "Deputy High Commissioner" }, description: { fr: "Adjoint du Haut-Commissaire", en: "Deputy to the High Commissioner" }, level: 2, roleModules: ["management", "validation", "communication"], isRequired: true },
  { code: "counselor", title: { fr: "Conseiller", en: "Counselor" }, description: { fr: "Conseiller du Haut-Commissariat", en: "High Commission Counselor" }, level: 3, roleModules: ["management", "consultation"], isRequired: false },
  { code: "first_secretary", title: { fr: "Premier Secrétaire", en: "First Secretary" }, description: { fr: "Secrétaire de chancellerie", en: "Chancellery secretary" }, level: 4, roleModules: ["request_processing", "communication"], isRequired: false },
  { code: "chancellor", title: { fr: "Chancelier", en: "Chancellor" }, description: { fr: "Responsable administratif et financier", en: "Administrative and financial manager" }, level: 4, roleModules: ["management", "finance", "system_admin"], isRequired: true },
  { code: "consular_section_head", title: { fr: "Chef de Section Consulaire", en: "Consular Section Head" }, description: { fr: "Responsable de la section consulaire", en: "Head of consular section" }, level: 4, roleModules: ["request_processing", "validation", "civil_status"], isRequired: false },
  { code: "consular_agent", title: { fr: "Agent Consulaire", en: "Consular Agent" }, description: { fr: "Agent polyvalent", en: "General consular agent" }, level: 5, roleModules: ["request_processing"], isRequired: true },
  { code: "receptionist", title: { fr: "Réceptionniste", en: "Receptionist" }, description: { fr: "Accueil du public", en: "Public reception" }, level: 6, roleModules: ["reception"], isRequired: false },
];

// ─── PERMANENT MISSION positions ────────────────────────

export const PERMANENT_MISSION_POSITIONS: PositionTemplate[] = [
  { code: "permanent_representative", title: { fr: "Représentant Permanent", en: "Permanent Representative" }, description: { fr: "Chef de la Mission Permanente", en: "Head of Permanent Mission" }, level: 1, roleModules: ["direction", "intelligence"], isRequired: true },
  { code: "deputy_representative", title: { fr: "Représentant Permanent Adjoint", en: "Deputy Permanent Representative" }, description: { fr: "Adjoint du Représentant Permanent", en: "Deputy to the Permanent Representative" }, level: 2, roleModules: ["management", "validation", "communication"], isRequired: false },
  { code: "counselor", title: { fr: "Conseiller", en: "Counselor" }, description: { fr: "Conseiller de la Mission", en: "Mission Counselor" }, level: 3, roleModules: ["management", "consultation"], isRequired: true },
  { code: "first_secretary", title: { fr: "Premier Secrétaire", en: "First Secretary" }, description: { fr: "Secrétaire de la Mission", en: "Mission Secretary" }, level: 4, roleModules: ["request_processing", "communication"], isRequired: false },
  { code: "attache", title: { fr: "Attaché", en: "Attaché" }, description: { fr: "Attaché de la Mission", en: "Mission Attaché" }, level: 5, roleModules: ["request_processing", "consultation"], isRequired: false },
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
// TASK CATEGORY METADATA (icons + labels)
// ═══════════════════════════════════════════════════════════════

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
  analytics: { label: { fr: "Statistiques", en: "Analytics" }, icon: "BarChart3" },
  intelligence: { label: { fr: "Renseignement", en: "Intelligence" }, icon: "ShieldAlert" },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Get a task definition by code */
export function getTask(code: string): TaskDefinition | undefined {
  return TASK_CATALOG.find((t) => t.code === code);
}

/** Get a role module by code */
export function getRoleModule(code: string): RoleModuleDefinition | undefined {
  return DEFAULT_ROLE_MODULES.find((m) => m.code === code);
}

/** Get all tasks for a given role module */
export function getModuleTasks(moduleCode: string): TaskDefinition[] {
  const mod = getRoleModule(moduleCode);
  if (!mod) return [];
  return mod.tasks
    .map((taskCode) => getTask(taskCode))
    .filter((t): t is TaskDefinition => t !== undefined);
}

/** Get all tasks for a position (union of all its role modules) */
export function getPositionTasks(position: PositionTemplate): TaskDefinition[] {
  const taskCodes = new Set<string>();
  for (const modCode of position.roleModules) {
    const mod = getRoleModule(modCode);
    if (mod) {
      for (const tc of mod.tasks) {
        taskCodes.add(tc);
      }
    }
  }
  return Array.from(taskCodes)
    .map((code) => getTask(code))
    .filter((t): t is TaskDefinition => t !== undefined);
}

/** Get template by org type */
export function getOrgTemplate(type: OrgTemplateType): OrganizationTemplate | undefined {
  return ORGANIZATION_TEMPLATES.find((t) => t.type === type);
}

/** Get all unique task categories */
export function getTaskCategories(): TaskCategory[] {
  return [...new Set(TASK_CATALOG.map((t) => t.category))];
}

/** Group tasks by category */
export function getTasksByCategory(): Record<TaskCategory, TaskDefinition[]> {
  const grouped = {} as Record<TaskCategory, TaskDefinition[]>;
  for (const task of TASK_CATALOG) {
    if (!grouped[task.category]) {
      grouped[task.category] = [];
    }
    grouped[task.category].push(task);
  }
  return grouped;
}
