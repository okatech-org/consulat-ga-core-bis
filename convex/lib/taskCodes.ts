/**
 * ═══════════════════════════════════════════════════════════════
 * TASK CODES — Single source of truth
 * ═══════════════════════════════════════════════════════════════
 *
 * Every permission in the system is represented by a task code.
 * This file is the authoritative definition:
 *   - Nested object for IDE autocompletion (TaskCode.requests.view)
 *   - Union type for compile-time safety
 *   - Flat array for iteration and validation
 *   - Convex validator for DB storage
 *   - Metadata (category, risk level)
 *
 * i18n keys follow the pattern: tasks.<code>.label / tasks.<code>.description
 * e.g. tasks.requests.view.label, tasks.requests.view.description
 */

import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════
// TASK CODE OBJECT — Nested for autocompletion
// ═══════════════════════════════════════════════════════════════

export const TaskCode = {
  requests: {
    view: "requests.view",
    create: "requests.create",
    process: "requests.process",
    validate: "requests.validate",
    assign: "requests.assign",
    delete: "requests.delete",
    complete: "requests.complete",
  },
  documents: {
    view: "documents.view",
    validate: "documents.validate",
    generate: "documents.generate",
    delete: "documents.delete",
  },
  appointments: {
    view: "appointments.view",
    manage: "appointments.manage",
    configure: "appointments.configure",
  },
  profiles: {
    view: "profiles.view",
    manage: "profiles.manage",
  },
  civil_status: {
    transcribe: "civil_status.transcribe",
    register: "civil_status.register",
    certify: "civil_status.certify",
  },
  passports: {
    process: "passports.process",
    biometric: "passports.biometric",
    deliver: "passports.deliver",
  },
  visas: {
    process: "visas.process",
    approve: "visas.approve",
    stamp: "visas.stamp",
  },
  finance: {
    view: "finance.view",
    collect: "finance.collect",
    manage: "finance.manage",
  },
  communication: {
    publish: "communication.publish",
    notify: "communication.notify",
  },
  team: {
    view: "team.view",
    manage: "team.manage",
    assign_roles: "team.assign_roles",
  },
  settings: {
    view: "settings.view",
    manage: "settings.manage",
  },
  org: {
    view: "org.view",
  },
  schedules: {
    view: "schedules.view",
    manage: "schedules.manage",
  },
  analytics: {
    view: "analytics.view",
    export: "analytics.export",
  },
  statistics: {
    view: "statistics.view",
  },
  intelligence: {
    view: "intelligence.view",
    manage: "intelligence.manage",
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// TYPE — Union of all task code strings
// ═══════════════════════════════════════════════════════════════

/** Recursively extract all string leaf values from a nested object */
type ExtractLeafValues<T> = T extends string
  ? T
  : { [K in keyof T]: ExtractLeafValues<T[K]> }[keyof T];

/** Union type of every valid task code: "requests.view" | "requests.create" | ... */
export type TaskCodeValue = ExtractLeafValues<typeof TaskCode>;

// ═══════════════════════════════════════════════════════════════
// FLAT ARRAY — For iteration and validation
// ═══════════════════════════════════════════════════════════════

/** Extract all leaf string values from the nested TaskCode object */
function extractCodes(obj: Record<string, unknown>): string[] {
  const codes: string[] = [];
  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      codes.push(value);
    } else if (typeof value === "object" && value !== null) {
      codes.push(...extractCodes(value as Record<string, unknown>));
    }
  }
  return codes;
}

/** Flat array of every task code in the system */
export const ALL_TASK_CODES = extractCodes(TaskCode) as TaskCodeValue[];

/** Get all task codes for a specific category */
export function getTaskCodesForCategory(
  category: keyof typeof TaskCode,
): TaskCodeValue[] {
  const group = TaskCode[category];
  return Object.values(group) as TaskCodeValue[];
}

// ═══════════════════════════════════════════════════════════════
// CONVEX VALIDATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Convex validator for task codes.
 * Use in schema definitions: `tasks: v.array(taskCodeValidator)`
 */
