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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ServiceCategory } from '@convex/lib/validators'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RichTextEditor } from '@/components/common/rich-text-editor'

export const Route = createFileRoute('/admin/services/new')({
  component: NewServicePage,
})

interface RequiredDocument {
  type: string
  label: { fr: string; en?: string }
  required: boolean
}

function NewServicePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<RequiredDocument[]>([])
  const [contentFr, setContentFr] = useState("")
  const [contentEn, setContentEn] = useState("")
  const [requiresAppointment, setRequiresAppointment] = useState(true)
  
  const { mutateAsync: createService, isPending } = useConvexMutationQuery(
    api.functions.services.create
  )

  const form = useForm({
    defaultValues: {
      nameFr: "",
      nameEn: "",
      descriptionFr: "",
      descriptionEn: "",
      category: ServiceCategory.Other as string,
      icon: "",
      estimatedDays: "7",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.nameFr || value.nameFr.length < 3) {
        toast.error(t("superadmin.organizations.form.error.nameLength"))
        return
      }
      if (!value.slug || value.slug.length < 2) {
        toast.error(t("superadmin.organizations.form.error.slugLength"))
        return
      }
      if (!value.descriptionFr) {
        toast.error(t("superadmin.services.form.description") + " (FR) " + t("superadmin.organizations.form.error.required"))
        return
      }

      try {
        await createService({
          slug: value.slug,
          code: value.slug.toUpperCase().replace(/-/g, "_"),
          name: { fr: value.nameFr, en: value.nameEn || undefined },
          description: { fr: value.descriptionFr, en: value.descriptionEn || undefined },
          content: contentFr ? { fr: contentFr, en: contentEn || undefined } : undefined,
          category: value.category as any,
          icon: value.icon || undefined,
          estimatedDays: parseInt(value.estimatedDays) || 7,
          requiresAppointment,
          requiredDocuments: documents,
        })
        toast.success(t("superadmin.services.form.success"))
        navigate({ to: "/admin/services" })
      } catch (error: any) {
        const errorKey = error.message?.startsWith("errors.") ? error.message : null
        toast.error(errorKey ? t(errorKey) : t("superadmin.common.error"))
      }
    },
  })


  const handleNameChange = (name: string) => {
    form.setFieldValue("nameFr", name)
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    form.setFieldValue("slug", slug)
  }

  const addDocument = () => {
    setDocuments([...documents, { type: "document", label: { fr: "", en: "" }, required: true }])
  }

  const updateDocumentLabel = (index: number, lang: "fr" | "en", value: string) => {
    const newDocs = [...documents]
    newDocs[index] = { 
      ...newDocs[index], 
      label: { ...newDocs[index].label, [lang]: value } 
    }
    setDocuments(newDocs)
  }

  const updateDocumentType = (index: number, value: string) => {
    const newDocs = [...documents]
    newDocs[index] = { ...newDocs[index], type: value }
    setDocuments(newDocs)
  }

  const updateDocumentRequired = (index: number, value: boolean) => {
    const newDocs = [...documents]
    newDocs[index] = { ...newDocs[index], required: value }
    setDocuments(newDocs)
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/services" })}>
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
            {t("superadmin.services.description")}
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("superadmin.services.form.create")}</CardTitle>
          <CardDescription>
            {t("superadmin.services.description")}
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
              {/* Name FR */}
              <form.Field
                name="nameFr"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.name")} (FR) *
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder={t("superadmin.organizations.form.namePlaceholder")}
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />

              {/* Name EN */}
              <form.Field
                name="nameEn"
                children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.name")} (EN)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="ex. Passport application"
                        autoComplete="off"
                      />
                    </Field>
                )}
              />

              {/* Slug */}
              <form.Field
                name="slug"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.slug")} *
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
                        {t("superadmin.organizations.form.slugHelp")}
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
                        <SelectItem value="passport">{t("superadmin.services.categories.passport")}</SelectItem>
                        <SelectItem value="identity">{t("superadmin.services.categories.identity")}</SelectItem>
                        <SelectItem value="visa">{t("superadmin.services.categories.visa")}</SelectItem>
                        <SelectItem value="civil_status">{t("superadmin.services.categories.civil_status")}</SelectItem>
                        <SelectItem value="registration">{t("superadmin.services.categories.registration")}</SelectItem>
                        <SelectItem value="certification">{t("superadmin.services.categories.legalization")}</SelectItem>
                        <SelectItem value="transcript">{t("superadmin.services.categories.transcript") || "Transcription"}</SelectItem>
                        <SelectItem value="travel_document">{t("superadmin.services.categories.travel_document") || "Document de voyage"}</SelectItem>
                        <SelectItem value="assistance">{t("superadmin.services.categories.emergency")}</SelectItem>
                        <SelectItem value="other">{t("superadmin.services.categories.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* Description FR */}
              <form.Field
                name="descriptionFr"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.description")} (FR) *
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={3}
                        placeholder={t("superadmin.services.form.description")}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />

              {/* Description EN */}
              <form.Field
                name="descriptionEn"
                children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.services.form.description")} (EN)
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={3}
                        placeholder={t("superadmin.services.form.description")}
                      />
                    </Field>
                )}
              />

              {/* Content (Rich Text) */}
              <div className="space-y-2">
                <Label>{t("superadmin.services.form.content") || "Contenu détaillé"}</Label>
                <Tabs defaultValue="fr" className="w-full">
                  <TabsList>
                    <TabsTrigger value="fr">Français</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr" className="mt-2">
                    <RichTextEditor
                      content={contentFr}
                      onChange={setContentFr}
                      placeholder="Contenu détaillé du service (procédures, informations, etc.)..."
                    />
                  </TabsContent>
                  <TabsContent value="en" className="mt-2">
                    <RichTextEditor
                      content={contentEn}
                      onChange={setContentEn}
                      placeholder="Detailed service content (procedures, information, etc.)..."
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Processing Info */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <form.Field
                  name="estimatedDays"
                  children={(field) => (
                    <Field>
                      <FieldLabel>{t("superadmin.services.form.estimatedDays") || "Délai estimé (jours)"}</FieldLabel>
                      <Input 
                        type="number" 
                        min="0"
                        value={field.state.value} 
                        onChange={e => field.handleChange(e.target.value)} 
                      />
                    </Field>
                  )}
                />
                <Field>
                  <FieldLabel>{t("superadmin.services.form.requiresAppointment") || "Rendez-vous requis"}</FieldLabel>
                  <div className="flex items-center gap-2 h-10">
                    <Switch 
                      checked={requiresAppointment} 
                      onCheckedChange={setRequiresAppointment} 
                    />
                    <span className="text-sm text-muted-foreground">
                      {requiresAppointment ? "Oui" : "Non"}
                    </span>
                  </div>
                </Field>
              </div>

              {/* Icon */}
              <form.Field
                name="icon"
                children={(field) => (
                  <Field>
                    <FieldLabel>{t("superadmin.services.form.icon")}</FieldLabel>
                    <Input 
                      value={field.state.value} 
                      onChange={e => field.handleChange(e.target.value)} 
                      placeholder="passport, file-text, etc."
                    />
                  </Field>
                )}
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
                    {t("superadmin.services.form.noDocuments")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="p-3 border rounded-md space-y-2">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Label (FR) *"
                                value={doc.label.fr}
                                onChange={(e) => updateDocumentLabel(index, "fr", e.target.value)}
                              />
                              <Input
                                placeholder="Label (EN)"
                                value={doc.label.en || ""}
                                onChange={(e) => updateDocumentLabel(index, "en", e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Type (ex: birth_certificate, photo)"
                                value={doc.type}
                                onChange={(e) => updateDocumentType(index, e.target.value)}
                                className="flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={doc.required} 
                                  onCheckedChange={(v) => updateDocumentRequired(index, v)} 
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {doc.required ? "Requis" : "Optionnel"}
                                </span>
                              </div>
                            </div>
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
            onClick={() => navigate({ to: "/admin/services" })}
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
