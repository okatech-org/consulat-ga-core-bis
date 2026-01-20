import { useTranslation } from "react-i18next"
import { Controller, type Control, type FieldErrors, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaritalStatus } from "@convex/lib/constants"
import type { ProfileFormValues } from "@/lib/validation/profile"

interface FamilyStepProps {
  control: Control<ProfileFormValues>
  errors?: FieldErrors<ProfileFormValues>
}

function ParentSection({ 
  control, 
  namePrefix, 
  title, 
  t 
}: { 
  control: Control<ProfileFormValues>
  namePrefix: "family.father" | "family.mother"
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
              <FieldLabel htmlFor={`${namePrefix}-firstName`}>{t("common.firstName", "Prénom")}</FieldLabel>
              <Input 
                id={`${namePrefix}-firstName`}
                autoComplete="given-name" 
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
              <FieldLabel htmlFor={`${namePrefix}-lastName`}>{t("common.lastName", "Nom")}</FieldLabel>
              <Input 
                id={`${namePrefix}-lastName`}
                autoComplete="family-name" 
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

export function FamilyStep({ control, errors }: FamilyStepProps) {
  const { t } = useTranslation()
  const maritalStatus = useWatch({ control, name: "family.maritalStatus" })
  const isPartnerRequired = maritalStatus && [MaritalStatus.Married, MaritalStatus.CivilUnion].includes(maritalStatus)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("registration.steps.family.title", "Famille")}</CardTitle>
          <CardDescription>{t("registration.steps.family.description", "Situation familiale")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Controller
            name="family.maritalStatus"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="family-maritalStatus">{t("profile.fields.maritalStatus", "État civil")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MaritalStatus.Single}>{t("profile.maritalStatus.single", "Célibataire")}</SelectItem>
                    <SelectItem value={MaritalStatus.Married}>{t("profile.maritalStatus.married", "Marié(e)")}</SelectItem>
                    <SelectItem value={MaritalStatus.Divorced}>{t("profile.maritalStatus.divorced", "Divorcé(e)")}</SelectItem>
                    <SelectItem value={MaritalStatus.Widowed}>{t("profile.maritalStatus.widowed", "Veuf/Veuve")}</SelectItem>
                    <SelectItem value={MaritalStatus.CivilUnion}>{t("profile.maritalStatus.civilUnion", "PACS / Union libre")}</SelectItem>
                    <SelectItem value={MaritalStatus.Cohabiting}>{t("profile.maritalStatus.cohabiting", "Concubinage")}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">
              {t("profile.family.spouse", "Conjoint(e)")} {isPartnerRequired && "*"}
            </h3>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Controller
                name="family.spouse.firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-spouse-firstName">{t("common.firstName", "Prénom")} {isPartnerRequired && "*"}</FieldLabel>
                    <Input 
                      id="family-spouse-firstName"
                      autoComplete="given-name" 
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="family.spouse.lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-spouse-lastName">{t("common.lastName", "Nom")} {isPartnerRequired && "*"}</FieldLabel>
                    <Input 
                      id="family-spouse-lastName"
                      autoComplete="family-name" 
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <ParentSection control={control} namePrefix="family.father" title={t("profile.family.father", "Père")} t={t} />
          <ParentSection control={control} namePrefix="family.mother" title={t("profile.family.mother", "Mère")} t={t} />
        </CardContent>
      </Card>
    </div>
  )
}
