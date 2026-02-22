#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIGRATION SCRIPT: Legacy Convex (greedy-horse-339) → CORE Convex
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Reads the JSONL snapshot exported via `npx convex export` and transforms
 * + inserts all data into the new Convex instance.
 *
 * Prerequisites:
 *   1. `npx convex import --table _storage <snapshot_dir>/_storage` (done first)
 *   2. `source .env.local` to set VITE_CONVEX_URL and VITE_CONVEX_SITE_URL
 *
 * Usage:
 *   source .env.local && bun run scripts/migrate.ts [snapshot_dir] [--dry-run]
 *
 * Options:
 *   --dry-run     Parse and transform without inserting into Convex
 *   --skip-auth   Skip BetterAuth account creation (if already done)
 *   --only=TABLE  Only migrate a specific table (e.g. --only=users)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SNAPSHOT_DIR =
	process.argv[2] ??
	"docs/snapshot_greedy-horse-339_1771670266832270829";
const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_AUTH = process.argv.includes("--skip-auth");
const ONLY_TABLE = process.argv
	.find((a) => a.startsWith("--only="))
	?.split("=")[1];

const CONVEX_URL = process.env.VITE_CONVEX_URL;
const SITE_URL = process.env.VITE_CONVEX_SITE_URL;
const AUTH_API = SITE_URL ? `${SITE_URL}/api/auth` : "";

