#!/usr/bin/env bun
/**
 * generate-import.ts — Generate a COMPLETE Convex-importable snapshot
 *
 * ONE-SHOT import: seeds + legacy migration + staff + Better Auth, all in one ZIP.
 *
 * Reads:
 *   - DEV snapshot  → seed tables (orgs, services, orgServices, positions, ministryGroups)
 *   - LEGACY snapshot → migration data (users, profiles, documents, requests, etc.)
 *   - staffAccounts.ts → staff user definitions
 *
 * Outputs a directory that can be zipped and imported via:
 *   cd docs/migration-import && zip -r ../migration-import.zip *
 *   npx convex import --replace docs/migration-import.zip --prod -y
 *
 * Usage:
 *   bun run scripts/generate-import.ts <legacy-snapshot-dir> <dev-snapshot-dir> [output-dir]
 */

import fs from "fs";
import path from "path";


// ─── Config ────────────────────────────────────────────────────────────────

const LEGACY_DIR = process.argv[2];
const DEV_DIR = process.argv[3];
const OUTPUT_DIR = process.argv[4] ?? "docs/migration-import";

if (!LEGACY_DIR || !DEV_DIR) {
	console.error("Usage: bun run scripts/generate-import.ts <legacy-snapshot-dir> <dev-snapshot-dir> [output-dir]");
	process.exit(1);
}

// Legacy constants
const LEGACY_CONSULAT_ORG_ID = "kd7dxpakad7ghnjpy1pec2ryzn7v6cx9";
const LEGACY_INSCRIPTION_SERVICE_ID = "ks737fnbesbjy7kp1r00jw3ccn7v6wk5";
const CONSULAT_SLUG = "fr-consulat-paris";

// Staff accounts (from convex/seeds/staffAccounts.ts)
const STAFF_BY_ORG: Record<string, Array<{ email: string; firstName: string; lastName: string; positionCode: string }>> = {
	"fr-consulat-paris": [
		{ email: "consul-general@consulatdugabon.fr", firstName: "Consul", lastName: "Général", positionCode: "consul_general" },
		{ email: "consul@consulatdugabon.fr", firstName: "Gwenaëlle", lastName: "NTSAGA", positionCode: "consul" },
		{ email: "vice-consul1@consulatdugabon.fr", firstName: "Christiane", lastName: "MOUELE", positionCode: "vice_consul" },
		{ email: "vice-consul2@consulatdugabon.fr", firstName: "Madina", lastName: "ANDJAYI KEITA", positionCode: "vice_consul" },
		{ email: "secretaire1@consulatdugabon.fr", firstName: "Léa Marcelle", lastName: "ASSEH AKORE", positionCode: "consular_agent" },
		{ email: "secretaire2@consulatdugabon.fr", firstName: "Nelly", lastName: "CALAMEPAT", positionCode: "consular_agent" },
		{ email: "secretaire3@consulatdugabon.fr", firstName: "Jacqueline", lastName: "MPEMBA", positionCode: "consular_agent" },
		{ email: "assistant-admin1@consulatdugabon.fr", firstName: "Carmel Leger", lastName: "KINGA MIHINDOU", positionCode: "consular_agent" },
		{ email: "assistant-admin2@consulatdugabon.fr", firstName: "Ray Proclèm", lastName: "NGOMONDAMI", positionCode: "consular_agent" },
		{ email: "okatech+jerome@icloud.com", firstName: "Jerome", lastName: "Agent", positionCode: "consular_agent" },
		{ email: "admin@okafrancois.dev", firstName: "Assistant", lastName: "Agent", positionCode: "consular_agent" },
		{ email: "admin+manager@okafrancois.dev", firstName: "Manager", lastName: "Test", positionCode: "consul" },
	],
	"fr-ambassade-paris": [
		{ email: "ambassadeur@ambassadedugabon.fr", firstName: "Marc", lastName: "Ngoubou", positionCode: "ambassador" },
		{ email: "agent@ambassadedugabon.fr", firstName: "Isaac", lastName: "Koumba", positionCode: "consular_agent" },
	],
	"ca-ambassade-ottawa": [
		{ email: "ambassadeur@ambagabon.ca", firstName: "Henri", lastName: "Mboumba", positionCode: "ambassador" },
		{ email: "agent@ambagabon.ca", firstName: "Éric", lastName: "Mouiri", positionCode: "consular_agent" },
	],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function readJsonl(baseDir: string, tableName: string): Array<Record<string, unknown>> {
	const filePath = path.join(baseDir, tableName, "documents.jsonl");
	if (!fs.existsSync(filePath)) {
		console.warn(`  ⚠️  ${filePath} not found`);
		return [];
	}
	const content = fs.readFileSync(filePath, "utf-8").trim();
	if (!content) return [];
	return content.split("\n").map((line) => JSON.parse(line));
}

function writeJsonl(tableName: string, records: Array<Record<string, unknown>>): void {
	const dir = path.join(OUTPUT_DIR, tableName);
	fs.mkdirSync(dir, { recursive: true });
	const lines = records.map((r) => JSON.stringify(r)).join("\n");
	fs.writeFileSync(path.join(dir, "documents.jsonl"), records.length > 0 ? lines + "\n" : "");
	console.log(`  ✅ ${tableName}: ${records.length} records`);
}

function clean<T extends Record<string, unknown>>(obj: T): T {
	const result = {} as Record<string, unknown>;
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null) {
			result[key] = value;
		}
	}
	return result as T;
}

