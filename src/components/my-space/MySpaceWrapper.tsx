import { Link, useLocation } from "@tanstack/react-router";
import { BellDotIcon, MessageCircle, SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MySpaceSidebar } from "./MySpaceSidebar";

interface MySpaceWrapperProps {
	children: React.ReactNode;
	className?: string;
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
	return (
		<div className="flex flex-col gap-4 h-screen bg-background">
			{/* Header - Full width at top */}
			<MySpaceHeader />

			{/* Content area with sidebar */}
			<div className="flex flex-1 overflow-hidden px-6 pb-4 gap-4">
				{/* Sidebar - Hidden on mobile */}
				<div className="hidden md:block">
					<MySpaceSidebar />
				</div>

				{/* Main content */}
				<main className={cn("flex-1 p-1 overflow-y-auto", className)}>
					{children}
				</main>
			</div>
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
		<header className="flex items-center justify-between gap-6 py-4 px-6">
			<div>
				<Link to="/" className="flex gap-3">
					<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
						<span className="text-white font-bold text-lg">GA</span>
					</div>
				</Link>
			</div>
			<div className="flex justify-between flex-1">
				<div className="flex flex-col">
					<h1 className="text-2xl font-bold">
						{heading ||
							t("common.greeting", {
								firstName: userData?.firstName ?? userData?.name ?? "",
							})}
					</h1>
					{subtitle && <p className="text-muted-foreground">{subtitle}</p>}
				</div>

				<div className="flex items-center gap-3">
					<SearchBar />
					<Button
						variant="ghost"
						size="icon"
						className="h-10 w-10 bg-card rounded-full"
					>
						<MessageCircle className="size-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-10 w-10 bg-card rounded-full"
					>
						<BellDotIcon className="size-5" />
					</Button>
				</div>
			</div>
		</header>
	);
}

function SearchBar() {
	return (
		<div className="relative hidden sm:block">
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
