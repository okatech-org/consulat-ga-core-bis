#!/usr/bin/env bun
/**
 * Seed Test Accounts — Creates Better Auth accounts for dev testing
 * 
 * Usage: source .env.local && bun run scripts/seed-test-accounts.ts
 * 
 * This script:
 * 1. Creates Better Auth users via the sign-up API endpoint
 * 2. Outputs the Better Auth IDs for the Convex seed
 * 3. Users are auto-synced to Convex via the Better Auth ↔ Convex integration
 */

const SITE_URL = process.env.VITE_CONVEX_SITE_URL;
if (!SITE_URL) {
	console.error("❌ VITE_CONVEX_SITE_URL not found in environment");
	console.error("Run: source .env.local && bun run scripts/seed-test-accounts.ts");
	process.exit(1);
}

const AUTH_API = `${SITE_URL}/api/auth`;

// All accounts to create — matches .env.local VITE_DEV_ACCOUNTS
const ACCOUNTS_TO_CREATE = [
	// Super Admin
	{ email: "admin@okatech.fr", password: "Okatech241", name: "Super Admin", org: "🔑 Super Admin", label: "Super Admin" },

	// ─── Citizens ───
	{ email: "itoutouberny@gmail.com", password: "Ok@code2298", name: "Berny Itoutou", org: "👤 Citoyens", label: "Citoyen Longue Durée" },
	{ email: "kamauitoutou@gmail.com", password: "Ok@code2298", name: "Kamau Itoutou", org: "👤 Citoyens", label: "Citoyen Courte Durée" },

	// ─── Consulat Général du Gabon en France ───
	{ email: "consul-general@consulatdugabon.fr", password: "Okatech241", name: "Consul Général", org: "🇬🇦 Consulat Paris", label: "Consul Général", positionCode: "consul_general", orgSlug: "fr-consulat-paris" },
	{ email: "consul@consulatdugabon.fr", password: "Okatech241", name: "Marie Ndong", org: "🇬🇦 Consulat Paris", label: "Consul", positionCode: "consul", orgSlug: "fr-consulat-paris" },
	{ email: "vice-consul@consulatdugabon.fr", password: "Okatech241", name: "Paul Mba", org: "🇬🇦 Consulat Paris", label: "Vice-Consul", positionCode: "vice_consul", orgSlug: "fr-consulat-paris" },
	{ email: "chancelier@consulatdugabon.fr", password: "Okatech241", name: "Jean Obame", org: "🇬🇦 Consulat Paris", label: "Chancelier", positionCode: "chancellor", orgSlug: "fr-consulat-paris" },
	{ email: "chef-chancellerie@consulatdugabon.fr", password: "Okatech241", name: "Sophie Nze", org: "🇬🇦 Consulat Paris", label: "Chef de Chancellerie", positionCode: "head_of_chancellery", orgSlug: "fr-consulat-paris" },
	{ email: "agent@consulatdugabon.fr", password: "Okatech241", name: "Fabrice Moussavou", org: "🇬🇦 Consulat Paris", label: "Agent Consulaire", positionCode: "consular_agent", orgSlug: "fr-consulat-paris" },
	{ email: "agent2@consulatdugabon.fr", password: "Okatech241", name: "Léa Bongo", org: "🇬🇦 Consulat Paris", label: "Agent Consulaire 2", positionCode: "consular_agent", orgSlug: "fr-consulat-paris" },
	{ email: "etat-civil@consulatdugabon.fr", password: "Okatech241", name: "Alice Mintsa", org: "🇬🇦 Consulat Paris", label: "Agent État Civil", positionCode: "civil_status_officer", orgSlug: "fr-consulat-paris" },
	{ email: "receptionniste@consulatdugabon.fr", password: "Okatech241", name: "David Ondo", org: "🇬🇦 Consulat Paris", label: "Réceptionniste", positionCode: "reception_agent", orgSlug: "fr-consulat-paris" },
	{ email: "secretaire@consulatdugabon.fr", password: "Okatech241", name: "Nadia Nzamba", org: "🇬🇦 Consulat Paris", label: "Secrétaire", positionCode: "secretary", orgSlug: "fr-consulat-paris" },
	{ email: "conseiller-eco@consulatdugabon.fr", password: "Okatech241", name: "Pierre Eyogo", org: "🇬🇦 Consulat Paris", label: "Conseiller Économique", positionCode: "economic_counselor", orgSlug: "fr-consulat-paris" },
	{ email: "conseiller-com@consulatdugabon.fr", password: "Okatech241", name: "Céline Edzang", org: "🇬🇦 Consulat Paris", label: "Conseiller Communication", positionCode: "communication_counselor", orgSlug: "fr-consulat-paris" },

	// ─── Ambassade du Gabon en France ───
	{ email: "ambassadeur@ambassadedugabon.fr", password: "Okatech241", name: "Marc Ngoubou", org: "🏛️ Ambassade France", label: "Ambassadeur France", positionCode: "ambassador", orgSlug: "fr-ambassade-paris" },
	{ email: "agent@ambassadedugabon.fr", password: "Okatech241", name: "Isaac Koumba", org: "🏛️ Ambassade France", label: "Agent Ambassade France", positionCode: "consular_agent", orgSlug: "fr-ambassade-paris" },

	// ─── Ambassade du Gabon au Canada ───
	{ email: "ambassadeur@ambagabon.ca", password: "Okatech241", name: "Henri Mboumba", org: "🍁 Ambassade Canada", label: "Ambassadeur Canada", positionCode: "ambassador", orgSlug: "ca-ambassade-ottawa" },
	{ email: "agent@ambagabon.ca", password: "Okatech241", name: "Éric Mouiri", org: "🍁 Ambassade Canada", label: "Agent Ambassade Canada", positionCode: "consular_agent", orgSlug: "ca-ambassade-ottawa" },
];

