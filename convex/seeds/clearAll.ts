import { internalMutation } from "../_generated/server";

/**
 * Clear ALL data from ALL tables.
 * ⚠️  DEV ONLY — run via: npx convex run seeds/clearAll:clearAll
 */
export const clearAll = internalMutation({
	args: {},
	handler: async (ctx) => {
		const tables = [
			"users",
			"orgs",
			"memberships",
			"positions",
			"requests",
			"services",
			"serviceCategories",
			"documents",
			"profiles",
			"consularRegistrations",
			"consularNotifications",
			"appointments",
			"notifications",
			"tickets",
		] as const;

		const results: Record<string, number> = {};

		for (const table of tables) {
			try {
				const docs = await ctx.db.query(table as any).collect();
				for (const doc of docs) {
					await ctx.db.delete(doc._id);
				}
				results[table] = docs.length;
			} catch {
				results[table] = -1; // table doesn't exist or error
			}
		}

		return results;
	},
});
