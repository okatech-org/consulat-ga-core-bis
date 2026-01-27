import { api } from "@convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowRight,
	Calendar,
	FileText,
	Flag,
	Loader2,
	User,
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

export const Route = createFileRoute("/my-space/")({
	component: UserDashboard,
});

function UserDashboard() {
	const { t } = useTranslation();
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

	const requestsCount = requests?.length ?? 0;
	const appointmentsCount = appointments?.length ?? 0;

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Profile Completion Alert */}
			{profile && (profile.completionScore ?? 0) < 100 && (
				<Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
					<CardContent className="flex items-center gap-4 p-4">
						<AlertCircle className="h-8 w-8 text-amber-600" />
						<div className="flex-1">
							<p className="font-medium text-amber-900 dark:text-amber-100">
								{t("mySpace.completeProfile.title", "Complétez votre profil")}
							</p>
							<p className="text-sm text-amber-700 dark:text-amber-300">
								{t(
									"mySpace.completeProfile.description",
									"Un profil complet facilite vos démarches administratives.",
								)}
							</p>
						</div>
						<Button
							asChild
							variant="outline"
							className="border-amber-600 text-amber-700 hover:bg-amber-100"
						>
							<Link to="/my-space/profile">
								{t("mySpace.completeProfile.button", "Compléter")}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("mySpace.stats.requests", "Mes Demandes")}
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{requestsCount}</div>
						<p className="text-xs text-muted-foreground">
							{requestsCount === 0
								? t("mySpace.stats.noRequests", "Aucune demande en cours")
								: t("mySpace.stats.requestsCount", "demande(s) en cours")}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("mySpace.stats.appointments", "Mes Rendez-vous")}
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{appointmentsCount}</div>
						<p className="text-xs text-muted-foreground">
							{appointmentsCount === 0
								? t("mySpace.stats.noAppointments", "Aucun rendez-vous prévu")
								: t("mySpace.stats.appointmentsCount", "rendez-vous prévu(s)")}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("mySpace.stats.profile", "Mon Profil")}
						</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{profile?.completionScore ?? 0}%
						</div>
						<p className="text-xs text-muted-foreground">
							{t("mySpace.stats.profileCompletion", "complété")}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							{t("mySpace.actions.profile.title", "Mon Profil")}
						</CardTitle>
						<CardDescription>
							{t(
								"mySpace.actions.profile.description",
								"Consultez et modifiez vos informations personnelles.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full">
							<Link to="/my-space/profile">
								{t("mySpace.actions.profile.button", "Voir mon profil")}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				{profile?.isNational && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Flag className="h-5 w-5" />
								{t("mySpace.actions.registration.title", "Immatriculation")}
								<Badge variant="secondary">
									{t("mySpace.actions.registration.badge", "Nouveau")}
								</Badge>
							</CardTitle>
							<CardDescription>
								{t(
									"mySpace.actions.registration.description",
									"Inscrivez-vous au registre consulaire.",
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline" className="w-full">
								<Link to="/my-space/registration">
									{t("mySpace.actions.registration.button", "S'immatriculer")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
