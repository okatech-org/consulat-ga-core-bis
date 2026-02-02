"use client";

import { useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	BarChart3,
	Briefcase,
	Calendar,
	CreditCard,
	FileText,
	Home,
	IdCard,
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
			url: "/admin",
			icon: Home,
			isActive: location.pathname === "/admin",
		},
		{
			title: "Services",
			url: "/admin/services",
			icon: Briefcase,
			isActive: location.pathname.startsWith("/admin/services"),
		},
		{
			title: "Demandes",
			url: "/admin/requests",
			icon: FileText,
			isActive: location.pathname.startsWith("/admin/requests"),
		},
		{
			title: "Dossiers Consulaires",
			url: "/admin/consular-registry",
			icon: IdCard,
			isActive: location.pathname.startsWith("/admin/consular-registry"),
		},
		{
			title: "Rendez-vous",
			url: "/admin/appointments",
			icon: Calendar,
			isActive: location.pathname.startsWith("/admin/appointments"),
		},
		{
			title: "Calendrier",
			url: "/admin/calendar",
			icon: Calendar,
			isActive: location.pathname.startsWith("/admin/calendar"),
		},
		{
			title: "Statistiques",
			url: "/admin/statistics",
			icon: BarChart3,
			isActive: location.pathname.startsWith("/admin/statistics"),
		},
		{
			title: "Paiements",
			url: "/admin/payments",
			icon: CreditCard,
			isActive: location.pathname.startsWith("/admin/payments"),
		},
		{
			title: "Actualités",
			url: "/admin/posts",
			icon: Newspaper,
			isActive: location.pathname.startsWith("/admin/posts"),
		},
		{
			title: "Équipe",
			url: "/admin/team",
			icon: Users,
			isActive: location.pathname.startsWith("/admin/team"),
		},
		{
			title: "Paramètres",
			url: "/admin/settings",
			icon: Settings2,
			isActive: location.pathname.startsWith("/admin/settings"),
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
