import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { error, ErrorCode } from "./errors";
import { requireAuth, getMembership } from "./auth";
import { UserRole, MemberRole, PermissionEffect } from "./constants";

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
// Role Hierarchy - Which roles can do what
// ============================================

/**
 * Management-level roles (can manage org resources)
 */
const MANAGEMENT_ROLES: MemberRole[] = [
  MemberRole.Ambassador,
  MemberRole.ConsulGeneral,
  MemberRole.FirstCounselor,
  MemberRole.Consul,
  MemberRole.Admin,
];

/**
 * Processing-level roles (can process requests)
 */
const PROCESSING_ROLES: MemberRole[] = [
  ...MANAGEMENT_ROLES,
  MemberRole.ViceConsul,
  MemberRole.Chancellor,
  MemberRole.ConsularAffairsOfficer,
  MemberRole.ConsularAgent,
  MemberRole.SocialCounselor,
  MemberRole.Paymaster,
  MemberRole.FirstSecretary,
  MemberRole.Agent,
];

/**
 * Validation-level roles (can validate documents)
 */
const VALIDATION_ROLES: MemberRole[] = [
  ...MANAGEMENT_ROLES,
  MemberRole.ViceConsul,
  MemberRole.Chancellor,
  MemberRole.ConsularAffairsOfficer,
  MemberRole.SocialCounselor,
  MemberRole.Agent,
];

/**
 * View-only roles (can only view)
 */
const VIEW_ONLY_ROLES: MemberRole[] = [
  MemberRole.Intern,
  MemberRole.Viewer,
  MemberRole.Receptionist,
  MemberRole.EconomicCounselor,
  MemberRole.CommunicationCounselor,
];

// ============================================
// Permission Checks
// ============================================

/**
 * Check if user has platform-level superadmin access
 */
export function isSuperAdmin(user: Doc<"users">): boolean {
  return user.isSuperadmin === true || user.role === UserRole.SuperAdmin;
}

/**
 * Check if member has a management-level role
 */
export function canManage(membership: Doc<"memberships"> | null): boolean {
  if (!membership) return false;
  return MANAGEMENT_ROLES.includes(membership.role as MemberRole);
}

/**
 * Check if member can process requests
 */
export function canProcess(membership: Doc<"memberships"> | null): boolean {
  if (!membership) return false;
  return PROCESSING_ROLES.includes(membership.role as MemberRole);
}

/**
 * Check if member can validate documents
 */
export function canValidate(membership: Doc<"memberships"> | null): boolean {
  if (!membership) return false;
  return VALIDATION_ROLES.includes(membership.role as MemberRole);
}

/**
 * Check if member can only view (no actions)
 */
export function isViewOnly(membership: Doc<"memberships"> | null): boolean {
  if (!membership) return true;
  return VIEW_ONLY_ROLES.includes(membership.role as MemberRole);
}

// ============================================
// Permission Assertions (throw on failure)
// ============================================

export function assertCanManage(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null
): void {
  if (!isSuperAdmin(user) && !canManage(membership)) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

export function assertCanProcess(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null
): void {
  if (!isSuperAdmin(user) && !canProcess(membership)) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

export function assertCanValidate(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null
): void {
  if (!isSuperAdmin(user) && !canValidate(membership)) {
    throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

/**
 * Assert user owns a resource or can manage it
 */
export function assertOwnerOrManager(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null,
  ownerId: Id<"users"> | undefined
): void {
  if (user._id === ownerId) return;
  assertCanManage(user, membership);
}

/**
 * Assert user is assigned to a request or can manage it
 */
export function assertAssignedOrManager(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null,
  assignedTo: Id<"users"> | undefined
): void {
  if (user._id === assignedTo) return;
  assertCanManage(user, membership);
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
 * Require permission for a specific action
 * Main entry point for permission checks in mutations
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

  // Check dynamic permissions first (if membership exists)
  if (membership && resource) {
    const dynamicResult = await checkDynamicPermission(
      ctx, membership._id, `${resource}.${action}`
    );
    if (dynamicResult === PermissionEffect.Deny) {
      throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    if (dynamicResult === PermissionEffect.Grant) {
      return { user, membership };
    }
  }

  // Fall back to hardcoded role-based checks
  switch (action) {
    case "manage":
    case "configure":
    case "delete":
      assertCanManage(user, membership ?? null);
      break;

    case "process":
    case "complete":
    case "assign":
      if (entity?.assignedTo && user._id === entity.assignedTo) {
        // Assigned user can always process their own requests
      } else {
        assertCanProcess(user, membership ?? null);
      }
      break;

    case "validate":
    case "generate":
      assertCanValidate(user, membership ?? null);
      break;

    case "update":
      // For updates, check if user owns the resource or can manage
      if (entity?.userId && user._id === entity.userId) {
        // Owner can update
      } else if (entity?.assignedTo && user._id === entity.assignedTo) {
        // Assigned can update
      } else if (!canManage(membership ?? null)) {
        throw error(ErrorCode.INSUFFICIENT_PERMISSIONS);
      }
      break;

    case "view":
    case "create":
    case "reschedule":
    case "cancel":
      // Permissive by default - specific restrictions at query level
      break;
  }

  return { user, membership };
}

// ============================================
// Dynamic Permissions (DB-driven)
// Supplements the hardcoded role-based system
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
// Permission-Based Roles Configuration
// Used for fine-grained ABAC checks
// ============================================

/**
 * Check if member has specific custom permission
 * (stored in membership.permissions array)
 */
export function hasCustomPermission(
  membership: Doc<"memberships"> | null | undefined,
  permission: string
): boolean {
  if (!membership?.permissions) return false;
  return membership.permissions.includes(permission);
}

/**
 * Check permission with custom override
 * First checks explicit permissions, then falls back to role-based
 */
export function hasPermission(
  user: Doc<"users">,
  membership: Doc<"memberships"> | null | undefined,
  resource: ResourceType,
  action: ResourceAction,
  dynamicPermissions?: Doc<"permissions">[]
): boolean {
  // Superadmin bypass
  if (isSuperAdmin(user)) return true;

  // Check dynamic permissions (from preloaded data)
  if (dynamicPermissions && membership) {
    const permissionKey = `${resource}.${action}`;
    const entry = dynamicPermissions.find((p) => p.permission === permissionKey);
    if (entry?.effect === PermissionEffect.Deny) return false;
    if (entry?.effect === PermissionEffect.Grant) return true;
  }

  // Check custom permissions (legacy field on membership)
  const permissionKey = `${resource}.${action}`;
  if (hasCustomPermission(membership, permissionKey)) return true;

  // Fall back to role-based checks
  switch (action) {
    case "manage":
    case "configure":
    case "delete":
      return canManage(membership ?? null);
    case "process":
    case "complete":
    case "assign":
      return canProcess(membership ?? null);
    case "validate":
    case "generate":
      return canValidate(membership ?? null);
    default:
      return !isViewOnly(membership ?? null);
  }
}
