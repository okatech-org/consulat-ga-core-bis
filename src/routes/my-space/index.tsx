import { api } from "@convex/_generated/api";
import { RequestStatus } from "@convex/lib/validators";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArrowRight,
	Bell,
	Building2,
	Calendar,
	CreditCard,
	FileText,
	Loader2,
	Megaphone,
	TrendingUp,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";

export const Route = createFileRoute("/my-space/")({
	component: UserDashboard,
});

// Status badge helper
function getStatusBadge(
	status: string,
	t: (key: string, fallback: string) => string,
) {
	const config: Record<string, { label: string; className: string }> = {
		[RequestStatus.Draft]: {
			label: t("requests.statuses.draft", "Brouillon"),
			className: "bg-gray-100 text-gray-700 border-gray-200",
		},
		[RequestStatus.Submitted]: {
			label: t("requests.statuses.submitted", "Soumis"),
			className: "bg-blue-100 text-blue-700 border-blue-200",
		},
		[RequestStatus.UnderReview]: {
			label: t("requests.statuses.underReview", "En examen"),
			className: "bg-purple-100 text-purple-700 border-purple-200",
		},
		[RequestStatus.InProduction]: {
			label: t("requests.statuses.inProgress", "En cours"),
			className: "bg-amber-100 text-amber-700 border-amber-200",
		},
		[RequestStatus.Completed]: {
			label: t("requests.statuses.completed", "Terminé"),
			className: "bg-green-100 text-green-700 border-green-200",
		},
		[RequestStatus.Rejected]: {
			label: t("requests.statuses.rejected", "Rejeté"),
			className: "bg-red-100 text-red-700 border-red-200",
		},
		[RequestStatus.Cancelled]: {
			label: t("requests.statuses.cancelled", "Annulé"),
			className: "bg-gray-100 text-gray-500 border-gray-200",
		},
	};

	const statusConfig = config[status] || { label: status, className: "" };
	return (
		<Badge variant="outline" className={statusConfig.className}>
			{statusConfig.label}
		</Badge>
	);
}

