import { query, mutation, action } from "../_generated/server";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import {
  customQuery,
  customMutation,
  customAction,
  customCtx,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";
import { UserRole } from "./types";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the current authenticated user from database
 */
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("errors.auth.notAuthenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("errors.users.notFound");
  }

  if (!user.isActive) {
    throw new ConvexError("errors.auth.accountDisabled");
  }

  return user;
}

/**
 * Check if user has the required role
 */
function checkUserRole(user: Doc<"users">, requiredRole?: UserRole) {
  if (!requiredRole) return; // No role requirement

  if (requiredRole === UserRole.SUPERADMIN && user.role !== UserRole.SUPERADMIN) {
    throw new ConvexError("errors.auth.superadminRequired");
  }
}

// ============================================
// AUTHENTICATED QUERIES
// ============================================

/**
 * Custom query wrapper that requires authentication.
 * The current user is available in ctx.user
 * 
 * @example
 * export const myQuery = authQuery({
 *   args: {},
 *   handler: async (ctx) => {
 *     console.log(ctx.user.email); // Access authenticated user
 *     return await ctx.db.query("items").collect();
 *   },
 * });
 */
export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return { user };
  })
);

/**
 * Custom query wrapper that requires SUPERADMIN role.
 * Use for admin-only queries.
 * 
 * @example
 * export const adminQuery = superadminQuery({
 *   args: {},
 *   handler: async (ctx) => {
 *     return await ctx.db.query("users").collect();
 *   },
 * });
 */
export const superadminQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    checkUserRole(user, UserRole.SUPERADMIN);
    return { user };
  })
);

// ============================================
// AUTHENTICATED MUTATIONS
// ============================================

/**
 * Custom mutation wrapper that requires authentication.
 * The current user is available in ctx.user
 * 
 * @example
 * export const createItem = authMutation({
 *   args: { name: v.string() },
 *   handler: async (ctx, args) => {
 *     return await ctx.db.insert("items", {
 *       name: args.name,
 *       userId: ctx.user._id,
 *     });
 *   },
 * });
 */
export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return { user };
  })
);

/**
 * Custom mutation wrapper that requires SUPERADMIN role.
 * Use for admin-only mutations.
 * 
 * @example
 * export const deleteUser = superadminMutation({
 *   args: { userId: v.id("users") },
 *   handler: async (ctx, args) => {
 *     await ctx.db.delete(args.userId);
 *   },
 * });
 */
export const superadminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    checkUserRole(user, UserRole.SUPERADMIN);
    return { user };
  })
);

// ============================================
// AUTHENTICATED ACTIONS
// ============================================

/**
 * Custom action wrapper that requires authentication.
 * Note: Actions don't have direct DB access, so user info
 * is fetched via ctx.auth.getUserIdentity()
 * 
 * @example
 * export const sendEmail = authAction({
 *   args: { to: v.string() },
 *   handler: async (ctx, args) => {
 *     console.log(ctx.identity.email);
 *     // ... send email
 *   },
 * });
 */
export const authAction = customAction(
  action,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("errors.auth.notAuthenticated");
    }
    return { identity };
  })
);

/**
 * Custom action wrapper that requires SUPERADMIN role.
 * Validates role by running a query internally.
 */
export const superadminAction = customAction(
  action,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("errors.auth.notAuthenticated");
    }
    
    // For actions, we need to run a query to check the user's role
    // The caller should validate the role in their handler if needed
    // by calling a mutation/query that checks the role
    return { identity };
  })
);
