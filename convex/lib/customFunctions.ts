import { query, mutation, action } from "../_generated/server";
import {
  customQuery,
  customMutation,
  customAction,
  customCtx,
} from "convex-helpers/server/customFunctions";
import { AuthenticationRequired } from "./auth";

/**
 * Custom query wrapper that requires authentication.
 * Use instead of `query` for protected queries.
 */
export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    await AuthenticationRequired(ctx);
    return {};
  })
);

/**
 * Custom mutation wrapper that requires authentication.
 * Use instead of `mutation` for protected mutations.
 */
export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    await AuthenticationRequired(ctx);
    return {};
  })
);

/**
 * Custom action wrapper that requires authentication.
 * Use instead of `action` for protected actions.
 */
export const authAction = customAction(
  action,
  customCtx(async (ctx) => {
    await AuthenticationRequired(ctx);
    return {};
  })
);
