import type { Doc } from "@convex/_generated/dataModel";
import { MemberRole, PermissionEffect, UserRole } from "@convex/lib/constants";
import type { ReactNode } from "react";

// ============================================
// Types
// ============================================

type ResourceAction =
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
	| "configure";

/**
 * A single dynamic permission entry, as stored in the `permissions` table.
 */
export type DynamicPermission = {
	permission: string;
	effect: string; // "grant" | "deny"
};

type PermissionContext = {
	user: Doc<"users">;
	membership?: Doc<"memberships">;
	/** Dynamic permissions fetched from the DB for this membership */
	dynamicPermissions?: DynamicPermission[];
};

// ============================================
// Permission Logic (mirrors convex/lib/permissions.ts)
// ============================================

const MANAGEMENT_ROLES: MemberRole[] = [
	MemberRole.Ambassador,
	MemberRole.ConsulGeneral,
	MemberRole.FirstCounselor,
	MemberRole.Consul,
	MemberRole.Admin,
];

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

const VALIDATION_ROLES: MemberRole[] = [
	...MANAGEMENT_ROLES,
	MemberRole.ViceConsul,
	MemberRole.Chancellor,
	MemberRole.ConsularAffairsOfficer,
	MemberRole.SocialCounselor,
	MemberRole.Agent,
];

function isSuperAdmin(user: Doc<"users">): boolean {
	return user.isSuperadmin === true || user.role === UserRole.SuperAdmin;
}

function canManage(membership?: Doc<"memberships">): boolean {
	if (!membership) return false;
	return MANAGEMENT_ROLES.includes(membership.role as MemberRole);
}

function canProcess(membership?: Doc<"memberships">): boolean {
	if (!membership) return false;
	return PROCESSING_ROLES.includes(membership.role as MemberRole);
}

function canValidate(membership?: Doc<"memberships">): boolean {
	if (!membership) return false;
	return VALIDATION_ROLES.includes(membership.role as MemberRole);
}

function hasCustomPermission(
	membership?: Doc<"memberships">,
	permission?: string,
): boolean {
	if (!membership?.permissions || !permission) return false;
	return membership.permissions.includes(permission);
}

/**
 * Look up a specific permission key in dynamic permissions.
 * Returns the effect ("grant" | "deny") or null if not found.
 */
function checkDynamic(
	dynamicPermissions: DynamicPermission[] | undefined,
	key: string,
): string | null {
	if (!dynamicPermissions?.length) return null;
	const entry = dynamicPermissions.find((p) => p.permission === key);
	return entry?.effect ?? null;
}

/**
 * Client-side permission check.
 *
 * Check order (mirrors backend):
 * 1. SuperAdmin bypass
 * 2. Dynamic deny → blocked
 * 3. Dynamic grant → allowed
 * 4. Legacy membership.permissions
 * 5. Hardcoded role-based checks
 */
export function hasPermission(
	ctx: PermissionContext | null | undefined,
	action: ResourceAction,
	resource?: string,
): boolean {
	if (!ctx?.user) return false;

	// 1. Superadmin bypass
	if (isSuperAdmin(ctx.user)) return true;

	const permissionKey = resource ? `${resource}.${action}` : undefined;

	// 2-3. Dynamic permissions (deny takes precedence)
	if (permissionKey) {
		const dynamicEffect = checkDynamic(ctx.dynamicPermissions, permissionKey);
		if (dynamicEffect === PermissionEffect.Deny) return false;
		if (dynamicEffect === PermissionEffect.Grant) return true;
	}

	// 4. Legacy custom permissions on membership
	if (permissionKey && hasCustomPermission(ctx.membership, permissionKey)) {
		return true;
	}

	// 5. Fall back to role-based checks
	switch (action) {
		case "manage":
		case "configure":
		case "delete":
			return canManage(ctx.membership);
		case "process":
		case "complete":
		case "assign":
			return canProcess(ctx.membership);
		case "validate":
		case "generate":
			return canValidate(ctx.membership);
		default:
			return true; // view, create, update are permissive by default
	}
}

/**
 * Client-side feature permission check.
 * Features require an explicit "grant" in dynamic permissions;
 * there is no hardcoded fallback.
 */
export function hasFeature(
	ctx: PermissionContext | null | undefined,
	feature: string,
): boolean {
	if (!ctx?.user) return false;
	if (isSuperAdmin(ctx.user)) return true;

	const effect = checkDynamic(ctx.dynamicPermissions, `feature.${feature}`);
	return effect === PermissionEffect.Grant;
}

/**
 * Check if user has platform-level role
 */
export function hasRole(
	user: Doc<"users"> | null | undefined,
	roles: UserRole[],
): boolean {
	if (!user) return false;
	if (isSuperAdmin(user)) return true;
	return user.role ? roles.includes(user.role as UserRole) : false;
}

/**
 * Check if member has organization-level role
 */
export function hasMemberRole(
	membership: Doc<"memberships"> | null | undefined,
	roles: MemberRole[],
): boolean {
	if (!membership) return false;
	return roles.includes(membership.role as MemberRole);
}

// ============================================
// Role Guard - Platform-level roles
// ============================================

type RoleGuardProps = {
	user: Doc<"users"> | null | undefined;
	roles: UserRole[];
	children: ReactNode;
	fallback?: ReactNode;
};

export function RoleGuard({
	user,
	roles,
	children,
	fallback = null,
}: Readonly<RoleGuardProps>): ReactNode {
	if (!hasRole(user, roles)) {
		return fallback;
	}
	return children;
}

// ============================================
// Member Role Guard - Organization-level roles
// ============================================

type MemberRoleGuardProps = {
	membership: Doc<"memberships"> | null | undefined;
	roles: MemberRole[];
	children: ReactNode;
	fallback?: ReactNode;
};

export function MemberRoleGuard({
	membership,
	roles,
	children,
	fallback = null,
}: Readonly<MemberRoleGuardProps>): ReactNode {
	if (!hasMemberRole(membership, roles)) {
		return fallback;
	}
	return children;
}

// ============================================
// Permission Guard - Action-based permissions
// ============================================

type PermissionGuardProps = {
	ctx: PermissionContext | null | undefined;
	action: ResourceAction;
	resource?: string;
	children: ReactNode;
	fallback?: ReactNode;
};

export function PermissionGuard({
	ctx,
	action,
	resource,
	children,
	fallback = null,
}: Readonly<PermissionGuardProps>): ReactNode {
	if (!hasPermission(ctx, action, resource)) {
		return fallback;
	}
	return children;
}

// ============================================
// Feature Guard - Dynamic feature access
// ============================================

type FeatureGuardProps = {
	ctx: PermissionContext | null | undefined;
	feature: string;
	children: ReactNode;
	fallback?: ReactNode;
};

export function FeatureGuard({
	ctx,
	feature,
	children,
	fallback = null,
}: Readonly<FeatureGuardProps>): ReactNode {
	if (!hasFeature(ctx, feature)) {
		return fallback;
	}
	return children;
}

// ============================================
// Super Admin Guard
// ============================================

type SuperAdminGuardProps = {
	user: Doc<"users"> | null | undefined;
	children: ReactNode;
	fallback?: ReactNode;
};

export function SuperAdminGuard({
	user,
	children,
	fallback = null,
}: Readonly<SuperAdminGuardProps>): ReactNode {
	if (!user || !isSuperAdmin(user)) {
		return fallback;
	}
	return children;
}
