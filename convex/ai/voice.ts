/**
 * AI Voice Communication - Gemini Live API Integration
 * 
 * Architecture:
 * - Backend: Provides session configuration and ephemeral tokens
 * - Frontend: Connects directly to Gemini Live API via WebSocket
 * 
 * The Gemini Live API expects:
 * - Audio input: PCM 16-bit, 16kHz, mono
 * - Audio output: PCM 16-bit, 24kHz, mono
 */
import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { api } from "../_generated/api";

// Voice model for real-time audio
const VOICE_MODEL = "gemini-2.5-flash-preview-native-audio-dialog";

// System instructions for voice assistant
const VOICE_SYSTEM_PROMPT = `Tu es l'Assistant Vocal du Consulat du Gabon en France.

COMPORTEMENT VOCAL:
- Parle naturellement, comme un agent consulaire amical
- Réponds de façon concise (max 2-3 phrases) car c'est une conversation vocale
- Utilise un ton professionnel mais chaleureux
- Si l'utilisateur pose une question complexe, propose de l'aider via le chat texte
- Pour les actions qui nécessitent des formulaires, guide vers l'interface texte

CAPACITÉS:
- Renseigner sur les horaires et services du consulat
- Expliquer les procédures (passeport, carte consulaire, légalisation)
- Donner des informations générales
- Rediriger vers le chat texte pour les actions complexes

LIMITES:
- Tu ne peux pas créer de demandes ou modifier des données en vocal
- Pour ces actions, suggère d'utiliser le chat texte`;

/**
 * Get voice session configuration
 * Returns the config needed to connect to Gemini Live API
 */
export const getVoiceConfig = action({
  args: {},
  handler: async (ctx) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("NOT_AUTHENTICATED");
    }

    // Get user info for personalization
    const user = await ctx.runQuery(api.functions.users.getMe);

    // Get API key (will be used client-side via ephemeral token in production)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Build personalized system instruction
    let personalizedPrompt = VOICE_SYSTEM_PROMPT;
    if (user) {
      personalizedPrompt += `\n\nUTILISATEUR: ${user.firstName || ""} ${user.lastName || ""}`;
    }

    return {
      model: VOICE_MODEL,
      apiKey, // In production, use ephemeral tokens instead
      config: {
        responseModalities: ["AUDIO"],
        systemInstruction: personalizedPrompt,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore", // Warm, friendly voice
            },
          },
        },
      },
      // Audio format specifications for frontend
      audioFormat: {
        input: {
          sampleRate: 16000,
          channels: 1,
          bitDepth: 16,
          mimeType: "audio/pcm;rate=16000",
        },
        output: {
          sampleRate: 24000,
          channels: 1,
          bitDepth: 16,
        },
      },
    };
  },
});

/**
 * Check if voice is available for the current user
 * (rate limiting, feature flags, etc.)
 */
export const isVoiceAvailable = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { available: false, reason: "not_authenticated" };
    }

    // Check if API key is configured
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    if (!hasApiKey) {
      return { available: false, reason: "not_configured" };
    }

    return { available: true };
  },
});
