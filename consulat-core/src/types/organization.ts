export enum OrganizationType {
    CONSULAT_GENERAL = 'CONSULAT_GENERAL',
    CONSULAT = 'CONSULAT',
    AMBASSADE = 'AMBASSADE',
    HAUT_COMMISSARIAT = 'HAUT_COMMISSARIAT',
    MISSION_PERMANENTE = 'MISSION_PERMANENTE',
    CONSULAT_HONORAIRE = 'CONSULAT_HONORAIRE',
    AUTRE = 'AUTRE'
}

export enum OrganizationStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export interface CountrySettings {
    contact: {
        address: string;
        phone: string;
        email: string;
        website?: string;
    };
    hours: {
        [day: string]: { open: string; close: string; isOpen: boolean };
    };
    resources?: Record<string, any>;
}

export interface OrganizationMetadata {
    jurisdiction?: string[]; // Array of Country Codes
    contact?: {
        address: string;
        phone: string;
        email: string;
        website?: string;
        fax?: string;
    };
    hours?: {
        [day: string]: { open: string; close: string; isOpen: boolean };
    };
    city?: string;
    country?: string;
    countryCode?: string;
    notes?: string;
    coordinates?: [number, number];
}

export interface Organization {
    id: string;
    name: string;
    type: OrganizationType;
    city?: string | null;
    country?: string | null;
    country_code?: string | null;
    jurisdiction?: string[];
    enabled_services?: string[] | null;
    settings?: any | null;
    created_at: string;
    updated_at: string;
    // Legacy compatibility
    isActive?: boolean;
    countryCode?: string;
    enabledServices?: string[];
    metadata?: OrganizationMetadata;
}

export const COUNTRY_FLAGS: Record<string, string> = {
    'FR': '🇫🇷',
    'GA': '🇬🇦',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CN': '🇨🇳',
    'DE': '🇩🇪',
    'ES': '🇪🇸',
    'IT': '🇮🇹',
    'MA': '🇲🇦',
    'SN': '🇸🇳',
    'MC': '🇲🇨',
    'PT': '🇵🇹',
    'CA': '🇨🇦',
    'MX': '🇲🇽'
};

// Compatibility exports
export { OrganizationType as EntityType };
export type { Organization as Entity };
