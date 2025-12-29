import type { FunctionReference } from "convex/server";
import { useConvexAuth } from "convex/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

// Re-export for convenience
export { convexQuery, useConvexMutation };

/**
 * Query a Convex function using TanStack Query.
 * Returns { data, isPending, error, isError, isSuccess, ... }
 *
 * @example
 * const { data, isPending, error } = useConvexQuery(api.messages.list, { channelId: "123" });
 * if (isPending) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <MessageList messages={data} />;
 */
export function useConvexQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"]
) {
  return useQuery(convexQuery(query, args));
}

/**
 * Query a Convex function that requires authentication.
 * Automatically skips the query when the user is not authenticated.
 *
 * @example
 * const { data, isPending } = useAuthenticatedConvexQuery(api.users.getCurrent, {});
 */
export function useAuthenticatedConvexQuery<
  Query extends FunctionReference<"query">
>(query: Query, args: Query["_args"]) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return useQuery({
    ...convexQuery(query, args),
    // Skip the query when not authenticated or still loading auth state
    enabled: isAuthenticated && !isLoading,
  });
}

/**
 * Mutate data using a Convex mutation with TanStack Query.
 * Returns { mutate, mutateAsync, isPending, error, ... }
 *
 * @example
 * const { mutate, isPending } = useConvexMutationQuery(api.messages.send);
 * mutate({ content: "Hello!" });
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
