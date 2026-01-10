import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router"
import { useConvexQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserSidebar } from "@/components/user/user-sidebar"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/my-space")({
  component: MySpaceLayout,
})

function MySpaceLayout() {
  const { t } = useTranslation()
  const { data, isPending } = useConvexQuery(api.profiles.getMyProfileSafe, {})
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
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (data?.status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("errors.auth.noAuthentication", "Authentification requise")}</h1>
        <p className="text-muted-foreground">{t("errors.auth.pleaseSignIn", "Veuillez vous connecter pour accéder à votre espace.")}</p>
      </div>
    )
  }

  if (data?.status === "user_not_synced") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("mySpace.syncing", "Synchronisation de votre compte...")}</p>
      </div>
    )
  }

  if (isOnboarding) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-sm font-medium">{t("mySpace.title", "Mon Espace Consulaire")}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