// ─── State ─────────────────────────────────────────────────────────────────

const profileToUser = new Map<string, string>();

// Dev snapshot lookups (populated in step 1)
let devOrgBySlug = new Map<string, Record<string, unknown>>();
let devPositionsByOrg = new Map<string, Array<Record<string, unknown>>>();
let devRegistrationOrgServiceId: string;
let devConsulatOrgId: string;

// ─── Step 1: Load Dev Snapshot (seed data) ─────────────────────────────────

function loadDevSeedData() {
	console.log("📦 Step 1: Loading seed data from dev snapshot...");

	const orgs = readJsonl(DEV_DIR, "orgs");
	const services = readJsonl(DEV_DIR, "services");
	const orgServices = readJsonl(DEV_DIR, "orgServices");
	const positions = readJsonl(DEV_DIR, "positions");
	const ministryGroups = readJsonl(DEV_DIR, "ministryGroups");

	console.log(`  📊 Orgs: ${orgs.length}, Services: ${services.length}, OrgServices: ${orgServices.length}`);
	console.log(`  📊 Positions: ${positions.length}, MinistryGroups: ${ministryGroups.length}`);

	// Build lookups
	for (const org of orgs) {
		devOrgBySlug.set(org.slug as string, org);
	}

	// Find consulat org
	const consulat = devOrgBySlug.get(CONSULAT_SLUG);
	if (!consulat) {
		console.error(`❌ Org '${CONSULAT_SLUG}' not found in dev snapshot!`);
		process.exit(1);
	}
	devConsulatOrgId = consulat._id as string;
	console.log(`  ✅ Consulat: ${consulat.name} → ${devConsulatOrgId}`);

	// Find registration orgService
	const registrationService = services.find((s) => (s.category as string) === "registration" && s.isActive);
	if (registrationService) {
		const regOrgService = orgServices.find(
			(os) => (os.orgId as string) === devConsulatOrgId && (os.serviceId as string) === registrationService._id,
		);
		if (regOrgService) {
			devRegistrationOrgServiceId = regOrgService._id as string;
			console.log(`  ✅ Registration orgService: ${devRegistrationOrgServiceId}`);
		}
	}

	// Build positions by org
	for (const org of orgs) {
		const orgPositions = positions.filter((p) => (p.orgId as string) === (org._id as string));
		devPositionsByOrg.set(org.slug as string, orgPositions);
	}

	return { orgs, services, orgServices, positions, ministryGroups };
}

// ─── Staff Generation ──────────────────────────────────────────────────────

