"use client"

import * as React from "react"
import {
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { NavMain } from "@/components/sidebars/nav-main"
import { NavUser } from "@/components/sidebars/nav-user"
import { useUserData } from "@/hooks/use-user-data"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function SuperadminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const user = useUserData()
  
  // Superadmin navigation data with i18n
  const superadminNavItems = [
    {
      title: t("superadmin.nav.dashboard"),
      url: "/superadmin",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: t("superadmin.nav.users"),
      url: "/superadmin/users",
      icon: Users,
      items: [
        { title: t("superadmin.nav.allUsers"), url: "/superadmin/users" },
      ],
    },
    {
      title: t("superadmin.nav.organizations"),
      url: "/superadmin/orgs",
      icon: Building2,
      items: [
        { title: t("superadmin.nav.allOrganizations"), url: "/superadmin/orgs" },
        { title: t("superadmin.nav.newOrganization"), url: "/superadmin/orgs/new" },
      ],
    },
    {
      title: t("superadmin.nav.services"),
      url: "/superadmin/services",
      icon: FileText,
      items: [
        { title: t("superadmin.nav.commonServices"), url: "/superadmin/services" },
      ],
    },
    {
      title: t("superadmin.nav.auditLogs"),
      url: "/superadmin/audit-logs",
      icon: Shield,
    },
    {
      title: t("superadmin.nav.settings"),
      url: "/superadmin/settings",
      icon: Settings,
    },
  ]

  // Prepare user data for NavUser component
  const userData = {
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || "Superadmin",
    email: user.email || "",
    avatar: user.profileImageUrl || "/avatars/default.jpg",
    isPending: user.isPending,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/superadmin">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Consulat.ga</span>
                  <span className="truncate text-xs text-muted-foreground">Administration</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={superadminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
