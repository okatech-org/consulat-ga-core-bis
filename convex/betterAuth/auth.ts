import { betterAuth } from "better-auth/minimal";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import authConfig from "../auth.config";
import { components } from "../_generated/api";
import { query } from "../_generated/server";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "../_generated/dataModel";

const siteUrl = process.env.SITE_URL!;

// Better Auth Component Client
export const authComponent = createClient<DataModel>(components.betterAuth);

// Better Auth Instance Factory
export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth({
		appName: "Consulat.ga",
		baseURL: siteUrl,
		secret: process.env.BETTER_AUTH_SECRET,
		trustedOrigins: [
			siteUrl,
			// Accept both http and https in dev
			siteUrl.replace("http://", "https://"),
		],
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		plugins: [convex({ authConfig })],
	});
};

// Query: Get current authenticated user
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return await authComponent.getAuthUser(ctx);
	},
});
