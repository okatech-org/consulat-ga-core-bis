import { Infer, v } from "convex/values";
import {
  OrganizationType as OrgType,
  MemberRole,
  RequestStatus,
  RequestPriority,
  DocumentStatus,
  Gender,
  ServiceCategory,
  MaritalStatus,
  WorkStatus as ProfessionStatus,
  NationalityAcquisition,
  FamilyLink,
  ActivityType as EventType,
  OwnerType,
  CountryCode,
  RegistrationDuration,
  RegistrationType,
  RegistrationStatus,
  FormFieldType,
  PostCategory,
  PostStatus,
} from "./constants";
import { countryCodeValidator } from "./countryCodeValidator";

export {
  OrgType,
  MemberRole,
  RequestStatus,
  RequestPriority,
  DocumentStatus,
  Gender,
  ServiceCategory,
  MaritalStatus,
  ProfessionStatus,
  NationalityAcquisition,
  FamilyLink,
  EventType,
  OwnerType,
  CountryCode,
  RegistrationDuration,
  RegistrationType,
  RegistrationStatus,
};

// ============================================================================
// VALIDATORS
// ============================================================================


// Org types
export const orgTypeValidator = v.union(
  v.literal(OrgType.Embassy),
  v.literal(OrgType.Consulate),
  v.literal(OrgType.GeneralConsulate),
  v.literal(OrgType.HonoraryConsulate),
  v.literal(OrgType.ThirdParty)
);

// Member roles
export const memberRoleValidator = v.union(
  v.literal(MemberRole.Admin),
  v.literal(MemberRole.Agent),
  v.literal(MemberRole.Viewer)
);

// Request status
export const requestStatusValidator = v.union(
  v.literal(RequestStatus.Draft),
  v.literal(RequestStatus.Pending),
  v.literal(RequestStatus.Processing),
  v.literal(RequestStatus.Completed),
  v.literal(RequestStatus.Cancelled)
);

// Request priority
export const requestPriorityValidator = v.union(
  v.literal(RequestPriority.Normal),
  v.literal(RequestPriority.Urgent),
  v.literal(RequestPriority.Critical)
);

// Document status
export const documentStatusValidator = v.union(
  v.literal(DocumentStatus.Pending),
  v.literal(DocumentStatus.Validated),
  v.literal(DocumentStatus.Rejected),
  v.literal(DocumentStatus.Expired),
  v.literal(DocumentStatus.Expiring)
);

// Gender
export const genderValidator = v.union(
  v.literal(Gender.Male),
  v.literal(Gender.Female)
);

// Service category
export const serviceCategoryValidator = v.union(
  v.literal(ServiceCategory.Passport),
  v.literal(ServiceCategory.Identity),
  v.literal(ServiceCategory.CivilStatus),
  v.literal(ServiceCategory.Visa),
  v.literal(ServiceCategory.Certification),
  v.literal(ServiceCategory.Registration),
  v.literal(ServiceCategory.Assistance),
  v.literal(ServiceCategory.TravelDocument),
  v.literal(ServiceCategory.Transcript),
  v.literal(ServiceCategory.Other)
);

// Owner type for documents
export const ownerTypeValidator = v.union(
  v.literal(OwnerType.Profile),
  v.literal(OwnerType.Request),
  v.literal(OwnerType.User),
  v.literal(OwnerType.Organization),
  v.literal(OwnerType.ChildProfile)
);

// Event target type
export const eventTargetTypeValidator = v.union(
  v.literal("request"),
  v.literal("profile"),
  v.literal("document")
);

export const maritalStatusValidator = v.union(
  v.literal(MaritalStatus.Single),
  v.literal(MaritalStatus.Married),
  v.literal(MaritalStatus.Divorced),
  v.literal(MaritalStatus.Widowed),
  v.literal(MaritalStatus.CivilUnion),
  v.literal(MaritalStatus.Cohabiting)
);

export const professionStatusValidator = v.union(
  v.literal(ProfessionStatus.Employee),
  v.literal(ProfessionStatus.Unemployed),
  v.literal(ProfessionStatus.Retired),
  v.literal(ProfessionStatus.Student),
  v.literal(ProfessionStatus.SelfEmployed),
  v.literal(ProfessionStatus.Entrepreneur),
  v.literal(ProfessionStatus.Other)
);

