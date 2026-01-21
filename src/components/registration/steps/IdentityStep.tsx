import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldError, FieldSet, FieldLegend } from "@/components/ui/field"
import { Combobox } from "@/components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { countryCodes, Gender, NationalityAcquisition } from "@convex/lib/constants"
import type { ProfileFormValues } from "@/lib/validation/profile"

// Helper functions to convert between Date and string (YYYY-MM-DD format)
const dateToString = (date: Date | undefined): string => {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const stringToDate = (value: string): Date | undefined => {
  if (!value) return undefined
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

interface IdentityStepProps {
  control: Control<ProfileFormValues>
  errors?: FieldErrors<ProfileFormValues>
}

export function IdentityStep({ control }: IdentityStepProps) {
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
          <CardTitle>{t("registration.steps.identity.title", "Identité")}</CardTitle>
          <CardDescription>{t("registration.steps.identity.description", "Informations personnelles")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldSet>
            <FieldLegend>{t("registration.steps.identity.title", "Identité")}</FieldLegend>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Controller
                name="identity.lastName"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-lastName-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-lastName">{t("profile.fields.lastName", "Nom")}</FieldLabel>
                      <Input 
                        id="identity-lastName"
                        autoComplete="family-name"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.firstName"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-firstName-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-firstName">{t("profile.fields.firstName", "Prénom")}</FieldLabel>
                      <Input 
                        id="identity-firstName"
                        autoComplete="given-name"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.birthDate"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-birthDate-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-birthDate">{t("profile.fields.birthDate", "Date de naissance")}</FieldLabel>
                      <Input 
                        id="identity-birthDate"
                        type="date"
                        autoComplete="bday"
                        value={dateToString(field.value)}
                        onChange={(e) => field.onChange(stringToDate(e.target.value))}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.birthPlace"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-birthPlace-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-birthPlace">{t("profile.fields.birthPlace", "Lieu de naissance")}</FieldLabel>
                      <Input 
                        id="identity-birthPlace"
                        autoComplete="address-level2"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.birthCountry"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-birthCountry-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-birthCountry">{t("profile.fields.birthCountry", "Pays de naissance")}</FieldLabel>
                      <Combobox 
                        options={countryOptions}
                        value={field.value} 
                        onValueChange={field.onChange}
                        placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.gender"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-gender-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-gender">{t("profile.fields.gender", "Genre")}</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger 
                          id="identity-gender"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.invalid ? errorId : undefined}
                        >
                          <SelectValue placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.Male}>{t("profile.gender.male", "Homme")}</SelectItem>
                          <SelectItem value={Gender.Female}>{t("profile.gender.female", "Femme")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.nationality"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-nationality-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-nationality">{t("profile.fields.nationality", "Nationalité")}</FieldLabel>
                      <Combobox 
                        options={countryOptions}
                        value={field.value} 
                        onValueChange={field.onChange} 
                        placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="identity.nationalityAcquisition"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `identity-nationalityAcquisition-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identity-nationalityAcquisition">{t("profile.fields.nationalityAcquisition", "Mode d'acquisition")}</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger 
                          id="identity-nationalityAcquisition"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.invalid ? errorId : undefined}
                        >
                          <SelectValue placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NationalityAcquisition.Birth}>{t("profile.nationalityAcquisition.birth", "Naissance")}</SelectItem>
                          <SelectItem value={NationalityAcquisition.Marriage}>{t("profile.nationalityAcquisition.marriage", "Mariage")}</SelectItem>
                          <SelectItem value={NationalityAcquisition.Naturalization}>{t("profile.nationalityAcquisition.naturalization", "Naturalisation")}</SelectItem>
                          <SelectItem value={NationalityAcquisition.Adoption}>{t("profile.nationalityAcquisition.adoption", "Adoption")}</SelectItem>
                          <SelectItem value={NationalityAcquisition.Other}>{t("profile.nationalityAcquisition.other", "Autre")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.passport.title", "Passeport")}</CardTitle>
          <CardDescription>{t("profile.passport.desc", "Informations sur votre passeport actuel")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldSet>
            <FieldLegend>{t("profile.passport.title", "Passeport")}</FieldLegend>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Controller
                name="passportInfo.number"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `passport-number-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="passport-number">{t("profile.passport.number", "Numéro de passeport")}</FieldLabel>
                      <Input 
                        id="passport-number"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="passportInfo.issuingAuthority"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `passport-authority-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="passport-authority">{t("profile.passport.authority", "Autorité de délivrance")}</FieldLabel>
                      <Input 
                        id="passport-authority"
                        autoComplete="organization"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="passportInfo.issueDate"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `passport-issueDate-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="passport-issueDate">{t("profile.passport.issueDate", "Date de délivrance")}</FieldLabel>
                      <Input 
                        id="passport-issueDate"
                        type="date"
                        autoComplete="off"
                        value={dateToString(field.value)}
                        onChange={(e) => field.onChange(stringToDate(e.target.value))}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="passportInfo.expiryDate"
                control={control}
                render={({ field, fieldState }) => {
                  const errorId = `passport-expiryDate-error`
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="passport-expiryDate">{t("profile.passport.expiryDate", "Date d'expiration")}</FieldLabel>
                      <Input 
                        id="passport-expiryDate"
                        type="date"
                        autoComplete="off"
                        value={dateToString(field.value)}
                        onChange={(e) => field.onChange(stringToDate(e.target.value))}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? errorId : undefined}
                      />
                      {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>
    </div>
  )
}
