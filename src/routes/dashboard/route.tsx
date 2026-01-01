import { Outlet } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { OrgProvider, useOrg } from "@/components/org/org-provider"
import { OrgSidebar } from "@/components/org/org-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayoutWrapper,
})

function DashboardLayoutWrapper() {
  return (
    <OrgProvider>
      <DashboardLayout />
    </OrgProvider>
  )
}

function DashboardLayout() {
  const { isLoading, activeOrg } = useOrg()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!activeOrg) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("dashboard.noAccess.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.noAccess.description")}</p>
        <p className="text-sm">{t("dashboard.noAccess.contact")}</p>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <OrgSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">{t("dashboard.nav.dashboard")}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeOrg.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
