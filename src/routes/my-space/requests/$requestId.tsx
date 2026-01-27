import { createFileRoute, Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { getLocalizedValue } from "@/lib/i18n-utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RequestStatus } from "@convex/lib/validators"
import { ArrowLeft, FileText, Calendar, MessageSquare, Loader2, X, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute("/my-space/requests/$requestId")({
  component: UserRequestDetail,
})

function UserRequestDetail() {
  const { requestId } = Route.useParams()
  const { t, i18n } = useTranslation()

  const request = useQuery(api.functions.requests.getById, { requestId: requestId as Id<"requests"> })
  const cancelRequest = useMutation(api.functions.requests.cancel)

  const canCancel = request?.status === RequestStatus.Draft || request?.status === RequestStatus.Submitted

  const handleCancel = async () => {
    try {
      await cancelRequest({ requestId: requestId as Id<"requests"> })
      toast.success(t("requests.detail.cancelled", "Demande annulée"))
    } catch (e) {
      const error = e as Error
      toast.error(error.message || t("requests.detail.cancelError", "Erreur lors de l'annulation"))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      [RequestStatus.Draft]: "secondary",
      [RequestStatus.Submitted]: "secondary",
      [RequestStatus.UnderReview]: "secondary",
      [RequestStatus.InProduction]: "default",
      [RequestStatus.Completed]: "default",
      [RequestStatus.Rejected]: "destructive",
      [RequestStatus.Cancelled]: "outline",
    }
    
    const labels: Record<string, string> = {
      [RequestStatus.Draft]: t("requests.statuses.draft", "Brouillon"),
      [RequestStatus.Submitted]: t("requests.statuses.submitted", "Soumis"),
      [RequestStatus.UnderReview]: t("requests.statuses.underReview", "En cours d'examen"),
      [RequestStatus.InProduction]: t("requests.statuses.inProduction", "En cours de traitement"),
      [RequestStatus.Completed]: t("requests.statuses.completed", "Terminé"),
      [RequestStatus.Rejected]: t("requests.statuses.rejected", "Rejeté"),
      [RequestStatus.Cancelled]: t("requests.statuses.cancelled", "Annulé"),
    }
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (!request) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Filter to only show public notes (not internal)
  const publicNotes = request.notes?.filter((note: any) => !note.isInternal) || []

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/my-space/requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("requests.detail.title", "Demande {{ref}}", { ref: request.reference || "#" + requestId.slice(-6) })}
          </h1>
          <p className="text-muted-foreground">
            {t("requests.detail.createdAt", "Créée le {{date}}", { 
              date: new Date(request._creationTime).toLocaleDateString() 
            })}
          </p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("requests.detail.serviceInfo", "Informations du service")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("requests.detail.serviceName", "Service demandé")}</p>
                <p className="font-medium">
                  {getLocalizedValue((request.service as any)?.name, i18n.language) || t("requests.detail.unknownService", "Service inconnu")}
                </p>
              </div>
              
              {request.org && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("requests.detail.organization", "Organisme")}</p>
                  <p className="font-medium">{(request.org as any)?.name}</p>
                </div>
              )}

              {request.formData && Object.keys(request.formData).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("requests.detail.formData", "Données soumises")}</p>
                  <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    {Object.entries(request.formData).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes/Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t("requests.detail.messages", "Messages")}
              </CardTitle>
              <CardDescription>
                {t("requests.detail.messagesDesc", "Communications avec le consulat concernant cette demande.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publicNotes.length > 0 ? (
                <div className="space-y-3">
                  {publicNotes.map((note: any) => (
                    <div key={note._id} className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{t("requests.detail.agent", "Agent consulaire")}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("requests.detail.noMessages", "Aucun message pour le moment.")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("requests.detail.timeline", "Chronologie")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("requests.detail.created", "Créée")}</span>
                  <span>{new Date(request._creationTime).toLocaleDateString()}</span>
                </div>
                {request.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("requests.detail.submitted", "Soumise")}</span>
                    <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {request.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("requests.detail.completed", "Terminée")}</span>
                    <span>{new Date(request.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {t("requests.detail.actions", "Actions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      {t("requests.detail.cancel", "Annuler la demande")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("requests.detail.cancelConfirmTitle", "Annuler cette demande ?")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("requests.detail.cancelConfirmDesc", "Cette action est irréversible. La demande sera définitivement annulée.")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel", "Annuler")}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t("requests.detail.confirmCancel", "Confirmer l'annulation")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
