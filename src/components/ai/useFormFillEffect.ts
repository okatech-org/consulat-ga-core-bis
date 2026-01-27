import { useEffect, useRef } from "react";
import { type UseFormReturn, type FieldValues } from "react-hook-form";
import { useFormFillOptional } from "./FormFillContext";
import { toast } from "sonner";

/**
 * Hook that applies form fill data from AI assistant to a react-hook-form
 * 
 * @param form - The react-hook-form instance
 * @param formId - The identifier for this form (e.g., "profile", "profile.identity")
 * @param fieldMapping - Optional mapping from AI field names to form field paths
 */
export function useFormFillEffect<T extends FieldValues>(
  form: UseFormReturn<T>,
  formId: string,
  fieldMapping?: Record<string, string>
) {
  const formFillContext = useFormFillOptional();
  const appliedTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!formFillContext) return;

    const { pendingFill, consumeFormFill } = formFillContext;
    
    if (!pendingFill) return;
    
    // Check if this fill data is for this form
    const formIdMatch = pendingFill.formId === formId || 
                        pendingFill.formId.startsWith(`${formId}.`) ||
                        formId.startsWith(`${pendingFill.formId}.`);
    
    if (!formIdMatch) return;
    
    // Avoid applying the same fill data twice
    if (appliedTimestampRef.current === pendingFill.timestamp) return;
    
    console.log("[useFormFillEffect] Applying fill data:", { formId, pendingFill });
    
    // Consume the fill data (this will clear it from context)
    const fillData = consumeFormFill(formId);
    if (!fillData) return;
    
    appliedTimestampRef.current = fillData.timestamp;
    
    // Apply each field
    let fieldsApplied = 0;
    
    for (const [key, value] of Object.entries(fillData.fields)) {
      // Use mapping if provided, otherwise use the key directly
      const fieldPath = fieldMapping?.[key] ?? key;
      
      try {
        // Handle nested paths (e.g., "identity.firstName")
        form.setValue(fieldPath as any, value as any, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        fieldsApplied++;
        console.log(`[useFormFillEffect] Set ${fieldPath} = ${value}`);
      } catch (error) {
        console.warn(`[useFormFillEffect] Failed to set ${fieldPath}:`, error);
      }
    }
    
    if (fieldsApplied > 0) {
      toast.success(`${fieldsApplied} champ(s) pré-rempli(s) par l'assistant IA`);
    }
  }, [formFillContext, formId, form, fieldMapping]);
}

/**
 * Maps common AI field names to profile form paths
 */
export const PROFILE_FIELD_MAPPING: Record<string, string> = {
  // Identity fields
  firstName: "identity.firstName",
  lastName: "identity.lastName",
  birthDate: "identity.birthDate",
  birthPlace: "identity.birthPlace",
  birthCountry: "identity.birthCountry",
  gender: "identity.gender",
  nationality: "identity.nationality",
  
  // Address fields (residence)
  street: "addresses.residence.street",
  city: "addresses.residence.city",
  postalCode: "addresses.residence.postalCode",
  country: "addresses.residence.country",
  
  // Contact fields  
  email: "contacts.email",
  phone: "contacts.phone",
  
  // Passport fields
  passportNumber: "passportInfo.number",
  passportIssueDate: "passportInfo.issueDate",
  passportExpiryDate: "passportInfo.expiryDate",
  passportAuthority: "passportInfo.issuingAuthority",
  
  // Family fields
  maritalStatus: "family.maritalStatus",
  fatherFirstName: "family.father.firstName",
  fatherLastName: "family.father.lastName",
  motherFirstName: "family.mother.firstName",
  motherLastName: "family.mother.lastName",
  spouseFirstName: "family.spouse.firstName",
  spouseLastName: "family.spouse.lastName",
};
