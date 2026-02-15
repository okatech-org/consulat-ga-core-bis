import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { error, ErrorCode } from "./errors";
import { requireAuth, getMembership } from "./auth";
import { UserRole, PermissionEffect } from "./constants";

// ============================================
// Types
// ============================================

export type ResourceType =
  | "profiles"
  | "requests"
  | "documents"
  | "organizations"
  | "services"
  | "appointments"
  | "users"
  | "intelligenceNotes";

export type ResourceAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "process"
  | "validate"
  | "complete"
  | "assign"
  | "generate"
  | "manage"
  | "configure"
  | "reschedule"
  | "cancel";

/**
 * User context for permission checks
 */
export type PermissionContext = {
  user: Doc<"users">;
  membership?: Doc<"memberships">;
};

type AuthContext = QueryCtx | MutationCtx;

// ============================================
// Core Permission Checks
// ============================================

/**
 * Check if user has platform-level superadmin access
 */
export function isSuperAdmin(user: Doc<"users">): boolean {
  return user.isSuperadmin === true || user.role === UserRole.SuperAdmin;
}

// ============================================
// Position-Based Task Resolution (RBAC)
// ============================================

/**
 * Resolve all task codes for a membership via:
 *   membership.positionId → position.roleModuleCodes → roleModule.tasks
 *
 * Falls back to the `role` field ("admin" gets full access, "agent" gets processing)
 * when no position is assigned.
 */
export async function getTasksForMembership(
  ctx: AuthContext,
  membership: Doc<"memberships">
): Promise<Set<string>> {
  const tasks = new Set<string>();

  // ── Position-based resolution ──
  if (membership.positionId) {
    const position = await ctx.db.get(membership.positionId);
    if (position && position.isActive && position.roleModuleCodes) {
      for (const moduleCode of position.roleModuleCodes) {
        // Look up each roleModule to expand its tasks[]
        const mod = await ctx.db
          .query("roleModules")
          .withIndex("by_code", (q) => q.eq("code", moduleCode))
          .first();
        if (mod && mod.isActive) {
          for (const task of mod.tasks) {
            tasks.add(task);
          }
        }
      }
    }
  }

  // If we resolved tasks from position, return them.
  if (tasks.size > 0) return tasks;

  // ── Fallback: derive from membership.role ──
  const role = membership.role;
  if (role === "admin") {
    // Admin gets everything except intelligence
    const ALL_ADMIN_TASKS = [
      "requests.view", "requests.create", "requests.process",
      "requests.validate", "requests.assign", "requests.delete",
      "requests.complete",
      "documents.view", "documents.validate", "documents.generate",
      "documents.delete",
      "appointments.view", "appointments.manage", "appointments.configure",
      "profiles.view", "profiles.manage",
      "finance.view", "finance.collect", "finance.manage",
      "team.view", "team.manage", "team.assign_roles",
      "settings.view", "settings.manage",
      "analytics.view", "analytics.export",
      "communication.publish", "communication.notify",
      "civil_status.transcribe", "civil_status.register", "civil_status.certify",
      "passports.process", "passports.biometric", "passports.deliver",
      "visas.process", "visas.approve", "visas.stamp",
    ];
    for (const t of ALL_ADMIN_TASKS) tasks.add(t);
  } else if (role === "agent") {
    const AGENT_TASKS = [
      "requests.view", "requests.create", "requests.process",
      "requests.complete",
      "documents.view", "documents.validate",
      "appointments.view", "appointments.manage",
      "profiles.view",
    ];
    for (const t of AGENT_TASKS) tasks.add(t);
  } else {
    // viewer / unknown — read-only
    const VIEW_TASKS = [
      "requests.view", "documents.view",
      "appointments.view", "profiles.view",
      "analytics.view",
    ];
    for (const t of VIEW_TASKS) tasks.add(t);
  }

  return tasks;
}

/**
 * Check if a specific membership can perform a task code.
 *
 * @param taskCode e.g. "requests.validate", "team.manage"
 * @returns true if the task is in the member's resolved tasks
 */