export const nationalityAcquisitionValidator = v.union(
  v.literal(NationalityAcquisition.Birth),
  v.literal(NationalityAcquisition.Marriage),
  v.literal(NationalityAcquisition.Naturalization),
  v.literal(NationalityAcquisition.Other)
);

export const familyLinkValidator = v.union(
  v.literal(FamilyLink.Father),
  v.literal(FamilyLink.Mother),
  v.literal(FamilyLink.Spouse),
  v.literal(FamilyLink.Child),
  v.literal(FamilyLink.BrotherSister),
  v.literal(FamilyLink.LegalGuardian),
  v.literal(FamilyLink.Other)
);

// Registration validators
export const registrationDurationValidator = v.union(
  v.literal(RegistrationDuration.Temporary),
  v.literal(RegistrationDuration.Permanent)
);

export const registrationTypeValidator = v.union(
  v.literal(RegistrationType.Inscription),
  v.literal(RegistrationType.Renewal),
  v.literal(RegistrationType.Modification)
);

export const registrationStatusValidator = v.union(
  v.literal(RegistrationStatus.Requested),
  v.literal(RegistrationStatus.Active),
  v.literal(RegistrationStatus.Expired)
);

// ============================================================================
// SHARED OBJECT VALIDATORS
// ============================================================================

// Address
export const addressValidator = v.object({
  street: v.string(),
  city: v.string(),
  postalCode: v.string(),
  country: countryCodeValidator,
  coordinates: v.optional(
    v.object({
      lat: v.number(),
      lng: v.number(),
    })
  ),
});

export type Address = Infer<typeof addressValidator>;

// Working hours slot
export const timeSlotValidator = v.object({
  start: v.string(), // "09:00"
  end: v.string(), // "17:00"
  isOpen: v.optional(v.boolean()),
});

export type TimeSlot = Infer<typeof timeSlotValidator>;

// Org settings
export const orgSettingsValidator = v.object({
  appointmentBuffer: v.number(),
  maxActiveRequests: v.number(),
  workingHours: v.record(v.string(), v.array(timeSlotValidator)),
});

export type OrgSettings = Infer<typeof orgSettingsValidator>;

// Org stats
export const orgStatsValidator = v.object({
  memberCount: v.number(),
  pendingRequests: v.number(),
  activeServices: v.number(),
  upcomingAppointments: v.number(),
  updatedAt: v.number(),
});

export type OrgStats = Infer<typeof orgStatsValidator>;

// Pricing
export const pricingValidator = v.object({
  amount: v.number(),
  currency: v.string(),
});

export type Pricing = Infer<typeof pricingValidator>;

export const localizedStringValidator = v.record(v.string(), v.string());

export type LocalizedString = Infer<typeof localizedStringValidator>;

// Required document definition (label is localized)
export const requiredDocumentValidator = v.object({
  type: v.string(),
  label: localizedStringValidator,
  required: v.boolean(),
});

export type RequiredDocument = Infer<typeof requiredDocumentValidator>;

// ============================================================================
// FORM SCHEMA VALIDATORS (Dynamic Forms)
// ============================================================================



export const formFieldTypeValidator = v.union(
  v.literal(FormFieldType.Text),
  v.literal(FormFieldType.Email),
  v.literal(FormFieldType.Phone),
  v.literal(FormFieldType.Number),
  v.literal(FormFieldType.Date),
  v.literal(FormFieldType.Select),
  v.literal(FormFieldType.Checkbox),
  v.literal(FormFieldType.Textarea),
  v.literal(FormFieldType.File),
  v.literal(FormFieldType.Country),
  v.literal(FormFieldType.Gender),
  v.literal(FormFieldType.Address),
  v.literal(FormFieldType.Image),
  v.literal(FormFieldType.ProfileDocument),
);

/**
 * Select option for dropdown fields
 */
export const formSelectOptionValidator = v.object({
  value: v.string(),
  label: localizedStringValidator,
});

export type FormSelectOption = Infer<typeof formSelectOptionValidator>;

/**
 * Validation rules for fields
 */
export const formValidationValidator = v.object({
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  pattern: v.optional(v.string()),
  message: v.optional(localizedStringValidator),
});

export type FormValidation = Infer<typeof formValidationValidator>;

