import type { RolesConfig } from "./types";

/**
 * ABAC Roles Configuration
 *
 * Each role defines permissions per resource.
 * Permissions can be:
 * - true: Always allowed
 * - false: Never allowed (can be omitted)
 * - (user, entity) => boolean: Dynamic check based on attributes
 *
 * Note: Dynamic checks reference the actual Convex schema fields.
 */
export const ROLES: RolesConfig = {
	// ============================================
	// SUPER ADMIN - Full access to everything
	// ============================================
	super_admin: {
		profiles: {
			view: true,
			create: true,
			update: true,
			delete: true,
			validate: true,
		},
		requests: {
			view: true,
			create: true,
			update: true,
			delete: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: {
			view: true,
			create: true,
			update: true,
			delete: true,
			validate: true,
			generate: true,
		},
		organizations: {
			view: true,
			create: true,
			update: true,
			delete: true,
			manage: true,
		},
		services: {
			view: true,
			create: true,
			update: true,
			delete: true,
			configure: true,
		},
		appointments: {
			view: true,
			create: true,
			update: true,
			delete: true,
			reschedule: true,
			cancel: true,
		},
		users: {
			view: true,
			create: true,
			update: true,
			delete: true,
			manage: true,
		},
		childProfiles: {
			view: true,
			create: true,
			update: true,
			delete: true,
		},
		intelligenceNotes: {
			view: true,
			create: true,
			update: true,
			delete: true,
			viewHistory: true,
		},
	},

	// ============================================
	// ADMIN - Organization-level management
	// ============================================
	admin: {
		profiles: {
			view: true,
			create: true,
			update: true,
			validate: true,
		},
		requests: {
			view: true,
			create: true,
			update: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: {
			view: true,
			create: true,
			update: true,
			validate: true,
			generate: true,
		},
		organizations: {
			view: true,
			update: true,
			manage: true,
		},
		services: {
			view: true,
			update: true,
			configure: true,
		},
		appointments: {
			view: true,
			create: true,
			update: true,
			reschedule: true,
			cancel: true,
		},
		users: {
			view: true,
			create: true,
			update: true,
			manage: true,
		},
		childProfiles: {
			view: true,
		},
		intelligenceNotes: {
			view: true,
			create: true,
			update: true,
			delete: true,
			viewHistory: true,
		},
	},

	// ============================================
	// MANAGER - Team supervision
	// ============================================
	manager: {
		profiles: {
			view: true,
			validate: true,
		},
		requests: {
			view: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: {
			view: true,
			validate: true,
		},
		organizations: {
			view: true,
		},
		services: {
			view: true,
		},
		appointments: {
			view: true,
			update: true,
			reschedule: true,
			cancel: true,
		},
		users: {
			view: true,
		},
		intelligenceNotes: {
			view: true,
			viewHistory: true,
		},
	},

	// ============================================
	// AGENT - Request processing
	// ============================================
	agent: {
		profiles: {
			view: true,
			validate: true,
		},
		requests: {
			view: true,
			// Can only process requests assigned to them
			process: (user, request) => request.assignedTo === user._id,
			update: (user, request) => request.assignedTo === user._id,
			validate: true,
			complete: (user, request) => request.assignedTo === user._id,
		},
		documents: {
			view: true,
			validate: true,
		},
		services: {
			view: true,
		},
		appointments: {
			view: true,
			update: true,
			reschedule: true,
		},
	},

	// ============================================
	// USER - Citizen / Public user
	// ============================================
	user: {
		profiles: {
			// Can only view/update their own profile
			view: (user, profile) => profile.userId === user._id,
			create: (user, profile) => profile.userId === user._id,
			update: (user, profile) => profile.userId === user._id,
		},
		requests: {
			// Can only view their own requests
			view: (user, request) => request.userId === user._id,
			create: true,
			// Can only update draft requests
			update: (user, request) =>
				request.userId === user._id && request.status === "draft",
		},
		documents: {
			// Can only manage their own documents
			view: (user, doc) => doc.ownerId === user._id,
			create: true,
			update: (user, doc) => doc.ownerId === user._id,
			delete: (user, doc) => doc.ownerId === user._id,
		},
		services: {
			view: true,
		},
		organizations: {
			view: true,
		},
		appointments: {
			view: true,
			create: true,
			reschedule: true,
			cancel: true,
		},
		childProfiles: {
			view: true,
			create: true,
			update: true,
		},
	},

	// ============================================
	// INTEL_AGENT - Intelligence operations
	// ============================================
	intel_agent: {
		profiles: {
			view: true,
		},
		intelligenceNotes: {
			view: true,
			create: true,
			// Can only update/delete their own notes
			update: (user, note) => note.authorId === user._id,
			delete: (user, note) => note.authorId === user._id,
			viewHistory: true,
		},
		documents: {
			view: true,
		},
	},

	// ============================================
	// EDUCATION_AGENT - Education services
	// ============================================
	education_agent: {
		profiles: {
			view: true,
		},
		organizations: {
			view: true,
		},
	},

	// ============================================
	// EMBASSY ROLES - Diplomatic hierarchy
	// ============================================

	// Niveau 1 - Chef de mission (full admin)
	ambassador: {
		profiles: { view: true, create: true, update: true, validate: true },
		requests: {
			view: true,
			create: true,
			update: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: {
			view: true,
			create: true,
			update: true,
			validate: true,
			generate: true,
		},
		organizations: { view: true, update: true, manage: true },
		services: { view: true, update: true, configure: true },
		appointments: {
			view: true,
			create: true,
			update: true,
			reschedule: true,
			cancel: true,
		},
		users: { view: true, create: true, update: true, manage: true },
		intelligenceNotes: {
			view: true,
			create: true,
			update: true,
			delete: true,
			viewHistory: true,
		},
	},

	// Niveau 2 - Premier Conseiller
	first_counselor: {
		profiles: { view: true, update: true, validate: true },
		requests: {
			view: true,
			update: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: { view: true, validate: true, generate: true },
		organizations: { view: true, update: true },
		services: { view: true, update: true },
		appointments: { view: true, update: true, reschedule: true, cancel: true },
		users: { view: true, update: true },
		intelligenceNotes: { view: true, viewHistory: true },
	},

	// Niveau 3 - Conseillers spécialisés
	paymaster: {
		profiles: { view: true },
		requests: { view: true, process: true, validate: true },
		documents: { view: true, validate: true },
		services: { view: true },
		appointments: { view: true },
	},

	economic_counselor: {
		profiles: { view: true },
		requests: { view: true, process: true },
		documents: { view: true },
		organizations: { view: true },
		services: { view: true },
	},

	social_counselor: {
		profiles: { view: true, update: true },
		requests: { view: true, process: true, validate: true },
		documents: { view: true, validate: true },
		services: { view: true },
		appointments: { view: true, create: true, update: true },
	},

	communication_counselor: {
		profiles: { view: true },
		organizations: { view: true },
		services: { view: true },
	},

	// Niveau 4 - Chancellerie et Secrétariat
	chancellor: {
		profiles: { view: true, validate: true },
		requests: { view: true, process: true, validate: true, complete: true },
		documents: { view: true, validate: true, generate: true },
		services: { view: true },
		appointments: { view: true, create: true, update: true, reschedule: true },
	},

	first_secretary: {
		profiles: { view: true },
		requests: { view: true, process: true },
		documents: { view: true, validate: true },
		services: { view: true },
		appointments: { view: true, create: true, update: true },
	},

	// Niveau 5 - Réception
	receptionist: {
		profiles: { view: true },
		requests: { view: true },
		services: { view: true },
		appointments: { view: true, create: true },
	},

	// ============================================
	// CONSULATE ROLES - Consular hierarchy
	// ============================================

	// Niveau 1 - Consul Général (full admin)
	consul_general: {
		profiles: { view: true, create: true, update: true, validate: true },
		requests: {
			view: true,
			create: true,
			update: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: {
			view: true,
			create: true,
			update: true,
			validate: true,
			generate: true,
		},
		organizations: { view: true, update: true, manage: true },
		services: { view: true, update: true, configure: true },
		appointments: {
			view: true,
			create: true,
			update: true,
			reschedule: true,
			cancel: true,
		},
		users: { view: true, create: true, update: true, manage: true },
		intelligenceNotes: {
			view: true,
			create: true,
			update: true,
			viewHistory: true,
		},
	},

	// Niveau 2 - Consul
	consul: {
		profiles: { view: true, update: true, validate: true },
		requests: {
			view: true,
			update: true,
			process: true,
			validate: true,
			complete: true,
			assign: true,
		},
		documents: { view: true, validate: true, generate: true },
		organizations: { view: true, update: true },
		services: { view: true, update: true },
		appointments: { view: true, update: true, reschedule: true, cancel: true },
		users: { view: true, update: true },
	},

	// Niveau 3 - Vice-Consul
	vice_consul: {
		profiles: { view: true, validate: true },
		requests: { view: true, process: true, validate: true, complete: true },
		documents: { view: true, validate: true, generate: true },
		services: { view: true },
		appointments: { view: true, update: true, reschedule: true },
	},

	// Niveau 4 - Chargé d'Affaires Consulaires
	consular_affairs_officer: {
		profiles: { view: true, validate: true },
		requests: {
			view: true,
			process: (user, request) => request.assignedTo === user._id,
			validate: true,
			complete: (user, request) => request.assignedTo === user._id,
		},
		documents: { view: true, validate: true },
		services: { view: true },
		appointments: { view: true, update: true },
	},

	// Niveau 5 - Agent Consulaire
	consular_agent: {
		profiles: { view: true },
		requests: {
			view: true,
			process: (user, request) => request.assignedTo === user._id,
			update: (user, request) => request.assignedTo === user._id,
		},
		documents: { view: true, validate: true },
		services: { view: true },
		appointments: { view: true, create: true },
	},

	// Niveau 6 - Stagiaire
	intern: {
		profiles: { view: true },
		requests: { view: true },
		documents: { view: true },
		services: { view: true },
		appointments: { view: true },
	},
};
