"use client"

import {
  Home,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Settings2
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"

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
import { OrgSwitcher } from "./org-switcher"
import { useUser } from "@clerk/clerk-react"




export function OrgSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const location = useLocation()


  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: location.pathname === "/dashboard",
    },
    {
      title: "Services",
      url: "/dashboard/services",
      icon: Briefcase,
      isActive: location.pathname.startsWith("/dashboard/services"),
    },
    {
      title: "Demandes",
      url: "/dashboard/requests",
      icon: FileText,
      isActive: location.pathname.startsWith("/dashboard/requests"),
    },
    {
      title: "Rendez-vous",
      url: "/dashboard/appointments",
      icon: Calendar,
      isActive: location.pathname.startsWith("/dashboard/appointments"),
    },
    {
      title: "Équipe",
      url: "/dashboard/team",
      icon: Users,
      isActive: location.pathname.startsWith("/dashboard/team"),
    },
    {
      title: "Paramètres",
      url: "/dashboard/settings",
      icon: Settings2,
      isActive: location.pathname.startsWith("/dashboard/settings"),
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
      <SidebarHeader>
        <OrgSwitcher />
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
