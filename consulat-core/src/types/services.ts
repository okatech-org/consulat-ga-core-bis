/**
 * Service Types for Consulat.ga-core
 * Complete consular service types with steps and workflow
 * Migrated from consulat (Next.js/Convex)
 */

import { LucideIcon, FileText, BookKey, Stamp, CreditCard, FileCheck, ScrollText, Globe, Users, ShieldCheck, Briefcase } from 'lucide-react';
import {
  ServiceCategory,
  ServiceStatus,
  ServiceStepType,
  ProcessingMode,
  DeliveryMode,
  ServiceFieldType,
} from '@/lib/constants';

// ============================================================================
// FIELD TYPES (for dynamic forms)
// ============================================================================

export interface FieldOption {
  label: string;
  value: string;
}

export interface BaseField {
  name: string;
  label: string;
  required: boolean;
  description?: string;
  autoComplete?: string;
  profilePath?: string; // Path to profile field for default value
}

export interface TextField extends BaseField {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
}

export interface EmailField extends BaseField {
  type: 'email';
}

export interface PhoneField extends BaseField {
  type: 'phone';
}

export interface DateField extends BaseField {
  type: 'date';
  minDate?: string;
  maxDate?: string;
}

export interface SelectField extends BaseField {
  type: 'select';
  selectType: 'single' | 'multiple';
  options: FieldOption[];
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
}

export interface RadioField extends BaseField {
  type: 'radio';
  options: FieldOption[];
}

export interface FileField extends BaseField {
  type: 'file' | 'document' | 'photo';
  accept?: string;
  maxSize?: number; // bytes
}

export interface AddressField extends BaseField {
  type: 'address';
}

export type ServiceField =
  | TextField
  | NumberField
  | EmailField
  | PhoneField
  | DateField
  | SelectField
  | TextareaField
  | CheckboxField
  | RadioField
  | FileField
  | AddressField;

// ============================================================================
// SERVICE STEP TYPES
// ============================================================================

export interface ServiceStep {
  type: ServiceStepType | string;
  title: string;
  description?: string;
  fields?: ServiceField[];
  required: boolean;
  order: number;
}

// ============================================================================
// PROCESSING & DELIVERY CONFIG
// ============================================================================

export interface AppointmentConfig {
  requires: boolean;
  duration?: number; // minutes
  instructions?: string;
}

export interface ProxyConfig {
  allows: boolean;
  requirements?: string;
}

export interface ProcessingConfig {
  mode: ProcessingMode | string;
  appointment: AppointmentConfig;
  proxy?: ProxyConfig;
}

export interface DeliveryConfig {
  modes: (DeliveryMode | string)[];
  appointment?: AppointmentConfig;
  proxy?: ProxyConfig;
}

// ============================================================================
// PRICING
// ============================================================================

export interface ServicePricing {
  isFree: boolean;
  price?: number;
  currency?: string;
}

// ============================================================================
// FULL CONSULAR SERVICE TYPE (Enhanced)
// ============================================================================

export interface ConsularService {
  id: string;
  code?: string; // Unique service code
  name: string;
  description?: string;
  category?: ServiceCategory | string;
  status?: ServiceStatus | string;
  countries?: string[]; // ISO country codes where available
  organization_id?: string;
  imageUrl?: string; // URL for service card illustration

  // Service steps (workflow)
  steps?: ServiceStep[];

  // Processing configuration
  processing?: ProcessingConfig;

  // Delivery configuration
  delivery?: DeliveryConfig;

  // Pricing
  pricing?: ServicePricing;

  // Automations
  automation_workflow_id?: string;

  // Legacy fields
  is_active?: boolean;
  requirements?: string[] | Record<string, any>;
  price?: number;
  currency?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Legal & Assistance Info
  legalBasis?: {
    reference: string;
    title: string;
    link?: string;
  };
  assistanceDetails?: {
    beneficiaries: string[];
    situations: string[];
    fundAmount?: string;
    limitations?: string[];
  };
}

// ============================================================================
// SERVICE CATALOG (for static reference)
// ============================================================================

export type ServiceType =
  | 'VISA'
  | 'PASSEPORT'
  | 'LEGALISATION'
  | 'CARTE_CONSULAIRE'
  | 'TRANSCRIPTION_NAISSANCE'
  | 'ACTE_CIVIL'
  | 'INSCRIPTION_CONSULAIRE'
  | 'ATTESTATION';

