import { z } from "zod"
import { CountryCode, Gender, NationalityAcquisition, MaritalStatus, FamilyLink } from "@convex/lib/constants"

const inPast = (date: Date) => date < new Date()
const inFuture = (date: Date) => date > new Date()
const isAdult = (date: Date) => {
  const age = new Date().getFullYear() - date.getFullYear()
  return age >= 18
}

const addressSchema = z.object({
  street: z.string().min(1, { message: "errors.profile.addresses.street.required" }),
  city: z.string().min(1, { message: "errors.profile.addresses.city.required" }),
  postalCode: z.string().min(1, { message: "errors.profile.addresses.postalCode.required" }),
  country: z.nativeEnum(CountryCode, { message: "errors.profile.addresses.country.invalid" }),
})

const emergencyContactSchema = z.object({
  firstName: z.string().min(2, { message: "errors.profile.contacts.emergency.firstName.min" }),
  lastName: z.string().min(2, { message: "errors.profile.contacts.emergency.lastName.min" }),
  phone: z.string().min(1, { message: "errors.profile.contacts.emergency.phone.required" }),
  email: z.string().email({ message: "errors.profile.contacts.emergency.email.invalid" }).optional(),
  relationship: z.nativeEnum(FamilyLink, { message: "errors.profile.contacts.emergency.relationship.invalid" }),
})

const parentSchema = z.object({
  firstName: z.string().min(2, { message: "errors.profile.family.parent.firstName.min" }).optional(),
  lastName: z.string().min(2, { message: "errors.profile.family.parent.lastName.min" }).optional(),
})

const spouseSchema = z.object({
  firstName: z.string().min(2, { message: "errors.profile.family.spouse.firstName.min" }).optional(),
  lastName: z.string().min(2, { message: "errors.profile.family.spouse.lastName.min" }).optional(),
})

const passportInfoSchema = z.object({
  number: z.string().min(6, { message: "errors.profile.passportInfo.number.min" }).optional(),
  issueDate: z.date().refine(inPast, { message: "errors.profile.passportInfo.issueDate.past" }).optional(),
  expiryDate: z.date().refine(inFuture, { message: "errors.profile.passportInfo.expiryDate.future" }).optional(),
  issuingAuthority: z.string().min(2, { message: "errors.profile.passportInfo.issuingAuthority.min" }).optional(),
}).refine((data) => {
  if (data.issueDate && data.expiryDate) {
    return data.expiryDate > data.issueDate
  }
  return true
}, {
  message: "errors.profile.passportInfo.expiryDate.afterIssue",
  path: ["expiryDate"],
})

export const profileFormSchema = z.object({
  identity: z.object({
    firstName: z.string().min(2, { message: "errors.profile.identity.firstName.min" }).optional(),
    lastName: z.string().min(2, { message: "errors.profile.identity.lastName.min" }).optional(),
    birthDate: z.date()
      .refine(inPast, { message: "errors.profile.identity.birthDate.past" })
      .refine(isAdult, { message: "errors.profile.identity.birthDate.adult" })
      .optional(),
    birthPlace: z.string().min(2, { message: "errors.profile.identity.birthPlace.min" }).optional(),
    birthCountry: z.nativeEnum(CountryCode, { message: "errors.profile.identity.birthCountry.invalid" }).optional(),
    gender: z.nativeEnum(Gender, { message: "errors.profile.identity.gender.invalid" }).optional(),
    nationality: z.nativeEnum(CountryCode, { message: "errors.profile.identity.nationality.invalid" }).optional(),
    nationalityAcquisition: z.nativeEnum(NationalityAcquisition, { message: "errors.profile.identity.nationalityAcquisition.invalid" }).optional(),
  }),
  passportInfo: passportInfoSchema.optional(),
  addresses: z.object({
    residence: addressSchema.optional(),
    homeland: addressSchema.optional(),
  }),
  contacts: z.object({
    phone: z.string().optional(),
    phoneAbroad: z.string().optional(),
    email: z.string().email({ message: "errors.profile.contacts.email.invalid" }).optional(),
    emergency: z.array(emergencyContactSchema).optional(),
  }),
  family: z.object({
    maritalStatus: z.nativeEnum(MaritalStatus, { message: "errors.profile.family.maritalStatus.invalid" }).optional(),
    father: parentSchema.optional(),
    mother: parentSchema.optional(),
    spouse: spouseSchema.optional(),
  }).superRefine((data, ctx) => {
    if (data.maritalStatus && [MaritalStatus.Married, MaritalStatus.CivilUnion].includes(data.maritalStatus as MaritalStatus)) {
      if (!data.spouse?.firstName || data.spouse.firstName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "errors.profile.family.spouse.firstName.required",
          path: ["spouse", "firstName"],
        })
      }
      if (!data.spouse?.lastName || data.spouse.lastName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "errors.profile.family.spouse.lastName.required",
          path: ["spouse", "lastName"],
        })
      }
    }
  }),
  documents: z.object({
    passport: z.array(z.string()).optional(),
    nationalId: z.array(z.string()).optional(),
    photo: z.array(z.string()).optional(),
    birthCertificate: z.array(z.string()).optional(),
    proofOfAddress: z.array(z.string()).optional(),
    residencePermit: z.array(z.string()).optional(),
  }).optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

// Schémas partiels pour chaque étape
export const identityStepSchema = profileFormSchema.pick({ identity: true, passportInfo: true })
export const contactsStepSchema = profileFormSchema.pick({ addresses: true, contacts: true })
export const familyStepSchema = profileFormSchema.pick({ family: true })
export const documentsStepSchema = profileFormSchema.pick({ documents: true })
