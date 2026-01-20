import { v } from "convex/values";
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
} from "./constants";

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
  v.literal(RequestStatus.Submitted),
  v.literal(RequestStatus.UnderReview),
  v.literal(RequestStatus.Pending), 
  v.literal(RequestStatus.PendingCompletion),
  v.literal(RequestStatus.Edited),
  v.literal(RequestStatus.InProduction),
  v.literal(RequestStatus.Validated),
  v.literal(RequestStatus.Rejected),
  v.literal(RequestStatus.ReadyForPickup),
  v.literal(RequestStatus.AppointmentScheduled),
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
  isOpen: v.optional(v.boolean()),
});

// Org settings
export const orgSettingsValidator = v.object({
  appointmentBuffer: v.number(),
  maxActiveRequests: v.number(),
  workingHours: v.record(v.string(), v.array(timeSlotValidator)),
});

// Org stats
export const orgStatsValidator = v.object({
  memberCount: v.number(),
  pendingRequests: v.number(),
  activeServices: v.number(),
  upcomingAppointments: v.number(),
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
  phone: v.string(),
  email: v.optional(v.string()),
  relationship: familyLinkValidator,
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
  nationalityAcquisition: v.optional(nationalityAcquisitionValidator),
});

// Profile addresses
export const profileAddressesValidator = v.object({
  residence: v.optional(addressValidator),
  homeland: v.optional(addressValidator),
});

// Profile contacts
export const profileContactsValidator = v.object({
  phone: v.optional(v.string()),
  phoneAbroad: v.optional(v.string()), 
  email: v.optional(v.string()),
  emergency: v.optional(v.array(emergencyContactValidator)),
});

// Profile family
export const profileFamilyValidator = v.object({
  maritalStatus: v.optional(maritalStatusValidator),
  father: v.optional(parentValidator),
  mother: v.optional(parentValidator),
  spouse: v.optional(spouseValidator),
});

// Profile profession
export const professionValidator = v.object({
  status: v.optional(professionStatusValidator),
  title: v.optional(v.string()),
  employer: v.optional(v.string()),
});

