import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { columns } from '@/components/superadmin/orgs-columns'

export const Route = createFileRoute('/superadmin/orgs/')({
  component: OrganizationsPage,
})

function OrganizationsPage() {
  const { t } = useTranslation()
  
  const { data: orgs, isPending, error } = useAuthenticatedConvexQuery(
    api.admin.listOrgs,
    {}
  )

  const filterableColumns = [
    {
      id: "type",
      title: t("superadmin.organizations.filters.allTypes"),
      options: [
        { label: t("superadmin.organizations.types.consulate"), value: "consulate" },
        { label: t("superadmin.organizations.types.embassy"), value: "embassy" },
        { label: t("superadmin.organizations.types.ministry"), value: "ministry" },
        { label: t("superadmin.organizations.types.other"), value: "other" },
      ],
    },
    {
      id: "isActive",
      title: t("superadmin.users.filters.allStatus"),
      options: [
        { label: t("superadmin.common.active"), value: "true" },
        { label: t("superadmin.common.inactive"), value: "false" },
      ],
    },
  ]

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
            {t("superadmin.organizations.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("superadmin.organizations.description")}
          </p>
        </div>
        <Button asChild>
          <Link to="/superadmin/orgs/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("superadmin.organizations.form.create")}
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={orgs ?? []}
        searchKey="name"
        searchPlaceholder={t("superadmin.organizations.filters.searchPlaceholder")}
        filterableColumns={filterableColumns}
        isLoading={isPending}
      />
    </div>
  )
}
