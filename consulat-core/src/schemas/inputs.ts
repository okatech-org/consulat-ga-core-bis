/**
 * Validation Schemas - Input Fields
 * Reusable Zod schemas for form validation
 * Adapted from reference project for consulat.ga-core
 */

import * as z from 'zod';

// ============================================================================
// VALIDATION RULES CONSTANTS
// ============================================================================

export const VALIDATION_RULES = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
    EMAIL_MAX_LENGTH: 255,
    ADDRESS_MAX_LENGTH: 100,
    PASSPORT_REGEX: /^[A-Z0-9]{8,9}$/,
    TIME_REGEX: /^([01]\d|2[0-3]):([0-5]\d)$/,
} as const;

// ============================================================================
// BASIC FIELD SCHEMAS
// ============================================================================

/**
 * Name validation (first name, last name, etc.)
 */
export const NameSchema = z
    .string({
        required_error: 'Ce champ est requis',
        invalid_type_error: 'Ce champ doit être une chaîne de caractères',
    })
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, 'Minimum 2 caractères')
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, 'Maximum 50 caractères');

/**
 * Email validation
 */
export const EmailSchema = z
    .string()
    .email('Adresse email invalide')
    .max(VALIDATION_RULES.EMAIL_MAX_LENGTH, 'Email trop long');

/**
 * Phone number validation (E.164 format)
 */
export const PhoneSchema = z
    .string({ required_error: 'Ce champ est requis' })
    .regex(VALIDATION_RULES.PHONE_REGEX, 'Numéro de téléphone invalide');

/**
 * Optional phone (can be empty string)
 */
export const OptionalPhoneSchema = z
    .string()
    .regex(VALIDATION_RULES.PHONE_REGEX, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal(''));

/**
 * Date string validation (YYYY-MM-DD format)
 */
export const DateSchema = z
    .string({
        required_error: 'Ce champ est requis',
    })
    .min(1, 'Ce champ est requis');

/**
 * Time validation (HH:MM format)
 */
export const TimeSchema = z
    .string()
    .regex(VALIDATION_RULES.TIME_REGEX, 'Format de temps invalide (HH:MM)');

/**
 * URL validation
 */
export const UrlSchema = z
    .string()
    .url('URL invalide')
    .optional()
    .or(z.literal(''));

/**
 * Passport number validation
 */
export const PassportNumberSchema = z
    .string()
    .min(8, 'Minimum 8 caractères')
    .max(9, 'Maximum 9 caractères')
    .regex(VALIDATION_RULES.PASSPORT_REGEX, 'Format de passeport invalide');

/**
 * Country code validation (ISO 3166-1 alpha-2)
 */
export const CountryCodeSchema = z
    .string()
    .min(2, 'Code pays requis')
    .max(3, 'Code pays invalide');

/**
 * Text area with max length
 */
export const TextareaSchema = z
    .string()
    .min(1, 'Ce champ est requis')
    .max(1000, 'Maximum 1000 caractères');

/**
 * Short text field
 */
export const TextSchema = z
    .string()
    .min(1, 'Ce champ est requis')
    .max(100, 'Maximum 100 caractères');

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

/**
 * Address schema
 */
export const AddressSchema = z.object({
    street: z
        .string()
        .min(1, 'Adresse requise')
        .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH),
    complement: z
        .string()
        .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH)
        .optional(),
    city: z.string().min(1, 'Ville requise'),
    postalCode: z.string().optional(),
    country: CountryCodeSchema,
});

/**
 * Basic address (optional fields)
 */
export const BasicAddressSchema = z.object({
    street: z.string().optional(),
    complement: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
});

/**
 * Contact information
 */
export const ContactSchema = z.object({
    email: EmailSchema.optional(),
    phone: OptionalPhoneSchema,
    website: UrlSchema,
    address: BasicAddressSchema.optional(),
});

/**
 * Passport information
 */
export const PassportInfoSchema = z.object({
    number: PassportNumberSchema,
    issueDate: DateSchema.optional(),
    expiryDate: DateSchema.optional(),
    issueAuthority: z.string().min(2).max(100),
});

/**
 * Time slot (for schedules)
 */
export const TimeSlotSchema = z.object({
    start: TimeSchema,
    end: TimeSchema,
});

/**
 * Day schedule (open/closed with slots)
 */
export const DayScheduleSchema = z.object({
    isOpen: z.boolean().default(false),
    slots: z.array(TimeSlotSchema).default([{ start: '09:00', end: '17:00' }]),
});

/**
 * Weekly schedule
 */
export const WeeklyScheduleSchema = z.object({
    monday: DayScheduleSchema,
    tuesday: DayScheduleSchema,
    wednesday: DayScheduleSchema,
    thursday: DayScheduleSchema,
    friday: DayScheduleSchema,
    saturday: DayScheduleSchema,
    sunday: DayScheduleSchema,
});

/**
 * Holiday entry
 */
export const HolidaySchema = z.object({
    date: DateSchema,
    name: z.string().min(1, 'Nom du jour férié requis'),
});

/**
 * Closure entry
 */
export const ClosureSchema = z.object({
    start: DateSchema,
    end: DateSchema,
    reason: z.string().min(1, 'Motif requis'),
});

// ============================================================================
// ENUMS AS ZOD
// ============================================================================

/**
 * Gender enum schema
 */
export const GenderSchema = z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Genre requis' }),
});

/**
 * Marital status enum schema
 */
export const MaritalStatusSchema = z.enum([
    'single',
    'married',
    'divorced',
    'widowed',
    'pacs',
], {
    errorMap: () => ({ message: 'Situation familiale requise' }),
});

/**
 * Work status enum schema
 */
export const WorkStatusSchema = z.enum([
    'employed',
    'self_employed',
    'unemployed',
    'student',
    'retired',
    'other',
], {
    errorMap: () => ({ message: 'Situation professionnelle requise' }),
});

/**
 * Nationality acquisition mode
 */
export const NationalityAcquisitionSchema = z.enum([
    'birth',
    'marriage',
    'naturalization',
    'other',
], {
    errorMap: () => ({ message: 'Mode d\'acquisition requis' }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Address = z.infer<typeof AddressSchema>;
export type BasicAddress = z.infer<typeof BasicAddressSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type PassportInfo = z.infer<typeof PassportInfoSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type DaySchedule = z.infer<typeof DayScheduleSchema>;
export type WeeklySchedule = z.infer<typeof WeeklyScheduleSchema>;
export type Holiday = z.infer<typeof HolidaySchema>;
export type Closure = z.infer<typeof ClosureSchema>;
