import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { RequestStatus, ServiceCategory } from "@convex/lib/constants";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	CreditCard,
	FileText,
	Loader2,
	Sparkles,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useFormFillOptional } from "@/components/ai/FormFillContext";
import { ActionRequiredCard } from "@/components/my-space/ActionRequiredCard";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { DynamicForm } from "@/components/services/DynamicForm";
import { RegistrationForm } from "@/components/services/RegistrationForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUserData } from "@/hooks/use-user-data";
import { getLocalizedValue } from "@/lib/i18n-utils";

export const Route = createFileRoute("/my-space/requests/$requestId")({
	component: UserRequestDetail,
});

// ============ Schema Types & Form Data Display ============

interface FormSchemaProperty {
	type?: string;
	title?: { fr: string; en?: string } | string;
	description?: { fr: string; en?: string };
	properties?: Record<string, FormSchemaProperty>;
	required?: string[];
}

interface FormSchema {
	properties?: Record<string, FormSchemaProperty>;
	"x-ui-order"?: string[];
}

// Helper to get localized string
function getLocalized(
	obj: { fr: string; en?: string } | string | undefined,
): string {
	if (!obj) return "";
	if (typeof obj === "string") return obj;
	return obj.fr || obj.en || "";
}

// Helper to render values properly
function renderValue(value: unknown): string {
	if (value === null || value === undefined) return "-";
	if (typeof value === "boolean") return value ? "Oui" : "Non";
	if (typeof value === "object") {
		if ("fr" in (value as object)) {
			return String((value as { fr: string }).fr);
		}
		return JSON.stringify(value);
	}
	return String(value);
}

// Build lookup maps from schema
function buildSchemaLookups(schema: FormSchema | undefined) {
	const sectionLabels: Record<string, string> = {};
	const fieldLabels: Record<string, string> = {};

	if (!schema?.properties) return { sectionLabels, fieldLabels };

	for (const [sectionId, sectionProp] of Object.entries(schema.properties)) {
		sectionLabels[sectionId] = getLocalized(sectionProp.title) || sectionId;

		if (sectionProp.properties) {
			for (const [fieldId, fieldProp] of Object.entries(
				sectionProp.properties,
			)) {
				fieldLabels[`${sectionId}.${fieldId}`] =
					getLocalized(fieldProp.title) || fieldId;
				fieldLabels[fieldId] = getLocalized(fieldProp.title) || fieldId;
			}
		}
	}

	return { sectionLabels, fieldLabels };
}

