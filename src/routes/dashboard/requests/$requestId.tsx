"use client";

import { api } from "@convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, ArrowLeft, Loader2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RequestActionModal } from "@/components/admin/RequestActionModal";
import { DocumentChecklist } from "@/components/shared/DocumentChecklist";
import { RequestChat } from "@/components/shared/RequestChat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/requests/$requestId")({
	component: RequestDetailPage,
});

// Helper to get localized string
function getLocalized(
	obj: { fr: string; en?: string } | string | undefined,
): string {
	if (!obj) return "";
	if (typeof obj === "string") return obj;
	return obj.fr || obj.en || "";
}

// Helper to render form data values properly
function renderValue(value: unknown): string | null {
	if (value === null || value === undefined) return "-";
	if (typeof value === "boolean") return value ? "Oui" : "Non";

	// Skip document ID arrays (they're displayed in Pièces jointes section)
	if (Array.isArray(value)) {
		// Check if it looks like an array of document IDs (long alphanumeric strings)
		if (
			value.every((v) => typeof v === "string" && /^[a-z0-9]{20,}$/i.test(v))
		) {
			return null; // Signal to skip rendering this field
		}
		return value.join(", ");
	}

	if (typeof value === "object") {
		// Handle localized objects like { fr: "...", en: "..." }
		if ("fr" in (value as object)) {
			return String((value as { fr: string }).fr);
		}
		return JSON.stringify(value);
	}
	return String(value);
}

// Type for form schema
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

// Build lookup maps from schema
function buildSchemaLookups(schema: FormSchema | undefined) {
	const sectionLabels: Record<string, string> = {};
	const fieldLabels: Record<string, string> = {};

	if (!schema?.properties) return { sectionLabels, fieldLabels };

	for (const [sectionId, sectionProp] of Object.entries(schema.properties)) {
		// Get section title
		sectionLabels[sectionId] = getLocalized(sectionProp.title) || sectionId;

		// Get field labels within section
		if (sectionProp.properties) {
			for (const [fieldId, fieldProp] of Object.entries(
				sectionProp.properties,
			)) {
				fieldLabels[`${sectionId}.${fieldId}`] =
					getLocalized(fieldProp.title) || fieldId;
				// Also store just the field ID for simpler lookup
				fieldLabels[fieldId] = getLocalized(fieldProp.title) || fieldId;
			}
		}
	}

	return { sectionLabels, fieldLabels };
}

