import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuthenticatedPaginatedQuery } from "@/integrations/convex/hooks";
import { api } from "@convex/_generated/api";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/audit-logs-columns";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/audit-logs/")({
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const { t } = useTranslation();

  const {
    results: logs,
    status: paginationStatus,
    loadMore,
    isLoading,
  } = useAuthenticatedPaginatedQuery(
    api.functions.admin.getAuditLogs,
    {},
    { initialNumItems: 50 },
  );

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
        data={
          logs?.map((log: any) => ({
            ...log,
            userId: (log.userId as string) || "",
            details: JSON.parse(log.details),
          })) ?? []
        }
        searchKey="action"
        searchPlaceholder={t("superadmin.auditLogs.filters.searchPlaceholder")}
        isLoading={isLoading && logs.length === 0}
      />

      {/* Load More */}
      {paginationStatus === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(50)}>
            Charger plus
          </Button>
        </div>
      )}
      {paginationStatus === "LoadingMore" && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
