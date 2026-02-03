/**
 * Consular Service Schemas
 * Zod schemas for service configuration and validation
 * Adapted from reference project for consulat.ga-core
 */

import { z } from 'zod';
import { CountryCodeSchema } from './inputs';

// ============================================================================
// SERVICE FIELD TYPES
// ============================================================================

export const serviceFieldTypes = [
    'text',
    'number',
    'email',
    'phone',
    'date',
    'select',
    'multiselect',
    'radio',
    'checkbox',
    'textarea',
    'file',
    'photo',
    'address',
    'country',
    'signature',
] as const;

export type ServiceFieldType = typeof serviceFieldTypes[number];

// ============================================================================
// SERVICE ENUMS
// ============================================================================

export const ServiceCategorySchema = z.enum([
    'identity',
    'civil_status',
    'visa',
    'certification',
    'transcript',
    'registration',
    'assistance',
    'travel_document',
    'passport',
    'administrative',
    'other',
]);

export const ServiceStatusSchema = z.enum([
    'active',
    'inactive',
    'draft',
]);

export const ServiceStepTypeSchema = z.enum([
    'form',
    'documents',
    'payment',
    'appointment',
    'review',
    'summary',
]);

export const ProcessingModeSchema = z.enum([
    'immediate',
    'appointment_required',
    'mail_in',
    'online',
]);

export const DeliveryModeSchema = z.enum([
    'pickup',
    'mail',
    'digital',
    'appointment',
]);

export const DocumentTypeSchema = z.enum([
    'passport',
    'identity_card',
    'birth_certificate',
    'marriage_certificate',
    'death_certificate',
    'residence_permit',
    'visa',
    'photo',
    'address_proof',
    'other',
]);

// ============================================================================
// SERVICE FIELD SCHEMA
// ============================================================================

/**
 * Field validation options
 */
const FieldValidationSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    customValidation: z.string().optional(),
});

/**
 * Field option (for select, radio, checkbox)
 */
const FieldOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
});

/**
 * Service field definition
 */
export const ServiceFieldSchema = z.object({
    name: z.string().min(1, 'Nom du champ requis'),
    type: z.enum(serviceFieldTypes),
    label: z.string().min(1, 'Label requis'),
    required: z.boolean().optional().default(false),
    description: z.string().optional().nullable(),
    placeholder: z.string().optional(),
    defaultValue: z.any().optional(),
    profileField: z.string().optional(), // Auto-fill from profile
    options: z.array(FieldOptionSchema).optional(),
    validation: FieldValidationSchema.optional(),
});

export type ServiceField = z.infer<typeof ServiceFieldSchema>;

// ============================================================================
// SERVICE STEP SCHEMA
// ============================================================================

/**
 * Service step (form, documents, payment, etc.)
 */
export const ServiceStepSchema = z.object({
    title: z.string().min(1, 'Titre de l\'étape requis'),
    description: z.string().optional(),
    type: ServiceStepTypeSchema,
    isRequired: z.boolean().default(true),
    order: z.number().min(0),
    fields: z.array(ServiceFieldSchema).optional(),
});

export type ServiceStep = z.infer<typeof ServiceStepSchema>;

// ============================================================================
// FULL SERVICE SCHEMA
// ============================================================================

/**
 * Processing configuration
 */
const ProcessingConfigSchema = z.object({
    mode: ProcessingModeSchema,
    appointment: z.object({
        requires: z.boolean(),
        duration: z.number().min(5).optional(), // minutes
        instructions: z.string().optional(),
    }),
    proxy: z.object({
        allows: z.boolean(),
        requirements: z.string().optional(),
    }).optional(),
});

/**
 * Delivery configuration
 */
const DeliveryConfigSchema = z.object({
    modes: z.array(DeliveryModeSchema),
    appointment: z.object({
        requires: z.boolean(),
        duration: z.number().min(15).optional(),
        instructions: z.string().optional(),
    }).optional(),
    proxy: z.object({
        allows: z.boolean(),
        requirements: z.string().optional(),
    }).optional(),
});

/**
 * Pricing configuration
 */
const PricingConfigSchema = z.object({
    isFree: z.boolean().default(true),
    price: z.number().min(0).optional(),
    currency: z.string().default('EUR'),
});

/**
 * Complete service schema
 */
export const ConsularServiceSchema = z.object({
    id: z.string(),
    code: z.string().optional(),
    name: z.string().min(1, 'Nom du service requis'),
    description: z.string().optional(),
    category: ServiceCategorySchema,
    status: ServiceStatusSchema.default('draft'),
    organizationId: z.string().optional(),
    countries: z.array(z.string()).optional(),

    // Steps
    steps: z.array(ServiceStepSchema),

    // Required/optional documents
    requiredDocuments: z.array(DocumentTypeSchema).optional(),
    optionalDocuments: z.array(DocumentTypeSchema).optional(),

    // Processing
    processing: ProcessingConfigSchema.optional(),

    // Delivery
    delivery: DeliveryConfigSchema.optional(),

    // Pricing
    pricing: PricingConfigSchema.optional(),
});

export type ConsularServiceInput = z.infer<typeof ConsularServiceSchema>;

// ============================================================================
// NEW SERVICE QUICK CREATE SCHEMA
// ============================================================================

/**
 * Simplified schema for quick service creation
 */
export const NewServiceSchema = z.object({
    name: z.string().min(1, 'Nom du service requis'),
    category: ServiceCategorySchema,
    description: z.string().optional(),
    organizationId: z.string().optional(),
    countryCode: CountryCodeSchema.optional(),
});

export type NewServiceInput = z.infer<typeof NewServiceSchema>;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type ServiceStepType = z.infer<typeof ServiceStepTypeSchema>;
export type ProcessingMode = z.infer<typeof ProcessingModeSchema>;
export type DeliveryMode = z.infer<typeof DeliveryModeSchema>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
