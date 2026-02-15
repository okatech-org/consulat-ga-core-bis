#!/usr/bin/env bun
/**
 * Seed Test Accounts — Creates Clerk accounts for each position
 * 
 * Usage: bun run scripts/seed-test-accounts.ts
 * 
 * This script:
 * 1. Creates Clerk users with email+password
 * 2. Outputs the Clerk IDs for the Convex seed
 * 3. Generates the VITE_DEV_ACCOUNTS JSON for .env.local
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
	console.error("❌ CLERK_SECRET_KEY not found in environment");
	console.error("Run: source .env.local && bun run scripts/seed-test-accounts.ts");
	process.exit(1);
}

const CLERK_API = "https://api.clerk.com/v1";
const PASSWORD = "TestConsulat241!";
const DOMAIN = "consulatdugabon.fr";

// Position code → account mapping
// consul_general already exists, skip it
const ACCOUNTS_TO_CREATE = [
	{ positionCode: "consul", firstName: "Marie", lastName: "Ndong", email: `consul@${DOMAIN}`, label: "Consul" },
	{ positionCode: "vice_consul", firstName: "Paul", lastName: "Mba", email: `vice-consul@${DOMAIN}`, label: "Vice-Consul" },
	{ positionCode: "chancellor", firstName: "Jean", lastName: "Obame", email: `chancelier@${DOMAIN}`, label: "Chancelier" },
	{ positionCode: "head_of_chancellery", firstName: "Sophie", lastName: "Nze", email: `chef-chancellerie@${DOMAIN}`, label: "Chef de Chancellerie" },
	{ positionCode: "consular_agent", firstName: "Fabrice", lastName: "Moussavou", email: `agent@${DOMAIN}`, label: "Agent Consulaire" },
	{ positionCode: "consular_agent", firstName: "Léa", lastName: "Bongo", email: `agent2@${DOMAIN}`, label: "Agent Consulaire 2" },
	{ positionCode: "civil_status_officer", firstName: "Alice", lastName: "Mintsa", email: `etat-civil@${DOMAIN}`, label: "Agent État Civil" },
	{ positionCode: "receptionist", firstName: "David", lastName: "Ondo", email: `receptionniste@${DOMAIN}`, label: "Réceptionniste" },
	{ positionCode: "secretary", firstName: "Nadia", lastName: "Nzamba", email: `secretaire@${DOMAIN}`, label: "Secrétaire" },
	{ positionCode: "economic_counselor", firstName: "Pierre", lastName: "Eyogo", email: `conseiller-eco@${DOMAIN}`, label: "Conseiller Économique" },
	{ positionCode: "communication_counselor", firstName: "Céline", lastName: "Edzang", email: `conseiller-com@${DOMAIN}`, label: "Conseiller Communication" },
];

interface ClerkUser {
	id: string;
	email_addresses: { email_address: string }[];
	first_name: string;
	last_name: string;
}

async function clerkRequest(path: string, method: string, body?: unknown): Promise<unknown> {
	const res = await fetch(`${CLERK_API}${path}`, {
		method,
		headers: {
			"Authorization": `Bearer ${CLERK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(`Clerk API error ${res.status}: ${JSON.stringify(data)}`);
	}
	return data;
}

async function findExistingUser(email: string): Promise<ClerkUser | null> {
	const users = await clerkRequest(`/users?email_address=${encodeURIComponent(email)}`, "GET") as ClerkUser[];
	return users.length > 0 ? users[0] : null;
}

async function createClerkUser(account: typeof ACCOUNTS_TO_CREATE[0]): Promise<ClerkUser> {
	// Check if already exists
	const existing = await findExistingUser(account.email);
	if (existing) {
		console.log(`  ⏭️  ${account.email} already exists (${existing.id})`);
		return existing;
	}

	const user = await clerkRequest("/users", "POST", {
		email_address: [account.email],
		password: PASSWORD,
		first_name: account.firstName,
		last_name: account.lastName,
		skip_password_checks: true,
	}) as ClerkUser;

	console.log(`  ✅ Created ${account.email} → ${user.id}`);
	return user;
}

async function main() {
	console.log("🔐 Creating Clerk test accounts...\n");

	const results: { account: typeof ACCOUNTS_TO_CREATE[0]; clerkId: string }[] = [];

	for (const account of ACCOUNTS_TO_CREATE) {
		try {
			const user = await createClerkUser(account);
			results.push({ account, clerkId: user.id });
		} catch (err) {
			console.error(`  ❌ Failed: ${account.email}`, err);
		}
	}

	// Generate VITE_DEV_ACCOUNTS JSON
	const existingAccounts = [
		{ label: "Super Admin", email: "admin@okatech.fr", password: "Okatech241" },
		{ label: "Consul General", email: "consul-general@consulatdugabon.fr", password: "Okatech241" },
	];

	const newAccounts = results.map(r => ({
		label: r.account.label,
		email: r.account.email,
		password: PASSWORD,
	}));

	const citizenAccounts = [
		{ label: "Citoyen Longue Durée", email: "itoutouberny@gmail.com", password: "Ok@code2298" },
		{ label: "Citoyen Courte Durée", email: "kamauitoutou@gmail.com", password: "Ok@code2298" },
	];

	const allAccounts = [...existingAccounts, ...newAccounts, ...citizenAccounts];
	const devAccountsJson = JSON.stringify(allAccounts);

	console.log("\n═══════════════════════════════════════════════");
	console.log("📋 CLERK IDs for Convex seed:\n");
	console.log("const CLERK_IDS = {");
	for (const r of results) {
		console.log(`  "${r.account.positionCode}${r.account.email.includes("2") ? "_2" : ""}": "${r.clerkId}",`);
	}
	console.log("};");

	console.log("\n═══════════════════════════════════════════════");
	console.log("📋 VITE_DEV_ACCOUNTS for .env.local:\n");
	console.log(`VITE_DEV_ACCOUNTS='${devAccountsJson}'`);

	console.log("\n═══════════════════════════════════════════════");
	console.log(`\n✅ Done! ${results.length} accounts created.`);
	console.log(`   Password for all: ${PASSWORD}`);
}

main().catch(console.error);
