/**
 * useRegistrationForm Hook
 * Multi-step registration form with local storage persistence
 * Adapted from reference project for consulat.ga-core
 */

import { useCallback, useState, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    BasicInfoSchema,
    ContactInfoSchema,
    FamilyInfoSchema,
    ProfessionalInfoSchema,
    DocumentsSchema,
    type BasicInfoFormData,
    type FamilyInfoFormData,
    type ContactInfoFormData,
    type ProfessionalInfoFormData,
    type DocumentsFormData,
    registrationSteps,
    RegistrationStepKey,
    getRegistrationDefaults,
} from '@/schemas/registration';

// ============================================================================
// LOCAL STORAGE HELPER
// ============================================================================

const STORAGE_KEY = 'consular_registration_form';

function createFormStorage() {
    const saveData = (data: Record<string, unknown>) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save form data to localStorage:', e);
        }
    };

    const loadSavedData = (): Record<string, unknown> | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Failed to load form data from localStorage:', e);
            return null;
        }
    };

    const clearData = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to clear form data from localStorage:', e);
        }
    };

    return { saveData, loadSavedData, clearData };
}

// ============================================================================
// STEP CONFIGURATION
// ============================================================================

export const REGISTRATION_STEPS = [
    {
        key: 'basicInfo' as const,
        title: 'Informations personnelles',
        description: 'Vos informations de base',
        schema: BasicInfoSchema,
    },
    {
        key: 'familyInfo' as const,
        title: 'Situation familiale',
        description: 'Votre situation matrimoniale et familiale',
        schema: FamilyInfoSchema,
    },
    {
        key: 'contactInfo' as const,
        title: 'Coordonnées',
        description: 'Vos moyens de contact',
        schema: ContactInfoSchema,
    },
    {
        key: 'professionalInfo' as const,
        title: 'Situation professionnelle',
        description: 'Votre activité professionnelle',
        schema: ProfessionalInfoSchema,
    },
    {
        key: 'documents' as const,
        title: 'Documents',
        description: 'Vos pièces justificatives',
        schema: DocumentsSchema,
    },
] as const;

export type RegistrationStep = typeof REGISTRATION_STEPS[number];

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

interface RegistrationForms {
    basicInfo: UseFormReturn<BasicInfoFormData>;
    familyInfo: UseFormReturn<FamilyInfoFormData>;
    contactInfo: UseFormReturn<ContactInfoFormData>;
    professionalInfo: UseFormReturn<ProfessionalInfoFormData>;
    documents: UseFormReturn<DocumentsFormData>;
}

