import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { CountryCode } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, Flag, Globe } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useState } from "react"

export const Route = createFileRoute("/my-space/onboarding")({
  component: OnboardingPage,
})

function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutateAsync: createProfile } = useConvexMutationQuery(api.functions.profiles.upsert)

  const [nationality, setNationality] = useState<"national" | "foreigner" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
      if (!nationality) return
      setIsSubmitting(true)
      try {
          await createProfile({
              isNational: nationality === "national",
              identity: {
                  nationality: nationality === "national" ? CountryCode.GA : CountryCode.FR,
              }
          })
          toast.success(t("onboarding.success", "Profil créé avec succès!"))
          navigate({ to: "/my-space/profile" })
      } catch (e: unknown) {
          const error = e as Error
          toast.error(error.message || "Erreur lors de la création")
      } finally {
          setIsSubmitting(false)
      }
  }

  return (
    <div className="h-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in-95">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
            <Flag className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("onboarding.title", "Bienvenue!")}</CardTitle>
          <CardDescription className="text-base">
            {t("onboarding.subtitle", "Pour commencer, quelle est votre situation?")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <RadioGroup
            value={nationality}
            onValueChange={(v: string) => setNationality(v as "national" | "foreigner")}
            className="space-y-3"
          >
            <Label
              htmlFor="national"
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-secondary ${
                nationality === "national" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : ""
              }`}
            >
              <RadioGroupItem value="national" id="national" />
              <div className="flex-1">
                <div className="font-medium">{t("onboarding.national.title", "Je suis Gabonais(e)")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("onboarding.national.desc", "Accédez à l'immatriculation consulaire et aux services dédiés.")}
                </div>
              </div>
              <span className="text-2xl">🇬🇦</span>
            </Label>

            <Label
              htmlFor="foreigner"
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-secondary ${
                nationality === "foreigner" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : ""
              }`}
            >
              <RadioGroupItem value="foreigner" id="foreigner" />
              <div className="flex-1">
                <div className="font-medium">{t("onboarding.foreigner.title", "Je suis étranger")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("onboarding.foreigner.desc", "Effectuez vos demandes de visa et autres formalités.")}
                </div>
              </div>
              <Globe className="h-6 w-6 text-muted-foreground" />
            </Label>
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={!nationality || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {t("common.continue", "Continuer")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
