import { api } from "@convex/_generated/api";
import { RequestStatus, ServiceCategory } from "@convex/lib/constants";
import { getLocalized } from "@convex/lib/utils";
import type { FormField } from "@convex/lib/validators";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	CreditCard,
	Eye,
	FileText,
	Loader2,
	Sparkles,
	X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useFormFillOptional } from "@/components/ai/FormFillContext";
import { ActionRequiredCard } from "@/components/my-space/action-required-card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserData } from "@/hooks/use-user-data";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";

export const Route = createFileRoute("/my-space/requests/$reference")({
	component: UserRequestDetail,
});

function resolveFieldValue(
	value: unknown,
	lang: string,
	t: (key: string) => string,
	field?: FormField,
): string {
	if (value === null || value === undefined || value === "") return "—";
	if (typeof value === "boolean")
		return value ? t("common.yes") : t("common.no");
	if (typeof value === "object") {
		if ("fr" in (value as Record<string, unknown>)) {
			return getLocalized(value as Record<string, string>, lang);
		}
		return JSON.stringify(value);
	}

	const str = String(value);
	const locale = lang === "fr" ? "fr-FR" : "en-US";

	// Resolve select/radio option labels
	if (field?.options) {
		const opt = field.options.find((o) => o.value === str);
		if (opt?.label) return getLocalized(opt.label, lang) || str;
	}

	// Country code resolution (2-letter ISO)
	if (/^[A-Z]{2}$/.test(str)) {
		try {
			const countryNames = new Intl.DisplayNames([locale], {
				type: "region",
			});
			const name = countryNames.of(str);
			if (name) return name;
		} catch {
			/* fallback */
		}
	}

	// Date resolution (YYYY-MM-DD)
	if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
		try {
			return new Date(str + "T00:00:00").toLocaleDateString(locale, {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		} catch {
			/* fallback */
		}
	}

	return str;
}

// ─── Status label helper ────────────────────────────────────────────

function getStatusLabel(status: string, t: (key: string) => string): string {
	const statusLabels: Record<string, string> = {
		draft: t("requests.statuses.draft"),
		pending: t("requests.statuses.pending"),
		processing: t("requests.statuses.processing"),
		completed: t("requests.statuses.completed"),
		cancelled: t("requests.statuses.cancelled"),
		submitted: t("requests.statuses.submitted"),
		under_review: t("requests.statuses.underReview"),
		in_production: t("requests.statuses.inProduction"),
		rejected: t("requests.statuses.rejected"),
		request_submitted: t("requests.statuses.submitted"),
	};
	return statusLabels[status] || status;
}

// ─── Main Component ─────────────────────────────────────────────────

function UserRequestDetail() {
	const { reference } = Route.useParams();
	const { t, i18n } = useTranslation();
	const { profile } = useUserData();
	const formFillContext = useFormFillOptional();
	const lang = i18n.language;

	// Look up the request by reference string
	const { data: request } = useAuthenticatedConvexQuery(
		api.functions.requests.getByReferenceId,
		{ referenceId: reference },
	);

	const { mutateAsync: cancelRequest } = useConvexMutationQuery(
		api.functions.requests.cancel,
	);
	const { mutateAsync: deleteDraft } = useConvexMutationQuery(
		api.functions.requests.deleteDraft,
	);
	const { mutateAsync: submitRequest } = useConvexMutationQuery(
		api.functions.requests.submit,
	);
	const navigate = useNavigate();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const isDraft = request?.status === RequestStatus.Draft;
	const canCancel =
		request?.status === RequestStatus.Draft ||
		request?.status === RequestStatus.Pending;

	// ─── Build schema-driven sections ────────────────────────────────

	const formSchema = request?.service?.formSchema;
	const formData = request?.formData as Record<string, unknown> | undefined;

	const sections = useMemo(() => {
		if (!formData) return [];

		// If schema has sections, use them (same as admin page)
		if (formSchema?.sections && formSchema.sections.length > 0) {
			return formSchema.sections.map((section) => {
				const sectionData =
					(formData[section.id] as Record<string, unknown>) || {};
				const fields = section.fields || [];
				const rows = fields.map((field) => ({
					key: field.id,
					label: getLocalized(field.label, lang) || field.id,
					value: resolveFieldValue(sectionData[field.id], lang, t, field),
				}));
				// Add any extra fields not in schema
				const schemaFieldIds = new Set(fields.map((f) => f.id));
				for (const [key, val] of Object.entries(sectionData)) {
					if (!schemaFieldIds.has(key)) {
						rows.push({
							key,
							label: key,
							value: resolveFieldValue(val, lang, t),
						});
					}
				}
				return {
					id: section.id,
					title: getLocalized(section.title, lang) || section.id,
					rows,
				};
			});
		}

		// Fallback: iterate formData keys
		return Object.entries(formData)
			.filter(([key]) => key !== "type" && key !== "profileId")
			.map(([sectionId, sectionData]) => {
				if (
					typeof sectionData === "object" &&
					sectionData !== null &&
					!Array.isArray(sectionData) &&
					!("fr" in sectionData)
				) {
					const rows = Object.entries(
						sectionData as Record<string, unknown>,
					).map(([fieldId, value]) => ({
						key: fieldId,
						label: fieldId,
						value: resolveFieldValue(value, lang, t),
					}));
					return {
						id: sectionId,
						title: sectionId,
						rows,
					};
				}
				return {
					id: sectionId,
					title: sectionId,
					rows: [
						{
							key: sectionId,
							label: sectionId,
							value: resolveFieldValue(sectionData, lang, t),
						},
					],
				};
			});
	}, [formData, formSchema, lang, t]);

	// ─── Action handlers ─────────────────────────────────────────────

	const handleAction = async () => {
		try {
			if (!request) {
				toast.error(t("requests.detail.cancelError"));
				return;
			}
			if (isDraft) {
				await deleteDraft({ requestId: request._id });
				toast.success(t("requests.detail.deleted"));
				navigate({ to: "/my-space/requests" });
			} else {
				await cancelRequest({ requestId: request._id });
				toast.success(t("requests.detail.cancelled"));
			}
		} catch (e) {
			const error = e as Error;
			toast.error(error.message || t("requests.detail.cancelError"));
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
			[RequestStatus.Draft]: t("requests.statuses.draft"),
			[RequestStatus.Pending]: t("requests.statuses.pending"),
			[RequestStatus.Processing]: t("requests.statuses.processing"),
			[RequestStatus.Completed]: t("requests.statuses.completed"),
			[RequestStatus.Cancelled]: t("requests.statuses.cancelled"),
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
				toast.success(t("request.submitted_success"), {
					description: t("request.appointment_required"),
				});
				navigate({ to: `/my-space/requests/${request._id}/appointment` });
			} else {
				toast.success(t("request.submitted_success"), {
					description: t("request.submitted_description"),
				});
				navigate({ to: "/my-space/requests" });
			}
		} catch (error) {
			console.error("Failed to submit request:", error);
			toast.error(t("error.generic"), {
				description: t("error.request_failed"),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Trigger AI Fill
	const handleAIFill = () => {
		toast.info(t("form.aiAssistantTitle"), {
			description: t("form.aiAssistantDescription"),
		});
	};

	// ===== DRAFT MODE: Show form for editing =====
	if (isDraft) {
		return (
			<div className="space-y-6 p-1">
				{/* Header - MySpace Style */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
					className="flex items-start justify-between gap-4"
				>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileText className="h-6 w-6 text-primary" />
							{getLocalizedValue(
								request.service?.name as
									| { fr: string; en?: string }
									| undefined,
								i18n.language,
							) || t("requests.detail.newRequest")}
						</h1>
						<p className="text-muted-foreground text-sm mt-1">
							{t("requests.draft.subtitle")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{/* AI Fill Button */}
						{formFillContext && (
							<Button variant="outline" size="sm" onClick={handleAIFill}>
								<Sparkles className="mr-2 h-4 w-4 text-amber-500" />
								{t("form.fillWithAI")}
							</Button>
						)}
						{getStatusBadge(request.status)}
					</div>
				</motion.div>

				{/* Main Content */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2, delay: 0.05 }}
					className="max-w-2xl mx-auto"
				>
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
										~{orgService.estimatedDays} {t("common.daysUnit")}
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
							requiredDocuments={
								request.service?.formSchema?.joinedDocuments || []
							}
							onSubmit={async () => {
								await handleSubmit({});
							}}
							isSubmitting={isSubmitting}
						/>
					) : (
						<DynamicForm
							schema={request.service?.formSchema}
							defaultValues={
								request.formData as Record<string, unknown> | undefined
							}
							onSubmit={handleSubmit}
							isSubmitting={isSubmitting}
						/>
					)}
				</motion.div>
			</div>
		);
	}

	// ===== READ-ONLY MODE: Show request details =====
	const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in px-0 sm:p-1 min-w-0 overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/my-space/requests">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1 min-w-0">
					<h1 className="text-2xl font-bold tracking-tight">
						{getLocalizedValue((request.service as any)?.name, i18n.language) ||
							t("requests.detail.title")}
					</h1>
					<div className="flex flex-wrap items-center gap-2 mt-1">
						{request.reference && (
							<Badge variant="outline" className="font-mono text-xs">
								{request.reference}
							</Badge>
						)}
						<p className="text-sm text-muted-foreground">
							{t("requests.detail.submittedOn", {
								date: new Date(request._creationTime).toLocaleDateString(
									dateLocale,
									{
										day: "numeric",
										month: "long",
										year: "numeric",
									},
								),
							})}
						</p>
					</div>
				</div>
				{getStatusBadge(request.status)}
			</div>

			{/* Action Required Card */}
			{request.actionRequired && (
				<ActionRequiredCard
					requestId={request._id}
					actionRequired={request.actionRequired as any}
				/>
			)}

			<div className="grid gap-4 sm:gap-6 md:grid-cols-3 min-w-0">
				{/* Main Content */}
				<div className="md:col-span-2 space-y-4 sm:space-y-6 min-w-0">
					{/* Form Data — Tabbed */}
					{sections.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									{t("requestDetail.formData.title")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue={sections[0].id} className="w-full">
									<div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
										<TabsList className="h-auto justify-start w-max">
											{sections.map((section) => (
												<TabsTrigger
													key={section.id}
													value={section.id}
													className="shrink-0 text-xs sm:text-sm"
												>
													{section.title}
												</TabsTrigger>
											))}
										</TabsList>
									</div>

									{sections.map((section) => (
										<TabsContent key={section.id} value={section.id}>
											<div className="divide-y">
												{section.rows.map((row) => (
													<div
														key={row.key}
														className="flex flex-col sm:flex-row sm:justify-between py-2.5 text-sm gap-0.5 sm:gap-4"
													>
														<span className="text-muted-foreground text-xs sm:text-sm shrink-0">
															{row.label}
														</span>
														<span className="font-medium sm:text-right break-words">
															{row.value}
														</span>
													</div>
												))}
											</div>
										</TabsContent>
									))}
								</Tabs>
							</CardContent>
						</Card>
					)}

					{/* Service Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								{t("requests.detail.serviceInfo")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4">
								<span className="text-muted-foreground">
									{t("requests.detail.serviceName")}
								</span>
								<span className="font-medium">
									{getLocalizedValue(
										(request.service as any)?.name,
										i18n.language,
									) || "—"}
								</span>
							</div>
							{request.org && (
								<div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4">
									<span className="text-muted-foreground">
										{t("requests.detail.organization")}
									</span>
									<span className="font-medium">
										{(request.org as any)?.name}
									</span>
								</div>
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
										{t("payment.title")}
									</CardTitle>
									<CardDescription>
										{request.paymentStatus === "pending" ||
										request.paymentStatus === "processing"
											? t("payment.pending")
											: t("payment.required")}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{request.paymentStatus === "failed" && (
										<Alert variant="destructive" className="mb-4">
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>{t("payment.failed")}</AlertDescription>
										</Alert>
									)}
									<PaymentForm
										requestId={request._id}
										amount={pricing.amount}
										currency={pricing.currency || "eur"}
										serviceName={serviceName}
										onSuccess={() => {
											toast.success(t("payment.successToast"));
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
									{t("requests.detail.attachments")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{request.documents.map((doc: any) => {
										const file = doc.files?.[0];
										const filename =
											file?.filename || doc.filename || doc.name || "Document";
										const sizeBytes = file?.sizeBytes || doc.sizeBytes;
										const docUrl = doc.fileUrls?.[0]?.url || doc.url;
										return (
											<div
												key={doc._id}
												className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg gap-2"
											>
												<div className="flex items-center gap-3 min-w-0">
													<div className="p-2 bg-primary/10 rounded-md shrink-0">
														<FileText className="h-4 w-4 text-primary" />
													</div>
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">
															{filename}
														</p>
														{sizeBytes && (
															<p className="text-xs text-muted-foreground">
																{(sizeBytes / 1024).toFixed(0)} Ko
															</p>
														)}
													</div>
												</div>
												{docUrl && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => window.open(docUrl, "_blank")}
													>
														<Eye className="mr-1.5 h-3.5 w-3.5" />
														{t("common.view")}
													</Button>
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-4 sm:space-y-6 min-w-0">
					{/* Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								{t("requests.detail.timeline")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 text-sm">
								{/* Creation */}
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground">
										{t("requests.detail.created")}
									</span>
									<span className="text-right">
										{new Date(request._creationTime).toLocaleDateString(
											dateLocale,
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
											className="flex justify-between gap-2 border-t pt-2"
										>
											<span className="text-muted-foreground">
												{getStatusLabel(event.to || event.type, t)}
											</span>
											<span>
												{new Date(event.createdAt).toLocaleDateString(
													dateLocale,
													{
														day: "numeric",
														month: "short",
														year: "numeric",
													},
												)}
											</span>
										</div>
									),
								)}

								{/* Fallback if no status history */}
								{(!request.statusHistory ||
									request.statusHistory.length === 0) &&
									request.submittedAt && (
										<div className="flex justify-between gap-2 border-t pt-2">
											<span className="text-muted-foreground">
												{t("requests.detail.submitted")}
											</span>
											<span>
												{new Date(request.submittedAt).toLocaleDateString(
													dateLocale,
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
									{t("requests.detail.actions")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" className="w-full">
											<X className="mr-2 h-4 w-4" />
											{isDraft
												? t("requests.detail.delete")
												: t("requests.detail.cancel")}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												{isDraft
													? t("requests.detail.deleteConfirmTitle")
													: t("requests.detail.cancelConfirmTitle")}
											</AlertDialogTitle>
											<AlertDialogDescription>
												{isDraft
													? t("requests.detail.deleteConfirmDesc")
													: t("requests.detail.cancelConfirmDesc")}
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>
												{t("common.cancel")}
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleAction}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												{isDraft
													? t("requests.detail.confirmDelete")
													: t("requests.detail.confirmCancel")}
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
