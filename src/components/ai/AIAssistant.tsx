"use client";
import { useLocation } from "@tanstack/react-router";
import {
	Bot,
	ExternalLink,
	Loader2,
	MessageSquare,
	Minus,
	Paperclip,
	Plus,
	Send,
	User,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type AIAction, type Message, useAIChat } from "./useAIChat";

// Enhanced contextual suggestions based on current page
const getContextualSuggestions = (pathname: string): string[] => {
	// Base suggestions always available
	const baseSuggestions = ["Services disponibles", "Mon profil"];

	// Profile page
	if (pathname.includes("/my-space/profile")) {
		return [
			"📷 Scanner mon passeport",
			"M'aider à remplir mon profil",
			"Quels documents dois-je fournir ?",
			...baseSuggestions,
		];
	}

	// Registration/Inscription page
	if (pathname.includes("/my-space/registration")) {
		return [
			"M'aider à remplir cette étape",
			"Quels documents sont requis ?",
			"Je suis bloqué, que faire ?",
			...baseSuggestions,
		];
	}

	// Request detail page
	if (pathname.match(/\/my-space\/requests\/[^/]+$/)) {
		return [
			"Que dois-je faire maintenant ?",
			"Manque-t-il des documents ?",
			"Comment contacter le consulat ?",
			...baseSuggestions,
		];
	}

	// Requests list page
	if (pathname.includes("/my-space/requests")) {
		return [
			"Où en est ma demande ?",
			"Démarrer une nouvelle demande",
			"M'expliquer les étapes",
			...baseSuggestions,
		];
	}

	// Documents page
	if (pathname.includes("/my-space/documents")) {
		return [
			"📷 Analyser un document",
			"Quels documents me manquent ?",
			"Comment télécharger mon passeport ?",
			...baseSuggestions,
		];
	}

	// Appointments page
	if (
		pathname.includes("/my-space/appointments") ||
		pathname.includes("/appointments")
	) {
		return [
			"Prendre rendez-vous",
			"Reporter mon rendez-vous",
			"Annuler mon rendez-vous",
			...baseSuggestions,
		];
	}

	// Service detail page
	if (pathname.match(/\/services\/[^/]+$/)) {
		return [
			"Quels documents pour ce service ?",
			"Démarrer cette demande",
			"Combien de temps ça prend ?",
			...baseSuggestions,
		];
	}

	// Services listing page
	if (pathname.includes("/services")) {
		return [
			"Comment renouveler mon passeport ?",
			"Quel service pour moi ?",
			"Délais de traitement",
			...baseSuggestions,
		];
	}

	// FAQ page
	if (pathname.includes("/faq")) {
		return ["Question fréquente", "Contacter le consulat", ...baseSuggestions];
	}

	// Default/Home suggestions
	return [
		"Comment renouveler mon passeport ?",
		"Mes demandes en cours",
		...baseSuggestions,
	];
};

function ChatMessage({ message }: { message: Message }) {
	const isAssistant = message.role === "assistant";

	return (
		<div
			className={cn(
				"flex gap-3 p-3 rounded-lg",
				isAssistant ? "bg-muted/50" : "bg-primary/5",
			)}
		>
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarFallback
					className={cn(
						isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary",
					)}
				>
					{isAssistant ? (
						<Bot className="h-4 w-4" />
					) : (
						<User className="h-4 w-4" />
					)}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 space-y-1 overflow-hidden">
				<p className="text-sm font-medium">
					{isAssistant ? "Assistant Consulat" : "Vous"}
				</p>
				{isAssistant ? (
					<div className="text-sm text-muted-foreground prose prose-sm prose-slate dark:prose-invert max-w-none break-words [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
						<Markdown>{message.content}</Markdown>
					</div>
				) : (
					<div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
						{message.content}
					</div>
				)}
			</div>
		</div>
	);
}

