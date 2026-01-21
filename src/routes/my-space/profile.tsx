import { createFileRoute } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery, useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Save, User, Phone, Users, FolderOpen, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { Doc } from "@convex/_generated/dataModel"
import { CountryCode, Gender, NationalityAcquisition, MaritalStatus } from "@convex/lib/constants"
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile"
import { IdentityStep } from "@/components/registration/steps/IdentityStep"
import { ContactsStep } from "@/components/registration/steps/ContactsStep"
import { FamilyStep } from "@/components/registration/steps/FamilyStep"
import { DocumentsStep } from "@/components/registration/steps/DocumentsStep"
import { cn } from "@/lib/utils"
import { getChangedFields, transformFormDataToPayload } from "@/lib/profile-utils"

export const Route = createFileRoute("/my-space/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const { data: profile, isPending, isError } = useAuthenticatedConvexQuery(api.functions.profiles.getMine, {})
  const { mutateAsync: updateProfile } = useConvexMutationQuery(api.functions.profiles.update)

  if (isPending) {
     return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
  }

  if (isError || !profile) return <div className="p-8">{t("profile.notFound", "Profil introuvable")}</div>

  return (
    <ProfileForm 
      profile={profile} 
      updateProfile={updateProfile} 
    />
  )
}

interface ProfileFormProps {
  profile: Doc<"profiles">
  updateProfile: (args: any) => Promise<any>
}

const STEPS = ["personal", "contacts", "family", "documents"] as const
type Step = typeof STEPS[number]

