"use client"

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Mail, Phone, MapPin, Building2, Shield, Calendar } from 'lucide-react'

export const Route = createFileRoute('/dashboard/users/$userId')({
  component: UserDetailPage,
})

function UserDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId } = Route.useParams()

  const { data: user, isPending: isLoadingUser } = useAuthenticatedConvexQuery(
    api.functions.admin.getUser,
    { userId: userId as Id<"users"> }
  )

  const { data: memberships, isPending: isLoadingMemberships } = useAuthenticatedConvexQuery(
    api.functions.admin.getUserMemberships,
    { userId: userId as Id<"users"> }
  )

  const { data: auditLogs, isPending: isLoadingLogs } = useAuthenticatedConvexQuery(
    api.functions.admin.getUserAuditLogs,
    { userId: userId as Id<"users">, limit: 10 }
  )

  if (isLoadingUser) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard/users" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("superadmin.common.back")}
        </Button>
        <div className="text-destructive">Utilisateur non trouvé</div>
      </div>
    )
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard/users" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("superadmin.common.back")}
        </Button>
      </div>

      {/* User Profile Header */}
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.profileImageUrl} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <Badge variant={user.isActive ? "default" : "outline"}>
              {user.isActive ? t("superadmin.common.active") : t("superadmin.common.inactive")}
            </Badge>
            <Badge variant={user.role === "superadmin" ? "destructive" : "secondary"}>
              {t(`superadmin.users.roles.${user.role}`)}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" />
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("superadmin.users.details.infos")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <dd>{user.phone}</dd>
                </div>
              )}
              {user.nationality && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <dd>{t("superadmin.users.details.nationality")}: {user.nationality}</dd>
                </div>
              )}
              {user.residenceCountry && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <dd>{t("superadmin.users.details.residence")}: {user.residenceCountry}</dd>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <dd>{t("superadmin.users.details.registered")} {new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <dd>Email {user.isVerified ? t("superadmin.users.details.verified") : t("superadmin.users.details.unverified")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Organizations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("superadmin.users.details.organizations")}
            </CardTitle>
            <CardDescription>
              {t("superadmin.users.details.orgMembership")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMemberships ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : memberships && memberships.length > 0 ? (
              <div className="space-y-3">
                {memberships.map((membership: any) => (
                  <div
                    key={membership.orgId}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{membership.org?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("superadmin.users.details.since")} {new Date(membership.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{membership.role}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t("superadmin.users.details.noOrg")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("superadmin.users.details.activity")}</CardTitle>
          <CardDescription>{t("superadmin.users.details.lastActions")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-2">
              {auditLogs.map((log: any) => (
                <div key={log._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t("superadmin.users.details.noActivity")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
