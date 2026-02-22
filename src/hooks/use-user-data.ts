import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";
import { api } from "../../convex/_generated/api";

export function useUserData() {
	const {
		data: userData,
		isPending: userPending,
		error,
	} = useAuthenticatedConvexQuery(api.functions.users.getMe, {});

	const { data: memberships, isPending: membershipsPending } =
		useAuthenticatedConvexQuery(
			api.functions.memberships.listMyMemberships,
			{},
		);

	const { data: profile, isPending: profilePending } =
		useAuthenticatedConvexQuery(api.functions.profiles.getMine, {});

	return {
		userData,
		memberships,
		profile,
		isSignedIn: Boolean(userData),
		isAgent: Boolean(memberships && memberships.length > 0),
		isSuperAdmin: Boolean(userData?.isSuperadmin),
		isPending: userPending || membershipsPending || profilePending,
		error,
	};
}
