import { useTranslation } from "react-i18next"
import { Controller, type Control, type FieldErrors, useWatch, useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/ui/field"
import { FileUploader } from "@/components/common/file-uploader"
import { DocumentList } from "@/components/common/document-list"
import { OwnerType } from "@convex/lib/constants"
import { useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { Check } from "lucide-react"
import type { ProfileFormValues } from "@/lib/validation/profile"

interface DocumentsStepProps {
  control: Control<ProfileFormValues>
  errors?: FieldErrors<ProfileFormValues>
  profileId: Id<"profiles">
}

export function DocumentsStep({ control, profileId }: DocumentsStepProps) {
  const { t } = useTranslation()
  const { setValue } = useFormContext<ProfileFormValues>()
  const { mutateAsync: addDocument } = useConvexMutationQuery(api.functions.profiles.addDocument)
  const { mutateAsync: removeDocument } = useConvexMutationQuery(api.functions.profiles.removeDocument)

  const documents = useWatch({ control, name: "documents" })

  const handleUpload = async (docType: "passport" | "nationalId" | "photo" | "birthCertificate" | "proofOfAddress" | "residencePermit", documentId: string) => {
    await addDocument({ docType, documentId: documentId as Id<"documents"> })
    
    const currentDocs = documents?.[docType] || []
    setValue(`documents.${docType}` as any, [...currentDocs, documentId], { shouldValidate: true })
  }

  const handleRemove = async (docType: "passport" | "nationalId" | "photo" | "birthCertificate" | "proofOfAddress" | "residencePermit", documentId: string) => {
    await removeDocument({ docType, documentId: documentId as Id<"documents"> })

    const currentDocs = documents?.[docType] || []
    setValue(`documents.${docType}` as any, currentDocs.filter((id: string) => id !== documentId), { shouldValidate: true })
  }

  const hasDoc = (docType: "passport" | "nationalId" | "photo" | "birthCertificate" | "proofOfAddress" | "residencePermit") => {
    const docs = documents?.[docType]
    return docs && Array.isArray(docs) && docs.length > 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("registration.steps.documents.title", "Documents")}</CardTitle>
          <CardDescription>
            {t("registration.steps.documents.description", "Veuillez télécharger les documents requis.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Controller
            name="documents.passport"
            control={control}
            render={({ field, fieldState }) => {
              const fieldValue = field.value || []
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">
                      {t("profile.documents.passport", "Passeport")} *
                    </Label>
                    {hasDoc("passport") && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className={!hasDoc("passport") ? "border-l-4 border-l-destructive pl-4" : ""}>
                    <FileUploader 
                      docType="passport" 
                      ownerType={OwnerType.Profile}
                      ownerId={profileId}
                      onUploadComplete={(id) => handleUpload("passport", id)}
                    />
                    <DocumentList 
                      docType="passport" 
                      documentIds={fieldValue} 
                      onRemove={(id) => handleRemove("passport", id)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </div>
                </div>
              )
            }}
          />

          <Controller
            name="documents.nationalId"
            control={control}
            render={({ field, fieldState }) => {
              const fieldValue = field.value || []
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">
                      {t("profile.documents.nationalId", "Carte Nationale d'Identité")} *
                    </Label>
                    {hasDoc("nationalId") && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className={!hasDoc("nationalId") ? "border-l-4 border-l-destructive pl-4" : ""}>
                    <FileUploader 
                      docType="nationalId" 
                      ownerType={OwnerType.Profile}
                      ownerId={profileId}
                      onUploadComplete={(id) => handleUpload("nationalId", id)}
                    />
                    <DocumentList 
                      docType="nationalId" 
                      documentIds={fieldValue} 
                      onRemove={(id) => handleRemove("nationalId", id)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </div>
                </div>
              )
            }}
          />

          <Controller
            name="documents.photo"
            control={control}
            render={({ field, fieldState }) => {
              const fieldValue = field.value || []
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">
                      {t("profile.documents.photo", "Photo d'identité")} *
                    </Label>
                    {hasDoc("photo") && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className={!hasDoc("photo") ? "border-l-4 border-l-destructive pl-4" : ""}>
                    <FileUploader 
                      docType="photo" 
                      accept={{'image/*': ['.jpg','.jpeg','.png']}}
                      ownerType={OwnerType.Profile}
                      ownerId={profileId}
                      onUploadComplete={(id) => handleUpload("photo", id)}
                    />
                    <DocumentList 
                      docType="photo" 
                      documentIds={fieldValue} 
                      onRemove={(id) => handleRemove("photo", id)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </div>
                </div>
              )
            }}
          />

          <Controller
            name="documents.residencePermit"
            control={control}
            render={({ field }) => {
              const fieldValue = field.value || []
              return (
                <div className="space-y-2">
                  <Label>{t("profile.documents.residencePermit", "Titre de Séjour / Visa")}</Label>
                  <FileUploader 
                    docType="residencePermit" 
                    ownerType={OwnerType.Profile}
                    ownerId={profileId}
                    onUploadComplete={(id) => handleUpload("residencePermit", id)}
                  />
                  <DocumentList 
                    docType="residencePermit" 
                    documentIds={fieldValue} 
                    onRemove={(id) => handleRemove("residencePermit", id)}
                  />
                </div>
              )
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