export async function canDoTask(
  ctx: AuthContext,
  user: Doc<"users">,
  membership: Doc<"memberships"> | null | undefined,
  taskCode: string
): Promise<boolean> {
  // Superadmin always can
  if (isSuperAdmin(user)) return true;
  if (!membership) return false;

  // Check dynamic permissions first (per-member overrides)
  const dynamicResult = await checkDynamicPermission(
    ctx, membership._id, taskCode
  );
  if (dynamicResult === PermissionEffect.Deny) return false;
  if (dynamicResult === PermissionEffect.Grant) return true;

  // Resolve from position → modules → tasks
  const tasks = await getTasksForMembership(ctx, membership);
  return tasks.has(taskCode);
}

/**
 * Assert that a member can perform a task, throw if not.
 */
export async function assertCanDoTask(
  ctx: AuthContext,
  user: Doc<"users">,
  membership: Doc<"memberships"> | null | undefined,
  taskCode: string
): Promise<void> {
  const allowed = await canDoTask(ctx, user, membership, taskCode);
  if (!allowed) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

// ============================================
// High-Level Permission Functions
// ============================================

/**
 * Get user and their membership for an org
 */
export async function getPermissionContext(
  ctx: AuthContext,
  orgId?: Id<"orgs">
): Promise<PermissionContext> {
  const user = await requireAuth(ctx);
  const membership = orgId ? await getMembership(ctx, user._id, orgId) : undefined;
  return { user, membership: membership ?? undefined };
}

/**
 * Map legacy ResourceAction to task codes for backward compatibility.
 * This allows the old `requirePermission(ctx, orgId, "manage", entity, "requests")`
 * to resolve to the correct task code.
 */
function resolveTaskCode(
  action: ResourceAction,
  resource?: ResourceType
): string | null {
  if (!resource) return null;

  // Direct mapping: resource.action → task code
  const directMap: Record<string, string> = {
    // Requests
    "requests.view": "requests.view",
    "requests.create": "requests.create",
    "requests.process": "requests.process",
    "requests.validate": "requests.validate",
    "requests.assign": "requests.assign",
    "requests.delete": "requests.delete",
    "requests.complete": "requests.complete",
    "requests.manage": "requests.validate", // manage → validate level
    "requests.update": "requests.process",  // update → process level

    // Documents
    "documents.view": "documents.view",
    "documents.validate": "documents.validate",
    "documents.generate": "documents.generate",
    "documents.delete": "documents.delete",
    "documents.manage": "documents.validate",

    // Appointments
    "appointments.view": "appointments.view",
    "appointments.manage": "appointments.manage",
    "appointments.configure": "appointments.configure",
    "appointments.create": "appointments.manage",
    "appointments.update": "appointments.manage",
    "appointments.cancel": "appointments.manage",
    "appointments.reschedule": "appointments.manage",
    "appointments.delete": "appointments.configure",

    // Profiles
    "profiles.view": "profiles.view",
    "profiles.manage": "profiles.manage",
    "profiles.update": "profiles.manage",

    // Organizations
    "organizations.view": "settings.view",
    "organizations.manage": "settings.manage",
    "organizations.configure": "settings.manage",
    "organizations.update": "settings.manage",
    "organizations.delete": "settings.manage",

    // Services
    "services.view": "requests.view",
    "services.manage": "settings.manage",
    "services.configure": "settings.manage",
    "services.update": "settings.manage",

    // Users / Team
    "users.view": "team.view",
    "users.manage": "team.manage",
    "users.update": "team.manage",
    "users.delete": "team.manage",

    // Intelligence
    "intelligenceNotes.view": "intelligence.view",
    "intelligenceNotes.manage": "intelligence.manage",
    "intelligenceNotes.create": "intelligence.manage",
    "intelligenceNotes.update": "intelligence.manage",
    "intelligenceNotes.delete": "intelligence.manage",
  };

  const key = `${resource}.${action}`;
  return directMap[key] ?? null;
}

/**
 * Require permission for a specific action (backward-compatible API).
 * Now delegates to position-based task resolution internally.
 */
export async function requirePermission(
  ctx: AuthContext,
  orgId: Id<"orgs"> | undefined,
  action: ResourceAction,
  entity?: { userId?: Id<"users">; assignedTo?: Id<"users"> },
  resource?: ResourceType
): Promise<PermissionContext> {
  const { user, membership } = await getPermissionContext(ctx, orgId);

  // Superadmin bypass
  if (isSuperAdmin(user)) {
    return { user, membership };
  }

  // Owner / assigned-to bypass for certain actions
  if (entity?.userId && user._id === entity.userId) {
    if (["view", "update", "cancel"].includes(action)) {
      return { user, membership };
    }
  }
  if (entity?.assignedTo && user._id === entity.assignedTo) {
    if (["process", "complete", "update"].includes(action)) {
      return { user, membership };
    }
  }

  // Resolve the legacy action+resource into a task code
  const taskCode = resolveTaskCode(action, resource);
  if (taskCode) {
    await assertCanDoTask(ctx, user, membership ?? null, taskCode);
  } else {
    // For actions without a specific resource, fall back to generic check
    if (["manage", "configure", "delete"].includes(action)) {
      await assertCanDoTask(ctx, user, membership ?? null, "settings.manage");
    }
    // view / create without resource → permissive
  }

  return { user, membership };
}

// ============================================
// Dynamic Permissions (DB-driven overrides)
// ============================================

/**
 * Check if a dynamic permission entry exists in DB for a membership.
 * Returns the effect ("grant" | "deny") or null if no entry found.
 */
export async function checkDynamicPermission(
  ctx: AuthContext,
  membershipId: Id<"memberships">,
  permission: string
): Promise<string | null> {
  const entry = await ctx.db
    .query("permissions")
    .withIndex("by_membership_permission", (q) =>
      q.eq("membershipId", membershipId).eq("permission", permission)
    )
    .first();
  return entry?.effect ?? null;
}

/**
 * Check if a member has access to a specific feature.
 * Features have no hardcoded fallback — they must be explicitly granted.
 */
export async function hasFeature(
  ctx: AuthContext,
  user: Doc<"users">,
  membershipId: Id<"memberships"> | undefined,
  feature: string
): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  if (!membershipId) return false;
  const result = await checkDynamicPermission(ctx, membershipId, `feature.${feature}`);
  return result === PermissionEffect.Grant;
}

