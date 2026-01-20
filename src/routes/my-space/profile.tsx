import { createFileRoute } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery, useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, User, Phone, Users, FolderOpen } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { Doc } from "@convex/_generated/dataModel"
import { CountryCode, Gender, NationalityAcquisition, MaritalStatus } from "@convex/lib/constants"
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile"
import { IdentityStep } from "@/components/registration/steps/IdentityStep"
import { ContactsStep } from "@/components/registration/steps/ContactsStep"
import { FamilyStep } from "@/components/registration/steps/FamilyStep"
import { DocumentsStep } from "@/components/registration/steps/DocumentsStep"

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

function ProfileForm({ profile, updateProfile }: ProfileFormProps) {
  const { t } = useTranslation()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
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
        phoneAbroad: profile.contacts?.phoneAbroad || "",
        emergency: profile.contacts?.emergency || [],
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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const payload = {
        identity: {
          ...data.identity,
          birthDate: data.identity.birthDate?.getTime(),
        },
        passportInfo: data.passportInfo ? {
          ...data.passportInfo,
          issueDate: data.passportInfo.issueDate?.getTime(),
          expiryDate: data.passportInfo.expiryDate?.getTime(),
        } : undefined,
        addresses: data.addresses,
        contacts: data.contacts,
        family: data.family,
      }
      await updateProfile({
        id: profile._id,
        ...payload,
      })
      toast.success(t("common.saved", "Modifications enregistrées"))
    } catch (e: unknown) {
      const error = e as Error
      console.error(error)
      toast.error(error.message || "Erreur lors de l'enregistrement")
    }
  }

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
          <Button onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {t("common.save", "Enregistrer")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-6">
          <TabsTrigger 
            value="personal" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none border min-w-[120px]"
          >
            <User className="mr-2 h-4 w-4 hidden sm:inline-block" />
            {t("profile.tabs.personal", "Infos Personnelles")}
          </TabsTrigger>
          <TabsTrigger 
            value="contacts" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none border min-w-[120px]"
          >
            <Phone className="mr-2 h-4 w-4 hidden sm:inline-block" />
            {t("profile.tabs.contacts", "Contacts")}
          </TabsTrigger>
          <TabsTrigger 
            value="family" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none border min-w-[120px]"
          >
            <Users className="mr-2 h-4 w-4 hidden sm:inline-block" />
            {t("profile.tabs.family", "Famille")}
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none border min-w-[120px]"
          >
            <FolderOpen className="mr-2 h-4 w-4 hidden sm:inline-block" />
            {t("profile.tabs.documents", "Mes Documents")}
          </TabsTrigger>
        </TabsList>

        <FormProvider {...form}>
          <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="personal">
              <IdentityStep control={form.control} errors={form.formState.errors} />
            </TabsContent>
            
            <TabsContent value="contacts">
              <ContactsStep control={form.control} errors={form.formState.errors} />
            </TabsContent>

            <TabsContent value="family">
              <FamilyStep control={form.control} errors={form.formState.errors} />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentsStep control={form.control} errors={form.formState.errors} profileId={profile._id} />
            </TabsContent>
          </form>
        </FormProvider>
      </Tabs>
    </div>
  )
}
