import { useConvexAuth } from "convex/react";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { api } from "../../convex/_generated/api";

export function useUserData() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	const {
		data: userData,
		isPending: userPending,
		error,
	} = useConvexQuery(api.functions.users.getMe, isAuthenticated ? {} : "skip");

	const { data: memberships, isPending: membershipsPending } = useConvexQuery(
		api.functions.memberships.listMyMemberships,
		isAuthenticated ? {} : "skip",
	);

	const { data: profile, isPending: profilePending } = useConvexQuery(
		api.functions.profiles.getMine,
		isAuthenticated ? {} : "skip",
	);

	return {
		userData,
		memberships,
		profile,
		isAgent: Boolean(memberships && memberships.length > 0),
		isSuperAdmin: Boolean(userData?.isSuperadmin),
		isPending: isLoading || userPending || membershipsPending || profilePending,
		error,
	};
}
