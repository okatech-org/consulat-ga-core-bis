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

// Superadmin navigation data
const superadminNavItems = [
  {
    title: "Tableau de bord",
    url: "/superadmin",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Utilisateurs",
    url: "/superadmin/users",
    icon: Users,
    items: [
      { title: "Tous les utilisateurs", url: "/superadmin/users" },
      { title: "En attente", url: "/superadmin/users/pending" },
    ],
  },
  {
    title: "Organisations",
    url: "/superadmin/orgs",
    icon: Building2,
    items: [
      { title: "Toutes les organisations", url: "/superadmin/orgs" },
      { title: "Créer une organisation", url: "/superadmin/orgs/new" },
    ],
  },
  {
    title: "Services",
    url: "/superadmin/services",
    icon: FileText,
  },
  {
    title: "Journaux d'audit",
    url: "/superadmin/audit-logs",
    icon: Shield,
  },
  {
    title: "Paramètres",
    url: "/superadmin/settings",
    icon: Settings,
  },
]

export function SuperadminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserData()
  
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
