import type { Doc } from "@convex/_generated/dataModel";
import type { UserRole } from "@convex/lib/constants";

/**
 * ABAC (Attribute-Based Access Control) Type System
 *
 * Each resource defines:
 * - dataType: The Convex document type
 * - action: Union of all possible actions on this resource
 *
 * Note: Resource names map to actual Convex table names.
 * Tables that don't exist yet use a generic type placeholder.
 */

export type ResourceType = {
	profiles: {
		dataType: Doc<"profiles">;
		action: "view" | "create" | "update" | "delete" | "validate";
	};
	requests: {
		dataType: Doc<"requests">;
		action:
			| "view"
			| "create"
			| "update"
			| "delete"
			| "process"
			| "validate"
			| "complete"
			| "assign";
	};
	documents: {
		dataType: Doc<"documents">;
		action: "view" | "create" | "update" | "delete" | "validate" | "generate";
	};
	// Note: Table is named "orgs" in the schema
	organizations: {
		dataType: Doc<"orgs">;
		action: "view" | "create" | "update" | "delete" | "manage";
	};
	services: {
		dataType: Doc<"services">;
		action: "view" | "create" | "update" | "delete" | "configure";
	};
	appointments: {
		dataType: Doc<"appointments">;
		action: "view" | "create" | "update" | "delete" | "reschedule" | "cancel";
	};
	users: {
		dataType: Doc<"users">;
		action: "view" | "create" | "update" | "delete" | "manage";
	};
	// Note: These tables will be created during migration
	childProfiles: {
		dataType: { _id: string; parentId: string; [key: string]: unknown };
		action: "view" | "create" | "update" | "delete";
	};
	intelligenceNotes: {
		dataType: { _id: string; authorId: string; [key: string]: unknown };
		action: "view" | "create" | "update" | "delete" | "viewHistory";
	};
};

/**
 * Permission can be:
 * - boolean: Static permission (true = always allowed, false = never allowed)
 * - function: Dynamic permission based on user and entity attributes
 */
export type PermissionCheck<Key extends keyof ResourceType> =
	| boolean
	| ((user: Doc<"users">, data: ResourceType[Key]["dataType"]) => boolean);

/**
 * Permissions for a single role, organized by resource
 */
export type RolePermissions = {
	[Key in keyof ResourceType]?: {
		[Action in ResourceType[Key]["action"]]?: PermissionCheck<Key>;
	};
};

/**
 * Complete roles configuration
 */
export type RolesConfig = {
	[R in UserRole]?: RolePermissions;
};

/**
 * User data type for permission checks
 * Extended from Doc<'users'> with computed fields
 */
export type UserData = Doc<"users"> & {
	roles: UserRole[];
	profileId?: string;
	organizationId?: string;
};
