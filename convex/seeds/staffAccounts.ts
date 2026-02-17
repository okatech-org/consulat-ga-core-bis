import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Org ID for Consulat Général du Gabon en France (reference org)
 */
const REFERENCE_ORG_ID = "n9714kyq5m9vpaa1depm9nw6n580ynjy";

/**
 * Account definitions — Clerk ID, email, name, position code
 */
const STAFF_ACCOUNTS = [
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
];

/**
 * Seed staff accounts — creates users, memberships with position assignments
 * 
 * For each account:
 * 1. Upserts the user in Convex (by externalId or email)
 * 2. Creates/updates a membership in the reference org
 * 3. Finds the matching position and sets positionId
 */
export const seedStaffAccounts = mutation({
	args: {
		orgId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const orgId = (args.orgId ?? REFERENCE_ORG_ID) as Id<"orgs">;
		const now = Date.now();
		
		// Verify org exists
		const org = await ctx.db.get(orgId);
		if (!org) {
			throw new Error(`Org ${orgId} not found`);
		}

		// Load all positions for this org
		const positions = await ctx.db
			.query("positions")
			.withIndex("by_org", (q) => q.eq("orgId", orgId).eq("isActive", true))
			.collect();

		const positionByCode = new Map(positions.map((p) => [p.code, p]));

		const results = {
			usersCreated: 0,
			usersUpdated: 0,
			membershipsCreated: 0,
			membershipsUpdated: 0,
			positionsAssigned: 0,
			errors: [] as string[],
		};

		for (const account of STAFF_ACCOUNTS) {
			try {
				// 1. Upsert user
				let userId: Id<"users">;
				const existingByExtId = await ctx.db
					.query("users")
					.withIndex("by_externalId", (q) => q.eq("externalId", account.clerkId))
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
						q.eq("userId", userId).eq("orgId", orgId)
					)
					.collect();

				const existingMembership = existingMemberships.find(
					(m) => !m.deletedAt
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
				const message = err instanceof Error ? err.message : String(err);
				results.errors.push(`${account.email}: ${message}`);
			}
		}

		return results;
	},
});
