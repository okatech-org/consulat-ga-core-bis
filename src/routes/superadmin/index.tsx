import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, FileText, Shield, Plus, ClipboardList } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/superadmin/')({
  component: SuperadminDashboard,
})

function SuperadminDashboard() {
  const { t } = useTranslation()
  
  const { data: stats, isPending } = useAuthenticatedConvexQuery(
    api.admin.getStats,
    {}
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("superadmin.dashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("superadmin.dashboard.welcome")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superadmin.dashboard.stats.users")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPending ? <Skeleton className="h-8 w-16" /> : stats?.users.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("superadmin.dashboard.stats.totalUsers")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superadmin.dashboard.stats.organizations")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPending ? <Skeleton className="h-8 w-16" /> : stats?.orgs.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("superadmin.dashboard.stats.consulatesEmbassies")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superadmin.dashboard.stats.services")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPending ? <Skeleton className="h-8 w-16" /> : stats?.services.active ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("superadmin.dashboard.stats.availableServices")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superadmin.dashboard.stats.requests")}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPending ? <Skeleton className="h-8 w-16" /> : stats?.requests.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("superadmin.dashboard.stats.pendingRequests")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("superadmin.dashboard.recentActivity")}</CardTitle>
            <CardDescription>
              {t("superadmin.dashboard.recentActivityDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("superadmin.common.noData")}
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("superadmin.dashboard.quickActions")}</CardTitle>
            <CardDescription>
              {t("superadmin.dashboard.quickActionsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link to="/superadmin/users">
                <Users className="mr-2 h-4 w-4" />
                {t("superadmin.nav.users")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/superadmin/orgs/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("superadmin.dashboard.addOrg")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/superadmin/services">
                <FileText className="mr-2 h-4 w-4" />
                {t("superadmin.nav.services")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/superadmin/audit-logs">
                <ClipboardList className="mr-2 h-4 w-4" />
                {t("superadmin.dashboard.viewLogs")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
