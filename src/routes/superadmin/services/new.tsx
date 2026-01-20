"use client"

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { useConvexMutationQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
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
import { ServiceCategory } from '@convex/lib/validators'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/superadmin/services/new')({
  component: NewServicePage,
})

interface RequiredDocument {
  type: string
  label: string
  required: boolean
}

function NewServicePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<RequiredDocument[]>([])
  
  const { mutateAsync: createService, isPending } = useConvexMutationQuery(
    api.functions.services.create
  )

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category: ServiceCategory.Other as string,
    },
    onSubmit: async ({ value }) => {
      if (!value.name || value.name.length < 3) {
        toast.error("Le nom doit faire au moins 3 caractères")
        return
      }
      if (!value.slug || value.slug.length < 2) {
        toast.error("Le slug doit faire au moins 2 caractères")
        return
      }
      if (!value.description) {
        toast.error("La description est requise")
        return
      }

      try {
        await createService({
          slug: value.slug,
          code: value.slug.toUpperCase(),
          name: { fr: value.name },
          description: { fr: value.description },
          category: value.category as any,
          defaults: {
            estimatedDays: 7,
            requiresAppointment: true,
            requiredDocuments: documents,
          },
        })
        toast.success("Service créé avec succès")
        navigate({ to: "/superadmin/services" })
      } catch (error: any) {
        const errorKey = error.message?.startsWith("errors.") ? error.message : null
        toast.error(errorKey ? t(errorKey) : t("superadmin.common.error"))
      }
    },
  })


  const handleNameChange = (name: string) => {
    form.setFieldValue("name", name)
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    form.setFieldValue("slug", slug)
  }

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
            {t("superadmin.services.form.create")}
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau service au catalogue global
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("superadmin.services.form.create")}</CardTitle>
          <CardDescription>
            Ce service sera disponible pour toutes les organisations
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
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="ex. Demande de passeport"
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />

              {/* Slug */}
              <form.Field
                name="slug"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.slug")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="demande-passeport"
                        autoComplete="off"
                      />
                      <p className="text-xs text-muted-foreground">
                        Identifiant unique (généré automatiquement)
                      </p>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />

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
                        placeholder="Description du service..."
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
                    Aucun document requis. Cliquez sur "Ajouter un document" pour en ajouter.
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
