import { useState, useEffect } from "react";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  Upload,
  Loader2,
  User,
  MapPin,
  FileText,
  Target,
  Eye,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PublicUserType } from "@convex/lib/constants";

interface ForeignerRegistrationFormProps {
  initialVisaType?: PublicUserType;
  onComplete?: () => void;
}

export function ForeignerRegistrationForm({
  initialVisaType,
  onComplete,
}: ForeignerRegistrationFormProps) {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();

  // Step 0 = Account (SignUp), Steps 1-6 = Registration form
  const [step, setStep] = useState(isSignedIn ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [visaType, setVisaType] = useState<string>(initialVisaType || "");

  // Auto-advance from step 0 when user signs in
  useEffect(() => {
    if (isSignedIn && step === 0) {
      setStep(1);
    }
  }, [isSignedIn, step]);

  const steps = [
    {
      id: 0,
      label: t("register.steps.account", "Compte"),
      icon: UserPlus,
    },
    {
      id: 1,
      label: t("register.foreigner.steps.identity", "Identité"),
      icon: User,
    },
    {
      id: 2,
      label: t("register.foreigner.steps.contacts", "Coordonnées"),
      icon: MapPin,
    },
    {
      id: 3,
      label: t("register.foreigner.steps.passport", "Passeport"),
      icon: CreditCard,
    },
    {
      id: 4,
      label: t("register.foreigner.steps.purpose", "Motif"),
      icon: Target,
    },
    {
      id: 5,
      label: t("register.foreigner.steps.documents", "Documents"),
      icon: FileText,
    },
    {
      id: 6,
      label: t("register.foreigner.steps.validation", "Validation"),
      icon: Eye,
    },
  ];

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 500);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete?.();
    }, 1000);
  };

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("register.foreigner.title", "Inscription Usager Étranger")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "register.foreigner.subtitle",
            "Demandes de visa et services spécifiques",
          )}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-4">
        {steps.map((s, index) => (
          <div
            key={s.id}
            className="flex flex-col items-center min-w-[80px] relative z-10"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                step >= s.id ?
                  "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ?
                <CheckCircle2 className="h-6 w-6" />
              : <s.icon className="h-5 w-5" />}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${step === s.id ? "text-blue-600" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${step > s.id ? "bg-blue-600" : "bg-muted"}`}
                style={{ width: "100%" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Account Creation (Clerk SignUp) */}
      {step === 0 && !isSignedIn && (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <SignUp
              routing="hash"
              signInUrl="/sign-in"
              forceRedirectUrl={`/register?type=${initialVisaType || PublicUserType.VisaTourism}`}
              appearance={{
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "w-full shadow-xl border border-border/50 bg-card/95 backdrop-blur-xl",
                  formFieldInput: "text-base",
                  formButtonPrimary:
                    "text-base py-3 bg-blue-600 hover:bg-blue-700",
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Steps 1-6: Registration Form */}
      {step >= 1 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 &&
                t("register.foreigner.step1.title", "Identité & État Civil")}
              {step === 2 && t("register.foreigner.step2.title", "Coordonnées")}
              {step === 3 &&
                t("register.foreigner.step3.title", "Informations Passeport")}
              {step === 4 &&
                t("register.foreigner.step4.title", "Motif du Voyage")}
              {step === 5 &&
                t("register.foreigner.step5.title", "Documents Requis")}
              {step === 6 && t("register.foreigner.step6.title", "Validation")}
            </CardTitle>
            <CardDescription>
              {step === 1 &&
                t(
                  "register.foreigner.step1.description",
                  "Vos informations personnelles",
                )}
              {step === 2 &&
                t(
                  "register.foreigner.step2.description",
                  "Adresse et moyens de contact",
                )}
              {step === 3 &&
                t(
                  "register.foreigner.step3.description",
                  "Détails de votre document de voyage",
                )}
              {step === 4 &&
                t(
                  "register.foreigner.step4.description",
                  "Type de visa et raison du voyage",
                )}
              {step === 5 &&
                t(
                  "register.foreigner.step5.description",
                  "Pièces justificatives à fournir",
                )}
              {step === 6 &&
                t(
                  "register.foreigner.step6.description",
                  "Vérifiez et validez votre demande",
                )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.firstName", "Prénom(s)")} *</Label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.lastName", "Nom(s)")} *</Label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.nationality", "Nationalité")} *</Label>
                    <Input
                      placeholder={t(
                        "register.foreigner.nationalityPlaceholder",
                        "Ex: Française",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("common.birthDate", "Date de naissance")} *
                    </Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("common.profession", "Profession")}</Label>
                  <Input
                    placeholder={t(
                      "register.foreigner.professionPlaceholder",
                      "Ex: Ingénieur",
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contacts */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("common.email", "Email")} *</Label>
                  <Input type="email" placeholder="john.doe@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.phone", "Téléphone")} *</Label>
                  <Input placeholder="+33 6 12 34 56 78" />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.address", "Adresse")} *</Label>
                  <Input
                    placeholder={t(
                      "register.foreigner.addressPlaceholder",
                      "Adresse complète",
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.city", "Ville")} *</Label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.country", "Pays")} *</Label>
                    <Input />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Passport */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t(
                        "register.foreigner.passportNumber",
                        "Numéro de Passeport",
                      )}{" "}
                      *
                    </Label>
                    <Input placeholder="AB1234567" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t(
                        "register.foreigner.passportIssueDate",
                        "Date de Délivrance",
                      )}{" "}
                      *
                    </Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t(
                        "register.foreigner.passportExpiryDate",
                        "Date d'Expiration",
                      )}{" "}
                      *
                    </Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t(
                        "register.foreigner.passportIssuingCountry",
                        "Pays de Délivrance",
                      )}{" "}
                      *
                    </Label>
                    <Input />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Purpose / Visa Type */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {t("register.foreigner.visaType", "Type de Visa")} *
                  </Label>
                  <Select value={visaType} onValueChange={setVisaType}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("common.select", "Sélectionner")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PublicUserType.VisaTourism}>
                        {t("visaType.tourism", "Visa Tourisme (court séjour)")}
                      </SelectItem>
                      <SelectItem value={PublicUserType.VisaBusiness}>
                        {t("visaType.business", "Visa Affaires")}
                      </SelectItem>
                      <SelectItem value={PublicUserType.VisaLongStay}>
                        {t("visaType.longStay", "Visa Long Séjour")}
                      </SelectItem>
                      <SelectItem value={PublicUserType.AdminServices}>
                        {t(
                          "visaType.adminServices",
                          "Services Administratifs (légalisation, apostille)",
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("register.foreigner.travelDates", "Dates de Voyage")} *
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      placeholder={t(
                        "register.foreigner.arrivalDate",
                        "Date d'arrivée",
                      )}
                    />
                    <Input
                      type="date"
                      placeholder={t(
                        "register.foreigner.departureDate",
                        "Date de départ",
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("register.foreigner.travelPurpose", "Motif Détaillé")}
                  </Label>
                  <Input
                    placeholder={t(
                      "register.foreigner.travelPurposePlaceholder",
                      "Décrivez le motif de votre voyage",
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {step === 5 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: t("register.documents.photo", "Photo d'identité"),
                    format: "JPG, PNG - Max 2MB",
                  },
                  {
                    label: t(
                      "register.foreigner.passportCopy",
                      "Copie du Passeport",
                    ),
                    format: "PDF, JPG - Max 5MB",
                  },
                  {
                    label: t(
                      "register.foreigner.flightTicket",
                      "Billet d'Avion",
                    ),
                    format: "PDF - Max 5MB",
                  },
                  {
                    label: t(
                      "register.foreigner.hotelReservation",
                      "Réservation Hôtel",
                    ),
                    format: "PDF - Max 5MB",
                  },
                  {
                    label: t(
                      "register.foreigner.invitationLetter",
                      "Lettre d'Invitation",
                    ),
                    format: t("common.ifApplicable", "Si applicable"),
                  },
                  {
                    label: t(
                      "register.foreigner.proofOfFunds",
                      "Justificatif de Ressources",
                    ),
                    format: "PDF - Max 5MB",
                  },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.format}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Step 6: Validation */}
            {step === 6 && (
              <div className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertTitle>
                    {t("register.foreigner.readyToSubmit", "Demande prête")}
                  </AlertTitle>
                  <AlertDescription>
                    {t(
                      "register.foreigner.submissionNote",
                      "Votre demande sera examinée par le service consulaire. Vous recevrez une notification par email concernant l'état de votre dossier.",
                    )}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none"
                    >
                      {t(
                        "register.foreigner.certifyInfo",
                        "Je certifie l'exactitude des informations fournies",
                      )}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="privacy" />
                    <label
                      htmlFor="privacy"
                      className="text-sm font-medium leading-none"
                    >
                      {t(
                        "register.foreigner.acceptPrivacy",
                        "J'accepte la politique de confidentialité",
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  {t("common.previous", "Précédent")}
                </Button>
              )}
              <div className="ml-auto">
                {step < 6 ?
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("common.next", "Suivant")}
                  </Button>
                : <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("register.foreigner.submit", "Soumettre la demande")}
                  </Button>
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
