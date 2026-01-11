import { api } from "../../convex/_generated/api";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { useAuth } from "@clerk/clerk-react";

export function useUserData() {
  const { userId } = useAuth()
  
  const { data: userData, isPending: userPending, error } = useConvexQuery(
    api.users.getByClerkId,
    { clerkId: userId ?? "" }
  );

  const { data: memberships, isPending: membershipsPending } = useConvexQuery(
    api.users.getOrgMemberships,
    userId ? {} : "skip"
  );

  return {
    userData,
    memberships,
    isRegularUser: !!userData && (!memberships || memberships.length === 0),
    isPending: userPending || membershipsPending,
    error,
  };
}
