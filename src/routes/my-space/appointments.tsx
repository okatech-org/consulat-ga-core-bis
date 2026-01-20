import { createFileRoute, Link } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export const Route = createFileRoute("/my-space/appointments")({
  component: AppointmentsPage,
})

function AppointmentsPage() {
  const { t } = useTranslation()
  const { data: appointments, isPending } = useAuthenticatedConvexQuery(api.functions.appointments.listByUser, {})

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Planifié</Badge>
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmé</Badge>
      case 'completed':
        return <Badge variant="outline">Terminé</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>
      case 'missed':
        return <Badge variant="destructive">Manqué</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">{t("appointments.title", "Mes Rendez-vous")}</h1>
          <p className="text-muted-foreground">
            {t("appointments.desc", "Consultez vos rendez-vous à venir et passés.")}
          </p>
        </div>
        <Button asChild>
           {/* TODO: Link to appointment booking flow */}
          <Link to="/services">
            <Calendar className="mr-2 h-4 w-4" />
            {t("appointments.new", "Prendre rendez-vous")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
          {!appointments || appointments.length === 0 ? (
             <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-4 opacity-20" />
                  <p>{t("appointments.empty", "Aucun rendez-vous planifié.")}</p>
                </CardContent>
             </Card>
          ) : (
            appointments.map((apt) => (
                <Card key={apt._id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row border-l-4 border-l-primary h-full">
                         <div className="bg-muted p-4 flex flex-col items-center justify-center min-w-[120px] text-center border-b sm:border-b-0 sm:border-r">
                             <span className="text-3xl font-bold text-primary">
                                 {format(new Date(apt.date), "dd", { locale: fr })}
                             </span>
                             <span className="text-sm uppercase font-medium text-muted-foreground">
                                 {format(new Date(apt.date), "MMM yyyy", { locale: fr })}
                             </span>
                             <div className="mt-2 flex items-center gap-1 text-sm font-semibold">
                                 <Clock className="h-3 w-3" />
                                 {apt.startTime}
                             </div>
                         </div>
                         <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between gap-4">
                             <div>
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-semibold text-lg">{apt.service?.name || "Rendez-vous consulaire"}</h3>
                                     {getStatusBadge(apt.status)}
                                 </div>
                                 <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                     <MapPin className="h-4 w-4" />
                                     <span>{apt.org?.name} — {apt.org?.address?.city}, {apt.org?.address?.country}</span>
                                 </div>
                                 {apt.notes && (
                                     <p className="text-sm mt-3 bg-muted/50 p-2 rounded-md italic">
                                         "{apt.notes}"
                                     </p>
                                 )}
                             </div>
                         </div>
                    </div>
                </Card>
            ))
          )}
      </div>
    </div>
  )
}
