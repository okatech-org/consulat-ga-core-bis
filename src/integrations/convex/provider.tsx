import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useMemo, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../convex/_generated/api";

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
	console.error("missing envar VITE_CONVEX_URL");
}

// Single ConvexQueryClient — docs say to use convexQueryClient.convexClient
// for the ConvexBetterAuthProvider, NOT a separate ConvexReactClient
const convexQueryClient = new ConvexQueryClient(CONVEX_URL, {
	expectAuth: true,
});

export { convexQueryClient };

/**
 * Auto-sync: when a user authenticates (via any flow),
 * ensure they have an entry in the custom `users` table.
 */
function AuthSync({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useConvexAuth();
	const ensureUser = useMutation(api.functions.users.ensureUser);
	const hasSynced = useRef(false);

	useEffect(() => {
		if (isAuthenticated && !hasSynced.current) {
			hasSynced.current = true;
			ensureUser().catch((err) => console.warn("ensureUser failed:", err));
		}
		if (!isAuthenticated) {
			hasSynced.current = false;
		}
	}, [isAuthenticated, ensureUser]);

	return <>{children}</>;
}

export default function AppConvexProvider({
	children,
	initialToken,
}: {
	children: React.ReactNode;
	initialToken?: string | null;
}) {
	const queryClient = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						queryKeyHashFn: convexQueryClient.hashFn(),
						queryFn: convexQueryClient.queryFn(),
					},
				},
			}),
		[],
	);

	useEffect(() => {
		try {
			convexQueryClient.connect(queryClient);
		} catch (e) {
			console.warn(
				"Convex query client connection error (likely strict mode double-invoke):",
				e,
			);
		}
	}, [queryClient]);

	return (
		<ConvexBetterAuthProvider
			client={convexQueryClient.convexClient}
			authClient={authClient}
			initialToken={initialToken}
		>
			<QueryClientProvider client={queryClient}>
				<AuthSync>{children}</AuthSync>
			</QueryClientProvider>
		</ConvexBetterAuthProvider>
	);
}