if (!CONVEX_URL) {
	console.error("❌ VITE_CONVEX_URL not set. Run: source .env.local");
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ═══════════════════════════════════════════════════════════════════════════
// ID MAPS — legacy _id → new _id
// ═══════════════════════════════════════════════════════════════════════════

const idMap = {
	users: new Map<string, string>(),
	orgs: new Map<string, string>(),
	profiles: new Map<string, string>(),
	documents: new Map<string, string>(),
	services: new Map<string, string>(),
	orgServices: new Map<string, string>(),
	memberships: new Map<string, string>(),
	positions: new Map<string, string>(),
	requests: new Map<string, string>(),
	appointments: new Map<string, string>(),
	childProfiles: new Map<string, string>(),
	storage: new Map<string, string>(), // legacy storageId → new storageId
};

// BetterAuth ID map: legacy email → betterAuth userId
const authIdMap = new Map<string, string>();

// Reverse maps: legacy userId ↔ legacy profileId
const userToProfile = new Map<string, string>();
const profileToUser = new Map<string, string>();

// Legacy record lookup maps (built from JSONL, used for document owner resolution)
const legacyChildProfileMap = new Map<string, Record<string, unknown>>();
const legacyRequestMap = new Map<string, Record<string, unknown>>();

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ID CONSTANTS (the only org and service we care about)
// ═══════════════════════════════════════════════════════════════════════════

// Consulat Général du Gabon en France
const LEGACY_CONSULAT_ORG_ID = "kd7dxpakad7ghnjpy1pec2ryzn7v6cx9";
const NEW_ORG_SLUG = "fr-consulat-paris";

// Inscription Consulaire service (the org-specific entry used by requests)
const LEGACY_INSCRIPTION_SERVICE_ID = "ks737fnbesbjy7kp1r00jw3ccn7v6wk5";
// Also the global catalog entry the user referenced
const LEGACY_INSCRIPTION_GLOBAL_SERVICE_ID = "ks78hqjery7mq0hpf9rjzx2pph7v64ww";

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP PRE-SEEDED ORG & SERVICE (replaces migrateOrgs/migrateServices)
// ═══════════════════════════════════════════════════════════════════════════

async function lookupPreSeededOrgAndService() {
	// Query the NEW Convex instance for the pre-seeded org
	const result = await client.query(api.migrations.lookupOrgBySlug, {
		slug: NEW_ORG_SLUG,
	});

	if (!result) {
		throw new Error(
			`❌ Pre-seeded org '${NEW_ORG_SLUG}' not found in new Convex instance. ` +
			`Run the CID seed first!`,
		);
	}

	const { orgId, orgName, registrationOrgServiceId } = result;
	console.log(`  ✅ Found org: ${orgName} → ${orgId}`);

	if (!registrationOrgServiceId) {
		throw new Error(
			`❌ No active registration orgService found for org '${orgName}'. ` +
			`Make sure the CID has created and activated the inscription consulaire service.`,
		);
	}
	console.log(`  ✅ Found registration orgService → ${registrationOrgServiceId}`);

	// Populate idMap so the rest of the migration can resolve references
	// Map ALL legacy org IDs to this single new org
	idMap.orgs.set(LEGACY_CONSULAT_ORG_ID, orgId);
	// Also map the other legacy org IDs we saw in the snapshot (some services were linked to a different org)
	// kd70kjhvz53r29qk28ep1aj4dh7v7f6h was the organizationId on the global service entry
	idMap.orgs.set("kd70kjhvz53r29qk28ep1aj4dh7v7f6h", orgId);

	// Map legacy service IDs to the new registration orgService
	idMap.orgServices.set(LEGACY_INSCRIPTION_SERVICE_ID, registrationOrgServiceId);
	idMap.orgServices.set(LEGACY_INSCRIPTION_GLOBAL_SERVICE_ID, registrationOrgServiceId);
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════

const stats = {
	read: {} as Record<string, number>,
	inserted: {} as Record<string, number>,
	skipped: {} as Record<string, number>,
	errors: {} as Record<string, string[]>,
};

function initStats(table: string) {
	stats.read[table] = 0;
	stats.inserted[table] = 0;
	stats.skipped[table] = 0;
	stats.errors[table] = [];
}

function logError(table: string, id: string, msg: string) {
	stats.errors[table]?.push(`${id}: ${msg}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// JSONL READER
// ═══════════════════════════════════════════════════════════════════════════

async function readJSONL<T = Record<string, unknown>>(
	table: string,
): Promise<T[]> {
	const filePath = path.resolve(SNAPSHOT_DIR, table, "documents.jsonl");
	if (!fs.existsSync(filePath)) {
		console.log(`  ⚠️  No data file for table "${table}"`);
		return [];
	}

	const results: T[] = [];
	const fileStream = fs.createReadStream(filePath);
	const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

	for await (const line of rl) {
		if (line.trim()) {
			try {
				results.push(JSON.parse(line) as T);
			} catch {
				console.error(`  ❌ Failed to parse line in ${table}: ${line.slice(0, 100)}`);
			}
		}
	}

	return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: resolve a legacy ID to a new ID (with fallback)
// ═══════════════════════════════════════════════════════════════════════════

function resolve(
	map: Map<string, string>,
	legacyId: string | undefined | null,
	context?: string,
): string | undefined {
	if (!legacyId) return undefined;
	const newId = map.get(legacyId);
	if (!newId && context) {
		console.log(`  ⚠️  Unresolved ID: ${legacyId} (${context})`);
	}
	return newId;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: CREATE BETTER AUTH ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════════

async function createBetterAuthAccounts(
	legacyUsers: Array<Record<string, unknown>>,
) {
	console.log("\n🔐 Step 2: Creating BetterAuth accounts...");
	initStats("betterAuth");

	if (!AUTH_API) {
		console.error("  ❌ VITE_CONVEX_SITE_URL not set, cannot create auth accounts");
		return;
	}

	for (const user of legacyUsers) {
		const email = user.email as string;
		const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email;
		stats.read["betterAuth"]!++;

		try {
			// Try sign-up first
			const res = await fetch(`${AUTH_API}/sign-up/email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password: crypto.randomUUID(), // Temporary password — user will reset
					name,
				}),
			});

			const data = (await res.json()) as {
				user?: { id: string };
				error?: { message: string };
			};

			if (data.user?.id) {
				authIdMap.set(email, data.user.id);
				stats.inserted["betterAuth"]!++;
			} else if (
				data.error?.message?.includes("already") ||
				res.status === 422
			) {
				// Already exists — try sign-in to get ID
				// We can't sign in because we don't know the password.
				// Instead, just note it. ensureUser will link by email on first login.
				console.log(`  ⏭️  ${email} already exists in BetterAuth`);
				stats.skipped["betterAuth"]!++;
			} else {
				logError("betterAuth", email, JSON.stringify(data));
			}
		} catch (err) {
			logError("betterAuth", email, String(err));
		}

		// Rate limiting — don't hammer the auth endpoint
		if (stats.read["betterAuth"]! % 50 === 0) {
			console.log(`  📊 Progress: ${stats.read["betterAuth"]} / ${legacyUsers.length}`);
			await new Promise((r) => setTimeout(r, 500));
		}
	}

	console.log(
		`  ✅ BetterAuth: ${stats.inserted["betterAuth"]} created, ${stats.skipped["betterAuth"]} skipped`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: MIGRATE USERS
// ═══════════════════════════════════════════════════════════════════════════

async function migrateUsers(legacyUsers: Array<Record<string, unknown>>) {
	console.log("\n👤 Step 3: Migrating users...");
	initStats("users");

	for (const user of legacyUsers) {
		stats.read["users"]!++;
		const legacyId = user._id as string;
		const email = user.email as string;

		// Determine platform-level role from legacy roles array
		const roles = (user.roles as string[]) ?? [];
		let role: string | undefined;
		if (roles.includes("SuperAdmin")) role = "super_admin";
		else if (roles.includes("IntelAgent")) role = "intel_agent";
		else if (roles.includes("EducationAgent")) role = "education_agent";

		// Get BetterAuth authId if available
		const authId =
			authIdMap.get(email) ?? `legacy_${legacyId}`;

		const payload = {
			authId,
			email,
			name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email,
			phone: (user.phoneNumber as string) ?? undefined,
			firstName: (user.firstName as string) ?? undefined,
			lastName: (user.lastName as string) ?? undefined,
			role: role ?? undefined,
			isActive: (user.status as string) === "active",
			isSuperadmin: role === "super_admin",
		};

		if (DRY_RUN) {
			idMap.users.set(legacyId, `dry_${legacyId}`);
			stats.inserted["users"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertUser,
				payload as never,
			);
			idMap.users.set(legacyId, newId as string);
			stats.inserted["users"]!++;
		} catch (err) {
			logError("users", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Users: ${stats.inserted["users"]} inserted, ${stats.errors["users"]?.length ?? 0} errors`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: MIGRATE ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function migrateOrgs(legacyOrgs: Array<Record<string, unknown>>) {
	console.log("\n🏛️  Step 4: Migrating organizations...");
	initStats("orgs");

	for (const org of legacyOrgs) {
		stats.read["orgs"]!++;
		const legacyId = org._id as string;

		// Map legacy organization type to new type
		const typeMap: Record<string, string> = {
			consulate: "general_consulate",
			general_consulate: "general_consulate",
			embassy: "embassy",
			honorary_consulate: "honorary_consulate",
		};

		const payload = {
			slug: (org.code as string)?.toLowerCase() ?? legacyId,
			name: org.name as string,
			type: typeMap[(org.type as string)] ?? "general_consulate",
			isActive: (org.status as string) === "active",
			jurisdictionCountries: (org.countryCodes as string[]) ?? [],
			email: undefined as string | undefined,
			phone: undefined as string | undefined,
		};

		if (DRY_RUN) {
			idMap.orgs.set(legacyId, `dry_${legacyId}`);
			stats.inserted["orgs"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertOrg,
				payload as never,
			);
			idMap.orgs.set(legacyId, newId as string);
			stats.inserted["orgs"]!++;
		} catch (err) {
			logError("orgs", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Orgs: ${stats.inserted["orgs"]} inserted`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: MIGRATE DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════

async function migrateDocuments(
	legacyDocs: Array<Record<string, unknown>>,
) {
	console.log("\n📄 Step 5: Migrating documents...");
	initStats("documents");

	for (const doc of legacyDocs) {
		stats.read["documents"]!++;
		const legacyId = doc._id as string;

		// Resolve ownerId based on ownerType
		const ownerType = doc.ownerType as string;
		let ownerId: string | undefined;

		if (ownerType === "profile") {
			ownerId = resolve(idMap.profiles, doc.ownerId as string, "doc owner profile");
			// Profiles may not be migrated yet — we'll do a second pass
			if (!ownerId) {
				// Try to find the user instead
				ownerId = resolve(idMap.users, doc.ownerId as string);
			}
		} else if (ownerType === "organization") {
			ownerId = resolve(idMap.orgs, doc.ownerId as string, "doc owner org");
		} else if (ownerType === "user") {
			ownerId = resolve(idMap.users, doc.ownerId as string, "doc owner user");
		} else if (ownerType === "child_profile") {
			// childProfile-owned → resolve to the parent's profile
			const childProfileId = doc.ownerId as string;
			const childData = legacyChildProfileMap.get(childProfileId);
			if (childData) {
				const parentUserId = childData.authorUserId as string;
				const parentProfileId = userToProfile.get(parentUserId);
				if (parentProfileId) {
					ownerId = resolve(idMap.profiles, parentProfileId, "doc child→parent profile");
				}
			}
			if (!ownerId) {
				logError("documents", legacyId, `Cannot resolve child_profile owner ${childProfileId} to parent profile`);
				stats.skipped["documents"]!++;
				continue;
			}
		} else if (ownerType === "request") {
			// request-owned → resolve to the requester's profile
			const requestId = doc.ownerId as string;
			const reqData = legacyRequestMap.get(requestId);
			if (reqData) {
				const reqProfileId = reqData.profileId as string ?? reqData.requesterId as string;
				if (reqProfileId) {
					ownerId = resolve(idMap.profiles, reqProfileId, "doc request→profile");
				}
			}
			if (!ownerId) {
				logError("documents", legacyId, `Cannot resolve request owner ${requestId} to profile`);
				stats.skipped["documents"]!++;
				continue;
			}
		} else {
			logError("documents", legacyId, `Unknown ownerType: ${ownerType}`);
			stats.skipped["documents"]!++;
			continue;
		}

		if (!ownerId) {
			logError("documents", legacyId, `Cannot resolve ownerId for ${ownerType}:${doc.ownerId}`);
			stats.skipped["documents"]!++;
			continue;
		}

		// Build files array from single-file legacy format
		const storageId = doc.storageId as string | undefined;
		const files = storageId
			? [
					{
						storageId: resolve(idMap.storage, storageId) ?? storageId,
						filename: (doc.fileName as string) ?? "unknown",
						mimeType: (doc.fileType as string) ?? "application/octet-stream",
						sizeBytes: (doc.fileSize as number) ?? 0,
						uploadedAt: (doc._creationTime as number) ?? Date.now(),
					},
				]
			: [];

		// Map document type to category
		const typeToCategory: Record<string, string> = {
			passport: "identity",
			identity_card: "identity",
			birth_certificate: "civil_status",
			marriage_certificate: "civil_status",
			death_certificate: "civil_status",
			proof_of_address: "residence",
			residence_permit: "residence",
			photo: "identity",
		};

		// Derive status from validations
		const validations = (doc.validations as Array<Record<string, unknown>>) ?? [];
		const lastValidation = validations[validations.length - 1];
		let status = "pending";
		if (lastValidation) {
			const vStatus = lastValidation.status as string;
			if (vStatus === "approved" || vStatus === "validated") status = "validated";
			else if (vStatus === "rejected") status = "rejected";
		}

		const payload = {
			ownerId,
			files,
			documentType: (doc.type as string) ?? undefined,
			category: typeToCategory[(doc.type as string)] ?? undefined,
			status,
			label: (doc.fileName as string) ?? undefined,
		};

		if (DRY_RUN) {
			idMap.documents.set(legacyId, `dry_${legacyId}`);
			stats.inserted["documents"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertDocument,
				payload as never,
			);
			idMap.documents.set(legacyId, newId as string);
			stats.inserted["documents"]!++;
		} catch (err) {
			logError("documents", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Documents: ${stats.inserted["documents"]} inserted, ${stats.skipped["documents"]} skipped`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6: MIGRATE SERVICES → services + orgServices
// ═══════════════════════════════════════════════════════════════════════════

async function migrateServices(
	legacyServices: Array<Record<string, unknown>>,
) {
	console.log("\n🔧 Step 6: Migrating services + orgServices...");
	initStats("services");
	initStats("orgServices");

	// Deduplicate services by code (since multiple orgs may have the same service)
	const servicesByCode = new Map<string, Record<string, unknown>>();
	// Map ALL legacy service IDs to their canonical code (for orgServices resolution)
	const serviceIdToCode = new Map<string, string>();
	for (const svc of legacyServices) {
		const code = svc.code as string;
		const legacyId = svc._id as string;
		serviceIdToCode.set(legacyId, code);
		if (!servicesByCode.has(code)) {
			servicesByCode.set(code, svc);
		}
	}

	// 1. Create global services catalog
	for (const [code, svc] of servicesByCode) {
		stats.read["services"]!++;
		const legacyId = svc._id as string;

		const payload = {
			slug: code.toLowerCase().replace(/_/g, "-"),
			code,
			name: { fr: svc.name as string, en: svc.name as string },
			description: {
				fr: (svc.description as string) ?? "",
				en: (svc.description as string) ?? "",
			},
			category: (svc.category as string) ?? "other",
			isActive: (svc.status as string) === "active",
		};

		if (DRY_RUN) {
			const dryId = `dry_${legacyId}`;
			idMap.services.set(legacyId, dryId);
			// Also map ALL legacy IDs with the same code
			for (const [altId, altCode] of serviceIdToCode) {
				if (altCode === code) {
					idMap.services.set(altId, dryId);
				}
			}
			stats.inserted["services"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertService,
				payload as never,
			);
			// Map the canonical ID
			idMap.services.set(legacyId, newId as string);
			// Also map ALL legacy IDs with the same code to this new service ID
			for (const [altId, altCode] of serviceIdToCode) {
				if (altCode === code) {
					idMap.services.set(altId, newId as string);
				}
			}
			stats.inserted["services"]!++;
		} catch (err) {
			logError("services", legacyId, String(err));
		}
	}

	// 2. Create orgServices for each legacy service (which was per-org)
	for (const svc of legacyServices) {
		stats.read["orgServices"]!++;
		const legacyId = svc._id as string;
		const orgId = resolve(
			idMap.orgs,
			svc.organizationId as string,
			"orgService org",
		);
		const serviceId = resolve(idMap.services, legacyId, "orgService service");

		if (!orgId || !serviceId) {
			stats.skipped["orgServices"]!++;
			continue;
		}

		const pricing = svc.pricing as Record<string, unknown> | undefined;

		const payload = {
			orgId,
			serviceId,
			isActive: (svc.status as string) === "active",
			pricing: pricing
				? {
						amount: (pricing.amount as number) ?? 0,
						currency: (pricing.currency as string) ?? "EUR",
						isFree: (pricing.isFree as boolean) ?? true,
					}
				: undefined,
		};

		if (DRY_RUN) {
			idMap.orgServices.set(legacyId, `dry_os_${legacyId}`);
			stats.inserted["orgServices"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertOrgService,
				payload as never,
			);
			idMap.orgServices.set(legacyId, newId as string);
			stats.inserted["orgServices"]!++;
		} catch (err) {
			logError("orgServices", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Services: ${stats.inserted["services"]} global, ${stats.inserted["orgServices"]} org-specific`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 7: MIGRATE PROFILES
// ═══════════════════════════════════════════════════════════════════════════

async function migrateProfiles(
	legacyProfiles: Array<Record<string, unknown>>,
) {
	console.log("\n📋 Step 7: Migrating profiles...");
	initStats("profiles");

	for (const profile of legacyProfiles) {
		stats.read["profiles"]!++;
		const legacyId = profile._id as string;

		// Resolve userId — profiles are tied to users via the users table's profileId
		const userId = resolve(idMap.users, profile.userId as string, "profile user");
		if (!userId) {
			logError("profiles", legacyId, "No userId resolved");
			stats.skipped["profiles"]!++;
			continue;
		}

		const personal = (profile.personal as Record<string, unknown>) ?? {};
		const contacts = (profile.contacts as Record<string, unknown>) ?? {};
		const family = (profile.family as Record<string, unknown>) ?? {};
		const profession = (profile.professionSituation as Record<string, unknown>) ?? {};
		const contactAddress = (contacts.address as Record<string, unknown>) ?? {};
		const passportInfos = (personal.passportInfos as Record<string, unknown>) ?? {};

		const payload = {
			userId,
			userType: "citizen",
			residenceCountry: (profile.residenceCountry as string) ?? undefined,

			// Identity (from personal)
			identity: {
				firstName: (personal.firstName as string) ?? "",
				lastName: (personal.lastName as string) ?? "",
				birthDate: (personal.birthDate as number) ?? undefined,
				birthPlace: (personal.birthPlace as string) ?? undefined,
				birthCountry: (personal.birthCountry as string) ?? undefined,
				gender: (personal.gender as string) ?? undefined,
				nationality: (personal.nationality as string) ?? undefined,
				nationalityAcquisition: (personal.acquisitionMode as string) ?? undefined,
			},

			// Passport
			passportInfo: passportInfos.number
				? {
						number: passportInfos.number as string,
						issueDate: (passportInfos.issueDate as number) ?? undefined,
						expiryDate: (passportInfos.expiryDate as number) ?? undefined,
						issueAuthority: (passportInfos.issueAuthority as string) ?? undefined,
					}
				: undefined,

			// Addresses
			addresses: contactAddress.street
				? [
						{
							type: "residence",
							street: (contactAddress.street as string) ?? "",
							city: (contactAddress.city as string) ?? "",
							postalCode: (contactAddress.postalCode as string) ?? "",
							country: (contactAddress.country as string) ?? "",
						},
					]
				: [],

			// Contacts
			contacts: {
				email: (contacts.email as string) ?? undefined,
				phone: (contacts.phone as string) ?? undefined,
			},

			// Family
			family: {
				maritalStatus: (family.maritalStatus as string) ?? undefined,
				father: family.father
					? {
							firstName: ((family.father as Record<string, unknown>).firstName as string) ?? "",
							lastName: ((family.father as Record<string, unknown>).lastName as string) ?? "",
						}
					: undefined,
				mother: family.mother
					? {
							firstName: ((family.mother as Record<string, unknown>).firstName as string) ?? "",
							lastName: ((family.mother as Record<string, unknown>).lastName as string) ?? "",
						}
					: undefined,
			},

			// Profession
			profession: {
				workStatus: (profession.workStatus as string) ?? undefined,
				profession: (profession.profession as string) ?? undefined,
				employer: (profession.employer as string) ?? undefined,
			},

			// Emergency contacts
			emergencyContacts: (
				(profile.emergencyContacts as Array<Record<string, unknown>>) ?? []
			).map((ec) => ({
				firstName: (ec.firstName as string) ?? "",
				lastName: (ec.lastName as string) ?? "",
				phoneNumber: (ec.phoneNumber as string) ?? undefined,
				email: (ec.email as string) ?? undefined,
				relationship: (ec.relationship as string) ?? undefined,
				type: (ec.type as string) ?? undefined,
			})),

			// Consular card
			consularCard: profile.consularCard
				? {
						cardNumber: ((profile.consularCard as Record<string, unknown>).cardNumber as string) ?? undefined,
						issuedAt: ((profile.consularCard as Record<string, unknown>).issuedAt as number) ?? undefined,
						expiresAt: ((profile.consularCard as Record<string, unknown>).expiresAt as number) ?? undefined,
					}
				: undefined,
		};

		if (DRY_RUN) {
			idMap.profiles.set(legacyId, `dry_${legacyId}`);
			stats.inserted["profiles"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertProfile,
				payload as never,
			);
			idMap.profiles.set(legacyId, newId as string);
			stats.inserted["profiles"]!++;
		} catch (err) {
			logError("profiles", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Profiles: ${stats.inserted["profiles"]} inserted, ${stats.skipped["profiles"]} skipped`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEPS 8-9: POSITIONS + MEMBERSHIPS
// ═══════════════════════════════════════════════════════════════════════════

// Default position templates per legacy role
const POSITION_TEMPLATES: Record<
	string,
	{ code: string; grade: string; level: number; title: { fr: string; en: string } }
> = {
	admin: {
		code: "admin",
		grade: "chief",
		level: 1,
		title: { fr: "Administrateur", en: "Administrator" },
	},
	manager: {
		code: "manager",
		grade: "counselor",
		level: 2,
		title: { fr: "Manager", en: "Manager" },
	},
	agent: {
		code: "consular_agent",
		grade: "agent",
		level: 3,
		title: { fr: "Agent Consulaire", en: "Consular Agent" },
	},
};

async function migratePositionsAndMemberships(
	legacyMemberships: Array<Record<string, unknown>>,
) {
	console.log("\n🎭 Steps 8-9: Migrating positions + memberships...");
	initStats("positions");
	initStats("memberships");

	// 1. Create positions per org
	const orgPositionKeys = new Set<string>();

	for (const membership of legacyMemberships) {
		const orgId = resolve(
			idMap.orgs,
			membership.organizationId as string,
			"membership org",
		);
		const role = membership.role as string;

		if (!orgId) continue;

		const template = POSITION_TEMPLATES[role];
		if (!template) continue; // super_admin, intel_agent, user → no position

		const key = `${orgId}:${template.code}`;
		if (orgPositionKeys.has(key)) continue;
		orgPositionKeys.add(key);

		stats.read["positions"]!++;

		if (DRY_RUN) {
			idMap.positions.set(key, `dry_pos_${key}`);
			stats.inserted["positions"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(api.migrations.insertPosition, {
				orgId,
				code: template.code,
				title: template.title,
				level: template.level,
				grade: template.grade,
				isActive: true,
			} as never);
			idMap.positions.set(key, newId as string);
			stats.inserted["positions"]!++;
		} catch (err) {
			logError("positions", key, String(err));
		}
	}

	// 2. Create memberships
	for (const membership of legacyMemberships) {
		stats.read["memberships"]!++;
		const legacyId = membership._id as string;
		const role = membership.role as string;

		// Platform-level roles → update user record, no membership
		if (["super_admin", "SuperAdmin"].includes(role)) {
			// Already handled during user migration
			stats.skipped["memberships"]!++;
			continue;
		}
		if (role === "user") {
			stats.skipped["memberships"]!++;
			continue;
		}

		const userId = resolve(
			idMap.users,
			membership.userId as string,
			"membership user",
		);
		const orgId = resolve(
			idMap.orgs,
			membership.organizationId as string,
			"membership org",
		);

		if (!userId || !orgId) {
			stats.skipped["memberships"]!++;
			continue;
		}

		// Find the position
		const template = POSITION_TEMPLATES[role];
		const positionKey = template ? `${orgId}:${template.code}` : "";
		const positionId = positionKey
			? resolve(idMap.positions, positionKey)
			: undefined;

		const payload = {
			userId,
			orgId,
			positionId: positionId ?? undefined,
		};

		if (DRY_RUN) {
			idMap.memberships.set(legacyId, `dry_${legacyId}`);
			stats.inserted["memberships"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertMembership,
				payload as never,
			);
			idMap.memberships.set(legacyId, newId as string);
			stats.inserted["memberships"]!++;
		} catch (err) {
			logError("memberships", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Positions: ${stats.inserted["positions"]}, Memberships: ${stats.inserted["memberships"]}`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 10: MIGRATE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════

async function migrateRequests(
	legacyRequests: Array<Record<string, unknown>>,
) {
	console.log("\n📨 Step 10: Migrating requests...");
	initStats("requests");

	for (const req of legacyRequests) {
		stats.read["requests"]!++;
		const legacyId = req._id as string;

		// Resolve references
		const profileId = resolve(
			idMap.profiles,
			req.profileId as string,
		);
		const orgId = resolve(idMap.orgs, req.organizationId as string);
		const orgServiceId = resolve(
			idMap.orgServices,
			req.serviceId as string,
		);

		// Find the user from profile→user reverse map
		// In legacy data, requesterId is actually a profile ID
		const requesterProfileId = req.requesterId as string | undefined;
		const legacyUserId = requesterProfileId
			? profileToUser.get(requesterProfileId)
			: undefined;
		const userId = legacyUserId
			? resolve(idMap.users, legacyUserId)
			: undefined;
		if (!userId || !orgId) {
			logError("requests", legacyId, `Missing userId (${req.requesterId}) or orgId (${req.organizationId})`);
			stats.skipped["requests"]!++;
			continue;
		}

		// Map legacy status to new status
		const statusMap: Record<string, string> = {
			submitted: "submitted",
			pending: "pending",
			in_review: "in_review",
			validated: "validated",
			document_in_production: "in_production",
			ready_for_pickup: "ready",
			completed: "completed",
			cancelled: "cancelled",
			rejected: "rejected",
		};

		const payload = {
			reference: (req.number as string) ?? `REQ-LEGACY-${legacyId.slice(-6)}`,
			userId,
			profileId: profileId ?? undefined,
			orgId,
			orgServiceId: orgServiceId ?? undefined,
			status: statusMap[(req.status as string)?.toLowerCase()] ?? "pending",
			priority: (req.priority as string) ?? "normal",
			formData: (req.formData as Record<string, unknown>) ?? {},
			metadata: (req.metadata as Record<string, unknown>) ?? {},
		};

		if (DRY_RUN) {
			idMap.requests.set(legacyId, `dry_${legacyId}`);
			stats.inserted["requests"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertRequest,
				payload as never,
			);
			idMap.requests.set(legacyId, newId as string);
			stats.inserted["requests"]!++;
		} catch (err) {
			logError("requests", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Requests: ${stats.inserted["requests"]} inserted, ${stats.skipped["requests"]} skipped`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 11: MIGRATE APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════

async function migrateAppointments(
	legacyAppointments: Array<Record<string, unknown>>,
) {
	console.log("\n📅 Step 11: Migrating appointments...");
	initStats("appointments");

	for (const apt of legacyAppointments) {
		stats.read["appointments"]!++;
		const legacyId = apt._id as string;

		const orgId = resolve(
			idMap.orgs,
			apt.organizationId as string,
			"appointment org",
		);
		const orgServiceId = resolve(
			idMap.orgServices,
			apt.serviceId as string,
		);

		// Extract attendee from participants
		const participants =
			(apt.participants as Array<Record<string, unknown>>) ?? [];
		const attendee = participants.find((p) => p.role === "attendee");
		const agent = participants.find((p) => p.role === "agent");

		// We need to find the attendee's profile
		let attendeeProfileId: string | undefined;
		if (attendee?.id) {
			attendeeProfileId = resolve(idMap.profiles, attendee.id as string);
		}

		if (!orgId || !attendeeProfileId) {
			logError("appointments", legacyId, "Missing orgId or attendeeProfileId");
			stats.skipped["appointments"]!++;
			continue;
		}

		// Convert timestamps to date/time strings
		const startAt = apt.startAt as number;
		const endAt = apt.endAt as number;
		const startDate = new Date(startAt);
		const endDate = endAt ? new Date(endAt) : undefined;

		const payload = {
			orgId,
			attendeeProfileId,
			orgServiceId: orgServiceId ?? undefined,
			agentId: agent?.id
				? resolve(idMap.memberships, agent.id as string)
				: undefined,
			requestId: apt.requestId
				? resolve(idMap.requests, apt.requestId as string)
				: undefined,
			date: startDate.toISOString().split("T")[0]!, // YYYY-MM-DD
			time: startDate.toTimeString().slice(0, 5), // HH:mm
			endTime: endDate?.toTimeString().slice(0, 5),
			status: (apt.status as string) ?? "confirmed",
			appointmentType: (apt.type as string) === "document_collection"
				? "pickup"
				: "deposit",
		};

		if (DRY_RUN) {
			idMap.appointments.set(legacyId, `dry_${legacyId}`);
			stats.inserted["appointments"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertAppointment,
				payload as never,
			);
			idMap.appointments.set(legacyId, newId as string);
			stats.inserted["appointments"]!++;
		} catch (err) {
			logError("appointments", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Appointments: ${stats.inserted["appointments"]} inserted`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 13: MIGRATE CHILD PROFILES
// ═══════════════════════════════════════════════════════════════════════════

async function migrateChildProfiles(
	legacyChildren: Array<Record<string, unknown>>,
) {
	console.log("\n👶 Step 13: Migrating child profiles...");
	initStats("childProfiles");

	for (const child of legacyChildren) {
		stats.read["childProfiles"]!++;
		const legacyId = child._id as string;

		const authorUserId = resolve(
			idMap.users,
			child.authorUserId as string,
			"child author",
		);

		if (!authorUserId) {
			stats.skipped["childProfiles"]!++;
			continue;
		}

		const personal = (child.personal as Record<string, unknown>) ?? {};
		const passportInfos = (personal.passportInfos as Record<string, unknown>) ?? {};

		// Map parents
		const parents = (
			(child.parents as Array<Record<string, unknown>>) ?? []
		).map((p) => ({
			profileId: p.profileId
				? resolve(idMap.profiles, p.profileId as string)
				: undefined,
			role: (p.role as string) ?? "parent",
			firstName: (p.firstName as string) ?? "",
			lastName: (p.lastName as string) ?? "",
			email: (p.email as string) ?? undefined,
			phone: (p.phoneNumber as string) ?? undefined,
		}));

		const payload = {
			authorUserId,
			status: (child.status as string) ?? "draft",
			identity: {
				firstName: (personal.firstName as string) ?? "",
				lastName: (personal.lastName as string) ?? "",
				birthDate: (personal.birthDate as number) ?? undefined,
				birthPlace: (personal.birthPlace as string) ?? undefined,
				birthCountry: (personal.birthCountry as string) ?? undefined,
				gender: (personal.gender as string) ?? undefined,
				nationality: (personal.nationality as string) ?? undefined,
				nationalityAcquisition: (personal.acquisitionMode as string) ?? undefined,
			},
			passportInfo: passportInfos.number
				? {
						number: passportInfos.number as string,
						issueDate: (passportInfos.issueDate as number) ?? undefined,
						expiryDate: (passportInfos.expiryDate as number) ?? undefined,
						issueAuthority: (passportInfos.issueAuthority as string) ?? undefined,
					}
				: undefined,
			parents,
			registrationRequestId: child.registrationRequest
				? resolve(idMap.requests, child.registrationRequest as string)
				: undefined,
		};

		if (DRY_RUN) {
			idMap.childProfiles.set(legacyId, `dry_${legacyId}`);
			stats.inserted["childProfiles"]!++;
			continue;
		}

		try {
			const newId = await client.mutation(
				api.migrations.insertChildProfile,
				payload as never,
			);
			idMap.childProfiles.set(legacyId, newId as string);
			stats.inserted["childProfiles"]!++;
		} catch (err) {
			logError("childProfiles", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Child profiles: ${stats.inserted["childProfiles"]} inserted`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 14: MIGRATE CONSULAR REGISTRATIONS (profiles with card numbers)
// ═══════════════════════════════════════════════════════════════════════════

async function migrateConsularRegistrations(
	legacyProfiles: Array<Record<string, unknown>>,
) {
	console.log("\n🪪 Step 14: Creating consular registrations for profiles with card numbers...");
	initStats("consularRegistrations");

	for (const profile of legacyProfiles) {
		const legacyId = profile._id as string;
		const cc = profile.consularCard as Record<string, unknown> | undefined;
		if (!cc || !cc.cardNumber) continue;

		stats.read["consularRegistrations"]!++;

		const newProfileId = resolve(idMap.profiles, legacyId, "consReg profile");
		if (!newProfileId) {
			stats.skipped["consularRegistrations"]!++;
			continue;
		}

		// Find which org this profile is registered to
		// Use registeredToOrgId from the profile, or fall back to the first org
		const legacyOrgId = profile.registeredToOrgId as string | undefined;
		const orgId = legacyOrgId
			? resolve(idMap.orgs, legacyOrgId, "consReg org")
			: idMap.orgs.values().next().value; // fallback to first org

		if (!orgId) {
			logError("consularRegistrations", legacyId, "No org resolved");
			stats.skipped["consularRegistrations"]!++;
			continue;
		}

		const cardNumber = cc.cardNumber as string;
		const cardIssuedAt = cc.issuedAt as number | undefined;
		const cardExpiresAt = cc.expiresAt as number | undefined;
		const isExpired = cardExpiresAt ? cardExpiresAt < Date.now() : false;

		const payload = {
			profileId: newProfileId,
			orgId,
			type: "inscription",
			status: isExpired ? "expired" : "active",
			duration: "long_stay",
			registeredAt: cardIssuedAt ?? (profile._creationTime as number) ?? Date.now(),
			activatedAt: cardIssuedAt,
			expiresAt: cardExpiresAt,
			cardNumber,
			cardIssuedAt,
			cardExpiresAt,
		};

		if (DRY_RUN) {
			stats.inserted["consularRegistrations"]!++;
			continue;
		}

		try {
			await client.mutation(
				api.migrations.insertConsularRegistration,
				payload as never,
			);
			stats.inserted["consularRegistrations"]!++;
		} catch (err) {
			logError("consularRegistrations", legacyId, String(err));
		}
	}

	console.log(
		`  ✅ Consular Registrations: ${stats.inserted["consularRegistrations"]} created`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 16: GENERATE UPDATED LEGACY PROFILES MAP
// ═══════════════════════════════════════════════════════════════════════════

async function generateLegacyProfilesMap(
	legacyProfiles: Array<Record<string, unknown>>,
) {
	console.log("\n🗺️  Step 16: Generating updated legacyProfilesMap...");

	// Build set of legacy profile IDs that have a consular card
	const profilesWithCard = new Set<string>();
	for (const profile of legacyProfiles) {
		const cc = profile.consularCard as Record<string, unknown> | undefined;
		if (cc && cc.cardNumber) {
			profilesWithCard.add(profile._id as string);
		}
	}
	console.log(`  🪪 ${profilesWithCard.size} profiles have consular cards`);

	// Read the existing map to get old CMS ID → old Convex profile ID entries
	const existingMapPath = path.resolve("convex/lib/legacyProfilesMap.ts");
	const existingContent = fs.readFileSync(existingMapPath, "utf-8");

	// Parse existing entries: extract key-value pairs
	const existingEntries = new Map<string, string>();
	const regex = /\s+'?([^':\s]+)'?:\s+'([^']+)'/g;
	let match;
	while ((match = regex.exec(existingContent)) !== null) {
		existingEntries.set(match[1]!, match[2]!);
	}
	console.log(`  📖 Parsed ${existingEntries.size} existing CMS entries`);

	// Build new map entries — only for profiles with consular cards
	const newMap = new Map<string, string>();

	// 1. Update existing CMS entries: old CMS ID → new Convex profile ID
	//    Only keep entries whose old Convex ID corresponds to a card-holding profile
	let updatedFromExisting = 0;
	for (const [cmsId, oldConvexId] of existingEntries) {
		if (!profilesWithCard.has(oldConvexId)) continue; // skip non-card profiles
		const newId = idMap.profiles.get(oldConvexId);
		if (newId) {
			newMap.set(cmsId, newId);
			updatedFromExisting++;
		}
	}
	console.log(`  🔄 ${updatedFromExisting} CMS entries kept (card holders only)`);

	// 2. Add old Convex profile IDs → new Convex profile IDs (card holders only)
	let addedConvexMappings = 0;
	for (const oldConvexId of profilesWithCard) {
		const newConvexId = idMap.profiles.get(oldConvexId);
		if (newConvexId && !newMap.has(oldConvexId)) {
			newMap.set(oldConvexId, newConvexId);
			addedConvexMappings++;
		}
	}
	console.log(`  ➕ ${addedConvexMappings} old Convex ID entries added`);

	// Write the file
	const lines = Array.from(newMap.entries())
		.map(([key, value]) => `  '${key}': '${value}',`)
		.join("\n");

	const output = `export const legacyProfiles: Record<string, string> = {\n${lines}\n};\n`;

	if (DRY_RUN) {
		console.log(`  🔍 Would write ${newMap.size} entries to ${existingMapPath}`);
	} else {
		fs.writeFileSync(existingMapPath, output, "utf-8");
		console.log(`  ✅ Wrote ${newMap.size} entries to ${existingMapPath}`);
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 15: TRIGGER PASSWORD RESET EMAILS
// ═══════════════════════════════════════════════════════════════════════════

async function triggerPasswordResets(
	legacyUsers: Array<Record<string, unknown>>,
) {
	console.log("\n📧 Step 15: Triggering password reset emails...");
	initStats("passwordResets");

	if (!AUTH_API) {
		console.log("  ⏭️  Skipping (no AUTH_API)");
		return;
	}

	for (const user of legacyUsers) {
		const email = user.email as string;
		stats.read["passwordResets"]!++;

		try {
			const res = await fetch(`${AUTH_API}/forget-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, redirectTo: "/reset-password" }),
			});

			if (res.ok) {
				stats.inserted["passwordResets"]!++;
			} else {
				logError("passwordResets", email, `HTTP ${res.status}`);
			}
		} catch (err) {
			logError("passwordResets", email, String(err));
		}

		// Rate limit
		if (stats.read["passwordResets"]! % 20 === 0) {
			await new Promise((r) => setTimeout(r, 1000));
		}
	}

	console.log(
		`  ✅ Password resets: ${stats.inserted["passwordResets"]} sent`,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
	console.log("═══════════════════════════════════════════════════════════");
	console.log("  MIGRATION: Legacy Convex → CORE Convex");
	console.log("═══════════════════════════════════════════════════════════");
	console.log(`  Snapshot: ${SNAPSHOT_DIR}`);
	console.log(`  Convex:   ${CONVEX_URL}`);
	console.log(`  Auth:     ${AUTH_API || "N/A"}`);
	console.log(`  Mode:     ${DRY_RUN ? "🔍 DRY RUN" : "🚀 LIVE"}`);
	if (ONLY_TABLE) console.log(`  Only:     ${ONLY_TABLE}`);
	console.log("═══════════════════════════════════════════════════════════\n");

	const shouldRun = (table: string) => !ONLY_TABLE || ONLY_TABLE === table;

	// ─── Read all JSONL data ───────────────────────────────────────────
	console.log("📖 Reading snapshot data...");
	const legacyUsers = await readJSONL("users");
	const legacyOrgs = await readJSONL("organizations");
	const legacyProfiles = await readJSONL("profiles");
	const legacyDocs = await readJSONL("documents");
	const legacyServices = await readJSONL("services");
	const legacyMemberships = await readJSONL("memberships");
	const legacyRequests = await readJSONL("requests");
	const legacyAppointments = await readJSONL("appointments");
	const legacyChildProfiles = await readJSONL("childProfiles");

	console.log(`  📊 Loaded: ${legacyUsers.length} users, ${legacyOrgs.length} orgs, ${legacyProfiles.length} profiles`);
	console.log(`  📊 Loaded: ${legacyDocs.length} documents, ${legacyServices.length} services, ${legacyMemberships.length} memberships`);
	console.log(`  📊 Loaded: ${legacyRequests.length} requests, ${legacyAppointments.length} appointments, ${legacyChildProfiles.length} childProfiles`);

	// ─── Build user→profile reverse map (legacy profiles have userId field) ──
	// Legacy users have profileId pointing to profiles
	for (const user of legacyUsers) {
		if (user.profileId) {
			userToProfile.set(user._id as string, user.profileId as string);
		}
	}
	for (const [userId, profileId] of userToProfile) {
		profileToUser.set(profileId, userId);
	}
	// Inject userId into legacy profiles that don't have it
	for (const profile of legacyProfiles) {
		if (!profile.userId) {
			const userId = profileToUser.get(profile._id as string);
			if (userId) {
				profile.userId = userId;
			}
		}
	}

	// Build legacy lookup maps for document owner resolution
	for (const cp of legacyChildProfiles) {
		legacyChildProfileMap.set(cp._id as string, cp);
	}
	for (const req of legacyRequests) {
		legacyRequestMap.set(req._id as string, req);
	}

	// ─── Execute migration steps ──────────────────────────────────────

	// Step 1: _storage import (done manually via `npx convex import`)
	console.log("\n📦 Step 1: _storage import — done manually (npx convex import)");

	// Step 2: BetterAuth accounts
	if (shouldRun("users") && !SKIP_AUTH) {
		await createBetterAuthAccounts(legacyUsers);
	}

	// Step 3: Users
	if (shouldRun("users")) {
		await migrateUsers(legacyUsers);
	}

	// Step 4: Lookup pre-seeded org + orgService (instead of migrating orgs/services)
	console.log("\n🏛️  Step 4: Looking up pre-seeded org & registration service...");
	await lookupPreSeededOrgAndService();

	// Step 5: SKIPPED — services are pre-seeded by CID
	console.log("\n🔧 Step 5: Services — SKIPPED (pre-seeded by CID)");

	// Step 6: Profiles (before documents so profile IDs are available)
	if (shouldRun("profiles")) {
		await migrateProfiles(legacyProfiles);
	}

	// Steps 7-8: Positions + Memberships (only Consulat Général)
	if (shouldRun("memberships")) {
		// Filter memberships to only Consulat Général
		const consulatMemberships = legacyMemberships.filter(
			(m) => (m.organizationId as string) === LEGACY_CONSULAT_ORG_ID,
		);
		console.log(`  📋 Filtered: ${consulatMemberships.length}/${legacyMemberships.length} memberships (Consulat Général only)`);
		await migratePositionsAndMemberships(consulatMemberships);
	}

	// Step 9: Documents (after profiles, so ownerId can resolve to profiles)
	if (shouldRun("documents")) {
		await migrateDocuments(legacyDocs);
	}

	// Step 10: Requests (only inscription consulaire)
	if (shouldRun("requests")) {
		const inscriptionRequests = legacyRequests.filter(
			(r) => (r.serviceId as string) === LEGACY_INSCRIPTION_SERVICE_ID,
		);
		console.log(`  📋 Filtered: ${inscriptionRequests.length}/${legacyRequests.length} requests (inscription consulaire only)`);
		await migrateRequests(inscriptionRequests);
	}

	// Step 11: Appointments
	if (shouldRun("appointments")) {
		await migrateAppointments(legacyAppointments);
	}

	// Step 13: Child profiles
	if (shouldRun("childProfiles")) {
		await migrateChildProfiles(legacyChildProfiles);
	}

	// Step 14: Consular registrations (profiles with card numbers)
	if (shouldRun("profiles")) {
		await migrateConsularRegistrations(legacyProfiles);
	}

	// Step 16: Generate updated legacy profiles map
	if (!ONLY_TABLE) {
		await generateLegacyProfilesMap(legacyProfiles);
	}

	// Step 15: Password resets (only in live mode)
	if (shouldRun("users") && !DRY_RUN && !SKIP_AUTH) {
		await triggerPasswordResets(legacyUsers);
	}

	// ─── Final Summary ────────────────────────────────────────────────
	console.log("\n═══════════════════════════════════════════════════════════");
	console.log("  MIGRATION SUMMARY");
	console.log("═══════════════════════════════════════════════════════════");

	for (const table of Object.keys(stats.read)) {
		const errors = stats.errors[table] ?? [];
		const line = `  ${table.padEnd(20)} read=${stats.read[table]} inserted=${stats.inserted[table]} skipped=${stats.skipped[table]} errors=${errors.length}`;
		console.log(line);
		if (errors.length > 0 && errors.length <= 5) {
			for (const err of errors) {
				console.log(`    ⚠️  ${err}`);
			}
		} else if (errors.length > 5) {
			for (const err of errors.slice(0, 3)) {
				console.log(`    ⚠️  ${err}`);
			}
			console.log(`    ... and ${errors.length - 3} more`);
		}
	}

	console.log("\n✅ Migration complete!");
}

main().catch((err) => {
	console.error("💥 Migration failed:", err);
	process.exit(1);
});
