"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
	Calendar,
	Check,
	CreditCard,
	FileText,
	FileUp,
	Loader2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ActionRequired {
	type:
		| "upload_document"
		| "complete_info"
		| "schedule_appointment"
		| "make_payment"
		| "confirm_info";
	message: string;
	documentTypes?: string[];
	fields?: string[];
	infoToConfirm?: string;
	deadline?: number;
	completedAt?: number;
}

interface ActionRequiredCardProps {
	requestId: Id<"requests">;
	actionRequired: ActionRequired;
	onComplete?: () => void;
}

export function ActionRequiredCard({
	requestId,
	actionRequired,
	onComplete,
}: ActionRequiredCardProps) {
	const { t } = useTranslation();
	const respondToAction = useMutation(api.functions.requests.respondToAction);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [confirmed, setConfirmed] = useState(false);
	const [formData, setFormData] = useState<Record<string, string>>({});

	// If already completed, show success state
	if (actionRequired.completedAt) {
		return (
			<Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
				<Check className="h-5 w-5 text-green-600" />
				<AlertTitle className="text-green-800 dark:text-green-400">
					{t("requests.actionCompleted", "Réponse envoyée")}
				</AlertTitle>
				<AlertDescription className="text-green-700 dark:text-green-300">
					{t(
						"requests.actionCompletedDesc",
						"Votre réponse a bien été prise en compte. Un agent la traitera dans les plus brefs délais.",
					)}
				</AlertDescription>
			</Alert>
		);
	}

	const getTypeInfo = () => {
		switch (actionRequired.type) {
			case "upload_document":
				return {
					icon: <FileUp className="h-5 w-5 text-amber-600" />,
					label: t("requests.actionTypes.documents", "Documents manquants"),
				};
			case "complete_info":
				return {
					icon: <FileText className="h-5 w-5 text-amber-600" />,
					label: t("requests.actionTypes.info", "Informations à compléter"),
				};
			case "schedule_appointment":
				return {
					icon: <Calendar className="h-5 w-5 text-amber-600" />,
					label: t("requests.actionTypes.appointment", "Rendez-vous à prendre"),
				};
			case "make_payment":
				return {
					icon: <CreditCard className="h-5 w-5 text-amber-600" />,
					label: t("requests.actionTypes.payment", "Paiement requis"),
				};
			case "confirm_info":
				return {
					icon: <Check className="h-5 w-5 text-amber-600" />,
					label: t("requests.actionTypes.confirm", "Confirmation requise"),
				};
		}
	};

	const typeInfo = getTypeInfo();

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			await respondToAction({
				requestId,
				formData: Object.keys(formData).length > 0 ? formData : undefined,
				confirmed:
					actionRequired.type === "confirm_info" ? confirmed : undefined,
			});
			toast.success(t("requests.actionSent", "Réponse envoyée avec succès"));
			onComplete?.();
		} catch (error) {
			toast.error(t("requests.actionError", "Erreur lors de l'envoi"));
			console.error("Error responding to action:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderForm = () => {
		switch (actionRequired.type) {
			case "upload_document":
				return (
					<div className="mt-4 space-y-3">
						{actionRequired.documentTypes?.map((docType) => (
							<div
								key={docType}
								className="flex items-center gap-3 p-3 border rounded-md"
							>
								<FileUp className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">{docType}</span>
								<Badge variant="outline" className="ml-auto text-xs">
									{t("requests.required", "Requis")}
								</Badge>
							</div>
						))}
						<p className="text-xs text-muted-foreground mt-2">
							{t(
								"requests.uploadHint",
								"Utilisez la section 'Pièces jointes' ci-dessous pour télécharger vos documents, puis cliquez sur 'Envoyer ma réponse'.",
							)}
						</p>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting}
							className="w-full mt-4"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Check className="h-4 w-4 mr-2" />
							)}
							{t("requests.confirmUpload", "J'ai téléchargé mes documents")}
						</Button>
					</div>
				);

			case "complete_info":
				return (
					<div className="mt-4 space-y-3">
						{actionRequired.fields?.map((field) => (
							<div key={field} className="space-y-1.5">
								<Label htmlFor={field}>{field}</Label>
								<Input
									id={field}
									value={formData[field] || ""}
									onChange={(e) =>
										setFormData({ ...formData, [field]: e.target.value })
									}
									placeholder={`Entrez ${field.toLowerCase()}`}
								/>
							</div>
						))}
						<Button
							onClick={handleSubmit}
							disabled={
								isSubmitting || actionRequired.fields?.some((f) => !formData[f])
							}
							className="w-full mt-4"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Check className="h-4 w-4 mr-2" />
							)}
							{t("requests.sendInfo", "Envoyer mes informations")}
						</Button>
					</div>
				);

			case "schedule_appointment":
				return (
					<div className="mt-4 space-y-3">
						<p className="text-sm text-muted-foreground">
							{t(
								"requests.appointmentHint",
								"Veuillez contacter le consulat pour prendre rendez-vous ou utiliser le système de réservation en ligne si disponible.",
							)}
						</p>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting}
							variant="outline"
							className="w-full"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Calendar className="h-4 w-4 mr-2" />
							)}
							{t("requests.confirmAppointment", "J'ai pris rendez-vous")}
						</Button>
					</div>
				);

			case "make_payment":
				return (
					<div className="mt-4 space-y-3">
						<p className="text-sm text-muted-foreground">
							{t(
								"requests.paymentHint",
								"Cliquez sur le bouton ci-dessous pour procéder au paiement sécurisé.",
							)}
						</p>
						<Button className="w-full" variant="default">
							<CreditCard className="h-4 w-4 mr-2" />
							{t("requests.payNow", "Procéder au paiement")}
						</Button>
					</div>
				);

			case "confirm_info":
				return (
					<div className="mt-4 space-y-3">
						{actionRequired.infoToConfirm && (
							<div className="p-4 bg-muted/50 rounded-md">
								<p className="text-sm whitespace-pre-wrap">
									{actionRequired.infoToConfirm}
								</p>
							</div>
						)}
						<div className="flex items-start gap-3 mt-4">
							<Checkbox
								id="confirm"
								checked={confirmed}
								onCheckedChange={(checked) => setConfirmed(checked === true)}
							/>
							<Label
								htmlFor="confirm"
								className="text-sm leading-snug cursor-pointer"
							>
								{t(
									"requests.confirmInfoLabel",
									"Je confirme que les informations ci-dessus sont exactes",
								)}
							</Label>
						</div>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting || !confirmed}
							className="w-full mt-4"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Check className="h-4 w-4 mr-2" />
							)}
							{t("requests.confirmAndSend", "Confirmer")}
						</Button>
					</div>
				);
		}
	};

	return (
		<Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
			{typeInfo.icon}
			<AlertTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
				{t("requests.detail.actionRequired", "Action requise de votre part")}
				<Badge variant="outline" className="text-xs">
					{typeInfo.label}
				</Badge>
			</AlertTitle>
			<AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
				{actionRequired.message}
			</AlertDescription>
			{renderForm()}
		</Alert>
	);
}
