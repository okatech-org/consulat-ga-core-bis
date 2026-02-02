import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/admin/audit-logs-columns'

export const Route = createFileRoute('/dashboard/audit-logs/')({
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const { t } = useTranslation()
  
  const { data: logs, isPending, error } = useAuthenticatedConvexQuery(
    api.functions.admin.getAuditLogs,
    { limit: 100 }
  )

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="text-destructive">{t("superadmin.common.error")}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("superadmin.auditLogs.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("superadmin.auditLogs.description")}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs?.map(log => ({ ...log, userId: log.userId as string || "", details: JSON.parse(log.details) })) ?? []}
        searchKey="action"
        searchPlaceholder={t("superadmin.auditLogs.filters.searchPlaceholder")}
        isLoading={isPending}
      />
    </div>
  )
}
