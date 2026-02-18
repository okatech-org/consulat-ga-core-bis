import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Staff accounts grouped by org slug.
 *
 * ⚠️  Clerk IDs must be populated AFTER running:
 *     source .env.local && bun run scripts/seed-test-accounts.ts
 *
 * The script outputs the IDs to paste here.
 */
const STAFF_BY_ORG: Record<
	string,
	Array<{
		clerkId: string;
		email: string;
		firstName: string;
		lastName: string;
		positionCode: string;
	}>
> = {
	// ─── Consulat Général du Gabon en France ───
	"fr-consulat-paris": [
		{
			clerkId: "user_32tH5wgRgXACFh9wHdieH90RCZc",
			email: "consul-general@consulatdugabon.fr",
			firstName: "Consul",
			lastName: "Général",
			positionCode: "consul_general",
		},
		{
			clerkId: "user_32uo2vVVWcClDKxkzOAs31erhHQ",
			email: "consul@consulatdugabon.fr",
			firstName: "Marie",
			lastName: "Ndong",
			positionCode: "consul",
		},
		{
			clerkId: "user_39S7L0Qs6CG7Z3fxsBEtGYC7Xh4",
			email: "vice-consul@consulatdugabon.fr",
			firstName: "Paul",
			lastName: "Mba",
			positionCode: "vice_consul",
		},
		{
			clerkId: "user_39S7LFClHM9s3yTftZwn3nn48yv",
			email: "chancelier@consulatdugabon.fr",
			firstName: "Jean",
			lastName: "Obame",
			positionCode: "chancellor",
		},
		{
			clerkId: "user_39iZDW0ZVOqfXEI2QmT9Z63VQo5",
			email: "chef-chancellerie@consulatdugabon.fr",
			firstName: "Sophie",
			lastName: "Nze",
			positionCode: "head_of_chancellery",
		},
		{
			clerkId: "user_39S7LNa3y3hTUSQyM5r60YwA4Z4",
			email: "agent@consulatdugabon.fr",
			firstName: "Fabrice",
			lastName: "Moussavou",
			positionCode: "consular_agent",
		},
		{
			clerkId: "user_39iZDa2YT6c6omhsl39K8nSqn8T",
			email: "agent2@consulatdugabon.fr",
			firstName: "Léa",
			lastName: "Bongo",
			positionCode: "consular_agent",
		},
		{
			clerkId: "user_39S7LY5PyNDSHhgx983hUjtwZIG",
			email: "etat-civil@consulatdugabon.fr",
			firstName: "Alice",
			lastName: "Mintsa",
			positionCode: "civil_status_officer",
		},
		{
			clerkId: "user_39iZDg4tKBt20cJm9JfpaeOhpdW",
			email: "receptionniste@consulatdugabon.fr",
			firstName: "David",
			lastName: "Ondo",
			positionCode: "reception_agent",
		},
		{
			clerkId: "user_39iZDfkwDl1MVMca4ArrveQKRex",
			email: "secretaire@consulatdugabon.fr",
			firstName: "Nadia",
			lastName: "Nzamba",
			positionCode: "secretary",
		},
		{
			clerkId: "user_39iZDeXsqK8Oyr2pI5e4NwpKIMX",
			email: "conseiller-eco@consulatdugabon.fr",
			firstName: "Pierre",
			lastName: "Eyogo",
			positionCode: "economic_counselor",
		},
		{
			clerkId: "user_39iZDqqGbKJkQ3f6CRBrXdyapNi",
			email: "conseiller-com@consulatdugabon.fr",
			firstName: "Céline",
			lastName: "Edzang",
			positionCode: "communication_counselor",
		},
	],

	// ─── Ambassade du Gabon en France ───
	"fr-ambassade-paris": [
		{
			clerkId: "", // TODO: paste after running seed-test-accounts.ts
			email: "ambassadeur@ambassadedugabon.fr",
			firstName: "Marc",
			lastName: "Ngoubou",
			positionCode: "ambassador",
		},
		{
			clerkId: "", // TODO: paste after running seed-test-accounts.ts
			email: "agent@ambassadedugabon.fr",
			firstName: "Isaac",
			lastName: "Koumba",
			positionCode: "consular_agent",
		},
	],

	// ─── Ambassade du Gabon au Canada ───
	"ca-ambassade-ottawa": [
		{
			clerkId: "", // TODO: paste after running seed-test-accounts.ts
			email: "ambassadeur@ambagabon.ca",
			firstName: "Henri",
			lastName: "Mboumba",
			positionCode: "ambassador",
		},
		{
			clerkId: "", // TODO: paste after running seed-test-accounts.ts
			email: "agent@ambagabon.ca",
			firstName: "Éric",
			lastName: "Mouiri",
			positionCode: "consular_agent",
		},
	],
};

