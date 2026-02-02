import { v } from "convex/values";
import { query } from "../_generated/server";
import { authMutation, superadminMutation } from "../lib/customFunctions";
import { requireOrgAdmin } from "../lib/auth";
import { error, ErrorCode } from "../lib/errors";
import {
  serviceCategoryValidator,
  localizedStringValidator,
  pricingValidator,
  formDocumentValidator,
  formSchemaValidator,
  CountryCode,
} from "../lib/validators";

// ============================================================================
// GLOBAL SERVICES CATALOG (Superadmin)
// ============================================================================

/**
 * List all active services in catalog
 */
export const listCatalog = query({
  args: {
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    let services = await ctx.db
      .query("services")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.category) {
      services = services.filter((s) => s.category === args.category);
    }

    return services;
  },
});

/**
 * Get service by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get service by ID
 */
export const getById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId);
  },
});

/**
 * Create a new service (superadmin only)
 */
export const create = superadminMutation({
  args: {
    slug: v.string(),
    code: v.string(),
    name: localizedStringValidator,
    description: localizedStringValidator,
    content: v.optional(localizedStringValidator),
    category: serviceCategoryValidator,
    icon: v.optional(v.string()),
    estimatedDays: v.number(),
    requiresAppointment: v.boolean(),
    requiredDocuments: v.array(formDocumentValidator),
  },
  handler: async (ctx, args) => {
    // Check slug uniqueness
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw error(ErrorCode.SERVICE_SLUG_EXISTS);
    }

    return await ctx.db.insert("services", {
      ...args,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a service (superadmin only)
 */
export const update = superadminMutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(localizedStringValidator),
    description: v.optional(localizedStringValidator),
    content: v.optional(localizedStringValidator),
    category: v.optional(serviceCategoryValidator),
    icon: v.optional(v.string()),
    estimatedDays: v.optional(v.number()),
    requiresAppointment: v.optional(v.boolean()),
    requiredDocuments: v.optional(v.array(formDocumentValidator)),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { serviceId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(serviceId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return serviceId;
  },
});

// ============================================================================
// ORG SERVICES (Organization-specific)
// ============================================================================

/**
 * List services available for an organization
 */
export const listByOrg = query({
  args: {
    orgId: v.id("orgs"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const activeOnly = args.activeOnly !== false;

    const orgServices = activeOnly
      ? await ctx.db
          .query("orgServices")
          .withIndex("by_org_active", (q) =>
            q.eq("orgId", args.orgId).eq("isActive", true)
          )
          .collect()
      : await ctx.db
          .query("orgServices")
          .withIndex("by_org_service", (q) => q.eq("orgId", args.orgId))
          .collect();

    // Batch fetch services (avoid N+1)
    const serviceIds = [...new Set(orgServices.map((os) => os.serviceId))];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    return orgServices.map((os) => {
      const service = serviceMap.get(os.serviceId);
      return {
        ...os,
        service,
        // Merged view for convenience
        name: service?.name,
        category: service?.category,
        description: service?.description,
        requiredDocuments:
          os.requiredDocuments ?? service?.requiredDocuments,
      };
    });
  },
});

/**
 * Get org service by ID with full details
 */
export const getOrgServiceById = query({
  args: { orgServiceId: v.id("orgServices") },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) return null;

    const [service, org] = await Promise.all([
      ctx.db.get(orgService.serviceId),
      ctx.db.get(orgService.orgId),
    ]);

    return {
      ...orgService,
      service,
      org,
      // Merged view
      name: service?.name,
      category: service?.category,
      description: service?.description,
      requiredDocuments:
        orgService.requiredDocuments ?? service?.requiredDocuments,
      estimatedDays:
        orgService.estimatedDays ?? service?.estimatedDays,
    };
  },
});

/**
 * Get org service by the parent service's slug
 * Used by citizen-facing routes to fetch service by its human-readable slug
 */
export const getOrgServiceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // First, find the service by slug
    const service = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    
    if (!service) return null;
    
    // Find an active orgService for this service
    const orgService = await ctx.db
      .query("orgServices")
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceId"), service._id),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();
    
    if (!orgService) return null;
    
    const org = await ctx.db.get(orgService.orgId);
    
    return {
      ...orgService,
      service,
      org,
      // Merged view for convenience
      title: service.name,
      name: service.name,
      category: service.category,
      description: service.description,
      requiredDocuments:
        orgService.requiredDocuments ?? service.requiredDocuments,
      estimatedDays:
        orgService.estimatedDays ?? service.estimatedDays,
    };
  },
});

