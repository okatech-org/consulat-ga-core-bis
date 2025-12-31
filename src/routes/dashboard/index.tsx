import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
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

  // We need to fetch stats for this specific org.
  // The existing api.orgs.getStats might need an update or we use a new query.
  // Let's check api.orgs.getStats signature first. 
  // For now, I'll assume I pass orgId.
  // If getStats doesn't support orgId yet (it was for superadmin globally), 
  // I should create a specific query or update it.
  
  // Actually, I should check the implementation of getStats.
  // Assuming I can pass orgId.
  const stats = useQuery(api.orgs.getOrgStats, activeOrgId ? { orgId: activeOrgId } : "skip")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Demandes en attente
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              +0% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Membres de l'équipe
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.members ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              Actifs dans cette organisation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Actifs
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeServices ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              Services configurés
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue sur le tableau de bord de {activeOrg?.name}</h2>
        <p className="text-muted-foreground">
          Ceci est votre espace de gestion centralisé. Utilisez le menu latéral pour gérer vos services, traiter les demandes et configurer votre organisation.
        </p>
      </div>
    </div>
  )
}
