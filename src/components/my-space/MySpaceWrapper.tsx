import { Link, useLocation } from "@tanstack/react-router";
import { BellDotIcon, MessageCircle, SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface MySpaceWrapperProps {
	children: React.ReactNode;
	className?: string;
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
	return (
		<div className={cn("bg-background-dashboard px-6 lg:px-10", className)}>
			<MySpaceHeader />
			{children}
		</div>
	);
}

const screensTyTitles = [
	{
		path: "/my-space",
		title: "mySpace.screens.titles.index",
	},
	{
		path: "/my-space/profile",
		title: "mySpace.screens.titles.profile",
	},
	{
		path: "/my-space/appointments",
		title: "mySpace.screens.titles.appointments",
	},
	{
		path: "/my-space/requests",
		title: "mySpace.screens.titles.requests",
	},
	{
		path: "/my-space/onboarding",
		title: "mySpace.screens.titles.onboarding",
	},
];

function MySpaceHeader() {
	const { userData, isPending } = useUserData();
	const location = useLocation();

	const screenTitle = screensTyTitles.find(
		(screen) => screen.path === location.pathname,
	)?.title;

	const { t } = useTranslation();
	return (
		<header className="bg-background-dashboard flex items-center justify-between gap-6 py-6">
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
						{t("common.greeting", {
							firstName: userData?.firstName ?? userData?.name ?? "",
						})}
					</h1>
					{screenTitle && (
						<p className="text-muted-foreground">{t(screenTitle)}</p>
					)}
				</div>

				<div className="flex items-center gap-4">
					<SearchBar />
					<Button
						variant="ghost"
						className="h-10 w-10 bg-background aspect-square rounded-full"
					>
						<MessageCircle className="size-5" />
					</Button>
					<Button
						variant="ghost"
						className="h-10 w-10 bg-background aspect-square rounded-full"
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
		<div className="relative">
			<Input
				className="lg:min-w-64 min-h-10 rounded-full bg-background px-4"
				name="search"
				type="text"
				placeholder="Rechercher"
			/>
			<SearchIcon className="right-0 top-1/2 -translate-y-1/2 -translate-x-1/4 absolute p-1 rounded-full size-7" />
		</div>
	);
}
