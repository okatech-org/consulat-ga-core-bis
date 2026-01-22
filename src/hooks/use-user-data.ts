import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexQuery } from "@/integrations/convex/hooks";

export function useUserData() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  
  const { data: userData, isPending: userPending, error } = useConvexQuery(
    api.functions.users.getMe,
    isAuthenticated ? {} : "skip"
  );

  const { data: memberships, isPending: membershipsPending } = useConvexQuery(
    api.functions.memberships.listMyMemberships,
    isAuthenticated ? {} : "skip"
  );

  return {
    userData,
    memberships,
    isAgent: Boolean(memberships && memberships.length > 0),
    isSuperAdmin: Boolean(userData?.isSuperadmin),
    isPending: isLoading || userPending || membershipsPending,
    error,
  };
}
