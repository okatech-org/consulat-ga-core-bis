import { EntityType } from "./entity";

// Operational Functions that can be assigned to a user
export enum UserFunction {
    // Visa Management
    VISA_VIEW = 'VISA_VIEW',
    VISA_PROCESS = 'VISA_PROCESS',
    VISA_VALIDATE = 'VISA_VALIDATE',
    VISA_PRINT = 'VISA_PRINT',

    // Passport Management
    PASSPORT_VIEW = 'PASSPORT_VIEW',
    PASSPORT_ENROLL = 'PASSPORT_ENROLL', // Biometrics
    PASSPORT_VALIDATE = 'PASSPORT_VALIDATE',
    PASSPORT_DELIVER = 'PASSPORT_DELIVER',

    // Civil Registry
    CIVIL_REGISTRY_VIEW = 'CIVIL_REGISTRY_VIEW',
    CIVIL_REGISTRY_CREATE = 'CIVIL_REGISTRY_CREATE', // Birth, Marriage, Death
    CIVIL_REGISTRY_VALIDATE = 'CIVIL_REGISTRY_VALIDATE',

    // Legalization
    LEGALIZATION_VIEW = 'LEGALIZATION_VIEW',
    LEGALIZATION_PROCESS = 'LEGALIZATION_PROCESS',

    // Crisis Management
    CRISIS_VIEW = 'CRISIS_VIEW',
    CRISIS_MANAGE = 'CRISIS_MANAGE',

    // Reporting
    REPORTING_VIEW = 'REPORTING_VIEW',
    REPORTING_EXPORT = 'REPORTING_EXPORT',

    // Administration
    USER_MANAGEMENT = 'USER_MANAGEMENT',
    SETTINGS_MANAGEMENT = 'SETTINGS_MANAGEMENT'
}

// Service Access Definition
export interface ServiceAccess {
    serviceId: string; // e.g., 'visa-tourisme', 'passeport-ordinaire'
    canView: boolean;
    canProcess: boolean;
    canValidate: boolean;
    maxDailyQuota?: number;
}

// Billing Features (Premium features that might be billed)
export enum BillingFeature {
    PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
    ADVANCED_ANALYTICS = 'ADVANCED_ANALYTICS',
    API_ACCESS = 'API_ACCESS',
    UNLIMITED_STORAGE = 'UNLIMITED_STORAGE',
    SMS_NOTIFICATIONS = 'SMS_NOTIFICATIONS',
    WHATSAPP_INTEGRATION = 'WHATSAPP_INTEGRATION'
}

// Quota Limits for the user
export interface UserQuotas {
    maxDailyFiles?: number;
    maxStorageGB?: number;
    canExportData: boolean;
}
