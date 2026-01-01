import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileText, Users, Activity } from "lucide-react"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
})

function DashboardIndex() {
  const { activeOrgId, activeOrg } = useOrg()
  const { t } = useTranslation()

  const stats = useQuery(api.orgs.getOrgStats, activeOrgId ? { orgId: activeOrgId } : "skip")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.home.stats.pendingRequests")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.home.stats.pendingRequestsDesc")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.home.stats.teamMembers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.members ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.home.stats.teamMembersDesc")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.home.stats.activeServices")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeServices ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.home.stats.activeServicesDesc")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <h2 className="text-xl font-semibold mb-4">{t("dashboard.home.welcome", { orgName: activeOrg?.name })}</h2>
        <p className="text-muted-foreground">
          {t("dashboard.home.description")}
        </p>
      </div>
    </div>
  )
}

