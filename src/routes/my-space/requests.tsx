import { createFileRoute, Link } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, PlusCircle, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { RequestStatus } from "@convex/lib/validators"

export const Route = createFileRoute("/my-space/requests")({
  component: RequestsPage,
})

function RequestsPage() {
  const { t } = useTranslation()
  const { data: requests, isPending } = useAuthenticatedConvexQuery(api.functions.requests.listMine, {})

  const getStatusBadge = (status: string) => {
    switch (status) {
      case RequestStatus.Draft:
        return <Badge variant="secondary">Brouillon</Badge>
      case RequestStatus.Submitted:
        return <Badge className="bg-blue-500 hover:bg-blue-600">Soumis</Badge>
      case RequestStatus.InProduction:
        return <Badge className="bg-amber-500 hover:bg-amber-600">En cours</Badge>
      case RequestStatus.Completed:
        return <Badge className="bg-green-500 hover:bg-green-600">Terminé</Badge>
      case RequestStatus.Rejected:
        return <Badge variant="destructive">Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isPending) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("requests.title", "Mes Demandes")}</h1>
          <p className="text-muted-foreground">
            {t("requests.desc", "Suivez l'état de vos démarches administratives.")}
          </p>
        </div>
        <Button asChild>
          <Link to="/services">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("requests.new", "Nouvelle demande")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("requests.listTitle", "Historique des demandes")}</CardTitle>
          <CardDescription>
            {t("requests.listDesc", "Retrouvez ici toutes vos demandes passées et en cours.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>{t("requests.empty", "Vous n'avez aucune demande pour le moment.")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("requests.col.service", "Service")}</TableHead>
                  <TableHead>{t("requests.col.ref", "Référence")}</TableHead>
                  <TableHead>{t("requests.col.date", "Date")}</TableHead>
                  <TableHead>{t("requests.col.status", "Statut")}</TableHead>
                  <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request: any) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{request.service?.name || "Service inconnu"}</span>
                        <span className="text-xs text-muted-foreground">{request.org?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{request.reference || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(request._creationTime), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" asChild>
                           <Link to="/dashboard/requests/$requestId" params={{ requestId: request._id }}> 
                               <ArrowRight className="h-4 w-4" />
                           </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
