"use client"

import {
  Home,
  User,
  FileText,
  FolderOpen,
  Calendar,
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import { useUser } from "@clerk/clerk-react"
import { useTranslation } from "react-i18next"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/sidebars/nav-user"

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const location = useLocation()
  const { t } = useTranslation()


  const navMain = [
    {
      title: t("common.dashboard", "Tableau de bord"), 
      url: "/my-space",
      icon: Home,
      isActive: location.pathname === "/my-space",
    },
    {
      title: t("common.profile", "Mon Profil"),
      url: "/my-space/profile",
      icon: User,
      isActive: location.pathname.startsWith("/my-space/profile"),
    },
    {
      title: t("common.requests", "Mes Demandes"),
      url: "/my-space/requests",
      icon: FileText,
      isActive: location.pathname.startsWith("/my-space/requests"),
    },
    {
      title: t("common.documents", "Mes Documents"),
      url: "/my-space/documents",
      icon: FolderOpen,
      isActive: location.pathname.startsWith("/my-space/documents"),
    },
    {
      title: t("common.appointments", "Mes Rendez-vous"),
      url: "/my-space/appointments",
      icon: Calendar,
      isActive: location.pathname.startsWith("/my-space/appointments"),
    },
  ]

  const navUser = user ? {
    name: user.fullName || user.username || "User",
    email: user.primaryEmailAddress?.emailAddress || "",
    avatar: user.imageUrl,
  } : {
    name: "Loading...",
    email: "",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border/50 flex items-center px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">GA</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-bold text-lg text-foreground leading-tight">Consulat.ga</div>
            <div className="text-xs text-muted-foreground">{t('header.country', 'République Gabonaise')}</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("common.menu", "Menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
