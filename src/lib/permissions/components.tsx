import type { Doc } from "@convex/_generated/dataModel";
import { MemberRole, UserRole } from "@convex/lib/constants";
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

type PermissionContext = {
	user: Doc<"users">;
	membership?: Doc<"memberships">;
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
 * Client-side permission check
 */
export function hasPermission(
	ctx: PermissionContext | null | undefined,
	action: ResourceAction,
	resource?: string,
): boolean {
	if (!ctx?.user) return false;

	// Superadmin bypass
	if (isSuperAdmin(ctx.user)) return true;

	// Check custom permissions first
	if (
		resource &&
		hasCustomPermission(ctx.membership, `${resource}.${action}`)
	) {
		return true;
	}

	// Fall back to role-based checks
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
