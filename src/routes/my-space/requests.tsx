import { api } from "@convex/_generated/api";
import type { RequestStatus } from "@convex/lib/constants";
import { RequestStatus as RequestStatusEnum } from "@convex/lib/constants";
import {
	createFileRoute,
	Link,
	Outlet,
	useParams,
} from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArrowRight,
	Building2,
	Calendar,
	FileText,
	Loader2,
	PlayCircle,
	PlusCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { REQUEST_STATUS_CONFIG } from "@/lib/request-status-config";

export const Route = createFileRoute("/my-space/requests")({
	component: RequestsLayout,
});

function RequestsLayout() {
	// Check if we're on a child route
	const params = useParams({ strict: false });
	const hasChildRoute = "requestId" in params;

	// If we have a child route, just render the Outlet
	if (hasChildRoute) {
		return <Outlet />;
	}

	// Otherwise render the requests list
	return <RequestsPage />;
}

function RequestsPage() {
	const { t, i18n } = useTranslation();
	const { data: requests, isPending } = useAuthenticatedConvexQuery(
		api.functions.requests.listMine,
		{},
	);

	const getStatusBadge = (status: string) => {
		const typedStatus = status as RequestStatus;
		const config = REQUEST_STATUS_CONFIG[typedStatus];

		return (
			<Badge variant="outline" className={config?.className ?? ""}>
				{config ? t(config.i18nKey, config.fallback) : status}
			</Badge>
		);
	};

	if (isPending) {
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="animate-spin h-8 w-8 text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-1">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="flex items-center justify-between"
			>
				<div>
					<h1 className="text-2xl font-bold">
						{t("mySpace.screens.requests.heading", "Mes Demandes")}
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{t(
							"mySpace.screens.requests.subtitle",
							"Suivez vos demandes de services consulaires",
						)}
					</p>
				</div>
				<Button asChild>
					<Link to="/services">
						<PlusCircle className="mr-2 h-4 w-4" />
						{t("requests.new", "Nouvelle demande")}
					</Link>
				</Button>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.1 }}
			>
				{!requests || requests.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<FileText className="h-16 w-16 mb-4 text-muted-foreground/30" />
							<h3 className="text-lg font-medium mb-2">
								{t("requests.empty.title", "Aucune demande")}
							</h3>
							<p className="text-muted-foreground mb-6 max-w-sm">
								{t(
									"requests.empty.desc",
									"Vous n'avez pas encore effectué de demande de service consulaire.",
								)}
							</p>
							<Button asChild>
								<Link to="/services">
									<PlusCircle className="mr-2 h-4 w-4" />
									{t("requests.empty.action", "Découvrir les services")}
								</Link>
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{requests.map((request) => (
							<Link
								key={request._id}
								to="/my-space/requests/$requestId"
								params={{ requestId: request._id }}
								className="block group"
							>
								<Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold truncate group-hover:text-primary transition-colors">
													{getLocalizedValue(
														request.service?.name as
															| { fr: string; en?: string }
															| undefined,
														i18n.language,
													) || t("requests.unknownService", "Service inconnu")}
												</h3>
												<p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
													<Building2 className="h-3 w-3 shrink-0" />
													{request.org?.name ||
														t("requests.unknownOrg", "Organisme")}
												</p>
											</div>
											{getStatusBadge(request.status)}
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="h-3.5 w-3.5" />
													{format(
														new Date(request._creationTime),
														"dd MMM yyyy",
														{ locale: fr },
													)}
												</span>
												{request.reference && (
													<span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
														{request.reference}
													</span>
												)}
											</div>
											<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
										</div>
										{request.status === RequestStatusEnum.Draft && (
											<Button size="sm" className="w-full mt-3">
												<PlayCircle className="mr-2 h-4 w-4" />
												{t("requests.resumeDraft", "Reprendre la demande")}
											</Button>
										)}
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
}
