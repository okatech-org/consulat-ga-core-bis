"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import type { FormSchema } from "@/components/admin/FormBuilder";
import { useFormFillEffect } from "@/components/ai/useFormFillEffect";
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

interface DynamicFormProps {
	schema: FormSchema;
	defaultValues?: Record<string, unknown>;
	onSubmit: (data: Record<string, unknown>) => Promise<void>;
	isSubmitting?: boolean;
}

// Helper to get localized string
const getLocalized = (obj: { fr: string; en?: string }, lang: string) => {
	return lang === "en" && obj.en ? obj.en : obj.fr;
};

export function DynamicForm({
	schema,
	defaultValues,
	onSubmit,
	isSubmitting,
}: DynamicFormProps) {
	const { i18n, t } = useTranslation();
	const lang = i18n.language;
	const [currentStep, setCurrentStep] = useState(0);

	// 1. Parse sections + Zod Schema generation
	const { sections, zodSchema } = useMemo(() => {
		const rawProperties = schema.properties || {};
		const uiOrder = schema["x-ui-order"] || Object.keys(rawProperties);

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
					fields: Object.entries(prop.properties || {}).map(
						([fieldKey, fieldProp]: [string, Record<string, unknown>]) => ({
							id: fieldKey,
							path: `${key}.${fieldKey}`,
							...fieldProp,
							required:
								(prop.required as string[])?.includes(fieldKey) || false,
						}),
					),
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
						fieldSchema = z.string().email();
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
						fieldSchema = numSchema;
						break;
					}
					case "checkbox":
						fieldSchema = z.boolean().default(false);
						break;
					default: {
						// text, select, date, file, textarea
						let strSchema = z.string();
						const validation = field.validation as
							| { pattern?: string }
							| undefined;
						if (validation?.pattern) {
							strSchema = strSchema.regex(new RegExp(validation.pattern));
						}
						fieldSchema = strSchema;
					}
				}

				if (!field.required && field.type !== "checkbox") {
					fieldSchema = fieldSchema.optional().or(z.literal(""));
				} else if (field.required && field.type !== "checkbox") {
					fieldSchema = (fieldSchema as z.ZodString).min(1, {
						message: t("required"),
					});
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

	// 3. Navigation Logic
	const nextStep = async () => {
		const currentSectionId = sections[currentStep].id;
		// Validate only current section
		const valid = await form.trigger(
			currentSectionId as keyof z.infer<typeof zodSchema>,
		);
		if (valid) {
			setCurrentStep((prev) => Math.min(prev + 1, sections.length - 1));
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const prevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const isLastStep = currentStep === sections.length - 1;
	const currentSection = sections[currentStep];

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			{/* Progress Indicator */}
			<div className="flex items-center justify-between mb-8 px-1">
				<div className="flex space-x-2">
					{sections.map((_, idx) => (
						<div
							key={idx}
							className={cn(
								"h-1.5 w-8 rounded-full transition-colors duration-300",
								idx <= currentStep ? "bg-primary" : "bg-muted",
							)}
						/>
					))}
				</div>
				<span className="text-sm text-muted-foreground font-medium">
					{t("step")} {currentStep + 1} / {sections.length}
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
						<CardHeader>
							<CardTitle>{currentSection.title}</CardTitle>
							{currentSection.description && (
								<CardDescription>{currentSection.description}</CardDescription>
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
														{field.type !== "checkbox" && (
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

														{/* Input (text, email, number, date) */}
														{!["textarea", "select", "checkbox"].includes(
															field.type as string,
														) && (
															<Input
																{...formField}
																id={fieldId}
																type={
																	field.type === "number"
																		? "number"
																		: field.type === "email"
																			? "email"
																			: field.type === "date"
																				? "date"
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
														{field.type !== "checkbox" && field.description && (
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
					</Card>
				</motion.div>
			</AnimatePresence>
		</form>
	);
}
