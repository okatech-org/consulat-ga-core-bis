"use client";

import { api } from "@convex/_generated/api";
import { RequestStatus } from "@convex/lib/constants";
import { getLocalized } from "@convex/lib/utils";
import type { LocalizedString } from "@convex/lib/validators";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import {
	AlertTriangle,
	ArrowLeft,
	Bot,
	Calendar,
	Check,
	CheckCircle,
	Clock,
	FileText,
	Loader2,
	Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RequestActionModal } from "@/components/admin/RequestActionModal";
import { GenerateDocumentDialog } from "@/components/dashboard/GenerateDocumentDialog";
import { UserProfilePreviewCard } from "@/components/dashboard/UserProfilePreviewCard";
import { PageHeader } from "@/components/my-space/page-header";
import { useOrg } from "@/components/org/org-provider";
import { DocumentChecklist } from "@/components/shared/DocumentChecklist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCanDoTask } from "@/hooks/useCanDoTask";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests/$reference")({
	component: RequestDetailPage,
});

// ─── Status styling (reuses palette from list page) ──────────────────
const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> =
	{
		draft: {
			bg: "bg-slate-100 dark:bg-slate-800",
			text: "text-slate-700 dark:text-slate-300",
			dot: "bg-slate-400",
		},
		submitted: {
			bg: "bg-blue-100 dark:bg-blue-900/40",
			text: "text-blue-700 dark:text-blue-300",
			dot: "bg-blue-500",
		},
		pending: {
			bg: "bg-amber-100 dark:bg-amber-900/40",
			text: "text-amber-700 dark:text-amber-300",
			dot: "bg-amber-500",
		},
		pending_completion: {
			bg: "bg-orange-100 dark:bg-orange-900/40",
			text: "text-orange-700 dark:text-orange-300",
			dot: "bg-orange-500",
		},
		edited: {
			bg: "bg-indigo-100 dark:bg-indigo-900/40",
			text: "text-indigo-700 dark:text-indigo-300",
			dot: "bg-indigo-500",
		},
		under_review: {
			bg: "bg-purple-100 dark:bg-purple-900/40",
			text: "text-purple-700 dark:text-purple-300",
			dot: "bg-purple-500",
		},
		in_production: {
			bg: "bg-cyan-100 dark:bg-cyan-900/40",
			text: "text-cyan-700 dark:text-cyan-300",
			dot: "bg-cyan-500",
		},
		validated: {
			bg: "bg-emerald-100 dark:bg-emerald-900/40",
			text: "text-emerald-700 dark:text-emerald-300",
			dot: "bg-emerald-500",
		},
		rejected: {
			bg: "bg-red-100 dark:bg-red-900/40",
			text: "text-red-700 dark:text-red-300",
			dot: "bg-red-500",
		},
		appointment_scheduled: {
			bg: "bg-teal-100 dark:bg-teal-900/40",
			text: "text-teal-700 dark:text-teal-300",
			dot: "bg-teal-500",
		},
		ready_for_pickup: {
			bg: "bg-green-100 dark:bg-green-900/40",
			text: "text-green-700 dark:text-green-300",
			dot: "bg-green-500",
		},
		completed: {
			bg: "bg-emerald-100 dark:bg-emerald-900/40",
			text: "text-emerald-700 dark:text-emerald-300",
			dot: "bg-emerald-500",
		},
		cancelled: {
			bg: "bg-gray-100 dark:bg-gray-800",
			text: "text-gray-600 dark:text-gray-400",
			dot: "bg-gray-400",
		},
		processing: {
			bg: "bg-purple-100 dark:bg-purple-900/40",
			text: "text-purple-700 dark:text-purple-300",
			dot: "bg-purple-500",
		},
	};

const STATUS_LABELS: Record<string, string> = {
	draft: "Brouillon",
	submitted: "Soumis",
	pending: "En attente",
	pending_completion: "Incomplet",
	edited: "Modifié",
	under_review: "En examen",
	in_production: "En production",
	validated: "Validé",
	rejected: "Rejeté",
	appointment_scheduled: "RDV fixé",
	ready_for_pickup: "Prêt",
	completed: "Terminé",
	cancelled: "Annulé",
	processing: "Traitement",
};

