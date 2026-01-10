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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrgType } from '@convex/lib/types'

export const Route = createFileRoute('/superadmin/orgs/new')({
  component: NewOrganizationPage,
})

function NewOrganizationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const { mutateAsync: createOrg, isPending } = useConvexMutationQuery(
    api.admin.createOrg
  )

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      type: OrgType.CONSULATE,
      address: {
        street1: "",
        street2: "",
        city: "",
        postalCode: "",
        state: "",
        country: "",
      },
      email: "",
      phone: "",
      website: "",
      timezone: "Europe/Paris",
    },
    onSubmit: async ({ value }) => {

      if (!value.name || value.name.length < 3) {
        toast.error("Name must be at least 3 characters")
        return
      }
      if (!value.slug || value.slug.length < 2) {
        toast.error("Slug must be at least 2 characters")
        return
      }
      if (!value.address.street1 || !value.address.city || !value.address.country) {
        toast.error("Street, city, and country are required")
        return
      }

      try {
        await createOrg({
          name: value.name,
          slug: value.slug,
          type: value.type as any, 
          address: {
            street: value.address.street1,
            street2: value.address.street2 || undefined,
            city: value.address.city,
            postalCode: value.address.postalCode || "",
            state: value.address.state || undefined,
            country: value.address.country,
          },
          email: value.email || undefined,
          phone: value.phone || undefined,
          website: value.website || undefined,
          timezone: value.timezone,
        })
        toast.success(t("superadmin.organizations.form.create") + " ✓")
        navigate({ to: "/superadmin/orgs" })
      } catch (error) {
        toast.error(t("superadmin.common.error"))
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("superadmin.organizations.form.create")}
          </h1>
          <p className="text-muted-foreground">
            {t("superadmin.organizations.description")}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("superadmin.organizations.form.create")}</CardTitle>
          <CardDescription>
            Fill in the details to create a new organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="org-form"
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
                        {t("superadmin.organizations.form.name")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => handleNameChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder={t("superadmin.organizations.form.namePlaceholder")}
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
                        {t("superadmin.organizations.form.slug")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder={t("superadmin.organizations.form.slugPlaceholder")}
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

              {/* Type */}
              <form.Field
                name="type"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("superadmin.organizations.form.type")}
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as OrgType)}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulate">
                            {t("superadmin.organizations.types.consulate")}
                          </SelectItem>
                          <SelectItem value="embassy">
                            {t("superadmin.organizations.types.embassy")}
                          </SelectItem>
                          <SelectItem value="ministry">
                            {t("superadmin.organizations.types.ministry")}
                          </SelectItem>
                          <SelectItem value="other">
                            {t("superadmin.organizations.types.other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />

              {/* Address Section */}
              <div className="pt-4">
                <h3 className="font-medium mb-2">{t("superadmin.organizations.form.address")}</h3>
                <div className="grid gap-4">
                  <form.Field
                    name="address.street1"
                    children={(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            {t("superadmin.organizations.form.street")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="address.street2"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          {t("superadmin.organizations.form.street2")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="address.city"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t("superadmin.organizations.form.city")}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        )
                      }}
                    />

                    <form.Field
                      name="address.postalCode"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            {t("superadmin.organizations.form.postalCode")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="address.state"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            {t("superadmin.organizations.form.state")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </Field>
                      )}
                    />

                    <form.Field
                      name="address.country"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t("superadmin.organizations.form.country")}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        )
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="pt-4">
                <h3 className="font-medium mb-2">{t("superadmin.organizations.form.contact")}</h3>
                <div className="grid gap-4">
                  <form.Field
                    name="email"
                    children={(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            {t("superadmin.organizations.form.email")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="phone"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          {t("superadmin.organizations.form.phone")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="tel"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </Field>
                    )}
                  />

                  <form.Field
                    name="website"
                    children={(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            {t("superadmin.organizations.form.website")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="url"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="https://"
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  />
                </div>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/superadmin/orgs" })}
          >
            {t("superadmin.organizations.form.cancel")}
          </Button>
          <Button type="submit" form="org-form" disabled={isPending}>
            {isPending ? t("superadmin.organizations.form.saving") : t("superadmin.organizations.form.save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
