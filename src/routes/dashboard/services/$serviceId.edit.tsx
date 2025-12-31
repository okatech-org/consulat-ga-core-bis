import { createFileRoute, useNavigate } from "@tanstack/react-router"
// import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useOrg } from "@/components/org/org-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"

export const Route = createFileRoute("/dashboard/services/$serviceId/edit")({
  component: ServiceEdit,
})

function ServiceEdit() {
  const { serviceId } = Route.useParams()
  const { activeOrgId } = useOrg()
  const navigate = useNavigate()
  // const { t } = useTranslation() // Unused for now

  // Queries
  const data = useQuery(
    api.orgServices.get,
    activeOrgId ? { orgId: activeOrgId, serviceId: serviceId as Id<"commonServices"> } : "skip"
  )

  // Mutations
  const updateConfig = useMutation(api.orgServices.updateConfig)

  // Form State
  const [formData, setFormData] = useState({
    isActive: false,
    fee: 0,
    currency: "XAF",
    estimatedDays: 0,
    customDescription: "",
    instructions: "",
    requiresAppointment: false,
  })

  // Load data into form
  useEffect(() => {
    if (data) {
      setFormData({
        isActive: data.orgService?.isActive ?? false,
        fee: data.orgService?.fee ?? 0,
        currency: data.orgService?.currency ?? "XAF",
        estimatedDays: data.orgService?.estimatedDays ?? 0,
        customDescription: data.orgService?.customDescription ?? "",
        instructions: data.orgService?.instructions ?? "",
        requiresAppointment: data.orgService?.requiresAppointment ?? false,
      })
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrgId) return

    try {
      await updateConfig({
        orgId: activeOrgId,
        serviceId: serviceId as Id<"commonServices">,
        isActive: formData.isActive,
        fee: formData.fee,
        currency: formData.currency,
        estimatedDays: formData.estimatedDays,
        customDescription: formData.customDescription || undefined,
        instructions: formData.instructions || undefined,
        requiresAppointment: formData.requiresAppointment,
        // TODO: Handle customDocuments
      })
      toast.success("Configuration enregistrée")
      navigate({ to: "/dashboard/services" })
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  if (!data) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  const { commonService } = data

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/dashboard/services" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurer: {commonService.name}</h1>
          <p className="text-muted-foreground">
            {commonService.description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du Service</CardTitle>
            <CardDescription>
              Définissez les modalités spécifiques à votre consulat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Activation Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Statut du Service</Label>
                <div className="text-sm text-muted-foreground">
                  Rendre ce service disponible pour les usagers
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(c: boolean) => setFormData(p => ({ ...p, isActive: c }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Fee and Currency */}
              <div className="space-y-2">
                <Label>Frais Consulaires</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData.fee}
                    onChange={(e) => setFormData(p => ({ ...p, fee: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">XAF</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estimated Delay */}
              <div className="space-y-2">
                <Label>Délai estimé (jours)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData(p => ({ ...p, estimatedDays: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Appointment Requirement */}
             <div className="flex items-center gap-2">
              <Switch
                id="requiresAppointment"
                checked={formData.requiresAppointment}
                onCheckedChange={(c: boolean) => setFormData(p => ({ ...p, requiresAppointment: c }))}
              />
               <Label htmlFor="requiresAppointment">Nécessite un rendez-vous</Label>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label>Instructions Spécifiques</Label>
              <Textarea
                placeholder="Instructions particulières pour les usagers de votre juridiction..."
                value={formData.instructions}
                onChange={(e) => setFormData(p => ({ ...p, instructions: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            {/* Custom Description (Override) */}
             <div className="space-y-2">
              <Label>Description Personnalisée (Optionnel)</Label>
              <Textarea
                placeholder="Si rempli, remplace la description globale..."
                value={formData.customDescription}
                onChange={(e) => setFormData(p => ({ ...p, customDescription: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => navigate({ to: "/dashboard/services" })}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
