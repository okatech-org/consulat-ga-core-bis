import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings2, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export const Route = createFileRoute("/dashboard/services/")({
  component: DashboardServices,
})

function DashboardServices() {
  const { activeOrgId } = useOrg()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const services = useQuery(
    api.orgServices.list,
    activeOrgId ? { orgId: activeOrgId } : "skip"
  )

  const toggleActive = useMutation(api.orgServices.toggleActive)

  const handleToggle = async (service: any) => {
    if (!activeOrgId) return

    if (!service.isConfigured) {
      toast.info(t("dashboard.services.configureFirst"))
      navigate({
        to: "/dashboard/services/$serviceId/edit",
        params: { serviceId: service.commonService._id }
      })
      return
    }

    try {
      await toggleActive({
        orgId: activeOrgId,
        serviceId: service.commonService._id,
        isActive: !service.isActive,
      })
      toast.success(t("dashboard.services.statusUpdated"))
    } catch {
      toast.error(t("dashboard.services.updateError"))
    }
  }

  if (!services) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.services.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.services.description")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("dashboard.services.listTitle")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.services.listDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.services.columns.service")}</TableHead>
                <TableHead>{t("dashboard.services.columns.category")}</TableHead>
                <TableHead>{t("dashboard.services.columns.fee")}</TableHead>
                <TableHead>{t("dashboard.services.columns.status")}</TableHead>
                <TableHead className="text-right">{t("dashboard.services.configure")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((item) => (
                <TableRow key={item.commonService._id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{item.commonService.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {item.commonService.category.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.isConfigured && item.orgService ? (
                      <span>
                        {item.orgService.fee} {item.orgService.currency}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        {t("dashboard.services.notConfigured")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggle(item)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.isActive ? t("superadmin.common.active") : t("superadmin.common.inactive")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link
                        to="/dashboard/services/$serviceId/edit"
                        params={{ serviceId: item.commonService._id }}
                      >
                        <Settings2 className="mr-2 h-4 w-4" />
                        {t("dashboard.services.configure")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

