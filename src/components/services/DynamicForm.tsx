"use client";

import { OwnerType } from "@convex/lib/constants";
import { getLocalized } from "@convex/lib/utils";
import type { FormSchema } from "@convex/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useFormFillEffect } from "@/components/ai/useFormFillEffect";
import { DocumentField } from "@/components/services/DocumentField";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { evaluateCondition } from "@/lib/conditionEvaluator";
import { cn } from "@/lib/utils";

interface RequiredDocument {
	type: string;
	label: { fr: string; en?: string };
	required: boolean;
}

interface DynamicFormProps {
	/** Form schema - optional for documents-only services */
	schema?: FormSchema;
	defaultValues?: Record<string, unknown>;
	onSubmit: (data: Record<string, unknown>) => Promise<void>;
	isSubmitting?: boolean;
	/** Owner ID for document uploads (request ID or profile ID) */
	ownerId?: string;
	/** Owner type for document uploads */
	ownerType?: OwnerType;
	/** Callback when documents are updated */
	onDocumentsChange?: (fieldPath: string, documentIds: string[]) => void;
	/** Required documents from service config - creates a final Documents step */
	requiredDocuments?: RequiredDocument[];
}

export function DynamicForm({
	schema,
	defaultValues,
	onSubmit,
	isSubmitting,
	ownerId,
	ownerType,
	onDocumentsChange,
	requiredDocuments = [],
}: DynamicFormProps) {
	const { i18n, t } = useTranslation();
	const lang = i18n.language;
	const [currentStep, setCurrentStep] = useState(0);

	// Track uploaded documents by type: { docType: [documentId1, documentId2] }
	const [documentUploads, setDocumentUploads] = useState<
		Record<string, string[]>
	>({});

	// 1. Parse sections + Zod Schema generation
	const { sections, zodSchema } = useMemo(() => {
		// Handle empty/undefined schema for documents-only services
		if (!schema || !schema.properties) {
			return { sections: [], zodSchema: z.object({}) };
		}

		const rawProperties = schema.properties;
		const uiOrder = schema["x-ui-order"] || Object.keys(rawProperties);

		// Helper to derive UI field type from JSON Schema properties
		const deriveUIType = (fieldProp: Record<string, unknown>): string => {
			const schemaType = fieldProp.type as string;
			const format = fieldProp.format as string | undefined;
			const hasEnum =
				Array.isArray(fieldProp.enum) && fieldProp.enum.length > 0;

			if (schemaType === "boolean") return "checkbox";
			if (schemaType === "number" || schemaType === "integer") return "number";
			if (schemaType === "string") {
				if (hasEnum) return "select";
				if (format === "date") return "date";
				if (format === "email") return "email";
				if (format === "file") return "file";
				// Check for textarea hint in description or title
				if ((fieldProp.description as Record<string, string>)?.fr?.length > 100)
					return "textarea";
			}
			return "text";
		};

		// Create Sections array
		const orderedSections = uiOrder
			.map((key) => {
				const prop = rawProperties[key];
				if (!prop || prop.type !== "object") return null;
				return {
					id: key,
					title: getLocalized(prop.title, lang),
					description: prop.description
						? getLocalized(prop.description, lang)
						: undefined,
					fields: Object.entries(
						prop.properties || ({} as Record<string, Record<string, unknown>>),
					).map(([fieldKey, fieldProp]) => ({
						id: fieldKey,
						path: `${key}.${fieldKey}`,
						...(fieldProp as Record<string, unknown>),
						// Override type with derived UI type
						type: deriveUIType(fieldProp as Record<string, unknown>),
						required: (prop.required as string[])?.includes(fieldKey) || false,
					})),
				};
			})
			.filter(Boolean) as Array<{
			id: string;
			title: string;
			description?: string;
			fields: Array<Record<string, unknown>>;
		}>;

		// Generate Zod Schema
		const shape: Record<string, z.ZodTypeAny> = {};

		// We construct a nested Zod object for each section
		orderedSections.forEach((section) => {
			const sectionShape: Record<string, z.ZodTypeAny> = {};

			section.fields.forEach((field) => {
				let fieldSchema: z.ZodTypeAny;

				switch (field.type) {
					case "email":
						fieldSchema = field.required
							? z
									.string()
									.min(1, { message: t("required") })
									.email()
							: z.string().email().optional().or(z.literal(""));
						break;
					case "number": {
						let numSchema = z.coerce.number();
						const validation = field.validation as
							| { min?: number; max?: number }
							| undefined;
						if (validation?.min !== undefined)
							numSchema = numSchema.min(validation.min);
						if (validation?.max !== undefined)
							numSchema = numSchema.max(validation.max);
						fieldSchema = field.required ? numSchema : numSchema.optional();
						break;
					}
					case "checkbox":
						fieldSchema = z.boolean().default(false);
						break;
					case "file":
						// File fields store array of document IDs
						fieldSchema = field.required
							? z.array(z.string()).min(1, {
									message: t(
										"form.file_required",
										"Au moins un document requis",
									),
								})
							: z.array(z.string()).default([]);
						break;
					default: {
						// text, select, date, textarea, phone
						let strSchema = z.string();
						const validation = field.validation as
							| { pattern?: string }
							| undefined;
						if (validation?.pattern) {
							strSchema = strSchema.regex(new RegExp(validation.pattern));
						}
						if (field.required) {
							fieldSchema = strSchema.min(1, { message: t("required") });
						} else {
							fieldSchema = strSchema.optional().or(z.literal(""));
						}
					}
				}

				sectionShape[field.id as string] = fieldSchema;
			});

			shape[section.id] = z.object(sectionShape);
		});

		return {
			sections: orderedSections,
			zodSchema: z.object(shape),
		};
	}, [schema, lang, t]);

	// 2. Form Initialization
	const form = useForm<z.infer<typeof zodSchema>>({
		resolver: zodResolver(zodSchema),
		defaultValues: defaultValues || {},
		mode: "onChange",
	});

	// AI Fill Effect - Generate mapping from schema and apply
	const dynamicMapping = useMemo(() => {
		const mapping: Record<string, string> = {};
		sections.forEach((section) => {
			section.fields.forEach((field) => {
				const fieldPath = `${section.id}.${field.id}`;
				const normalizedKey = (field.id as string)
					.toLowerCase()
					.replace(/[_-]/g, "");

				// Map common field names to their paths
				const commonMappings: Record<string, string[]> = {
					firstName: ["firstname", "prenom", "givenname"],
					lastName: ["lastname", "nom", "familyname", "surname"],
					birthDate: ["birthdate", "datenaissance", "dateofbirth", "dob"],
					birthPlace: ["birthplace", "lieunaissance", "placeofbirth"],
					email: ["email", "courriel", "mail"],
					phone: ["phone", "telephone", "tel", "mobile"],
					nationality: ["nationality", "nationalite"],
					gender: ["gender", "sexe"],
				};

				for (const [aiKey, aliases] of Object.entries(commonMappings)) {
					if (aliases.includes(normalizedKey)) {
						mapping[aiKey] = fieldPath;
						break;
					}
				}
			});
		});
		return mapping;
	}, [sections]);

	useFormFillEffect(form, "dynamic", dynamicMapping);

	// Calculate steps: form sections + documents (optional)
	const hasDocumentsStep = requiredDocuments.length > 0;
	const totalSteps = sections.length + (hasDocumentsStep ? 1 : 0);
	const isDocumentsStep = hasDocumentsStep && currentStep === totalSteps - 1;
	const formSectionIndex = currentStep;

	// 3. Navigation Logic
	const nextStep = async () => {
		// If on a schema section, validate it first
		if (formSectionIndex >= 0 && formSectionIndex < sections.length) {
			const currentSectionId = sections[formSectionIndex].id;
			const valid = await form.trigger(
				currentSectionId as keyof z.infer<typeof zodSchema>,
			);
			if (!valid) return;
		}
		setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const prevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const isLastStep = currentStep === totalSteps - 1;
	const currentSection =
		formSectionIndex >= 0 && formSectionIndex < sections.length
			? sections[formSectionIndex]
			: null;

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			{/* Progress Indicator */}
			<div className="flex items-center justify-between mb-8 px-1">
				<div className="flex space-x-2">
					{Array.from({ length: totalSteps }).map((_, idx) => (
						<div
							key={`step-${idx}`}
							className={cn(
								"h-1.5 w-8 rounded-full transition-colors duration-300",
								idx <= currentStep ? "bg-primary" : "bg-muted",
							)}
						/>
					))}
				</div>
				<span className="text-sm text-muted-foreground font-medium">
					{t("step")} {currentStep + 1} / {totalSteps}
				</span>
			</div>

			<AnimatePresence mode="wait">
				<motion.div
					key={currentStep}
					initial={{ opacity: 0, x: 10 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -10 }}
					transition={{ duration: 0.2 }}
				>
					<Card className="border-border/50 shadow-sm">
						{/* Profile Verification Step */}
						{isProfileStep && profile ? (
							<ProfileVerificationStep
								profile={profile}
								onComplete={() => {
									nextStep();
									onProfileVerified?.();
								}}
							/>
						) : /* Documents Step */
						isDocumentsStep ? (
							<>
								<CardHeader>
									<CardTitle>
										{t("documents.checklist.title", "Pièces justificatives")}
									</CardTitle>
									<CardDescription>
										{t(
											"documents.checklist.description",
											"Veuillez téléverser les documents requis pour compléter votre demande.",
										)}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<FieldGroup>
										{requiredDocuments.map((doc) => {
											const docUploads = documentUploads[doc.type] || [];
											return (
												<DocumentField
													key={doc.type}
													fieldId={`doc-${doc.type}`}
													label={getLocalized(doc.label, lang)}
													description={
														doc.required
															? t("common.required", "Obligatoire")
															: t("common.optional", "Optionnel")
													}
													required={doc.required}
													documentIds={docUploads}
													docType={doc.type}
													ownerId={ownerId || ""}
													ownerType={ownerType || OwnerType.Request}
													isInvalid={doc.required && docUploads.length === 0}
													onUpload={(documentId) => {
														setDocumentUploads((prev) => ({
															...prev,
															[doc.type]: [
																...(prev[doc.type] || []),
																documentId,
															],
														}));
													}}
													onRemove={(documentId) => {
														setDocumentUploads((prev) => ({
															...prev,
															[doc.type]: (prev[doc.type] || []).filter(
																(id) => id !== documentId,
															),
														}));
													}}
												/>
											);
										})}
									</FieldGroup>
								</CardContent>
							</>
						) : currentSection ? (
							<>
								<CardHeader>
									<CardTitle>{currentSection.title}</CardTitle>
									{currentSection.description && (
										<CardDescription>
											{currentSection.description}
										</CardDescription>
									)}
								</CardHeader>
								<CardContent>
									<FieldGroup>
										{currentSection.fields
											.filter((field) => {
												// Check if field has a condition and if it's met
												if (!field.condition) return true;
												const formValues = form.getValues();
												return evaluateCondition(
													field.condition as {
														fieldPath: string;
														operator: string;
														value?: unknown;
													},
													formValues,
												);
											})
											.map((field) => {
												const fieldName =
													`${currentSection.id}.${field.id}` as keyof z.infer<
														typeof zodSchema
													>;
												const fieldId = `form-${currentSection.id}-${field.id}`;

												return (
													<Controller
														key={field.id as string}
														name={fieldName}
														control={form.control}
														render={({ field: formField, fieldState }) => (
															<Field data-invalid={fieldState.invalid}>
																{field.type !== "checkbox" &&
																	field.type !== "file" && (
																		<FieldLabel htmlFor={fieldId}>
																			{getLocalized(
																				(field.title as {
																					fr: string;
																					en?: string;
																				}) || { fr: field.id as string },
																				lang,
																			)}
																			{field.required && (
																				<span className="text-destructive ml-1">
																					*
																				</span>
																			)}
																		</FieldLabel>
																	)}

																{/* Textarea */}
																{field.type === "textarea" && (
																	<Textarea
																		{...formField}
																		id={fieldId}
																		aria-invalid={fieldState.invalid}
																		placeholder={
																			field.description
																				? getLocalized(
																						field.description as {
																							fr: string;
																							en?: string;
																						},
																						lang,
																					)
																				: undefined
																		}
																		className="resize-none min-h-[100px]"
																	/>
																)}

																{/* Select */}
																{field.type === "select" && (
																	<Select
																		onValueChange={formField.onChange}
																		defaultValue={formField.value as string}
																	>
																		<SelectTrigger
																			id={fieldId}
																			aria-invalid={fieldState.invalid}
																		>
																			<SelectValue
																				placeholder={t(
																					"select_placeholder",
																					"Sélectionner...",
																				)}
																			/>
																		</SelectTrigger>
																		<SelectContent>
																			{((field.enum as string[]) || []).map(
																				(val: string) => (
																					<SelectItem key={val} value={val}>
																						{getLocalized(
																							(
																								field.enumLabels as Record<
																									string,
																									{ fr: string; en?: string }
																								>
																							)?.[val] || {
																								fr: val,
																							},
																							lang,
																						)}
																					</SelectItem>
																				),
																			)}
																		</SelectContent>
																	</Select>
																)}

																{/* Checkbox */}
																{field.type === "checkbox" && (
																	<div className="flex items-center space-x-2">
																		<Checkbox
																			id={fieldId}
																			checked={formField.value as boolean}
																			onCheckedChange={formField.onChange}
																			aria-invalid={fieldState.invalid}
																		/>
																		<label
																			htmlFor={fieldId}
																			className="text-sm text-muted-foreground cursor-pointer"
																		>
																			{field.description
																				? getLocalized(
																						field.description as {
																							fr: string;
																							en?: string;
																						},
																						lang,
																					)
																				: getLocalized(
																						(field.title as {
																							fr: string;
																							en?: string;
																						}) || { fr: field.id as string },
																						lang,
																					)}
																		</label>
																	</div>
																)}

																{/* Document Upload Field */}
																{field.type === "file" &&
																	ownerId &&
																	ownerType && (
																		<DocumentField
																			fieldId={fieldId}
																			label={getLocalized(
																				(field.title as {
																					fr: string;
																					en?: string;
																				}) || { fr: field.id as string },
																				lang,
																			)}
																			description={
																				field.description
																					? getLocalized(
																							field.description as {
																								fr: string;
																								en?: string;
																							},
																							lang,
																						)
																					: undefined
																			}
																			required={field.required as boolean}
																			documentIds={
																				(formField.value as string[]) || []
																			}
																			docType={
																				(field.docType as string) ||
																				(field.id as string)
																			}
																			ownerId={ownerId}
																			ownerType={ownerType}
																			isInvalid={fieldState.invalid}
																			onUpload={(documentId) => {
																				const currentIds =
																					(formField.value as string[]) || [];
																				const newIds = [
																					...currentIds,
																					documentId,
																				];
																				formField.onChange(newIds);
																				onDocumentsChange?.(
																					fieldName as string,
																					newIds,
																				);
																			}}
																			onRemove={(documentId) => {
																				const currentIds =
																					(formField.value as string[]) || [];
																				const newIds = currentIds.filter(
																					(id) => id !== documentId,
																				);
																				formField.onChange(newIds);
																				onDocumentsChange?.(
																					fieldName as string,
																					newIds,
																				);
																			}}
																		/>
																	)}

																{/* Fallback: Basic file input when no owner context */}
																{field.type === "file" &&
																	(!ownerId || !ownerType) && (
																		<div className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground">
																			{t(
																				"form.file_upload_unavailable",
																				"L'upload de fichiers sera disponible après la création de la demande",
																			)}
																		</div>
																	)}

																{/* Input (text, email, number, date, phone) */}
																{![
																	"textarea",
																	"select",
																	"checkbox",
																	"file",
																].includes(field.type as string) && (
																	<Input
																		{...formField}
																		value={(formField.value as string) ?? ""}
																		id={fieldId}
																		type={
																			field.type === "number"
																				? "number"
																				: field.type === "email"
																					? "email"
																					: field.type === "date"
																						? "date"
																						: field.type === "phone"
																							? "tel"
																							: "text"
																		}
																		aria-invalid={fieldState.invalid}
																		placeholder={
																			field.description
																				? getLocalized(
																						field.description as {
																							fr: string;
																							en?: string;
																						},
																						lang,
																					)
																				: undefined
																		}
																	/>
																)}

																{/* Description (for non-checkbox) */}
																{field.type !== "checkbox" &&
																	field.description && (
																		<FieldDescription>
																			{getLocalized(
																				field.description as {
																					fr: string;
																					en?: string;
																				},
																				lang,
																			)}
																		</FieldDescription>
																	)}

																{/* Error */}
																{fieldState.invalid && (
																	<FieldError errors={[fieldState.error]} />
																)}
															</Field>
														)}
													/>
												);
											})}
									</FieldGroup>
								</CardContent>
							</>
						) : null}

						{/* Hide footer during profile verification step - it has its own button */}
						{!isProfileStep && (
							<CardFooter className="flex justify-between pt-6 border-t bg-muted/20">
								<Button
									type="button"
									variant="ghost"
									onClick={prevStep}
									disabled={currentStep === 0}
									className={cn(currentStep === 0 && "invisible")}
								>
									<ArrowLeft className="mr-2 size-4" />
									{t("previous", "Précédent")}
								</Button>

								{isLastStep ? (
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 size-4 animate-spin" />
												{t("submitting", "Envoi en cours...")}
											</>
										) : (
											<>
												<Check className="mr-2 size-4" />
												{t("submit", "Soumettre la demande")}
											</>
										)}
									</Button>
								) : (
									<Button type="button" onClick={nextStep}>
										{t("next", "Suivant")}
										<ArrowRight className="ml-2 size-4" />
									</Button>
								)}
							</CardFooter>
						)}
					</Card>
				</motion.div>
			</AnimatePresence>
		</form>
	);
}
