import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/post-login-redirect")({
  component: PostLoginRedirect,
});

/**
 * Gateway route that redirects users to the appropriate dashboard
 * based on their role after sign-in:
 * - Super Admin → /dashboard
 * - Agent (org membership) → /admin
 * - Regular user → /my-space
 */
function PostLoginRedirect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSuperAdmin, isAgent, isPending } = useUserData();

  useEffect(() => {
    if (isPending) return;

    if (isSuperAdmin) {
      navigate({ to: "/dashboard", replace: true });
    } else if (isAgent) {
      navigate({ to: "/admin", replace: true });
    } else {
      navigate({ to: "/my-space", replace: true });
    }
  }, [isPending, isSuperAdmin, isAgent, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground text-sm">
          {t("common.redirecting", "Redirection en cours...")}
        </p>
      </div>
    </div>
  );
}
