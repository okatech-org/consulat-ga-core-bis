import { z } from "zod"
import { CountryCode, Gender, NationalityAcquisition, MaritalStatus } from "@convex/lib/constants"

const inPast = (date: Date) => date < new Date()
const inFuture = (date: Date) => date > new Date()
const isAdult = (date: Date) => {
  const age = new Date().getFullYear() - date.getFullYear()
  return age >= 18
}

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.enum(CountryCode),
})

const emergencyContactSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  relationship: z.enum(["father", "mother", "spouse", "child", "brother_sister", "legal_guardian", "other"]),
})

const parentSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const spouseSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const passportInfoSchema = z.object({
  number: z.string().min(6).optional(),
  issueDate: z.date().refine(inPast).optional(),
  expiryDate: z.date().refine(inFuture).optional(),
  issuingAuthority: z.string().min(2).optional(),
}).refine((data) => {
  if (data.issueDate && data.expiryDate) {
    return data.expiryDate > data.issueDate
  }
  return true
}, {
  message: "La date d'expiration doit être après la date de délivrance",
  path: ["expiryDate"],
})

export const profileFormSchema = z.object({
  identity: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    birthDate: z.date().refine(inPast).refine(isAdult).optional(),
    birthPlace: z.string().min(2).optional(),
    birthCountry: z.enum(CountryCode).optional(),
    gender: z.enum(Gender).optional(),
    nationality: z.enum(CountryCode).optional(),
    nationalityAcquisition: z.enum(NationalityAcquisition).optional(),
  }),
  passportInfo: passportInfoSchema.optional(),
  addresses: z.object({
    residence: addressSchema.optional(),
    homeland: addressSchema.optional(),
  }),
  contacts: z.object({
    phone: z.string().optional(),
    phoneAbroad: z.string().optional(),
    email: z.string().email().optional(),
    emergency: z.array(emergencyContactSchema).optional(),
  }),
  family: z.object({
    maritalStatus: z.enum(MaritalStatus).optional(),
    father: parentSchema.optional(),
    mother: parentSchema.optional(),
    spouse: spouseSchema.optional(),
  }).superRefine((data, ctx) => {
    if (data.maritalStatus && [MaritalStatus.Married, MaritalStatus.CivilUnion].includes(data.maritalStatus)) {
      if (!data.spouse?.firstName || data.spouse.firstName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Le prénom du conjoint est requis",
          path: ["spouse", "firstName"],
        })
      }
      if (!data.spouse?.lastName || data.spouse.lastName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Le nom du conjoint est requis",
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
