import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"
import { countryCodes, FamilyLink } from "@convex/lib/constants"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { Combobox } from "@/components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileFormValues } from "@/lib/validation/profile"

interface ContactsStepProps {
  control: Control<ProfileFormValues>
  errors?: FieldErrors<ProfileFormValues>
}

function EmergencyContactSection({ 
  control, 
  namePrefix, 
  title, 
  t 
}: { 
  control: Control<ProfileFormValues>
  namePrefix: "contacts.emergencyResidence" | "contacts.emergencyHomeland"
  title: string
  t: (key: string, defaultValue?: string) => string
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{title}</h3>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Controller
          name={`${namePrefix}.firstName` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-firstName`}>{t("profile.fields.firstName", "Prénom")}</FieldLabel>
              <Input 
                id={`${namePrefix}-firstName`}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.lastName` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-lastName`}>{t("profile.fields.lastName", "Nom")}</FieldLabel>
              <Input 
                id={`${namePrefix}-lastName`}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.phone` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-phone`}>{t("profile.fields.phone", "Téléphone")}</FieldLabel>
              <Input 
                id={`${namePrefix}-phone`}
                type="tel"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.email` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-email`}>{t("profile.fields.email", "Email")}</FieldLabel>
              <Input 
                id={`${namePrefix}-email`}
                type="email"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`${namePrefix}.relationship` as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${namePrefix}-relationship`}>{t("profile.fields.relationship", "Lien de parenté")}</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={FamilyLink.Father}>{t("profile.relationship.father", "Père")}</SelectItem>
                  <SelectItem value={FamilyLink.Mother}>{t("profile.relationship.mother", "Mère")}</SelectItem>
                  <SelectItem value={FamilyLink.Spouse}>{t("profile.relationship.spouse", "Conjoint(e)")}</SelectItem>
                  <SelectItem value={FamilyLink.BrotherSister}>{t("profile.relationship.brotherSister", "Frère/Sœur")}</SelectItem>
                  <SelectItem value={FamilyLink.Child}>{t("profile.relationship.child", "Enfant")}</SelectItem>
                  <SelectItem value={FamilyLink.LegalGuardian}>{t("profile.relationship.legalGuardian", "Tuteur légal")}</SelectItem>
                  <SelectItem value={FamilyLink.Other}>{t("profile.relationship.other", "Autre")}</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  )
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
  const { t } = useTranslation()
  const countryOptions = useMemo(() => {
    return countryCodes.map((code) => ({
      value: code,
      label: t(`superadmin.countryCodes.${code}`, code),
    }))
  }, [t])

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

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.sections.emergencyContacts", "Contacts d'urgence")}</CardTitle>
          <CardDescription>{t("profile.sections.emergencyContactsDesc", "Personnes à contacter en cas d'urgence")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EmergencyContactSection 
            control={control} 
            namePrefix="contacts.emergencyResidence" 
            title={t("profile.sections.emergencyResidence", "Contact d'urgence (Pays de résidence)")} 
            t={t}
          />

          <EmergencyContactSection 
            control={control} 
            namePrefix="contacts.emergencyHomeland" 
            title={t("profile.sections.emergencyHomeland", "Contact d'urgence (Gabon)")} 
            t={t}
          />
        </CardContent>
      </Card>
    </div>
  )
}
