import { supabase } from "@/integrations/supabase/client";
import { Organization, OrganizationType, OrganizationStatus } from "@/types/organization";

export const organizationService = {
    async getAll(): Promise<Organization[]> {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Organization[];
    },

    async getById(id: string): Promise<Organization | null> {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Organization;
    },

    async create(organization: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
        const { data, error } = await supabase
            .from('organizations')
            .insert(organization)
            .select()
            .single();

        if (error) throw error;
        return data as Organization;
    },

    async update(id: string, updates: Partial<Organization>): Promise<Organization> {
        const { data, error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Organization;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
