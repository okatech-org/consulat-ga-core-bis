import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  addressValidator,
  countryCodeValidator,
  emergencyContactValidator,
  genderValidator,
  maritalStatusValidator,
  nationalityAcquisitionValidator,
  workStatusValidator,
} from "../lib/validators";

export const consularProfilesTable = defineTable({
  userId: v.id("users"),


  isNational: v.boolean(),
  nationality: countryCodeValidator,
  status: v.string(), 


  personal: v.object({
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    birthCountry: v.optional(countryCodeValidator),
    gender: v.optional(genderValidator),
    maritalStatus: v.optional(maritalStatusValidator),
    acquisitionMode: v.optional(nationalityAcquisitionValidator),
    nipCode: v.optional(v.string()),
    passportInfos: v.optional(
      v.object({
        number: v.optional(v.string()),
        issueDate: v.optional(v.number()),
        expiryDate: v.optional(v.number()),
        issueAuthority: v.optional(v.string()),
      }),
    ),
  }),


  contacts: v.object({

    email: v.optional(v.string()),
    

    phoneHome: v.optional(v.string()),
    addressHome: v.optional(addressValidator),


    phoneAbroad: v.optional(v.string()),
    addressAbroad: v.optional(addressValidator),
  }),


  family: v.object({
    father: v.optional(v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
    })),
    mother: v.optional(v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
    })),
    spouse: v.optional(v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
    })),
  }),


  professionSituation: v.object({
    workStatus: v.optional(workStatusValidator),
    profession: v.optional(v.string()),
    employer: v.optional(v.string()),
    employerAddress: v.optional(v.string()),
    activityInGabon: v.optional(v.string()), 
  }),


  emergencyContacts: v.array(emergencyContactValidator),


  documents: v.object({
    passport: v.optional(v.array(v.id("documents"))),
    nationalId: v.optional(v.array(v.id("documents"))),
    birthCertificate: v.optional(v.array(v.id("documents"))),
    residencePermit: v.optional(v.array(v.id("documents"))),
    proofOfAddress: v.optional(v.array(v.id("documents"))),
    photo: v.optional(v.array(v.id("documents"))),

    otherDocs: v.optional(v.array(v.id("documents"))),
  }),


  registrations: v.array(v.object({
    orgId: v.id("orgs"),
    registrationNumber: v.string(),
    registeredAt: v.number(),
    status: v.string(), 
    cardDetails: v.optional(v.object({
        cardNumber: v.optional(v.string()),
        cardIssuedAt: v.optional(v.number()),
        cardExpiresAt: v.optional(v.number()),
    }))
  })),

  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_nationality", ["nationality"]);
