import { supabase } from "@/integrations/supabase/client";
import { ConsularService } from "@/types/services";

export const serviceCatalog = {
    async getAll(organizationId?: string): Promise<ConsularService[]> {
        let query = supabase
            .from('consular_services')
            .select('*')
            .order('name');

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as ConsularService[];
    },

    async getById(id: string): Promise<ConsularService | null> {
        const { data, error } = await supabase
            .from('consular_services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as ConsularService;
    },

    async create(service: Omit<ConsularService, 'id' | 'created_at' | 'updated_at'>): Promise<ConsularService> {
        const { data, error } = await supabase
            .from('consular_services')
            .insert(service)
            .select()
            .single();

        if (error) throw error;
        return data as ConsularService;
    },

    async update(id: string, updates: Partial<ConsularService>): Promise<ConsularService> {
        const { data, error } = await supabase
            .from('consular_services')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as ConsularService;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('consular_services')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
