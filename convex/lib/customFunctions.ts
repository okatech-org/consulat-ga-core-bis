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