function getStatusStyle(status: string) {
	return (
		STATUS_STYLE[status] ?? {
			bg: "bg-gray-100 dark:bg-gray-800",
			text: "text-gray-600 dark:text-gray-400",
			dot: "bg-gray-400",
		}
	);
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Format a raw value for display */
function renderValue(value: unknown, lang: string): string {
	if (value === null || value === undefined || value === "") return "—";
	if (typeof value === "boolean") return value ? "Oui" : "Non";
	if (Array.isArray(value))
		return value.map((v) => renderValue(v, lang)).join(", ");
	if (typeof value === "object") {
		if ("fr" in (value as object)) {
			return String(
				(value as Record<string, string>)[lang] ||
					(value as Record<string, string>).fr,
			);
		}
		return JSON.stringify(value);
	}
	const str = String(value);
	// Country code (2-letter ISO)
	if (/^[A-Z]{2}$/.test(str)) {
		try {
			const name = new Intl.DisplayNames([lang], { type: "region" }).of(str);
			if (name) return name;
		} catch {
			/* fallback */
		}
	}
	// Date string (YYYY-MM-DD)
	if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
		try {
			return new Date(str).toLocaleDateString(
				lang === "fr" ? "fr-FR" : "en-US",
				{
					day: "numeric",
					month: "long",
					year: "numeric",
				},
			);
		} catch {
			/* fallback */
		}
	}
	return str;
}

// Types for FormSchema
interface FormSchemaField {
	id: string;
	type?: string;
	label?: LocalizedString;
	description?: LocalizedString;
	options?: Array<{ value: string; label?: LocalizedString }>;
}

interface FormSchemaSection {
	id: string;
	title?: LocalizedString;
	description?: LocalizedString;
	fields?: FormSchemaField[];
}

interface FormSchema {
	sections?: FormSchemaSection[];
	joinedDocuments?: Array<{
		type: string;
		label: LocalizedString;
		required: boolean;
	}>;
	showRecap?: boolean;
}

// ─── Main Component ──────────────────────────────────────────────────

