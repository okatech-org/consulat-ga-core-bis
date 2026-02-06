import { useState } from "react";
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
  FileText,
  User,
  Users,
  MapPin,
  Briefcase,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PublicUserType } from "@convex/lib/constants";

interface CitizenRegistrationFormProps {
  userType: PublicUserType.LongStay | PublicUserType.ShortStay;
  onComplete?: () => void;
}

export function CitizenRegistrationForm({
  userType,
  onComplete,
}: CitizenRegistrationFormProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const isLongStay = userType === PublicUserType.LongStay;

  const steps = [
    {
      id: 1,
      label: t("register.steps.documents", "Documents"),
      icon: FileText,
    },
    { id: 2, label: t("register.steps.identity", "Identité"), icon: User },
    { id: 3, label: t("register.steps.family", "Famille"), icon: Users },
    { id: 4, label: t("register.steps.contacts", "Contacts"), icon: MapPin },
    {
      id: 5,
      label: t("register.steps.profession", "Profession"),
      icon: Briefcase,
    },
    { id: 6, label: t("register.steps.review", "Révision"), icon: Eye },
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isLongStay ?
            t("register.citizen.titleLongStay", "Inscription Résident")
          : t("register.citizen.titleShortStay", "Déclaration de Passage")}
        </h1>
        <p className="text-muted-foreground">
          {isLongStay ?
            t(
              "register.citizen.subtitleLongStay",
              "Accédez à l'ensemble des services consulaires",
            )
          : t(
              "register.citizen.subtitleShortStay",
              "Signalez votre présence pour bénéficier de l'assistance consulaire",
            )
          }
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
                  "bg-primary text-white"
                : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ?
                <CheckCircle2 className="h-6 w-6" />
              : <s.icon className="h-5 w-5" />}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${step === s.id ? "text-primary" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${step > s.id ? "bg-primary" : "bg-muted"}`}
                style={{ width: "100%" }}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 &&
              t("register.citizen.step1.title", "Documents Requis")}
            {step === 2 &&
              t("register.citizen.step2.title", "Informations de Base")}
            {step === 3 &&
              t("register.citizen.step3.title", "Situation Familiale")}
            {step === 4 && t("register.citizen.step4.title", "Coordonnées")}
            {step === 5 &&
              t("register.citizen.step5.title", "Situation Professionnelle")}
            {step === 6 &&
              t("register.citizen.step6.title", "Révision et Soumission")}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              t(
                "register.citizen.step1.description",
                "Téléchargez les pièces justificatives obligatoires",
              )}
            {step === 2 &&
              t("register.citizen.step2.description", "Identité et naissance")}
            {step === 3 &&
              t(
                "register.citizen.step3.description",
                "Parents et situation matrimoniale",
              )}
            {step === 4 &&
              t(
                "register.citizen.step4.description",
                "Adresse et contacts d'urgence",
              )}
            {step === 5 &&
              t("register.citizen.step5.description", "Emploi et activité")}
            {step === 6 &&
              t(
                "register.citizen.step6.description",
                "Vérifiez l'exactitude de vos informations",
              )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Documents */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: t("register.documents.photo", "Photo d'identité"),
                  format: "JPG, PNG - Max 2MB",
                },
                {
                  label: t("register.documents.passport", "Passeport"),
                  format: "PDF, JPG - Max 5MB",
                },
                {
                  label: t(
                    "register.documents.birthCertificate",
                    "Acte de Naissance",
                  ),
                  format: "PDF, JPG - Max 5MB",
                },
                {
                  label: t(
                    "register.documents.proofOfAddress",
                    "Justificatif de Domicile",
                  ),
                  format: t(
                    "register.documents.lessThan3Months",
                    "Moins de 3 mois",
                  ),
                },
              ].map((doc) => (
                <div
                  key={doc.label}
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{doc.label} *</p>
                  <p className="text-xs text-muted-foreground">{doc.format}</p>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Identity */}
          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.firstName", "Prénom(s)")} *</Label>
                  <Input placeholder="Jean" />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.lastName", "Nom(s)")} *</Label>
                  <Input placeholder="Mba" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.birthDate", "Date de naissance")} *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.birthPlace", "Lieu de naissance")} *</Label>
                  <Input placeholder="Libreville" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Family */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t(
                    "register.citizen.maritalStatus",
                    "Situation Matrimoniale",
                  )}{" "}
                  *
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("common.select", "Sélectionner")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">
                      {t("maritalStatus.single", "Célibataire")}
                    </SelectItem>
                    <SelectItem value="MARRIED">
                      {t("maritalStatus.married", "Marié(e)")}
                    </SelectItem>
                    <SelectItem value="DIVORCED">
                      {t("maritalStatus.divorced", "Divorcé(e)")}
                    </SelectItem>
                    <SelectItem value="WIDOWED">
                      {t("maritalStatus.widowed", "Veuf/Veuve")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-medium text-sm">
                  {t("register.citizen.filiation", "Filiation")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t("register.citizen.fatherName", "Nom du Père")}
                    </Label>
                    <Input placeholder={t("common.fullName", "Nom complet")} />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("register.citizen.motherName", "Nom de la Mère")}
                    </Label>
                    <Input placeholder={t("common.fullName", "Nom complet")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contacts */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("common.address", "Adresse Complète")} *</Label>
                <Input
                  placeholder={t(
                    "register.citizen.addressPlaceholder",
                    "Numéro, Rue, Apt",
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.city", "Ville")} *</Label>
                  <Input />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.postalCode", "Code Postal")} *</Label>
                  <Input />
                </div>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg space-y-4 border border-red-100 dark:border-red-900">
                <h3 className="font-medium text-sm text-red-800 dark:text-red-200">
                  {t("register.citizen.emergencyContact", "Contact d'Urgence")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.fullName", "Nom Complet")}</Label>
                    <Input
                      placeholder={t(
                        "register.citizen.personToContact",
                        "Personne à contacter",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.phone", "Téléphone")}</Label>
                    <Input placeholder="+33..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Profession */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t(
                    "register.citizen.professionalStatus",
                    "Statut Professionnel",
                  )}
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("common.select", "Sélectionner")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYED">
                      {t("professionStatus.employed", "Salarié")}
                    </SelectItem>
                    <SelectItem value="SELF_EMPLOYED">
                      {t("professionStatus.selfEmployed", "Indépendant")}
                    </SelectItem>
                    <SelectItem value="STUDENT">
                      {t("professionStatus.student", "Étudiant")}
                    </SelectItem>
                    <SelectItem value="RETIRED">
                      {t("professionStatus.retired", "Retraité")}
                    </SelectItem>
                    <SelectItem value="UNEMPLOYED">
                      {t("professionStatus.unemployed", "Sans emploi")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {t("register.citizen.employer", "Employeur / Établissement")}
                </Label>
                <Input
                  placeholder={t(
                    "register.citizen.employerPlaceholder",
                    "Nom de l'entreprise ou école",
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t("register.citizen.jobTitle", "Profession / Poste")}
                </Label>
                <Input
                  placeholder={t(
                    "register.citizen.jobTitlePlaceholder",
                    "Intitulé du poste",
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle>
                  {t("register.citizen.readyToSubmit", "Prêt à soumettre")}
                </AlertTitle>
                <AlertDescription>
                  {t(
                    "register.citizen.submissionNote",
                    "Votre dossier sera transmis au service consulaire pour validation. Vous recevrez une notification dès que votre statut changera.",
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t(
                      "register.citizen.certify",
                      "Je certifie sur l'honneur l'exactitude des informations fournies",
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
                <Button onClick={handleNext} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.next", "Suivant")}
                </Button>
              : <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("register.citizen.submit", "Soumettre le dossier")}
                </Button>
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