function generateStaff(
	existingUsers: Array<Record<string, unknown>>,
): {
	staffUsers: Array<Record<string, unknown>>;
	staffMemberships: Array<Record<string, unknown>>;
} {
	const staffUsers: Array<Record<string, unknown>> = [];
	const staffMemberships: Array<Record<string, unknown>> = [];
	const existingEmails = new Set(existingUsers.map((u) => u.email as string));
	const now = Date.now();

	for (const [slug, accounts] of Object.entries(STAFF_BY_ORG)) {
		const org = devOrgBySlug.get(slug);
		if (!org) continue;

		const orgId = org._id as string;
		const positions = devPositionsByOrg.get(slug) ?? [];
		const positionByCode = new Map(positions.map((p) => [p.code as string, p]));

		for (const account of accounts) {
			// Create user if doesn't exist in legacy
			let userId: string;
			if (existingEmails.has(account.email)) {
				// Find the legacy user ID
				const existing = existingUsers.find((u) => u.email === account.email);
				userId = existing!._id as string;
			} else {
				// NOTE: staff user IDs must be valid Convex IDs.
				// We skip staff user creation during import — staff will be added via mutations post-import.
				continue;
			}

			// Create membership
			const position = positionByCode.get(account.positionCode);
			staffMemberships.push(clean({
				_id: `staff_mbr_${account.email}_${slug}`, // placeholder — will be replaced by mutation
				_creationTime: now,
				userId,
				orgId,
				positionId: position ? (position._id as string) : undefined,
			}));
		}
	}

	return { staffUsers, staffMemberships };
}

// ─── Legacy Transformations ────────────────────────────────────────────────

function transformUsers(legacyUsers: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
	return legacyUsers.map((user) => {
		const legacyId = user._id as string;
		const email = user.email as string;
		const roles = (user.roles as string[]) ?? [];
		let role: string | undefined;
		if (roles.includes("SuperAdmin")) role = "super_admin";
		else if (roles.includes("IntelAgent")) role = "intel_agent";
		else if (roles.includes("EducationAgent")) role = "education_agent";

		return clean({
			_id: legacyId,
			_creationTime: user._creationTime as number,
			// authId omitted — will be set when user logs in via Better Auth
			email,
			name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email,
			phone: user.phoneNumber as string | undefined,
			firstName: user.firstName as string | undefined,
			lastName: user.lastName as string | undefined,
			role,
			isActive: (user.status as string) === "active",
			isSuperadmin: role === "super_admin",
		});
	});
}

