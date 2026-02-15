"use client";

import { useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	BarChart3,
	Briefcase,
	Calendar,
	ChevronsLeft,
	ChevronsRight,
	CreditCard,
	Crown,
	FileText,
	Home,
	IdCard,
	Moon,
	Newspaper,
	Settings2,
	Sun,
	Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { LogoutButton } from "@/components/sidebars/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "./org-switcher";

interface NavItem {
	title: string;
	url: string;
	icon: React.ElementType;
}

interface OrgSidebarProps {
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

export function OrgSidebar({ isExpanded = false, onToggle }: OrgSidebarProps) {
	const { user } = useUser();
	const location = useLocation();
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();

	const navItems: NavItem[] = [
		{
			title: "Dashboard",
			url: "/admin",
			icon: Home,
		},
		{
			title: "Services",
			url: "/admin/services",
			icon: Briefcase,
		},
		{
			title: t("admin.nav.requests"),
			url: "/admin/requests",
			icon: FileText,
		},
		{
			title: t("admin.nav.consularRegistry"),
			url: "/admin/consular-registry",
			icon: IdCard,
		},
		{
			title: t("admin.nav.appointments"),
			url: "/admin/appointments",
			icon: Calendar,
		},
		{
			title: t("admin.nav.statistics"),
			url: "/admin/statistics",
			icon: BarChart3,
		},
		{
			title: t("admin.nav.payments"),
			url: "/admin/payments",
			icon: CreditCard,
		},
		{
			title: t("admin.nav.posts"),
			url: "/admin/posts",
			icon: Newspaper,
		},
		{
			title: t("admin.nav.team"),
			url: "/admin/team",
			icon: Users,
		},
		{
			title: t("admin.nav.roles"),
			url: "/admin/roles",
			icon: Crown,
		},
		{
			title: t("admin.nav.settings"),
			url: "/admin/settings",
			icon: Settings2,
		},
	];

	const isActive = (url: string) => {
		if (url === "/admin") {
			return location.pathname === "/admin";
		}
		return location.pathname.startsWith(url);
	};

	const currentLang = i18n.language?.startsWith("fr") ? "fr" : "en";
	const toggleLanguage = () => {
		i18n.changeLanguage(currentLang === "fr" ? "en" : "fr");
	};

	const userName = user?.fullName || user?.username || "User";
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
				{/* Org Switcher */}
				<div className={cn("mb-4", isExpanded ? "px-0" : "")}>
					{isExpanded ? (
						<OrgSwitcher />
					) : (
						<Link to="/admin" className="flex items-center justify-center">
							<div className="size-12 shrink-0 rounded-full bg-secondary flex items-center justify-center">
								<span className="text-primary font-bold text-2xl">C</span>
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
							<>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{userName}</p>
									<p className="text-xs text-muted-foreground truncate">
										{userEmail}
									</p>
								</div>
								<LogoutButton />
							</>
						)}
						{!isExpanded && <LogoutButton tooltipSide="right" />}
					</div>
				</div>
			</aside>
		</TooltipProvider>
	);
}
