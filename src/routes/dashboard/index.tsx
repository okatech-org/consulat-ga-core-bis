import { api } from "@convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Calendar, FileText, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOrg } from "@/components/org/org-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardIndex,
});

function DashboardIndex() {
	const { activeOrgId, activeOrg } = useOrg();
	const { t } = useTranslation();

	const { data: stats } = useAuthenticatedConvexQuery(
		api.functions.orgs.getStats,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
			<div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.home.stats.pendingRequests")}
						</CardTitle>
						<div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
							<FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
							{stats?.pendingRequests ?? "-"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t("dashboard.home.stats.pendingRequestsDesc")}
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.home.stats.teamMembers")}
						</CardTitle>
						<div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
							<Users className="h-4 w-4 text-green-600 dark:text-green-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-600 dark:text-green-400">
							{stats?.memberCount ?? "-"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t("dashboard.home.stats.teamMembersDesc")}
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.home.stats.activeServices")}
						</CardTitle>
						<div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
							<Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
							{stats?.activeServices ?? "-"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t("dashboard.home.stats.activeServicesDesc")}
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-background dark:from-orange-950/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.home.stats.upcomingAppointments")}
						</CardTitle>
						<div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
							<Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
							{stats?.upcomingAppointments ?? "-"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t("dashboard.home.stats.upcomingAppointmentsDesc")}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
				<h2 className="text-xl font-semibold mb-4">
					{t("dashboard.home.welcome", { orgName: activeOrg?.name })}
				</h2>
				<p className="text-muted-foreground">
					{t("dashboard.home.description")}
				</p>
			</div>
		</div>
	);
}
