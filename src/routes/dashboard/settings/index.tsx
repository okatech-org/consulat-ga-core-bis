import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, MapPin, Phone, Mail, Globe, Clock } from "lucide-react"

export const Route = createFileRoute("/dashboard/settings/")({
  component: DashboardSettings,
})

function DashboardSettings() {
  const { activeOrgId } = useOrg()
  const { t } = useTranslation()

  const org = useQuery(api.orgs.getById, activeOrgId ? { orgId: activeOrgId } : "skip")

  if (org === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">{t("dashboard.settings.notFound")}</p>
      </div>
    )
  }

  const getOrgTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      consulate: t("dashboard.settings.orgTypes.consulate"),
      consulate_general: t("dashboard.settings.orgTypes.consulateGeneral"),
      embassy: t("dashboard.settings.orgTypes.embassy"),
      honorary_consulate: t("dashboard.settings.orgTypes.honoraryConsulate"),
      ministry: t("dashboard.settings.orgTypes.ministry"),
      other: t("dashboard.settings.orgTypes.other"),
    }
    return types[type] || type
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.settings.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.settings.description")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("dashboard.settings.orgProfile")}
            </CardTitle>
            <CardDescription>{t("dashboard.settings.orgProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.settings.name")}</p>
              <p className="font-medium">{org.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.settings.type")}</p>
              <Badge variant="secondary">{getOrgTypeLabel(org.type)}</Badge>
            </div>
            {org.description && (
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.settings.descriptionLabel")}</p>
                <p className="text-sm">{org.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("dashboard.settings.address")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {org.address ? (
              <>
                {org.address.street && <p>{org.address.street}</p>}
                <p>
                  {org.address.city}
                  {org.address.postalCode && `, ${org.address.postalCode}`}
                </p>
                <p>{org.address.country}</p>
              </>
            ) : (
              <p className="text-muted-foreground">{t("dashboard.settings.noAddress")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("dashboard.settings.contact")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {org.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{org.phone}</span>
              </div>
            )}
            {org.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{org.email}</span>
              </div>
            )}
            {org.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {org.website}
                </a>
              </div>
            )}
            {!org.phone && !org.email && !org.website && (
              <p className="text-muted-foreground">{t("dashboard.settings.noContact")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("dashboard.settings.jurisdiction")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.jurisdictionCountries && org.jurisdictionCountries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {org.jurisdictionCountries.map((country: string) => (
                  <Badge key={country} variant="outline">{country}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("dashboard.settings.noJurisdiction")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