function ActionPreview({
	actions,
	onConfirm,
	onReject,
	isLoading,
}: {
	actions: AIAction[];
	onConfirm: (action: AIAction) => void;
	onReject: (action: AIAction) => void;
	isLoading: boolean;
}) {
	const getActionLabel = (action: AIAction) => {
		// Use the reason if provided (e.g., from document analysis)
		if (action.reason) {
			return action.reason;
		}

		switch (action.type) {
			case "createRequest":
				return `Créer une demande: ${action.args.serviceSlug}`;
			case "cancelRequest":
				return `Annuler la demande: ${action.args.requestId}`;
			case "fillForm":
				return `Pré-remplir le formulaire: ${action.args.formId}`;
			case "navigateTo":
				return `Naviguer vers: ${action.args.route}`;
			default:
				return action.type;
		}
	};

	const getActionIcon = (action: AIAction) => {
		switch (action.type) {
			case "createRequest":
				return <Plus className="h-4 w-4 text-green-600" />;
			case "cancelRequest":
				return <X className="h-4 w-4 text-red-600" />;
			case "fillForm":
				return <User className="h-4 w-4 text-blue-600" />;
			case "navigateTo":
				return <ExternalLink className="h-4 w-4 text-purple-600" />;
			default:
				return <ExternalLink className="h-4 w-4 text-muted-foreground" />;
		}
	};

	return (
		<div className="border-t bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="text-amber-700 border-amber-300">
					Action(s) en attente de confirmation
				</Badge>
			</div>
			{actions.map((action, i) => (
				<div
					key={i}
					className="flex items-center justify-between bg-background rounded-md p-3 border border-amber-200"
				>
					<div className="flex items-center gap-2">
						{getActionIcon(action)}
						<span className="text-sm font-medium">
							{getActionLabel(action)}
						</span>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => onReject(action)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							size="sm"
							variant="default"
							onClick={() => onConfirm(action)}
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Confirmer"
							)}
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}

function ChatInput({
	onSend,
	onSendImage,
	isLoading,
}: {
	onSend: (message: string) => void;
	onSendImage: (imageBase64: string, mimeType: string) => void;
	isLoading: boolean;
}) {
	const [value, setValue] = useState("");
	const [imagePreview, setImagePreview] = useState<{
		base64: string;
		mimeType: string;
		fileName?: string;
	} | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSend = () => {
		if (imagePreview) {
			// Send image for analysis
			onSendImage(imagePreview.base64, imagePreview.mimeType);
			setImagePreview(null);
		} else if (value.trim() && !isLoading) {
			onSend(value.trim());
			setValue("");
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type - accept images and PDFs
		const isImage = file.type.startsWith("image/");
		const isPdf = file.type === "application/pdf";

		if (!isImage && !isPdf) {
			return;
		}

		// Validate file size (max 20MB for PDFs, 10MB for images)
		const maxSize = isPdf ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return;
		}

		// Convert to base64
		const reader = new FileReader();
		reader.onload = () => {
			const base64 = (reader.result as string).split(",")[1];
			setImagePreview({ base64, mimeType: file.type, fileName: file.name });
		};
		reader.readAsDataURL(file);

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeImage = () => {
		setImagePreview(null);
	};

	return (
		<div className="border-t p-3 space-y-2">
			{/* Document Preview */}
			{imagePreview && (
				<div className="relative inline-block">
					{imagePreview.mimeType === "application/pdf" ? (
						<div className="h-20 w-20 rounded-lg border bg-muted flex items-center justify-center">
							<div className="text-center">
								<div className="text-2xl">📄</div>
								<div className="text-xs text-muted-foreground truncate max-w-[70px]">
									{imagePreview.fileName || "PDF"}
								</div>
							</div>
						</div>
					) : (
						<img
							src={`data:${imagePreview.mimeType};base64,${imagePreview.base64}`}
							alt="Document à analyser"
							className="h-20 rounded-lg border object-cover"
						/>
					)}
					<button
						onClick={removeImage}
						className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
					>
						×
					</button>
					<Badge
						variant="secondary"
						className="absolute bottom-1 left-1 text-xs"
					>
						{imagePreview.mimeType === "application/pdf" ? "PDF" : "Image"}
					</Badge>
				</div>
			)}

			{/* Input Row */}
			<div className="flex gap-2">
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*,application/pdf"
					onChange={handleFileSelect}
					className="hidden"
				/>

				{/* Upload button */}
				<Button
					variant="ghost"
					size="icon"
					className="shrink-0 self-end"
					onClick={() => fileInputRef.current?.click()}
					disabled={isLoading}
					title="Joindre un document (passeport, carte d'identité...)"
				>
					<Paperclip className="h-4 w-4" />
				</Button>

				<Textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={
						imagePreview
							? "Appuyez sur Envoyer pour analyser le document"
							: "Comment puis-je vous aider ?"
					}
					className="min-h-[60px] max-h-[120px] resize-none"
					disabled={isLoading}
				/>
				<Button
					onClick={handleSend}
					disabled={(!value.trim() && !imagePreview) || isLoading}
					size="icon"
					className="shrink-0 self-end"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Send className="h-4 w-4" />
					)}
				</Button>
			</div>
		</div>
	);
}

export function AIAssistant() {
	const [open, setOpen] = useState(false);
	const location = useLocation();
	const {
		messages,
		isLoading,
		error,
		pendingActions,
		sendMessage,
		analyzeImage,
		confirmAction,
		rejectAction,
		newConversation,
	} = useAIChat();

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Get contextual suggestions based on current page
	const suggestions = getContextualSuggestions(location.pathname);

	// Auto-scroll to bottom
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Listen for external open event (from header button)
	useEffect(() => {
		const handleOpen = () => setOpen(true);
		window.addEventListener("openAIAssistant", handleOpen);
		return () => window.removeEventListener("openAIAssistant", handleOpen);
	}, []);

	return (
		<>
			{/* Floating Action Button (FAB) - visible when chat is closed */}
			<AnimatePresence>
				{!open && (
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{ type: "spring", damping: 20, stiffness: 300 }}
						className="fixed bottom-6 right-6 z-50"
					>
						<Button
							size="lg"
							className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
							onClick={() => setOpen(true)}
							aria-label="Ouvrir l'assistant IA"
						>
							<Bot className="h-6 w-6" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Chat Window - visible when open */}
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="fixed bottom-6 right-6 w-[calc(100vw-48px)] sm:w-[420px] 
						           h-[min(600px,calc(100vh-100px))] rounded-2xl shadow-2xl z-50 
						           bg-background border flex flex-col overflow-hidden"
					>
						{/* Header */}
						<div className="border-b px-4 py-3 flex items-center justify-between shrink-0 bg-background">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
									<Bot className="h-5 w-5 text-primary-foreground" />
								</div>
								<div>
									<h2 className="text-base font-semibold">
										Assistant Consulat
									</h2>
									<p className="text-xs text-muted-foreground">
										Je suis là pour vous aider
									</p>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={newConversation}
									title="Nouvelle conversation"
								>
									<Plus className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => setOpen(false)}
									title="Fermer"
								>
									<Minus className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							{messages.length === 0 ? (
								<div className="h-full flex flex-col items-center justify-center text-center p-4">
									<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
										<MessageSquare className="h-7 w-7 text-primary" />
									</div>
									<h3 className="font-medium mb-2">Bienvenue !</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Je suis l'assistant IA du Consulat du Gabon. Comment puis-je
										vous aider aujourd'hui ?
									</p>
									<div className="flex flex-wrap gap-2 justify-center">
										{suggestions.slice(0, 4).map((suggestion) => (
											<Badge
												key={suggestion}
												variant="secondary"
												className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs"
												onClick={() => sendMessage(suggestion)}
											>
												{suggestion}
											</Badge>
										))}
									</div>
								</div>
							) : (
								<>
									{messages.map((msg, i) => (
										<ChatMessage key={i} message={msg} />
									))}
									{isLoading && (
										<div className="flex gap-3 p-3 rounded-lg bg-muted/50">
											<Avatar className="h-8 w-8 shrink-0">
												<AvatarFallback className="bg-primary text-primary-foreground">
													<Bot className="h-4 w-4" />
												</AvatarFallback>
											</Avatar>
											<div className="flex items-center gap-2">
												<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
												<span className="text-sm text-muted-foreground">
													Réflexion en cours...
												</span>
											</div>
										</div>
									)}
									<div ref={messagesEndRef} />
								</>
							)}

							{error && (
								<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
									{error}
								</div>
							)}
						</div>

						{/* Actions Preview */}
						{pendingActions.length > 0 && (
							<ActionPreview
								actions={pendingActions}
								onConfirm={confirmAction}
								onReject={rejectAction}
								isLoading={isLoading}
							/>
						)}

						{/* Input */}
						<ChatInput
							onSend={sendMessage}
							onSendImage={analyzeImage}
							isLoading={isLoading}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
