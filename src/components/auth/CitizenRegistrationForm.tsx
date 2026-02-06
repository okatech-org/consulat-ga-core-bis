/**
 * CitizenRegistrationForm - Functional Multi-Step Registration
 * Based on Consul Accords GabonaisRegistrationForm pattern
 * Uses React Hook Form with Zod validation and localized error messages
 */

import { useState, useEffect, useCallback } from "react";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import {
  CountryCode,
  DetailedDocumentType,
  DocumentTypeCategory,
  Gender,
  MaritalStatus,
  PublicUserType,
  WorkStatus,
} from "@convex/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import {
  CheckCircle2,
  Loader2,
  FileText,
  User,
  Users,
  MapPin,
  Briefcase,
  Eye,
  UserPlus,
} from "lucide-react";
import { DocumentUploadZone } from "@/components/documents/DocumentUploadZone";
import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useConvexMutationQuery } from "@/integrations/convex/hooks";
import { useUserData } from "@/hooks/use-user-data";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const registrationSchema = z.object({
  // Step 1: Documents (optional for now, users can add later)
  documents: z
    .object({
      identityPhoto: z.string().optional(),
      passport: z.string().optional(),
      birthCertificate: z.string().optional(),
      addressProof: z.string().optional(),
    })
    .optional(),

  // Step 2: Basic Info
  basicInfo: z.object({
    firstName: z.string().min(2, { message: "errors.field.firstName.min" }),
    lastName: z.string().min(2, { message: "errors.field.lastName.min" }),
    gender: z.enum(Gender).optional(),
    birthDate: z
      .string()
      .min(1, { message: "errors.field.birthDate.required" })
      .optional(),
    birthPlace: z
      .string()
      .min(2, { message: "errors.field.birthPlace.min" })
      .optional(),
    birthCountry: z.enum(CountryCode).optional(),
    nationality: z.enum(CountryCode).optional(),
  }),

  // Step 3: Family
  familyInfo: z.object({
    maritalStatus: z.enum(MaritalStatus).optional(),
    fatherFirstName: z.string().optional(),
    fatherLastName: z.string().optional(),
    motherFirstName: z.string().optional(),
    motherLastName: z.string().optional(),
    spouseFirstName: z.string().optional(),
    spouseLastName: z.string().optional(),
  }),

  // Step 4: Contacts
  contactInfo: z.object({
    street: z
      .string()
      .min(3, { message: "errors.field.address.street.min" })
      .optional(),
    city: z
      .string()
      .min(2, { message: "errors.field.address.city.min" })
      .optional(),
    postalCode: z.string().optional(),
    country: z.enum(CountryCode).optional(),
    emergencyName: z.string().optional(),
    emergencyPhone: z.string().optional(),
  }),

  // Step 5: Professional
  professionalInfo: z.object({
    workStatus: z
      .enum([...Object.values(WorkStatus)] as [string, ...string[]])
      .optional(),
    employer: z.string().optional(),
    profession: z.string().optional(),
  }),

  // Step 6: Terms
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "errors.field.terms.required",
  }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface CitizenRegistrationFormProps {
  userType: PublicUserType.LongStay | PublicUserType.ShortStay;
  onComplete?: () => void;
}

export function CitizenRegistrationForm({
  userType,
  onComplete,
}: CitizenRegistrationFormProps) {
  const { t } = useTranslation();
  const { isSignedIn, isPending } = useUserData();
  const { mutateAsync: createProfile } = useConvexMutationQuery(
    api.functions.profiles.createFromRegistration,
  );

  // Step 0 = Account (SignUp), Steps 1-6 = Registration form
  const [step, setStep] = useState(isSignedIn ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      documents: {},
      basicInfo: {
        firstName: "",
        lastName: "",
        birthCountry: CountryCode.GA,
        nationality: CountryCode.GA,
      },
      familyInfo: {},
      contactInfo: {
        country: CountryCode.FR,
      },
      professionalInfo: {},
      acceptTerms: false,
    },
  });

  // Auto-advance from step 0 when user signs in
  useEffect(() => {
    if (isSignedIn && step === 0) {
      setStep(1);
    }
  }, [isSignedIn, step]);

  const steps = [
    { id: 0, label: t("register.steps.account", "Compte"), icon: UserPlus },
    {
      id: 1,
      label: t("register.steps.documents", "Documents"),
      icon: FileText,
    },
    { id: 2, label: t("register.steps.baseInfo", "Infos Base"), icon: User },
    { id: 3, label: t("register.steps.family", "Famille"), icon: Users },
    { id: 4, label: t("register.steps.contacts", "Contacts"), icon: MapPin },
    {
      id: 5,
      label: t("register.steps.profession", "Profession"),
      icon: Briefcase,
    },
    { id: 6, label: t("register.steps.review", "Révision"), icon: Eye },
  ];

  // Validate current step before advancing
  const validateStep = useCallback(
    async (currentStep: number): Promise<boolean> => {
      const fieldsByStep: Record<number, (keyof RegistrationFormValues)[]> = {
        1: [], // Documents are optional
        2: ["basicInfo"],
        3: ["familyInfo"],
        4: ["contactInfo"],
        5: ["professionalInfo"],
        6: ["acceptTerms"],
      };

      const fields = fieldsByStep[currentStep];
      if (!fields || fields.length === 0) return true;

      const result = await form.trigger(fields);
      return result;
    },
    [form],
  );

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (!isValid) {
      toast.error(
        t("register.errors.fixErrors", "Veuillez corriger les erreurs"),
      );
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error(
          t("register.errors.fixErrors", "Veuillez corriger les erreurs"),
        );
        setIsSubmitting(false);
        return;
      }

      const data = form.getValues();

      // Create profile in Convex
      await createProfile({
        userType,
        identity: {
          firstName: data.basicInfo.firstName,
          lastName: data.basicInfo.lastName,
          gender: data.basicInfo.gender,
          birthDate: data.basicInfo.birthDate,
          birthPlace: data.basicInfo.birthPlace,
          birthCountry: data.basicInfo.birthCountry,
          nationality: data.basicInfo.nationality,
        },
        addresses:
          data.contactInfo.street ?
            {
              residence: {
                street: data.contactInfo.street,
                city: data.contactInfo.city || "",
                postalCode: data.contactInfo.postalCode || "",
                country: data.contactInfo.country || CountryCode.FR,
              },
            }
          : undefined,
        family: {
          maritalStatus: data.familyInfo.maritalStatus,
          father:
            data.familyInfo.fatherFirstName ?
              {
                firstName: data.familyInfo.fatherFirstName,
                lastName: data.familyInfo.fatherLastName || "",
              }
            : undefined,
          mother:
            data.familyInfo.motherFirstName ?
              {
                firstName: data.familyInfo.motherFirstName,
                lastName: data.familyInfo.motherLastName || "",
              }
            : undefined,
          spouse:
            data.familyInfo.spouseFirstName ?
              {
                firstName: data.familyInfo.spouseFirstName,
                lastName: data.familyInfo.spouseLastName || "",
              }
            : undefined,
        },
        profession:
          data.professionalInfo.workStatus ?
            {
              status: data.professionalInfo.workStatus as WorkStatus,
              title: data.professionalInfo.profession,
              employer: data.professionalInfo.employer,
            }
          : undefined,
        emergencyContact:
          data.contactInfo.emergencyName ?
            {
              firstName: data.contactInfo.emergencyName.split(" ")[0] || "",
              lastName:
                data.contactInfo.emergencyName.split(" ").slice(1).join(" ") ||
                "",
              phone: data.contactInfo.emergencyPhone || "",
            }
          : undefined,
      });

      toast.success(
        t("register.success", "Inscription soumise pour validation !"),
      );
      onComplete?.();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(t("register.errors.submission", "Une erreur est survenue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while Clerk initializes
  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
              className={`text-xs mt-2 font-medium ${
                step === s.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${
                  step > s.id ? "bg-primary" : "bg-muted"
                }`}
                style={{ width: "100%" }}
              />
            )}
          </div>
        ))}
      </div>

      <FormProvider {...form}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 0 &&
                t("register.citizen.step0.title", "Créer votre compte")}
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
              {step === 0 &&
                t(
                  "register.citizen.step0.description",
                  "Créez un compte sécurisé",
                )}
              {step === 1 &&
                t(
                  "register.citizen.step1.description",
                  "Téléchargez les pièces justificatives",
                )}
              {step === 2 &&
                t(
                  "register.citizen.step2.description",
                  "Identité et naissance",
                )}
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
            {/* Step 0: Account Creation with Clerk */}
            {step === 0 && (
              <div className="flex justify-center">
                <SignUp
                  routing="hash"
                  signInUrl="/login"
                  appearance={{
                    elements: {
                      rootBox: "w-full max-w-md",
                      card: "shadow-none border-0 p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border-border hover:bg-accent",
                      formButtonPrimary: "bg-[#009639] hover:bg-[#007a2f]",
                      formFieldInput: "border-input",
                      footerActionLink: "text-[#009639] hover:text-[#007a2f]",
                    },
                  }}
                />
              </div>
            )}

            {/* Step 1: Documents */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentUploadZone
                  documentType={DetailedDocumentType.IdentityPhoto}
                  category={DocumentTypeCategory.Identity}
                  label={t("register.documents.photo", "Photo d'identité")}
                  formatHint="JPG, PNG - Max 2MB"
                  maxSize={2 * 1024 * 1024}
                  accept="image/*"
                  required
                  onUploadComplete={(documentId) => {
                    form.setValue("documents.identityPhoto", documentId);
                  }}
                />
                <DocumentUploadZone
                  documentType={DetailedDocumentType.Passport}
                  category={DocumentTypeCategory.Identity}
                  label={t("register.documents.passport", "Passeport")}
                  formatHint="PDF, JPG - Max 5MB"
                  maxSize={5 * 1024 * 1024}
                  accept="image/*,application/pdf"
                  required
                  onUploadComplete={(documentId) => {
                    form.setValue("documents.passport", documentId);
                  }}
                />
                <DocumentUploadZone
                  documentType={DetailedDocumentType.BirthCertificate}
                  category={DocumentTypeCategory.CivilStatus}
                  label={t(
                    "register.documents.birthCertificate",
                    "Acte de Naissance",
                  )}
                  formatHint="PDF, JPG - Max 5MB"
                  maxSize={5 * 1024 * 1024}
                  accept="image/*,application/pdf"
                  required
                  onUploadComplete={(documentId) => {
                    form.setValue("documents.birthCertificate", documentId);
                  }}
                />
                <DocumentUploadZone
                  documentType={DetailedDocumentType.ProofOfAddress}
                  category={DocumentTypeCategory.Residence}
                  label={t(
                    "register.documents.proofOfAddress",
                    "Justificatif de Domicile",
                  )}
                  formatHint={t(
                    "register.documents.lessThan3Months",
                    "Moins de 3 mois",
                  )}
                  maxSize={5 * 1024 * 1024}
                  accept="image/*,application/pdf"
                  required
                  onUploadComplete={(documentId) => {
                    form.setValue("documents.addressProof", documentId);
                  }}
                />
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="basicInfo.firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="firstName">
                          {t("common.firstName", "Prénom(s)")} *
                        </FieldLabel>
                        <Input
                          id="firstName"
                          placeholder="Jean"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="basicInfo.lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lastName">
                          {t("common.lastName", "Nom(s)")} *
                        </FieldLabel>
                        <Input
                          id="lastName"
                          placeholder="Mba"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="basicInfo.birthDate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="birthDate">
                          {t("common.birthDate", "Date de naissance")} *
                        </FieldLabel>
                        <Input
                          id="birthDate"
                          type="date"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="basicInfo.birthPlace"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="birthPlace">
                          {t("common.birthPlace", "Lieu de naissance")} *
                        </FieldLabel>
                        <Input
                          id="birthPlace"
                          placeholder="Libreville"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="basicInfo.gender"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gender">
                        {t("profile.fields.gender", "Genre")}
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="gender"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={t("common.select", "Sélectionner")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.Male}>
                            {t("common.gender.male", "Homme")}
                          </SelectItem>
                          <SelectItem value={Gender.Female}>
                            {t("common.gender.female", "Femme")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel>
                    {t("profile.fields.nationality", "Nationalité")}
                  </FieldLabel>
                  <Input defaultValue="Gabonaise" disabled />
                </Field>
              </FieldGroup>
            )}

            {/* Step 3: Family */}
            {step === 3 && (
              <FieldGroup className="space-y-4">
                <Controller
                  name="familyInfo.maritalStatus"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="maritalStatus">
                        {t(
                          "profile.fields.maritalStatus",
                          "Situation Matrimoniale",
                        )}{" "}
                        *
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="maritalStatus"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={t("common.select", "Sélectionner")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={MaritalStatus.Single}>
                            {t("profile.maritalStatus.single", "Célibataire")}
                          </SelectItem>
                          <SelectItem value={MaritalStatus.Married}>
                            {t("profile.maritalStatus.married", "Marié(e)")}
                          </SelectItem>
                          <SelectItem value={MaritalStatus.Divorced}>
                            {t("profile.maritalStatus.divorced", "Divorcé(e)")}
                          </SelectItem>
                          <SelectItem value={MaritalStatus.Widowed}>
                            {t("profile.maritalStatus.widowed", "Veuf/Veuve")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <FieldSet className="p-4 bg-muted/30 rounded-lg">
                  <FieldLegend>
                    {t("profile.family.filiation", "Filiation")}
                  </FieldLegend>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Controller
                      name="familyInfo.fatherLastName"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            {t("profile.family.father", "Nom du Père")}
                          </FieldLabel>
                          <Input
                            placeholder={t("common.fullName", "Nom complet")}
                            {...field}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      name="familyInfo.motherLastName"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            {t("profile.family.mother", "Nom de la Mère")}
                          </FieldLabel>
                          <Input
                            placeholder={t("common.fullName", "Nom complet")}
                            {...field}
                          />
                        </Field>
                      )}
                    />
                  </div>
                </FieldSet>
              </FieldGroup>
            )}

            {/* Step 4: Contacts */}
            {step === 4 && (
              <FieldGroup className="space-y-4">
                <Controller
                  name="contactInfo.street"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="street">
                        {t("profile.address.street", "Adresse Complète")} *
                      </FieldLabel>
                      <Input
                        id="street"
                        placeholder={t(
                          "profile.address.streetPlaceholder",
                          "Numéro, Rue, Apt",
                        )}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="contactInfo.city"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="city">
                          {t("profile.address.city", "Ville")} *
                        </FieldLabel>
                        <Input
                          id="city"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="contactInfo.postalCode"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="postalCode">
                          {t("common.postalCode", "Code Postal")} *
                        </FieldLabel>
                        <Input id="postalCode" {...field} />
                      </Field>
                    )}
                  />
                </div>

                <FieldSet className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
                  <FieldLegend className="text-red-800 dark:text-red-200">
                    {t("profile.contacts.emergency", "Contact d'Urgence")}
                  </FieldLegend>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Controller
                      name="contactInfo.emergencyName"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            {t("common.fullName", "Nom Complet")}
                          </FieldLabel>
                          <Input
                            placeholder={t(
                              "profile.contacts.emergencyPlaceholder",
                              "Personne à contacter",
                            )}
                            {...field}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      name="contactInfo.emergencyPhone"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            {t("profile.fields.phone", "Téléphone")}
                          </FieldLabel>
                          <Input placeholder="+33..." {...field} />
                        </Field>
                      )}
                    />
                  </div>
                </FieldSet>
              </FieldGroup>
            )}

            {/* Step 5: Professional */}
            {step === 5 && (
              <FieldGroup className="space-y-4">
                <Controller
                  name="professionalInfo.workStatus"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workStatus">
                        {t("profile.profession.status", "Statut Professionnel")}
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="workStatus"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={t("common.select", "Sélectionner")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={WorkStatus.Employee}>
                            {t("profile.workStatus.employed", "Salarié")}
                          </SelectItem>
                          <SelectItem value={WorkStatus.SelfEmployed}>
                            {t(
                              "profile.workStatus.selfEmployed",
                              "Indépendant",
                            )}
                          </SelectItem>
                          <SelectItem value={WorkStatus.Student}>
                            {t("profile.workStatus.student", "Étudiant")}
                          </SelectItem>
                          <SelectItem value={WorkStatus.Retired}>
                            {t("profile.workStatus.retired", "Retraité")}
                          </SelectItem>
                          <SelectItem value={WorkStatus.Unemployed}>
                            {t("profile.workStatus.unemployed", "Sans emploi")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="professionalInfo.employer"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="employer">
                        {t(
                          "profile.profession.employer",
                          "Employeur / Établissement",
                        )}
                      </FieldLabel>
                      <Input
                        id="employer"
                        placeholder={t(
                          "profile.profession.employerPlaceholder",
                          "Nom de l'entreprise ou école",
                        )}
                        {...field}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="professionalInfo.profession"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="profession">
                        {t("profile.profession.title", "Profession / Poste")}
                      </FieldLabel>
                      <Input
                        id="profession"
                        placeholder={t(
                          "profile.profession.titlePlaceholder",
                          "Intitulé du poste",
                        )}
                        {...field}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle>
                    {t("register.review.ready", "Prêt à soumettre")}
                  </AlertTitle>
                  <AlertDescription>
                    {t(
                      "register.review.description",
                      "Votre dossier sera transmis au service consulaire pour validation. Vous recevrez une notification dès que votre statut changera.",
                    )}
                  </AlertDescription>
                </Alert>

                <Controller
                  name="acceptTerms"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t(
                            "register.terms.certify",
                            "Je certifie sur l'honneur l'exactitude des informations fournies",
                          )}
                        </label>
                      </div>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            {step > 0 && (
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                  >
                    {t("common.previous", "Précédent")}
                  </Button>
                )}
                <div className="ml-auto">
                  {step < 6 ?
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      {t("common.next", "Suivant")}
                    </Button>
                  : <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t("register.submit", "Soumettre le dossier")}
                    </Button>
                  }
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
}