function RequestDetailPage() {
	const { requestId } = Route.useParams();
	const navigate = useNavigate();

	const request = useQuery(api.functions.requests.getById, {
		requestId: requestId as any,
	});
	const updateStatus = useMutation(api.functions.requests.updateStatus);
	const addNote = useMutation(api.functions.requests.addNote);
	const validateDocument = useMutation(api.functions.documents.validate);

	const [noteContent, setNoteContent] = useState("");
	const [isNoteInternal] = useState(true);

	// Build label lookups from formSchema
	const { sectionLabels, fieldLabels } = useMemo(() => {
		const schema = request?.orgService?.formSchema as FormSchema | undefined;
		return buildSchemaLookups(schema);
	}, [request?.orgService?.formSchema]);

	if (request === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (request === null) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				Demande introuvable
			</div>
		);
	}

	const handleStatusChange = async (newStatus: string) => {
		try {
			await updateStatus({ requestId: request._id, status: newStatus as any });
			toast.success("Statut mis à jour");
		} catch (e) {
			toast.error("Erreur");
		}
	};

	// Get service name from the catalog service (not orgService)
	const serviceName = getLocalized(request.service?.name) || "Service inconnu";

	// Parse formData
	let formDataObj: Record<string, unknown> = {};
	if (request.formData) {
		if (typeof request.formData === "string") {
			try {
				formDataObj = JSON.parse(request.formData);
			} catch {
				formDataObj = { données: request.formData };
			}
		} else if (typeof request.formData === "object") {
			formDataObj = request.formData as Record<string, unknown>;
		}
	}

	// Helper to get display label for section
	const getSectionLabel = (sectionId: string): string => {
		return sectionLabels[sectionId] || sectionId.replace(/^section_\d+_/i, "");
	};

	// Helper to get display label for field
	const getFieldLabel = (sectionId: string, fieldId: string): string => {
		return (
			fieldLabels[`${sectionId}.${fieldId}`] ||
			fieldLabels[fieldId] ||
			fieldId.replace(/^field_\d+_/i, "")
		);
	};

	return (
		<div className="flex flex-col min-h-0 h-full">
			{/* Header */}
			<header className="shrink-0 flex h-14 items-center gap-4 border-b bg-background px-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/dashboard/requests" })}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<h1 className="text-lg font-semibold flex items-center gap-2">
						{serviceName}
						<Badge variant="outline" className="ml-2 font-mono text-xs">
							{request.reference}
						</Badge>
					</h1>
				</div>
				<div className="flex items-center gap-2">
					<RequestActionModal requestId={request._id} />
					<Select value={request.status} onValueChange={handleStatusChange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue>{request.status}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="draft">Brouillon</SelectItem>
							<SelectItem value="pending">En attente</SelectItem>
							<SelectItem value="processing">En traitement</SelectItem>
							<SelectItem value="completed">Terminé</SelectItem>
							<SelectItem value="cancelled">Annulé</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</header>

			{/* Action Required Banner */}
			{request.actionRequired && (
				<div className="px-6 pt-4">
					<Alert
						variant="destructive"
						className="border-amber-500 bg-amber-50 dark:bg-amber-950/20"
					>
						<AlertTriangle className="h-4 w-4 text-amber-600" />
						<AlertTitle className="text-amber-800 dark:text-amber-400">
							Action requise du citoyen
							<Badge variant="outline" className="ml-2 text-xs">
								{request.actionRequired.type === "documents" && "Documents"}
								{request.actionRequired.type === "info" && "Informations"}
								{request.actionRequired.type === "payment" && "Paiement"}
							</Badge>
						</AlertTitle>
						<AlertDescription className="text-amber-700 dark:text-amber-300">
							{request.actionRequired.message}
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Main Content - Scrollable */}
			<div className="flex-1 overflow-y-auto p-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
					{/* LEFT: Form Data */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Données du formulaire</CardTitle>
								<CardDescription>
									Soumis le{" "}
									{format(
										request.submittedAt || request._creationTime || Date.now(),
										"dd MMMM yyyy 'à' HH:mm",
										{ locale: fr },
									)}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{Object.keys(formDataObj).length > 0 ? (
									<div className="space-y-6">
										{Object.entries(formDataObj).map(
											([sectionId, sectionData]) => {
												// Handle nested section (object with fields)
												if (
													typeof sectionData === "object" &&
													sectionData !== null &&
													!Array.isArray(sectionData) &&
													!("fr" in sectionData)
												) {
													return (
														<div
															key={sectionId}
															className="border rounded-lg overflow-hidden"
														>
															<div className="bg-muted/50 px-4 py-2.5 border-b">
																<h3 className="font-medium text-sm">
																	{getSectionLabel(sectionId)}
																</h3>
															</div>
															<div className="p-4">
																<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
																	{Object.entries(
																		sectionData as Record<string, unknown>,
																	)
																		.filter(
																			([, value]) =>
																				renderValue(value) !== null,
																		)
																		.map(([fieldId, value]) => (
																			<div key={fieldId}>
																				<dt className="text-xs font-medium text-muted-foreground mb-1">
																					{getFieldLabel(sectionId, fieldId)}
																				</dt>
																				<dd className="text-sm">
																					{renderValue(value)}
																				</dd>
																			</div>
																		))}
																</dl>
															</div>
														</div>
													);
												}

												// Handle flat field (no nesting)
												return (
													<div
														key={sectionId}
														className="flex justify-between py-2 border-b last:border-0"
													>
														<span className="text-sm text-muted-foreground">
															{getSectionLabel(sectionId)}
														</span>
														<span className="text-sm font-medium">
															{renderValue(sectionData)}
														</span>
													</div>
												);
											},
										)}
									</div>
								) : (
									<div className="text-muted-foreground italic text-center py-8">
										Aucune donnée de formulaire
									</div>
								)}
							</CardContent>
						</Card>

						{/* Documents Checklist */}
						<DocumentChecklist
							requiredDocuments={(request.requiredDocuments || []) as any}
							submittedDocuments={(request.documents || []).map((doc: any) => ({
								...doc,
								url: doc.url || undefined,
							}))}
							isAgent={true}
							onValidate={async (docId) => {
								try {
									await validateDocument({
										documentId: docId,
										status: "validated" as any,
									});
									toast.success("Document validé");
								} catch (err) {
									toast.error("Erreur lors de la validation");
								}
							}}
							onReject={async (docId, reason) => {
								try {
									await validateDocument({
										documentId: docId,
										status: "rejected" as any,
										rejectionReason: reason,
									});
									toast.success("Document rejeté");
								} catch (err) {
									toast.error("Erreur lors du rejet");
								}
							}}
						/>
					</div>

					{/* RIGHT: Context & Notes */}
					<div className="space-y-6">
						{/* User Info */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">Demandeur</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
										{request.user?.firstName?.[0]}
										{request.user?.lastName?.[0]}
									</div>
									<div>
										<p className="font-medium text-sm">
											{request.user?.firstName} {request.user?.lastName}
										</p>
										<p className="text-xs text-muted-foreground">
											{request.user?.email}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Messages with citizen */}
						<Card className="flex flex-col h-[350px]">
							<RequestChat requestId={request._id} className="h-full" />
						</Card>

						{/* Notes */}
						<Card className="flex flex-col max-h-[400px]">
							<CardHeader className="shrink-0 pb-3">
								<CardTitle className="text-base">Notes & Suivi</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 overflow-y-auto space-y-3">
								{(request.notes || []).length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-4">
										Aucune note
									</p>
								) : (
									request.notes.map((note: any) => (
										<div
											key={note._id}
											className="bg-muted/50 p-3 rounded-md text-sm"
										>
											<p>{note.content}</p>
											<div className="flex justify-between mt-2 text-xs text-muted-foreground">
												<span>Agent</span>
												<span>
													{formatDistanceToNow(note.createdAt, {
														addSuffix: true,
														locale: fr,
													})}
												</span>
											</div>
										</div>
									))
								)}
							</CardContent>
							<CardFooter className="shrink-0 pt-3">
								<div className="flex w-full gap-2">
									<Textarea
										placeholder="Ajouter une note..."
										className="min-h-[40px] text-sm"
										value={noteContent}
										onChange={(e) => setNoteContent(e.target.value)}
									/>
									<Button
										size="icon"
										onClick={() => {
											if (!noteContent.trim()) return;
											addNote({
												requestId: request._id,
												content: noteContent,
												isInternal: isNoteInternal,
											});
											setNoteContent("");
										}}
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
