import { api } from "@convex/_generated/api";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MySpaceWrapper } from "@/components/my-space/my-space-wrapper";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";
import { AIAssistant } from "@/components/ai";

export const Route = createFileRoute("/my-space")({
  component: MySpaceLayout,
});

function MySpaceLayout() {
  const { t } = useTranslation();
  const { data, isPending } = useAuthenticatedConvexQuery(
    api.functions.profiles.getMyProfileSafe,
    {},
  );
  const location = useLocation();
  const navigate = useNavigate();

  const isOnboarding = location.pathname === "/my-space/onboarding";

  useEffect(() => {
    if (
      !isPending &&
      data?.status === "ready" &&
      data.profile === null &&
      !isOnboarding
    ) {
      navigate({ to: "/my-space/onboarding" });
    }
  }, [data, isPending, isOnboarding, navigate]);

  if (isPending) {
    return (
      <MySpaceWrapper className="min-h-full sflex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </MySpaceWrapper>
    );
  }

  if (data?.status === "unauthenticated") {
    return (
      <MySpaceWrapper className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">
          {t("errors.auth.noAuthentication", "Authentification requise")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "errors.auth.pleaseSignIn",
            "Veuillez vous connecter pour accéder à votre espace.",
          )}
        </p>
      </MySpaceWrapper>
    );
  }

  if (data?.status === "user_not_synced") {
    return (
      <MySpaceWrapper className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {t("mySpace.syncing", "Synchronisation de votre compte...")}
        </p>
      </MySpaceWrapper>
    );
  }

  return (
    <MySpaceWrapper>
      <Outlet />
      <AIAssistant />
    </MySpaceWrapper>
  );
}
