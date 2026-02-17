import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { error, ErrorCode } from "./errors";
import { UserRole, PermissionEffect } from "./constants";
import type { TaskCodeValue } from "./taskCodes";

// ============================================
// Types
// ============================================

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
// Position-Based Task Resolution
// ============================================

/**
 * Resolve all task codes for a membership via:
 *   membership.positionId → position.tasks (stored directly in DB)
 *
 * Tasks are stored at creation time from presets. No runtime resolution needed.
 * No fallback. If no position or no tasks → empty set → no access.
 */
export async function getTasksForMembership(
  ctx: AuthContext,
  membership: Doc<"memberships">,
): Promise<Set<string>> {
  if (!membership.positionId) return new Set();

  const position = await ctx.db.get(membership.positionId);
  if (!position || !position.isActive || !position.tasks) {
    return new Set();
  }

  return new Set(position.tasks);
}

// ============================================
// Task-Based Authorization
// ============================================

/**
 * Check if a specific membership can perform a task code.
 *
 * Check order:
 * 1. SuperAdmin → always allowed
 * 2. No membership → denied
 * 3. Dynamic special permissions (deny takes precedence)
 * 4. Position → modules → tasks
 */
export async function canDoTask(
  ctx: AuthContext,
  user: Doc<"users">,
  membership: Doc<"memberships"> | null | undefined,
  taskCode: TaskCodeValue,
): Promise<boolean> {
  // SuperAdmin always can
  if (isSuperAdmin(user)) return true;
  if (!membership) return false;

  // Check inline special permissions first (per-member overrides)
  const overrideEffect = checkSpecialPermission(membership, taskCode);
  if (overrideEffect === PermissionEffect.Deny) return false;
  if (overrideEffect === PermissionEffect.Grant) return true;

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
  taskCode: TaskCodeValue,
): Promise<void> {
  const allowed = await canDoTask(ctx, user, membership, taskCode);
  if (!allowed) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

// ============================================
// Inline Special Permissions (per-member overrides)
// ============================================

/**
 * Check if a special permission entry exists on a membership.
 * Returns the effect ("grant" | "deny") or null if no entry found.
 */
export function checkSpecialPermission(
  membership: Doc<"memberships"> | null | undefined,
  taskCode: string,
): string | null {
  if (!membership?.specialPermissions?.length) return null;
  const entry = membership.specialPermissions.find((p) => p.taskCode === taskCode);
  return entry?.effect ?? null;
}

/**
 * Check if a member has access to a specific feature.
 * Features must be explicitly granted — no fallback.
 */
export function hasFeature(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null | undefined,
  feature: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (!membership) return false;
  return checkSpecialPermission(membership, `feature.${feature}`) === PermissionEffect.Grant;
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
  taskCode: TaskCodeValue,
  specialPermissions?: Array<{ taskCode: string; effect: string }>,
): boolean {
  if (isSuperAdmin(user)) return true;

  // Check inline overrides
  if (specialPermissions?.length) {
    const entry = specialPermissions.find((p) => p.taskCode === taskCode);
    if (entry?.effect === PermissionEffect.Deny) return false;
    if (entry?.effect === PermissionEffect.Grant) return true;
  }

  return resolvedTasks.has(taskCode);
}

