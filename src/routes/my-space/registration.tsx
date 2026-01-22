import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery, useConvexQuery, useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Clock, MapPin, Building2, AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"

export const Route = createFileRoute("/my-space/registration")({
  component: RegistrationPage,
})

function RegistrationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const { data: profile, isPending: profilePending } = useAuthenticatedConvexQuery(api.functions.profiles.getMine, {})
  const { data: orgs, isPending: orgsPending } = useConvexQuery(api.functions.orgs.list, {})
  
  const { mutateAsync: requestRegistration } = useConvexMutationQuery(api.functions.profiles.requestRegistration)

  const [selectedOrgId, setSelectedOrgId] = useState<string>("")

  if (profilePending || orgsPending) {
      return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
  }

  if (!profile) return <div>{t("profile.notFound")}</div>


  if (!profile.isNational) {
      return (
          <div className="p-4">
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Accès Restreint</AlertTitle>
                  <AlertDescription>
                      Cette page est réservée aux ressortissants nationaux.
                  </AlertDescription>
              </Alert>
              <Button variant="link" onClick={() => navigate({ to: "/my-space" })} className="mt-4">
                  {t("registration.backToDashboard", "Retour au tableau de bord")}
              </Button>
          </div>
      )
  }

  // Vérifier si les documents requis sont présents
  const requiredDocs = {
      passport: profile.documents?.passport,
      nationalId: profile.documents?.nationalId,
      photo: profile.documents?.photo
  }
  
  const missingDocs = []
  if (!requiredDocs.passport || requiredDocs.passport.length === 0) missingDocs.push(t("profile.documents.passport", "Passeport"))
  if (!requiredDocs.nationalId || requiredDocs.nationalId.length === 0) missingDocs.push(t("profile.documents.nationalId", "Carte Nationale d'Identité"))
  if (!requiredDocs.photo || requiredDocs.photo.length === 0) missingDocs.push(t("profile.documents.photo", "Photo d'identité"))

  if (missingDocs.length > 0) {
      return (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in pb-20">
              <div>
                  <h1 className="text-2xl font-bold">{t("registration.requestTitle", "Demande d'Immatriculation")}</h1>
              </div>
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("registration.missingDocs.title", "Dossier incomplet")}</AlertTitle>
                  <AlertDescription>
                      <p className="mb-2">{t("registration.missingDocs.description", "Veuillez ajouter les documents suivants dans votre profil avant de faire votre demande :")}</p>
                      <ul className="list-disc ml-4 space-y-1">
                          {missingDocs.map(doc => <li key={doc}>{doc}</li>)}
                      </ul>
                  </AlertDescription>
              </Alert>
              <Button onClick={() => navigate({ to: "/my-space/profile" })} className="w-full">
                  {t("registration.completeProfile", "Compléter mon profil")}
              </Button>
          </div>
      )
  }


  const existingRegistration = (profile.registrations?.length ?? 0) > 0 ? profile.registrations![0] : null
  const registeredOrg = existingRegistration ? orgs?.find((o: { _id: Id<"orgs"> }) => o._id === existingRegistration.orgId) : null

  const handleRegister = async () => {
      if (!selectedOrgId) return
      try {
          await requestRegistration({ orgId: selectedOrgId as Id<"orgs"> })
          toast.success(t("registration.success", "Demande envoyée avec succès"))
      } catch (e: unknown) {
          const error = e as Error
          toast.error(error.message || "Erreur lors de l'envoi")
      }
  }


  const consulates = orgs?.filter((o: { type: string }) => 
      ['embassy', 'consulate', 'general_consulate'].includes(o.type)
  ) || []

  if (existingRegistration) {
      return (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
              <h1 className="text-2xl font-bold">{t("registration.title", "Immatriculation Consulaire")}</h1>
              
              <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          {existingRegistration.status === 'active' ? (
                              <CheckCircle2 className="text-green-600" />
                          ) : (
                              <Clock className="text-amber-600" />
                          )}
                          {registeredOrg?.name || t("registration.status.fallbackOrg", "Consulat")}
                      </CardTitle>
                      <CardDescription>
                          {existingRegistration.status === 'active' 
                             ? t("registration.status.active", "Vous êtes immatriculé auprès de cet organisme.")
                             : t("registration.status.pending", "Votre demande est en cours de traitement.")}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("registration.status.dateRequested", "Date de demande:")}</span>
                              <span>{new Date(existingRegistration.registeredAt).toLocaleDateString()}</span>
                          </div>
                          {existingRegistration.registrationNumber && (
                              <div className="flex justify-between font-medium">
                                  <span className="text-muted-foreground">{t("registration.status.number", "Numéro:")}</span>
                                  <span>{existingRegistration.registrationNumber}</span>
                              </div>
                          )}
                      </div>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold">{t("registration.requestTitle", "Demande d'Immatriculation")}</h1>
        <p className="text-muted-foreground">
            {t("registration.desc", "Sélectionnez le consulat ou l'ambassade de votre juridiction pour vous faire recenser.")}
        </p>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>{t("registration.selectOrg", "Choix de l'organisme")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t("registration.labels.consulateOrEmbassy", "Consulat / Ambassade")}
                  </label>
                  <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                      <SelectTrigger>
                          <SelectValue placeholder={t("registration.labels.selectPlaceholder", "Sélectionner...")} />
                      </SelectTrigger>
                      <SelectContent>
                          {consulates.map((org: { _id: string; name: string; address: { city: string; country: string } }) => (
                              <SelectItem key={org._id} value={org._id}>
                                  <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 opacity-50" />
                                      <span>{org.name}</span>
                                      <span className="text-xs text-muted-foreground">({org.address.city}, {org.address.country})</span>
                                  </div>
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>

              {selectedOrgId && (
                  <Alert>
                      <MapPin className="h-4 w-4" />
                      <AlertTitle>{t("registration.jurisdiction.title", "Juridiction")}</AlertTitle>
                      <AlertDescription>
                          {t("registration.jurisdiction.description", "Assurez-vous de résider dans la juridiction de cet organisme. Une preuve de résidence vous sera demandée.")}
                      </AlertDescription>
                  </Alert>
              )}
          </CardContent>
          <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleRegister} 
                disabled={!selectedOrgId}
              >
                  {t("registration.submit", "Envoyer la demande")}
              </Button>
          </CardFooter>
      </Card>
    </div>
  )
}
