import { createFileRoute } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery, useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, User, Phone, Users, FolderOpen } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { FileUploader } from "@/components/common/file-uploader"
import { DocumentList } from "@/components/common/document-list"
import type { Id, Doc } from "@convex/_generated/dataModel"
import { Combobox } from "@/components/ui/combobox"
import { getCountryOptions } from "@/lib/utils"
import { useMemo } from "react"

export const Route = createFileRoute("/my-space/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const { data: profile, isPending, isError } = useAuthenticatedConvexQuery(api.functions.profiles.getMine, {})
  const { mutateAsync: updateProfile } = useConvexMutationQuery(api.functions.profiles.update)
  const { mutateAsync: addDocument } = useConvexMutationQuery(api.functions.profiles.addDocument)
  const { mutateAsync: removeDocument } = useConvexMutationQuery(api.functions.profiles.removeDocument)

  if (isPending) {
     return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
  }

  if (isError || !profile) return <div className="p-8">{t("profile.notFound", "Profil introuvable")}</div>

  return (
    <ProfileForm 
      profile={profile} 
      updateProfile={updateProfile} 
      addDocument={addDocument}
      removeDocument={removeDocument}
    />
  )
}

interface ProfileFormProps {
  profile: Doc<"profiles">
  updateProfile: (args: any) => Promise<any>
  addDocument: (args: any) => Promise<any>
  removeDocument: (args: any) => Promise<any>
}