function UserDashboard() {
	const { t, i18n } = useTranslation();
	const { data: profile, isPending } = useAuthenticatedConvexQuery(
		api.functions.profiles.getMine,
		{},
	);
	const { data: requests } = useAuthenticatedConvexQuery(
		api.functions.requests.listMine,
		{},
	);
	const { data: appointments } = useAuthenticatedConvexQuery(
		api.functions.appointments.listByUser,
		{},
	);
	const { data: posts } = useQuery(
		convexQuery(api.functions.posts.getLatest, { limit: 3 }),
	);

	const requestsCount = requests?.length ?? 0;
	const appointmentsCount = appointments?.length ?? 0;
	const activeRequests = requests?.filter(
		(r: any) =>
			r.status !== RequestStatus.Completed &&
			r.status !== RequestStatus.Cancelled &&
			r.status !== RequestStatus.Rejected,
	);
	const latestRequest = activeRequests?.[0];

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 h-full">
			{/* Stats Cards - 4 columns, compact */}
			<div className="grid gap-3 grid-cols-2 lg:grid-cols-4 shrink-0">
				<Card className="bg-card p-4">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
						<CardTitle className="text-sm font-medium">
							{t("mySpace.stats.requests", "Mes Demandes")}
						</CardTitle>
						<FileText className="h-3.5 w-3.5 text-muted-foreground" />
					</CardHeader>
					<CardContent className="px-4">
						<div className="text-xl font-bold">{requestsCount}</div>
						<p className="text-xs text-muted-foreground">
							{activeRequests?.length ?? 0}{" "}
							{t("mySpace.stats.inProgress", "en cours")}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-card p-4">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
						<CardTitle className="text-sm font-medium">
							{t("mySpace.stats.appointments", "Rendez-vous")}
						</CardTitle>
						<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
					</CardHeader>
					<CardContent className="px-4">
						<div className="text-xl font-bold">{appointmentsCount}</div>
						<p className="text-xs text-muted-foreground">
							{t("mySpace.stats.scheduled", "programmés")}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-card p-4">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
						<CardTitle className="text-sm font-medium">
							{t("mySpace.stats.documents", "Documents")}
						</CardTitle>
						<CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
					</CardHeader>
					<CardContent className="px-4">
						<div className="text-xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							{t("mySpace.stats.valid", "valides")}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-primary text-primary-foreground p-4">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
						<CardTitle className="text-sm font-medium text-primary-foreground/90">
							{t("mySpace.stats.profile", "Profil")}
						</CardTitle>
						<TrendingUp className="h-3.5 w-3.5 text-primary-foreground/70" />
					</CardHeader>
					<CardContent className="px-4">
						<div className="text-xl font-bold">
							{profile?.completionScore ?? 0}%
						</div>
						<p className="text-xs text-primary-foreground/70">
							{t("mySpace.stats.completion", "complété")}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid - 50/50 split, fills remaining height */}
			<div className="grid gap-3 md:grid-cols-2 flex-1 min-h-0">
				{/* Left Column - Main blocks stacked */}
				<div className="flex flex-col gap-3 min-h-0">
					{/* Current Request Card */}
					<Card className="overflow-hidden">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									{t("mySpace.currentRequest.title", "Demande en cours")}
								</CardTitle>
								{latestRequest && getStatusBadge(latestRequest.status, t)}
							</div>
						</CardHeader>
						<CardContent>
							{latestRequest ? (
								<div className="space-y-4">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-lg truncate">
												{getLocalizedValue(
													latestRequest.service?.name,
													i18n.language,
												) || t("requests.unknownService", "Service")}
											</h3>
											<p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
												<Building2 className="h-3.5 w-3.5" />
												{latestRequest.org?.name ||
													t("requests.unknownOrg", "Consulat")}
											</p>
										</div>
										{latestRequest.reference && (
											<span className="font-mono text-xs bg-muted px-2 py-1 rounded shrink-0">
												{latestRequest.reference}
											</span>
										)}
									</div>

									{/* Timeline Progress */}
									<div className="flex items-center gap-2 py-3">
										{[
											RequestStatus.Submitted,
											RequestStatus.UnderReview,
											RequestStatus.InProduction,
											RequestStatus.Completed,
										].map((step, i) => {
											const isActive = latestRequest.status === step;
											const isPast =
												[
													RequestStatus.Submitted,
													RequestStatus.UnderReview,
													RequestStatus.InProduction,
													RequestStatus.Completed,
												].indexOf(latestRequest.status) > i;
											return (
												<div key={step} className="flex-1 flex items-center">
													<div
														className={`h-2 flex-1 rounded-full ${
															isActive || isPast ? "bg-primary" : "bg-muted"
														}`}
													/>
												</div>
											);
										})}
									</div>

									<div className="flex items-center justify-between pt-2">
										<p className="text-sm text-muted-foreground">
											{t("mySpace.currentRequest.updated", "Mise à jour")}{" "}
											{formatDistanceToNow(
												new Date(latestRequest._creationTime),
												{ addSuffix: true, locale: fr },
											)}
										</p>
										<Button asChild size="sm">
											<Link
												to="/my-space/requests/$requestId"
												params={{ requestId: latestRequest._id }}
											>
												{t(
													"mySpace.currentRequest.viewDetails",
													"Voir les détails",
												)}
												<ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<FileText className="h-12 w-12 mb-4 text-muted-foreground/30" />
									<h3 className="font-medium mb-1">
										{t(
											"mySpace.currentRequest.empty",
											"Aucune demande en cours",
										)}
									</h3>
									<p className="text-sm text-muted-foreground mb-4">
										{t(
											"mySpace.currentRequest.emptyDesc",
											"Commencez une nouvelle démarche consulaire",
										)}
									</p>
									<Button asChild>
										<Link to="/services">
											{t(
												"mySpace.currentRequest.newRequest",
												"Faire une demande",
											)}
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Official Communications Card - fills remaining space */}
					<Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Megaphone className="h-5 w-5" />
									{t(
										"mySpace.communications.title",
										"Communications officielles",
									)}
								</CardTitle>
								<Button asChild variant="ghost" size="sm">
									<Link to="/news">
										{t("mySpace.communications.viewAll", "Tout voir")}
										<ArrowRight className="ml-1 h-4 w-4" />
									</Link>
								</Button>
							</div>
						</CardHeader>
						<CardContent className="flex-1 overflow-y-auto min-h-0">
							{posts && posts.length > 0 ? (
								<div className="space-y-2">
									{posts.map((post: any) => (
										<Link
											key={post._id}
											to="/news/$slug"
											params={{ slug: post.slug }}
											className="block group"
										>
											<div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
												<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
													<Bell className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
														{post.title}
													</h4>
													<p className="text-xs text-muted-foreground mt-0.5">
														{post.publishedAt
															? format(
																	new Date(post.publishedAt),
																	"dd MMM yyyy",
																	{
																		locale: fr,
																	},
																)
															: format(
																	new Date(post._creationTime),
																	"dd MMM yyyy",
																	{
																		locale: fr,
																	},
																)}
													</p>
												</div>
											</div>
										</Link>
									))}
								</div>
							) : (
								<div className="text-center py-6">
									<Megaphone className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
									<p className="text-sm text-muted-foreground">
										{t(
											"mySpace.communications.empty",
											"Aucune communication récente",
										)}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - 2x2 grid, fills height */}
				<div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
					{/* Consular Card Widget */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<CreditCard className="h-4 w-4" />
								{t("mySpace.consularCard.title", "Carte Consulaire")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{profile?.isNational ? (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											{t("mySpace.consularCard.status", "Statut")}
										</span>
										<Badge variant="secondary">
											{t("mySpace.consularCard.notIssued", "Non émise")}
										</Badge>
									</div>
									<Button
										asChild
										variant="outline"
										className="w-full"
										size="sm"
									>
										<Link to="/my-space/registration">
											{t("mySpace.consularCard.request", "Demander")}
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									{t(
										"mySpace.consularCard.notEligible",
										"Réservé aux ressortissants gabonais",
									)}
								</p>
							)}
						</CardContent>
					</Card>
					{/* Associations Widget */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Users className="h-4 w-4" />
								{t("mySpace.associations.title", "Associations")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-center py-4">
								<Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
								<p className="text-sm text-muted-foreground">
									{t("mySpace.associations.empty", "Aucune association")}
								</p>
								<Button variant="link" size="sm" className="mt-1">
									{t("mySpace.associations.discover", "Découvrir")}
								</Button>
							</div>
						</CardContent>
					</Card>
					{/* Upcoming Appointments Widget */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								{t("mySpace.upcomingAppointments.title", "Prochains RDV")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{appointments && appointments.length > 0 ? (
								<div className="space-y-2">
									{appointments.slice(0, 2).map((apt: any) => (
										<div
											key={apt._id}
											className="flex items-center gap-2 text-sm"
										>
											<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
												<Calendar className="h-4 w-4 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">
													{apt.service?.name || "Rendez-vous"}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(new Date(apt.date), "dd MMM à HH:mm", {
														locale: fr,
													})}
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-4">
									<Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
									<p className="text-sm text-muted-foreground">
										{t(
											"mySpace.upcomingAppointments.empty",
											"Aucun rendez-vous prévu",
										)}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
					{/* Reminders Widget */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Bell className="h-4 w-4" />
								{t("mySpace.reminders.title", "Rappels")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-center py-4">
								<Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
								<p className="text-sm text-muted-foreground">
									{t("mySpace.reminders.empty", "Aucun rappel")}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
