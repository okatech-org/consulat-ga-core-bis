"use client";

import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Building2,
	Calendar,
	FileText,
	FolderOpen,
	LayoutGrid,
	LogOut,
	Settings,
	Sparkles,
	User,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
	title: string;
	url: string;
	icon: React.ElementType;
}

export function MySpaceSidebar() {
	const { user, isLoaded } = useUser();
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
			title: t("mySpace.nav.documents", "Mes documents"),
			url: "/my-space/documents",
			icon: FolderOpen,
		},
		{
			title: t("mySpace.nav.cv", "Mon iCV"),
			url: "/my-space/cv",
			icon: Sparkles,
		},
		{
			title: t("mySpace.nav.children", "Mes enfants"),
			url: "/my-space/children",
			icon: Users,
		},
		{
			title: t("mySpace.nav.associations", "Associations"),
			url: "/my-space/associations",
			icon: Users,
		},
		{
			title: t("mySpace.nav.companies", "Entreprises"),
			url: "/my-space/companies",
			icon: Building2,
		},
		{
			title: t("mySpace.nav.profile", "Mon profil"),
			url: "/my-space/profile",
			icon: User,
		},
	];

	const isActive = (url: string) => {
		if (url === "/my-space") {
			return location.pathname === "/my-space";
		}
		return location.pathname.startsWith(url);
	};

	return (
		<TooltipProvider delayDuration={100}>
			<aside className="flex flex-col items-center py-3 px-2 bg-card rounded-full border border-border h-full w-16">
				{/* Navigation Items */}
				<nav className="flex flex-col items-center gap-2 flex-1">
					{navItems.map((item) => (
						<Tooltip key={item.url}>
							<TooltipTrigger asChild>
								<Button
									asChild
									variant="ghost"
									size="icon"
									className={cn(
										"w-11 h-11 rounded-full transition-all",
										isActive(item.url)
											? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-muted",
									)}
								>
									<Link to={item.url}>
										<item.icon className="size-6" />
										<span className="sr-only">{item.title}</span>
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right" sideOffset={10}>
								{item.title}
							</TooltipContent>
						</Tooltip>
					))}
				</nav>

				{/* Bottom Actions */}
				<div className="flex flex-col items-center gap-2 pt-4 border-t border-border/50">
					{/* Settings */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								asChild
								variant="ghost"
								size="icon"
								className="w-11 h-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
							>
								<Link to="/my-space/settings">
									<Settings className="size-5" />
									<span className="sr-only">
										{t("mySpace.nav.settings", "Paramètres")}
									</span>
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={10}>
							{t("mySpace.nav.settings", "Paramètres")}
						</TooltipContent>
					</Tooltip>

					{/* Logout */}
					<Tooltip>
						<TooltipTrigger asChild>
							<SignOutButton>
								<Button
									variant="ghost"
									size="icon"
									className="w-11 h-11 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
								>
									<LogOut className="size-5" />
									<span className="sr-only">
										{t("common.logout", "Se déconnecter")}
									</span>
								</Button>
							</SignOutButton>
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={10}>
							{t("common.logout", "Se déconnecter")}
						</TooltipContent>
					</Tooltip>

					{/* User Avatar */}
					{isLoaded && user && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Link to="/my-space/profile" className="mt-2">
									<Avatar className="w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
										<AvatarImage
											src={user.imageUrl}
											alt={user.fullName || ""}
										/>
										<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
											{user.firstName?.charAt(0) ||
												user.username?.charAt(0) ||
												"U"}
										</AvatarFallback>
									</Avatar>
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right" sideOffset={10}>
								{user.fullName ||
									user.username ||
									t("mySpace.nav.profile", "Mon profil")}
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</aside>
		</TooltipProvider>
	);
}
