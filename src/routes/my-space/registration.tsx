import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Home,
  Info,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getRegistrationConfig } from "@/lib/registrationConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAuthenticatedConvexQuery,
  useConvexMutationQuery,
  useConvexQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/my-space/registration")({
  component: RegistrationPage,
});

type Step =
  | "select-org"
  | "check-service"
  | "check-profile"
  | "check-documents"
  | "submit";

function RegistrationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: profile, isPending: profilePending } =
    useAuthenticatedConvexQuery(api.functions.profiles.getMine, {});

  // Dynamic config based on user type
  const regConfig = useMemo(
    () => getRegistrationConfig(profile?.userType ?? "long_stay"),
    [profile?.userType],
  );
  const REQUIRED_PROFILE_FIELDS = regConfig.requiredProfileFields;
  const REQUIRED_DOCUMENTS = regConfig.requiredProfileDocuments;

  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<Step>("select-org");

  const { mutateAsync: requestRegistration, isPending: submitting } =
    useConvexMutationQuery(api.functions.profiles.requestRegistration);

  // Get user's residence country from profile (countryOfResidence priority, then fallback to address)
  const residenceCountry =
    profile?.countryOfResidence || profile?.addresses?.residence?.country;

  // Query orgs by jurisdiction (only if user has residence country)
  const { data: jurisdictionOrgs, isPending: orgsPending } = useConvexQuery(
    api.functions.orgs.listByJurisdiction,
    residenceCountry ? { residenceCountry } : "skip",
  );

  // Query all orgs for fallback
  const { data: allOrgs } = useConvexQuery(api.functions.orgs.list, {});

  // Query existing consular registrations
  const { data: registrations } = useAuthenticatedConvexQuery(
    api.functions.consularRegistrations.listByProfile,
    {},
  );

  // Query registration service availability for selected org
  const { data: registrationService, isPending: servicePending } =
    useConvexQuery(
      api.functions.services.getRegistrationServiceForOrg,
      selectedOrgId ? { orgId: selectedOrgId as Id<"orgs"> } : "skip",
    );

  // Calculate missing profile fields
  const missingFields = useMemo(() => {
    if (!profile) return [];
    const missing: string[] = [];

    // Check identity fields
    if (
      REQUIRED_PROFILE_FIELDS.identity.firstName &&
      !profile.identity?.firstName
    ) {
      missing.push(t("profile.identity.firstName", "Prénom"));
    }
    if (
      REQUIRED_PROFILE_FIELDS.identity.lastName &&
      !profile.identity?.lastName
    ) {
      missing.push(t("profile.identity.lastName", "Nom"));
    }
    if (
      REQUIRED_PROFILE_FIELDS.identity.birthDate &&
      !profile.identity?.birthDate
    ) {
      missing.push(t("profile.identity.birthDate", "Date de naissance"));
    }
    if (
      REQUIRED_PROFILE_FIELDS.identity.birthPlace &&
      !profile.identity?.birthPlace
    ) {
      missing.push(t("profile.identity.birthPlace", "Lieu de naissance"));
    }

    // Check address
    if (
      REQUIRED_PROFILE_FIELDS.addresses.residence &&
      !profile.addresses?.residence
    ) {
      missing.push(t("profile.addresses.residence", "Adresse de résidence"));
    }

    // Check contacts
    if (REQUIRED_PROFILE_FIELDS.contacts.phone && !profile.contacts?.phone) {
      missing.push(t("profile.contacts.phone", "Téléphone"));
    }
    if (REQUIRED_PROFILE_FIELDS.contacts.email && !profile.contacts?.email) {
      missing.push(t("profile.contacts.email", "Email"));
    }

    return missing;
  }, [profile, t]);

  // Calculate missing required documents for registration
  // Check directly against profile.documents typed object
  const missingDocuments = useMemo(() => {
    if (!profile?.documents) return REQUIRED_DOCUMENTS;

    const profileDocs = profile.documents;
    return REQUIRED_DOCUMENTS.filter((required) => !profileDocs[required.key]);
  }, [profile?.documents]);

  const isProfileComplete = missingFields.length === 0;
  const areDocumentsComplete = missingDocuments.length === 0;

  if (profilePending) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return <div>{t("profile.notFound")}</div>;

  // Check if user is a national
  if (!profile.isNational) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {t("registration.accessRestricted", "Accès Restreint")}
          </AlertTitle>
          <AlertDescription>
            {t(
              "registration.nationalsOnly",
              "Cette page est réservée aux ressortissants nationaux.",
            )}
          </AlertDescription>
        </Alert>
        <Button
          variant="link"
          onClick={() => navigate({ to: "/my-space" })}
          className="mt-4"
        >
          {t("registration.backToDashboard", "Retour au tableau de bord")}
        </Button>
      </div>
    );
  }

  // Check for existing registration
  const existingRegistration =
    registrations && registrations.length > 0 ? registrations[0] : null;
  const registeredOrg =
    existingRegistration ?
      allOrgs?.find(
        (o: { _id: Id<"orgs"> }) => o._id === existingRegistration.orgId,
      )
    : null;

  if (existingRegistration) {
    return (
      <div className="max-w-xl mx-auto space-y-6 p-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-2xl font-bold">
            {t("registration.title", "Immatriculation Consulaire")}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {existingRegistration.status === "active" ?
                  <CheckCircle2 className="text-green-600" />
                : <Clock className="text-amber-600" />}
                {registeredOrg?.name ||
                  t("registration.status.fallbackOrg", "Consulat")}
              </CardTitle>
              <CardDescription>
                {existingRegistration.status === "active" ?
                  t(
                    "registration.status.active",
                    "Vous êtes immatriculé auprès de cet organisme.",
                  )
                : t(
                    "registration.status.pending",
                    "Votre demande est en cours de traitement.",
                  )
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("registration.status.dateRequested", "Date de demande:")}
                  </span>
                  <span>
                    {new Date(
                      existingRegistration.registeredAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
                {existingRegistration.cardNumber && (
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">
                      {t("registration.status.number", "Numéro:")}
                    </span>
                    <span>{existingRegistration.cardNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const selectedOrg = jurisdictionOrgs?.find(
    (o: { _id: string }) => o._id === selectedOrgId,
  );

  const handleNext = () => {
    if (currentStep === "select-org" && selectedOrgId) {
      setCurrentStep("check-service");
    } else if (currentStep === "check-service") {
      if (registrationService) {
        if (isProfileComplete) {
          // Profile complete, check documents
          if (areDocumentsComplete) {
            setCurrentStep("submit");
          } else {
            setCurrentStep("check-documents");
          }
        } else {
          setCurrentStep("check-profile");
        }
      }
    } else if (currentStep === "check-profile" && isProfileComplete) {
      // After completing profile, check documents
      if (areDocumentsComplete) {
        setCurrentStep("submit");
      } else {
        setCurrentStep("check-documents");
      }
    } else if (currentStep === "check-documents" && areDocumentsComplete) {
      setCurrentStep("submit");
    }
  };

  const handleBack = () => {
    if (currentStep === "check-service") {
      setCurrentStep("select-org");
    } else if (currentStep === "check-profile") {
      setCurrentStep("check-service");
    } else if (currentStep === "check-documents") {
      setCurrentStep(isProfileComplete ? "check-service" : "check-profile");
    } else if (currentStep === "submit") {
      setCurrentStep(
        areDocumentsComplete ?
          isProfileComplete ? "check-service"
          : "check-profile"
        : "check-documents",
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrgId) return;
    try {
      await requestRegistration({ orgId: selectedOrgId as Id<"orgs"> });
      toast.success(t("registration.success", "Demande envoyée avec succès"));
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(
        error.message || t("registration.error", "Erreur lors de l'envoi"),
      );
    }
  };

  const steps = [
    {
      id: "select-org",
      label: t("registration.steps.selectOrg", "Organismes"),
    },
    {
      id: "check-service",
      label: t("registration.steps.checkService", "Disponibilité"),
    },
    {
      id: "check-profile",
      label: t("registration.steps.checkProfile", "Profil"),
    },
    { id: "submit", label: t("registration.steps.submit", "Envoi") },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div>
          <h1 className="text-2xl font-bold">
            {t("registration.requestTitle", "Demande d'Immatriculation")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "registration.desc",
              "Sélectionnez le consulat ou l'ambassade de votre juridiction pour vous faire recenser.",
            )}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStepIndex ?
                    "bg-primary text-primary-foreground"
                  : index === currentStepIndex ?
                    "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ?
                  <CheckCircle2 className="h-4 w-4" />
                : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {/* Step 1: Select Organization */}
        {currentStep === "select-org" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("registration.selectOrg", "Choix de l'organisme")}
              </CardTitle>
              <CardDescription>
                {residenceCountry ?
                  t(
                    "registration.selectOrgDesc",
                    "Organismes disponibles pour votre pays de résidence",
                  )
                : t(
                    "registration.noResidenceCountry",
                    "Veuillez d'abord renseigner votre pays de résidence dans votre profil.",
                  )
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!residenceCountry ?
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>
                    {t(
                      "registration.missingResidence.title",
                      "Pays de résidence requis",
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {t(
                      "registration.missingResidence.description",
                      "Pour afficher les consulats disponibles, vous devez renseigner votre adresse de résidence dans votre profil.",
                    )}
                  </AlertDescription>
                </Alert>
              : orgsPending ?
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              : !jurisdictionOrgs || jurisdictionOrgs.length === 0 ?
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {t(
                      "registration.noOrgs.title",
                      "Aucun organisme disponible",
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {t(
                      "registration.noOrgs.description",
                      "Il n'y a pas d'organisme consulaire couvrant votre pays de résidence pour le moment. Veuillez contacter le ministère des affaires étrangères pour plus d'informations.",
                    )}
                  </AlertDescription>
                </Alert>
              : <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t(
                      "registration.labels.consulateOrEmbassy",
                      "Consulat / Ambassade",
                    )}
                  </label>
                  <Select
                    value={selectedOrgId}
                    onValueChange={setSelectedOrgId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "registration.labels.selectPlaceholder",
                          "Sélectionner...",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictionOrgs.map(
                        (org: {
                          _id: string;
                          name: string;
                          type: string;
                          address: { city: string; country: string };
                        }) => (
                          <SelectItem key={org._id} value={org._id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 opacity-50" />
                              <span>{org.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {org.type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              }
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/my-space" })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Retour")}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedOrgId || !residenceCountry}
              >
                {t("common.next", "Suivant")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Check Service Availability */}
        {currentStep === "check-service" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t(
                  "registration.serviceAvailability",
                  "Disponibilité du service",
                )}
              </CardTitle>
              <CardDescription>{selectedOrg?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {servicePending ?
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              : registrationService ?
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700 dark:text-green-400">
                    {t(
                      "registration.serviceAvailable.title",
                      "Service disponible en ligne",
                    )}
                  </AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    {t(
                      "registration.serviceAvailable.description",
                      "Vous pouvez faire votre demande d'immatriculation en ligne. Votre dossier sera traité par l'organisme sélectionné.",
                    )}
                  </AlertDescription>
                </Alert>
              : <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {t(
                        "registration.serviceUnavailable.title",
                        "Service non disponible en ligne",
                      )}
                    </AlertTitle>
                    <AlertDescription>
                      {t(
                        "registration.serviceUnavailable.description",
                        "Cet organisme ne propose pas l'immatriculation en ligne. Veuillez vous rendre sur place ou prendre rendez-vous.",
                      )}
                    </AlertDescription>
                  </Alert>

                  {selectedOrg && (
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {selectedOrg.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {selectedOrg.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span>
                              {selectedOrg.address.street},{" "}
                              {selectedOrg.address.postalCode}{" "}
                              {selectedOrg.address.city}
                            </span>
                          </div>
                        )}
                        {selectedOrg.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`tel:${selectedOrg.phone}`}
                              className="text-primary hover:underline"
                            >
                              {selectedOrg.phone}
                            </a>
                          </div>
                        )}
                        {selectedOrg.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`mailto:${selectedOrg.email}`}
                              className="text-primary hover:underline"
                            >
                              {selectedOrg.email}
                            </a>
                          </div>
                        )}
                        {selectedOrg.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={selectedOrg.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {selectedOrg.website}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              }
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Retour")}
              </Button>
              {registrationService && (
                <Button onClick={handleNext}>
                  {t("common.next", "Suivant")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Check Profile Completion */}
        {currentStep === "check-profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("registration.profileCheck", "Vérification du profil")}
              </CardTitle>
              <CardDescription>
                {t(
                  "registration.profileCheckDesc",
                  "Votre profil doit être complet pour soumettre une demande.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProfileComplete ?
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700 dark:text-green-400">
                    {t("registration.profileComplete.title", "Profil complet")}
                  </AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    {t(
                      "registration.profileComplete.description",
                      "Votre profil contient toutes les informations requises.",
                    )}
                  </AlertDescription>
                </Alert>
              : <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {t("registration.missingDocs.title", "Dossier incomplet")}
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        {t(
                          "registration.missingDocs.description",
                          "Veuillez compléter les informations suivantes:",
                        )}
                      </p>
                      <ul className="list-disc ml-4 space-y-1">
                        {missingFields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => navigate({ to: "/my-space/profile" })}
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {t("registration.completeProfile", "Compléter mon profil")}
                  </Button>
                </div>
              }
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Retour")}
              </Button>
              {isProfileComplete && (
                <Button onClick={handleNext}>
                  {t("common.next", "Suivant")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* Step 3.5: Check Documents */}
        {currentStep === "check-documents" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("registration.documentsCheck", "Vérification des documents")}
              </CardTitle>
              <CardDescription>
                {t(
                  "registration.documentsCheckDesc",
                  "Les documents requis doivent être téléversés dans votre profil.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {areDocumentsComplete ?
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700 dark:text-green-400">
                    {t(
                      "registration.documentsComplete.title",
                      "Documents complets",
                    )}
                  </AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    {t(
                      "registration.documentsComplete.description",
                      "Tous les documents requis ont été téléversés.",
                    )}
                  </AlertDescription>
                </Alert>
              : <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {t(
                        "registration.missingDocuments.title",
                        "Documents manquants",
                      )}
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        {t(
                          "registration.missingDocuments.description",
                          "Veuillez téléverser les documents suivants dans votre profil:",
                        )}
                      </p>
                      <ul className="list-disc ml-4 space-y-1">
                        {missingDocuments.map((doc) => (
                          <li key={doc.key}>{doc.label}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => navigate({ to: "/my-space/profile" })}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t(
                      "registration.uploadDocuments",
                      "Téléverser mes documents",
                    )}
                  </Button>
                </div>
              }
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Retour")}
              </Button>
              {areDocumentsComplete && (
                <Button onClick={handleNext}>
                  {t("common.next", "Suivant")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* Step 4: Submit */}
        {currentStep === "submit" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {t("registration.submitTitle", "Confirmer votre demande")}
              </CardTitle>
              <CardDescription>
                {t(
                  "registration.submitDesc",
                  "Vérifiez les informations avant de soumettre.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedOrg?.name}</span>
                </div>
                {selectedOrg?.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>
                      {selectedOrg.address.street},{" "}
                      {selectedOrg.address.postalCode}{" "}
                      {selectedOrg.address.city}
                    </span>
                  </div>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>
                  {t("registration.jurisdiction.title", "Juridiction")}
                </AlertTitle>
                <AlertDescription>
                  {t(
                    "registration.jurisdiction.description",
                    "Assurez-vous de résider dans la juridiction de cet organisme. Une preuve de résidence vous sera demandée.",
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Retour")}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {t("registration.submit", "Envoyer la demande")}
              </Button>
            </CardFooter>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
