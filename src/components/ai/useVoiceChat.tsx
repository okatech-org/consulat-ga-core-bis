/**
 * Voice Chat Hook
 * Manages real-time voice communication with Gemini Live API
 */

import { useRouter } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAuthenticatedConvexQuery,
  useConvexActionQuery,
} from "@/integrations/convex/hooks";
import {
  ADMIN_ROUTES,
  MY_SPACE_ROUTES,
  PUBLIC_ROUTES,
} from "../../../convex/ai/routes_manifest";
import { useFormFill } from "./FormFillContext";

// Tool declarations for voice (subset of full tools, most useful for voice interaction)
const voiceTools = [
  {
    name: "getUserContext",
    description:
      "Récupère le contexte complet de l'utilisateur: profil, carte consulaire, demande active, et compteur de notifications.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getNotifications",
    description: "Liste les notifications récentes de l'utilisateur.",
    parameters: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "getRequests",
    description:
      "Liste les demandes de services de l'utilisateur avec leur statut.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getServicesByCountry",
    description:
      "Liste les services disponibles pour le pays de résidence de l'utilisateur.",
    parameters: {
      type: "object",
      properties: { category: { type: "string" } },
    },
  },
  {
    name: "getOrganizationInfo",
    description:
      "Récupère les informations du consulat (adresse, horaires, contact).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getLatestNews",
    description: "Récupère les dernières actualités du consulat.",
    parameters: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "getMyConsularCard",
    description: "Récupère les informations de la carte consulaire.",
    parameters: { type: "object", properties: {} },
  },
  // UI Actions - handled client-side
  {
    name: "navigateTo",
    description:
      "Navigue l'utilisateur vers une page de l'application. Routes disponibles:\n" +
      "PUBLIQUES: " +
      Object.keys(PUBLIC_ROUTES).join(", ") +
      "\n" +
      "ESPACE PERSONNEL: " +
      Object.keys(MY_SPACE_ROUTES).join(", ") +
      "\n" +
      "ADMIN: " +
      Object.keys(ADMIN_ROUTES).join(", "),
    parameters: {
      type: "object",
      properties: {
        route: {
          type: "string",
          description: "La route vers laquelle naviguer",
        },
      },
      required: ["route"],
    },
  },
  {
    name: "fillForm",
    description:
      "Pré-remplit un formulaire avec les données fournies par l'utilisateur.",
    parameters: {
      type: "object",
      properties: {
        formId: {
          type: "string",
          description:
            "ID du formulaire: profile, profile.identity, profile.addresses",
        },
        fields: { type: "object", description: "Données à pré-remplir" },
        navigateFirst: {
          type: "boolean",
          description: "Naviguer d'abord vers le formulaire",
        },
      },
      required: ["formId", "fields"],
    },
  },
];

type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

interface UseVoiceChatReturn {
  state: VoiceState;
  error: string | null;
  isSupported: boolean;
  isAvailable: boolean;
  isOpen: boolean;
  startVoice: () => Promise<void>;
  stopVoice: () => void;
  toggleVoice: () => Promise<void>;
  openOverlay: () => void;
  closeOverlay: () => void;
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check browser support on mount (client-side only)
  useEffect(() => {
    const supported =
      typeof navigator !== "undefined" &&
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices &&
      "AudioContext" in window;
    setIsSupported(supported);
  }, []);

  // Refs to hold mutable state without re-renders
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Get voice config from backend
  const { mutateAsync: getVoiceConfig } = useConvexActionQuery(
    api.ai.voice.getVoiceConfig,
  );
  const { data: isVoiceAvailable } = useAuthenticatedConvexQuery(
    api.ai.voice.isVoiceAvailable,
    {},
  );

  // Convex client for executing tool calls
  const convex = useConvex();
  const router = useRouter();
  const { setFormFill } = useFormFill();

  // UI tools that are handled client-side (not sent to backend)
  const UI_TOOLS = ["navigateTo", "fillForm"];

