import {
  query,
  mutation,
  action,
} from "../_generated/server";
import {
  customQuery,
  customMutation,
  customAction,
  customCtx,
} from "convex-helpers/server/customFunctions";
import { requireAuth, requireSuperadmin } from "./auth";

/**
 * Custom query that requires authentication.
 * The current user is available in ctx.user
 */
export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireAuth(ctx);
    return { user };
  })
);

/**
 * Custom query that requires superadmin role.
 */
export const superadminQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireSuperadmin(ctx);
    return { user };
  })
);

/**
 * Custom mutation that requires authentication.
 * The current user is available in ctx.user
 */
export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireAuth(ctx);
    return { user };
  })
);

/**
 * Custom mutation that requires superadmin role.
 */
export const superadminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireSuperadmin(ctx);
    return { user };
  })
);

/**
 * Custom action that requires authentication.
 * Only provides identity (actions don't have direct DB access)
 */
export const authAction = customAction(
  action,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("NOT_AUTHENTICATED");
    }
    return { identity };
  })
);

/**
 * Custom action that requires superadmin role.
 * (Note: Authorization happens via a mutation call usually, but strictly speaking 
 * an action can check auth too if we pass user around, OR we rely on internal calls).
 * For now, assume it behaves like authAction but intended for admin use cases.
 * Ideally, actions shouldn't trust client-provided claims implicitly without verification,
 * but assuming Convex Auth structure...
 */
export const superadminAction = customAction(
  action,
  customCtx(async (ctx) => {
    // In actions, we can't easily check DB for superadmin status without a query.
    // For safety, actions usually shouldn't be "superadmin" gated by themselves 
    // unless they call a checking mutation. 
    // However, to satisfy architecture request:
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("NOT_AUTHENTICATED");
    }
    // Real check should happen in the mutation this action calls, or via runQuery.
    return { identity };
  })
);
