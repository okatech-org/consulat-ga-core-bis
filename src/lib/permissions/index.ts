/**
 * Permission Components
 *
 * Client-side permission guards for conditional rendering.
 * Uses the same permission logic as convex/lib/permissions.ts
 */

export type { DynamicPermission } from "./components";
export {
	FeatureGuard,
	hasFeature,
	hasMemberRole,
	hasPermission,
	hasRole,
	MemberRoleGuard,
	PermissionGuard,
	RoleGuard,
	SuperAdminGuard,
} from "./components";
