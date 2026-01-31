"use client";

import {
	AlignLeft,
	Calendar,
	CheckSquare,
	Eye,
	EyeOff,
	FileUp,
	GripVertical,
	Hash,
	Layers,
	List,
	Mail,
	Phone,
	Plus,
	Settings2,
	Trash2,
	Type,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormPreview } from "@/components/admin/FormPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Field types with their icons
const FIELD_TYPES = [
	{
		type: "text",
		icon: Type,
		labelKey: "superadmin.services.formBuilder.fieldTypes.text",
	},
	{
		type: "email",
		icon: Mail,
		labelKey: "superadmin.services.formBuilder.fieldTypes.email",
	},
	{
		type: "phone",
		icon: Phone,
		labelKey: "superadmin.services.formBuilder.fieldTypes.phone",
	},
	{
		type: "date",
		icon: Calendar,
		labelKey: "superadmin.services.formBuilder.fieldTypes.date",
	},
	{
		type: "select",
		icon: List,
		labelKey: "superadmin.services.formBuilder.fieldTypes.select",
	},
	{
		type: "file",
		icon: FileUp,
		labelKey: "superadmin.services.formBuilder.fieldTypes.file",
	},
	{
		type: "checkbox",
		icon: CheckSquare,
		labelKey: "superadmin.services.formBuilder.fieldTypes.checkbox",
	},
	{
		type: "textarea",
		icon: AlignLeft,
		labelKey: "superadmin.services.formBuilder.fieldTypes.textarea",
	},
	{
		type: "number",
		icon: Hash,
		labelKey: "superadmin.services.formBuilder.fieldTypes.number",
	},
] as const;

type FieldType = (typeof FIELD_TYPES)[number]["type"];

export interface FormField {
	id: string;
	type: FieldType;
	label: { fr: string; en?: string };
	description?: { fr?: string; en?: string };
	required: boolean;
	options?: { value: string; label: { fr: string; en?: string } }[];
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
	};
	condition?: FieldCondition; // Conditional visibility
}

/**
 * Condition to show/hide a field or section based on another field's value
 * Supports operators: equals, notEquals, contains, isEmpty, isNotEmpty
 */
export interface FieldCondition {
	fieldPath: string; // Path to the field being checked (e.g., "section.fieldId")
	operator:
		| "equals"
		| "notEquals"
		| "contains"
		| "isEmpty"
		| "isNotEmpty"
		| "greaterThan"
		| "lessThan";
	value?: string | number | boolean; // Value to compare against (not needed for isEmpty/isNotEmpty)
}

export interface FormSection {
	id: string;
	title: { fr: string; en?: string };
	description?: { fr?: string; en?: string };
	fields: FormField[];
	optional?: boolean; // If true, the whole section object is optional in schema
	condition?: FieldCondition; // Conditional visibility for entire section
}

export interface FormSchema {
	type: "object";
	properties: Record<string, any>; // Sections as objects
	required?: string[]; // IDs of mandatory sections
	"x-ui-order"?: string[]; // Order of sections
}

interface FormBuilderProps {
	initialSchema?: FormSchema;
	onSchemaChange?: (schema: FormSchema) => void;
}