// Form Data Display Component
function FormDataDisplay({
	formData,
	formSchema,
}: {
	formData: Record<string, unknown>;
	formSchema?: FormSchema;
}) {
	const { sectionLabels, fieldLabels } = useMemo(
		() => buildSchemaLookups(formSchema),
		[formSchema],
	);

	const getSectionLabel = (sectionId: string): string => {
		return sectionLabels[sectionId] || sectionId.replace(/^section_\d+_/i, "");
	};

	const getFieldLabel = (sectionId: string, fieldId: string): string => {
		return (
			fieldLabels[`${sectionId}.${fieldId}`] ||
			fieldLabels[fieldId] ||
			fieldId.replace(/^field_\d+_/i, "")
		);
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">Données soumises</p>
			<div className="space-y-4">
				{Object.entries(formData).map(([sectionId, sectionData]) => {
					// Handle nested section
					if (
						typeof sectionData === "object" &&
						sectionData !== null &&
						!Array.isArray(sectionData) &&
						!("fr" in sectionData)
					) {
						return (
							<div
								key={sectionId}
								className="rounded-lg border overflow-hidden"
							>
								<div className="bg-muted/50 px-3 py-2 border-b">
									<p className="text-sm font-medium">
										{getSectionLabel(sectionId)}
									</p>
								</div>
								<div className="p-3 space-y-2">
									{Object.entries(sectionData as Record<string, unknown>).map(
										([fieldId, value]) => (
											<div
												key={fieldId}
												className="flex justify-between text-sm"
											>
												<span className="text-muted-foreground">
													{getFieldLabel(sectionId, fieldId)}
												</span>
												<span className="font-medium text-right max-w-[60%] truncate">
													{renderValue(value)}
												</span>
											</div>
										),
									)}
								</div>
							</div>
						);
					}

					// Handle flat field
					return (
						<div key={sectionId} className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								{getSectionLabel(sectionId)}
							</span>
							<span className="font-medium">{renderValue(sectionData)}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// Helper to get human-readable status labels
function getStatusLabel(
	status: string,
	t: (key: string, fallback: string) => string,
): string {
	const statusLabels: Record<string, string> = {
		draft: t("requests.statuses.draft", "Brouillon"),
		pending: t("requests.statuses.pending", "En attente"),
		processing: t("requests.statuses.processing", "En traitement"),
		completed: t("requests.statuses.completed", "Terminé"),
		cancelled: t("requests.statuses.cancelled", "Annulé"),
		// Legacy statuses for backwards compatibility
		submitted: t("requests.statuses.submitted", "Soumise"),
		under_review: t("requests.statuses.underReview", "En examen"),
		in_production: t("requests.statuses.inProduction", "En production"),
		rejected: t("requests.statuses.rejected", "Rejeté"),
	};
	return statusLabels[status] || status;
}

function UserRequestDetail() {
	const { requestId } = Route.useParams();
	const { t, i18n } = useTranslation();
	const { profile } = useUserData();
	const formFillContext = useFormFillOptional();

	const request = useQuery(api.functions.requests.getById, {
		requestId: requestId as Id<"requests">,
	});
	const cancelRequest = useMutation(api.functions.requests.cancel);
	const deleteDraft = useMutation(api.functions.requests.deleteDraft);
	const submitRequest = useMutation(api.functions.requests.submit);
	const navigate = useNavigate();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const isDraft = request?.status === RequestStatus.Draft;
	const canCancel =
		request?.status === RequestStatus.Draft ||
		request?.status === RequestStatus.Pending;

	const handleAction = async () => {
		try {
			if (isDraft) {
				// Delete draft permanently
				await deleteDraft({ requestId: requestId as Id<"requests"> });
				toast.success(t("requests.detail.deleted", "Brouillon supprimé"));
				navigate({ to: "/my-space/requests" });
			} else {
				// Cancel pending request
				await cancelRequest({ requestId: requestId as Id<"requests"> });
				toast.success(t("requests.detail.cancelled", "Demande annulée"));
			}
		} catch (e) {
			const error = e as Error;
			toast.error(
				error.message ||
					t("requests.detail.cancelError", "Erreur lors de l'opération"),
			);
		}
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			[RequestStatus.Draft]: "secondary",
			[RequestStatus.Pending]: "secondary",
			[RequestStatus.Processing]: "default",
			[RequestStatus.Completed]: "default",
			[RequestStatus.Cancelled]: "outline",
		};

		const labels: Record<string, string> = {
			[RequestStatus.Draft]: t("requests.statuses.draft", "Brouillon"),
			[RequestStatus.Pending]: t("requests.statuses.pending", "En attente"),
			[RequestStatus.Processing]: t(
				"requests.statuses.processing",
				"En traitement",
			),
			[RequestStatus.Completed]: t("requests.statuses.completed", "Terminé"),
			[RequestStatus.Cancelled]: t("requests.statuses.cancelled", "Annulé"),
		};

		return (
			<Badge variant={variants[status] || "outline"}>
				{labels[status] || status}
			</Badge>
		);
	};

	if (!request) {
		return (
			<div className="flex flex-1 items-center justify-center p-4">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Filter to only show public notes (not internal)
	const publicNotes =
		request.notes?.filter(
			(note: { isInternal?: boolean }) => !note.isInternal,
		) || [];

	// Check service type for rendering
	const isRegistrationService =
		request.service?.category === ServiceCategory.Registration;
	const orgService = request.orgService;

	// Handle Form Submission for drafts
	const handleSubmit = async (data: Record<string, unknown>) => {
		setIsSubmitting(true);
		try {
			await submitRequest({
				requestId: request._id,
				formData: data,
			});

			const requiresAppointment = (
				request.service as { requiresAppointment?: boolean } | undefined
			)?.requiresAppointment;

			if (requiresAppointment) {
				toast.success(
					t("request.submitted_success", "Demande soumise avec succès"),
					{
						description: t(
							"request.appointment_required",
							"Veuillez maintenant prendre rendez-vous.",
						),
					},
				);
				navigate({ to: `/my-space/requests/${request._id}/appointment` });
			} else {
				toast.success(
					t("request.submitted_success", "Demande soumise avec succès"),
					{
						description: t(
							"request.submitted_description",
							"Vous recevrez une notification lorsque le statut changera.",
						),
					},
				);
				// Refresh the page to show the updated status
				navigate({ to: "/my-space/requests" });
			}
		} catch (error) {
			console.error("Failed to submit request:", error);
			toast.error(t("error.generic", "Erreur"), {
				description: t(
					"error.request_failed",
					"Impossible de soumettre la demande.",
				),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Trigger AI Fill
	const handleAIFill = () => {
		toast.info("🤖 Assistant IA", {
			description:
				"Ouvrez l'assistant et demandez-lui de remplir le formulaire avec votre passeport.",
		});
	};

	// ===== DRAFT MODE: Show form for editing =====
	if (isDraft) {
		return (
			<div className="flex flex-col min-h-screen bg-gradient-to-b from-muted/30 to-background">
				{/* Header */}
				<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
					<div className="container flex items-center gap-4 h-14 px-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate({ to: "/my-space/requests" })}
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div className="flex-1">
							<h1 className="font-semibold truncate">
								{getLocalizedValue(
									request.service?.name as
										| { fr: string; en?: string }
										| undefined,
									i18n.language,
								) || t("requests.detail.newRequest", "Nouvelle demande")}
							</h1>
							<p className="text-xs text-muted-foreground">
								{t("requests.statuses.draft", "Brouillon")}
							</p>
						</div>
						{/* AI Fill Button */}
						{formFillContext && (
							<Button variant="outline" size="sm" onClick={handleAIFill}>
								<Sparkles className="mr-2 h-4 w-4 text-amber-500" />
								{t("form.fillWithAI", "Remplir avec l'IA")}
							</Button>
						)}
						{getStatusBadge(request.status)}
					</div>
				</header>

				{/* Main Content */}
				<main className="flex-1 container py-8 px-4 max-w-2xl mx-auto">
					{/* Service Info Card */}
					<Card className="mb-6 border-primary/20 bg-primary/5">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-4">
								<div>
									<CardTitle className="text-lg">
										{getLocalizedValue(
											request.service?.name as
												| { fr: string; en?: string }
												| undefined,
											i18n.language,
										)}
									</CardTitle>
									<CardDescription className="mt-1">
										{getLocalizedValue(
											request.service?.description as
												| { fr: string; en?: string }
												| undefined,
											i18n.language,
										)}
									</CardDescription>
								</div>
								{orgService?.estimatedDays && (
									<Badge variant="secondary" className="shrink-0">
										~{orgService.estimatedDays} {t("common.days", "jours")}
									</Badge>
								)}
							</div>
						</CardHeader>
						{orgService?.instructions && (
							<CardContent className="text-sm text-muted-foreground border-t pt-3">
								<p>{orgService.instructions}</p>
							</CardContent>
						)}
					</Card>

					{/* Form - Registration or Dynamic */}
					{isRegistrationService && profile ? (
						<RegistrationForm
							profile={profile}
							requiredDocuments={orgService?.formSchema?.joinedDocuments || []}
							onSubmit={async () => {
								await handleSubmit({});
							}}
							isSubmitting={isSubmitting}
						/>
					) : (
						<DynamicForm
							schema={orgService?.formSchema}
							defaultValues={
								request.formData as Record<string, unknown> | undefined
							}
							onSubmit={handleSubmit}
							isSubmitting={isSubmitting}
						/>
					)}
				</main>
			</div>
		);
	}

	// ===== READ-ONLY MODE: Show request details =====
	return (
		<div className="space-y-6 animate-in fade-in p-1">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/my-space/requests">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold tracking-tight">
						{t("requests.detail.title", "Demande {{ref}}", {
							ref: request.reference || "#" + requestId.slice(-6),
						})}
					</h1>
					<p className="text-muted-foreground">
						{t("requests.detail.createdAt", "Créée le {{date}}", {
							date: new Date(request._creationTime).toLocaleDateString(),
						})}
					</p>
				</div>
				{getStatusBadge(request.status)}
			</div>

			{/* Action Required Card - VISIBLE TO CITIZEN with integrated form */}
			{request.actionRequired && (
				<ActionRequiredCard
					requestId={request._id}
					actionRequired={request.actionRequired as any}
				/>
			)}

			<div className="grid gap-6 md:grid-cols-3">
				{/* Main Content */}
				<div className="md:col-span-2 space-y-6">
					{/* Service Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								{t("requests.detail.serviceInfo", "Informations du service")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">
									{t("requests.detail.serviceName", "Service demandé")}
								</p>
								<p className="font-medium">
									{getLocalizedValue(
										(request.service as any)?.name,
										i18n.language,
									) || t("requests.detail.unknownService", "Service inconnu")}
								</p>
							</div>

							{request.org && (
								<div>
									<p className="text-sm text-muted-foreground">
										{t("requests.detail.organization", "Organisme")}
									</p>
									<p className="font-medium">{(request.org as any)?.name}</p>
								</div>
							)}

							{request.formData && Object.keys(request.formData).length > 0 && (
								<FormDataDisplay
									formData={request.formData as Record<string, unknown>}
									formSchema={
										request.orgService?.formSchema as FormSchema | undefined
									}
								/>
							)}
						</CardContent>
					</Card>

					{/* Payment Section */}
					{(() => {
						const pricing = (request.orgService as any)?.pricing;
						const needsPayment =
							pricing &&
							pricing.amount > 0 &&
							request.paymentStatus !== "succeeded";
						const serviceName =
							getLocalizedValue(
								(request.service as any)?.name,
								i18n.language,
							) || "Service";

						if (!needsPayment) return null;

						return (
							<Card className="border-primary/20">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CreditCard className="h-5 w-5" />
										{t("payment.title", "Paiement")}
									</CardTitle>
									<CardDescription>
										{request.paymentStatus === "pending" ||
										request.paymentStatus === "processing"
											? t("payment.pending", "Paiement en cours de traitement")
											: t(
													"payment.required",
													"Paiement requis pour ce service",
												)}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{request.paymentStatus === "failed" && (
										<Alert variant="destructive" className="mb-4">
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												{t(
													"payment.failed",
													"Le paiement a échoué. Veuillez réessayer.",
												)}
											</AlertDescription>
										</Alert>
									)}
									<PaymentForm
										requestId={request._id}
										amount={pricing.amount}
										currency={pricing.currency || "eur"}
										serviceName={serviceName}
										onSuccess={() => {
											toast.success(
												t(
													"payment.successToast",
													"Paiement effectué avec succès !",
												),
											);
										}}
									/>
								</CardContent>
							</Card>
						);
					})()}

					{/* Documents/Attachments */}
					{request.documents && request.documents.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									{t("requests.detail.attachments", "Pièces jointes")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{request.documents.map((doc: any) => (
										<div
											key={doc._id}
											className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
										>
											<div className="flex items-center gap-3 min-w-0">
												<div className="p-2 bg-primary/10 rounded-md shrink-0">
													<FileText className="h-4 w-4 text-primary" />
												</div>
												<div className="min-w-0">
													<p className="text-sm font-medium truncate">
														{doc.filename || doc.name}
													</p>
													<p className="text-xs text-muted-foreground">
														{doc.sizeBytes
															? `${(doc.sizeBytes / 1024).toFixed(0)} KB`
															: ""}
													</p>
												</div>
											</div>
											{doc.url && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => window.open(doc.url, "_blank")}
												>
													{t("common.view", "Voir")}
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								{t("requests.detail.timeline", "Chronologie")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 text-sm">
								{/* Creation */}
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										{t("requests.detail.created", "Créée")}
									</span>
									<span>
										{new Date(request._creationTime).toLocaleDateString(
											"fr-FR",
											{
												day: "numeric",
												month: "short",
												year: "numeric",
											},
										)}
									</span>
								</div>

								{/* Status changes from history */}
								{request.statusHistory?.map(
									(event: {
										_id: string;
										type: string;
										from?: string;
										to?: string;
										createdAt: number;
									}) => (
										<div
											key={event._id}
											className="flex justify-between border-t pt-2"
										>
											<span className="text-muted-foreground">
												{getStatusLabel(event.to || "unknown", t)}
											</span>
											<span>
												{new Date(event.createdAt).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</span>
										</div>
									),
								)}

								{/* Fallback if no status history */}
								{(!request.statusHistory ||
									request.statusHistory.length === 0) &&
									request.submittedAt && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												{t("requests.detail.submitted", "Soumise")}
											</span>
											<span>
												{new Date(request.submittedAt).toLocaleDateString(
													"fr-FR",
													{
														day: "numeric",
														month: "short",
														year: "numeric",
													},
												)}
											</span>
										</div>
									)}
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					{canCancel && (
						<Card className="border-destructive/20">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-5 w-5" />
									{t("requests.detail.actions", "Actions")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" className="w-full">
											<X className="mr-2 h-4 w-4" />
											{isDraft
												? t("requests.detail.delete", "Supprimer le brouillon")
												: t("requests.detail.cancel", "Annuler la demande")}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												{isDraft
													? t(
															"requests.detail.deleteConfirmTitle",
															"Supprimer ce brouillon ?",
														)
													: t(
															"requests.detail.cancelConfirmTitle",
															"Annuler cette demande ?",
														)}
											</AlertDialogTitle>
											<AlertDialogDescription>
												{isDraft
													? t(
															"requests.detail.deleteConfirmDesc",
															"Cette action est irréversible. Le brouillon et ses documents seront définitivement supprimés.",
														)
													: t(
															"requests.detail.cancelConfirmDesc",
															"Cette action est irréversible. La demande sera définitivement annulée.",
														)}
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>
												{t("common.cancel", "Annuler")}
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleAction}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												{isDraft
													? t(
															"requests.detail.confirmDelete",
															"Confirmer la suppression",
														)
													: t(
															"requests.detail.confirmCancel",
															"Confirmer l'annulation",
														)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