function transformProfiles(legacyProfiles: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
	const results: Array<Record<string, unknown>> = [];

	for (const profile of legacyProfiles) {
		const legacyId = profile._id as string;
		const userId = profile.userId as string;
		profileToUser.set(legacyId, userId);

		const personal = (profile.personal as Record<string, unknown>) ?? {};
		const contacts = (profile.contacts as Record<string, unknown>) ?? {};
		const family = (profile.family as Record<string, unknown>) ?? {};
		const profession = (profile.professionSituation as Record<string, unknown>) ?? {};
		const contactAddress = (contacts.address as Record<string, unknown>) ?? {};
		const passportInfos = (personal.passportInfos as Record<string, unknown>) ?? {};

		results.push(clean({
			_id: legacyId,
			_creationTime: profile._creationTime as number,
			userId,
			userType: "citizen",
			residenceCountry: profile.residenceCountry as string | undefined,
			updatedAt: Date.now(),
			identity: clean({
				firstName: (personal.firstName as string) ?? "",
				lastName: (personal.lastName as string) ?? "",
				birthDate: personal.birthDate as number | undefined,
				birthPlace: personal.birthPlace as string | undefined,
				birthCountry: personal.birthCountry as string | undefined,
				gender: personal.gender as string | undefined,
				nationality: personal.nationality as string | undefined,
				nationalityAcquisition: personal.acquisitionMode as string | undefined,
			}),
			passportInfo: passportInfos.number
				? clean({
					number: passportInfos.number as string,
					issueDate: passportInfos.issueDate as number | undefined,
					expiryDate: passportInfos.expiryDate as number | undefined,
					issueAuthority: passportInfos.issueAuthority as string | undefined,
				})
				: undefined,
			addresses: contactAddress.street
				? [clean({ type: "residence", street: (contactAddress.street as string) ?? "", city: (contactAddress.city as string) ?? "", postalCode: (contactAddress.postalCode as string) ?? "", country: (contactAddress.country as string) ?? "" })]
				: [],
			contacts: clean({ email: contacts.email as string | undefined, phone: contacts.phone as string | undefined }),
			family: clean({
				maritalStatus: family.maritalStatus as string | undefined,
				father: family.father ? clean({ firstName: ((family.father as Record<string, unknown>).firstName as string) ?? "", lastName: ((family.father as Record<string, unknown>).lastName as string) ?? "" }) : undefined,
				mother: family.mother ? clean({ firstName: ((family.mother as Record<string, unknown>).firstName as string) ?? "", lastName: ((family.mother as Record<string, unknown>).lastName as string) ?? "" }) : undefined,
			}),
			profession: clean({ workStatus: profession.workStatus as string | undefined, profession: profession.profession as string | undefined, employer: profession.employer as string | undefined }),
			emergencyContacts: ((profile.emergencyContacts as Array<Record<string, unknown>>) ?? []).map((ec) => clean({
				firstName: (ec.firstName as string) ?? "", lastName: (ec.lastName as string) ?? "",
				phoneNumber: ec.phoneNumber as string | undefined, email: ec.email as string | undefined,
				relationship: ec.relationship as string | undefined, type: ec.type as string | undefined,
			})),
			consularCard: profile.consularCard
				? clean({ cardNumber: (profile.consularCard as Record<string, unknown>).cardNumber as string | undefined, issuedAt: (profile.consularCard as Record<string, unknown>).issuedAt as number | undefined, expiresAt: (profile.consularCard as Record<string, unknown>).expiresAt as number | undefined })
				: undefined,
		}));
	}
	return results;
}

function transformDocuments(legacyDocs: Array<Record<string, unknown>>, profileIds: Set<string>, childToParent: Map<string, string>): Array<Record<string, unknown>> {
	const results: Array<Record<string, unknown>> = [];
	const typeToCategory: Record<string, string> = { passport: "identity", identity_card: "identity", birth_certificate: "civil_status", marriage_certificate: "civil_status", death_certificate: "civil_status", proof_of_address: "residence", residence_permit: "residence", photo: "identity" };

	for (const doc of legacyDocs) {
		const legacyId = doc._id as string;
		const ownerType = doc.ownerType as string;
		let ownerId: string | undefined;

		if (ownerType === "profile") { ownerId = doc.ownerId as string; if (!profileIds.has(ownerId)) continue; }
		else if (ownerType === "child_profile") { ownerId = childToParent.get(doc.ownerId as string); if (!ownerId) continue; }
		else continue;

		const storageId = doc.storageId as string | undefined;
		const files = storageId ? [clean({ storageId, filename: (doc.fileName as string) ?? "unknown", mimeType: (doc.fileType as string) ?? "application/octet-stream", sizeBytes: (doc.fileSize as number) ?? 0, uploadedAt: (doc._creationTime as number) ?? Date.now() })] : [];

		const validations = (doc.validations as Array<Record<string, unknown>>) ?? [];
		const last = validations[validations.length - 1];
		let status = "pending";
		if (last) { const vs = last.status as string; if (vs === "approved" || vs === "validated") status = "validated"; else if (vs === "rejected") status = "rejected"; }

		results.push(clean({ _id: legacyId, _creationTime: doc._creationTime as number, ownerId, files, documentType: doc.type as string | undefined, category: typeToCategory[(doc.type as string)] ?? undefined, status, label: doc.fileName as string | undefined }));
	}
	return results;
}

