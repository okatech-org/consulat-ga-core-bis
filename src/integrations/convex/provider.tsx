import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { useEffect, useMemo } from "react";
import { authClient } from "@/lib/auth-client";

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
	console.error("missing envar VITE_CONVEX_URL");
}

const convexClient = new ConvexReactClient(CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

export { convexQueryClient };

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
			client={convexClient}
			authClient={authClient}
			initialToken={initialToken}
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ConvexBetterAuthProvider>
	);
}
