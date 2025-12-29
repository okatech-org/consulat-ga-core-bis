import { v } from "convex/values";

// ============================================
// ENUMS - Used as both values and types
// ============================================

export enum OrgType {
  CONSULATE = "consulate",
  EMBASSY = "embassy",
  MINISTRY = "ministry",
  OTHER = "other",
}

export enum OrgMemberRole {
  ADMIN = "admin",
  AGENT = "agent",
  VIEWER = "viewer",
}

export enum ServiceCategory {
  PASSPORT = "passport",
  VISA = "visa",
  CIVIL_STATUS = "civil_status",
  REGISTRATION = "registration",
  LEGALIZATION = "legalization",
  EMERGENCY = "emergency",
  OTHER = "other",
}

export enum RequestStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  PROCESSING = "processing",
  PENDING_DOCUMENTS = "pending_documents",
  PENDING_PAYMENT = "pending_payment",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum RequestPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum DocumentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
}

export enum UserRole {
  USER = "user",
  SUPERADMIN = "superadmin",
}

export enum AuditAction {
  USER_CREATED = "user_created",
  USER_UPDATED = "user_updated",
  USER_DISABLED = "user_disabled",
  USER_ROLE_CHANGED = "user_role_changed",
  ORG_CREATED = "org_created",
  ORG_UPDATED = "org_updated",
  ORG_DISABLED = "org_disabled",
  SERVICE_CREATED = "service_created",
  SERVICE_UPDATED = "service_updated",
  REQUEST_STATUS_CHANGED = "request_status_changed",
}

// ============================================
// VALIDATORS - Explicit unions for proper types
// ============================================

export const orgTypeValidator = v.union(
  v.literal(OrgType.CONSULATE),
  v.literal(OrgType.EMBASSY),
  v.literal(OrgType.MINISTRY),
  v.literal(OrgType.OTHER)
);

export const orgMemberRoleValidator = v.union(
  v.literal(OrgMemberRole.ADMIN),
  v.literal(OrgMemberRole.AGENT),
  v.literal(OrgMemberRole.VIEWER)
);

export const serviceCategoryValidator = v.union(
  v.literal(ServiceCategory.PASSPORT),
  v.literal(ServiceCategory.VISA),
  v.literal(ServiceCategory.CIVIL_STATUS),
  v.literal(ServiceCategory.REGISTRATION),
  v.literal(ServiceCategory.LEGALIZATION),
  v.literal(ServiceCategory.EMERGENCY),
  v.literal(ServiceCategory.OTHER)
);

export const requestStatusValidator = v.union(
  v.literal(RequestStatus.DRAFT),
  v.literal(RequestStatus.SUBMITTED),
  v.literal(RequestStatus.UNDER_REVIEW),
  v.literal(RequestStatus.PROCESSING),
  v.literal(RequestStatus.PENDING_DOCUMENTS),
  v.literal(RequestStatus.PENDING_PAYMENT),
  v.literal(RequestStatus.COMPLETED),
  v.literal(RequestStatus.REJECTED),
  v.literal(RequestStatus.CANCELLED)
);

export const requestPriorityValidator = v.union(
  v.literal(RequestPriority.LOW),
  v.literal(RequestPriority.NORMAL),
  v.literal(RequestPriority.HIGH),
  v.literal(RequestPriority.URGENT)
);

export const documentStatusValidator = v.union(
  v.literal(DocumentStatus.PENDING),
  v.literal(DocumentStatus.APPROVED),
  v.literal(DocumentStatus.REJECTED)
);

export const appointmentStatusValidator = v.union(
  v.literal(AppointmentStatus.SCHEDULED),
  v.literal(AppointmentStatus.CONFIRMED),
  v.literal(AppointmentStatus.CANCELLED),
  v.literal(AppointmentStatus.COMPLETED),
  v.literal(AppointmentStatus.NO_SHOW)
);

export const userRoleValidator = v.union(
  v.literal(UserRole.USER),
  v.literal(UserRole.SUPERADMIN)
);

