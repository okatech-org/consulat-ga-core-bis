import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, FileText, Shield, Plus, ClipboardList, User, Settings } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'


function RecentActivityList() {
  const { t } = useTranslation()
  const { data: logs, isPending } = useAuthenticatedConvexQuery(
    api.functions.admin.getAuditLogs,
    { limit: 5 }
  )

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("superadmin.common.noData")}
      </p>
    )
  }

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return <User className="h-4 w-4" />
    if (action.includes('org')) return <Building2 className="h-4 w-4" />
    if (action.includes('service')) return <FileText className="h-4 w-4" />
    return <Settings className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log._id} className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10">
              {getActionIcon(log.action)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {t(`superadmin.auditLogs.actions.${log.action}`, log.action)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {log.user?.firstName} {log.user?.lastName} • {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export const Route = createFileRoute('/admin/')({
  component: SuperadminDashboard,
})

function SuperadminDashboard() {
  const { t } = useTranslation()
  
  const { data: stats, isPending } = useAuthenticatedConvexQuery(
    api.functions.admin.getStats,
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
            <RecentActivityList />
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
              <Link to="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                {t("superadmin.nav.users")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/orgs/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("superadmin.dashboard.addOrg")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/services">
                <FileText className="mr-2 h-4 w-4" />
                {t("superadmin.nav.services")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/audit-logs">
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