function transformRequests(legacyRequests: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
	const results: Array<Record<string, unknown>> = [];
	const filtered = legacyRequests.filter((r) => (r.serviceId as string) === LEGACY_INSCRIPTION_SERVICE_ID);
	const statusMap: Record<string, string> = { submitted: "submitted", pending: "pending", in_review: "in_review", validated: "validated", document_in_production: "in_production", ready_for_pickup: "ready", completed: "completed", cancelled: "cancelled", rejected: "rejected" };

	for (const req of filtered) {
		const legacyId = req._id as string;
		const requesterProfileId = req.requesterId as string | undefined;
		const userId = requesterProfileId ? profileToUser.get(requesterProfileId) : undefined;
		if (!userId) continue;

		results.push(clean({
			_id: legacyId, _creationTime: req._creationTime as number,
			reference: (req.number as string) ?? `REQ-LEGACY-${legacyId.slice(-6)}`,
			userId, profileId: req.profileId as string | undefined,
			orgId: devConsulatOrgId, orgServiceId: devRegistrationOrgServiceId,
			status: statusMap[(req.status as string)?.toLowerCase()] ?? "pending",
			priority: (req.priority as string) ?? "normal",
			formData: (req.formData as Record<string, unknown>) ?? {},
			metadata: (req.metadata as Record<string, unknown>) ?? {},
		}));
	}
	return results;
}

function transformAppointments(legacyAppointments: Array<Record<string, unknown>>, profileIds: Set<string>): Array<Record<string, unknown>> {
	const results: Array<Record<string, unknown>> = [];
	for (const apt of legacyAppointments) {
		const participants = (apt.participants as Array<Record<string, unknown>>) ?? [];
		const attendee = participants.find((p) => p.role === "attendee");
		const attendeeProfileId = attendee?.id as string | undefined;
		if (!attendeeProfileId || !profileIds.has(attendeeProfileId)) continue;

		const startDate = new Date(apt.startAt as number);
		const endDate = apt.endAt ? new Date(apt.endAt as number) : undefined;

		results.push(clean({
			_id: apt._id as string, _creationTime: apt._creationTime as number,
			orgId: devConsulatOrgId, attendeeProfileId,
			orgServiceId: devRegistrationOrgServiceId,
			date: startDate.toISOString().split("T")[0]!,
			time: startDate.toTimeString().slice(0, 5),
			endTime: endDate?.toTimeString().slice(0, 5),
			status: (apt.status as string) ?? "confirmed",
			appointmentType: (apt.type as string) === "document_collection" ? "pickup" : "deposit",
		}));
	}
	return results;
}

function transformChildProfiles(legacyChildren: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
	return legacyChildren.map((child) => {
		const personal = (child.personal as Record<string, unknown>) ?? {};
		const passportInfos = (personal.passportInfos as Record<string, unknown>) ?? {};
		const parents = ((child.parents as Array<Record<string, unknown>>) ?? []).map((p) => clean({
			profileId: p.profileId as string | undefined, role: (p.role as string) ?? "parent",
			firstName: (p.firstName as string) ?? "", lastName: (p.lastName as string) ?? "",
			email: p.email as string | undefined, phone: p.phoneNumber as string | undefined,
		}));

		return clean({
			_id: child._id as string, _creationTime: child._creationTime as number,
			authorUserId: child.authorUserId as string, status: (child.status as string) ?? "draft",
			identity: clean({ firstName: (personal.firstName as string) ?? "", lastName: (personal.lastName as string) ?? "", birthDate: personal.birthDate as number | undefined, birthPlace: personal.birthPlace as string | undefined, birthCountry: personal.birthCountry as string | undefined, gender: personal.gender as string | undefined, nationality: personal.nationality as string | undefined, nationalityAcquisition: personal.acquisitionMode as string | undefined }),
			passportInfo: passportInfos.number ? clean({ number: passportInfos.number as string, issueDate: passportInfos.issueDate as number | undefined, expiryDate: passportInfos.expiryDate as number | undefined, issueAuthority: passportInfos.issueAuthority as string | undefined }) : undefined,
			parents,
			registrationRequestId: child.registrationRequest as string | undefined,
		});
	});
}