/**
 * Get all dynamic permission entries for a membership.
 */
export async function getDynamicPermissions(
  ctx: AuthContext,
  membershipId: Id<"memberships">
): Promise<Doc<"permissions">[]> {
  return await ctx.db
    .query("permissions")
    .withIndex("by_membership", (q) => q.eq("membershipId", membershipId))
    .collect();
}

// ============================================
// Synchronous Permission Check (preloaded data)
// ============================================

/**
 * Check permission using preloaded task set (for frontend queries).
 * Use when you've already resolved tasks via getTasksForMembership.
 */
export function hasPermissionSync(
  user: Doc<"users">,
  resolvedTasks: Set<string>,
  taskCode: string,
  dynamicPermissions?: Doc<"permissions">[]
): boolean {
  if (isSuperAdmin(user)) return true;

  // Check dynamic overrides
  if (dynamicPermissions) {
    const entry = dynamicPermissions.find((p) => p.permission === taskCode);
    if (entry?.effect === PermissionEffect.Deny) return false;
    if (entry?.effect === PermissionEffect.Grant) return true;
  }

  return resolvedTasks.has(taskCode);
}

/**
 * Backward-compatible `hasPermission` that translates resource.action → task code.
 */
export function hasPermission(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null | undefined,
  resource: ResourceType,
  action: ResourceAction,
  dynamicPermissions?: Doc<"permissions">[],
  resolvedTasks?: Set<string>
): boolean {
  if (isSuperAdmin(user)) return true;
  if (!membership) return false;

  const taskCode = resolveTaskCode(action, resource);
  if (!taskCode) return true; // Unknown combination → permissive

  // Check dynamic overrides
  if (dynamicPermissions) {
    const entry = dynamicPermissions.find((p) => p.permission === taskCode);
    if (entry?.effect === PermissionEffect.Deny) return false;
    if (entry?.effect === PermissionEffect.Grant) return true;
  }

  // If caller provided resolved tasks, use them
  if (resolvedTasks) {
    return resolvedTasks.has(taskCode);
  }

  // Without resolved tasks, fall back to role-based heuristic
  const role = membership.role;
  if (role === "admin") return true;
  if (role === "agent") {
    return ["view", "create", "process", "complete", "update", "reschedule", "cancel"].includes(action);
  }
  // viewer
  return ["view"].includes(action);
}