/**
 * Activate a service for an organization
 */
export const activateForOrg = authMutation({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.id("services"),
    pricing: pricingValidator,
    estimatedDays: v.optional(v.number()),
    instructions: v.optional(v.string()),
    requiredDocuments: v.optional(v.array(formDocumentValidator)),
    requiresAppointment: v.optional(v.boolean()),
    requiresAppointmentForPickup: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireOrgAdmin(ctx, args.orgId);

    // Check if already activated
    const existing = await ctx.db
      .query("orgServices")
      .withIndex("by_org_service", (q) =>
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    if (existing) {
      throw error(ErrorCode.SERVICE_ALREADY_ACTIVATED);
    }

    return await ctx.db.insert("orgServices", {
      orgId: args.orgId,
      serviceId: args.serviceId,
      pricing: args.pricing,
      estimatedDays: args.estimatedDays,
      instructions: args.instructions,
      requiredDocuments: args.requiredDocuments,
      requiresAppointment: args.requiresAppointment ?? false,
      requiresAppointmentForPickup: args.requiresAppointmentForPickup ?? false,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update org service configuration
 */
export const updateOrgService = authMutation({
  args: {
    orgServiceId: v.id("orgServices"),
    pricing: v.optional(pricingValidator),
    estimatedDays: v.optional(v.number()),
    instructions: v.optional(v.string()),
    requiredDocuments: v.optional(v.array(formDocumentValidator)),
    requiresAppointment: v.optional(v.boolean()),
    requiresAppointmentForPickup: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    formSchema: v.optional(formSchemaValidator),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw error(ErrorCode.SERVICE_NOT_FOUND);
    }

    await requireOrgAdmin(ctx, orgService.orgId);

    const { orgServiceId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(orgServiceId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return orgServiceId;
  },
});

/**
 * Toggle org service active status
 */
export const toggleOrgServiceActive = authMutation({
  args: { orgServiceId: v.id("orgServices") },
  handler: async (ctx, args) => {
    const orgService = await ctx.db.get(args.orgServiceId);
    if (!orgService) {
      throw error(ErrorCode.SERVICE_NOT_FOUND);
    }

    await requireOrgAdmin(ctx, orgService.orgId);

    await ctx.db.patch(args.orgServiceId, {
      isActive: !orgService.isActive,
      updatedAt: Date.now(),
    });

    return !orgService.isActive;
  },
});

/**
 * Get org service by Org ID and Service ID
 */
export const getByOrgAndService = query({
  args: {
    orgId: v.id("orgs"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const orgService = await ctx.db
      .query("orgServices")
      .withIndex("by_org_service", (q) =>
        q.eq("orgId", args.orgId).eq("serviceId", args.serviceId)
      )
      .unique();

    if (!orgService) return null;

    const [service, org] = await Promise.all([
      ctx.db.get(orgService.serviceId),
      ctx.db.get(orgService.orgId),
    ]);

    return {
      ...orgService,
      service,
      org,
      name: service?.name,
      category: service?.category,
      description: service?.description,
      requiredDocuments:
        orgService.requiredDocuments ?? service?.requiredDocuments,
      estimatedDays:
        orgService.estimatedDays ?? service?.estimatedDays,
    };
  },
});

/**
 * List services by country (for user discovery)
 */
export const listByCountry = query({
  args: {
    country: v.string(),
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    // Get orgs in country
    const orgs = await ctx.db
      .query("orgs")
      .withIndex("by_country", (q) => q.eq("country", args.country as CountryCode))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    if (orgs.length === 0) return [];

    // Get all active org services
    const allOrgServices = await Promise.all(
      orgs.map(async (org) => {
        const services = await ctx.db
          .query("orgServices")
          .withIndex("by_org_active", (q) =>
            q.eq("orgId", org._id).eq("isActive", true)
          )
          .collect();
        return services.map((s) => ({ ...s, org }));
      })
    );

    const flatServices = allOrgServices.flat();

    // Batch fetch service details
    const serviceIds = [...new Set(flatServices.map((os) => os.serviceId))];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    const enriched = flatServices.map((os) => {
      const service = serviceMap.get(os.serviceId);
      return {
        ...os,
        service,
        name: service?.name,
        category: service?.category,
        description: service?.description,
      };
    });

    if (args.category) {
      return enriched.filter((s) => s.category === args.category);
    }

    return enriched;
  },
});

/**
 * Get registration service availability for an organization
 * Returns the org service if registration category is active, null otherwise
 */
export const getRegistrationServiceForOrg = query({
  args: {
    orgId: v.id("orgs"),
  },
  handler: async (ctx, args) => {
    // Get all active org services for this org
    const orgServices = await ctx.db
      .query("orgServices")
      .withIndex("by_org_active", (q) =>
        q.eq("orgId", args.orgId).eq("isActive", true)
      )
      .collect();

    if (orgServices.length === 0) return null;

    // Get all service details to check category
    const serviceIds = [...new Set(orgServices.map((os) => os.serviceId))];
    const services = await Promise.all(serviceIds.map((id) => ctx.db.get(id)));
    const serviceMap = new Map(
      services.filter(Boolean).map((s) => [s!._id, s!])
    );

    // Find a registration service
    for (const os of orgServices) {
      const service = serviceMap.get(os.serviceId);
      if (service?.category === "registration" && service.isActive) {
        const org = await ctx.db.get(args.orgId);
        return {
          ...os,
          service,
          org,
          name: service.name,
          category: service.category,
          description: service.description,
          requiredDocuments:
            os.requiredDocuments ?? service.requiredDocuments,
          estimatedDays: os.estimatedDays ?? service.estimatedDays,
        };
      }
    }

    return null;
  },
});

/**
 * Check if a service is available online for a specific country.
 * A service is available if there's an active orgService linked to it,
 * where the org has the user's country in its jurisdictionCountries.
 * 
 * @returns { isAvailable: boolean, orgService?: OrgService, org?: Org }
 */
export const getServiceAvailabilityByCountry = query({
  args: {
    serviceId: v.id("services"),
    userCountry: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all active orgServices for this service
    const allOrgServices = await ctx.db
      .query("orgServices")
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceId"), args.serviceId),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    if (allOrgServices.length === 0) {
      return { isAvailable: false };
    }

    // Check each org's jurisdictionCountries
    for (const orgService of allOrgServices) {
      const org = await ctx.db.get(orgService.orgId);
      
      if (!org || !org.isActive || org.deletedAt) continue;
      
      const jurisdictions = org.jurisdictionCountries ?? [];
      
      // Check if user's country is in org's jurisdiction
      if (jurisdictions.includes(args.userCountry as CountryCode)) {
        const service = await ctx.db.get(orgService.serviceId);
        return {
          isAvailable: true,
          orgService,
          org,
          service,
        };
      }
    }

    return { isAvailable: false };
  },
});

/**
 * Get all available service IDs for a specific country.
 * Used for batch checking on listings.
 */
export const getAvailableServiceIdsForCountry = query({
  args: {
    userCountry: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all orgs that have this country in their jurisdiction
    const allOrgs = await ctx.db
      .query("orgs")
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    // Filter orgs by jurisdiction
    const matchingOrgs = allOrgs.filter((org) => {
      const jurisdictions = org.jurisdictionCountries ?? [];
      return jurisdictions.includes(args.userCountry as CountryCode);
    });

    if (matchingOrgs.length === 0) {
      return [];
    }

    // Get all active orgServices for these orgs
    const availableServiceIds: string[] = [];

    for (const org of matchingOrgs) {
      const orgServices = await ctx.db
        .query("orgServices")
        .withIndex("by_org_active", (q) =>
          q.eq("orgId", org._id).eq("isActive", true)
        )
        .collect();

      for (const os of orgServices) {
        if (!availableServiceIds.includes(os.serviceId)) {
          availableServiceIds.push(os.serviceId);
        }
      }
    }

    return availableServiceIds;
  },
});

// ============================================================================
// SEED MUTATION (For importing consular services via dashboard)
// Source: demo.amba-canada.gouv.ga (made generic/country-agnostic)
// ============================================================================

import { internalMutation } from "../_generated/server";
import { ServiceCategory } from "../lib/constants";

/**
 * Internal mutation to seed consular services
 * Run this from the Convex dashboard Functions tab
 */
export const seedMinistryServices = internalMutation({
  args: {},
  handler: async (ctx) => {
    const consulateServices = [
      // ========== VISA SERVICES ==========
      {
        slug: "demande-visa",
        code: "VISA_APPLICATION",
        name: { fr: "Demande de Visa", en: "Visa Application" },
        description: { fr: "Tout étranger souhaitant se rendre au Gabon pour des raisons professionnelles ou personnelles peut solliciter les Services consulaires pour la délivrance d'un visa.", en: "Any foreign national wishing to travel to Gabon for professional or personal reasons may apply to the Consular Services for a visa." },
        content: {
          fr: `<h2>Documents communs à toute demande de visa</h2>
<ul>
<li>Un passeport en cours de validité</li>
<li>Une copie de la page du passeport contenant les informations personnelles</li>
<li>Le formulaire de demande de visa, dûment rempli</li>
<li>Copie du billet d'avion aller-retour</li>
<li>Copie du vaccin contre la fièvre jaune</li>
<li>2 photos d'identité (format passeport)</li>
</ul>
<p><strong>Pour les enfants mineurs :</strong> Copie de l'acte de naissance, copies des pièces d'identité des parents, autorisation parentale.</p>

<h2>Documents complémentaires pour visa affaires</h2>
<ul>
<li>Lettre d'invitation d'une Administration gabonaise ou entreprise au Gabon</li>
<li>Lettre de prise en charge</li>
</ul>

<h2>Documents complémentaires pour visa tourisme ou visite familiale</h2>
<ul>
<li>Certificat d'hébergement établi par une Mairie du Gabon + pièce d'identité de l'hébergeant</li>
<li>Relevé de compte bancaire du mois en cours</li>
<li>Attestation d'emploi ou de congé datant de moins de 3 mois</li>
</ul>`,
          en: `<h2>Common Documents for All Visa Applications</h2>
<ul>
<li>Valid passport</li>
<li>Copy of passport page with personal information</li>
<li>Completed visa application form</li>
<li>Copy of round-trip ticket</li>
<li>Yellow fever vaccination certificate</li>
<li>2 passport-size photos</li>
</ul>
<p><strong>For minors:</strong> Birth certificate copy, copies of parents' IDs, parental authorization.</p>`
        },
        category: ServiceCategory.Visa,
        icon: "stamp",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "passport", label: { fr: "Passeport en cours de validité", en: "Valid passport" }, required: true },
          { type: "passport_copy", label: { fr: "Copie de la page d'identité du passeport", en: "Copy of passport identity page" }, required: true },
          { type: "visa_form", label: { fr: "Formulaire de demande de visa", en: "Visa application form" }, required: true },
          { type: "flight_ticket", label: { fr: "Billet d'avion aller-retour", en: "Round-trip flight ticket" }, required: true },
          { type: "yellow_fever", label: { fr: "Certificat de vaccination fièvre jaune", en: "Yellow fever vaccination certificate" }, required: true },
          { type: "photos", label: { fr: "2 photos d'identité format passeport", en: "2 passport-size photos" }, required: true },
        ],
        isActive: true,
      },

      // ========== REGISTRATION SERVICES ==========
      {
        slug: "carte-consulaire",
        code: "CONSULAR_CARD",
        name: { fr: "Carte Consulaire", en: "Consular Card" },
        description: { fr: "La carte consulaire permet d'identifier et recenser tous les ressortissants gabonais établis à l'étranger. Elle permet de bénéficier de la protection consulaire.", en: "The consular card identifies and registers all Gabonese nationals living abroad. It provides consular protection benefits." },
        content: {
          fr: `<h2>La carte consulaire</h2>
<p>La carte consulaire est un document qui permet au Consulat d'identifier et de recenser tous les ressortissants gabonais établis dans sa juridiction.</p>
<p>Cette carte permet à l'Ambassade de pouvoir exercer son devoir de protection consulaire envers les gabonais.</p>
<p>Il est conseillé aux compatriotes de se rapprocher des Services consulaires dès leur arrivée afin de se faire enregistrer et se voir délivrer <strong>gratuitement</strong> ce document.</p>`,
          en: `<h2>Consular Card</h2>
<p>The consular card is a document that allows the Consulate to identify and register all Gabonese nationals established in its jurisdiction.</p>
<p>This card enables the Embassy to exercise its duty of consular protection towards Gabonese citizens.</p>
<p>Citizens are advised to contact the Consular Services upon arrival to register and receive this document <strong>free of charge</strong>.</p>`
        },
        category: ServiceCategory.Registration,
        icon: "id-card",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "birth_certificate", label: { fr: "Acte de naissance gabonais", en: "Gabonese birth certificate" }, required: true },
          { type: "passport_copy", label: { fr: "Copie du passeport gabonais", en: "Copy of Gabonese passport" }, required: true },
          { type: "national_id", label: { fr: "Carte nationale d'identité", en: "National ID card" }, required: true },
          { type: "photos", label: { fr: "Photo d'identité récente", en: "Recent passport photo" }, required: true },
          { type: "proof_of_address", label: { fr: "Justificatif de domicile", en: "Proof of address" }, required: true },
          { type: "residence_permit", label: { fr: "Titre de séjour", en: "Residence permit" }, required: true },
        ],
        isActive: true,
      },

      // ========== ATTESTATION SERVICES ==========
      {
        slug: "attestation-permis-conduire",
        code: "DRIVING_LICENSE_ATTESTATION",
        name: { fr: "Attestation de Validité du Permis de Conduire", en: "Driving License Validity Attestation" },
        description: { fr: "Ce document permet à tout ressortissant gabonais ou étranger détenteur d'un permis de conduire gabonais de le faire authentifier.", en: "This document allows any Gabonese national or foreigner holding a Gabonese driving license to have it authenticated." },
        category: ServiceCategory.Certification,
        icon: "car",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "driving_license", label: { fr: "Original du permis de conduire gabonais", en: "Original Gabonese driving license" }, required: true },
          { type: "identity_docs", label: { fr: "Copies passeport/CNI/acte de naissance", en: "Copies of passport/ID/birth certificate" }, required: true },
        ],
        isActive: true,
      },
      {
        slug: "attestation-capacite-juridique",
        code: "LEGAL_CAPACITY_ATTESTATION",
        name: { fr: "Attestation de Capacité Juridique", en: "Legal Capacity Attestation" },
        description: { fr: "Ce document atteste qu'un ressortissant gabonais n'a pas fait l'objet de condamnation à des peines privatives de liberté au Gabon.", en: "This document attests that a Gabonese national has not been sentenced to imprisonment in Gabon." },
        category: ServiceCategory.Certification,
        icon: "scale",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "criminal_record", label: { fr: "Extrait de casier judiciaire (< 3 mois)", en: "Criminal record extract (< 3 months)" }, required: true },
          { type: "identity_docs", label: { fr: "Copies passeport/CNI/acte de naissance", en: "Copies of passport/ID/birth certificate" }, required: true },
        ],
        isActive: true,
      },

      // ========== CERTIFICATE SERVICES ==========
      {
        slug: "certificat-vie",
        code: "LIFE_CERTIFICATE",
        name: { fr: "Certificat de Vie", en: "Life Certificate" },
        description: { fr: "Ce document permet aux retraités gabonais ou bénéficiaires de pension gabonaise résidant à l'étranger d'apporter la preuve qu'ils sont encore en vie.", en: "This document allows Gabonese retirees or Gabonese pension beneficiaries residing abroad to prove they are still alive." },
        category: ServiceCategory.Certification,
        icon: "heart-pulse",
        estimatedDays: 1,
        requiresAppointment: true,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "passport_copy", label: { fr: "Copie du passeport", en: "Passport copy" }, required: true },
          { type: "pension_certificate", label: { fr: "Titre de pension ou attestation de retraite", en: "Pension certificate or retirement attestation" }, required: true },
        ],
        isActive: true,
      },
      {
        slug: "certificat-expatriation",
        code: "EXPATRIATION_CERTIFICATE",
        name: { fr: "Certificat d'Expatriation", en: "Expatriation Certificate" },
        description: { fr: "Document permettant à un ressortissant gabonais retournant définitivement au Gabon de rapatrier ses effets personnels.", en: "Document allowing a Gabonese national returning permanently to Gabon to repatriate personal belongings." },
        category: ServiceCategory.Certification,
        icon: "plane-departure",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "passport_copy", label: { fr: "Copie du passeport", en: "Passport copy" }, required: true },
          { type: "belongings_list", label: { fr: "Liste détaillée des effets personnels", en: "Detailed list of personal belongings" }, required: true },
          { type: "freight_forwarder", label: { fr: "Nom du transitaire", en: "Freight forwarder name" }, required: true },
        ],
        isActive: true,
      },
      {
        slug: "certificat-coutume-celibat",
        code: "CUSTOM_CELIBACY_CERTIFICATE",
        name: { fr: "Certificats de Coutume et de Célibat", en: "Custom and Celibacy Certificates" },
        description: { fr: "Documents requis pour tout ressortissant gabonais souhaitant se marier ou établir une union formelle à l'étranger.", en: "Documents required for any Gabonese national wishing to marry or establish a formal union abroad." },
        category: ServiceCategory.CivilStatus,
        icon: "heart",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "passport_or_id", label: { fr: "Passeport gabonais ou CNI", en: "Gabonese passport or national ID" }, required: true },
          { type: "birth_certificate", label: { fr: "Acte de naissance gabonais", en: "Gabonese birth certificate" }, required: true },
          { type: "divorce_judgment", label: { fr: "Jugement de divorce (si applicable)", en: "Divorce judgment (if applicable)" }, required: false },
        ],
        isActive: true,
      },
      {
        slug: "certificat-nationalite",
        code: "NATIONALITY_CERTIFICATE",
        name: { fr: "Certificat de Nationalité", en: "Nationality Certificate" },
        description: { fr: "Document confirmant la nationalité gabonaise. Normalement délivré par le Tribunal de Première Instance de Libreville, mais le Consulat peut l'établir dans certains cas.", en: "Document confirming Gabonese nationality. Normally issued by the Court of First Instance of Libreville, but the Consulate may issue it in certain cases." },
        category: ServiceCategory.Identity,
        icon: "badge-check",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "passport_or_id", label: { fr: "Passeport gabonais ou CNI", en: "Gabonese passport or national ID" }, required: true },
          { type: "birth_certificate", label: { fr: "Acte de naissance gabonais", en: "Gabonese birth certificate" }, required: true },
          { type: "parents_docs", label: { fr: "Actes de naissance/passeports des parents", en: "Parents' birth certificates/passports" }, required: true },
        ],
        isActive: true,
      },
      {
        slug: "certificat-non-opposition",
        code: "NON_OPPOSITION_CERTIFICATE",
        name: { fr: "Certificat de Non-Opposition au Mariage", en: "Certificate of No Objection to Marriage" },
        description: { fr: "Certificat délivré suite à la publication des bans de mariage, attestant qu'aucune opposition n'a été formulée.", en: "Certificate issued following the publication of marriage banns, attesting that no objection has been raised." },
        category: ServiceCategory.CivilStatus,
        icon: "file-check",
        estimatedDays: 14,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "marriage_file", label: { fr: "Dossier complet de mariage", en: "Complete marriage file" }, required: true },
        ],
        isActive: true,
      },

      // ========== TRAVEL DOCUMENT SERVICES ==========
      {
        slug: "tenant-lieu-passeport",
        code: "EMERGENCY_TRAVEL_DOCUMENT",
        name: { fr: "Tenant Lieu de Passeport", en: "Emergency Travel Document" },
        description: { fr: "Document de voyage provisoire pour les ressortissants gabonais ne disposant pas de passeport valide, permettant de voyager vers le Gabon uniquement. Validité: 3 mois.", en: "Temporary travel document for Gabonese nationals without a valid passport, allowing travel to Gabon only. Validity: 3 months." },
        category: ServiceCategory.TravelDocument,
        icon: "file-badge",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "application_form", label: { fr: "Formulaire de demande", en: "Application form" }, required: true },
          { type: "gabonese_document", label: { fr: "Document gabonais (passeport expiré, CNI, acte de naissance)", en: "Gabonese document (expired passport, ID, birth certificate)" }, required: true },
          { type: "flight_ticket", label: { fr: "Billet d'avion", en: "Plane ticket" }, required: true },
          { type: "photos", label: { fr: "2 photos d'identité récentes", en: "2 recent passport photos" }, required: true },
        ],
        isActive: true,
      },
      {
        slug: "laissez-passer",
        code: "LAISSEZ_PASSER",
        name: { fr: "Laissez-Passer", en: "Laissez-Passer" },
        description: { fr: "Document de voyage d'urgence valide 30 jours, pour les ressortissants gabonais devant rentrer au Gabon sans passeport valide.", en: "Emergency travel document valid for 30 days, for Gabonese nationals needing to return to Gabon without a valid passport." },
        category: ServiceCategory.TravelDocument,
        icon: "ticket",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "application_form", label: { fr: "Formulaire de demande", en: "Application form" }, required: true },
          { type: "gabonese_document", label: { fr: "Document gabonais (passeport expiré, CNI, acte de naissance)", en: "Gabonese document (expired passport, ID, birth certificate)" }, required: true },
          { type: "flight_ticket", label: { fr: "Billet d'avion", en: "Plane ticket" }, required: true },
          { type: "photos", label: { fr: "2 photos d'identité récentes", en: "2 recent passport photos" }, required: true },
        ],
        isActive: true,
      },

      // ========== LEGALIZATION SERVICES ==========
      {
        slug: "legalisation-documents",
        code: "DOCUMENT_LEGALIZATION",
        name: { fr: "Légalisation de Documents", en: "Document Legalization" },
        description: { fr: "Service d'authentification des documents administratifs et actes d'état civil délivrés par une Autorité gabonaise compétente.", en: "Authentication service for administrative documents and civil status certificates issued by competent Gabonese authorities." },
        content: {
          fr: `<h2>Documents pouvant être légalisés</h2>
<ul>
<li>L'acte de naissance</li>
<li>L'acte de mariage</li>
<li>L'acte de décès</li>
<li>Les actes établis par les autorités administratives</li>
<li>Les actes notariés</li>
<li>Les actes établis par les greffiers</li>
<li>Les actes établis par les huissiers de justice</li>
<li>Les actes établis par des agents diplomatiques ou consulaires</li>
</ul>
<p><strong>Important :</strong> La légalisation d'un acte d'état civil se fait sur la base de la production de son original.</p>`,
          en: `<h2>Documents That Can Be Legalized</h2>
<ul>
<li>Birth certificate</li>
<li>Marriage certificate</li>
<li>Death certificate</li>
<li>Documents issued by administrative authorities</li>
<li>Notarial acts</li>
<li>Documents issued by court clerks</li>
<li>Documents issued by bailiffs</li>
<li>Documents issued by diplomatic or consular agents</li>
</ul>
<p><strong>Important:</strong> Legalization of civil status certificates requires the original document.</p>`
        },
        category: ServiceCategory.Certification,
        icon: "stamp",
        estimatedDays: 7,
        requiresAppointment: false,
        requiredDocuments: [
          { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
          { type: "original_document", label: { fr: "Original du document à légaliser", en: "Original document to be legalized" }, required: true },
          { type: "document_copies", label: { fr: "Copies du document (2 max)", en: "Document copies (2 max)" }, required: false },
        ],
        isActive: true,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const service of consulateServices) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_slug", (q) => q.eq("slug", service.slug))
        .unique();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("services", {
        ...service,
        updatedAt: Date.now(),
      });
      created++;
    }

    return { created, skipped, total: consulateServices.length };
  },
});
