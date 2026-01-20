import { v } from "convex/values";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const OrgType = {
  EMBASSY: "embassy",
  CONSULATE: "consulate",
  HONORARY: "honorary",
} as const;
export type OrgType = (typeof OrgType)[keyof typeof OrgType];

export const MemberRole = {
  ADMIN: "admin",
  AGENT: "agent",
  VIEWER: "viewer",
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];
export const OrgMemberRole = MemberRole;
export type OrgMemberRole = MemberRole;

export const RequestStatus = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  PENDING_DOCUMENTS: "pending_documents",
  PENDING_PAYMENT: "pending_payment",
  PROCESSING: "processing",
  READY_FOR_PICKUP: "ready_for_pickup",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const RequestPriority = {
  NORMAL: "normal",
  URGENT: "urgent",
} as const;
export type RequestPriority = (typeof RequestPriority)[keyof typeof RequestPriority];

export const DocumentStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const Gender = {
  MALE: "M",
  FEMALE: "F",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const ServiceCategory = {
  IDENTITY: "identity",
  CIVIL_STATUS: "civil_status",
  VISA: "visa",
  CERTIFICATION: "certification",
  REGISTRATION: "registration",
  ASSISTANCE: "assistance",
  OTHER: "other",
} as const;
export type ServiceCategory = (typeof ServiceCategory)[keyof typeof ServiceCategory];

export const EventType = {
  // Request lifecycle
  REQUEST_CREATED: "request_created",
  REQUEST_SUBMITTED: "request_submitted",
  STATUS_CHANGED: "status_changed",
  ASSIGNED: "assigned",
  NOTE_ADDED: "note_added",
  // Documents
  DOCUMENT_UPLOADED: "document_uploaded",
  DOCUMENT_VALIDATED: "document_validated",
  DOCUMENT_REJECTED: "document_rejected",
  // Profile
  PROFILE_UPDATED: "profile_updated",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

// ============================================================================
// VALIDATORS
// ============================================================================

// Org types
export const orgTypeValidator = v.union(
  v.literal(OrgType.EMBASSY),
  v.literal(OrgType.CONSULATE),
  v.literal(OrgType.HONORARY)
);

// Member roles
export const memberRoleValidator = v.union(
  v.literal(MemberRole.ADMIN),
  v.literal(MemberRole.AGENT),
  v.literal(MemberRole.VIEWER)
);

// Request status
export const requestStatusValidator = v.union(
  v.literal(RequestStatus.DRAFT),
  v.literal(RequestStatus.SUBMITTED),
  v.literal(RequestStatus.UNDER_REVIEW),
  v.literal(RequestStatus.PENDING_DOCUMENTS),
  v.literal(RequestStatus.PENDING_PAYMENT),
  v.literal(RequestStatus.PROCESSING),
  v.literal(RequestStatus.READY_FOR_PICKUP),
  v.literal(RequestStatus.COMPLETED),
  v.literal(RequestStatus.REJECTED),
  v.literal(RequestStatus.CANCELLED)
);

// Request priority
export const requestPriorityValidator = v.union(
  v.literal(RequestPriority.NORMAL),
  v.literal(RequestPriority.URGENT)
);

// Document status
export const documentStatusValidator = v.union(
  v.literal(DocumentStatus.PENDING),
  v.literal(DocumentStatus.APPROVED),
  v.literal(DocumentStatus.REJECTED)
);

// Gender
export const genderValidator = v.union(
  v.literal(Gender.MALE),
  v.literal(Gender.FEMALE)
);

// Service category
export const serviceCategoryValidator = v.union(
  v.literal(ServiceCategory.IDENTITY),
  v.literal(ServiceCategory.CIVIL_STATUS),
  v.literal(ServiceCategory.VISA),
  v.literal(ServiceCategory.CERTIFICATION),
  v.literal(ServiceCategory.REGISTRATION),
  v.literal(ServiceCategory.ASSISTANCE),
  v.literal(ServiceCategory.OTHER)
);

// Owner type for documents
export const ownerTypeValidator = v.union(
  v.literal("profile"),
  v.literal("request")
);

// Event target type
export const eventTargetTypeValidator = v.union(
  v.literal("request"),
  v.literal("profile"),
  v.literal("document")
);

// ============================================================================
// SHARED OBJECT VALIDATORS
// ============================================================================

// Address
export const addressValidator = v.object({
  street: v.string(),
  city: v.string(),
  postalCode: v.string(),
  country: v.string(),
  coordinates: v.optional(
    v.object({
      lat: v.number(),
      lng: v.number(),
    })
  ),
});

// Working hours slot
export const timeSlotValidator = v.object({
  start: v.string(), // "09:00"
  end: v.string(), // "17:00"
});

// Org settings
export const orgSettingsValidator = v.object({
  appointmentBuffer: v.number(),
  maxActiveRequests: v.number(),
  workingHours: v.record(v.string(), v.array(timeSlotValidator)),
});

// Org stats (computed)
export const orgStatsValidator = v.object({
  memberCount: v.number(),
  pendingRequests: v.number(),
  activeServices: v.number(),
  updatedAt: v.number(),
});

// Pricing
export const pricingValidator = v.object({
  amount: v.number(),
  currency: v.string(),
});

// Required document definition
export const requiredDocumentValidator = v.object({
  type: v.string(),
  label: v.string(),
  required: v.boolean(),
});

// Localized string
export const localizedStringValidator = v.object({
  fr: v.string(),
  en: v.optional(v.string()),
});

// Service defaults
export const serviceDefaultsValidator = v.object({
  estimatedDays: v.number(),
  requiresAppointment: v.boolean(),
  requiredDocuments: v.array(requiredDocumentValidator),
});

// Passport info
export const passportInfoValidator = v.object({
  number: v.string(),
  issueDate: v.number(),
  expiryDate: v.number(),
  issuingAuthority: v.string(),
});

// Emergency contact
export const emergencyContactValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  relationship: v.string(),
});

// Parent info
export const parentValidator = v.object({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
});

// Spouse info
export const spouseValidator = v.object({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
});

// Profile identity
export const identityValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  birthDate: v.number(),
  birthPlace: v.string(),
  birthCountry: v.string(),
  gender: genderValidator,
  nationality: v.string(),
  nationalityAcquisition: v.optional(v.string()),
});

// Profile addresses
export const profileAddressesValidator = v.object({
  residence: v.optional(addressValidator),
  homeland: v.optional(addressValidator),
});

// Profile contacts
export const profileContactsValidator = v.object({
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  emergency: v.array(emergencyContactValidator),
});

// Profile family
export const profileFamilyValidator = v.object({
  maritalStatus: v.string(),
  father: v.optional(parentValidator),
  mother: v.optional(parentValidator),
  spouse: v.optional(spouseValidator),
});

// Profile profession
export const professionValidator = v.object({
  status: v.string(),
  title: v.optional(v.string()),
  employer: v.optional(v.string()),
});
