/**
 * Profile Service for Consulat.ga-core
 * Enhanced service with complete CRUD operations for citizen profiles
 * Migrated from consulat (Next.js/Convex)
 */

import { supabase } from "@/integrations/supabase/client";
import {
    Profile,
    ChildProfile,
    CreateProfileDTO,
    UpdateProfileDTO,
    EmergencyContact,
    ProfileValidationResult,
} from "@/types/profile";
import { ProfileStatus, CountryCode } from "@/lib/constants";

export const profileService = {
    // ============================================================================
    // READ OPERATIONS
    // ============================================================================

    async getAll(filters?: {
        status?: ProfileStatus | string;
        residence_country?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<Profile[]> {
        let query = supabase
            .from("profiles")
            .select(`
        *,
        organization:organizations(id, name, type)
      `)
            .order("created_at", { ascending: false });

        if (filters?.status) {
            query = query.eq("status", filters.status);
        }
        if (filters?.residence_country) {
            query = query.eq("residence_country", filters.residence_country);
        }
        if (filters?.search) {
            query = query.or(
                `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,personal->firstName.ilike.%${filters.search}%,personal->lastName.ilike.%${filters.search}%`
            );
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as unknown as Profile[];
    },

    async getById(id: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        *,
        organization:organizations(id, name, type)
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as unknown as Profile;
    },

    async getByUserId(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        *,
        organization:organizations(id, name, type)
      `)
            .eq("user_id", userId)
            .single();

        if (error && error.code !== "PGRST116") throw error;
        return data as unknown as Profile | null;
    },

    async getByResidenceCountry(countryCode: string): Promise<Profile[]> {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        *,
        organization:organizations(id, name, type)
      `)
            .eq("residence_country", countryCode)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as unknown as Profile[];
    },

    // ============================================================================
    // CREATE OPERATIONS
    // ============================================================================

    async create(profile: CreateProfileDTO): Promise<Profile> {
        const { data, error } = await supabase
            .from("profiles")
            .insert({
                user_id: profile.user_id,
                first_name: profile.personal.firstName,
                last_name: profile.personal.lastName,
                personal: profile.personal,
                residence_country: profile.residence_country,
                status: ProfileStatus.Draft,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    // ============================================================================
    // UPDATE OPERATIONS
    // ============================================================================

    async update(id: string, updates: UpdateProfileDTO): Promise<Profile> {
        const updateData: Record<string, any> = {};

        if (updates.status) updateData.status = updates.status;
        if (updates.residence_country) updateData.residence_country = updates.residence_country;
        if (updates.consular_card) updateData.consular_card = updates.consular_card;
        if (updates.contacts) updateData.contacts = updates.contacts;
        if (updates.personal) {
            updateData.personal = updates.personal;
            if (updates.personal.firstName) updateData.first_name = updates.personal.firstName;
            if (updates.personal.lastName) updateData.last_name = updates.personal.lastName;
        }
        if (updates.family) updateData.family = updates.family;
        if (updates.emergency_contacts) updateData.emergency_contacts = updates.emergency_contacts;
        if (updates.profession_situation) updateData.profession_situation = updates.profession_situation;
        if (updates.documents) updateData.documents = updates.documents;

        const { data, error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    async updateStatus(id: string, status: ProfileStatus | string): Promise<Profile> {
        const { data, error } = await supabase
            .from("profiles")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    // ============================================================================
    // EMERGENCY CONTACTS
    // ============================================================================

    async addEmergencyContact(id: string, contact: EmergencyContact): Promise<Profile> {
        // First get current contacts
        const { data: profile, error: fetchError } = await supabase
            .from("profiles")
            .select("emergency_contacts")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const currentContacts = (profile?.emergency_contacts as EmergencyContact[]) || [];
        const updatedContacts = [...currentContacts, contact];

        const { data, error } = await supabase
            .from("profiles")
            .update({ emergency_contacts: updatedContacts })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    async removeEmergencyContact(id: string, contactIndex: number): Promise<Profile> {
        const { data: profile, error: fetchError } = await supabase
            .from("profiles")
            .select("emergency_contacts")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        const currentContacts = (profile?.emergency_contacts as EmergencyContact[]) || [];
        const updatedContacts = currentContacts.filter((_, index) => index !== contactIndex);

        const { data, error } = await supabase
            .from("profiles")
            .update({ emergency_contacts: updatedContacts })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    // ============================================================================
    // VALIDATION
    // ============================================================================

    async submitForValidation(id: string): Promise<Profile> {
        // Update status to pending
        const { data, error } = await supabase
            .from("profiles")
            .update({ status: ProfileStatus.Pending })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    validateProfile(profile: Profile): ProfileValidationResult {
        const errors: { field: string; message: string }[] = [];
        const warnings: { field: string; message: string }[] = [];

        // Required personal fields
        if (!profile.personal?.firstName) {
            errors.push({ field: "personal.firstName", message: "Le prénom est requis" });
        }
        if (!profile.personal?.lastName) {
            errors.push({ field: "personal.lastName", message: "Le nom est requis" });
        }
        if (!profile.personal?.birthDate) {
            errors.push({ field: "personal.birthDate", message: "La date de naissance est requise" });
        }
        if (!profile.personal?.birthPlace) {
            errors.push({ field: "personal.birthPlace", message: "Le lieu de naissance est requis" });
        }

        // Required documents
        if (!profile.documents?.passport) {
            errors.push({ field: "documents.passport", message: "Le passeport est requis" });
        }
        if (!profile.documents?.birthCertificate) {
            warnings.push({ field: "documents.birthCertificate", message: "L'acte de naissance est recommandé" });
        }
        if (!profile.documents?.identityPicture) {
            errors.push({ field: "documents.identityPicture", message: "La photo d'identité est requise" });
        }

        // Contact information
        if (!profile.contacts?.email && !profile.contacts?.phone) {
            errors.push({ field: "contacts", message: "Au moins un moyen de contact est requis" });
        }

        // Address for residence
        if (!profile.contacts?.address) {
            warnings.push({ field: "contacts.address", message: "L'adresse de résidence est recommandée" });
        }

        // Emergency contacts
        if (!profile.emergency_contacts || profile.emergency_contacts.length === 0) {
            warnings.push({ field: "emergency_contacts", message: "Au moins un contact d'urgence est recommandé" });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    },

    // ============================================================================
    // CHILD PROFILES
    // ============================================================================

    async getChildProfiles(parentProfileId: string): Promise<ChildProfile[]> {
        const { data, error } = await supabase
            .from("child_profiles")
            .select("*")
            .eq("parent_profile_id", parentProfileId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as ChildProfile[];
    },

    async createChildProfile(
        parentProfileId: string,
        childProfile: Omit<ChildProfile, "id" | "parent_profile_id" | "created_at" | "updated_at">
    ): Promise<ChildProfile> {
        const { data, error } = await supabase
            .from("child_profiles")
            .insert({
                parent_profile_id: parentProfileId,
                personal: childProfile.personal,
                family: childProfile.family,
                documents: childProfile.documents,
                status: childProfile.status || ProfileStatus.Draft,
            })
            .select()
            .single();

        if (error) throw error;
        return data as ChildProfile;
    },

    async updateChildProfile(id: string, updates: Partial<ChildProfile>): Promise<ChildProfile> {
        const { data, error } = await supabase
            .from("child_profiles")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ChildProfile;
    },

    async deleteChildProfile(id: string): Promise<void> {
        const { error } = await supabase.from("child_profiles").delete().eq("id", id);
        if (error) throw error;
    },
};
