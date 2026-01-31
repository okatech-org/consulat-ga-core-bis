"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { ServiceCategory } from "@convex/lib/validators";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { RichTextEditor } from "@/components/common/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/services/$serviceId_/edit")({
	component: EditServicePageWrapper,
});

interface RequiredDocument {
	type: string;
	label: { fr: string; en?: string };
	required: boolean;
}

// Wrapper component that provides the key prop
function EditServicePageWrapper() {
	const { serviceId } = Route.useParams();

	// Using serviceId as key forces component recreation when navigating between services
	return (
		<EditServiceForm key={serviceId} serviceId={serviceId as Id<"services">} />
	);
}

interface EditServiceFormProps {
	serviceId: Id<"services">;
}

function EditServiceForm({ serviceId }: EditServiceFormProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [documents, setDocuments] = useState<RequiredDocument[]>([]);
	const [contentFr, setContentFr] = useState("");
	const [contentEn, setContentEn] = useState("");
	const [requiresAppointment, setRequiresAppointment] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	const { data: service, isPending: isLoading } = useAuthenticatedConvexQuery(
		api.functions.services.getById,
		{ serviceId },
	);

	const { mutateAsync: updateService, isPending } = useConvexMutationQuery(
		api.functions.services.update,
	);

	const form = useForm({
		defaultValues: {
			nameFr: "",
			nameEn: "",
			descriptionFr: "",
			descriptionEn: "",
			category: ServiceCategory.Other as string,
			icon: "",
			estimatedDays: "7",
		},
		onSubmit: async ({ value }) => {
			if (!value.nameFr || value.nameFr.length < 3) {
				toast.error(t("superadmin.organizations.form.error.nameLength"));
				return;
			}
			if (!value.descriptionFr) {
				toast.error(
					t("superadmin.services.form.description") +
						" (FR) " +
						t("superadmin.organizations.form.error.required"),
				);
				return;
			}

			try {
				await updateService({
					serviceId,
					name: { fr: value.nameFr, en: value.nameEn || undefined },
					description: {
						fr: value.descriptionFr,
						en: value.descriptionEn || undefined,
					},
					content: contentFr
						? { fr: contentFr, en: contentEn || undefined }
						: undefined,
					category: value.category as any,
					icon: value.icon || undefined,
					estimatedDays: parseInt(value.estimatedDays) || 7,
					requiresAppointment,
					requiredDocuments: documents,
				});
				toast.success(t("superadmin.services.form.updated"));
				navigate({ to: "/admin/services" });
			} catch (error: any) {
				const errorKey = error.message?.startsWith("errors.")
					? error.message
					: null;
				toast.error(errorKey ? t(errorKey) : t("superadmin.common.error"));
			}
		},
	});

	// Initialize form when service loads
	useEffect(() => {
		if (service && !isInitialized) {
			form.setFieldValue("nameFr", service.name?.fr || "");
			form.setFieldValue("nameEn", service.name?.en || "");
			form.setFieldValue("descriptionFr", service.description?.fr || "");
			form.setFieldValue("descriptionEn", service.description?.en || "");
			form.setFieldValue("category", service.category || ServiceCategory.Other);
			form.setFieldValue("icon", service.icon || "");
			form.setFieldValue("estimatedDays", String(service.estimatedDays || 7));

			setContentFr(service.content?.fr || "");
			setContentEn(service.content?.en || "");
			setRequiresAppointment(service.requiresAppointment ?? true);

			// Convert documents to new format if needed
			const docs = service.requiredDocuments || [];
			const normalizedDocs = docs.map((doc: any) => ({
				type: doc.type,
				label:
					typeof doc.label === "string"
						? { fr: doc.label, en: undefined }
						: doc.label,
				required: doc.required,
			}));
			setDocuments(normalizedDocs);

			setIsInitialized(true);
		}
	}, [service, isInitialized, form]);

	const addDocument = () => {
		setDocuments([
			...documents,
			{ type: "document", label: { fr: "", en: "" }, required: true },
		]);
	};

	const updateDocumentLabel = (
		index: number,
		lang: "fr" | "en",
		value: string,
	) => {
		const newDocs = [...documents];
		newDocs[index] = {
			...newDocs[index],
			label: { ...newDocs[index].label, [lang]: value },
		};
		setDocuments(newDocs);
	};

	const updateDocumentType = (index: number, value: string) => {
		const newDocs = [...documents];
		newDocs[index] = { ...newDocs[index], type: value };
		setDocuments(newDocs);
	};

	const updateDocumentRequired = (index: number, value: boolean) => {
		const newDocs = [...documents];
		newDocs[index] = { ...newDocs[index], required: value };
		setDocuments(newDocs);
	};

	const removeDocument = (index: number) => {
		setDocuments(documents.filter((_, i) => i !== index));
	};

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-4 pt-6">
				<Skeleton className="h-8 w-64" />
				<Card className="flex-1">
					<CardContent className="pt-6 space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-40 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!service) {
		return (
			<div className="flex flex-1 flex-col gap-4 p-4 pt-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate({ to: "/admin/services" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("superadmin.common.back")}
				</Button>
				<div className="text-destructive">{t("superadmin.common.noData")}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate({ to: "/admin/services" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("superadmin.common.back")}
				</Button>
			</div>

			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{t("superadmin.common.edit")}
				</h1>
				<p className="text-muted-foreground">{service.name.fr}</p>
			</div>

			<Card className="flex-1">
				<CardContent className="pt-6">
					<form
						id="service-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-8"
					>
						{/* Name & Description with Tabs */}
						<FieldGroup>
							<div className="space-y-2">
								<Label className="text-base font-semibold">
									{t("superadmin.services.form.name")} &{" "}
									{t("superadmin.services.form.description")}
								</Label>
								<Tabs defaultValue="fr" className="w-full">
									<TabsList>
										<TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
										<TabsTrigger value="en">🇬🇧 English</TabsTrigger>
									</TabsList>
									<TabsContent value="fr" className="space-y-4 mt-4">
										<form.Field
											name="nameFr"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															{t("superadmin.services.form.name")} *
														</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															autoComplete="off"
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										/>
										<form.Field
											name="descriptionFr"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															{t("superadmin.services.form.description")} *
														</FieldLabel>
														<Textarea
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															rows={3}
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										/>
									</TabsContent>
									<TabsContent value="en" className="space-y-4 mt-4">
										<form.Field
											name="nameEn"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("superadmin.services.form.name")}
													</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														autoComplete="off"
													/>
												</Field>
											)}
										/>
										<form.Field
											name="descriptionEn"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("superadmin.services.form.description")}
													</FieldLabel>
													<Textarea
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														rows={3}
													/>
												</Field>
											)}
										/>
									</TabsContent>
								</Tabs>
							</div>
						</FieldGroup>

						<Separator />

						{/* Slug (read-only), Category & Icon */}
						<FieldGroup>
							<Field>
								<FieldLabel>{t("superadmin.services.form.slug")}</FieldLabel>
								<div className="flex items-center h-10 px-3 bg-muted rounded-md">
									<code className="text-sm">{service.slug}</code>
								</div>
								<p className="text-xs text-muted-foreground">
									{t("superadmin.organizations.form.slugHelp")}
								</p>
							</Field>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<form.Field
									name="category"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("superadmin.services.form.category")}
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="passport">
														{t("superadmin.services.categories.passport")}
													</SelectItem>
													<SelectItem value="identity">
														{t("superadmin.services.categories.identity")}
													</SelectItem>
													<SelectItem value="visa">
														{t("superadmin.services.categories.visa")}
													</SelectItem>
													<SelectItem value="civil_status">
														{t("superadmin.services.categories.civil_status")}
													</SelectItem>
													<SelectItem value="registration">
														{t("superadmin.services.categories.registration")}
													</SelectItem>
													<SelectItem value="certification">
														{t("superadmin.services.categories.legalization")}
													</SelectItem>
													<SelectItem value="transcript">
														Transcription
													</SelectItem>
													<SelectItem value="travel_document">
														Document de voyage
													</SelectItem>
													<SelectItem value="assistance">
														{t("superadmin.services.categories.emergency")}
													</SelectItem>
													<SelectItem value="other">
														{t("superadmin.services.categories.other")}
													</SelectItem>
												</SelectContent>
											</Select>
										</Field>
									)}
								/>
								<form.Field
									name="icon"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("superadmin.services.form.icon")}
											</FieldLabel>
											<Input
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="passport, file-text, etc."
											/>
										</Field>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<form.Field
									name="estimatedDays"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("superadmin.services.form.estimatedDays") ||
													"Délai estimé (jours)"}
											</FieldLabel>
											<Input
												type="number"
												min="0"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</Field>
									)}
								/>
								<Field>
									<FieldLabel>
										{t("superadmin.services.form.requiresAppointment") ||
											"Rendez-vous requis"}
									</FieldLabel>
									<div className="flex items-center gap-2 h-10">
										<Switch
											checked={requiresAppointment}
											onCheckedChange={setRequiresAppointment}
										/>
										<span className="text-sm text-muted-foreground">
											{requiresAppointment ? "Oui" : "Non"}
										</span>
									</div>
								</Field>
							</div>
						</FieldGroup>

						<Separator />

						{/* Content (Rich Text) with Tabs */}
						<div className="space-y-2">
							<Label className="text-base font-semibold">
								{t("superadmin.services.form.content") || "Contenu détaillé"}
							</Label>
							<p className="text-sm text-muted-foreground">
								Informations détaillées, procédures, documents nécessaires, etc.
							</p>
							<Tabs defaultValue="fr" className="w-full">
								<TabsList>
									<TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
									<TabsTrigger value="en">🇬🇧 English</TabsTrigger>
								</TabsList>
								<TabsContent value="fr" className="mt-2">
									<RichTextEditor
										content={contentFr}
										onChange={setContentFr}
										placeholder="Contenu détaillé du service..."
									/>
								</TabsContent>
								<TabsContent value="en" className="mt-2">
									<RichTextEditor
										content={contentEn}
										onChange={setContentEn}
										placeholder="Detailed service content..."
									/>
								</TabsContent>
							</Tabs>
						</div>

						<Separator />

						{/* Required Documents */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className="text-base font-semibold">
										{t("superadmin.services.form.requiredDocuments")}
									</h3>
									<p className="text-sm text-muted-foreground">
										Documents requis pour cette démarche
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addDocument}
								>
									<Plus className="mr-2 h-4 w-4" />
									{t("superadmin.services.form.addDocument")}
								</Button>
							</div>

							{documents.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8 border rounded-md bg-muted/30">
									{t("superadmin.services.form.noDocuments")}
								</p>
							) : (
								<div className="space-y-3">
									{documents.map((doc, index) => (
										<div
											key={index}
											className="p-4 border rounded-md space-y-3 bg-muted/20"
										>
											<div className="flex gap-2 items-start">
												<div className="flex-1 space-y-3">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
														<Input
															placeholder="Label (FR) *"
															value={doc.label.fr}
															onChange={(e) =>
																updateDocumentLabel(index, "fr", e.target.value)
															}
														/>
														<Input
															placeholder="Label (EN)"
															value={doc.label.en || ""}
															onChange={(e) =>
																updateDocumentLabel(index, "en", e.target.value)
															}
														/>
													</div>
													<div className="flex gap-2">
														<Input
															placeholder="Type (ex: birth_certificate, photo)"
															value={doc.type}
															onChange={(e) =>
																updateDocumentType(index, e.target.value)
															}
															className="flex-1"
														/>
														<div className="flex items-center gap-2">
															<Switch
																checked={doc.required}
																onCheckedChange={(v) =>
																	updateDocumentRequired(index, v)
																}
															/>
															<span className="text-xs text-muted-foreground whitespace-nowrap">
																{doc.required ? "Requis" : "Optionnel"}
															</span>
														</div>
													</div>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeDocument(index)}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex justify-between border-t pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/admin/services" })}
					>
						{t("superadmin.services.form.cancel")}
					</Button>
					<Button type="submit" form="service-form" disabled={isPending}>
						{isPending
							? t("superadmin.organizations.form.saving")
							: t("superadmin.services.form.save")}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
