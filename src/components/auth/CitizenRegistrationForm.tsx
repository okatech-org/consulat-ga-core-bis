/**
 * CitizenRegistrationForm - Functional Multi-Step Registration
 * Based on Consul Accords GabonaisRegistrationForm pattern
 * Uses React Hook Form with Zod validation and localized error messages
 */

import { useState, useEffect, useCallback } from "react";
import { SignUp, SignIn } from "@clerk/clerk-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { useMutation, useConvexAuth } from "convex/react";
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
  Sparkles,
  Building2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { DocumentUploadZone } from "@/components/documents/DocumentUploadZone";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  useConvexMutationQuery,
  useConvexActionQuery,
} from "@/integrations/convex/hooks";
import { useUserData } from "@/hooks/use-user-data";
import { useRegistrationStorage } from "@/hooks/useRegistrationStorage";
import { AddressWithAutocomplete } from "./AddressWithAutocomplete";

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
    emergencyLastName: z.string().optional(),
    emergencyFirstName: z.string().optional(),
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
  authMode?: "sign-up" | "sign-in";
  onComplete?: () => void;
}

export function CitizenRegistrationForm({
  userType,
  authMode = "sign-up",
  onComplete,
}: CitizenRegistrationFormProps) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { userData } = useUserData();
  const { mutateAsync: createProfile } = useConvexMutationQuery(
    api.functions.profiles.createFromRegistration,
  );
  const { mutateAsync: submitRequest } = useConvexMutationQuery(
    api.functions.profiles.submitRegistrationRequest,
  );

  // Convex mutations for deferred upload
  const generateUploadUrl = useMutation(
    api.functions.documents.generateUploadUrl,
  );
  const createDocument = useMutation(api.functions.documents.create);

  // Local persistence (IndexedDB + localStorage)
  const userEmail = userData?.email;
  const regStorage = useRegistrationStorage(userEmail);

  // Local file state for DocumentUploadZone (localOnly mode)
  const [localFileInfos, setLocalFileInfos] = useState<
    Record<string, { filename: string; mimeType: string } | null>
  >({
    identityPhoto: null,
    passport: null,
    birthCertificate: null,
    addressProof: null,
  });

  // Step 0 = Account (SignUp), Steps 1-6 = Registration form
  const [step, setStep] = useState(isAuthenticated ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formRestored, setFormRestored] = useState(false);

  // Submission progress state
  type SubmissionState =
    | "idle"
    | "uploading_documents"
    | "creating_profile"
    | "finding_org"
    | "submitting_request"
    | "success"
    | "no_org_found"
    | "error";
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [submissionResult, setSubmissionResult] = useState<{
    orgName?: string;
    reference?: string;
    country?: string;
  } | null>(null);

  // AI document extraction (base64 variant for local files)
  const { mutateAsync: extractDataFromImages } = useConvexActionQuery(
    api.ai.documentExtraction.extractRegistrationDataFromImages,
  );

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
    if (isAuthenticated && step === 0) {
      setStep(1);
    }
  }, [isAuthenticated, step]);

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

  // Restore form data from localStorage on mount
  useEffect(() => {
    if (!regStorage.isReady || !userEmail || formRestored) return;

    const stored = regStorage.getStoredData();
    if (stored) {
      // Restore each step's data
      for (const [, stepData] of Object.entries(stored.steps)) {
        if (stepData && typeof stepData === "object") {
          for (const [fieldPath, value] of Object.entries(
            stepData as Record<string, unknown>,
          )) {
            if (value !== undefined && value !== null && value !== "") {
              form.setValue(fieldPath as any, value as any);
            }
          }
        }
      }

      // Restore step position (start at stored step or step 1)
      if (stored.lastStep > 0 && stored.lastStep <= 6) {
        setStep(stored.lastStep);
      }

      toast.info(
        t(
          "register.dataRestored",
          "Vos données précédentes ont été restaurées",
        ),
      );
    }

    // Restore local file infos from IndexedDB
    const restoreFiles = async () => {
      const docTypes = [
        "identityPhoto",
        "passport",
        "birthCertificate",
        "addressProof",
      ];
      const infos: Record<
        string,
        { filename: string; mimeType: string } | null
      > = {};

      for (const docType of docTypes) {
        const file = await regStorage.getFile(docType);
        if (file) {
          infos[docType] = {
            filename: file.filename,
            mimeType: file.mimeType,
          };
          // Mark as having a document in form state
          form.setValue(`documents.${docType}` as any, `local_${docType}`);
        } else {
          infos[docType] = null;
        }
      }

      setLocalFileInfos(infos);
    };

    restoreFiles();
    setFormRestored(true);
  }, [regStorage.isReady, userEmail, formRestored, regStorage, form, t]);

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (!isValid) {
      toast.error(
        t("register.errors.fixErrors", "Veuillez corriger les erreurs"),
      );
      return;
    }

    // Save current step data to localStorage
    if (userEmail && regStorage.isReady) {
      const stepFieldMap: Record<number, string[]> = {
        1: ["documents"],
        2: ["basicInfo"],
        3: ["familyInfo"],
        4: ["contactInfo"],
        5: ["professionalInfo"],
      };

      const fieldsToSave = stepFieldMap[step];
      if (fieldsToSave) {
        const stepData: Record<string, unknown> = {};
        for (const field of fieldsToSave) {
          const values = form.getValues(field as any);
          if (values && typeof values === "object") {
            for (const [key, val] of Object.entries(values)) {
              stepData[`${field}.${key}`] = val;
            }
          }
        }
        regStorage.saveStepData(step, stepData);
      }
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
    setSubmissionState("uploading_documents");
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error(
          t("register.errors.fixErrors", "Veuillez corriger les erreurs"),
        );
        setIsSubmitting(false);
        setSubmissionState("idle");
        return;
      }

      const data = form.getValues();

      // Step 1: Upload documents from IndexedDB to Convex Storage
      const documentIds: Record<string, string> = {};
      const docTypes = [
        "identityPhoto",
        "passport",
        "birthCertificate",
        "addressProof",
      ] as const;

      for (const docType of docTypes) {
        const storedFile = await regStorage.getFile(docType);
        if (!storedFile) continue;

        try {
          // Upload to Convex Storage
          const uploadUrl = await generateUploadUrl();
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": storedFile.mimeType },
            body: storedFile.blob,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed for ${docType}`);
          }

          const { storageId } = await uploadResponse.json();

          // Create document record
          const detailedTypeMap: Record<string, DetailedDocumentType> = {
            identityPhoto: DetailedDocumentType.IdentityPhoto,
            passport: DetailedDocumentType.Passport,
            birthCertificate: DetailedDocumentType.BirthCertificate,
            addressProof: DetailedDocumentType.ProofOfAddress,
          };

          const categoryMap: Record<string, DocumentTypeCategory> = {
            identityPhoto: DocumentTypeCategory.Identity,
            passport: DocumentTypeCategory.Identity,
            birthCertificate: DocumentTypeCategory.CivilStatus,
            addressProof: DocumentTypeCategory.Residence,
          };

          const docId = await createDocument({
            storageId,
            filename: storedFile.filename,
            mimeType: storedFile.mimeType,
            sizeBytes: storedFile.size,
            documentType: detailedTypeMap[docType],
            category: categoryMap[docType],
          });

          documentIds[docType] = docId;
        } catch (err) {
          console.error(`Failed to upload ${docType}:`, err);
        }
      }

      // Step 2: Create profile in Convex (with document references)
      setSubmissionState("creating_profile");
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
          (
            data.contactInfo.emergencyLastName ||
            data.contactInfo.emergencyFirstName
          ) ?
            {
              firstName: data.contactInfo.emergencyFirstName || "",
              lastName: data.contactInfo.emergencyLastName || "",
              phone: data.contactInfo.emergencyPhone || "",
            }
          : undefined,
      });

      // Step 3: For long_stay/short_stay, submit registration request
      if (userType === "long_stay" || userType === "short_stay") {
        setSubmissionState("finding_org");

        // Small delay for better UX
        await new Promise((r) => setTimeout(r, 800));

        setSubmissionState("submitting_request");
        const result = await submitRequest({});

        if (result.status === "success") {
          setSubmissionResult({
            orgName: result.orgName,
            reference: result.reference,
          });
          setSubmissionState("success");
        } else if (result.status === "no_org_found") {
          setSubmissionResult({ country: result.country });
          setSubmissionState("no_org_found");
        } else if (result.status === "already_registered") {
          setSubmissionResult({ orgName: result.orgName });
          setSubmissionState("success");
          toast.info(
            t(
              "register.alreadyRegistered",
              "Vous êtes déjà inscrit auprès de cet organisme",
            ),
          );
        } else {
          // Profile created but no request needed (tourist, etc.)
          setSubmissionState("success");
        }
      } else {
        // Non-registration user types just complete
        setSubmissionState("success");
      }

      // Clear local storage after successful submission
      await regStorage.clearRegistration();
    } catch (error) {
      console.error("Registration error:", error);
      setSubmissionState("error");
      toast.error(t("register.errors.submission", "Une erreur est survenue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle AI document scanning (using base64 from local files)
  const handleScanDocuments = useCallback(async () => {
    if (!regStorage.isReady) {
      toast.error(
        t("register.scan.notReady", "Le stockage local n'est pas prêt"),
      );
      return;
    }

    // Collect base64 images from IndexedDB
    const images: Array<{ base64: string; mimeType: string }> = [];
    const docTypes = [
      "identityPhoto",
      "passport",
      "birthCertificate",
      "addressProof",
    ];

    for (const docType of docTypes) {
      const result = await regStorage.fileToBase64(docType);
      if (result) {
        images.push(result);
      }
    }

    if (images.length === 0) {
      toast.error(
        t(
          "register.scan.noDocuments",
          "Veuillez d'abord uploader au moins un document",
        ),
      );
      return;
    }

    setIsScanning(true);
    try {
      const result = await extractDataFromImages({ images });

      if (!result.success) {
        if (result.error?.startsWith("RATE_LIMITED:")) {
          toast.error(result.error.replace("RATE_LIMITED:", ""));
        } else {
          toast.error(
            t("register.scan.error", "Erreur lors de l'analyse des documents"),
          );
        }
        return;
      }

      // Pre-fill form with extracted data
      const { basicInfo, familyInfo, contactInfo } = result.data;
      let fieldsUpdated = 0;

      // Basic info
      if (basicInfo.firstName && !form.getValues("basicInfo.firstName")) {
        form.setValue("basicInfo.firstName", basicInfo.firstName);
        fieldsUpdated++;
      }
      if (basicInfo.lastName && !form.getValues("basicInfo.lastName")) {
        form.setValue("basicInfo.lastName", basicInfo.lastName);
        fieldsUpdated++;
      }
      if (basicInfo.gender && !form.getValues("basicInfo.gender")) {
        form.setValue(
          "basicInfo.gender",
          basicInfo.gender as unknown as Gender,
        );
        fieldsUpdated++;
      }
      if (basicInfo.birthDate && !form.getValues("basicInfo.birthDate")) {
        form.setValue("basicInfo.birthDate", basicInfo.birthDate);
        fieldsUpdated++;
      }
      if (basicInfo.birthPlace && !form.getValues("basicInfo.birthPlace")) {
        form.setValue("basicInfo.birthPlace", basicInfo.birthPlace);
        fieldsUpdated++;
      }
      if (basicInfo.birthCountry && !form.getValues("basicInfo.birthCountry")) {
        form.setValue(
          "basicInfo.birthCountry",
          basicInfo.birthCountry.toUpperCase() as unknown as CountryCode,
        );
        fieldsUpdated++;
      }
      if (basicInfo.nationality && !form.getValues("basicInfo.nationality")) {
        form.setValue(
          "basicInfo.nationality",
          basicInfo.nationality.toUpperCase() as unknown as CountryCode,
        );
        fieldsUpdated++;
      }

      // Family info
      if (
        familyInfo.fatherFirstName &&
        !form.getValues("familyInfo.fatherFirstName")
      ) {
        form.setValue("familyInfo.fatherFirstName", familyInfo.fatherFirstName);
        fieldsUpdated++;
      }
      if (
        familyInfo.fatherLastName &&
        !form.getValues("familyInfo.fatherLastName")
      ) {
        form.setValue("familyInfo.fatherLastName", familyInfo.fatherLastName);
        fieldsUpdated++;
      }
      if (
        familyInfo.motherFirstName &&
        !form.getValues("familyInfo.motherFirstName")
      ) {
        form.setValue("familyInfo.motherFirstName", familyInfo.motherFirstName);
        fieldsUpdated++;
      }
      if (
        familyInfo.motherLastName &&
        !form.getValues("familyInfo.motherLastName")
      ) {
        form.setValue("familyInfo.motherLastName", familyInfo.motherLastName);
        fieldsUpdated++;
      }

      // Contact info
      if (contactInfo.street && !form.getValues("contactInfo.street")) {
        form.setValue("contactInfo.street", contactInfo.street);
        fieldsUpdated++;
      }
      if (contactInfo.city && !form.getValues("contactInfo.city")) {
        form.setValue("contactInfo.city", contactInfo.city);
        fieldsUpdated++;
      }
      if (contactInfo.postalCode && !form.getValues("contactInfo.postalCode")) {
        form.setValue("contactInfo.postalCode", contactInfo.postalCode);
        fieldsUpdated++;
      }
      if (contactInfo.country && !form.getValues("contactInfo.country")) {
        form.setValue(
          "contactInfo.country",
          contactInfo.country.toUpperCase() as unknown as CountryCode,
        );
        fieldsUpdated++;
      }

      if (fieldsUpdated > 0) {
        toast.success(
          t(
            "register.scan.success",
            "{{count}} champ(s) pré-rempli(s) à partir des documents",
            { count: fieldsUpdated },
          ),
        );
      } else {
        toast.info(
          t("register.scan.noNewData", "Aucune nouvelle donnée extraite"),
        );
      }

      // Show warnings if any
      if (result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          toast.warning(warning, { duration: 5000 });
        });
      }
    } catch (error) {
      console.error("Document scan error:", error);
      toast.error(
        t("register.scan.error", "Erreur lors de l'analyse des documents"),
      );
    } finally {
      setIsScanning(false);
    }
  }, [form, extractDataFromImages, regStorage, t]);

  // Show loading only while Convex auth is initializing
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show progress screen during and after submission
  if (submissionState !== "idle") {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Card className="p-8">
          <div className="space-y-8">
            {/* Step indicators */}
            <div className="space-y-4">
              {/* Step 0: Uploading Documents */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    submissionState === "uploading_documents" ?
                      "bg-primary/20 animate-pulse"
                    : "bg-primary text-white"
                  }`}
                >
                  {submissionState === "uploading_documents" ?
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <span
                  className={`font-medium ${
                    submissionState === "uploading_documents" ? "text-primary"
                    : "text-foreground"
                  }`}
                >
                  {t(
                    "register.progress.uploadingDocuments",
                    "Envoi de vos documents...",
                  )}
                </span>
              </div>

              {/* Step 1: Profile */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    submissionState === "creating_profile" ?
                      "bg-primary/20 animate-pulse"
                    : submissionState === "uploading_documents" ?
                      "bg-muted text-muted-foreground"
                    : "bg-primary text-white"
                  }`}
                >
                  {submissionState === "creating_profile" ?
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  : submissionState === "uploading_documents" ?
                    <User className="h-5 w-5" />
                  : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <span
                  className={`font-medium ${
                    submissionState === "creating_profile" ? "text-primary"
                    : submissionState === "uploading_documents" ?
                      "text-muted-foreground"
                    : "text-foreground"
                  }`}
                >
                  {t(
                    "register.progress.creatingProfile",
                    "Création de votre profil...",
                  )}
                </span>
              </div>

              {/* Step 2: Finding org (only for long_stay/short_stay) */}
              {(userType === "long_stay" || userType === "short_stay") && (
                <>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        submissionState === "finding_org" ?
                          "bg-primary/20 animate-pulse"
                        : (
                          ["uploading_documents", "creating_profile"].includes(
                            submissionState,
                          )
                        ) ?
                          "bg-muted text-muted-foreground"
                        : "bg-primary text-white"
                      }`}
                    >
                      {submissionState === "finding_org" ?
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      : (
                        ["uploading_documents", "creating_profile"].includes(
                          submissionState,
                        )
                      ) ?
                        <Building2 className="h-5 w-5" />
                      : <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <span
                      className={`font-medium ${
                        submissionState === "finding_org" ? "text-primary"
                        : (
                          ["uploading_documents", "creating_profile"].includes(
                            submissionState,
                          )
                        ) ?
                          "text-muted-foreground"
                        : "text-foreground"
                      }`}
                    >
                      {t(
                        "register.progress.findingOrg",
                        "Recherche de votre organisme de rattachement...",
                      )}
                    </span>
                  </div>

                  {/* Step 3: Submitting */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        submissionState === "submitting_request" ?
                          "bg-primary/20 animate-pulse"
                        : (
                          [
                            "uploading_documents",
                            "creating_profile",
                            "finding_org",
                          ].includes(submissionState)
                        ) ?
                          "bg-muted text-muted-foreground"
                        : "bg-primary text-white"
                      }`}
                    >
                      {submissionState === "submitting_request" ?
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      : (
                        [
                          "uploading_documents",
                          "creating_profile",
                          "finding_org",
                        ].includes(submissionState)
                      ) ?
                        <FileText className="h-5 w-5" />
                      : <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <span
                      className={`font-medium ${
                        submissionState === "submitting_request" ?
                          "text-primary"
                        : (
                          [
                            "uploading_documents",
                            "creating_profile",
                            "finding_org",
                          ].includes(submissionState)
                        ) ?
                          "text-muted-foreground"
                        : "text-foreground"
                      }`}
                    >
                      {t(
                        "register.progress.submitting",
                        "Envoi de votre demande...",
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Success state */}
            {submissionState === "success" && (
              <div className="text-center space-y-4 pt-4 border-t">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("register.success.title", "Demande envoyée !")}
                  </h3>
                  {submissionResult?.orgName && (
                    <p className="text-muted-foreground mt-2">
                      {t(
                        "register.success.description",
                        "Votre demande sera traitée par {{orgName}}",
                        { orgName: submissionResult.orgName },
                      )}
                    </p>
                  )}
                  {submissionResult?.reference && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("register.success.reference", "Référence")}:{" "}
                      <span className="font-mono font-medium">
                        {submissionResult.reference}
                      </span>
                    </p>
                  )}
                </div>
                <Button onClick={() => onComplete?.()} className="mt-4">
                  {t(
                    "register.success.goToSpace",
                    "Accéder à mon Espace Consulaire",
                  )}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* No org found state */}
            {submissionState === "no_org_found" && (
              <div className="text-center space-y-4 pt-4 border-t">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("register.noOrg.title", "Profil créé")}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {t(
                      "register.noOrg.description",
                      "Votre profil a été créé, mais aucun organisme consulaire n'est configuré pour votre pays de résidence ({{country}}). Vous pourrez soumettre votre demande d'inscription plus tard.",
                      { country: submissionResult?.country || "" },
                    )}
                  </p>
                </div>
                <Button onClick={() => onComplete?.()} className="mt-4">
                  {t("register.noOrg.goToSpace", "Accéder à mon Espace")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Error state */}
            {submissionState === "error" && (
              <div className="text-center space-y-4 pt-4 border-t">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("register.error.title", "Une erreur est survenue")}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {t(
                      "register.error.description",
                      "Veuillez réessayer ou contacter le support.",
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmissionState("idle");
                  }}
                  className="mt-4"
                >
                  {t("common.retry", "Réessayer")}
                </Button>
              </div>
            )}
          </div>
        </Card>
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
                (authMode === "sign-in" ?
                  t(
                    "register.citizen.step0.descriptionSignIn",
                    "Connectez-vous à votre compte",
                  )
                : t(
                    "register.citizen.step0.description",
                    "Créez un compte sécurisé",
                  ))}
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
              <div className="flex flex-col items-center gap-6">
                {authMode === "sign-in" ?
                  <SignIn
                    routing="hash"
                    forceRedirectUrl={`/register?type=${userType}`}
                    signUpUrl={`/register?type=${userType}&mode=sign-up`}
                    appearance={{
                      elements: {
                        rootBox: "w-full max-w-md",
                        card: "shadow-none border-0 p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton:
                          "border-border hover:bg-accent",
                        formButtonPrimary: "bg-[#009639] hover:bg-[#007a2f]",
                        formFieldInput: "border-input",
                        footerActionLink: "text-[#009639] hover:text-[#007a2f]",
                      },
                    }}
                  />
                : <SignUp
                    routing="hash"
                    forceRedirectUrl={`/register?type=${userType}`}
                    signInUrl={`/register?type=${userType}&mode=sign-in`}
                    appearance={{
                      elements: {
                        rootBox: "w-full max-w-md",
                        card: "shadow-none border-0 p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton:
                          "border-border hover:bg-accent",
                        formButtonPrimary: "bg-[#009639] hover:bg-[#007a2f]",
                        formFieldInput: "border-input",
                        footerActionLink: "text-[#009639] hover:text-[#007a2f]",
                      },
                    }}
                  />
                }
              </div>
            )}

            {/* Step 1: Documents */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentUploadZone
                    documentType={DetailedDocumentType.IdentityPhoto}
                    category={DocumentTypeCategory.Identity}
                    label={t("register.documents.photo", "Photo d'identité")}
                    formatHint="JPG, PNG - Max 2MB"
                    maxSize={2 * 1024 * 1024}
                    accept="image/*"
                    required
                    localOnly
                    localFile={localFileInfos.identityPhoto}
                    onLocalFileSelected={async (file) => {
                      await regStorage.saveFile("identityPhoto", file);
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        identityPhoto: {
                          filename: file.name,
                          mimeType: file.type,
                        },
                      }));
                      form.setValue(
                        "documents.identityPhoto",
                        `local_identityPhoto`,
                      );
                    }}
                    onDelete={async () => {
                      await regStorage.removeFile("identityPhoto");
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        identityPhoto: null,
                      }));
                      form.setValue("documents.identityPhoto", undefined);
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
                    localOnly
                    localFile={localFileInfos.passport}
                    onLocalFileSelected={async (file) => {
                      await regStorage.saveFile("passport", file);
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        passport: {
                          filename: file.name,
                          mimeType: file.type,
                        },
                      }));
                      form.setValue("documents.passport", `local_passport`);
                    }}
                    onDelete={async () => {
                      await regStorage.removeFile("passport");
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        passport: null,
                      }));
                      form.setValue("documents.passport", undefined);
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
                    localOnly
                    localFile={localFileInfos.birthCertificate}
                    onLocalFileSelected={async (file) => {
                      await regStorage.saveFile("birthCertificate", file);
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        birthCertificate: {
                          filename: file.name,
                          mimeType: file.type,
                        },
                      }));
                      form.setValue(
                        "documents.birthCertificate",
                        `local_birthCertificate`,
                      );
                    }}
                    onDelete={async () => {
                      await regStorage.removeFile("birthCertificate");
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        birthCertificate: null,
                      }));
                      form.setValue("documents.birthCertificate", undefined);
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
                    localOnly
                    localFile={localFileInfos.addressProof}
                    onLocalFileSelected={async (file) => {
                      await regStorage.saveFile("addressProof", file);
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        addressProof: {
                          filename: file.name,
                          mimeType: file.type,
                        },
                      }));
                      form.setValue(
                        "documents.addressProof",
                        `local_addressProof`,
                      );
                    }}
                    onDelete={async () => {
                      await regStorage.removeFile("addressProof");
                      setLocalFileInfos((prev) => ({
                        ...prev,
                        addressProof: null,
                      }));
                      form.setValue("documents.addressProof", undefined);
                    }}
                  />
                </div>

                {/* AI Scan Button - visible when at least one document is uploaded */}
                {(localFileInfos.identityPhoto ||
                  localFileInfos.passport ||
                  localFileInfos.birthCertificate ||
                  localFileInfos.addressProof) && (
                  <div className="mt-6 p-4 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {t(
                            "register.scan.title",
                            "Pré-remplissage automatique",
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t(
                            "register.scan.description",
                            "Analysez vos documents pour pré-remplir automatiquement le formulaire",
                          )}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleScanDocuments}
                        disabled={isScanning}
                        className="ml-4"
                      >
                        {isScanning ?
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("register.scan.scanning", "Analyse...")}
                          </>
                        : <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {t("register.scan.button", "Analyser")}
                          </>
                        }
                      </Button>
                    </div>
                  </div>
                )}
              </>
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

                  {/* Father */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("profile.family.father", "Père")}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="familyInfo.fatherLastName"
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>
                              {t("common.lastName", "Nom")}
                            </FieldLabel>
                            <Input
                              placeholder={t("common.lastName", "Nom")}
                              {...field}
                            />
                          </Field>
                        )}
                      />
                      <Controller
                        name="familyInfo.fatherFirstName"
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>
                              {t("common.firstName", "Prénom(s)")}
                            </FieldLabel>
                            <Input
                              placeholder={t("common.firstName", "Prénom(s)")}
                              {...field}
                            />
                          </Field>
                        )}
                      />
                    </div>
                  </div>

                  {/* Mother */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("profile.family.mother", "Mère")}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="familyInfo.motherLastName"
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>
                              {t("common.lastName", "Nom")}
                            </FieldLabel>
                            <Input
                              placeholder={t("common.lastName", "Nom")}
                              {...field}
                            />
                          </Field>
                        )}
                      />
                      <Controller
                        name="familyInfo.motherFirstName"
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>
                              {t("common.firstName", "Prénom(s)")}
                            </FieldLabel>
                            <Input
                              placeholder={t("common.firstName", "Prénom(s)")}
                              {...field}
                            />
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                </FieldSet>
              </FieldGroup>
            )}

            {/* Step 4: Contacts */}
            {step === 4 && (
              <FieldGroup className="space-y-4">
                <AddressWithAutocomplete form={form} t={t} />

                <FieldSet className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
                  <FieldLegend className="text-red-800 dark:text-red-200">
                    {t("profile.contacts.emergency.title", "Contact d'Urgence")}
                  </FieldLegend>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Controller
                      name="contactInfo.emergencyLastName"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>{t("common.lastName", "Nom")}</FieldLabel>
                          <Input
                            placeholder={t("common.lastName", "Nom")}
                            {...field}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      name="contactInfo.emergencyFirstName"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            {t("common.firstName", "Prénom(s)")}
                          </FieldLabel>
                          <Input
                            placeholder={t("common.firstName", "Prénom(s)")}
                            {...field}
                          />
                        </Field>
                      )}
                    />
                  </div>
                  <div className="mt-3">
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

                {/* Data Summary */}
                <div className="space-y-3 text-sm">
                  {/* Identity */}
                  <FieldSet className="p-3 bg-muted/30 rounded-lg">
                    <FieldLegend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("register.review.identity", "Identité")}
                    </FieldLegend>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>{" "}
                        {form.watch("basicInfo.lastName") || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prénom:</span>{" "}
                        {form.watch("basicInfo.firstName") || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Né(e) le:</span>{" "}
                        {form.watch("basicInfo.birthDate") || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">À:</span>{" "}
                        {form.watch("basicInfo.birthPlace") || "-"}
                      </div>
                    </div>
                  </FieldSet>

                  {/* Address */}
                  <FieldSet className="p-3 bg-muted/30 rounded-lg">
                    <FieldLegend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("register.review.address", "Adresse")}
                    </FieldLegend>
                    <div className="mt-2">
                      <div>{form.watch("contactInfo.street") || "-"}</div>
                      <div>
                        {form.watch("contactInfo.postalCode")}{" "}
                        {form.watch("contactInfo.city")}
                      </div>
                    </div>
                  </FieldSet>

                  {/* Family */}
                  <FieldSet className="p-3 bg-muted/30 rounded-lg">
                    <FieldLegend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("register.review.family", "Filiation")}
                    </FieldLegend>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <div>
                        <span className="text-muted-foreground">Père:</span>{" "}
                        {form.watch("familyInfo.fatherLastName")}{" "}
                        {form.watch("familyInfo.fatherFirstName") || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mère:</span>{" "}
                        {form.watch("familyInfo.motherLastName")}{" "}
                        {form.watch("familyInfo.motherFirstName") || "-"}
                      </div>
                    </div>
                  </FieldSet>

                  {/* Emergency Contact */}
                  <FieldSet className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <FieldLegend className="text-xs font-semibold text-red-800 dark:text-red-200 uppercase tracking-wide">
                      {t("register.review.emergency", "Contact d'urgence")}
                    </FieldLegend>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>{" "}
                        {form.watch("contactInfo.emergencyLastName")}{" "}
                        {form.watch("contactInfo.emergencyFirstName") || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tél:</span>{" "}
                        {form.watch("contactInfo.emergencyPhone") || "-"}
                      </div>
                    </div>
                  </FieldSet>
                </div>

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
