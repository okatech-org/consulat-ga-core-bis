"use client"

import * as React from "react"
import {
  Building2,
  FileText,
  LayoutDashboard,
  Newspaper,
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
  

  const superadminNavItems = [
    {
      title: t("superadmin.nav.dashboard"),
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: t("superadmin.nav.users"),
      url: "/admin/users",
      icon: Users,
      items: [
        { title: t("superadmin.nav.allUsers"), url: "/admin/users" },
      ],
    },
    {
      title: t("superadmin.nav.organizations"),
      url: "/admin/orgs",
      icon: Building2,
      items: [
        { title: t("superadmin.nav.allOrganizations"), url: "/admin/orgs" },
        { title: t("superadmin.nav.newOrganization"), url: "/admin/orgs/new" },
      ],
    },
    {
      title: t("superadmin.nav.services"),
      url: "/admin/services",
      icon: FileText,
      items: [
        { title: t("superadmin.nav.commonServices"), url: "/admin/services" },
      ],
    },
    {
      title: t("superadmin.nav.posts", "Actualités"),
      url: "/admin/posts",
      icon: Newspaper,
      items: [
        { title: t("superadmin.nav.allPosts", "Toutes les publications"), url: "/admin/posts" },
        { title: t("superadmin.nav.newPost", "Nouvelle publication"), url: "/admin/posts/new" },
      ],
    },
    {
      title: t("superadmin.nav.auditLogs"),
      url: "/admin/audit-logs",
      icon: Shield,
    },
    {
      title: t("superadmin.nav.settings"),
      url: "/admin/settings",
      icon: Settings,
    },
  ]


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
              <Link to="/admin">
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
