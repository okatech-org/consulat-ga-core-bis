import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"
import { getCountryOptions } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileFormValues } from "@/lib/validation/profile"

interface ContactsStepProps {
  control: Control<ProfileFormValues>
  errors?: FieldErrors<ProfileFormValues>
}

function AddressSection({ 
  control, 
  namePrefix, 
  title, 
  countryOptions, 
  t 
}: { 
  control: Control<ProfileFormValues>
  namePrefix: "addresses.homeland" | "addresses.residence"
  title: string
  countryOptions: Array<{ value: string; label: string }>
  t: (key: string, defaultValue?: string) => string
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{title}</h3>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Controller
          name={`${namePrefix}.country` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-country`}>{t("profile.fields.country", "Pays")}</FieldLabel>
              <Combobox 
                options={countryOptions}
                value={field.value} 
                onValueChange={field.onChange} 
                placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")} 
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.city` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-city`}>{t("profile.fields.city", "Ville")}</FieldLabel>
              <Input 
                id={`${namePrefix}-city`}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.postalCode` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-postalCode`}>{t("common.postalCode", "Code postal")}</FieldLabel>
              <Input 
                id={`${namePrefix}-postalCode`}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.street` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-street`}>{t("profile.fields.street", "Adresse")}</FieldLabel>
              <Input 
                id={`${namePrefix}-street`}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  )
}

export function ContactsStep({ control, errors }: ContactsStepProps) {
  const { t, i18n } = useTranslation()
  const countryOptions = useMemo(() => getCountryOptions(i18n.language), [i18n.language])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("registration.steps.contacts.title", "Contacts")}</CardTitle>
          <CardDescription>{t("registration.steps.contacts.description", "Coordonnées")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Controller
              name="contacts.email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contacts-email">{t("profile.fields.email", "Email")}</FieldLabel>
                  <Input 
                    id="contacts-email"
                    type="email" 
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="contacts.phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contacts-phone">{t("profile.fields.phone", "Téléphone")}</FieldLabel>
                  <Input 
                    id="contacts-phone"
                    type="tel" 
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="contacts.phoneAbroad"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contacts-phoneAbroad">{t("profile.fields.phoneAbroad", "Téléphone (Autre)")}</FieldLabel>
                  <Input 
                    id="contacts-phoneAbroad"
                    type="tel" 
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <AddressSection 
            control={control} 
            namePrefix="addresses.homeland" 
            title={t("profile.sections.addressHome", "Adresse au Gabon")} 
            countryOptions={countryOptions}
            t={t}
          />

          <AddressSection 
            control={control} 
            namePrefix="addresses.residence" 
            title={t("profile.sections.addressAbroad", "Adresse de Résidence")} 
            countryOptions={countryOptions}
            t={t}
          />
        </CardContent>
      </Card>
    </div>
  )
}
