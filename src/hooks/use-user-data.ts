import { api } from "../../convex/_generated/api";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { Doc } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";

export function useUserData() {
  const { user } = useUser()
  const { data: userData, isPending, error } = useConvexQuery(
    api.users.getByClerkId,
   { clerkId: user?.id ?? "" }
  );

  return {
    ...userData,
    isPending,
    error,
    isAuthenticated: !!userData,
  } as Doc<"users"> & {
    isPending: boolean;
    error: Error | null;
    isAuthenticated: boolean;
  };
}
