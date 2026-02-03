/**
 * ABAC (Attribute-Based Access Control) Permission System
 *
 * This module provides a dynamic permission system where:
 * - Permissions can be static (boolean) or dynamic (function)
 * - Dynamic checks have access to both user and entity attributes
 * - Permissions are organized by resource and action
 *
 * @example
 * // Check permission in code
 * import { hasPermission } from '@/lib/permissions';
 *
 * if (hasPermission(user, 'requests', 'validate', request)) {
 *   // User can validate this request
 * }
 *
 * // Guard UI elements
 * import { PermissionGuard } from '@/lib/permissions';
 *
 * <PermissionGuard user={user} resource="requests" action="delete" data={request}>
 *   <DeleteButton />
 * </PermissionGuard>
 */

// React Components
export { MultiPermissionGuard, PermissionGuard, RoleGuard } from "./components";

// Roles Configuration
export { ROLES } from "./roles";
// Types
export type {
	PermissionCheck,
	ResourceType,
	RolePermissions,
	RolesConfig,
	UserData,
} from "./types";
// Utility Functions
export {
	assertPermission,
	getResourcePermissions,
	hasAllRoles,
	hasAnyRole,
	hasPermission,
	hasRole,
	withPermission,
} from "./utils";
