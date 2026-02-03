/**
 * Request Types for Consulat.ga-core
 * Complete service request types with workflow and metadata
 * Migrated from consulat (Next.js/Convex)
 */

import {
    RequestStatus,
    RequestPriority,
    RequestType as RequestTypeEnum,
    DeliveryMode,
    ProcessingMode,
    DeliveryStatus,
    ActivityType,
    NoteType,
    ServiceCategory,
} from '@/lib/constants';
import { Address } from './profile';

// ============================================================================
// LEGACY ENUMS (for backward compatibility)
// ============================================================================

/** @deprecated Use RequestTypeEnum from constants */
export enum RequestType {
    PASSPORT = 'PASSPORT',
    VISA = 'VISA',
    CIVIL_REGISTRY = 'CIVIL_REGISTRY',
    LEGALIZATION = 'LEGALIZATION',
    CONSULAR_CARD = 'CONSULAR_CARD',
    ATTESTATION = 'ATTESTATION',
}

// Re-export new enums for convenience
export { RequestStatus, RequestPriority } from '@/lib/constants';

// ============================================================================
// NOTE TYPES
// ============================================================================

export interface RequestNote {
    type: NoteType | 'internal' | 'feedback';
    authorId?: string;
    content: string;
    createdAt?: number; // Unix timestamp
}

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export interface RequestActivity {
    type: ActivityType | string;
    actorId?: string | 'system';
    data?: Record<string, any>;
    timestamp: number; // Unix timestamp
}

// ============================================================================
// CONFIG TYPES
// ============================================================================

export interface ProxyInfo {
    firstName: string;
    lastName: string;
    identityDoc: string; // Document ID
    powerOfAttorneyDoc: string; // Document ID
}

export interface RequestConfig {
    processingMode: ProcessingMode | string;
    deliveryMode: DeliveryMode | string;
    deliveryAddress?: Address;
    proxy?: ProxyInfo;
}

// ============================================================================
// DELIVERY TYPES
// ============================================================================

export interface RequestDelivery {
    address: Address;
    trackingNumber: string;
    status: DeliveryStatus | string;
}

// ============================================================================
// METADATA TYPES
// ============================================================================

export interface RequestMetadata {
    activities: RequestActivity[];
    organization?: {
        name: string;
        type: string;
        logo?: string;
    };
    requester?: {
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber?: string;
    };
    profile?: {
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber?: string;
        isChildProfile?: boolean;
    };
    assignee?: {
        firstName: string;
        lastName: string;
    };
    service?: {
        name: string;
        category: ServiceCategory | string;
    };
}

// ============================================================================
// FULL SERVICE REQUEST TYPE (Enhanced)
// ============================================================================

export interface ServiceRequest {
    id: string;
    number?: string; // Unique tracking number
    service_id: string;
    organization_id: string;
    assigned_agent_id?: string;
    country_code?: string;

    // Requester and beneficiary
    requester_id?: string; // Profile ID of person making the request
    profile_id: string; // Profile ID of person the request is for

    // Status
    status: RequestStatus | string;
    priority?: RequestPriority | string;

    // Data
    data?: Record<string, any>; // Form data
    document_ids?: string[];

    // Configuration
    config?: RequestConfig;

    // Delivery
    delivery?: RequestDelivery;

    // Generated documents (output)
    generated_documents?: string[];

    // Notes
    notes?: RequestNote[];

    // Metadata
    metadata?: RequestMetadata;

    // Timestamps
    submitted_at?: string;
    completed_at?: string;
    assigned_at?: string;
    created_at: string;
    updated_at: string;

    // Joined fields (optional, from queries)
    service?: {
        name: string;
        type?: string;
        category?: string;
    };
    profile?: {
        first_name: string;
        last_name: string;
        email?: string;
    };
    organization?: {
        name: string;
    };
    assignee?: {
        first_name: string;
        last_name: string;
    };
}

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================

/** @deprecated Use ServiceRequest instead */
export interface Request {
    id: string;
    type: RequestType;
    status: RequestStatus | string;
    priority: RequestPriority | string;
    citizenName: string;
    citizenEmail: string;
    citizenPhone?: string;
    subject: string;
    description: string;
    attachedDocuments: string[];
    requiredDocuments: string[];
    createdAt: Date;
    updatedAt: Date;
    expectedCompletionDate?: Date;
    assignedTo?: string;
    assignedToName?: string;
    internalNotes?: string;
}

// ============================================================================
// REQUEST CREATION/UPDATE DTOs
// ============================================================================

export interface CreateServiceRequestDTO {
    service_id: string;
    organization_id: string;
    profile_id: string;
    requester_id?: string;
    priority?: RequestPriority | string;
    data?: Record<string, any>;
    document_ids?: string[];
    config?: RequestConfig;
}

export interface UpdateServiceRequestDTO {
    status?: RequestStatus | string;
    priority?: RequestPriority | string;
    data?: Record<string, any>;
    document_ids?: string[];
    assigned_agent_id?: string;
    config?: RequestConfig;
    notes?: RequestNote[];
}

// ============================================================================
// REQUEST FILTERS
// ============================================================================

export interface RequestFilters {
    status?: RequestStatus | string | (RequestStatus | string)[];
    priority?: RequestPriority | string;
    service_id?: string;
    organization_id?: string;
    profile_id?: string;
    assigned_agent_id?: string;
    country_code?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
}
