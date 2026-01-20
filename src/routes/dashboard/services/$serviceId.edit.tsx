import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { useForm } from "@tanstack/react-form"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useOrg } from "@/components/org/org-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

export const Route = createFileRoute("/dashboard/services/$serviceId/edit")({
  component: ServiceEdit,
})

function ServiceEdit() {
  const { serviceId } = Route.useParams()
  const { activeOrgId } = useOrg()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const data = useQuery(
    api.orgServices.get,
    activeOrgId ? { orgId: activeOrgId, serviceId: serviceId as Id<"services"> } : "skip"
  )

  const updateConfig = useMutation(api.orgServices.updateConfig)

  const form = useForm({
    defaultValues: {
      isActive: data?.orgService?.isActive ?? false,
      fee: data?.orgService?.fee ?? 0,
      currency: data?.orgService?.currency ?? "XAF",
      estimatedDays: data?.orgService?.estimatedDays ?? 0,
      instructions: data?.orgService?.instructions ?? "",
      requiresAppointment: data?.orgService?.requiresAppointment ?? false,
    },
    onSubmit: async ({ value }) => {
      if (!activeOrgId) return

      try {
        await updateConfig({
          orgId: activeOrgId,
          serviceId: serviceId as Id<"services">,
          isActive: value.isActive,
          fee: value.fee,
          currency: value.currency,
          estimatedDays: value.estimatedDays,
          instructions: value.instructions || undefined,
          requiresAppointment: value.requiresAppointment,
        })
        toast.success(t("dashboard.services.edit.saved"))
        navigate({ to: "/dashboard/services" })
      } catch {
        toast.error(t("dashboard.services.edit.saveError"))
      }
    },
  })

  if (!data) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] max-w-3xl" />
      </div>
    )
  }

  const { commonService } = data

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/dashboard/services" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.services.edit.title")}</h1>
        </div>
      </div>

      <Card className="w-full">
        <form
          id="service-config-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <CardHeader>
            <CardTitle>{commonService.name}</CardTitle>
            <CardDescription>{commonService.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">{t("dashboard.services.edit.serviceInfo")}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.services.description")}</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <FieldLabel className="text-base">{t("dashboard.services.edit.activate")}</FieldLabel>
                <form.Field
                  name="isActive"
                  children={(field) => (
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                  )}
                />
              </div>

              {/* Fee and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form.Field
                  name="fee"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>{t("dashboard.services.edit.fee")}</FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id={field.name}
                            type="number"
                            min="0"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(Number(e.target.value))}
                            className="flex-1"
                          />
                          <form.Field
                            name="currency"
                            children={(currencyField) => (
                              <Select
                                value={currencyField.state.value}
                                onValueChange={(v) => currencyField.handleChange(v)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="XAF">XAF</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="estimatedDays"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          {t("dashboard.services.edit.estimatedDays")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min="0"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    )
                  }}
                />
              </div>

              {/* Requires Appointment */}
              <div className="flex items-center gap-2">
                <form.Field
                  name="requiresAppointment"
                  children={(field) => (
                    <Switch
                      id="requiresAppointment"
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                  )}
                />
                <FieldLabel htmlFor="requiresAppointment">
                  {t("dashboard.services.edit.requiresAppointment")}
                </FieldLabel>
              </div>

              {/* Instructions */}
              <form.Field
                name="instructions"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("dashboard.services.edit.instructions")}
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("dashboard.services.edit.instructionsPlaceholder")}
                        className="min-h-[100px]"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate({ to: "/dashboard/services" })}
            >
              {t("dashboard.services.edit.back")}
            </Button>
            <Button type="submit" form="service-config-form">
              <Save className="mr-2 h-4 w-4" />
              {t("dashboard.services.edit.save")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
