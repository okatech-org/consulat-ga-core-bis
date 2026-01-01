import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery } from "convex/react"
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
import { Filter } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/dashboard/requests/")({
  component: DashboardRequests,
})

function DashboardRequests() {
  const { activeOrgId } = useOrg()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const queryArgs = activeOrgId ? { 
    orgId: activeOrgId,
    status: statusFilter !== "all" ? statusFilter as any : undefined
  } : "skip"

  const requests = useQuery(api.orgRequests.list, queryArgs)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "submitted": return "default"
      case "processing": return "secondary" 
      case "completed": return "default"
      case "rejected": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.requests.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.requests.description")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>{t("dashboard.requests.listTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.requests.listDescription")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("dashboard.requests.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.requests.statuses.all")}</SelectItem>
                  <SelectItem value="draft">{t("dashboard.requests.statuses.draft")}</SelectItem>
                  <SelectItem value="submitted">{t("dashboard.requests.statuses.submitted")}</SelectItem>
                  <SelectItem value="under_review">{t("dashboard.requests.statuses.under_review")}</SelectItem>
                  <SelectItem value="processing">{t("dashboard.requests.statuses.processing")}</SelectItem>
                  <SelectItem value="completed">{t("dashboard.requests.statuses.completed")}</SelectItem>
                  <SelectItem value="rejected">{t("dashboard.requests.statuses.rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.requests.columns.reference")}</TableHead>
                <TableHead>{t("dashboard.requests.columns.service")}</TableHead>
                <TableHead>{t("dashboard.requests.columns.requester")}</TableHead>
                <TableHead>{t("dashboard.requests.columns.date")}</TableHead>
                <TableHead>{t("dashboard.requests.columns.status")}</TableHead>
                <TableHead className="text-right">{t("dashboard.requests.columns.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests === undefined ? (
                 <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("dashboard.requests.loading")}
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("dashboard.requests.noRequests")}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request._id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate({ to: `/dashboard/requests/${request._id}` as any })}>
                    <TableCell className="font-mono text-sm">
                      {request.referenceNumber || t("dashboard.requests.noReference")}
                    </TableCell>
                    <TableCell>
                      {request.service?.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {request.user ? `${request.user.firstName} ${request.user.lastName}` : t("dashboard.requests.unknownUser")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                           {request.user?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {t(`dashboard.requests.statuses.${request.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                         <Link to="/dashboard/requests/$requestId" params={{ requestId: request._id }}>
                            {t("dashboard.requests.manage")}
                         </Link>
                      </Button>
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

