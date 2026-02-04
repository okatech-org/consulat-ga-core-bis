"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
	AlertTriangle,
	CreditCard,
	FileWarning,
	HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useConvexMutationQuery } from "@/integrations/convex/hooks";

const ACTION_TYPES = [
	{
		value: "upload_document",
		label: "Documents manquants",
		description: "Le citoyen doit fournir des documents supplémentaires",
		icon: FileWarning,
	},
	{
		value: "complete_info",
		label: "Informations manquantes",
		description: "Le citoyen doit compléter ou corriger des informations",
		icon: HelpCircle,
	},
	{
		value: "make_payment",
		label: "Paiement requis",
		description: "Le citoyen doit effectuer un paiement",
		icon: CreditCard,
	},
] as const;

type ActionType = (typeof ACTION_TYPES)[number]["value"];

interface RequestActionModalProps {
	requestId: Id<"requests">;
	onSuccess?: () => void;
}

export function RequestActionModal({
	requestId,
	onSuccess,
}: RequestActionModalProps) {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState<ActionType>("upload_document");
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { mutateAsync: setActionRequired } = useConvexMutationQuery(
		api.functions.requests.setActionRequired,
	);

	const handleSubmit = async () => {
		if (!message.trim()) {
			toast.error("Veuillez saisir un message pour le citoyen");
			return;
		}

		setIsSubmitting(true);
		try {
			await setActionRequired({
				requestId,
				type,
				message: message.trim(),
			});
			toast.success("Action requise envoyée au citoyen");
			setOpen(false);
			setMessage("");
			setType("upload_document");
			onSuccess?.();
		} catch (error) {
			console.error("Failed to set action required:", error);
			toast.error("Erreur lors de l'envoi de la demande");
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedType = ACTION_TYPES.find((t) => t.value === type);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<AlertTriangle className="h-4 w-4" />
					Demander une action
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Demander une action au citoyen</DialogTitle>
					<DialogDescription>
						Le citoyen sera notifié et verra un message dans sa demande lui
						indiquant l'action à effectuer.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Action type selection */}
					<div className="space-y-2">
						<Label>Type d'action requise</Label>
						<Select
							value={type}
							onValueChange={(v) => setType(v as ActionType)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ACTION_TYPES.map((actionType) => (
									<SelectItem key={actionType.value} value={actionType.value}>
										<div className="flex items-center gap-2">
											<actionType.icon className="h-4 w-4 text-muted-foreground" />
											<span>{actionType.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedType && (
							<p className="text-xs text-muted-foreground">
								{selectedType.description}
							</p>
						)}
					</div>

					{/* Message */}
					<div className="space-y-2">
						<Label htmlFor="message">Message pour le citoyen</Label>
						<Textarea
							id="message"
							placeholder="Expliquez clairement ce que le citoyen doit faire..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={4}
						/>
						<p className="text-xs text-muted-foreground">
							Soyez précis et expliquez exactement ce qui est attendu.
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isSubmitting}
					>
						Annuler
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? "Envoi..." : "Envoyer la demande"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
