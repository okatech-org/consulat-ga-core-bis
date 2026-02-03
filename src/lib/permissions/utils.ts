import type { UserRole } from "@convex/lib/constants";
import { ROLES } from "./roles";
import type { ResourceType, UserData } from "./types";

/**
 * Check if a user has permission to perform an action on a resource.
 *
 * @param user - The user performing the action
 * @param resource - The resource type (e.g., 'requests', 'documents')
 * @param action - The action to perform (e.g., 'view', 'update')
 * @param data - Optional entity data for dynamic permission checks
 * @returns boolean - true if permission is granted
 *
 * @example
 * // Static check (no entity)
 * hasPermission(user, 'services', 'view')
 *
 * // Dynamic check (with entity)
 * hasPermission(user, 'requests', 'update', request)
 */
export function hasPermission<Resource extends keyof ResourceType>(
	user: UserData | null | undefined,
	resource: Resource,
	action: ResourceType[Resource]["action"],
	data?: ResourceType[Resource]["dataType"],
): boolean {
	if (!user?.roles) return false;

	return (
		user.roles.some((role: UserRole) => {
			const roleConfig = ROLES[role];
			if (!roleConfig) return false;

			const resourceConfig = roleConfig[resource];
			if (!resourceConfig) return false;

			const permission = resourceConfig[action as keyof typeof resourceConfig];

			if (permission == null) return false;
			if (typeof permission === "boolean") return permission;

			// Dynamic permission check requires entity data
			if (data == null) return false;

			return (permission as (u: typeof user, d: typeof data) => boolean)(
				user,
				data,
			);
		}) ?? false
	);
}

/**
 * Assert that a user has permission, throwing an error if not.
 *
 * @throws Error if permission is denied
 */
export function assertPermission<Resource extends keyof ResourceType>(
	user: UserData | null | undefined,
	resource: Resource,
	action: ResourceType[Resource]["action"],
	data?: ResourceType[Resource]["dataType"],
): void {
	if (!hasPermission(user, resource, action, data)) {
		throw new Error(
			`Permission denied: ${String(action)} on ${String(resource)}`,
		);
	}
}

/**
 * Higher-order function to wrap async operations with permission checks.
 */
export function withPermission<Resource extends keyof ResourceType, T>(
	resource: Resource,
	action: ResourceType[Resource]["action"],
	callback: (
		user: UserData,
		data?: ResourceType[Resource]["dataType"],
	) => Promise<T>,
) {
	return async (
		user: UserData,
		data?: ResourceType[Resource]["dataType"],
	): Promise<T> => {
		assertPermission(user, resource, action, data);
		return callback(user, data);
	};
}

/**
 * Check if a user has a specific role.
 */
export function hasRole(
	user: UserData | null | undefined,
	role: UserRole,
): boolean {
	if (!user?.roles) return false;
	return user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles.
 */
export function hasAnyRole(
	user: UserData | null | undefined,
	roles: UserRole[],
): boolean {
	if (!user?.roles || !roles?.length) return false;
	return user.roles.some((role: UserRole) => roles.includes(role));
}

/**
 * Check if a user has all of the specified roles.
 */
export function hasAllRoles(
	user: UserData | null | undefined,
	roles: UserRole[],
): boolean {
	if (!user?.roles || !roles?.length) return false;
	return roles.every((role) => user.roles.includes(role));
}

/**
 * Get all permissions for a user on a specific resource.
 * Useful for UI to know which actions to show.
 */
export function getResourcePermissions<Resource extends keyof ResourceType>(
	user: UserData | null | undefined,
	resource: Resource,
	data?: ResourceType[Resource]["dataType"],
): Record<string, boolean> {
	if (!user?.roles) return {};

	const permissions: Record<string, boolean> = {};

	for (const role of user.roles) {
		const roleConfig = ROLES[role as UserRole];
		if (!roleConfig) continue;

		const resourceConfig = roleConfig[resource];
		if (!resourceConfig) continue;

		for (const [action, permission] of Object.entries(resourceConfig)) {
			// If already true from another role, skip
			if (permissions[action]) continue;

			if (typeof permission === "boolean") {
				permissions[action] = permission;
			} else if (data != null && typeof permission === "function") {
				permissions[action] = (
					permission as (u: typeof user, d: typeof data) => boolean
				)(user, data);
			}
		}
	}

	return permissions;
}
