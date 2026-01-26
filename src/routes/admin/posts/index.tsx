"use client"

import { createFileRoute, Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { DataTable } from "@/components/ui/data-table"
import { postsColumns } from "@/components/admin/posts-columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const Route = createFileRoute("/admin/posts/")({
  component: AdminPostsPage,
})

function AdminPostsPage() {
  const { t } = useTranslation()

  const { data: posts, isPending, error } = useAuthenticatedConvexQuery(
    api.functions.posts.listAll,
    {}
  )

  const filterableColumns = [
    {
      id: "category",
      title: "Catégorie",
      options: [
        { label: "Actualité", value: "news" },
        { label: "Événement", value: "event" },
        { label: "Communiqué", value: "communique" },
      ],
    },
    {
      id: "status",
      title: "Statut",
      options: [
        { label: "Publié", value: "published" },
        { label: "Brouillon", value: "draft" },
      ],
    },
  ]

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="text-destructive">
          {t("superadmin.common.error", "Une erreur est survenue")}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.posts.title", "Actualités")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.posts.description", "Gérez toutes les actualités, événements et communiqués.")}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.posts.create", "Nouvelle publication")}
          </Link>
        </Button>
      </div>

      <DataTable
        columns={postsColumns}
        data={posts ?? []}
        searchKey="title"
        searchPlaceholder={t("admin.posts.searchPlaceholder", "Rechercher un article...")}
        filterableColumns={filterableColumns}
        isLoading={isPending}
      />
    </div>
  )
}
