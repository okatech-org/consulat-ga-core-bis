import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Filter, Calendar, Check, X, Clock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/dashboard/appointments/")({
  component: DashboardAppointments,
})

function DashboardAppointments() {
  const { activeOrgId } = useOrg()
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")

  const queryArgs = activeOrgId ? { 
    orgId: activeOrgId,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    date: dateFilter || undefined
  } : "skip"

  const appointments = useQuery(api.appointments.listByOrg, queryArgs)
  const confirmMutation = useMutation(api.appointments.confirm)
  const cancelMutation = useMutation(api.appointments.cancel)
  const completeMutation = useMutation(api.appointments.complete)
  const noShowMutation = useMutation(api.appointments.markNoShow)

  const handleConfirm = async (appointmentId: string) => {
    try {
      await confirmMutation({ appointmentId: appointmentId as any })
      toast.success(t("dashboard.appointments.success.confirmed"))
    } catch {
      toast.error(t("dashboard.appointments.error.confirm"))
    }
  }

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelMutation({ appointmentId: appointmentId as any })
      toast.success(t("dashboard.appointments.success.cancelled"))
    } catch {
      toast.error(t("dashboard.appointments.error.cancel"))
    }
  }

  const handleComplete = async (appointmentId: string) => {
    try {
      await completeMutation({ appointmentId: appointmentId as any })
      toast.success(t("dashboard.appointments.success.completed"))
    } catch {
      toast.error(t("dashboard.appointments.error.complete"))
    }
  }

  const handleNoShow = async (appointmentId: string) => {
    try {
      await noShowMutation({ appointmentId: appointmentId as any })
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.appointments.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.appointments.description")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>{t("dashboard.appointments.listTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.appointments.listDescription")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[180px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("dashboard.appointments.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.appointments.statuses.all")}</SelectItem>
                  <SelectItem value="scheduled">{t("dashboard.appointments.statuses.scheduled")}</SelectItem>
                  <SelectItem value="confirmed">{t("dashboard.appointments.statuses.confirmed")}</SelectItem>
                  <SelectItem value="completed">{t("dashboard.appointments.statuses.completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("dashboard.appointments.statuses.cancelled")}</SelectItem>
                  <SelectItem value="no_show">{t("dashboard.appointments.statuses.no_show")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.appointments.columns.dateTime")}</TableHead>
                <TableHead>{t("dashboard.appointments.columns.user")}</TableHead>
                <TableHead>{t("dashboard.appointments.columns.service")}</TableHead>
                <TableHead>{t("dashboard.appointments.columns.status")}</TableHead>
                <TableHead className="text-right">{t("dashboard.appointments.columns.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments === undefined ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {t("dashboard.appointments.loading")}
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {t("dashboard.appointments.noAppointments")}
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{appointment.date}</span>
                          <span className="text-xs text-muted-foreground">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : "-"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {appointment.user?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.service?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {t(`dashboard.appointments.statuses.${appointment.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {appointment.status === "scheduled" && (
                          <Button size="sm" variant="ghost" onClick={() => handleConfirm(appointment._id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleComplete(appointment._id)}>
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleNoShow(appointment._id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {appointment.status === "scheduled" && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancel(appointment._id)}>
                            {t("dashboard.appointments.cancel")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
