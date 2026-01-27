"use client"

import {
  Home,
  FileText,
  Calendar,
  FolderOpen,
  User,
  Settings2,
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useUser } from "@clerk/clerk-react"

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

export function MySpaceSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { user } = useUser()
  const location = useLocation()

  const navMain = [
    {
      title: t("mySpace.nav.dashboard", "Tableau de bord"),
      url: "/my-space",
      icon: Home,
      isActive: location.pathname === "/my-space",
    },
    {
      title: t("mySpace.nav.requests", "Mes Demandes"),
      url: "/my-space/requests",
      icon: FileText,
      isActive: location.pathname.startsWith("/my-space/requests"),
    },
    {
      title: t("mySpace.nav.appointments", "Mes Rendez-vous"),
      url: "/my-space/appointments",
      icon: Calendar,
      isActive: location.pathname.startsWith("/my-space/appointments"),
    },
    {
      title: t("mySpace.nav.documents", "Mes Documents"),
      url: "/my-space/documents",
      icon: FolderOpen,
      isActive: location.pathname.startsWith("/my-space/documents"),
    },
    {
      title: t("mySpace.nav.profile", "Mon Profil"),
      url: "/my-space/profile",
      icon: User,
      isActive: location.pathname.startsWith("/my-space/profile"),
    },
    {
      title: t("mySpace.nav.settings", "Paramètres"),
      url: "/my-space/settings",
      icon: Settings2,
      isActive: location.pathname.startsWith("/my-space/settings"),
    },
  ]

  const navUser = user ? {
    name: user.fullName || user.username || "Utilisateur",
    email: user.primaryEmailAddress?.emailAddress || "",
    avatar: user.imageUrl,
  } : {
    name: "Chargement...",
    email: "",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/my-space">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="font-bold text-sm">GA</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Consulat.ga</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t("mySpace.nav.title", "Mon Espace")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
