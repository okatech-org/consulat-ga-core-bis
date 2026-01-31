import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAction, useConvexAuth } from "convex/react";
import type { FunctionReference } from "convex/server";

export { convexQuery, useConvexMutation };

/**
 * Query a Convex function using TanStack Query.
 * Supports "skip" as args to disable the query.
 */
export function useConvexQuery<Query extends FunctionReference<"query">>(
	query: Query,
	args: Query["_args"] | "skip",
) {
	const shouldSkip = args === "skip";
	return useQuery({
		...convexQuery(query, shouldSkip ? ({} as Query["_args"]) : args),
		enabled: !shouldSkip,
	});
}

/**
 * Query a Convex function that requires authentication.
 */
export function useAuthenticatedConvexQuery<
	Query extends FunctionReference<"query">,
>(query: Query, args: Query["_args"] | "skip") {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const shouldSkip = args === "skip";

	return useQuery({
		...convexQuery(query, shouldSkip ? ({} as Query["_args"]) : args),
		enabled: isAuthenticated && !isLoading && !shouldSkip,
	});
}

/**
 * Mutate data using a Convex mutation with TanStack Query.
 */
export function useConvexMutationQuery<
	Mutation extends FunctionReference<"mutation">,
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
	Action extends FunctionReference<"action">,
>(action: Action) {
	const actionFn = useAction(action);
	return useMutation({
		mutationFn: async (args: Action["_args"]) => {
			return await actionFn(args);
		},
	});
}
