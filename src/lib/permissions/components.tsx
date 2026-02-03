import type { UserRole } from "@convex/lib/constants";
import type { ReactNode } from "react";
import type { ResourceType, UserData } from "./types";
import { hasAnyRole, hasPermission } from "./utils";

// ============================================
// Role Guard - Check user roles
// ============================================

type RoleGuardProps = {
	/** User to check permissions for */
	user: UserData | null | undefined;
	/** Roles that are allowed (user must have at least one) */
	roles: UserRole[];
	/** Content to render if permission is granted */
	children: ReactNode;
	/** Optional fallback content if permission is denied */
	fallback?: ReactNode;
};

/**
 * Conditionally render content based on user roles.
 *
 * @example
 * <RoleGuard user={user} roles={['admin', 'super_admin']}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
	user,
	roles,
	children,
	fallback = null,
}: Readonly<RoleGuardProps>): ReactNode {
	if (!hasAnyRole(user, roles)) {
		return fallback;
	}

	return children;
}

// ============================================
// Permission Guard - Check resource permissions
// ============================================

type PermissionGuardProps<Resource extends keyof ResourceType> = {
	/** User to check permissions for */
	user: UserData | null | undefined;
	/** Resource type (e.g., 'requests', 'documents') */
	resource: Resource;
	/** Action to check (e.g., 'view', 'update') */
	action: ResourceType[Resource]["action"];
	/** Optional entity data for dynamic checks */
	data?: ResourceType[Resource]["dataType"];
	/** Content to render if permission is granted */
	children: ReactNode;
	/** Optional fallback content if permission is denied */
	fallback?: ReactNode;
};

/**
 * Conditionally render content based on ABAC permissions.
 *
 * @example
 * // Static permission check
 * <PermissionGuard user={user} resource="services" action="create">
 *   <CreateServiceButton />
 * </PermissionGuard>
 *
 * // Dynamic permission check with entity
 * <PermissionGuard user={user} resource="requests" action="update" data={request}>
 *   <EditRequestButton />
 * </PermissionGuard>
 */
export function PermissionGuard<Resource extends keyof ResourceType>({
	user,
	resource,
	action,
	data,
	children,
	fallback = null,
}: Readonly<PermissionGuardProps<Resource>>): ReactNode {
	if (!hasPermission(user, resource, action, data)) {
		return fallback;
	}

	return children;
}

// ============================================
// Multi-Permission Guard - Check multiple permissions
// ============================================

type MultiPermissionGuardProps = {
	/** User to check permissions for */
	user: UserData | null | undefined;
	/** Array of permission checks (all must pass) */
	permissions: Array<{
		resource: keyof ResourceType;
		action: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any;
	}>;
	/** Content to render if all permissions are granted */
	children: ReactNode;
	/** Optional fallback content if any permission is denied */
	fallback?: ReactNode;
};

/**
 * Check multiple permissions at once (logical AND).
 *
 * @example
 * <MultiPermissionGuard
 *   user={user}
 *   permissions={[
 *     { resource: 'requests', action: 'view', data: request },
 *     { resource: 'documents', action: 'validate' },
 *   ]}
 * >
 *   <ValidateDocumentsPanel />
 * </MultiPermissionGuard>
 */
export function MultiPermissionGuard({
	user,
	permissions,
	children,
	fallback = null,
}: Readonly<MultiPermissionGuardProps>): ReactNode {
	const allGranted = permissions.every((perm) =>
		// @ts-expect-error - Dynamic resource/action types
		hasPermission(user, perm.resource, perm.action, perm.data),
	);

	if (!allGranted) {
		return fallback;
	}

	return children;
}