function ProfileForm({ profile, updateProfile }: ProfileFormProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState<Step>("personal")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      identity: {
            firstName: profile.identity?.firstName || "",
            lastName: profile.identity?.lastName || "",
        birthDate: profile.identity?.birthDate ? new Date(profile.identity.birthDate) : undefined,
            birthPlace: profile.identity?.birthPlace || "",
        birthCountry: profile.identity?.birthCountry || CountryCode.GA,
        gender: profile.identity?.gender || Gender.Male,
        nationality: profile.identity?.nationality || CountryCode.GA,
        nationalityAcquisition: profile.identity?.nationalityAcquisition || NationalityAcquisition.Birth,
      },
      passportInfo: profile.passportInfo ? {
        number: profile.passportInfo.number || "",
        issueDate: profile.passportInfo.issueDate ? new Date(profile.passportInfo.issueDate) : undefined,
        expiryDate: profile.passportInfo.expiryDate ? new Date(profile.passportInfo.expiryDate) : undefined,
        issuingAuthority: profile.passportInfo.issuingAuthority || "",
      } : undefined,
      addresses: {
        homeland: profile.addresses?.homeland || { street: "", city: "", postalCode: "", country: CountryCode.GA },
        residence: profile.addresses?.residence || { street: "", city: "", postalCode: "", country: CountryCode.FR },
        },
        contacts: {
            email: profile.contacts?.email || "",
            phone: profile.contacts?.phone || "",
            emergencyResidence: profile.contacts?.emergency?.[0] || undefined,
            emergencyHomeland: profile.contacts?.emergency?.[1] || undefined,
        },
        family: {
        maritalStatus: profile.family?.maritalStatus || MaritalStatus.Single,
            father: profile.family?.father || { firstName: "", lastName: "" },
            mother: profile.family?.mother || { firstName: "", lastName: "" },
            spouse: profile.family?.spouse || { firstName: "", lastName: "" },
      },
      documents: {
        passport: profile.documents?.passport || [],
        nationalId: profile.documents?.nationalId || [],
        photo: profile.documents?.photo || [],
        birthCertificate: profile.documents?.birthCertificate || [],
        proofOfAddress: profile.documents?.proofOfAddress || [],
        residencePermit: profile.documents?.residencePermit || [],
      },
    },
  })


  const getStepFields = (step: Step): (keyof ProfileFormValues)[] => {
    switch (step) {
      case "personal":
        return ["identity", "passportInfo"]
      case "contacts":
        return ["addresses", "contacts"]
      case "family":
        return ["family"]
      case "documents":
        return ["documents"]
    }
  }

  const isStepValid = async (step: Step): Promise<boolean> => {
    const fields = getStepFields(step)
    const result = await form.trigger(fields as any)
    return result
  }

  const saveStep = async (step: Step) => {
    const isValid = await isStepValid(step)
    if (!isValid) {
      toast.error(t("profile.step.invalid", "Veuillez corriger les erreurs avant de continuer"))
      return false
    }

    try {
      const data = form.getValues()
      
      // Récupérer uniquement les champs modifiés pour cette étape
      const changedFields = getChangedFields(data, profile)
      
      // Filtrer selon l'étape courante
      const stepFields: Partial<ProfileFormValues> = {}
      
      switch (step) {
        case "personal":
          if (changedFields.identity) stepFields.identity = changedFields.identity
          if (changedFields.passportInfo !== undefined) stepFields.passportInfo = changedFields.passportInfo
          break
        case "contacts":
          if (changedFields.addresses) stepFields.addresses = changedFields.addresses
          if (changedFields.contacts) stepFields.contacts = changedFields.contacts
          break
        case "family":
          if (changedFields.family) stepFields.family = changedFields.family
          break
        case "documents":
          // Les documents sont gérés directement par DocumentsStep
          break
      }

      // Transformer en payload pour Convex (dates en timestamps)
      const payload = transformFormDataToPayload(stepFields)

      if (Object.keys(payload).length > 0) {
            await updateProfile({
                id: profile._id,
          ...payload,
            })
      }

            toast.success(t("common.saved", "Modifications enregistrées"))
      return true
        } catch (e: unknown) {
             const error = e as Error
             console.error(error)
             toast.error(error.message || "Erreur lors de l'enregistrement")
      return false
    }
  }

  const handleNext = async () => {
    const saved = await saveStep(currentStep)
    if (saved) {
      const currentIndex = STEPS.indexOf(currentStep)
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1])
      }
    }
  }

  const handlePrevious = () => {
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    }
  }

  const handleStepClick = async (step: Step) => {
    if (step === currentStep) return
    
    // Si on va vers une étape précédente, on peut naviguer directement
    const currentIndex = STEPS.indexOf(currentStep)
    const targetIndex = STEPS.indexOf(step)
    
    if (targetIndex < currentIndex) {
      setCurrentStep(step)
      return
    }

    // Si on va vers une étape suivante, on doit sauvegarder l'étape actuelle
    const saved = await saveStep(currentStep)
    if (saved) {
      setCurrentStep(step)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return <IdentityStep control={form.control} errors={form.formState.errors} />
      case "contacts":
        return <ContactsStep control={form.control} errors={form.formState.errors} />
      case "family":
        return <FamilyStep control={form.control} errors={form.formState.errors} />
      case "documents":
        return <DocumentsStep control={form.control} errors={form.formState.errors} profileId={profile._id} />
    }
  }

  const getStepTitle = (step: Step) => {
    switch (step) {
      case "personal":
        return t("profile.tabs.personal", "Infos Personnelles")
      case "contacts":
        return t("profile.tabs.contacts", "Contacts")
      case "family":
        return t("profile.tabs.family", "Famille")
      case "documents":
        return t("profile.tabs.documents", "Mes Documents")
    }
  }

  const getStepIcon = (step: Step) => {
    switch (step) {
      case "personal":
        return User
      case "contacts":
        return Phone
      case "family":
        return Users
      case "documents":
        return FolderOpen
    }
  }

  const currentStepIndex = STEPS.indexOf(currentStep)

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("common.profile", "Mon Profil")}</h1>
            <p className="text-muted-foreground">
                {t("profile.manageDesc", "Gérez vos informations personnelles et consulaires.")}
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <a href="/my-space/registration">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Dossier Consulaire
                </a>
            </Button>
        </div>
      </div>

      {/* Step indicators */}
      <div className="overflow-x-auto mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-max sm:min-w-0 sm:w-full">
          {STEPS.map((step, index) => {
            const Icon = getStepIcon(step)
            const isActive = step === currentStep
            const isCompleted = index < currentStepIndex
            const canNavigate = index <= currentStepIndex

            return (
              <div key={step} className="flex items-center shrink-0 sm:flex-1">
                <button
                  type="button"
                  onClick={() => canNavigate && handleStepClick(step)}
                  disabled={!canNavigate}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-1 p-2 sm:p-4 rounded-lg transition-all",
                    "min-w-[140px] sm:min-w-0",
                    isActive && "bg-primary/10 border-2 border-primary",
                    !isActive && !isCompleted && "border-2 border-muted",
                    isCompleted && !isActive && "border-2 border-primary/30 bg-primary/5",
                    !canNavigate && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && !isActive && "bg-primary/20 text-primary",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted && !isActive ? (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Icon className={cn(
                        "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-xs sm:text-sm font-semibold whitespace-nowrap",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {getStepTitle(step)}
                      </span>
                    </div>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mx-1 sm:mx-2 shrink-0 hidden sm:block" />
                )}
                        </div>
            )
          })}
                        </div>
                        </div>

      {/* Step content */}
      <div className="space-y-6">
        <FormProvider {...form}>
          <form id="profile-form">
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {renderStepContent()}
                        </div>
          </form>
        </FormProvider>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || form.formState.isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("common.previous", "Précédent")}
          </Button>
          <div className="flex gap-2">
            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("common.next", "Suivant")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => saveStep(currentStep)}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t("common.save", "Enregistrer")}
              </Button>
            )}
                            </div>
                            </div>
                </div>
    </div>
  )
}