export const taskCodeValidator = v.union(
  // Requests
  v.literal("requests.view"),
  v.literal("requests.create"),
  v.literal("requests.process"),
  v.literal("requests.validate"),
  v.literal("requests.assign"),
  v.literal("requests.delete"),
  v.literal("requests.complete"),
  // Documents
  v.literal("documents.view"),
  v.literal("documents.validate"),
  v.literal("documents.generate"),
  v.literal("documents.delete"),
  // Appointments
  v.literal("appointments.view"),
  v.literal("appointments.manage"),
  v.literal("appointments.configure"),
  // Profiles
  v.literal("profiles.view"),
  v.literal("profiles.manage"),
  // Civil Status
  v.literal("civil_status.transcribe"),
  v.literal("civil_status.register"),
  v.literal("civil_status.certify"),
  // Passports
  v.literal("passports.process"),
  v.literal("passports.biometric"),
  v.literal("passports.deliver"),
  // Visas
  v.literal("visas.process"),
  v.literal("visas.approve"),
  v.literal("visas.stamp"),
  // Finance
  v.literal("finance.view"),
  v.literal("finance.collect"),
  v.literal("finance.manage"),
  // Communication
  v.literal("communication.publish"),
  v.literal("communication.notify"),
  // Team
  v.literal("team.view"),
  v.literal("team.manage"),
  v.literal("team.assign_roles"),
  // Settings
  v.literal("settings.view"),
  v.literal("settings.manage"),
  // Org
  v.literal("org.view"),
  // Schedules
  v.literal("schedules.view"),
  v.literal("schedules.manage"),
  // Analytics
  v.literal("analytics.view"),
  v.literal("analytics.export"),
  // Statistics
  v.literal("statistics.view"),
  // Intelligence
  v.literal("intelligence.view"),
  v.literal("intelligence.manage"),
);

// ═══════════════════════════════════════════════════════════════
// TASK CATEGORIES
// ═══════════════════════════════════════════════════════════════

/** All task category keys */
export type TaskCategory = keyof typeof TaskCode;

/** All task category keys as array */
export const ALL_TASK_CATEGORIES = Object.keys(TaskCode) as TaskCategory[];

// ═══════════════════════════════════════════════════════════════
// RISK LEVELS
// ═══════════════════════════════════════════════════════════════

export type TaskRisk = "low" | "medium" | "high" | "critical";

/**
 * Risk level for each task code.
 * Determines UI treatment (warnings, confirmation dialogs, audit logging).
 */
export const TASK_RISK: Record<TaskCodeValue, TaskRisk> = {
  // Requests
  "requests.view": "low",
  "requests.create": "low",
  "requests.process": "medium",
  "requests.validate": "high",
  "requests.assign": "medium",
  "requests.delete": "critical",
  "requests.complete": "medium",
  // Documents
  "documents.view": "low",
  "documents.validate": "high",
  "documents.generate": "high",
  "documents.delete": "critical",
  // Appointments
  "appointments.view": "low",
  "appointments.manage": "medium",
  "appointments.configure": "medium",
  // Profiles
  "profiles.view": "low",
  "profiles.manage": "high",
  // Civil Status
  "civil_status.transcribe": "high",
  "civil_status.register": "high",
  "civil_status.certify": "high",
  // Passports
  "passports.process": "high",
  "passports.biometric": "medium",
  "passports.deliver": "high",
  // Visas
  "visas.process": "high",
  "visas.approve": "critical",
  "visas.stamp": "high",
  // Finance
  "finance.view": "medium",
  "finance.collect": "high",
  "finance.manage": "critical",
  // Communication
  "communication.publish": "medium",
  "communication.notify": "medium",
  // Team
  "team.view": "low",
  "team.manage": "high",
  "team.assign_roles": "critical",
  // Settings
  "settings.view": "low",
  "settings.manage": "high",
  // Org
  "org.view": "low",
  // Schedules
  "schedules.view": "low",
  "schedules.manage": "medium",
  // Analytics
  "analytics.view": "low",
  "analytics.export": "medium",
  // Statistics
  "statistics.view": "low",
  // Intelligence
  "intelligence.view": "critical",
  "intelligence.manage": "critical",
};
