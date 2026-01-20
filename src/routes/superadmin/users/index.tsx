import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/superadmin/users-columns'

export const Route = createFileRoute('/superadmin/users/')({
  component: UsersPage,
})

function UsersPage() {
  const { t } = useTranslation()
  
  const { data: users, isPending, error } = useAuthenticatedConvexQuery(
    api.functions.admin.listUsers,
    {}
  )

  const filterableColumns = [
    {
      id: "role",
      title: t("superadmin.users.filters.allRoles"),
      options: [
        { label: t("superadmin.users.roles.user"), value: "user" },
        { label: t("superadmin.users.roles.superadmin"), value: "superadmin" },
      ],
    },
    {
      id: "isActive",
      title: t("superadmin.users.filters.allStatus"),
      options: [
        { label: t("superadmin.users.filters.active"), value: "true" },
        { label: t("superadmin.users.filters.inactive"), value: "false" },
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
            {t("superadmin.users.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("superadmin.users.description")}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users ?? []}
        searchKey="email"
        searchPlaceholder={t("superadmin.users.filters.searchPlaceholder")}
        filterableColumns={filterableColumns}
        isLoading={isPending}
      />
    </div>
  )
}
