"use client";

import { useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	BarChart3,
	Briefcase,
	Calendar,
	FileText,
	Home,
	Newspaper,
	Settings2,
	Users,
} from "lucide-react";
import { NavUser } from "@/components/sidebars/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { OrgSwitcher } from "./org-switcher";

export function OrgSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useUser();
	const location = useLocation();

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
			title: "Statistiques",
			url: "/dashboard/statistics",
			icon: BarChart3,
			isActive: location.pathname.startsWith("/dashboard/statistics"),
		},
		{
			title: "Actualités",
			url: "/dashboard/posts",
			icon: Newspaper,
			isActive: location.pathname.startsWith("/dashboard/posts"),
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
	];

	const navUser = user
		? {
				name: user.fullName || user.username || "User",
				email: user.primaryEmailAddress?.emailAddress || "",
				avatar: user.imageUrl,
			}
		: {
				name: "Loading...",
				email: "",
				avatar: "",
			};

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
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={item.isActive}
									>
										<Link to={item.url}>
											<item.icon />
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
	);
}