function RequestDetailPage() {
	const { i18n, t } = useTranslation();
	const { reference } = Route.useParams();
	const navigate = useNavigate();
	const { activeOrgId } = useOrg();
	const { canDo } = useCanDoTask(activeOrgId ?? undefined);

	const { data: request } = useAuthenticatedConvexQuery(
		api.functions.requests.getByReferenceId,
		{ referenceId: reference },
	);
	const { data: agentNotes } = useAuthenticatedConvexQuery(
		api.functions.agentNotes.listByRequest,
		request?._id ? { requestId: request._id } : "skip",
	);
	const { mutateAsync: updateStatus } = useConvexMutationQuery(
		api.functions.requests.updateStatus,
	);
	const { mutateAsync: createNote } = useConvexMutationQuery(
		api.functions.agentNotes.create,
	);
	const { mutateAsync: validateDocument } = useConvexMutationQuery(
		api.functions.documents.validate,
	);
	const { mutate: toggleFieldValidation } = useConvexMutationQuery(
		api.functions.requests.validateField,
	);

	const [noteContent, setNoteContent] = useState("");

	const lang = i18n.language;
	const dateFnsLocale = lang === "fr" ? fr : enUS;

	const formSchema = useMemo(
		() =>
			(request?.service?.formSchema ?? request?.service?.formSchema) as
				| FormSchema
				| undefined,
		[request?.service?.formSchema, request?.service?.formSchema],
	);

	// Parse formData
	const formDataObj: Record<string, unknown> = useMemo(() => {
		if (!request?.formData) return {};
		if (typeof request.formData === "string") {
			try {
				return JSON.parse(request.formData);
			} catch {
				return {};
			}
		}
		if (typeof request.formData === "object")
			return request.formData as Record<string, unknown>;
		return {};
	}, [request?.formData]);

	// Build sections from formSchema, with values from formData
	const sections = useMemo(() => {
		if (!formSchema?.sections) return [];
		return formSchema.sections
			.map((section) => {
				const sectionData = formDataObj[section.id];
				const fields = (section.fields ?? []).map((field) => {
					// Look up value: try nested (formData[sectionId][fieldId]) then flat (formData[fieldId])
					let value: unknown;
					if (
						sectionData &&
						typeof sectionData === "object" &&
						!Array.isArray(sectionData)
					) {
						value = (sectionData as Record<string, unknown>)[field.id];
					}
					if (value === undefined) {
						value = formDataObj[field.id];
					}
					const label = getLocalized(field.label, lang) || field.id;
					// For select fields, resolve value to option label
					let display: string;
					if (field.options && typeof value === "string") {
						const opt = field.options.find((o) => o.value === value);
						display = opt
							? getLocalized(opt.label, lang) || value
							: renderValue(value, lang);
					} else {
						display = renderValue(value, lang);
					}
					const fieldPath = `${section.id}.${field.id}`;
					return {
						id: field.id,
						fieldPath,
						label,
						display,
						isEmpty: display === "—",
					};
				});

				return {
					id: section.id,
					title: getLocalized(section.title, lang) || section.id,
					fields,
				};
			})
			.filter((s) => s.fields.length > 0);
	}, [formSchema, formDataObj, lang]);

	// Field validation tracking
	const fieldValidations = (request?.fieldValidations ?? {}) as Record<
		string,
		{ validatedAt: number; validatedBy: string }
	>;
	const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);
	const validatedFields = sections.reduce(
		(sum, s) =>
			sum + s.fields.filter((f) => fieldValidations[f.fieldPath]).length,
		0,
	);
	const fieldProgress =
		totalFields > 0 ? (validatedFields / totalFields) * 100 : 0;

	// ─── Loading / Not found ────────────────────────────────────────
	if (request === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (request === null) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3">
				<FileText className="h-10 w-10 text-muted-foreground/40" />
				<p className="text-muted-foreground">{t("requestDetail.notFound")}</p>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate({ to: "/admin/requests" })}
				>
					<ArrowLeft className="h-4 w-4 mr-1" />
					{t("requestDetail.backToList")}
				</Button>
			</div>
		);
	}

	const handleStatusChange = async (newStatus: string) => {
		try {
			await updateStatus({ requestId: request._id, status: newStatus as any });
			toast.success(t("requestDetail.statusUpdated"));
		} catch (e) {
			toast.error(t("common.error"));
		}
	};

	const serviceName =
		getLocalized(request.service?.name, lang) ||
		t("requestDetail.unknownService");

	const statusStyle = getStatusStyle(request.status);
	const statusHistory = (request as any).statusHistory ?? [];

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6 min-w-0 overflow-hidden">
			<PageHeader
				title={
					<div className="flex flex-col md:flex-row md:items-center gap-2.5">
						<h1 className="text-2xl font-bold tracking-tight truncate">
							{serviceName}
						</h1>
						<Badge variant="outline" className="font-mono text-xs shrink-0">
							{request.reference}
						</Badge>
					</div>
				}
				subtitle={
					<div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" />
							<span>
								Soumis le{" "}
								{format(
									request.submittedAt || request._creationTime || Date.now(),
									"dd/MM/yyyy à HH:mm",
									{ locale: dateFnsLocale },
								)}
							</span>
						</div>

						<span
							className={cn(
								"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
								statusStyle.bg,
								statusStyle.text,
							)}
						>
							<span
								className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)}
							/>
							{STATUS_LABELS[request.status] || request.status}
						</span>
					</div>
				}
				onBack={() => navigate({ to: "/admin/requests" })}
				showBackButton
				actions={
					<div className="flex flex-wrap items-center gap-2">
						{canDo("requests.process") && (
							<>
								<GenerateDocumentDialog request={request as any} />
								<RequestActionModal
									requestId={request._id}
									formSchema={request.service?.formSchema as any}
									formData={formDataObj}
								/>
								<Select
									value={request.status}
									onValueChange={(value) => handleStatusChange(value)}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue
											placeholder={t("fields.requestStatus.placeholder")}
										/>
									</SelectTrigger>
									<SelectContent>
										{Object.values(RequestStatus).map((status) => (
											<SelectItem key={status} value={status}>
												{t(`fields.requestStatus.options.${status}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						)}
					</div>
				}
			/>

			{/* ── Action Banners ─────────────────────────────────────── */}
			{request.actionsRequired
				?.filter((a: any) => !a.completedAt)
				.map((action: any) => (
					<Alert
						key={action.id}
						variant="destructive"
						className="border-amber-500 bg-amber-50 dark:bg-amber-950/20"
					>
						<AlertTriangle className="h-4 w-4 text-amber-600" />
						<AlertTitle className="text-amber-800 dark:text-amber-400">
							{t(
								"requestDetail.actionRequired.title",
								"Action requise du citoyen",
							)}
							<Badge variant="outline" className="ml-1 text-xs">
								{t(
									`requestDetail.actionRequired.types.${action.type}`,
									action.type,
								)}
							</Badge>
						</AlertTitle>
						<AlertDescription className="text-amber-700 dark:text-amber-300">
							{action.message}
						</AlertDescription>
					</Alert>
				))}

			{request.actionsRequired
				?.filter((a: any) => a.completedAt)
				.map((action: any) => (
					<Alert
						key={action.id}
						className="border-green-500 bg-green-50 dark:bg-green-950/20"
					>
						<CheckCircle className="h-4 w-4 text-green-600" />
						<AlertTitle className="text-green-800 dark:text-green-400">
							{t(
								"requestDetail.actionCompleted.title",
								"Réponse reçue du citoyen",
							)}
							<Badge variant="outline" className="ml-1 text-xs text-green-600">
								{t("requestDetail.actionCompleted.badge")}
							</Badge>
						</AlertTitle>
						<AlertDescription className="text-green-700 dark:text-green-300">
							{t(
								"requestDetail.actionCompleted.description",
								"Le citoyen a fourni les éléments demandés. Vérifiez et validez sa réponse.",
							)}
						</AlertDescription>
					</Alert>
				))}

			{/* ── Main Content ───────────────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
				{/* ── LEFT: Form Data + Documents ── */}
				<div className="lg:col-span-2 space-y-6 min-w-0">
					{/* Form Data */}
					<div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
						<div className="px-5 py-4 border-b border-border/40 bg-muted/20">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="rounded-md bg-primary/10 p-1.5">
										<FileText className="h-4 w-4 text-primary" />
									</div>
									<div>
										<h2 className="font-semibold text-sm">
											{t(
												"requestDetail.formData.title",
												"Données du formulaire",
											)}
										</h2>
										<p className="text-xs text-muted-foreground">
											{validatedFields}/{totalFields}{" "}
											{t(
												"requestDetail.formData.fieldsVerified",
												"champs vérifiés",
											)}
										</p>
									</div>
								</div>
								{fieldProgress === 100 && (
									<Badge
										variant="outline"
										className="bg-green-500/10 text-green-600 border-green-500/30"
									>
										<Check className="h-3 w-3 mr-1" />
										{t("requestDetail.formData.allVerified")}
									</Badge>
								)}
							</div>
							<Progress value={fieldProgress} className="h-2 mt-3" />
						</div>

						<div className="p-5">
							{sections.length > 0 ? (
								<Tabs defaultValue={sections[0].id} className="w-full">
									<div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
										<TabsList className="h-auto justify-start w-max">
											{sections.map((section) => {
												const sectionValidated = section.fields.filter(
													(f) => fieldValidations[f.fieldPath],
												).length;
												const sectionTotal = section.fields.length;
												return (
													<TabsTrigger
														key={section.id}
														value={section.id}
														className="shrink-0 gap-1.5 text-xs sm:text-sm"
													>
														{section.title}
														<Badge
															variant="secondary"
															className={cn(
																"text-[10px] px-1.5 py-0 h-4 min-w-[28px] justify-center",
																sectionValidated === sectionTotal
																	? "bg-green-500/20 text-green-600"
																	: "",
															)}
														>
															{sectionValidated}/{sectionTotal}
														</Badge>
													</TabsTrigger>
												);
											})}
										</TabsList>
									</div>

									{sections.map((section) => (
										<TabsContent key={section.id} value={section.id}>
											<Table className="table-fixed w-full">
												<TableBody>
													{section.fields.map((field) => {
														const isValidated =
															!!fieldValidations[field.fieldPath];
														return (
															<TableRow
																key={field.id}
																className={cn(
																	"transition-colors",
																	isValidated && "bg-green-500/5",
																)}
															>
																<TableCell className="w-8 pr-0 align-top">
																	<Checkbox
																		checked={isValidated}
																		disabled={!canDo("requests.validate")}
																		onCheckedChange={(checked) => {
																			toggleFieldValidation({
																				requestId: request._id,
																				fieldPath: field.fieldPath,
																				validated: !!checked,
																			});
																		}}
																		className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
																	/>
																</TableCell>
																<TableCell className="text-muted-foreground font-medium w-[40%] truncate">
																	{field.label}
																</TableCell>
																<TableCell className="truncate">
																	{field.display}
																</TableCell>
															</TableRow>
														);
													})}
												</TableBody>
											</Table>
										</TabsContent>
									))}
								</Tabs>
							) : (
								<div className="text-muted-foreground italic text-center py-8 text-sm">
									{t(
										"requestDetail.formData.empty",
										"Aucune donnée de formulaire",
									)}
								</div>
							)}
						</div>
					</div>

					{/* Documents Checklist */}
					<DocumentChecklist
						requiredDocuments={(request.joinedDocuments || []) as any}
						submittedDocuments={(request.documents || []).map((doc: any) => {
							const firstFile = doc.files?.[0];
							return {
								...doc,
								filename: firstFile?.filename ?? doc.filename ?? "document",
								mimeType: firstFile?.mimeType ?? doc.mimeType ?? "",
								sizeBytes: firstFile?.sizeBytes ?? doc.sizeBytes ?? 0,
								url: doc.url || undefined,
								storageId: doc.storageId || firstFile?.storageId || undefined,
							};
						})}
						isAgent={canDo("documents.validate")}
						onValidate={async (docId) => {
							try {
								await validateDocument({
									documentId: docId,
									status: "validated" as any,
								});
								toast.success(t("requestDetail.documents.validated"));
							} catch (err) {
								toast.error(
									t(
										"requestDetail.documents.validateError",
										"Erreur lors de la validation",
									),
								);
							}
						}}
						onReject={async (docId, reason) => {
							try {
								await validateDocument({
									documentId: docId,
									status: "rejected" as any,
									rejectionReason: reason,
								});
								toast.success(t("requestDetail.documents.rejected"));
							} catch (err) {
								toast.error(
									t(
										"requestDetail.documents.rejectError",
										"Erreur lors du rejet",
									),
								);
							}
						}}
					/>
				</div>

				{/* ── RIGHT: Profile, Timeline, Notes ── */}
				<div className="space-y-6">
					{/* User Profile */}
					{request.userId && <UserProfilePreviewCard userId={request.userId} />}

					{/* Status Timeline */}
					{statusHistory.length > 0 && (
						<div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
							<div className="px-4 py-3 border-b border-border/40 bg-muted/20">
								<h3 className="font-semibold text-sm flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									{t("requestDetail.timeline.title")}
									<Badge
										variant="secondary"
										className="text-xs font-normal ml-auto"
									>
										{statusHistory.length}
									</Badge>
								</h3>
							</div>
							<div className="p-4">
								<div className="relative">
									{/* Timeline line */}
									<div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/60" />

									<div className="space-y-4">
										{statusHistory.map((event: any, idx: number) => {
											const toStyle = getStatusStyle(event.to);
											const isLast = idx === statusHistory.length - 1;

											return (
												<div
													key={event._id}
													className="relative flex gap-3 pl-0"
												>
													{/* Dot */}
													<div
														className={cn(
															"relative z-10 mt-1 h-[15px] w-[15px] rounded-full border-2 border-background shrink-0",
															isLast ? toStyle.dot : "bg-muted-foreground/30",
														)}
													/>

													{/* Content */}
													<div className="flex-1 min-w-0 pb-1">
														<div className="flex items-center gap-1.5 flex-wrap">
															<span
																className={cn(
																	"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
																	toStyle.bg,
																	toStyle.text,
																)}
															>
																{STATUS_LABELS[event.to] || event.to}
															</span>
															{event.from && (
																<span className="text-[10px] text-muted-foreground">
																	← {STATUS_LABELS[event.from] || event.from}
																</span>
															)}
														</div>
														{event.note && (
															<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
																{event.note}
															</p>
														)}
														<span className="text-[10px] text-muted-foreground/70">
															{formatDistanceToNow(event.createdAt, {
																addSuffix: true,
																locale: dateFnsLocale,
															})}
														</span>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Internal Notes */}
					<Card className="flex flex-col max-h-[400px]">
						<CardHeader className="shrink-0 pb-3">
							<CardTitle className="text-sm flex items-center gap-2">
								{t("requestDetail.notes.title")}
								<Badge
									variant="secondary"
									className="text-xs font-normal ml-auto"
								>
									{agentNotes?.length || 0}
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 overflow-y-auto space-y-3">
							{!agentNotes || agentNotes.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-4">
									{t("requestDetail.notes.empty")}
								</p>
							) : (
								agentNotes.map((note) => (
									<div
										key={note._id}
										className={cn(
											"p-3 rounded-lg text-sm",
											note.source === "ai"
												? "bg-primary/5 border border-primary/15"
												: "bg-muted/40",
										)}
									>
										{note.source === "ai" && (
											<div className="flex items-center gap-1.5 mb-2">
												<Bot className="h-3.5 w-3.5 text-primary" />
												<span className="text-xs font-medium text-primary">
													{t("requestDetail.notes.aiAnalysis")}
												</span>
												{note.aiConfidence && (
													<Badge variant="outline" className="text-xs ml-auto">
														{note.aiConfidence}%{" "}
														{t("requestDetail.notes.confidence")}
													</Badge>
												)}
											</div>
										)}
										<p className="whitespace-pre-wrap">{note.content}</p>
										<div className="flex justify-between mt-2 text-xs text-muted-foreground">
											<span>
												{note.source === "ai"
													? "IA"
													: note.author
														? `${note.author.firstName} ${note.author.lastName}`
														: "Agent"}
											</span>
											<span>
												{formatDistanceToNow(note.createdAt, {
													addSuffix: true,
													locale: dateFnsLocale,
												})}
											</span>
										</div>
									</div>
								))
							)}
						</CardContent>
						<CardFooter className="shrink-0 pt-3">
							{canDo("requests.process") && (
								<div className="flex w-full gap-2">
									<Textarea
										placeholder={t(
											"requestDetail.notes.placeholder",
											"Ajouter une note...",
										)}
										className="min-h-[40px] text-sm"
										value={noteContent}
										onChange={(e) => setNoteContent(e.target.value)}
									/>
									<Button
										size="icon"
										onClick={async () => {
											if (!noteContent.trim()) return;
											try {
												await createNote({
													requestId: request._id,
													content: noteContent,
												});
												setNoteContent("");
												toast.success(t("requestDetail.notes.added"));
											} catch {
												toast.error(
													t(
														"requestDetail.notes.addError",
														"Erreur lors de l'ajout",
													),
												);
											}
										}}
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							)}
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
