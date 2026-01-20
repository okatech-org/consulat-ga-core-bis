import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/my-space")({
  component: MySpaceLayout,
})

function MySpaceLayout() {
  const { t } = useTranslation()
  const { data, isPending } = useAuthenticatedConvexQuery(api.functions.profiles.getMyProfileSafe, {})
  const location = useLocation()
  const navigate = useNavigate()

  const isOnboarding = location.pathname === "/my-space/onboarding"

  useEffect(() => {
    if (!isPending && data?.status === "ready" && data.profile === null && !isOnboarding) {
      navigate({ to: "/my-space/onboarding" })
    }
  }, [data, isPending, isOnboarding, navigate])

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (data?.status === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("errors.auth.noAuthentication", "Authentification requise")}</h1>
        <p className="text-muted-foreground">{t("errors.auth.pleaseSignIn", "Veuillez vous connecter pour accéder à votre espace.")}</p>
      </div>
    )
  }

  if (data?.status === "user_not_synced") {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("mySpace.syncing", "Synchronisation de votre compte...")}</p>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <Outlet />
    </main>
  )
}
