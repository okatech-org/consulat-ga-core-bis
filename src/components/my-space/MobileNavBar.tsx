"use client";

import { Link, useLocation } from "@tanstack/react-router";
import { Calendar, FileText, LayoutGrid, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface NavItem {
	title: string;
	url: string;
	icon: React.ElementType;
}

export function MobileNavBar() {
	const location = useLocation();
	const { t } = useTranslation();

	const navItems: NavItem[] = [
		{
			title: t("mySpace.nav.dashboard", "Tableau de bord"),
			url: "/my-space",
			icon: LayoutGrid,
		},
		{
			title: t("mySpace.nav.requests", "Mes demandes"),
			url: "/my-space/requests",
			icon: FileText,
		},
		{
			title: t("mySpace.nav.appointments", "Rendez-vous"),
			url: "/my-space/appointments",
			icon: Calendar,
		},
		{
			title: t("mySpace.nav.profile", "Mon profil"),
			url: "/my-space/profile",
			icon: User,
		},
		{
			title: t("mySpace.nav.settings", "Paramètres"),
			url: "/my-space/settings",
			icon: Settings,
		},
	];

	const isActive = (url: string) => {
		if (url === "/my-space") {
			return location.pathname === "/my-space";
		}
		return location.pathname.startsWith(url);
	};

	return (
		<nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
			<div className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-full shadow-lg backdrop-blur-sm">
				{navItems.map((item) => (
					<Link
						key={item.url}
						to={item.url}
						className={cn(
							"flex items-center justify-center w-11 h-11 rounded-full transition-all",
							isActive(item.url)
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground hover:bg-muted",
						)}
					>
						<item.icon className="size-5" />
						<span className="sr-only">{item.title}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
