import { createClient } from '@supabase/supabase-js';
import { MOCK_ORGANIZATIONS } from '@/data/mock-organizations';
import { MOCK_PROFILES } from '@/data/mock-profiles';
import { MOCK_SERVICES } from '@/data/mock-services';

// Define the Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// MOCK SUPABASE CLIENT for Consulat.ga-core
// This allows the UI to function without a real backend connection for now.

const mockSupabase = {
    auth: {
        getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'mock@example.com' } }, error: null }),
        getSession: async () => ({ data: { session: { access_token: 'mock-token' } }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    from: (table: string) => ({
        select: (columns?: string) => ({
            eq: (column: string, value: any) => ({
                is: (column2: string, value2: any) => ({
                    gte: (column3: string, value3: any) => ({
                        order: (column4: string, options?: any) => ({
                            limit: (count: number) => ({
                                maybeSingle: async () => ({ data: null, error: null }),
                            }),
                        }),
                    }),
                    order: (column3: string, options?: any) => ({
                        limit: (count: number) => ({
                            maybeSingle: async () => ({ data: null, error: null }),
                        }),
                    }),
                    maybeSingle: async () => ({ data: null, error: null }),
                }),
                single: async () => ({ data: null, error: null }),
                maybeSingle: async () => ({ data: null, error: null }),
                order: (column2: string, options?: any) => ({
                    limit: (count: number) => ({
                        maybeSingle: async () => ({ data: null, error: null })
                    })
                }),
            }),
            is: (column: string, value: any) => ({
                order: (column2: string, options?: any) => ({
                    limit: (count: number) => ({
                        maybeSingle: async () => ({ data: null, error: null }),
                    }),
                }),
                maybeSingle: async () => ({ data: null, error: null }),
            }),
            order: (column: string, options?: any) => {
                let data: any[] = [];
                if (table === 'organizations') data = MOCK_ORGANIZATIONS;
                else if (table === 'profiles') data = MOCK_PROFILES;
                else if (table === 'consular_services') data = MOCK_SERVICES;

                const result = {
                    data,
                    error: null
                };
                return {
                    ...result,
                    then: (resolve: (value: any) => void) => resolve(result),
                    limit: (count: number) => ({
                        maybeSingle: async () => ({ data: null, error: null }),
                        single: async () => ({ data: null, error: null }),
                    })
                };
            },
        }),
        insert: (data: any) => ({
            data: { id: 'mock-id' },
            error: null,
            select: () => ({
                single: async () => ({ data: { id: 'mock-id' }, error: null })
            })
        }),
        update: (data: any) => ({
            eq: (column: string, value: any) => ({
                select: () => ({
                    single: async () => ({ data: { ...data, id: value }, error: null })
                }),
                error: null
            })
        }),
        delete: () => ({
            eq: (column: string, value: any) => ({
                error: null
            })
        }),
    }),
    storage: {
        from: (bucket: string) => ({
            upload: async () => ({ data: { path: 'mock-path' }, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: 'https://mock-url.com' } }),
        }),
    },
    functions: {
        invoke: async (functionName: string, options?: any) => {
            console.log(`[MockSupabase] Invoking function: ${functionName}`, options);
            if (functionName === 'get-realtime-token') {
                return { data: { client_secret: { value: 'mock-ephemeral-key' } }, error: null };
            }
            return { data: { text: "Transcription simulée", analysis: { urgency_score: 5, sentiment: "neutral", key_points: ["Point 1", "Point 2"] } }, error: null };
        },
    },
    channel: () => ({
        on: () => ({ subscribe: () => { } }),
        send: () => { },
    }),
};

// Export real client if env vars exist, otherwise mock
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (mockSupabase as any);
