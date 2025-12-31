import type { FunctionReference } from "convex/server";
import { useConvexAuth, useAction } from "convex/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

// Re-export for convenience
export { convexQuery, useConvexMutation };

/**
 * Query a Convex function using TanStack Query.
 */
export function useConvexQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"]
) {
  return useQuery(convexQuery(query, args));
}

/**
 * Query a Convex function that requires authentication.
 */
export function useAuthenticatedConvexQuery<
  Query extends FunctionReference<"query">
>(query: Query, args: Query["_args"]) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return useQuery({
    ...convexQuery(query, args),
    enabled: isAuthenticated && !isLoading,
  });
}

/**
 * Mutate data using a Convex mutation with TanStack Query.
 */
export function useConvexMutationQuery<
  Mutation extends FunctionReference<"mutation">
>(mutation: Mutation) {
  const mutationFn = useConvexMutation(mutation);
  return useMutation({
    mutationFn: async (args: Mutation["_args"]) => {
      return await mutationFn(args);
    },
  });
}

/**
 * Call a Convex action using TanStack Query.
 */
export function useConvexActionQuery<
  Action extends FunctionReference<"action">
>(action: Action) {
  const actionFn = useAction(action);
  return useMutation({
    mutationFn: async (args: Action["_args"]) => {
      return await actionFn(args);
    },
  });
}
