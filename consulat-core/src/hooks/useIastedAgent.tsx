
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IastedConfig {
    agent_id: string;
    president_voice_id: string;
    minister_voice_id: string;
    default_voice_id: string;
}

export const useIastedAgent = () => {
    const { toast } = useToast();
    const [config, setConfig] = useState<IastedConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrCreateAgent();
    }, []);

    const loadOrCreateAgent = async () => {
        try {
            // Mock implementation for now
            setConfig({
                agent_id: 'mock-agent-id',
                president_voice_id: 'echo',
                minister_voice_id: 'ash',
                default_voice_id: 'shimmer'
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading agent:', error);
            setIsLoading(false);
        }
    };

    return { config, isLoading };
};