interface BetterAuthSignUpResponse {
	user?: { id: string; email: string; name: string };
	error?: { message: string; code?: string };
}

async function createBetterAuthAccount(account: typeof ACCOUNTS_TO_CREATE[0]): Promise<{ id: string } | null> {
	try {
		const res = await fetch(`${AUTH_API}/sign-up/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: account.email,
				password: account.password,
				name: account.name,
			}),
		});

		const data = await res.json() as BetterAuthSignUpResponse;

		if (!res.ok || data.error) {
			// If user already exists, try to sign in to get the ID
			if (data.error?.message?.includes("already") || res.status === 422) {
				console.log(`  ⏭️  ${account.email} already exists, signing in...`);
				const signInRes = await fetch(`${AUTH_API}/sign-in/email`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: account.email,
						password: account.password,
					}),
				});
				const signInData = await signInRes.json() as BetterAuthSignUpResponse;
				if (signInData.user?.id) {
					console.log(`  ✅ Found ${account.email} → ${signInData.user.id}`);
					return { id: signInData.user.id };
				}
				console.log(`  ⚠️  Could not sign in ${account.email}: ${JSON.stringify(signInData)}`);
				return null;
			}
			console.error(`  ❌ Error creating ${account.email}: ${JSON.stringify(data)}`);
			return null;
		}

		if (data.user?.id) {
			console.log(`  ✅ Created ${account.email} → ${data.user.id}`);
			return { id: data.user.id };
		}

		console.log(`  ⚠️  Unexpected response for ${account.email}: ${JSON.stringify(data)}`);
		return null;
	} catch (err) {
		console.error(`  ❌ Failed ${account.email}:`, err);
		return null;
	}
}

async function main() {
	console.log(`🔐 Creating Better Auth test accounts...`);
	console.log(`   API: ${AUTH_API}\n`);

	const results: { account: typeof ACCOUNTS_TO_CREATE[0]; authId: string }[] = [];

	for (const account of ACCOUNTS_TO_CREATE) {
		const result = await createBetterAuthAccount(account);
		if (result) {
			results.push({ account, authId: result.id });
		}
	}

	// Output summary
	console.log("\n═══════════════════════════════════════════════");
	console.log("📋 Better Auth IDs:\n");
	for (const r of results) {
		console.log(`  ${r.account.label.padEnd(30)} ${r.account.email.padEnd(40)} → ${r.authId}`);
	}

	// Generate VITE_DEV_ACCOUNTS JSON
	const devAccounts = results.map(r => ({
		label: r.account.label,
		email: r.account.email,
		password: r.account.password,
		org: r.account.org,
	}));

	console.log("\n═══════════════════════════════════════════════");
	console.log("📋 VITE_DEV_ACCOUNTS for .env.local:\n");
	console.log(`VITE_DEV_ACCOUNTS='${JSON.stringify(devAccounts)}'`);

	console.log(`\n✅ Done! ${results.length}/${ACCOUNTS_TO_CREATE.length} accounts ready.`);
}

main().catch(console.error);