function ProfileForm({ profile, updateProfile, addDocument, removeDocument }: ProfileFormProps) {
  const { t, i18n } = useTranslation()
  const countryOptions = useMemo(() => getCountryOptions(i18n.language), [i18n.language])

  const form = useForm({
    defaultValues: {
        personal: {
            firstName: profile.identity?.firstName || "",
            lastName: profile.identity?.lastName || "",
            birthPlace: profile.identity?.birthPlace || "",
            birthCountry: profile.identity?.birthCountry || "",
            gender: profile.identity?.gender || "",
            maritalStatus: profile.family?.maritalStatus || "", // maritalStatus is in family in schema?
            nipCode: "", // nipCode not in schema identity?
        },
        contacts: {
            email: profile.contacts?.email || "",
            phoneHome: profile.contacts?.phone || "", // phone in schema is single string?
            phoneAbroad: "", // phoneAbroad not in schema?
            // Schema has addresses object
            addressHome: profile.addresses?.homeland || { street: "", city: "", postalCode: "", country: "GA" },
            addressAbroad: profile.addresses?.residence || { street: "", city: "", postalCode: "", country: "FR" },
        },
        family: {
            father: profile.family?.father || { firstName: "", lastName: "" },
            mother: profile.family?.mother || { firstName: "", lastName: "" },
            spouse: profile.family?.spouse || { firstName: "", lastName: "" },
        }
    },
    onSubmit: async ({ value }) => {
        try {
            await updateProfile({
                id: profile._id,
                identity: {
                    ...value.personal,
                    // Map back to schema structure if needed
                    // nipCode?
                },
                contacts: {
                    email: value.contacts.email,
                    phone: value.contacts.phoneHome, // Assuming phoneHome is primary
                    // missing emergency
                },
                addresses: {
                    homeland: value.contacts.addressHome,
                    residence: value.contacts.addressAbroad,
                },
                family: {
                    maritalStatus: value.personal.maritalStatus,
                    father: value.family.father,
                    mother: value.family.mother,
                    spouse: value.family.spouse,
                },
            })
            toast.success(t("common.saved", "Modifications enregistrées"))
        } catch (e: unknown) {
             const error = e as Error
             console.error(error)
             toast.error(error.message || "Erreur lors de l'enregistrement")
        }
    },
  })

  const handleUpload = async (docType: string, documentId: string) => {
      await addDocument({ docType, documentId: documentId as Id<"documents"> })
  }

  const handleRemoveDoc = async (docType: string, documentId: string) => {
      await removeDocument({ docType, documentId: documentId as Id<"documents"> })
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
        <Button onClick={() => form.handleSubmit()} disabled={form.state.isSubmitting}>
            {form.state.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {t("common.save", "Enregistrer")}
        </Button>
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

        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
            <TabsContent value="personal">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("profile.personal.title", "Informations Personnelles")}</CardTitle>
                        <CardDescription>{t("profile.personal.desc", "Vos informations d'état civil")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FieldGroup className="grid gap-4 md:grid-cols-2">
                            <form.Field name="personal.firstName">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.firstName", "Prénom")}</FieldLabel>
                                    <Input autoComplete="given-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.lastName">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.lastName", "Nom")}</FieldLabel>
                                    <Input autoComplete="family-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.birthPlace">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.birthPlace", "Lieu de naissance")}</FieldLabel>
                                    <Input autoComplete="address-level2" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.birthCountry">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.birthCountry", "Pays de naissance")}</FieldLabel>
                                    <Combobox 
                                        options={countryOptions}
                                        value={field.state.value} 
                                        onValueChange={(val) => field.handleChange(val)} 
                                        placeholder={t("profile.placeholders.selectCountry", "Sélectionner un pays")} 
                                    />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.gender">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.gender", "Genre")}</FieldLabel>
                                    <Select value={field.state.value} onValueChange={(val) => field.handleChange(val as any)}>
                                        <SelectTrigger><SelectValue placeholder={t("profile.placeholders.select", "Sélectionner")} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">{t("profile.gender.male", "Homme")}</SelectItem>
                                            <SelectItem value="female">{t("profile.gender.female", "Femme")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.maritalStatus">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.maritalStatus", "État civil")}</FieldLabel>
                                     <Select value={field.state.value} onValueChange={(val) => field.handleChange(val as any)}>
                                        <SelectTrigger><SelectValue placeholder={t("profile.placeholders.select", "Sélectionner")} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">{t("profile.maritalStatus.single", "Célibataire")}</SelectItem>
                                            <SelectItem value="married">{t("profile.maritalStatus.married", "Marié(e)")}</SelectItem>
                                            <SelectItem value="divorced">{t("profile.maritalStatus.divorced", "Divorcé(e)")}</SelectItem>
                                            <SelectItem value="widowed">{t("profile.maritalStatus.widowed", "Veuf/Veuve")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.nipCode">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.nipCode", "NIP (Si connu)")}</FieldLabel>
                                    <Input autoComplete="off" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="contacts">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t("profile.contacts.title", "Coordonnées")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FieldGroup>
                             <form.Field name="contacts.email">
                              {(field) => (
                                <Field>
                                    <FieldLabel>{t("profile.fields.email", "Email de contact")}</FieldLabel>
                                    <Input type="email" autoComplete="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                             </form.Field>
                        </FieldGroup> 

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{t("profile.sections.addressHome", "Adresse au Gabon (ou pays d'origine)")}</h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="contacts.phoneHome">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("profile.fields.phoneHome", "Téléphone (Pays d'origine)")}</FieldLabel>
                                        <Input type="tel" autoComplete="tel-national" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="contacts.addressHome.country">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("profile.fields.country", "Pays")}</FieldLabel>
                                        <Combobox 
                                            options={countryOptions}
                                            value={field.state.value} 
                                            onValueChange={(val) => field.handleChange(val)} 
                                            placeholder={t("profile.placeholders.selectCountry", "Sélectionner un pays")} 
                                        />
                                    </Field>
                                  )}
                                </form.Field>
                                 <form.Field name="contacts.addressHome.city">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("profile.fields.city", "Ville")}</FieldLabel>
                                        <Input autoComplete="address-level2" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                 </form.Field>
                                 <form.Field name="contacts.addressHome.postalCode">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.postalCode", "Code postal")}</FieldLabel>
                                        <Input autoComplete="postal-code" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                 </form.Field>
                                <form.Field name="contacts.addressHome.street">
                                  {(field) => (
                                    <Field className="md:col-span-2">
                                        <FieldLabel>{t("profile.fields.street", "Adresse")}</FieldLabel>
                                        <Input autoComplete="street-address" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                            </FieldGroup>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{t("profile.sections.addressAbroad", "Adresse de Résidence Actuelle")}</h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="contacts.phoneAbroad">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("profile.fields.phoneAbroad", "Téléphone (Résidence)")}</FieldLabel>
                                        <Input type="tel" autoComplete="tel" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="contacts.addressAbroad.country">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("profile.fields.countryOfResidence", "Pays de résidence")}</FieldLabel>
                                        <Combobox 
                                            options={countryOptions}
                                            value={field.state.value} 
                                            onValueChange={(val) => field.handleChange(val)} 
                                            placeholder={t("profile.placeholders.selectCountry", "Sélectionner un pays")} 
                                        />
                                    </Field>
                                  )}
                                </form.Field>
                                 <form.Field name="contacts.addressAbroad.city">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("profile.fields.city", "Ville")}</FieldLabel>
                                        <Input autoComplete="address-level2" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                 </form.Field>
                                 <form.Field name="contacts.addressAbroad.postalCode">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.postalCode", "Code postal")}</FieldLabel>
                                        <Input autoComplete="postal-code" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                 </form.Field>
                                <form.Field name="contacts.addressAbroad.street">
                                  {(field) => (
                                    <Field className="md:col-span-2">
                                        <FieldLabel>{t("profile.fields.street", "Adresse")}</FieldLabel>
                                        <Input autoComplete="street-address" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                            </FieldGroup>
                        </div>
                    </CardContent>
                 </Card>
            </TabsContent>

            <TabsContent value="family">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t("profile.family.title", "Informations Familiales")}</CardTitle>
                        <CardDescription>{t("profile.family.desc", "Informations sur vos parents et conjoint")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Father */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">
                                {t("profile.family.father", "Père")}
                            </h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="family.father.firstName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.firstName", "Prénom")}</FieldLabel>
                                        <Input autoComplete="given-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="family.father.lastName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                                        <Input autoComplete="family-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                            </FieldGroup>
                        </div>

                        {/* Mother */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">
                                {t("profile.family.mother", "Mère")}
                            </h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="family.mother.firstName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.firstName", "Prénom")}</FieldLabel>
                                        <Input autoComplete="given-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="family.mother.lastName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                                        <Input autoComplete="family-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                            </FieldGroup>
                        </div>

                        {/* Spouse */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">
                                {t("profile.family.spouse", "Conjoint(e)")}
                            </h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="family.spouse.firstName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.firstName", "Prénom")}</FieldLabel>
                                        <Input autoComplete="given-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="family.spouse.lastName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                                        <Input autoComplete="family-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                            </FieldGroup>
                        </div>
                    </CardContent>
                 </Card>
            </TabsContent>

            <TabsContent value="documents">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("documents.identity.title", "Identité")}</CardTitle>
                            <CardDescription>Passeport, CNI, Acte de naissance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t("profile.documents.passport", "Passeport (Pages principales)")}</Label>
                                <FileUploader 
                                    docType="passport" 
                                    ownerType={"profile"}
                                    ownerId={profile._id}
                                    onUploadComplete={(id) => handleUpload("passport", id)}
                                />
                                <DocumentList 
                                    docType="passport" 
                                    documentIds={profile.documents?.passport || []} 
                                    onRemove={(id) => handleRemoveDoc("passport", id)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("profile.documents.nationalId", "Carte Nationale d'Identité")}</Label>
                                <FileUploader 
                                    docType="nationalId" 
                                    ownerType={"profile"}
                                    ownerId={profile._id}
                                    onUploadComplete={(id) => handleUpload("nationalId", id)}
                                />
                                <DocumentList 
                                    docType="nationalId" 
                                    documentIds={profile.documents?.nationalId || []} 
                                    onRemove={(id) => handleRemoveDoc("nationalId", id)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("profile.documents.birthCertificate", "Acte de Naissance")}</Label>
                                <FileUploader 
                                    docType="birthCertificate" 
                                    ownerType={"profile"}
                                    ownerId={profile._id}
                                    onUploadComplete={(id) => handleUpload("birthCertificate", id)}
                                />
                                <DocumentList 
                                    docType="birthCertificate" 
                                    documentIds={profile.documents?.birthCertificate || []} 
                                    onRemove={(id) => handleRemoveDoc("birthCertificate", id)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("documents.residence.title", "Résidence & Autres")}</CardTitle>
                            <CardDescription>Justificatifs de domicile, Titre de séjour</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t("profile.documents.residencePermit", "Titre de Séjour / Visa")}</Label>
                                <FileUploader 
                                    docType="residencePermit" 
                                    ownerId={profile._id}
                                    onUploadComplete={(id) => handleUpload("residencePermit", id)}
                                />
                                <DocumentList 
                                    docType="residencePermit" 
                                    documentIds={profile.documents?.residencePermit || []} 
                                    onRemove={(id) => handleRemoveDoc("residencePermit", id)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("profile.documents.proofOfAddress", "Justificatif de Domicile")}</Label>
                                <FileUploader 
                                    docType="proofOfAddress" 
                                    ownerId={profile._id}
                                    onUploadComplete={(id) => handleUpload("proofOfAddress", id)}
                                />
                                <DocumentList 
                                    docType="proofOfAddress" 
                                    documentIds={profile.documents?.proofOfAddress || []} 
                                    onRemove={(id) => handleRemoveDoc("proofOfAddress", id)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>{t("profile.documents.photo", "Photo d'identité")}</Label>
                                <FileUploader 
                                    docType="photo" 
                                    accept={{'image/*': ['.jpg','.jpeg','.png']}}
                                    ownerId={profile._id}
                                    onUploadComplete={(id) => handleUpload("photo", id)}
                                />
                                <DocumentList 
                                    docType="photo" 
                                    documentIds={profile.documents?.photo || []} 
                                    onRemove={(id) => handleRemoveDoc("photo", id)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
