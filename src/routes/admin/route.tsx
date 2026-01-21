import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { useTranslation } from 'react-i18next'
import { SuperadminSidebar } from '@/components/sidebars/superadmin-sidebar'

export const Route = createFileRoute('/admin')({
  component: SuperadminLayout,
})

function SuperadminLayout() {
  const { t } = useTranslation()

  return (
    <SidebarProvider>
      <SuperadminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">
                  Consulat.ga
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("superadmin.nav.dashboard")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 pt-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
