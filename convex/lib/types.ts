import { v } from "convex/values";






export enum OrgType {
  CONSULATE = "consulate",
  CONSULATE_GENERAL = "consulate_general",
  HONORARY_CONSULATE = "honorary_consulate",
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





export const orgTypeValidator = v.union(
  v.literal(OrgType.CONSULATE),
  v.literal(OrgType.CONSULATE_GENERAL),
  v.literal(OrgType.HONORARY_CONSULATE),
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

export const dayOpeningHoursValidator = v.object({
  open: v.string(),
  close: v.string(),
});


export enum CountryCode {
  AD = "AD",
  AE = "AE",
  AF = "AF",
  AG = "AG",
  AI = "AI",
  AL = "AL",
  AM = "AM",
  AO = "AO",
  AQ = "AQ",
  AR = "AR",
  AS = "AS",
  AT = "AT",
  AU = "AU",
  AW = "AW",
  AX = "AX",
  AZ = "AZ",

  BA = "BA",
  BB = "BB",
  BD = "BD",
  BE = "BE",
  BF = "BF",
  BG = "BG",
  BH = "BH",
  BI = "BI",
  BJ = "BJ",
  BL = "BL",
  BM = "BM",
  BN = "BN",
  BO = "BO",
  BR = "BR",
  BS = "BS",
  BT = "BT",
  BW = "BW",
  BY = "BY",
  BZ = "BZ",

  CA = "CA",
  CD = "CD",
  CF = "CF",
  CG = "CG",
  CH = "CH",
  CI = "CI",
  CL = "CL",
  CM = "CM",
  CN = "CN",
  CO = "CO",
  CR = "CR",
  CU = "CU",
  CV = "CV",
  CY = "CY",
  CZ = "CZ",

  DE = "DE",
  DK = "DK",
  DO = "DO",
  DZ = "DZ",

  EC = "EC",
  EE = "EE",
  EG = "EG",
  ER = "ER",
  ES = "ES",
  ET = "ET",

  FI = "FI",
  FJ = "FJ",
  FR = "FR",

  GA = "GA",
  GB = "GB",
  GE = "GE",
  GH = "GH",
  GM = "GM",
  GN = "GN",
  GQ = "GQ",
  GR = "GR",
  GT = "GT",
  GW = "GW",

  HK = "HK",
  HN = "HN",
  HR = "HR",
  HT = "HT",
  HU = "HU",

  ID = "ID",
  IE = "IE",
  IL = "IL",
  IN = "IN",
  IQ = "IQ",
  IR = "IR",
  IS = "IS",
  IT = "IT",

  JP = "JP",

  KE = "KE",
  KG = "KG",
  KH = "KH",
  KR = "KR",
  KW = "KW",

  LA = "LA",
  LB = "LB",
  LK = "LK",
  LR = "LR",
  LT = "LT",
  LU = "LU",
  LV = "LV",
  LY = "LY",

  MA = "MA",
  MC = "MC",
  MD = "MD",
  MG = "MG",
  ML = "ML",
  MM = "MM",
  MN = "MN",
  MR = "MR",
  MT = "MT",
  MU = "MU",
  MX = "MX",
  MY = "MY",
  MZ = "MZ",

  NA = "NA",
  NE = "NE",
  NG = "NG",
  NL = "NL",
  NO = "NO",
  NP = "NP",
  NZ = "NZ",

  OM = "OM",

  PA = "PA",
  PE = "PE",
  PH = "PH",
  PK = "PK",
  PL = "PL",
  PT = "PT",

  QA = "QA",

  RO = "RO",
  RS = "RS",
  RU = "RU",
  RW = "RW",

  SA = "SA",
  SD = "SD",
  SE = "SE",
  SG = "SG",
  SI = "SI",
  SK = "SK",
  SN = "SN",
  SO = "SO",
  SS = "SS",
  SY = "SY",

  TH = "TH",
  TN = "TN",
  TR = "TR",
  TZ = "TZ",

  UA = "UA",
  UG = "UG",
  US = "US",
  UY = "UY",
  UZ = "UZ",

  VE = "VE",
  VN = "VN",

  YE = "YE",
  ZA = "ZA",
  ZM = "ZM",
  ZW = "ZW"
}

function enumToUnion(enumObject: Record<string, string>) {
  return v.union(...Object.values(enumObject).map((value) => v.literal(value)));
}

export const countyCodeValidator = enumToUnion(CountryCode);





export const addressValidator = v.object({
  street: v.string(),
  street2: v.optional(v.string()),
  city: v.string(),
  postalCode: v.string(),
  state: v.optional(v.string()),
  country: countyCodeValidator,
});

export type Address = {
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  state?: string;
  country: CountryCode;
};

export const openingHoursValidator = v.object({
  monday: v.optional(dayOpeningHoursValidator),
  tuesday: v.optional(dayOpeningHoursValidator),
  wednesday: v.optional(dayOpeningHoursValidator),
  thursday: v.optional(dayOpeningHoursValidator),
  friday: v.optional(dayOpeningHoursValidator),
  saturday: v.optional(dayOpeningHoursValidator),
  sunday: v.optional(dayOpeningHoursValidator),
});

export type DayHours = typeof dayOpeningHoursValidator;

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

export function formatAddress(address: Address): string {
  const parts = [address.street];
  if (address.street2) parts.push(address.street2);
  parts.push(`${address.postalCode} ${address.city}`);
  if (address.state) parts.push(address.state);
  parts.push(address.country);
  return parts.join(", ");
}
