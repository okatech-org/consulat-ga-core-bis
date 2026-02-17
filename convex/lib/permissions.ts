import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
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
 *   membership.positionId → position.roleModuleCodes → roleModule.tasks
 *
 * No fallback. If no position or no modules → empty set → no access.
 */
export async function getTasksForMembership(
  ctx: AuthContext,
  membership: Doc<"memberships">,
): Promise<Set<string>> {
  const tasks = new Set<string>();

  if (!membership.positionId) return tasks;

  const position = await ctx.db.get(membership.positionId);
  if (!position || !position.isActive || !position.roleModuleCodes) {
    return tasks;
  }

  for (const moduleCode of position.roleModuleCodes) {
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

  return tasks;
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

  // Check dynamic special permissions first (per-member overrides)
  const dynamicResult = await checkDynamicPermission(
    ctx, membership._id, taskCode,
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
  taskCode: TaskCodeValue,
): Promise<void> {
  const allowed = await canDoTask(ctx, user, membership, taskCode);
  if (!allowed) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

// ============================================
// Dynamic Special Permissions (DB-driven overrides)
// ============================================

/**
 * Check if a dynamic permission entry exists in DB for a membership.
 * Returns the effect ("grant" | "deny") or null if no entry found.
 */
export async function checkDynamicPermission(
  ctx: AuthContext,
  membershipId: Id<"memberships">,
  permission: string,
): Promise<string | null> {
  const entry = await ctx.db
    .query("specialPermissions")
    .withIndex("by_membership_taskCode", (q) =>
      q.eq("membershipId", membershipId).eq("taskCode", permission as any),
    )
    .first();
  return entry?.effect ?? null;
}

/**
 * Check if a member has access to a specific feature.
 * Features must be explicitly granted — no fallback.
 */
export async function hasFeature(
  ctx: AuthContext,
  user: Doc<"users">,
  membershipId: Id<"memberships"> | undefined,
  feature: string,
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
  membershipId: Id<"memberships">,
): Promise<Doc<"specialPermissions">[]> {
  return await ctx.db
    .query("specialPermissions")
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
  taskCode: TaskCodeValue,
  dynamicPermissions?: Doc<"specialPermissions">[],
): boolean {
  if (isSuperAdmin(user)) return true;

  // Check dynamic overrides
  if (dynamicPermissions) {
    const entry = dynamicPermissions.find((p) => p.taskCode === taskCode);
    if (entry?.effect === PermissionEffect.Deny) return false;
    if (entry?.effect === PermissionEffect.Grant) return true;
  }

  return resolvedTasks.has(taskCode);
}