  // Execute UI tool client-side (navigation, form fill)
  const executeUITool = useCallback(
    (
      toolName: string,
      toolArgs: Record<string, unknown>,
    ): { success: boolean; message: string } => {
      if (toolName === "navigateTo") {
        const route = toolArgs.route as string;
        if (route) {
          router.navigate({ to: route });
          return { success: true, message: `Navigation vers ${route}` };
        }
        return { success: false, message: "Route manquante" };
      }
      if (toolName === "fillForm") {
        const formId = toolArgs.formId as string;
        const fields = toolArgs.fields as Record<string, unknown>;
        const navigateFirst = toolArgs.navigateFirst as boolean;

        if (navigateFirst) {
          const routeMap: Record<string, string> = {
            profile: "/my-space/profile",
            "profile.identity": "/my-space/profile",
            "profile.addresses": "/my-space/profile",
            "profile.contacts": "/my-space/profile",
            "profile.family": "/my-space/profile",
            request: "/my-space/requests",
          };
          const route = routeMap[formId] || "/my-space/profile";
          router.navigate({ to: route });
        }

        setFormFill({
          formId,
          fields,
          timestamp: Date.now(),
        });
        return { success: true, message: `Formulaire ${formId} pré-rempli` };
      }
      return { success: false, message: "Outil UI inconnu" };
    },
    [router, setFormFill],
  );

  // Execute a voice tool via backend action (for data tools only)
  const executeVoiceTool = useCallback(
    async (
      toolName: string,
      toolArgs: Record<string, unknown>,
    ): Promise<unknown> => {
      // Handle UI tools client-side
      if (UI_TOOLS.includes(toolName)) {
        return executeUITool(toolName, toolArgs);
      }
      // Data tools go to backend
      const result = await convex.action(api.ai.voice.executeVoiceTool, {
        toolName,
        toolArgs,
      });
      if (!result.success) {
        throw new Error(result.error ?? "Tool execution failed");
      }
      return result.data;
    },
    [convex, executeUITool],
  );