export const auditActionValidator = v.union(
  v.literal(AuditAction.USER_CREATED),
  v.literal(AuditAction.USER_UPDATED),
  v.literal(AuditAction.USER_DISABLED),
  v.literal(AuditAction.USER_ROLE_CHANGED),
  v.literal(AuditAction.ORG_CREATED),
  v.literal(AuditAction.ORG_UPDATED),
  v.literal(AuditAction.ORG_DISABLED),
  v.literal(AuditAction.SERVICE_CREATED),
  v.literal(AuditAction.SERVICE_UPDATED),
  v.literal(AuditAction.REQUEST_STATUS_CHANGED)
);

// ============================================
// SHARED OBJECT SCHEMAS
// ============================================

export const addressValidator = v.object({
  street: v.string(),
  street2: v.optional(v.string()),
  city: v.string(),
  postalCode: v.string(),
  state: v.optional(v.string()),
  country: v.string(),
});

export type Address = {
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  state?: string;
  country: string;
};

export const openingHoursValidator = v.object({
  monday: v.optional(v.object({ open: v.string(), close: v.string() })),
  tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
  wednesday: v.optional(v.object({ open: v.string(), close: v.string() })),
  thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
  friday: v.optional(v.object({ open: v.string(), close: v.string() })),
  saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
  sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
});

export type DayHours = { open: string; close: string };
export type OpeningHours = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

export const requiredDocumentValidator = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  isRequired: v.boolean(),
});

export type RequiredDocument = {
  name: string;
  description?: string;
  isRequired: boolean;
};

export const phoneNumberValidator = v.object({
  countryCode: v.string(),
  number: v.string(),
});

export type PhoneNumber = {
  countryCode: string;
  number: string;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getServiceCategoryLabel(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    [ServiceCategory.PASSPORT]: "Passeport",
    [ServiceCategory.VISA]: "Visa",
    [ServiceCategory.CIVIL_STATUS]: "État Civil",
    [ServiceCategory.REGISTRATION]: "Inscription Consulaire",
    [ServiceCategory.LEGALIZATION]: "Légalisation",
    [ServiceCategory.EMERGENCY]: "Assistance d'Urgence",
    [ServiceCategory.OTHER]: "Autre",
  };
  return labels[category];
}

export function getRequestStatusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    [RequestStatus.DRAFT]: "Brouillon",
    [RequestStatus.SUBMITTED]: "Soumis",
    [RequestStatus.UNDER_REVIEW]: "En cours d'examen",
    [RequestStatus.PROCESSING]: "En traitement",
    [RequestStatus.PENDING_DOCUMENTS]: "Documents en attente",
    [RequestStatus.PENDING_PAYMENT]: "Paiement en attente",
    [RequestStatus.COMPLETED]: "Terminé",
    [RequestStatus.REJECTED]: "Rejeté",
    [RequestStatus.CANCELLED]: "Annulé",
  };
  return labels[status];
}

export function getOrgTypeLabel(type: OrgType): string {
  const labels: Record<OrgType, string> = {
    [OrgType.CONSULATE]: "Consulat",
    [OrgType.EMBASSY]: "Ambassade",
    [OrgType.MINISTRY]: "Ministère",
    [OrgType.OTHER]: "Autre",
  };
  return labels[type];
}

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: "Programmé",
    [AppointmentStatus.CONFIRMED]: "Confirmé",
    [AppointmentStatus.CANCELLED]: "Annulé",
    [AppointmentStatus.COMPLETED]: "Terminé",
    [AppointmentStatus.NO_SHOW]: "Absent",
  };
  return labels[status];
}

export function formatAddress(address: Address): string {
  const parts = [address.street];
  if (address.street2) parts.push(address.street2);
  parts.push(`${address.postalCode} ${address.city}`);
  if (address.state) parts.push(address.state);
  parts.push(address.country);
  return parts.join(", ");
}
