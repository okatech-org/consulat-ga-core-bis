/**
 * Organization Schemas
 * Zod schemas for organization forms and validation
 * Adapted from reference project for consulat.ga-core
 */

import { z } from 'zod';
import {
    EmailSchema,
    PhoneSchema,
    UrlSchema,
    BasicAddressSchema,
    ContactSchema,
    WeeklyScheduleSchema,
    DayScheduleSchema,
    HolidaySchema,
    ClosureSchema,
} from './inputs';

// ============================================================================
// ORGANIZATION TYPE AND STATUS
// ============================================================================

export const OrganizationTypeSchema = z.enum([
    'AMBASSADE',
    'CONSULAT_GENERAL',
    'CONSULAT',
    'HAUT_COMMISSARIAT',
    'MISSION_PERMANENTE',
    'CONSULAT_HONORAIRE',
    'AUTRE',
]);

export const OrganizationStatusSchema = z.enum([
    'active',
    'inactive',
    'suspended',
]);

// ============================================================================
// CREATE / UPDATE ORGANIZATION
// ============================================================================

/**
 * Schema for creating a new organization
 */
export const createOrganizationSchema = z.object({
    name: z.string().min(1, 'Nom de l\'organisation requis'),
    code: z.string().optional(),
    type: OrganizationTypeSchema,
    status: OrganizationStatusSchema.default('active'),
    countryIds: z.array(z.string()).min(1, 'Au moins un pays requis'),
    adminEmail: z.string().email('Email administrateur invalide'),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

/**
 * Schema for updating an organization (partial, no adminEmail)
 */
export const updateOrganizationSchema = createOrganizationSchema
    .partial()
    .omit({ adminEmail: true });

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// ============================================================================
// ORGANIZATION SETTINGS
// ============================================================================

/**
 * Consular card template configuration
 */
const ConsularCardSchema = z.object({
    rectoModelUrl: z.string().optional(),
    versoModelUrl: z.string().optional(),
});

/**
 * Country-specific settings for an organization
 */
export const CountrySettingsSchema = z.object({
    countryCode: z.string(),
    contact: ContactSchema.optional(),
    schedule: WeeklyScheduleSchema.optional(),
    holidays: z.array(HolidaySchema).default([]),
    closures: z.array(ClosureSchema).default([]),
    consularCard: ConsularCardSchema.optional(),
});

export type CountrySettings = z.infer<typeof CountrySettingsSchema>;

/**
 * Full organization settings form schema
 */
export const organizationSettingsSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    logo: z.string().optional(),
    type: OrganizationTypeSchema,
    status: OrganizationStatusSchema,
    countryCodes: z.array(z.string()).min(1, 'Au moins un pays requis'),
    settings: z.array(CountrySettingsSchema),
});

export type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>;

// ============================================================================
// DEFAULT VALUES HELPER
// ============================================================================

const defaultDaySchedule: z.infer<typeof DayScheduleSchema> = {
    isOpen: false,
    slots: [{ start: '09:00', end: '17:00' }],
};

const defaultWeeklySchedule: z.infer<typeof WeeklyScheduleSchema> = {
    monday: { ...defaultDaySchedule, isOpen: true },
    tuesday: { ...defaultDaySchedule, isOpen: true },
    wednesday: { ...defaultDaySchedule, isOpen: true },
    thursday: { ...defaultDaySchedule, isOpen: true },
    friday: { ...defaultDaySchedule, isOpen: true },
    saturday: defaultDaySchedule,
    sunday: defaultDaySchedule,
};

/**
 * Get default values for an organization settings form
 */
export function getOrganizationSettingsDefaults(
    organization?: {
        name?: string;
        logo?: string;
        type?: string;
        status?: string;
        countryCodes?: string[];
        settings?: any[];
    } | null
): OrganizationSettingsFormData {
    if (!organization) {
        return {
            name: '',
            logo: undefined,
            type: 'CONSULAT_GENERAL',
            status: 'active',
            countryCodes: [],
            settings: [],
        };
    }

    const settings = (organization.countryCodes || []).map((countryCode) => {
        const existingSettings = organization.settings?.find(
            (s: any) => s.countryCode === countryCode
        );

        return {
            countryCode,
            contact: existingSettings?.contact || undefined,
            schedule: existingSettings?.schedule || defaultWeeklySchedule,
            holidays: existingSettings?.holidays || [],
            closures: existingSettings?.closures || [],
            consularCard: existingSettings?.consularCard || undefined,
        };
    });

    return {
        name: organization.name || '',
        logo: organization.logo,
        type: (organization.type as any) || 'CONSULAT_GENERAL',
        status: (organization.status as any) || 'active',
        countryCodes: organization.countryCodes || [],
        settings,
    };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type OrganizationType = z.infer<typeof OrganizationTypeSchema>;
export type OrganizationStatus = z.infer<typeof OrganizationStatusSchema>;
export type WeekDay =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