  /**
   * Play audio from queue
   */
  const playNextAudio = useCallback(() => {
    if (
      isPlayingRef.current ||
      audioQueueRef.current.length === 0 ||
      !audioContextRef.current
    ) {
      return;
    }

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift();
    if (!audioData) {
      isPlayingRef.current = false;
      return;
    }

    // Create audio buffer and play
    const audioBuffer = audioContextRef.current.createBuffer(
      1, // mono
      audioData.length,
      24000, // Sample rate from Gemini
    );
    audioBuffer.copyToChannel(audioData as any, 0);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      isPlayingRef.current = false;
      playNextAudio();
    };

    console.log("[Voice] Playing audio chunk...");
    source.start();
  }, []);

  /**
   * Start voice chat session
   */
  const startVoice = useCallback(async () => {
    if (!isSupported) {
      setError("Voice not supported in this browser");
      setState("error");
      return;
    }

    try {
      setState("connecting");
      setError(null);

      // Get voice config from backend
      const config = await getVoiceConfig({});

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      // Create processor for capturing audio
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Load AudioWorklet
      console.log("[Voice] Loading AudioWorklet module...");
      await audioContextRef.current.audioWorklet.addModule(
        "/audio-processor.js",
      );
      console.log("[Voice] AudioWorklet module loaded");

      processorRef.current = new AudioWorkletNode(
        audioContextRef.current,
        "audio-processor",
      );

      // Connect to Gemini Live API via WebSocket
      const ws = new WebSocket(config.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Voice] Connected to Gemini Live API");
        // Send initial setup message with tool declarations
        ws.send(
          JSON.stringify({
            setup: {
              model: `models/${config.model}`,
              generation_config: {
                response_modalities: ["AUDIO"],
              },
              system_instruction: {
                parts: [{ text: config.config.systemInstruction }],
              },
              tools: [{ function_declarations: voiceTools }],
            },
          }),
        );

        setState("listening");
      };

      ws.onmessage = async (event) => {
        try {
          // Handle Blob data (binary) - convert to text first
          let textData: string;
          if (event.data instanceof Blob) {
            textData = await event.data.text();
          } else {
            textData = event.data;
          }

          const data = JSON.parse(textData);

          // Handle setup complete
          if (data.setupComplete) {
            console.log("[Voice] Setup complete");
            // Start sending audio
            if (processorRef.current && audioContextRef.current) {
              processorRef.current.port.onmessage = (event) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  // console.log("[Voice] Received audio from worklet");
                  const inputData = event.data as any;
                  // Convert float32 to int16 PCM
                  const pcm16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = Math.max(
                      -32768,
                      Math.min(32767, inputData[i] * 32768),
                    );
                  }
                  // Send as base64
                  const bytes = new Uint8Array(pcm16.buffer);
                  let base64 = "";
                  for (let j = 0; j < bytes.length; j++) {
                    base64 += String.fromCharCode(bytes[j]);
                  }
                  base64 = btoa(base64);
                  ws.send(
                    JSON.stringify({
                      realtime_input: {
                        media_chunks: [
                          {
                            mime_type: "audio/pcm;rate=16000",
                            data: base64,
                          },
                        ],
                      },
                    }),
                  );
                }
              };

              source.connect(processorRef.current);
              processorRef.current.connect(audioContextRef.current.destination);
            }
          }

          // Handle server content (audio response)
          if (data.serverContent) {
            if (data.serverContent.interrupted) {
              audioQueueRef.current = [];
              setState("listening");
            } else if (data.serverContent.modelTurn?.parts) {
              setState("speaking");
              for (const part of data.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const audioData = atob(part.inlineData.data);
                  const int16Array = new Int16Array(audioData.length / 2);
                  for (let i = 0; i < int16Array.length; i++) {
                    int16Array[i] =
                      audioData.charCodeAt(i * 2) |
                      (audioData.charCodeAt(i * 2 + 1) << 8);
                  }
                  const float32Array = new Float32Array(int16Array.length);
                  for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 32768;
                  }
                  audioQueueRef.current.push(float32Array);
                  playNextAudio();
                }
              }
            }

            if (data.serverContent.turnComplete) {
              setState("listening");
            }
          }

          // Handle tool calls from the model
          if (data.toolCall) {
            console.log("[Voice] Tool call received:", data.toolCall);
            const { functionCalls } = data.toolCall;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                try {
                  // Execute tool via backend
                  const result = await executeVoiceTool(
                    call.name,
                    call.args || {},
                  );
                  // Send tool response back to Gemini
                  if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                      JSON.stringify({
                        tool_response: {
                          function_responses: [
                            {
                              id: call.id,
                              name: call.name,
                              response: { output: result },
                            },
                          ],
                        },
                      }),
                    );
                  }
                } catch (toolErr) {
                  console.error("[Voice] Tool execution error:", toolErr);
                  // Send error response
                  if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                      JSON.stringify({
                        tool_response: {
                          function_responses: [
                            {
                              id: call.id,
                              name: call.name,
                              response: { error: (toolErr as Error).message },
                            },
                          ],
                        },
                      }),
                    );
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("[Voice] Message parse error:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("[Voice] WebSocket error:", event);
        setError("Erreur de connexion au service vocal");
        setState("error");
      };

      ws.onclose = (event) => {
        console.log("[Voice] Connection closed:", event.code, event.reason);
        if (state !== "idle") {
          setState("idle");
        }
      };
    } catch (err) {
      console.error("[Voice] Start error:", err);
      setError(
        err instanceof Error ? err.message : "Erreur de démarrage vocal",
      );
      setState("error");
    }
  }, [isSupported, getVoiceConfig, playNextAudio, state, executeVoiceTool]);

  /**
   * Stop voice chat session
   */
  const stopVoice = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    // Cleanup audio context
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioQueueRef.current = [];
    isPlayingRef.current = false;

    setState("idle");
    setError(null);
  }, []);

  /**
   * Toggle voice on/off
   */
  const toggleVoice = useCallback(async () => {
    if (state === "idle" || state === "error") {
      await startVoice();
    } else {
      stopVoice();
    }
  }, [state, startVoice, stopVoice]);

  /**
   * Open the voice overlay and start listening
   */
  const openOverlay = useCallback(() => {
    console.log("[Voice] Opening overlay");
    setIsOpen(true);
    startVoice();
  }, [startVoice]);

  /**
   * Close the overlay and stop voice
   */
  const closeOverlay = useCallback(() => {
    console.log("[Voice] Closing overlay");
    stopVoice();
    setIsOpen(false);
  }, [stopVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  return {
    state,
    error,
    isSupported,
    isAvailable: !!isVoiceAvailable?.available,
    isOpen,
    startVoice,
    stopVoice,
    toggleVoice,
    openOverlay,
    closeOverlay,
  };
}