interface UseRegistrationFormResult {
    /** Current step index (0-4) */
    currentStep: number;
    /** Set current step */
    setCurrentStep: (step: number) => void;
    /** Go to next step */
    nextStep: () => void;
    /** Go to previous step */
    prevStep: () => void;
    /** Is on first step */
    isFirstStep: boolean;
    /** Is on last step */
    isLastStep: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | undefined;
    /** All form instances */
    forms: RegistrationForms;
    /** Current step configuration */
    currentStepConfig: RegistrationStep;
    /** Progress percentage (0-100) */
    progress: number;
    /** Save current data to localStorage */
    saveProgress: () => void;
    /** Clear all saved data */
    clearProgress: () => void;
    /** Submit all forms */
    submitRegistration: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

interface UseRegistrationFormOptions {
    /** Initial data to populate forms */
    initialData?: Partial<{
        basicInfo: Partial<BasicInfoFormData>;
        familyInfo: Partial<FamilyInfoFormData>;
        contactInfo: Partial<ContactInfoFormData>;
        professionalInfo: Partial<ProfessionalInfoFormData>;
        documents: Partial<DocumentsFormData>;
    }>;
    /** Callback when registration is complete */
    onComplete?: (data: Record<string, unknown>) => Promise<void>;
}

export function useRegistrationForm(options: UseRegistrationFormOptions = {}): UseRegistrationFormResult {
    const { initialData, onComplete } = options;

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const { saveData, loadSavedData, clearData } = useMemo(() => createFormStorage(), []);

    // Load saved data or use initial data
    const savedData = useMemo(() => {
        const saved = loadSavedData();
        return saved || initialData || {};
    }, [loadSavedData, initialData]);

    const defaults = useMemo(() => getRegistrationDefaults(savedData as any), [savedData]);

    // Initialize all forms
    const forms: RegistrationForms = {
        basicInfo: useForm<BasicInfoFormData>({
            resolver: zodResolver(BasicInfoSchema),
            defaultValues: defaults.basicInfo as BasicInfoFormData,
            mode: 'onBlur',
        }),
        familyInfo: useForm<FamilyInfoFormData>({
            resolver: zodResolver(FamilyInfoSchema),
            defaultValues: defaults.familyInfo as FamilyInfoFormData,
        }),
        contactInfo: useForm<ContactInfoFormData>({
            resolver: zodResolver(ContactInfoSchema),
            defaultValues: defaults.contactInfo as ContactInfoFormData,
        }),
        professionalInfo: useForm<ProfessionalInfoFormData>({
            resolver: zodResolver(ProfessionalInfoSchema),
            defaultValues: defaults.professionalInfo as ProfessionalInfoFormData,
        }),
        documents: useForm<DocumentsFormData>({
            resolver: zodResolver(DocumentsSchema),
            defaultValues: defaults.documents as DocumentsFormData,
        }),
    };

    // Current step config
    const currentStepConfig = REGISTRATION_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === REGISTRATION_STEPS.length - 1;

    // Calculate progress
    const progress = useMemo(() => {
        const completedSteps = REGISTRATION_STEPS.slice(0, currentStep).length;
        return Math.round((completedSteps / REGISTRATION_STEPS.length) * 100);
    }, [currentStep]);

    // Navigation
    const nextStep = useCallback(async () => {
        const stepKey = REGISTRATION_STEPS[currentStep].key;
        const form = forms[stepKey as keyof RegistrationForms];

        // Validate current step
        const isValid = await form.trigger();
        if (!isValid) {
            return;
        }

        if (currentStep < REGISTRATION_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);

            // Save progress
            const allData = getAllFormData();
            saveData(allData);
        }
    }, [currentStep, forms, saveData]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    // Get all form data
    const getAllFormData = useCallback(() => {
        return {
            basicInfo: forms.basicInfo.getValues(),
            familyInfo: forms.familyInfo.getValues(),
            contactInfo: forms.contactInfo.getValues(),
            professionalInfo: forms.professionalInfo.getValues(),
            documents: forms.documents.getValues(),
        };
    }, [forms]);

    // Save progress
    const saveProgress = useCallback(() => {
        const allData = getAllFormData();
        saveData(allData);
    }, [getAllFormData, saveData]);

    // Clear progress
    const clearProgress = useCallback(() => {
        clearData();
        // Reset all forms
        forms.basicInfo.reset();
        forms.familyInfo.reset();
        forms.contactInfo.reset();
        forms.professionalInfo.reset();
        forms.documents.reset();
        setCurrentStep(0);
    }, [clearData, forms]);

    // Submit all
    const submitRegistration = useCallback(async () => {
        setIsLoading(true);
        setError(undefined);

        try {
            // Validate all forms
            const results = await Promise.all([
                forms.basicInfo.trigger(),
                forms.familyInfo.trigger(),
                forms.contactInfo.trigger(),
                forms.professionalInfo.trigger(),
                forms.documents.trigger(),
            ]);

            if (!results.every(Boolean)) {
                setError('Veuillez compléter tous les champs obligatoires');
                return;
            }

            const allData = getAllFormData();

            // Call onComplete callback
            if (onComplete) {
                await onComplete(allData);
            }

            // Clear saved data on success
            clearData();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, [forms, getAllFormData, onComplete, clearData]);

    return {
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep,
        isLoading,
        error,
        forms,
        currentStepConfig,
        progress,
        saveProgress,
        clearProgress,
        submitRegistration,
    };
}

export default useRegistrationForm;
