"use client"

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Building2, Users, FileText, MapPin, Mail, Phone, Globe } from 'lucide-react'
import { OrgMembersTable } from '@/components/superadmin/org-members-table'

export const Route = createFileRoute('/superadmin/orgs/$orgId')({
  component: OrgDetailPage,
})

function OrgDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orgId } = Route.useParams()

  const { data: org, isPending, error } = useAuthenticatedConvexQuery(
    api.orgs.getById,
    { orgId: orgId as Id<"orgs"> }
  )

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/superadmin/orgs" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("superadmin.common.back")}
        </Button>
        <div className="text-destructive">{t("superadmin.common.error")}</div>
      </div>
    )
  }

  const getOrgTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consulate: t("superadmin.organizations.types.consulate"),
      embassy: t("superadmin.organizations.types.embassy"),
      ministry: t("superadmin.organizations.types.ministry"),
      other: t("superadmin.organizations.types.other"),
    }
    return labels[type] || type
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/superadmin/orgs" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("superadmin.common.back")}
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{getOrgTypeLabel(org.type)}</Badge>
              <Badge variant={org.isActive ? "default" : "outline"}>
                {org.isActive ? t("superadmin.common.active") : t("superadmin.common.inactive")}
              </Badge>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">{org.slug}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Building2 className="mr-2 h-4 w-4" />
            {t("superadmin.organizations.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            {t("superadmin.organizations.tabs.members")}
          </TabsTrigger>
          <TabsTrigger value="services">
            <FileText className="mr-2 h-4 w-4" />
            {t("superadmin.organizations.tabs.services")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("superadmin.organizations.form.address")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{org.address.street}</p>
                {org.address.street2 && <p>{org.address.street2}</p>}
                <p>
                  {org.address.city}
                  {org.address.postalCode && `, ${org.address.postalCode}`}
                </p>
                {org.address.state && <p>{org.address.state}</p>}
                <p className="font-medium">{org.address.country}</p>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("superadmin.organizations.form.contact")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {org.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${org.email}`} className="text-primary hover:underline">
                      {org.email}
                    </a>
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${org.phone}`} className="text-primary hover:underline">
                      {org.phone}
                    </a>
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
                {!org.email && !org.phone && !org.website && (
                  <p className="text-muted-foreground">{t("superadmin.common.noData")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("superadmin.organizations.details")}</CardTitle>
              <CardDescription>
                {t("superadmin.organizations.detailsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t("superadmin.organizations.form.timezone")}
                  </dt>
                  <dd className="mt-1 text-sm">{org.timezone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t("superadmin.table.createdAt")}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t("superadmin.table.updatedAt")}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(org.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <OrgMembersTable orgId={orgId as Id<"orgs">} />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>{t("superadmin.organizations.tabs.services")}</CardTitle>
              <CardDescription>
                {t("superadmin.organizations.servicesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t("superadmin.common.comingSoon")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
