"use client";

import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Building2,
	Calendar,
	ChevronsLeft,
	ChevronsRight,
	Crown,
	FileText,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Moon,
	Newspaper,
	Settings,
	Shield,
	Sun,
	Users,
} from "lucide-react";
import { useTheme } from "next-themes";
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

interface SuperadminSidebarProps {
	isExpanded?: boolean;
	onToggle?: () => void;
}

/**
 * Text that fades in/out smoothly when the sidebar expands/collapses.
 * Always stays in the DOM — uses opacity + width transitions instead of
 * conditional rendering to avoid jarring layout shifts.
 */
function SidebarText({
	isExpanded,
	children,
	className,
}: {
	isExpanded: boolean;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"truncate text-sm whitespace-nowrap transition-[opacity] duration-200",
				isExpanded ? "opacity-100 delay-100" : "opacity-0 w-0 overflow-hidden",
				className,
			)}
		>
			{children}
		</span>
	);
}

export function SuperadminSidebar({
	isExpanded = false,
	onToggle,
}: SuperadminSidebarProps) {
	const { user } = useUser();
	const location = useLocation();
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();

	const navItems: NavItem[] = [
		{
			title: t("superadmin.nav.dashboard"),
			url: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: t("superadmin.nav.users"),
			url: "/dashboard/users",
			icon: Users,
		},
		{
			title: t("superadmin.nav.organizations"),
			url: "/dashboard/orgs",
			icon: Building2,
		},
		{
			title: t("superadmin.nav.roles"),
			url: "/dashboard/roles",
			icon: Shield,
		},
		{
			title: t("superadmin.nav.services"),
			url: "/dashboard/services",
			icon: FileText,
		},
		{
			title: t("superadmin.nav.posts"),
			url: "/dashboard/posts",
			icon: Newspaper,
		},
		{
			title: t("superadmin.nav.tutorials"),
			url: "/dashboard/tutorials",
			icon: GraduationCap,
		},
		{
			title: t("superadmin.nav.events"),
			url: "/dashboard/events",
			icon: Calendar,
		},
		{
			title: t("superadmin.nav.associationClaims"),
			url: "/dashboard/association-claims",
			icon: Crown,
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

	const isActive = (url: string) => {
		if (url === "/dashboard") {
			return location.pathname === "/dashboard";
		}
		return location.pathname.startsWith(url);
	};

	const currentLang = i18n.language?.startsWith("fr") ? "fr" : "en";
	const toggleLanguage = () => {
		i18n.changeLanguage(currentLang === "fr" ? "en" : "fr");
	};

	const userName = user?.fullName || user?.username || "Superadmin";
	const userEmail = user?.primaryEmailAddress?.emailAddress || "";
	const userAvatar = user?.imageUrl || "";

	return (
		<TooltipProvider delayDuration={100}>
			<aside
				data-slot="sidebar"
				className={cn(
					"flex flex-col py-3 px-4 bg-card border border-border h-full overflow-hidden",
					"rounded-2xl transition-[width] duration-300 ease-in-out",
					isExpanded ? "w-60 items-stretch" : "w-16 items-center",
				)}
			>
				{/* Header / Logo */}
				<div className={cn("mb-4", isExpanded ? "px-0" : "")}>
					{isExpanded ? (
						<Link
							to="/dashboard"
							className="flex items-center gap-3 px-2 py-1.5"
						>
							<div className="size-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
								<Shield className="size-5 text-primary" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">Consulat.ga</span>
								<span className="truncate text-xs text-muted-foreground">
									Super Administration
								</span>
							</div>
						</Link>
					) : (
						<Link to="/dashboard" className="flex items-center justify-center">
							<div className="size-12 shrink-0 rounded-full bg-secondary flex items-center justify-center">
								<Shield className="size-5 text-primary" />
							</div>
						</Link>
					)}
				</div>

				{/* Navigation Items */}
				<nav
					className={cn(
						"flex flex-col gap-1.5 flex-1",
						!isExpanded && "items-center",
					)}
				>
					{navItems.map((item) => {
						const active = isActive(item.url);
						const button = (
							<Button
								asChild
								variant="ghost"
								size={isExpanded ? "default" : "icon"}
								className={cn(
									"transition-all duration-200",
									isExpanded
										? "w-full justify-start gap-3 px-3 h-10 rounded-xl"
										: "w-11 h-11 rounded-full",
									active
										? "bg-primary/10 text-primary border border-primary/20 font-semibold hover:bg-primary/15 hover:text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-muted",
								)}
							>
								<Link to={item.url}>
									<item.icon className="size-5 shrink-0" />
									<SidebarText isExpanded={isExpanded}>
										{item.title}
									</SidebarText>
									{!isExpanded && <span className="sr-only">{item.title}</span>}
								</Link>
							</Button>
						);

						// In collapsed mode, wrap with Tooltip
						if (!isExpanded) {
							return (
								<Tooltip key={item.title}>
									<TooltipTrigger asChild>{button}</TooltipTrigger>
									<TooltipContent side="right" sideOffset={10}>
										{item.title}
									</TooltipContent>
								</Tooltip>
							);
						}

						return <div key={item.title}>{button}</div>;
					})}
				</nav>

				{/* Bottom Controls */}
				<div
					className={cn(
						"flex flex-col gap-1.5 pt-4 border-t border-border/50",
						!isExpanded && "items-center",
					)}
				>
					{/* Language + Collapse + Dark Mode row */}
					<div
						className={
							"flex items-center gap-1 px-1" + (!isExpanded ? " flex-col" : "")
						}
					>
						{/* Language Toggle */}
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleLanguage}
							className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 px-2"
						>
							<span className="text-base leading-none">
								{currentLang === "fr" ? "🇫🇷" : "🇬🇧"}
							</span>
							<span className="text-xs font-medium uppercase">
								{currentLang}
							</span>
						</Button>

						<div className="flex-1" />

						{/* Toggle Sidebar Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9 text-muted-foreground hover:text-foreground"
									onClick={onToggle}
								>
									{isExpanded ? (
										<ChevronsLeft className="size-4" />
									) : (
										<ChevronsRight className="size-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">
								{isExpanded
									? t("mySpace.nav.collapse")
									: t("mySpace.nav.expand")}
							</TooltipContent>
						</Tooltip>

						{/* Dark Mode Toggle */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
									className="h-9 w-9 text-muted-foreground hover:text-foreground"
								>
									{theme === "dark" ? (
										<Sun className="size-4" />
									) : (
										<Moon className="size-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">
								{theme === "dark" ? t("theme.light") : t("theme.dark")}
							</TooltipContent>
						</Tooltip>
					</div>

					{/* User + Logout */}
					<div
						className={cn(
							"flex items-center gap-3 pt-2 border-t border-border/50",
							isExpanded ? "px-1" : "justify-center",
						)}
					>
						<Avatar className="h-9 w-9 rounded-full shrink-0">
							<AvatarImage src={userAvatar} alt={userName} />
							<AvatarFallback className="rounded-full text-xs">
								{userName
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()
									.slice(0, 2)}
							</AvatarFallback>
						</Avatar>
						{isExpanded && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{userName}</p>
								<p className="text-xs text-muted-foreground truncate">
									{userEmail}
								</p>
							</div>
						)}
						<SignOutButton>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
									>
										<LogOut className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top">{t("common.logout")}</TooltipContent>
							</Tooltip>
						</SignOutButton>
					</div>
				</div>
			</aside>
		</TooltipProvider>
	);
}
