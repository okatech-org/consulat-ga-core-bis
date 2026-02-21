import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { convexQueryClient } from "../convex/provider";

export function getContext() {
	const queryClient = new QueryClient();
	return {
		queryClient,
		convexQueryClient,
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