/**
 * Seed staff accounts for all DEV orgs.
 *
 * For each org slug → accounts list:
 *   1. Resolves the org by slug
 *   2. Upserts the user in Convex (by externalId or email)
 *   3. Creates/updates a membership with position assignment
 *
 * Usage:
 *   npx convex run seeds/staffAccounts:seedStaffAccounts
 */
export const seedStaffAccounts = mutation({
	args: {
		orgSlug: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const results = {
			orgsProcessed: 0,
			usersCreated: 0,
			usersUpdated: 0,
			membershipsCreated: 0,
			membershipsUpdated: 0,
			positionsAssigned: 0,
			skippedNoClerkId: 0,
			errors: [] as string[],
		};

		// Determine which orgs to process
		const orgSlugs = args.orgSlug
			? [args.orgSlug]
			: Object.keys(STAFF_BY_ORG);

		for (const slug of orgSlugs) {
			const accounts = STAFF_BY_ORG[slug];
			if (!accounts) {
				results.errors.push(`No accounts defined for slug: ${slug}`);
				continue;
			}

			// Resolve org
			const org = await ctx.db
				.query("orgs")
				.withIndex("by_slug", (q) => q.eq("slug", slug))
				.first();

			if (!org) {
				results.errors.push(`Org not found: ${slug}`);
				continue;
			}

			const orgId = org._id;

			// Load positions for this org
			const positions = await ctx.db
				.query("positions")
				.withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
				.collect();

			const positionByCode = new Map(positions.map((p) => [p.code, p]));

			for (const account of accounts) {
				try {
					// Skip accounts without Clerk ID
					if (!account.clerkId) {
						results.skippedNoClerkId++;
						continue;
					}

					// 1. Upsert user
					let userId: Id<"users">;
					const existingByExtId = await ctx.db
						.query("users")
						.withIndex("by_externalId", (q) =>
							q.eq("externalId", account.clerkId),
						)
						.unique();

					if (existingByExtId) {
						userId = existingByExtId._id;
						results.usersUpdated++;
					} else {
						const existingByEmail = await ctx.db
							.query("users")
							.withIndex("by_email", (q) => q.eq("email", account.email))
							.unique();

						if (existingByEmail) {
							await ctx.db.patch(existingByEmail._id, {
								externalId: account.clerkId,
								firstName: account.firstName,
								lastName: account.lastName,
								name: `${account.firstName} ${account.lastName}`,
								updatedAt: now,
							});
							userId = existingByEmail._id;
							results.usersUpdated++;
						} else {
							userId = await ctx.db.insert("users", {
								externalId: account.clerkId,
								email: account.email,
								name: `${account.firstName} ${account.lastName}`,
								firstName: account.firstName,
								lastName: account.lastName,
								isActive: true,
								isSuperadmin: false,
								updatedAt: now,
							});
							results.usersCreated++;
						}
					}

					// 2. Find matching position
					const position = positionByCode.get(account.positionCode);
					const positionId = position?._id;
					if (positionId) {
						results.positionsAssigned++;
					}

					// 3. Upsert membership
					const existingMemberships = await ctx.db
						.query("memberships")
						.withIndex("by_user_org", (q) =>
							q.eq("userId", userId).eq("orgId", orgId),
						)
						.collect();

					const existingMembership = existingMemberships.find(
						(m) => !m.deletedAt,
					);

					if (existingMembership) {
						await ctx.db.patch(existingMembership._id, {
							positionId,
						});
						results.membershipsUpdated++;
					} else {
						await ctx.db.insert("memberships", {
							userId,
							orgId,
							positionId,
						});
						results.membershipsCreated++;
					}
				} catch (err: unknown) {
					const message =
						err instanceof Error ? err.message : String(err);
					results.errors.push(`${account.email}: ${message}`);
				}
			}

			results.orgsProcessed++;
		}

		return results;
	},
});
