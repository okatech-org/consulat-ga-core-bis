"use client"

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { useConvexMutationQuery, useAuthenticatedConvexQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceCategory } from '@convex/lib/validators'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import * as React from 'react'

export const Route = createFileRoute('/superadmin/services/$serviceId_/edit')({
  component: EditServicePageWrapper,
})

interface RequiredDocument {
  type: string
  label: string
  required: boolean
}

// Wrapper component that provides the key prop
function EditServicePageWrapper() {
  const { serviceId } = Route.useParams()
  
  // Using serviceId as key forces component recreation when navigating between services
  return <EditServiceForm key={serviceId} serviceId={serviceId as Id<"services">} />
}

interface EditServiceFormProps {
  serviceId: Id<"services">
}

function EditServiceForm({ serviceId }: EditServiceFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<RequiredDocument[]>([])

  const { data: service, isPending: isLoading } = useAuthenticatedConvexQuery(
    api.functions.services.getById,
    { serviceId }
  )
  
  const { mutateAsync: updateService, isPending } = useConvexMutationQuery(
    api.functions.services.update
  )

  const form = useForm({
    defaultValues: {
      name: service?.name?.fr || "",
      description: service?.description?.fr || "",
      category: (service?.category || ServiceCategory.OTHER) as string,
    },
    onSubmit: async ({ value }) => {
      if (!value.name || value.name.length < 3) {
        toast.error("Le nom doit faire au moins 3 caractères")
        return
      }
      if (!value.description) {
        toast.error("La description est requise")
        return
      }

      try {
        await updateService({
          serviceId,
          name: { fr: value.name },
          description: { fr: value.description },
          category: value.category as any,
          defaults: {
            estimatedDays: service?.defaults?.estimatedDays ?? 7,
            requiresAppointment: service?.defaults?.requiresAppointment ?? true,
            requiredDocuments: documents,
          },
        })
        toast.success("Service mis à jour")
        navigate({ to: "/superadmin/services" })
      } catch (error: any) {
        const errorKey = error.message?.startsWith("errors.") ? error.message : null
        toast.error(errorKey ? t(errorKey) : t("superadmin.common.error"))
      }
    },
  })

  // Initialize documents when service loads
  React.useEffect(() => {
    if (service) {
      // @ts-ignore
      setDocuments(service.defaultDocuments || [])
    }
  }, [service])

  const addDocument = () => {
    setDocuments([...documents, { type: "document", label: "", required: true }])
  }

  const updateDocument = (index: number, field: keyof RequiredDocument, value: string | boolean) => {
    const newDocs = [...documents]
    // @ts-ignore
    newDocs[index] = { ...newDocs[index], [field]: value }
    setDocuments(newDocs)
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <Skeleton className="h-8 w-64" />
        <Card className="max-w-2xl">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/superadmin/services" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("superadmin.common.back")}
        </Button>
        <div className="text-destructive">Service non trouvé</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/superadmin/services" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("superadmin.common.back")}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("superadmin.common.edit")}
          </h1>
          <p className="text-muted-foreground">{service.name.fr}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("superadmin.common.edit")}</CardTitle>
          <CardDescription>
            Modifier les informations de ce service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="service-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              {/* Name */}
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.name")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />

              {/* Slug (read-only) */}
              <Field>
                <FieldLabel>{t("superadmin.services.form.slug")}</FieldLabel>
                <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                  <code className="text-sm">{service.slug}</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le slug ne peut pas être modifié
                </p>
              </Field>

              {/* Category */}
              <form.Field
                name="category"
                children={(field) => (
                  <Field>
                    <FieldLabel>{t("superadmin.services.form.category")}</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="identity">{t("superadmin.services.categories.passport")}</SelectItem>
                        <SelectItem value="visa">{t("superadmin.services.categories.visa")}</SelectItem>
                        <SelectItem value="civil_status">{t("superadmin.services.categories.civil_status")}</SelectItem>
                        <SelectItem value="registration">{t("superadmin.services.categories.registration")}</SelectItem>
                        <SelectItem value="certification">{t("superadmin.services.categories.legalization")}</SelectItem>
                        <SelectItem value="assistance">{t("superadmin.services.categories.emergency")}</SelectItem>
                        <SelectItem value="other">{t("superadmin.services.categories.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* Description */}
              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.description")}
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
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

              {/* Required Documents */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{t("superadmin.services.form.requiredDocuments")}</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("superadmin.services.form.addDocument")}
                  </Button>
                </div>
                
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                    Aucun document requis
                  </p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
                        <div className="flex-1 grid gap-2">
                          <Input
                            placeholder={t("superadmin.services.form.documentName")}
                            value={doc.label}
                            onChange={(e) => updateDocument(index, "label", e.target.value)}
                          />
                          <Input
                             placeholder="Type (ex: pdf, image)"
                             value={doc.type}
                             onChange={(e) => updateDocument(index, "type", e.target.value)}
                           />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/superadmin/services" })}
          >
            {t("superadmin.services.form.cancel")}
          </Button>
          <Button type="submit" form="service-form" disabled={isPending}>
            {isPending ? t("superadmin.organizations.form.saving") : t("superadmin.services.form.save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
