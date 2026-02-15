"use client";

import { Link, useLocation } from "@tanstack/react-router";
import {
	BookOpen,
	Building2,
	Calendar,
	ChevronsLeft,
	ChevronsRight,
	ClipboardList,
	Crown,
	LayoutDashboard,
	Moon,
	Newspaper,
	ScrollText,
	Settings,
	ShieldCheck,
	Sun,
	Users,
	Wrench,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { LogoutButton } from "@/components/sidebars/logout-button";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────
interface NavItem {
	title: string;
	url: string;
	icon: React.ElementType;
}

interface NavSection {
	label: string;
	items: NavItem[];
}

interface SuperadminSidebarProps {
	isExpanded?: boolean;
	onToggle?: () => void;
}

// ─── Sub-components ─────────────────────────────────────

/**
 * Text that fades in/out smoothly when the sidebar expands/collapses.
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

// ─── Main Component ─────────────────────────────────────
export function SuperadminSidebar({
	isExpanded = false,
	onToggle,
}: SuperadminSidebarProps) {
	const location = useLocation();
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();
	const user = useUserData();

	// ─── Navigation Sections ────────────────────────────
	const navSections: NavSection[] = [
		{
			label: "Commandes",
			items: [
				{
					title: t("superadmin.nav.dashboard"),
					url: "/dashboard",
					icon: LayoutDashboard,
				},
			],
		},
		{
			label: "Réseau consulaire",
			items: [
				{
					title: t("superadmin.nav.organizations"),
					url: "/dashboard/orgs",
					icon: Building2,
				},
				{
					title: t("superadmin.nav.users"),
					url: "/dashboard/users",
					icon: Users,
				},
			],
		},
		{
			label: "Référentiels",
			items: [
				{
					title: t("superadmin.nav.services"),
					url: "/dashboard/services",
					icon: Wrench,
				},
				{
					title: t("superadmin.nav.requests", "Demandes"),
					url: "/dashboard/requests",
					icon: ClipboardList,
				},
			],
		},
		{
			label: "Configuration",
			items: [
				{
					title: t("superadmin.nav.roles"),
					url: "/dashboard/roles",
					icon: ShieldCheck,
				},
			],
		},
		{
			label: "Sécurité",
			items: [
				{
					title: t("superadmin.nav.auditLogs"),
					url: "/dashboard/audit-logs",
					icon: ScrollText,
				},
			],
		},
		{
			label: "Contenu",
			items: [
				{
					title: t("superadmin.nav.posts"),
					url: "/dashboard/posts",
					icon: Newspaper,
				},
				{
					title: t("superadmin.nav.tutorials"),
					url: "/dashboard/tutorials",
					icon: BookOpen,
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
			],
		},
		{
			label: "Système",
			items: [
				{
					title: t("superadmin.nav.settings"),
					url: "/dashboard/settings",
					icon: Settings,
				},
			],
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

	return (
		<TooltipProvider delayDuration={100}>
			<aside
				data-slot="sidebar"
				className={cn(
					"flex flex-col py-3 px-3 bg-card border border-border h-full overflow-hidden",
					"rounded-2xl transition-[width] duration-300 ease-in-out",
					isExpanded ? "w-64 items-stretch" : "w-16 items-center",
				)}
			>
				{/* ─── Logo ─────────────────────────────────── */}
				<div className={cn("mb-3", isExpanded ? "px-2" : "")}>
					<Link
						to="/dashboard"
						className={"flex items-center" + (isExpanded ? " gap-2" : "")}
					>
						<div className="size-10 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
							<ShieldCheck className="size-5 text-primary" />
						</div>
						<div
							className={cn(
								"flex flex-col text-foreground transition-[opacity] duration-200 overflow-hidden whitespace-nowrap",
								isExpanded ? "opacity-100 delay-100" : "opacity-0 w-0",
							)}
						>
							<span className="text-sm font-bold">CONSULAT.GA</span>
							<span className="text-foreground/60 text-xs">
								Super Administration
							</span>
						</div>
					</Link>
				</div>

				{/* ─── Navigation ───────────────────────────── */}
				<nav
					className={cn(
						"flex flex-col gap-0.5 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin",
						!isExpanded && "items-center",
					)}
				>
					{navSections.map((section, sectionIdx) => (
						<div key={section.label}>
							{/* Section separator */}
							{sectionIdx > 0 && (
								<div
									className={cn(
										"my-2",
										isExpanded
											? "border-t border-border/40 pt-2"
											: "border-t border-border/40 pt-2 w-8",
									)}
								/>
							)}

							{/* Section label (expanded only) */}
							{isExpanded && (
								<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1 block">
									{section.label}
								</span>
							)}

							{/* Items */}
							{section.items.map((item) => {
								const active = isActive(item.url);
								const button = (
									<Button
										asChild
										variant="ghost"
										size={isExpanded ? "default" : "icon"}
										className={cn(
											"transition-all duration-200 group/item",
											isExpanded
												? "w-full justify-start gap-3 px-3 h-9 rounded-xl"
												: "w-11 h-11 rounded-full",
											active
												? "bg-primary/10 text-primary border border-primary/20 font-semibold hover:bg-primary/15 hover:text-primary"
												: "text-muted-foreground hover:text-foreground hover:bg-muted",
										)}
									>
										<Link to={item.url}>
											<item.icon className="size-[18px] shrink-0" />
											<SidebarText isExpanded={isExpanded}>
												{item.title}
											</SidebarText>
											{!isExpanded && (
												<span className="sr-only">{item.title}</span>
											)}
										</Link>
									</Button>
								);

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
						</div>
					))}
				</nav>

				{/* ─── Footer Controls ──────────────────────── */}
				<div
					className={cn(
						"flex flex-col gap-1.5 pt-3 border-t border-border/50",
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

					{/* User info + Logout */}
					<div
						className={cn(
							"flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50",
							!isExpanded && "justify-center px-0 bg-transparent",
						)}
					>
						<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
							<span className="text-xs font-bold text-primary">
								{user.userData?.firstName?.[0] || "A"}
							</span>
						</div>
						{isExpanded && (
							<>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium truncate">
										{user.userData?.firstName && user.userData?.lastName
											? `${user.userData.firstName} ${user.userData.lastName}`
											: user.userData?.firstName || "Admin"}
									</p>
									<p className="text-[10px] text-muted-foreground truncate">
										{user.userData?.email || ""}
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
