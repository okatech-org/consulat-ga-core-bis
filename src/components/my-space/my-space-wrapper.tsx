import { api } from "@convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { Building2, Plane, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useUserData } from "@/hooks/use-user-data";
import {
	ConsularThemeContext,
	useConsularThemeState,
} from "@/hooks/useConsularTheme";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ConsularNotificationDialog } from "./ConsularNotificationDialog";
import { ConsularRegistrationDialog } from "./ConsularRegistrationDialog";
import { MobileNavBar } from "./mobile-nav-bar";
import { MySpaceSidebar } from "./my-space-sidebar";

const SIDEBAR_STORAGE_KEY = "myspace-sidebar-expanded";

interface MySpaceWrapperProps {
	children: React.ReactNode;
	className?: string;
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
	const consularThemeValue = useConsularThemeState();

	const [isExpanded, setIsExpanded] = useState(() => {
		try {
			const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
			return stored === null ? true : stored === "true";
		} catch {
			return true;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isExpanded));
		} catch {
			// Ignore localStorage errors
		}
	}, [isExpanded]);

	return (
		<ConsularThemeContext.Provider value={consularThemeValue}>
			<div
				className={cn(
					"relative overflow-hidden h-screen gap-6 flex bg-background",
					consularThemeValue.consularTheme === "homeomorphism" &&
						"theme-homeomorphism",
				)}
			>
				<div className="hidden md:block p-6 pr-0!">
					<MySpaceSidebar
						isExpanded={isExpanded}
						onToggle={() => setIsExpanded((prev) => !prev)}
					/>
				</div>
				<main
					className={cn(
						"flex-1 min-h-full overflow-y-auto p-6 pb-24 md:pb-6 md:pl-0!",
						className,
					)}
				>
					{children}
				</main>
				<MobileNavBar />
			</div>
		</ConsularThemeContext.Provider>
	);
}

export function MySpaceHeader() {
	const { userData, profile } = useUserData();
	const { t } = useTranslation();

	// Get consular registration data for "Dossier consulaire" display
	const { data: registrations } = useAuthenticatedConvexQuery(
		api.functions.consularRegistrations.listByProfile,
		{},
	);
	const latestRegistration = registrations?.[0];

	// Get the request linked to the registration for reference & org
	const { data: registrationRequest } = useAuthenticatedConvexQuery(
		api.functions.requests.getById,
		latestRegistration?.requestId
			? { requestId: latestRegistration.requestId }
			: "skip",
	);

	const requestReference = registrationRequest?.reference;
	const orgName = (registrationRequest?.org as any)?.name;

	// Check if user needs consular registration CTA
	const needsRegistration =
		!latestRegistration &&
		profile?.userType &&
		profile.userType === "long_stay";

	// Check if user can do signalement (both long_stay and short_stay)
	const canNotify =
		profile?.userType &&
		(profile.userType === "long_stay" || profile.userType === "short_stay");

	const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
	const [showNotificationDialog, setShowNotificationDialog] = useState(false);

	return (
		<>
			<header className="w-full flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				{/* Left: Greeting + Dossier */}
				<div className="flex flex-col gap-3">
					<h1 className="text-lg md:text-2xl font-bold">
						{t("common.greeting", {
							firstName: userData?.firstName ?? userData?.name ?? "",
						})}
					</h1>
					{latestRegistration && (
						<div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
							<span className="font-medium text-foreground">
								{t("mySpace.header.dossier")} :
							</span>
							{requestReference && (
								<span className="font-mono text-xs font-semibold text-primary">
									{requestReference}
								</span>
							)}
							{orgName && (
								<span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
									<Building2 className="h-3 w-3" />
									<span>{t("mySpace.header.managedBy")}:</span>
									<span className="font-medium">{orgName}</span>
								</span>
							)}
						</div>
					)}
					{needsRegistration && (
						<Button
							variant="outline"
							size="xs"
							className="w-max rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-1.5"
							onClick={() => setShowRegistrationDialog(true)}
						>
							<Building2 className="h-3.5 w-3.5" />
							{t(
								"mySpace.registration.cta",
								"Faire mon inscription consulaire",
							)}
						</Button>
					)}
				</div>

				{/* Right: Action buttons */}
				<div className="flex items-center gap-2 md:gap-3">
					{/* Signaler mon déplacement */}
					{canNotify && (
						<Button
							variant="outline"
							size="sm"
							className="hidden md:flex"
							onClick={() => setShowNotificationDialog(true)}
						>
							<Plane className="mr-1.5 h-4 w-4" />
							{t("mySpace.notification.cta")}
						</Button>
					)}
					{/* Nouvelle demande */}
					<Button size="sm" asChild>
						<Link to="/my-space/services">
							<Plus className="mr-1.5 h-4 w-4" />
							{t("mySpace.actions.newRequest")}
						</Link>
					</Button>
					{/* Notifications only */}
					<NotificationDropdown className="h-9 w-9 md:h-10 md:w-10 bg-card" />
				</div>
			</header>

			<ConsularRegistrationDialog
				open={showRegistrationDialog}
				onOpenChange={setShowRegistrationDialog}
			/>
			<ConsularNotificationDialog
				open={showNotificationDialog}
				onOpenChange={setShowNotificationDialog}
			/>
		</>
	);
}
