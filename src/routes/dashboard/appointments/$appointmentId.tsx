import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, Clock, User, FileText, Check, X, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/dashboard/appointments/$appointmentId")({
  component: AppointmentDetail,
})

function AppointmentDetail() {
  const { appointmentId } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const appointment = useQuery(api.appointments.getById, { 
    appointmentId: appointmentId as Id<"appointments"> 
  })

  const confirmMutation = useMutation(api.appointments.confirm)
  const cancelMutation = useMutation(api.appointments.cancel)
  const completeMutation = useMutation(api.appointments.complete)
  const noShowMutation = useMutation(api.appointments.markNoShow)

  const handleConfirm = async () => {
    try {
      await confirmMutation({ appointmentId: appointmentId as Id<"appointments"> })
      toast.success(t("dashboard.appointments.success.confirmed"))
    } catch {
      toast.error(t("dashboard.appointments.error.confirm"))
    }
  }

  const handleCancel = async () => {
    try {
      await cancelMutation({ appointmentId: appointmentId as Id<"appointments"> })
      toast.success(t("dashboard.appointments.success.cancelled"))
    } catch {
      toast.error(t("dashboard.appointments.error.cancel"))
    }
  }

  const handleComplete = async () => {
    try {
      await completeMutation({ appointmentId: appointmentId as Id<"appointments"> })
      toast.success(t("dashboard.appointments.success.completed"))
    } catch {
      toast.error(t("dashboard.appointments.error.complete"))
    }
  }

  const handleNoShow = async () => {
    try {
      await noShowMutation({ appointmentId: appointmentId as Id<"appointments"> })
      toast.success(t("dashboard.appointments.success.noShow"))
    } catch {
      toast.error(t("dashboard.appointments.error.noShow"))
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default"
      case "scheduled": return "secondary"
      case "completed": return "default"
      case "cancelled": return "destructive"
      case "no_show": return "destructive"
      default: return "outline"
    }
  }

  if (appointment === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t("dashboard.appointments.notFound")}</p>
        <Button onClick={() => navigate({ to: "/dashboard/appointments" })}>
          {t("common.back")}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/dashboard/appointments" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.appointments.detail.title")}</h1>
          <p className="text-muted-foreground">{appointment.date}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
          {t(`dashboard.appointments.statuses.${appointment.status}`)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("dashboard.appointments.detail.dateTime")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t("dashboard.appointments.detail.date")}:</span>
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.startTime} - {appointment.endTime}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("dashboard.appointments.detail.user")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointment.user ? (
              <>
                <p className="font-medium">
                  {appointment.user.firstName} {appointment.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{appointment.user.email}</p>
              </>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>

        {appointment.service && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("dashboard.appointments.detail.service")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{(appointment.service as any)?.name || '-'}</p>
            </CardContent>
          </Card>
        )}

        {appointment.notes && (
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.appointments.detail.notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{appointment.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.appointments.detail.actions")}</CardTitle>
            <CardDescription>{t("dashboard.appointments.detail.actionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {appointment.status === "scheduled" && (
              <Button onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                {t("dashboard.appointments.confirm")}
              </Button>
            )}
            <Button variant="secondary" onClick={handleComplete}>
              <Clock className="mr-2 h-4 w-4" />
              {t("dashboard.appointments.complete")}
            </Button>
            <Button variant="outline" onClick={handleNoShow}>
              <AlertCircle className="mr-2 h-4 w-4" />
              {t("dashboard.appointments.noShow")}
            </Button>
            {appointment.status === "scheduled" && (
              <Button variant="destructive" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                {t("dashboard.appointments.cancel")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