export interface ServiceInfo {
  id: ServiceType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: ServiceCategory;
  requiredDocuments: string[];
  estimatedDuration?: string;
  price?: number;
  currency?: string;
}

export const SERVICE_CATALOG: Record<ServiceType, ServiceInfo> = {
  VISA: {
    id: 'VISA',
    name: 'Visa',
    description: 'Demande et renouvellement de visa',
    icon: Globe,
    color: 'text-blue-600',
    category: ServiceCategory.Visa,
    requiredDocuments: ['Passeport', 'Photo', 'Formulaire', 'Justificatif de domicile'],
    estimatedDuration: '5-10 jours ouvrés',
  },
  PASSEPORT: {
    id: 'PASSEPORT',
    name: 'Passeport',
    description: 'Demande et renouvellement de passeport',
    icon: BookKey,
    color: 'text-green-600',
    category: ServiceCategory.Identity,
    requiredDocuments: ['Ancien passeport', 'Acte de naissance', 'Photo', 'Justificatif de domicile'],
    estimatedDuration: '2-4 semaines',
  },
  LEGALISATION: {
    id: 'LEGALISATION',
    name: 'Légalisation',
    description: 'Légalisation de documents officiels',
    icon: Stamp,
    color: 'text-purple-600',
    category: ServiceCategory.Certification,
    requiredDocuments: ['Document original', 'Copie pièce identité'],
    estimatedDuration: '3-5 jours ouvrés',
  },
  CARTE_CONSULAIRE: {
    id: 'CARTE_CONSULAIRE',
    name: 'Carte Consulaire',
    description: 'Inscription consulaire et carte',
    icon: CreditCard,
    color: 'text-yellow-600',
    category: ServiceCategory.Registration,
    requiredDocuments: ['Passeport', 'Justificatif de domicile', 'Photo'],
    estimatedDuration: '1-2 semaines',
  },
  TRANSCRIPTION_NAISSANCE: {
    id: 'TRANSCRIPTION_NAISSANCE',
    name: 'Transcription Naissance',
    description: 'Transcription acte de naissance',
    icon: FileCheck,
    color: 'text-indigo-600',
    category: ServiceCategory.CivilStatus,
    requiredDocuments: ['Acte de naissance local', 'Pièce identité parents', 'Livret de famille'],
    estimatedDuration: '2-4 semaines',
  },
  ACTE_CIVIL: {
    id: 'ACTE_CIVIL',
    name: 'État Civil',
    description: "Actes d'état civil divers",
    icon: ScrollText,
    color: 'text-red-600',
    category: ServiceCategory.CivilStatus,
    requiredDocuments: ['Demande manuscrite', 'Pièce identité'],
    estimatedDuration: '1-3 semaines',
  },
  INSCRIPTION_CONSULAIRE: {
    id: 'INSCRIPTION_CONSULAIRE',
    name: 'Inscription Consulaire',
    description: 'Inscription au registre des Gabonais de l\'étranger',
    icon: Users,
    color: 'text-teal-600',
    category: ServiceCategory.Registration,
    requiredDocuments: ['Passeport', 'Acte de naissance', 'Justificatif de domicile', 'Photo'],
    estimatedDuration: '1-2 semaines',
  },
  ATTESTATION: {
    id: 'ATTESTATION',
    name: 'Attestation',
    description: 'Attestations diverses (résidence, vie, etc.)',
    icon: ShieldCheck,
    color: 'text-orange-600',
    category: ServiceCategory.Certification,
    requiredDocuments: ['Pièce identité', 'Justificatif concerné'],
    estimatedDuration: '2-5 jours ouvrés',
  },
};

// ============================================================================
// SERVICE CREATION/UPDATE DTOs
// ============================================================================

export interface CreateServiceDTO {
  code: string;
  name: string;
  description?: string;
  category: ServiceCategory | string;
  organization_id: string;
  countries?: string[];
  steps?: ServiceStep[];
  processing?: ProcessingConfig;
  delivery?: DeliveryConfig;
  pricing?: ServicePricing;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  status?: ServiceStatus | string;
  countries?: string[];
  steps?: ServiceStep[];
  processing?: ProcessingConfig;
  delivery?: DeliveryConfig;
  pricing?: ServicePricing;
}

// ============================================================================
// SERVICE FILTERS
// ============================================================================

export interface ServiceFilters {
  category?: ServiceCategory | string;
  status?: ServiceStatus | string;
  organization_id?: string;
  country?: string;
  search?: string;
}
