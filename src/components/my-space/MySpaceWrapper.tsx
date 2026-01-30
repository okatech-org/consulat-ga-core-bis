import { Link, useLocation } from "@tanstack/react-router";
import { BellDotIcon, SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MobileNavBar } from "./MobileNavBar";
import { MySpaceSidebar } from "./MySpaceSidebar";

interface MySpaceWrapperProps {
	children: React.ReactNode;
	className?: string;
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
	return (
		<div className="flex flex-col gap-4 h-screen bg-background overflow-x-hidden">
			{/* Header - Full width at top */}
			<MySpaceHeader />

			{/* Content area with sidebar */}
			<div className="flex flex-1 overflow-hidden px-4 md:px-6 pb-20 md:pb-4 gap-4">
				{/* Sidebar - Hidden on mobile */}
				<div className="hidden md:block">
					<MySpaceSidebar />
				</div>

				{/* Main content */}
				<main
					className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
				>
					{children}
				</main>
			</div>

			{/* Mobile Navigation Bar - Only visible on mobile */}
			<MobileNavBar />
		</div>
	);
}

const screensConfig = [
	{ path: "/my-space", key: "index" },
	{ path: "/my-space/profile", key: "profile" },
	{ path: "/my-space/appointments", key: "appointments" },
	{ path: "/my-space/requests", key: "requests" },
	{ path: "/my-space/documents", key: "documents" },
	{ path: "/my-space/onboarding", key: "onboarding" },
	{ path: "/my-space/settings", key: "settings" },
	{ path: "/my-space/notifications", key: "notifications" },
];

function MySpaceHeader() {
	const { userData } = useUserData();
	const location = useLocation();

	const currentScreen = screensConfig.find(
		(screen) => screen.path === location.pathname,
	);

	const { t } = useTranslation();

	const heading = currentScreen
		? t(`mySpace.screens.${currentScreen.key}.heading`)
		: null;
	const subtitle = currentScreen
		? t(`mySpace.screens.${currentScreen.key}.subtitle`)
		: null;

	return (
		<header className="flex items-center justify-between gap-4 md:gap-6 p-4 bg-background/80 backdrop-blur-md md:bg-transparent md:backdrop-blur-none">
			{/* Logo - hidden on mobile */}
			<div className="hidden md:block">
				<Link to="/" className="flex gap-3">
					<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
						<span className="text-white font-bold text-lg">GA</span>
					</div>
				</Link>
			</div>

			{/* Title and subtitle */}
			<div className="flex justify-between flex-1">
				<div className="flex flex-col">
					<h1 className="text-lg md:text-2xl font-bold">
						{heading ||
							t("common.greeting", {
								firstName: userData?.firstName ?? userData?.name ?? "",
							})}
					</h1>
					{/* Subtitle - hidden on mobile */}
					{subtitle && (
						<p className="text-muted-foreground hidden md:block">{subtitle}</p>
					)}
				</div>

				{/* Action buttons */}
				<div className="flex items-center gap-2 md:gap-3">
					<SearchBar />
					{/* Search icon on mobile */}
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 md:hidden bg-card rounded-full"
					>
						<SearchIcon className="size-4" />
					</Button>
					<Button
						asChild
						variant="ghost"
						size="icon"
						className="h-9 w-9 md:h-10 md:w-10 bg-card rounded-full"
					>
						<Link to="/my-space/notifications">
							<BellDotIcon className="size-4 md:size-5" />
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}

function SearchBar() {
	return (
		<div className="relative hidden md:block">
			<Input
				className="lg:min-w-64 min-h-10 rounded-full bg-card px-4 pr-10"
				name="search"
				type="text"
				placeholder="Rechercher"
			/>
			<SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
		</div>
	);
}