export const countryCodeValidator = v.union(
  v.literal(CountryCode.AD),
  v.literal(CountryCode.AE),
  v.literal(CountryCode.AF),
  v.literal(CountryCode.AG),
  v.literal(CountryCode.AI),
  v.literal(CountryCode.AL),
  v.literal(CountryCode.AM),
  v.literal(CountryCode.AO),
  v.literal(CountryCode.AQ),
  v.literal(CountryCode.AR),
  v.literal(CountryCode.AS),
  v.literal(CountryCode.AT),
  v.literal(CountryCode.AU),
  v.literal(CountryCode.AW),
  v.literal(CountryCode.AX),
  v.literal(CountryCode.AZ),
  v.literal(CountryCode.BA),
  v.literal(CountryCode.BB),
  v.literal(CountryCode.BD),
  v.literal(CountryCode.BE),
  v.literal(CountryCode.BF),
  v.literal(CountryCode.BG),
  v.literal(CountryCode.BH),
  v.literal(CountryCode.BI),
  v.literal(CountryCode.BJ),
  v.literal(CountryCode.BL),
  v.literal(CountryCode.BM),
  v.literal(CountryCode.BN),
  v.literal(CountryCode.BO),
  v.literal(CountryCode.BR),
  v.literal(CountryCode.BS),
  v.literal(CountryCode.BT),
  v.literal(CountryCode.BW),
  v.literal(CountryCode.BY),
  v.literal(CountryCode.BZ),
  v.literal(CountryCode.CA),
  v.literal(CountryCode.CC),
  v.literal(CountryCode.CD),
  v.literal(CountryCode.CF),
  v.literal(CountryCode.CG),
  v.literal(CountryCode.CH),
  v.literal(CountryCode.CI),
  v.literal(CountryCode.CK),
  v.literal(CountryCode.CL),
  v.literal(CountryCode.CM),
  v.literal(CountryCode.CN),
  v.literal(CountryCode.CO),
  v.literal(CountryCode.CR),
  v.literal(CountryCode.CU),
  v.literal(CountryCode.CV),
  v.literal(CountryCode.CX),
  v.literal(CountryCode.CY),
  v.literal(CountryCode.CZ),
  v.literal(CountryCode.DE),
  v.literal(CountryCode.DJ),
  v.literal(CountryCode.DK),
  v.literal(CountryCode.DM),
  v.literal(CountryCode.DO),
  v.literal(CountryCode.DZ),
  v.literal(CountryCode.EC),
  v.literal(CountryCode.EE),
  v.literal(CountryCode.EG),
  v.literal(CountryCode.ER),
  v.literal(CountryCode.ES),
  v.literal(CountryCode.ET),
  v.literal(CountryCode.FI),
  v.literal(CountryCode.FJ),
  v.literal(CountryCode.FK),
  v.literal(CountryCode.FM),
  v.literal(CountryCode.FO),
  v.literal(CountryCode.FR),
  v.literal(CountryCode.GA),
  v.literal(CountryCode.GB),
  v.literal(CountryCode.GD),
  v.literal(CountryCode.GE),
  v.literal(CountryCode.GF),
  v.literal(CountryCode.GG),
  v.literal(CountryCode.GH),
  v.literal(CountryCode.GI),
  v.literal(CountryCode.GL),
  v.literal(CountryCode.GM),
  v.literal(CountryCode.GN),
  v.literal(CountryCode.GP),
  v.literal(CountryCode.GQ),
  v.literal(CountryCode.GR),
  v.literal(CountryCode.GS),
  v.literal(CountryCode.GT),
  v.literal(CountryCode.GU),
  v.literal(CountryCode.GW),
  v.literal(CountryCode.GY),
  v.literal(CountryCode.HK),
  v.literal(CountryCode.HN),
  v.literal(CountryCode.HR),
  v.literal(CountryCode.HT),
  v.literal(CountryCode.HU),
  v.literal(CountryCode.ID),
  v.literal(CountryCode.IE),
  v.literal(CountryCode.IL),
  v.literal(CountryCode.IM),
  v.literal(CountryCode.IN),
  v.literal(CountryCode.IO),
  v.literal(CountryCode.IQ),
  v.literal(CountryCode.IR),
  v.literal(CountryCode.IS),
  v.literal(CountryCode.IT),
  v.literal(CountryCode.JE),
  v.literal(CountryCode.JM),
  v.literal(CountryCode.JO),
  v.literal(CountryCode.JP),
  v.literal(CountryCode.KE),
  v.literal(CountryCode.KG),
  v.literal(CountryCode.KH),
  v.literal(CountryCode.KI),
  v.literal(CountryCode.KM),
  v.literal(CountryCode.KN),
  v.literal(CountryCode.KP),
  v.literal(CountryCode.KR),
  v.literal(CountryCode.KW),
  v.literal(CountryCode.KY),
  v.literal(CountryCode.KZ),
  v.literal(CountryCode.LA),
  v.literal(CountryCode.LB),
  v.literal(CountryCode.LC),
  v.literal(CountryCode.LI),
  v.literal(CountryCode.LK),
  v.literal(CountryCode.LR),
  v.literal(CountryCode.LS),
  v.literal(CountryCode.LT),
  v.literal(CountryCode.LU),
  v.literal(CountryCode.LV),
  v.literal(CountryCode.LY),
  v.literal(CountryCode.MA),
  v.literal(CountryCode.MC),
  v.literal(CountryCode.MD),
  v.literal(CountryCode.ME),
  v.literal(CountryCode.MF),
  v.literal(CountryCode.MG),
  v.literal(CountryCode.MH),
  v.literal(CountryCode.MK),
  v.literal(CountryCode.ML),
  v.literal(CountryCode.MM),
  v.literal(CountryCode.MN),
  v.literal(CountryCode.MO),
  v.literal(CountryCode.MP),
  v.literal(CountryCode.MQ),
  v.literal(CountryCode.MR),
  v.literal(CountryCode.MS),
  v.literal(CountryCode.MT),
  v.literal(CountryCode.MU),
  v.literal(CountryCode.MV),
  v.literal(CountryCode.MW),
  v.literal(CountryCode.MX),
  v.literal(CountryCode.MY),
  v.literal(CountryCode.MZ),
  v.literal(CountryCode.NA),
  v.literal(CountryCode.NC),
  v.literal(CountryCode.NE),
  v.literal(CountryCode.NF),
  v.literal(CountryCode.NG),
  v.literal(CountryCode.NI),
  v.literal(CountryCode.NL),
  v.literal(CountryCode.NO),
  v.literal(CountryCode.NP),
  v.literal(CountryCode.NR),
  v.literal(CountryCode.NU),
  v.literal(CountryCode.NZ),
  v.literal(CountryCode.OM),
  v.literal(CountryCode.PA),
  v.literal(CountryCode.PE),
  v.literal(CountryCode.PF),
  v.literal(CountryCode.PG),
  v.literal(CountryCode.PH),
  v.literal(CountryCode.PK),
  v.literal(CountryCode.PL),
  v.literal(CountryCode.PM),
  v.literal(CountryCode.PN),
  v.literal(CountryCode.PR),
  v.literal(CountryCode.PS),
  v.literal(CountryCode.PT),
  v.literal(CountryCode.PW),
  v.literal(CountryCode.PY),
  v.literal(CountryCode.QA),
  v.literal(CountryCode.RE),
  v.literal(CountryCode.RO),
  v.literal(CountryCode.RS),
  v.literal(CountryCode.RU),
  v.literal(CountryCode.RW),
  v.literal(CountryCode.SA),
  v.literal(CountryCode.SB),
  v.literal(CountryCode.SC),
  v.literal(CountryCode.SD),
  v.literal(CountryCode.SE),
  v.literal(CountryCode.SG),
  v.literal(CountryCode.SH),
  v.literal(CountryCode.SI),
  v.literal(CountryCode.SJ),
  v.literal(CountryCode.SK),
  v.literal(CountryCode.SL),
  v.literal(CountryCode.SM),
  v.literal(CountryCode.SN),
  v.literal(CountryCode.SO),
  v.literal(CountryCode.SR),
  v.literal(CountryCode.SS),
  v.literal(CountryCode.ST),
  v.literal(CountryCode.SV),
  v.literal(CountryCode.SY),
  v.literal(CountryCode.SZ),
  v.literal(CountryCode.TC),
  v.literal(CountryCode.TD),
  v.literal(CountryCode.TG),
  v.literal(CountryCode.TH),
  v.literal(CountryCode.TJ),
  v.literal(CountryCode.TK),
  v.literal(CountryCode.TL),
  v.literal(CountryCode.TM),
  v.literal(CountryCode.TN),
  v.literal(CountryCode.TO),
  v.literal(CountryCode.TR),
  v.literal(CountryCode.TT),
  v.literal(CountryCode.TV),
  v.literal(CountryCode.TW),
  v.literal(CountryCode.TZ),
  v.literal(CountryCode.UA),
  v.literal(CountryCode.UG),
  v.literal(CountryCode.US),
  v.literal(CountryCode.UY),
  v.literal(CountryCode.UZ),
  v.literal(CountryCode.VA),
  v.literal(CountryCode.VC),
  v.literal(CountryCode.VE),
  v.literal(CountryCode.VG),
  v.literal(CountryCode.VI),
  v.literal(CountryCode.VN),
  v.literal(CountryCode.VU),
  v.literal(CountryCode.WF),
  v.literal(CountryCode.WS),
  v.literal(CountryCode.YE),
  v.literal(CountryCode.YT),
  v.literal(CountryCode.ZA),
  v.literal(CountryCode.ZM),
  v.literal(CountryCode.ZW)
);
  