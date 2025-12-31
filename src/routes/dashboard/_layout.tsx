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

export const Route = createFileRoute("/dashboard/_layout")({
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If loading is done but no activeOrg, it means user has no memberships
  // We should probably redirect them or show a "No access" page.
  // For now, let's show a friendly message.
  if (!activeOrg) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Accès non autorisé</h1>
        <p className="text-muted-foreground">Vous n'êtes membre d'aucune organisation.</p>
        <p className="text-sm">Contactez un administrateur pour être ajouté.</p>
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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
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