function generateId(prefix = "field") {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function FormBuilder({
	initialSchema,
	onSchemaChange,
}: FormBuilderProps) {
	const { t } = useTranslation();

	const [sections, setSections] = useState<FormSection[]>([]);
	const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

	// Preview state
	const [showPreview, setShowPreview] = useState(false);
	const [previewData, setPreviewData] = useState<
		Record<string, Record<string, unknown>>
	>({});

	// Helpers to parse legacy vs new schema
	const parseSchemaToSections = (schema: any): FormSection[] => {
		if (!schema || !schema.properties) return [];

		// Detect if legacy (Flat fields at root)
		// Heuristic: If properties have "type" string/number etc directly, it's legacy.
		// If properties are "type": "object", it's nested (Section).
		const firstProp = Object.values(schema.properties)[0] as any;
		const isLegacy =
			firstProp && firstProp.type !== "object" && firstProp.type !== undefined;

		if (isLegacy) {
			// Migrate legacy fields to a single default section
			const fields = parseFieldsFromProperties(
				schema.properties,
				schema.required,
			);
			return [
				{
					id: "section_default",
					title: { fr: "Information" }, // Default title
					fields,
					optional: false,
				},
			];
		}

		// Parse Nested Sections
		const sectionIds = schema["x-ui-order"] || Object.keys(schema.properties);
		const requiredSections = schema.required || [];

		return sectionIds
			.map((id: string) => {
				const sectionSchema = schema.properties[id];
				if (!sectionSchema) return null;

				return {
					id,
					title: sectionSchema.title || { fr: id },
					description: sectionSchema.description,
					optional: !requiredSections.includes(id),
					fields: parseFieldsFromProperties(
						sectionSchema.properties || {},
						sectionSchema.required,
					),
				};
			})
			.filter(Boolean) as FormSection[];
	};

	const parseFieldsFromProperties = (
		properties: any,
		required: string[] = [],
	): FormField[] => {
		return Object.entries(properties).map(([key, value]: [string, any]) => {
			let type: FieldType = "text";
			const options: any[] = [];
			let validation: FormField["validation"] = undefined;

			// Determine type
			if (value.type === "string") {
				if (value.format === "email") type = "email";
				else if (value.format === "date") type = "date";
				else if (value.format === "file") type = "file";
				else if (value.enum) {
					type = "select";
					value.enum.forEach((val: string) => {
						const label = value.enumLabels?.[val] || { fr: val };
						options.push({ value: val, label });
					});
				} else {
					type = "text";
				}
			} else if (value.type === "number") {
				type = "number";
				validation = {
					min: value.minimum,
					max: value.maximum,
				};
			} else if (value.type === "boolean") {
				type = "checkbox";
			}

			return {
				id: key,
				type,
				label: value.title || { fr: key },
				description: value.description,
				required: required.includes(key),
				options: options.length > 0 ? options : undefined,
				validation,
			};
		});
	};

	// Initialize
	useEffect(() => {
		if (initialSchema) {
			const loadedSections = parseSchemaToSections(initialSchema);
			setSections(loadedSections);
			if (loadedSections.length > 0 && !activeSectionId) {
				setActiveSectionId(loadedSections[0].id);
			}
		} else if (sections.length === 0) {
			// Init with one empty section
			const defaultSection = {
				id: generateId("section"),
				title: { fr: "Section 1" },
				fields: [],
				optional: false,
			};
			setSections([defaultSection]);
			setActiveSectionId(defaultSection.id);
		}
	}, [initialSchema]);

	// Convert ALL sections to JSON Schema
	const toJsonSchema = useCallback((): FormSchema => {
		const properties: Record<string, any> = {};
		const requiredSections: string[] = [];
		const order: string[] = [];

		for (const section of sections) {
			order.push(section.id);
			if (!section.optional) requiredSections.push(section.id);

			// Build Section Schema
			const sectionProps: Record<string, any> = {};
			const sectionRequired: string[] = [];

			for (const field of section.fields) {
				const prop: Record<string, any> = {
					title: field.label,
					description: field.description,
				};

				switch (field.type) {
					case "text":
					case "email":
					case "phone":
					case "textarea":
						prop.type = "string";
						if (field.type === "email") prop.format = "email";
						break;
					case "date":
						prop.type = "string";
						prop.format = "date";
						break;
					case "number":
						prop.type = "number";
						if (field.validation?.min !== undefined)
							prop.minimum = field.validation.min;
						if (field.validation?.max !== undefined)
							prop.maximum = field.validation.max;
						break;
					case "checkbox":
						prop.type = "boolean";
						break;
					// ... other types mapping same as before
					case "select":
						prop.type = "string";
						if (field.options?.length) {
							prop.enum = field.options.map((o) => o.value);
							prop.enumLabels = field.options.reduce((acc: any, o) => {
								acc[o.value] = o.label;
								return acc;
							}, {});
						}
						break;
					case "file":
						prop.type = "string";
						prop.format = "file";
						break;
				}

				sectionProps[field.id] = prop;
				if (field.required) sectionRequired.push(field.id);
			}

			properties[section.id] = {
				type: "object",
				title: section.title,
				description: section.description,
				properties: sectionProps,
				required: sectionRequired,
				additionalProperties: false,
			};
		}

		return {
			type: "object",
			properties,
			required: requiredSections,
			"x-ui-order": order,
		};
	}, [sections]);

	// Notify parent
	useEffect(() => {
		if (onSchemaChange) onSchemaChange(toJsonSchema());
	}, [toJsonSchema, onSchemaChange]);

	// --- Actions ---

	const addSection = () => {
		const newSection: FormSection = {
			id: generateId("section"),
			title: { fr: `Section ${sections.length + 1}` },
			fields: [],
			optional: false,
		};
		setSections([...sections, newSection]);
		setActiveSectionId(newSection.id);
		setSelectedFieldId(null);
	};

	const updateSection = (id: string, updates: Partial<FormSection>) => {
		setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
	};

	const removeSection = (id: string) => {
		if (sections.length <= 1) return; // Prevent deleting last section
		const newSections = sections.filter((s) => s.id !== id);
		setSections(newSections);
		if (activeSectionId === id) setActiveSectionId(newSections[0].id);
	};

	const addField = (type: FieldType) => {
		if (!activeSectionId) return;

		const newField: FormField = {
			id: generateId(),
			type,
			label: { fr: "Nouveau champ", en: "New field" },
			required: false,
			options:
				type === "select"
					? [{ value: "option1", label: { fr: "Option 1" } }]
					: undefined,
		};

		setSections(
			sections.map((s) =>
				s.id === activeSectionId
					? { ...s, fields: [...s.fields, newField] }
					: s,
			),
		);
		setSelectedFieldId(newField.id);
	};

	const updateField = (id: string, updates: Partial<FormField>) => {
		setSections(
			sections.map((s) => ({
				...s,
				fields: s.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
			})),
		);
	};

	const removeField = (id: string) => {
		setSections(
			sections.map((s) => ({
				...s,
				fields: s.fields.filter((f) => f.id !== id),
			})),
		);
		if (selectedFieldId === id) setSelectedFieldId(null);
	};

	// Select Option helpers (flattened for brevity)
	const updateFieldOptions = (fieldId: string, newOptions: any[]) => {
		updateField(fieldId, { options: newOptions });
	};

	const activeSection = sections.find((s) => s.id === activeSectionId);
	const selectedField = activeSection?.fields.find(
		(f) => f.id === selectedFieldId,
	);

	// Contextual Title for Right Panel
	const configPanelTitle = selectedField
		? t("superadmin.services.formBuilder.editField")
		: activeSection
			? "Configuration de la Section"
			: "Sélectionnez un élément";

	return (
		<div className="space-y-4">
			{/* Preview Toggle */}
			<div className="flex justify-end">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowPreview(!showPreview)}
					className="gap-2"
					type="button"
				>
					{showPreview ? (
						<>
							<EyeOff className="h-4 w-4" />
							Masquer prévisualisation
						</>
					) : (
						<>
							<Eye className="h-4 w-4" />
							Prévisualisation
						</>
					)}
				</Button>
			</div>

			<div
				className={cn(
					"grid gap-6 h-[calc(100vh-14rem)] min-h-[500px]",
					showPreview ? "grid-cols-12" : "grid-cols-12",
				)}
			>
				{/* LEFT: Sections List + Field Toolbox */}
				<div
					className={cn(
						"flex flex-col gap-4",
						showPreview ? "col-span-2" : "col-span-3",
					)}
				>
					<Card className="flex-1 flex flex-col min-h-0 shadow-sm border-muted">
						<CardHeader className="pb-2 border-b border-muted">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium">Sections</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={addSection}
									type="button"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<ScrollArea className="flex-1">
							<div className="p-2 space-y-1">
								{sections.map((section) => (
									<button
										key={section.id}
										type="button"
										onClick={() => {
											setActiveSectionId(section.id);
											setSelectedFieldId(null); // Deselect field when switching section
										}}
										className={cn(
											"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
											activeSectionId === section.id
												? "bg-primary/10 text-primary font-medium"
												: "hover:bg-muted text-muted-foreground",
										)}
									>
										<Layers className="h-4 w-4 shrink-0" />
										<span className="truncate flex-1 text-left">
											{section.title.fr || "Sans titre"}
										</span>
									</button>
								))}
							</div>
						</ScrollArea>
					</Card>

					<Card className="flex-1 flex flex-col min-h-0 shadow-sm border-muted">
						<CardHeader className="pb-2 border-b border-muted bg-muted/30">
							<CardTitle className="text-xs font-medium uppercase text-muted-foreground">
								{t("superadmin.services.formBuilder.addField")}
							</CardTitle>
						</CardHeader>
						<ScrollArea className="flex-1">
							<div className="p-2 grid grid-cols-2 gap-2">
								{FIELD_TYPES.map(({ type, icon: Icon, labelKey }) => (
									<Button
										key={type}
										variant="outline"
										size="sm"
										className="justify-start h-auto py-2 px-2"
										onClick={() => addField(type)}
										type="button"
										disabled={!activeSectionId}
									>
										<Icon className="h-3 w-3 mr-2 shrink-0" />
										<span className="text-xs truncate">{t(labelKey)}</span>
									</Button>
								))}
							</div>
						</ScrollArea>
					</Card>
				</div>

				{/* CENTER: Active Section Canvas */}
				<div
					className={cn(
						"flex flex-col min-h-0",
						showPreview ? "col-span-4" : "col-span-5",
					)}
				>
					<Card className="h-full flex flex-col border-2 border-dashed border-muted shadow-sm bg-muted/5">
						<CardHeader className="pb-4 border-b bg-card">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-base">
										{activeSection?.title.fr || "Section"}
									</CardTitle>
									<p className="text-xs text-muted-foreground">
										{activeSection?.fields.length} champs
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setSelectedFieldId(null)} // Click header to edit section props
									className={!selectedFieldId ? "bg-accent" : ""}
									type="button"
								>
									<Settings2 className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<ScrollArea className="flex-1 p-4">
							<div className="space-y-3">
								{activeSection?.fields.length === 0 ? (
									<div className="text-center py-12 text-muted-foreground">
										<p>{t("superadmin.services.formBuilder.noFields")}</p>
									</div>
								) : (
									activeSection?.fields.map((field) => {
										const FieldIcon =
											FIELD_TYPES.find((t) => t.type === field.type)?.icon ||
											Type;
										return (
											<button
												key={field.id}
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedFieldId(field.id);
												}}
												className={cn(
													"group relative w-full flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-sm text-left",
													selectedFieldId === field.id
														? "ring-2 ring-primary border-primary"
														: "hover:border-primary/50",
												)}
											>
												<GripVertical className="h-4 w-4 text-muted-foreground/30" />
												<div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
													<FieldIcon className="h-4 w-4 text-foreground" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{field.label.fr || "Nom du champ"}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														Type: {field.type}
														{field.required && " • Requis"}
													</p>
												</div>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
													onClick={(e) => {
														e.stopPropagation();
														removeField(field.id);
													}}
													type="button"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</button>
										);
									})
								)}
							</div>
						</ScrollArea>
					</Card>
				</div>

				{/* RIGHT: Properties Editor (Section OR Field) */}
				<div
					className={cn(
						"flex flex-col min-h-0",
						showPreview ? "col-span-3" : "col-span-4",
					)}
				>
					<Card className="h-full flex flex-col shadow-sm border-muted">
						<CardHeader className="pb-3 border-b border-muted">
							<CardTitle className="text-sm font-medium">
								{configPanelTitle}
							</CardTitle>
						</CardHeader>
						<ScrollArea className="flex-1">
							<CardContent className="p-4 space-y-6">
								{selectedField ? (
									// FIELD EDITOR
									<div className="space-y-4">
										<Tabs defaultValue="fr" className="w-full">
											<TabsList className="grid w-full grid-cols-2">
												<TabsTrigger value="fr">🇫🇷 FR</TabsTrigger>
												<TabsTrigger value="en">🇬🇧 EN</TabsTrigger>
											</TabsList>
											<TabsContent value="fr" className="space-y-3 mt-3">
												<div className="space-y-2">
													<Label>Libellé (Question)</Label>
													<Input
														value={selectedField.label.fr}
														onChange={(e) =>
															updateField(selectedField.id, {
																label: {
																	...selectedField.label,
																	fr: e.target.value,
																},
															})
														}
													/>
												</div>
												<div className="space-y-2">
													<Label>Description / Aide</Label>
													<Input
														value={selectedField.description?.fr || ""}
														onChange={(e) =>
															updateField(selectedField.id, {
																description: {
																	...selectedField.description,
																	fr: e.target.value,
																},
															})
														}
													/>
												</div>
											</TabsContent>
											<TabsContent value="en" className="space-y-3 mt-3">
												{/* English inputs */}
												<div className="space-y-2">
													<Label>Label</Label>
													<Input
														value={selectedField.label.en || ""}
														onChange={(e) =>
															updateField(selectedField.id, {
																label: {
																	...selectedField.label,
																	en: e.target.value,
																},
															})
														}
													/>
												</div>
											</TabsContent>
										</Tabs>

										<Separator />

										<div className="flex items-center justify-between">
											<Label>Champ obligatoire</Label>
											<Switch
												checked={selectedField.required}
												onCheckedChange={(v) =>
													updateField(selectedField.id, { required: v })
												}
											/>
										</div>

										{/* Type Specific Configs */}
										{selectedField.type === "select" && (
											<div className="space-y-2 pt-2">
												<div className="flex justify-between items-center">
													<Label>Options</Label>
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															const opts = selectedField.options || [];
															updateFieldOptions(selectedField.id, [
																...opts,
																{
																	value: `opt${opts.length}`,
																	label: { fr: "Nouvelle option" },
																},
															]);
														}}
														type="button"
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
												<div className="space-y-2">
													{selectedField.options?.map((opt, idx) => (
														<div key={opt.value} className="flex gap-2">
															<Input
																value={opt.value}
																onChange={(e) => {
																	const newOpts = [
																		...(selectedField.options || []),
																	];
																	newOpts[idx] = {
																		...newOpts[idx],
																		value: e.target.value,
																	};
																	updateFieldOptions(selectedField.id, newOpts);
																}}
																className="w-1/3 text-xs"
															/>
															<Input
																value={opt.label.fr}
																onChange={(e) => {
																	const newOpts = [
																		...(selectedField.options || []),
																	];
																	newOpts[idx] = {
																		...newOpts[idx],
																		label: {
																			...newOpts[idx].label,
																			fr: e.target.value,
																		},
																	};
																	updateFieldOptions(selectedField.id, newOpts);
																}}
																className="flex-1 text-xs"
															/>
															<Button
																size="icon"
																variant="ghost"
																type="button"
																onClick={() => {
																	const newOpts = (
																		selectedField.options || []
																	).filter((_, i) => i !== idx);
																	updateFieldOptions(selectedField.id, newOpts);
																}}
															>
																<Trash2 className="h-3 w-3 text-destructive" />
															</Button>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								) : null}

								{!selectedField && activeSection ? (
									// SECTION EDITOR
									<div className="space-y-6">
										<div className="space-y-2">
											<Label>Titre de la section</Label>
											<Input
												value={activeSection.title.fr}
												onChange={(e) =>
													updateSection(activeSection.id, {
														title: {
															...activeSection.title,
															fr: e.target.value,
														},
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<Label>Description</Label>
											<Textarea
												value={activeSection.description?.fr || ""}
												onChange={(e) =>
													updateSection(activeSection.id, {
														description: {
															...activeSection.description,
															fr: e.target.value,
														},
													})
												}
												rows={3}
											/>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<Label>Section Optionnelle</Label>
												<p className="text-xs text-muted-foreground">
													L'utilisateur peut sauter cette étape
												</p>
											</div>
											<Switch
												checked={activeSection.optional}
												onCheckedChange={(v) =>
													updateSection(activeSection.id, { optional: v })
												}
											/>
										</div>
										<div className="pt-8">
											<Button
												variant="destructive"
												className="w-full"
												onClick={() => removeSection(activeSection.id)}
												disabled={sections.length <= 1}
												type="button"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Supprimer la section
											</Button>
										</div>
									</div>
								) : null}

								{!selectedField && !activeSection && (
									<div className="text-center text-muted-foreground py-10">
										Sélectionnez une section ou un champ pour éditer ses
										propriétés.
									</div>
								)}
							</CardContent>
						</ScrollArea>
					</Card>
				</div>

				{/* PREVIEW PANEL (conditional) */}
				{showPreview && (
					<div className="col-span-3 flex flex-col min-h-0">
						<Card className="flex-1 flex flex-col overflow-hidden">
							<CardHeader className="pb-2 border-b">
								<CardTitle className="text-sm font-medium">
									Prévisualisation
								</CardTitle>
							</CardHeader>
							<ScrollArea className="flex-1 p-4">
								<FormPreview
									sections={sections}
									previewData={previewData}
									onPreviewDataChange={setPreviewData}
									currentSectionId={activeSectionId ?? undefined}
								/>
							</ScrollArea>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
