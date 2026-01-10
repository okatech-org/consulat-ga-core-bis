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

export const Route = createFileRoute("/my-space/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const { data: profile, isPending, isError } = useAuthenticatedConvexQuery(api.profiles.getMyProfile, {})
  const { mutateAsync: updateProfile } = useConvexMutationQuery(api.profiles.update)
  const { mutateAsync: addDocument } = useConvexMutationQuery(api.profiles.addDocument)
  const { mutateAsync: removeDocument } = useConvexMutationQuery(api.profiles.removeDocument)

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
  profile: Doc<"consularProfiles">
  updateProfile: (args: any) => Promise<any>
  addDocument: (args: any) => Promise<any>
  removeDocument: (args: any) => Promise<any>
}

function ProfileForm({ profile, updateProfile, addDocument, removeDocument }: ProfileFormProps) {
  const { t } = useTranslation()

  const form = useForm({
    defaultValues: {
        personal: {
            firstName: profile.personal?.firstName || "",
            lastName: profile.personal?.lastName || "",
            birthPlace: profile.personal?.birthPlace || "",
            birthCountry: profile.personal?.birthCountry || "",
            gender: profile.personal?.gender || "",
            maritalStatus: profile.personal?.maritalStatus || "",
            nipCode: profile.personal?.nipCode || "",
        },
        contacts: {
            email: profile.contacts?.email || "",
            phoneHome: profile.contacts?.phoneHome || "",
            phoneAbroad: profile.contacts?.phoneAbroad || "",
            addressHome: {
                street: profile.contacts?.addressHome?.street || "",
                city: profile.contacts?.addressHome?.city || "",
                country: profile.contacts?.addressHome?.country || "",
            },
            addressAbroad: {
                street: profile.contacts?.addressAbroad?.street || "",
                city: profile.contacts?.addressAbroad?.city || "",
                country: profile.contacts?.addressAbroad?.country || "",
            },
        },
        family: {
            father: {
                firstName: profile.family?.father?.firstName || "",
                lastName: profile.family?.father?.lastName || "",
            },
            mother: {
                firstName: profile.family?.mother?.firstName || "",
                lastName: profile.family?.mother?.lastName || "",
            },
            spouse: {
                firstName: profile.family?.spouse?.firstName || "",
                lastName: profile.family?.spouse?.lastName || "",
            },
        }
    },
    onSubmit: async ({ value }) => {
        try {
            await updateProfile({
                id: profile._id,
                personal: value.personal,
                contacts: value.contacts,
                family: value.family,
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
                                    <FieldLabel>Prénom</FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.lastName">
                              {(field) => (
                                <Field>
                                    <FieldLabel>Nom</FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.birthPlace">
                              {(field) => (
                                <Field>
                                    <FieldLabel>Lieu de naissance</FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.birthCountry">
                              {(field) => (
                                <Field>
                                    <FieldLabel>Pays de naissance</FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Code pays (ex: GA)" />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.gender">
                              {(field) => (
                                <Field>
                                    <FieldLabel>Genre</FieldLabel>
                                    <Select value={field.state.value} onValueChange={field.handleChange}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Homme</SelectItem>
                                            <SelectItem value="female">Femme</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.maritalStatus">
                              {(field) => (
                                <Field>
                                    <FieldLabel>État civil</FieldLabel>
                                     <Select value={field.state.value} onValueChange={field.handleChange}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Célibataire</SelectItem>
                                            <SelectItem value="married">Marié(e)</SelectItem>
                                            <SelectItem value="divorced">Divorcé(e)</SelectItem>
                                            <SelectItem value="widowed">Veuf/Veuve</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                              )}
                            </form.Field>
                            <form.Field name="personal.nipCode">
                              {(field) => (
                                <Field>
                                    <FieldLabel>NIP (Si connu)</FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
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
                                    <FieldLabel>Email de contact</FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </Field>
                              )}
                             </form.Field>
                        </FieldGroup> 

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">Adresse au Gabon (ou pays d'origine)</h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="contacts.phoneHome">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>Téléphone (Pays d'origine)</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                 <form.Field name="contacts.addressHome.city">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>Ville</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                 </form.Field>
                                <form.Field name="contacts.addressHome.street">
                                  {(field) => (
                                    <Field className="md:col-span-2">
                                        <FieldLabel>Adresse</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                            </FieldGroup>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">Adresse de Résidence Actuelle</h3>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <form.Field name="contacts.phoneAbroad">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>Téléphone (Résidence)</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="contacts.addressAbroad.country">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>Pays de résidence</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                 <form.Field name="contacts.addressAbroad.city">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>Ville</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                 </form.Field>
                                <form.Field name="contacts.addressAbroad.street">
                                  {(field) => (
                                    <Field className="md:col-span-2">
                                        <FieldLabel>Adresse</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
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
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="family.father.lastName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
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
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="family.mother.lastName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
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
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name="family.spouse.lastName">
                                  {(field) => (
                                    <Field>
                                        <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
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
                                <Label>Passeport (Pages principales)</Label>
                                <FileUploader 
                                    docType="passport" 
                                    onUploadComplete={(id) => handleUpload("passport", id)}
                                />
                                <DocumentList 
                                    docType="passport" 
                                    documentIds={profile.documents?.passport || []} 
                                    onRemove={(id) => handleRemoveDoc("passport", id)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Carte Nationale d'Identité</Label>
                                <FileUploader 
                                    docType="nationalId" 
                                    onUploadComplete={(id) => handleUpload("nationalId", id)}
                                />
                                <DocumentList 
                                    docType="nationalId" 
                                    documentIds={profile.documents?.nationalId || []} 
                                    onRemove={(id) => handleRemoveDoc("nationalId", id)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Acte de Naissance</Label>
                                <FileUploader 
                                    docType="birthCertificate" 
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
                                <Label>Titre de Séjour / Visa</Label>
                                <FileUploader 
                                    docType="residencePermit" 
                                    onUploadComplete={(id) => handleUpload("residencePermit", id)}
                                />
                                <DocumentList 
                                    docType="residencePermit" 
                                    documentIds={profile.documents?.residencePermit || []} 
                                    onRemove={(id) => handleRemoveDoc("residencePermit", id)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Justificatif de Domicile</Label>
                                <FileUploader 
                                    docType="proofOfAddress" 
                                    onUploadComplete={(id) => handleUpload("proofOfAddress", id)}
                                />
                                <DocumentList 
                                    docType="proofOfAddress" 
                                    documentIds={profile.documents?.proofOfAddress || []} 
                                    onRemove={(id) => handleRemoveDoc("proofOfAddress", id)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Photo d'identité</Label>
                                <FileUploader 
                                    docType="photo" 
                                    accept={{'image/*': ['.jpg','.jpeg','.png']}}
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
