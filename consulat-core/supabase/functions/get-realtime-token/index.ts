import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set')
        }

        console.log('Creating ephemeral token for OpenAI Realtime API...')

        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2024-12-17',
                voice: 'alloy',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('OpenAI API Error:', errorData)
            throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        console.log('Ephemeral token created successfully')

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Error in get-realtime-token:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
