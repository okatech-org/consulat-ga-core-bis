"use client";

import * as React from "react";
import {
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { NavMain } from "@/components/sidebars/nav-main";
import { NavUser } from "@/components/sidebars/nav-user";
import { useUserData } from "@/hooks/use-user-data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function SuperadminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const user = useUserData();

  const superadminNavItems = [
    {
      title: t("superadmin.nav.dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: t("superadmin.nav.users"),
      url: "/dashboard/users",
      icon: Users,
      items: [{ title: t("superadmin.nav.allUsers"), url: "/dashboard/users" }],
    },
    {
      title: t("superadmin.nav.organizations"),
      url: "/dashboard/orgs",
      icon: Building2,
      items: [
        { title: t("superadmin.nav.allOrganizations"), url: "/dashboard/orgs" },
        {
          title: t("superadmin.nav.newOrganization"),
          url: "/dashboard/orgs/new",
        },
      ],
    },
    {
      title: t("superadmin.nav.services"),
      url: "/dashboard/services",
      icon: FileText,
      items: [
        {
          title: t("superadmin.nav.commonServices"),
          url: "/dashboard/services",
        },
      ],
    },
    {
      title: t("superadmin.nav.posts", "Actualités"),
      url: "/dashboard/posts",
      icon: Newspaper,
      items: [
        {
          title: t("superadmin.nav.allPosts", "Toutes les publications"),
          url: "/dashboard/posts",
        },
        {
          title: t("superadmin.nav.newPost", "Nouvelle publication"),
          url: "/dashboard/posts/new",
        },
      ],
    },
    {
      title: t("superadmin.nav.tutorials", "Tutoriels"),
      url: "/dashboard/tutorials",
      icon: GraduationCap,
      items: [
        {
          title: t("superadmin.nav.allTutorials", "Tous les tutoriels"),
          url: "/dashboard/tutorials",
        },
        {
          title: t("superadmin.nav.newTutorial", "Nouveau tutoriel"),
          url: "/dashboard/tutorials/new",
        },
      ],
    },
    {
      title: t("superadmin.nav.events", "Événements"),
      url: "/dashboard/events",
      icon: Calendar,
      items: [
        {
          title: t("superadmin.nav.allEvents", "Tous les événements"),
          url: "/dashboard/events",
        },
        {
          title: t("superadmin.nav.newEvent", "Nouvel événement"),
          url: "/dashboard/events/new",
        },
      ],
    },
    {
      title: t("superadmin.nav.auditLogs"),
      url: "/dashboard/audit-logs",
      icon: Shield,
    },
    {
      title: t("superadmin.nav.settings"),
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const navData = {
    name:
      user.userData?.firstName && user.userData?.lastName ?
        `${user.userData.firstName} ${user.userData.lastName}`
      : user.userData?.firstName || "Superadmin",
    email: user.userData?.email || "",
    avatar: user.userData?.avatarUrl || "/avatars/default.jpg",
    isPending: user.isPending,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Consulat.ga</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Administration
                  </span>
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
        <NavUser user={navData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
