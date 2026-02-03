/**
 * Voice Button Component
 * Displays a microphone button that activates voice chat with Gemini Live API
 */
import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoiceChat } from "./useVoiceChat";

interface VoiceButtonProps {
	className?: string;
}

export function VoiceButton({ className }: VoiceButtonProps) {
	const { state, error, isSupported, isAvailable, toggleVoice } =
		useVoiceChat();

	// Don't render if not supported
	if (!isSupported) {
		return null;
	}

	const getStateInfo = () => {
		switch (state) {
			case "connecting":
				return {
					icon: <Loader2 className="h-4 w-4 animate-spin" />,
					label: "Connexion...",
					color: "text-blue-500",
				};
			case "listening":
				return {
					icon: <Mic className="h-4 w-4" />,
					label: "Écoute...",
					color: "text-green-500",
				};
			case "processing":
				return {
					icon: <Loader2 className="h-4 w-4 animate-spin" />,
					label: "Traitement...",
					color: "text-yellow-500",
				};
			case "speaking":
				return {
					icon: <Volume2 className="h-4 w-4" />,
					label: "Parle...",
					color: "text-purple-500",
				};
			case "error":
				return {
					icon: <MicOff className="h-4 w-4" />,
					label: error || "Erreur",
					color: "text-red-500",
				};
			default:
				return {
					icon: <Mic className="h-4 w-4" />,
					label: "Appuyer pour parler",
					color: "",
				};
		}
	};

	const { icon, label, color } = getStateInfo();
	const isActive = state !== "idle" && state !== "error";

	return (
		<div className={cn("relative", className)}>
			<Button
				variant={isActive ? "default" : "ghost"}
				size="icon-sm"
				onClick={toggleVoice}
				disabled={!isAvailable && state === "idle"}
				title={label}
				className={cn(
					"relative transition-all",
					isActive && "bg-primary/90 text-primary-foreground",
					color,
				)}
			>
				{icon}

				{/* Pulsing indicator when listening */}
				<AnimatePresence>
					{state === "listening" && (
						<motion.span
							initial={{ scale: 1, opacity: 0.5 }}
							animate={{ scale: 1.5, opacity: 0 }}
							transition={{ duration: 1, repeat: Infinity }}
							className="absolute inset-0 rounded-full bg-green-500"
						/>
					)}
				</AnimatePresence>
			</Button>
		</div>
	);
}
