import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Staff accounts grouped by org slug.
 *
 * Users are matched by EMAIL (not external auth ID).
 * The accounts must already exist in Better Auth (created via seed-test-accounts.ts)
 * and the user must have signed in at least once to trigger ensureUser.
 */
const STAFF_BY_ORG: Record<
	string,
	Array<{
		email: string;
		firstName: string;
		lastName: string;
		positionCode: string;
	}>
> = {
	// ─── Consulat Général du Gabon en France ───
	"fr-consulat-paris": [
		{
			email: "consul-general@consulatdugabon.fr",
			firstName: "Consul",
			lastName: "Général",
			positionCode: "consul_general",
		},
		{
			email: "consul@consulatdugabon.fr",
			firstName: "Marie",
			lastName: "Ndong",
			positionCode: "consul",
		},
		{
			email: "vice-consul@consulatdugabon.fr",
			firstName: "Paul",
			lastName: "Mba",
			positionCode: "vice_consul",
		},
		{
			email: "chancelier@consulatdugabon.fr",
			firstName: "Jean",
			lastName: "Obame",
			positionCode: "chancellor",
		},
		{
			email: "chef-chancellerie@consulatdugabon.fr",
			firstName: "Sophie",
			lastName: "Nze",
			positionCode: "head_of_chancellery",
		},
		{
			email: "agent@consulatdugabon.fr",
			firstName: "Fabrice",
			lastName: "Moussavou",
			positionCode: "consular_agent",
		},
		{
			email: "agent2@consulatdugabon.fr",
			firstName: "Léa",
			lastName: "Bongo",
			positionCode: "consular_agent",
		},
		{
			email: "etat-civil@consulatdugabon.fr",
			firstName: "Alice",
			lastName: "Mintsa",
			positionCode: "civil_status_officer",
		},
		{
			email: "receptionniste@consulatdugabon.fr",
			firstName: "David",
			lastName: "Ondo",
			positionCode: "reception_agent",
		},
		{
			email: "secretaire@consulatdugabon.fr",
			firstName: "Nadia",
			lastName: "Nzamba",
			positionCode: "secretary",
		},
		{
			email: "conseiller-eco@consulatdugabon.fr",
			firstName: "Pierre",
			lastName: "Eyogo",
			positionCode: "economic_counselor",
		},
		{
			email: "conseiller-com@consulatdugabon.fr",
			firstName: "Céline",
			lastName: "Edzang",
			positionCode: "communication_counselor",
		},
	],

	// ─── Ambassade du Gabon en France ───
	"fr-ambassade-paris": [
		{
			email: "ambassadeur@ambassadedugabon.fr",
			firstName: "Marc",
			lastName: "Ngoubou",
			positionCode: "ambassador",
		},
		{
			email: "agent@ambassadedugabon.fr",
			firstName: "Isaac",
			lastName: "Koumba",
			positionCode: "consular_agent",
		},
	],

	// ─── Ambassade du Gabon au Canada ───
	"ca-ambassade-ottawa": [
		{
			email: "ambassadeur@ambagabon.ca",
			firstName: "Henri",
			lastName: "Mboumba",
			positionCode: "ambassador",
		},
		{
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
 *   2. Finds the user by EMAIL (must already exist via Better Auth sign-up + ensureUser)
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
			usersFound: 0,
			usersNotFound: 0,
			membershipsCreated: 0,
			membershipsUpdated: 0,
			positionsAssigned: 0,
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
					// Find user by email (must already exist via Better Auth)
					const user = await ctx.db
						.query("users")
						.withIndex("by_email", (q) => q.eq("email", account.email))
						.unique();

					if (!user) {
						results.usersNotFound++;
						results.errors.push(`User not found: ${account.email} — sign in first via the app or run seed-test-accounts.ts`);
						continue;
					}

					const userId = user._id;
					results.usersFound++;

					// Update user name if needed
					if (!user.firstName || !user.lastName) {
						await ctx.db.patch(userId, {
							firstName: account.firstName,
							lastName: account.lastName,
							name: `${account.firstName} ${account.lastName}`,
							updatedAt: now,
						});
					}

					// Find matching position
					const position = positionByCode.get(account.positionCode);
					const positionId = position?._id;
					if (positionId) {
						results.positionsAssigned++;
					}

					// Upsert membership
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
