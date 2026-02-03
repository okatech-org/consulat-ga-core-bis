/**
 * Voice Chat Hook - Manages Gemini Live API WebSocket connection
 *
 * This hook handles:
 * - Microphone access and audio recording
 * - WebSocket connection to Gemini Live API
 * - Audio playback of AI responses
 * - Connection state management
 */

import { useAction, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";

type VoiceState =
	| "idle"
	| "connecting"
	| "listening"
	| "processing"
	| "speaking"
	| "error";

interface VoiceChatState {
	state: VoiceState;
	error: string | null;
	isSupported: boolean;
	isAvailable: boolean;
}

interface UseVoiceChatReturn extends VoiceChatState {
	startVoice: () => Promise<void>;
	stopVoice: () => void;
	toggleVoice: () => Promise<void>;
}

export function useVoiceChat(): UseVoiceChatReturn {
	const [state, setState] = useState<VoiceState>("idle");
	const [error, setError] = useState<string | null>(null);

	// Refs to hold mutable state without re-renders
	const wsRef = useRef<WebSocket | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const processorRef = useRef<ScriptProcessorNode | null>(null);
	const audioQueueRef = useRef<Float32Array[]>([]);
	const isPlayingRef = useRef(false);

	// Convex queries/actions
	const voiceAvailability = useQuery(api.ai.voice.isVoiceAvailable);
	const getVoiceConfig = useAction(api.ai.voice.getVoiceConfig);

	// Check browser support
	const isSupported =
		typeof window !== "undefined" &&
		"mediaDevices" in navigator &&
		"getUserMedia" in navigator.mediaDevices &&
		"AudioContext" in window;

	const isAvailable = voiceAvailability?.available ?? false;

	/**
	 * Start voice session
	 */
	const startVoice = useCallback(async () => {
		if (!isSupported) {
			setError("Votre navigateur ne supporte pas l'audio");
			setState("error");
			return;
		}

		if (!isAvailable) {
			setError("Le service vocal n'est pas disponible");
			setState("error");
			return;
		}

		try {
			setState("connecting");
			setError(null);

			// Get voice configuration from backend
			const config = await getVoiceConfig({});

			// Request microphone access
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: 16000,
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
				},
			});
			mediaStreamRef.current = stream;

			// Create audio context for processing
			audioContextRef.current = new AudioContext({ sampleRate: 16000 });
			const source = audioContextRef.current.createMediaStreamSource(stream);

			// Create processor for capturing audio data
			// Note: ScriptProcessorNode is deprecated but still widely supported
			// For production, consider using AudioWorklet
			processorRef.current = audioContextRef.current.createScriptProcessor(
				4096,
				1,
				1,
			);

			// Connect to Gemini Live API via WebSocket
			const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${config.apiKey}`;
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("[Voice] Connected to Gemini Live API");

				// Send initial setup message
				ws.send(
					JSON.stringify({
						setup: {
							model: `models/${config.model}`,
							generationConfig: {
								responseModalities: ["AUDIO"],
							},
							systemInstruction: {
								parts: [{ text: config.config.systemInstruction }],
							},
							speechConfig: config.config.speechConfig,
						},
					}),
				);

				setState("listening");
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);

					// Handle setup complete
					if (data.setupComplete) {
						console.log("[Voice] Setup complete");

						// Start sending audio
						processorRef.current!.onaudioprocess = (e) => {
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								const inputData = e.inputBuffer.getChannelData(0);
								// Convert float32 to int16 PCM
								const pcm16 = new Int16Array(inputData.length);
								for (let i = 0; i < inputData.length; i++) {
									pcm16[i] = Math.max(
										-32768,
										Math.min(32767, inputData[i] * 32768),
									);
								}
								// Send as base64 - convert to Uint8Array safely
								const bytes = new Uint8Array(pcm16.buffer);
								let base64 = "";
								for (let j = 0; j < bytes.length; j++) {
									base64 += String.fromCharCode(bytes[j]);
								}
								base64 = btoa(base64);
								ws.send(
									JSON.stringify({
										realtimeInput: {
											mediaChunks: [
												{
													mimeType: "audio/pcm;rate=16000",
													data: base64,
												},
											],
										},
									}),
								);
							}
						};

						source.connect(processorRef.current!);
						processorRef.current!.connect(audioContextRef.current!.destination);
					}

					// Handle server content (audio response)
					if (data.serverContent) {
						if (data.serverContent.interrupted) {
							// Clear audio queue on interruption
							audioQueueRef.current = [];
							setState("listening");
						} else if (data.serverContent.modelTurn?.parts) {
							setState("speaking");
							for (const part of data.serverContent.modelTurn.parts) {
								if (part.inlineData?.data) {
									// Decode and queue audio for playback
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
				(err as Error).message || "Impossible de démarrer le microphone",
			);
			setState("error");
		}
	}, [isSupported, isAvailable, getVoiceConfig, state]);

	/**
	 * Play queued audio
	 */
	const playNextAudio = useCallback(() => {
		if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

		isPlayingRef.current = true;
		const audioData = audioQueueRef.current.shift()!;

		// Create playback context at 24kHz
		const playbackContext = new AudioContext({ sampleRate: 24000 });
		const buffer = playbackContext.createBuffer(1, audioData.length, 24000);
		// Copy channel data safely
		const channelData = buffer.getChannelData(0);
		for (let i = 0; i < audioData.length; i++) {
			channelData[i] = audioData[i];
		}

		const source = playbackContext.createBufferSource();
		source.buffer = buffer;
		source.connect(playbackContext.destination);
		source.onended = () => {
			isPlayingRef.current = false;
			playNextAudio();
		};
		source.start();
	}, []);

	/**
	 * Stop voice session
	 */
	const stopVoice = useCallback(() => {
		// Close WebSocket
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		// Stop microphone
		if (mediaStreamRef.current) {
			mediaStreamRef.current.getTracks().forEach((track) => track.stop());
			mediaStreamRef.current = null;
		}

		// Close audio context
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}

		// Clear processor
		if (processorRef.current) {
			processorRef.current.disconnect();
			processorRef.current = null;
		}

		// Clear audio queue
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
		isAvailable,
		startVoice,
		stopVoice,
		toggleVoice,
	};
}