function transformMemberships(legacyMemberships: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
	return legacyMemberships
		.filter((m) => (m.organizationId as string) === LEGACY_CONSULAT_ORG_ID)
		.map((m) => clean({
			_id: m._id as string, _creationTime: m._creationTime as number,
			userId: m.userId as string, orgId: devConsulatOrgId,
		}));
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
	console.log("═══════════════════════════════════════════════════════════");
	console.log("  GENERATE COMPLETE CONVEX IMPORT (ONE-SHOT)");
	console.log("═══════════════════════════════════════════════════════════");
	console.log(`  Legacy:  ${LEGACY_DIR}`);
	console.log(`  Dev:     ${DEV_DIR}`);
	console.log(`  Output:  ${OUTPUT_DIR}`);
	console.log("═══════════════════════════════════════════════════════════\n");

	if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	// ─── Step 1: Load dev seed data ────────────────────────────────────
	const { orgs, services, orgServices, positions, ministryGroups } = loadDevSeedData();

	// ─── Step 2: Read legacy data ──────────────────────────────────────
	console.log("\n📖 Step 2: Reading legacy snapshot...");
	const legacyUsers = readJsonl(LEGACY_DIR, "users");
	const legacyProfiles = readJsonl(LEGACY_DIR, "profiles");
	const legacyDocs = readJsonl(LEGACY_DIR, "documents");
	const legacyRequests = readJsonl(LEGACY_DIR, "requests");
	const legacyAppointments = readJsonl(LEGACY_DIR, "appointments");
	const legacyChildren = readJsonl(LEGACY_DIR, "childProfiles");
	const legacyMemberships = readJsonl(LEGACY_DIR, "memberships");
	console.log(`  📊 ${legacyUsers.length} users, ${legacyProfiles.length} profiles, ${legacyDocs.length} docs, ${legacyRequests.length} requests`);

	// ─── Step 3: Skipped (Better Auth handled separately post-import) ──
	console.log("\n⏭️  Step 3: Skipping Better Auth (will be created post-import)");

	// ─── Step 4: Transform legacy data ─────────────────────────────────
	console.log("\n🔄 Step 4: Transforming legacy data...");
	const users = transformUsers(legacyUsers);
	const profiles = transformProfiles(legacyProfiles);

	const profileIds = new Set(profiles.map((p) => p._id as string));
	const childToParent = new Map<string, string>();
	for (const child of legacyChildren) {
		for (const p of ((child.parents as Array<Record<string, unknown>>) ?? [])) {
			if (p.profileId && profileIds.has(p.profileId as string)) {
				childToParent.set(child._id as string, p.profileId as string);
				break;
			}
		}
	}

	const documents = transformDocuments(legacyDocs, profileIds, childToParent);
	const requests = transformRequests(legacyRequests);
	const appointments = transformAppointments(legacyAppointments, profileIds);
	const childProfiles = transformChildProfiles(legacyChildren);
	const legacyMbrs = transformMemberships(legacyMemberships);

	// ─── Step 5: Staff (skipped — added post-import via mutations) ────
	console.log("\n⏭️  Step 5: Skipping staff (will be added post-import via mutations)");

	// Use only legacy data
	const allUsers = users;
	const allMemberships = legacyMbrs;

	// ─── Step 6: Write everything ──────────────────────────────────────
	console.log("\n📝 Step 6: Writing output...");

	// App _tables manifest (use dev snapshot's numbering)
	const devTablesPath = path.join(DEV_DIR, "_tables", "documents.jsonl");
	const devTableEntries = fs.readFileSync(devTablesPath, "utf-8").trim().split("\n").map((l) => JSON.parse(l) as { name: string; id: number });
	const tablesDir = path.join(OUTPUT_DIR, "_tables");
	fs.mkdirSync(tablesDir, { recursive: true });
	fs.writeFileSync(path.join(tablesDir, "documents.jsonl"), devTableEntries.map((e) => JSON.stringify(e)).join("\n") + "\n");
	console.log(`  ✅ _tables: ${devTableEntries.length} entries (from dev)`);

	// Seed tables (from dev, as-is)
	writeJsonl("orgs", orgs);
	writeJsonl("services", services);
	writeJsonl("orgServices", orgServices);
	writeJsonl("positions", positions);
	writeJsonl("ministryGroups", ministryGroups);

	// Migration tables
	writeJsonl("users", allUsers);
	writeJsonl("profiles", profiles);
	writeJsonl("documents", documents);
	writeJsonl("requests", requests);
	writeJsonl("appointments", appointments);
	writeJsonl("childProfiles", childProfiles);
	writeJsonl("memberships", allMemberships);

	// Empty tables from dev (so --replace doesn't delete them)
	const migrationTables = new Set(["orgs", "services", "orgServices", "positions", "ministryGroups", "users", "profiles", "documents", "requests", "appointments", "childProfiles", "memberships"]);
	for (const entry of devTableEntries) {
		if (!migrationTables.has(entry.name)) {
			const dir = path.join(OUTPUT_DIR, entry.name);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
				fs.writeFileSync(path.join(dir, "documents.jsonl"), "");
			}
		}
	}

	// Better Auth: skip — tables will remain from deployment, auth created post-import
	console.log("\n⏭️  Step 7: Skipping Better Auth component (handled post-import)");

	// Other components from dev (empty)
	const devComponentsDir = path.join(DEV_DIR, "_components");
	if (fs.existsSync(devComponentsDir)) {
		for (const comp of fs.readdirSync(devComponentsDir)) {
			if (comp === "betterAuth") continue;
			const srcDir = path.join(devComponentsDir, comp);
			if (!fs.statSync(srcDir).isDirectory()) continue;

			// Copy component _tables
			const srcTables = path.join(srcDir, "_tables", "documents.jsonl");
			if (fs.existsSync(srcTables)) {
				const destTables = path.join(OUTPUT_DIR, "_components", comp, "_tables");
				fs.mkdirSync(destTables, { recursive: true });
				fs.copyFileSync(srcTables, path.join(destTables, "documents.jsonl"));
			}

			// Create empty table dirs
			for (const sub of fs.readdirSync(srcDir)) {
				if (sub === "_tables") continue;
				const subPath = path.join(srcDir, sub);
				if (fs.statSync(subPath).isDirectory()) {
					const destDir = path.join(OUTPUT_DIR, "_components", comp, sub);
					fs.mkdirSync(destDir, { recursive: true });
					fs.writeFileSync(path.join(destDir, "documents.jsonl"), "");
				}
			}
		}
	}

	// ─── Summary ───────────────────────────────────────────────────────

	console.log("\n═══════════════════════════════════════════════════════════");
	console.log("  GENERATION COMPLETE ✅");
	console.log("═══════════════════════════════════════════════════════════");
	console.log(`  🔐 BetterAuth:          (skipped — post-import)`);
	console.log(`  👤 Users:               ${allUsers.length} (legacy only)`);
	console.log(`  📋 Profiles:            ${profiles.length}`);
	console.log(`  📄 Documents:           ${documents.length}/${legacyDocs.length}`);
	console.log(`  📨 Requests:            ${requests.length}/${legacyRequests.length}`);
	console.log(`  📅 Appointments:        ${appointments.length}`);
	console.log(`  👶 ChildProfiles:       ${childProfiles.length}`);
	console.log(`  🏢 Memberships:         ${allMemberships.length} (legacy only)`);
	console.log(`  🏛️  Orgs:               ${orgs.length}`);
	console.log(`  🔧 Services:            ${services.length}`);
	console.log(`  🔗 OrgServices:         ${orgServices.length}`);
	console.log(`  💼 Positions:           ${positions.length}`);
	console.log(`  🏢 MinistryGroups:      ${ministryGroups.length}`);
	console.log("═══════════════════════════════════════════════════════════");
	console.log(`\n📁 Output: ${OUTPUT_DIR}`);
	console.log("\n🚀 Next steps:");
	console.log(`  1. cd ${OUTPUT_DIR} && zip -r ../migration-import.zip *`);
	console.log(`  2. npx convex import --replace-all docs/migration-import.zip --prod -y`);
}

main().catch((err) => {
	console.error("❌ Fatal error:", err);
	process.exit(1);
});
