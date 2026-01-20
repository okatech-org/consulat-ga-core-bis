import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { useForm } from "@tanstack/react-form"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Building2, MapPin, Phone, Mail, Globe, Clock, Edit, Save, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/dashboard/settings/")({
  component: DashboardSettings,
})

function DashboardSettings() {
  const { activeOrgId } = useOrg()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)

  const org = useQuery(api.functions.orgs.getById, activeOrgId ? { orgId: activeOrgId } : "skip")
  const isAdmin = useQuery(api.functions.orgs.isUserAdmin, activeOrgId ? { orgId: activeOrgId } : "skip")
  const updateProfile = useMutation(api.functions.orgs.update)

  const form = useForm({
    defaultValues: {
      name: org?.name || "",
      description: org?.description || "",
      phone: org?.phone || "",
      email: org?.email || "",
      website: org?.website || "",
      street: org?.address?.street || "",
      city: org?.address?.city || "",
      postalCode: org?.address?.postalCode || "",
      country: org?.address?.country || "",
    },
    onSubmit: async ({ value }) => {
      if (!activeOrgId) return

      try {
        await updateProfile({
          orgId: activeOrgId,
          name: value.name || undefined,
          description: value.description || undefined,
          phone: value.phone || undefined,
          email: value.email || undefined,
          website: value.website || undefined,
          address: {
            street: value.street,
            city: value.city,
            postalCode: value.postalCode,
            country: value.country,
          },
        })
        toast.success(t("dashboard.settings.updateSuccess"))
        setIsEditing(false)
      } catch (error) {
        toast.error(t("dashboard.settings.updateError"))
      }
    },
  })

  const handleEdit = () => {
    if (org) {
      form.setFieldValue("name", org.name || "")
      form.setFieldValue("description", org.description || "")
      form.setFieldValue("phone", org.phone || "")
      form.setFieldValue("email", org.email || "")
      form.setFieldValue("website", org.website || "")
      form.setFieldValue("street", org.address?.street || "")
      form.setFieldValue("city", org.address?.city || "")
      form.setFieldValue("postalCode", org.address?.postalCode || "")
      form.setFieldValue("country", org.address?.country || "")
      setIsEditing(true)
    }
  }

  if (org === undefined || isAdmin === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
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
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.settings.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.settings.description")}</p>
        </div>
        {isAdmin && !isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t("dashboard.settings.edit")}
          </Button>
        )}
      </div>

      <form
        id="settings-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("dashboard.settings.orgProfile")}
              </CardTitle>
              <CardDescription>{t("dashboard.settings.orgProfileDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {isEditing ? (
                  <>
                    <form.Field
                      name="name"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>{t("dashboard.settings.name")}</FieldLabel>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        )
                      }}
                    />
                    <div>
                      <FieldLabel>{t("dashboard.settings.type")}</FieldLabel>
                      <Badge variant="secondary">{getOrgTypeLabel(org.type)}</Badge>
                    </div>
                    <form.Field
                      name="description"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t("dashboard.settings.descriptionLabel")}
                            </FieldLabel>
                            <Textarea
                              id={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              rows={3}
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        )
                      }}
                    />
                  </>
                ) : (
                  <>
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
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.settings.descriptionLabel")}
                        </p>
                        <p className="text-sm">{org.description}</p>
                      </div>
                    )}
                  </>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("dashboard.settings.address")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {isEditing ? (
                  <>
                    <form.Field
                      name="street"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>{t("dashboard.settings.street")}</FieldLabel>
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                    <form.Field
                      name="city"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>{t("dashboard.settings.city")}</FieldLabel>
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                    <form.Field
                      name="postalCode"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            {t("dashboard.settings.postalCode")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                    <form.Field
                      name="country"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            {t("dashboard.settings.country")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                  </>
                ) : org.address ? (
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
              </FieldGroup>
            </CardContent>
          </Card>

          { /* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t("dashboard.settings.contact")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {isEditing ? (
                  <>
                    <form.Field
                      name="phone"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>{t("dashboard.settings.phone")}</FieldLabel>
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                    <form.Field
                      name="email"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>{t("dashboard.settings.email")}</FieldLabel>
                          <Input
                            id={field.name}
                            type="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                    <form.Field
                      name="website"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            {t("dashboard.settings.website")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                  </>
                ) : (
                  <>
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
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {org.website}
                        </a>
                      </div>
                    )}
                    {!org.phone && !org.email && !org.website && (
                      <p className="text-muted-foreground">{t("dashboard.settings.noContact")}</p>
                    )}
                  </>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Jurisdiction Card */}
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
                    <Badge key={country} variant="outline">
                      {country}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("dashboard.settings.noJurisdiction")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2 justify-end mt-4">
            <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="settings-form">
              <Save className="mr-2 h-4 w-4" />
              {t("common.save")}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