/**
 * Conditional logic for showing/hiding fields
 */
export const formConditionValidator = v.object({
  fieldPath: v.string(), // e.g. "section1.fieldName"
  operator: v.union(
    v.literal("equals"),
    v.literal("notEquals"),
    v.literal("contains"),
    v.literal("isEmpty"),
    v.literal("isNotEmpty"),
    v.literal("greaterThan"),
    v.literal("lessThan"),
  ),
  value: v.optional(v.any()),
});

export type FormCondition = Infer<typeof formConditionValidator>;

/**
 * Single form field definition
 */
export const formFieldValidator = v.object({
  id: v.string(),
  type: formFieldTypeValidator,
  label: localizedStringValidator,
  description: v.optional(localizedStringValidator),
  placeholder: v.optional(localizedStringValidator),
  required: v.boolean(),
  options: v.optional(v.array(formSelectOptionValidator)),
  validation: v.optional(formValidationValidator),
  conditions: v.optional(v.array(formConditionValidator)),
  conditionLogic: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
});

export type FormField = Infer<typeof formFieldValidator>;

/**
 * Form section containing multiple fields
 */
export const formSectionValidator = v.object({
  id: v.string(),
  title: localizedStringValidator,
  description: v.optional(localizedStringValidator),
  fields: v.array(formFieldValidator),
  conditions: v.optional(v.array(formConditionValidator)),
  conditionLogic: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
});

export type FormSection = Infer<typeof formSectionValidator>;

/**
 * Complete form schema structure
 * Used in OrgService.formSchema field
 */
export const formSchemaValidator = v.object({
  sections: v.array(formSectionValidator),
  showRecap: v.optional(v.boolean()), // Show confirmation step before submit
});

export type FormSchema = Infer<typeof formSchemaValidator>;

// Passport info
export const passportInfoValidator = v.object({
  number: v.string(),
  issueDate: v.number(),
  expiryDate: v.number(),
  issuingAuthority: v.string(),
});

export type PassportInfo = Infer<typeof passportInfoValidator>;

// Emergency contact
export const emergencyContactValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),
  relationship: familyLinkValidator,
});

export type EmergencyContact = Infer<typeof emergencyContactValidator>;

// Parent info
export const parentValidator = v.object({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
});

export type Parent = Infer<typeof parentValidator>;

// Spouse info
export const spouseValidator = v.object({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
});

export type Spouse = Infer<typeof spouseValidator>;

// Profile identity
export const identityValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  birthDate: v.number(),
  birthPlace: v.string(),
  birthCountry: v.string(),
  gender: genderValidator,
  nationality: v.string(),
  nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
});

export type Identity = Infer<typeof identityValidator>;

// Profile addresses
export const profileAddressesValidator = v.object({
  residence: v.optional(addressValidator),
  homeland: v.optional(addressValidator),
});

export type ProfileAddresses = Infer<typeof profileAddressesValidator>;

// Profile contacts
export const profileContactsValidator = v.object({
  phone: v.optional(v.string()),
  phoneAbroad: v.optional(v.string()), 
  email: v.optional(v.string()),
  emergencyHomeland: v.optional(emergencyContactValidator),
  emergencyResidence: v.optional(emergencyContactValidator),
});

export type ProfileContacts = Infer<typeof profileContactsValidator>;

// Profile family
export const profileFamilyValidator = v.object({
  maritalStatus: v.optional(maritalStatusValidator),
  father: v.optional(parentValidator),
  mother: v.optional(parentValidator),
  spouse: v.optional(spouseValidator),
});

export type ProfileFamily = Infer<typeof profileFamilyValidator>;

// Profile profession
export const professionValidator = v.object({
  status: v.optional(professionStatusValidator),
  title: v.optional(v.string()),
  employer: v.optional(v.string()),
});

export type Profession = Infer<typeof professionValidator>;

// ============================================================================
// POST VALIDATORS
// ============================================================================


export const postCategoryValidator = v.union(
  v.literal(PostCategory.News),
  v.literal(PostCategory.Event),
  v.literal(PostCategory.Announcement),
  v.literal(PostCategory.Other)
);

export const postStatusValidator = v.union(
  v.literal(PostStatus.Draft),
  v.literal(PostStatus.Published),
  v.literal(PostStatus.Archived)
);