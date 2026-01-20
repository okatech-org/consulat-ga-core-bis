import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface OrgContextType {
  activeOrgId: Id<"orgs"> | null;
  setActiveOrgId: (orgId: Id<"orgs">) => void;
  isLoading: boolean;
  activeOrg: any | null; 
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [activeOrgId, setActiveOrgIdState] = useState<Id<"orgs"> | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const { isLoaded, isSignedIn } = useAuth();



  const memberships = useQuery(
    api.functions.users.getOrgMemberships,
    isLoaded && isSignedIn ? {} : "skip"
  );

  useEffect(() => {

    const storedOrgId = localStorage.getItem("consulat-active-org");

    if (storedOrgId) {
      setActiveOrgIdState(storedOrgId as Id<"orgs">);
    }
    
    setIsRestoring(false);
  }, []);

  useEffect(() => {

    if (!isRestoring && memberships !== undefined) {
      if (memberships.length === 0) {

        setActiveOrgIdState(null);
        localStorage.removeItem("consulat-active-org");
        return;
      }

      const isValid = memberships.some((m) => m._id === activeOrgId);

      if (!activeOrgId || !isValid) {

        const firstOrg = memberships[0];
        if (firstOrg) {
          setActiveOrgIdState(firstOrg._id);
          localStorage.setItem("consulat-active-org", firstOrg._id);
        }
      }
    }
  }, [memberships, activeOrgId, isRestoring]);

  const setActiveOrgId = (orgId: Id<"orgs">) => {
    setActiveOrgIdState(orgId);
    localStorage.setItem("consulat-active-org", orgId);
  };

  const activeOrg = memberships?.find((m) => m._id === activeOrgId) || null;
  const isLoading = isRestoring || memberships === undefined;

  return (
    <OrgContext.Provider
      value={{
        activeOrgId,
        setActiveOrgId,
        isLoading,
        activeOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
