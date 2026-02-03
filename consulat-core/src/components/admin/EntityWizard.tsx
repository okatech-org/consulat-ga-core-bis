import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { COUNTRY_FLAGS } from "@/types/entity";
import { SERVICE_CATALOG, ServiceType } from "@/types/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Building2, MapPin, User } from "lucide-react";
import { toast } from "sonner";

const entitySchema = z.object({
  type: z.enum(["AMBASSADE", "CONSULAT"], { required_error: "Le type est requis" }),
  country: z.string().min(2, "Le pays est requis").max(100, "Maximum 100 caractères"),
  countryCode: z.string().length(2, "Code pays ISO requis (2 caractères)").toUpperCase(),
  city: z.string().min(2, "La ville est requise").max(100, "Maximum 100 caractères"),
  name: z.string().min(10, "Le nom complet est requis").max(200, "Maximum 200 caractères"),
  enabledServices: z.array(z.string()).min(1, "Au moins un service doit être activé"),
  managerName: z.string().min(3, "Le nom du manager est requis").max(100, "Maximum 100 caractères"),
  managerEmail: z.string().email("Email invalide").max(255, "Maximum 255 caractères"),
});

type EntityFormData = z.infer<typeof entitySchema>;

interface EntityWizardProps {
  onComplete: (data: EntityFormData) => void;
  onCancel: () => void;
}

const COUNTRIES = [
  { code: "US", name: "États-Unis" },
  { code: "FR", name: "France" },
  { code: "CN", name: "Chine" },
  { code: "SN", name: "Sénégal" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "DE", name: "Allemagne" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
  { code: "BR", name: "Brésil" },
  { code: "MA", name: "Maroc" },
];

export function EntityWizard({ onComplete, onCancel }: EntityWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EntityFormData>>({
    enabledServices: Object.keys(SERVICE_CATALOG),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: formData,
  });

  const watchedType = watch("type");
  const watchedCountry = watch("country");
  const watchedCity = watch("city");
  const watchedServices = watch("enabledServices") || Object.keys(SERVICE_CATALOG);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!watchedType || !watchedCountry || !watchedCity) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleService = (serviceId: string) => {
    const current = watchedServices || [];
    const updated = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    setValue("enabledServices", updated);
  };

  const onSubmit = (data: EntityFormData) => {
    toast.success("Entité créée avec succès !");
    onComplete(data);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Étape {currentStep} sur {totalSteps}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Identité */}
        {currentStep === 1 && (
          <Card className="animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Identité de l'Entité</CardTitle>
                  <CardDescription>
                    Définissez le type, la localisation et le nom de la représentation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type d'entité *</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value) => setValue("type", value as "AMBASSADE" | "CONSULAT")}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMBASSADE">🏛️ Ambassade</SelectItem>
                    <SelectItem value="CONSULAT">🏢 Consulat</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              {/* Pays */}
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Select
                  value={watchedCountry}
                  onValueChange={(value) => {
                    const country = COUNTRIES.find((c) => c.name === value);
                    setValue("country", value);
                    if (country) setValue("countryCode", country.code);
                  }}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Sélectionnez le pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        <span className="flex items-center gap-2">
                          <span>{COUNTRY_FLAGS[country.code]}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="ex: Paris, Washington D.C."
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              {/* Nom complet */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  placeholder="ex: Ambassade du Gabon aux États-Unis"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Le nom apparaîtra sur tous les documents officiels
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <Card className="animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Catalogue de Services</CardTitle>
                  <CardDescription>
                    Activez ou désactivez les services disponibles dans cette {watchedType?.toLowerCase()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(SERVICE_CATALOG).map(([serviceId, service]) => {
                  const Icon = service.icon;
                  const isEnabled = watchedServices.includes(serviceId);
                  return (
                    <div
                      key={serviceId}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isEnabled
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            isEnabled ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isEnabled ? service.color : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${!isEnabled && "text-muted-foreground"}`}>
                            {service.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleService(serviceId)}
                      />
                    </div>
                  );
                })}
              </div>
              {errors.enabledServices && (
                <p className="text-sm text-destructive">{errors.enabledServices.message}</p>
              )}
              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <p className="text-sm font-medium">
                  Services activés : {watchedServices.length} / {Object.keys(SERVICE_CATALOG).length}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Manager */}
        {currentStep === 3 && (
          <Card className="animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Administrateur Local</CardTitle>
                  <CardDescription>
                    Créez le compte Manager pour superviser cette entité
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold">Résumé de l'entité</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium">{watchedType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Localisation:</span>{" "}
                    <span className="font-medium">{watchedCity}, {watchedCountry}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Services:</span>{" "}
                    <span className="font-medium">{watchedServices.length} activés</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerName">Nom complet du Manager *</Label>
                <Input
                  id="managerName"
                  placeholder="ex: Jean Dupont"
                  {...register("managerName")}
                />
                {errors.managerName && (
                  <p className="text-sm text-destructive">{errors.managerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerEmail">Email du Manager *</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  placeholder="ex: manager@consulat.ga"
                  {...register("managerEmail")}
                />
                {errors.managerEmail && (
                  <p className="text-sm text-destructive">{errors.managerEmail.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Un email de configuration sera envoyé à cette adresse
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Annuler
            </Button>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            )}
          </div>

          {currentStep < totalSteps ? (
            <Button type="button" onClick={handleNext}>
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="gap-2">
              <Check className="h-4 w-4" />
              Créer l'Entité
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
