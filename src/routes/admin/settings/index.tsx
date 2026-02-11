import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";

import {
	Building2,
	Clock,
	Edit,
	Globe,
	Mail,
	MapPin,
	Moon,
	Palette,
	Phone,
	Plus,
	Save,
	Trash2,
	X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useOrg } from "@/components/org/org-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type ConsularTheme, useConsularTheme } from "@/hooks/useConsularTheme";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings/")({
	component: DashboardSettings,
});

const DAYS_OF_WEEK = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

function DashboardSettings() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const { data: org } = useAuthenticatedConvexQuery(
		api.functions.orgs.getById,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);
	const { data: isAdmin } = useAuthenticatedConvexQuery(
		api.functions.orgs.isUserAdmin,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);
	const { mutateAsync: updateProfile } = useConvexMutationQuery(
		api.functions.orgs.update,
	);

	const form = useForm({
		defaultValues: {
			name: org?.name || "",
			description: org?.description || "",
			phone: org?.phone || "",
			email: org?.email || "",
			website: org?.website || "",
			street: org?.address?.street || "",
			city: org?.address?.city || "",
			postalCode: org?.address?.postalCode || "",
			country: org?.address?.country || "",
			workingHours: org?.settings?.workingHours || {},
			appointmentBuffer: org?.settings?.appointmentBuffer || 30,
		},
		onSubmit: async ({ value }) => {
			if (!activeOrgId) return;

			try {
				await updateProfile({
					orgId: activeOrgId,
					name: value.name || undefined,
					description: value.description || undefined,
					phone: value.phone || undefined,
					email: value.email || undefined,
					website: value.website || undefined,
					address: {
						street: value.street,
						city: value.city,
						postalCode: value.postalCode,
						country: value.country as any,
					},
					settings: {
						workingHours: value.workingHours,
						appointmentBuffer: Number(value.appointmentBuffer),
						maxActiveRequests: org?.settings?.maxActiveRequests || 10,
					},
				});
				toast.success(t("dashboard.settings.updateSuccess"));
				setIsEditing(false);
			} catch (error) {
				toast.error(t("dashboard.settings.updateError"));
			}
		},
	});

	const handleEdit = () => {
		if (org) {
			form.setFieldValue("name", org.name || "");
			form.setFieldValue("description", org.description || "");
			form.setFieldValue("phone", org.phone || "");
			form.setFieldValue("email", org.email || "");
			form.setFieldValue("website", org.website || "");
			form.setFieldValue("street", org.address?.street || "");
			form.setFieldValue("city", org.address?.city || "");
			form.setFieldValue("postalCode", org.address?.postalCode || "");
			form.setFieldValue("country", org.address?.country || "");
			form.setFieldValue("workingHours", org?.settings?.workingHours || {});
			form.setFieldValue(
				"appointmentBuffer",
				org?.settings?.appointmentBuffer || 30,
			);
			setIsEditing(true);
		}
	};

	if (org === undefined || isAdmin === undefined) {
		return (
			<div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
				<Skeleton className="h-8 w-64" />
				<div className="grid gap-4 md:grid-cols-2">
					<Skeleton className="h-[200px]" />
					<Skeleton className="h-[200px]" />
				</div>
			</div>
		);
	}

	if (!org) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-4">
				<p className="text-muted-foreground">
					{t("dashboard.settings.notFound")}
				</p>
			</div>
		);
	}

	const getOrgTypeLabel = (type: string) => {
		const types: Record<string, string> = {
			consulate: t("dashboard.settings.orgTypes.consulate"),
			consulate_general: t("dashboard.settings.orgTypes.consulateGeneral"),
			embassy: t("dashboard.settings.orgTypes.embassy"),
			honorary_consulate: t("dashboard.settings.orgTypes.honoraryConsulate"),
			ministry: t("dashboard.settings.orgTypes.ministry"),
			other: t("dashboard.settings.orgTypes.other"),
		};
		return types[type] || type;
	};

	return (
		<div className="flex flex-col gap-4 p-4 md:p-6 min-h-full overflow-auto">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.settings.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.settings.description")}
					</p>
				</div>
				{isAdmin && !isEditing && (
					<Button onClick={handleEdit}>
						<Edit className="mr-2 h-4 w-4" />
						{t("dashboard.settings.edit")}
					</Button>
				)}
			</div>

			<form
				id="settings-form"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className="grid gap-4 md:grid-cols-2">
					{/* Profile Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building2 className="h-5 w-5" />
								{t("dashboard.settings.orgProfile")}
							</CardTitle>
							<CardDescription>
								{t("dashboard.settings.orgProfileDescription")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								{isEditing ? (
									<>
										<form.Field
											name="name"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															{t("dashboard.settings.name")}
														</FieldLabel>
														<Input
															id={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										/>
										<div>
											<FieldLabel>{t("dashboard.settings.type")}</FieldLabel>
											<Badge variant="secondary">
												{getOrgTypeLabel(org.type)}
											</Badge>
										</div>
										<form.Field
											name="description"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															{t("dashboard.settings.descriptionLabel")}
														</FieldLabel>
														<Textarea
															id={field.name}
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
									</>
								) : (
									<>
										<div>
											<p className="text-sm text-muted-foreground">
												{t("dashboard.settings.name")}
											</p>
											<p className="font-medium">{org.name}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												{t("dashboard.settings.type")}
											</p>
											<Badge variant="secondary">
												{getOrgTypeLabel(org.type)}
											</Badge>
										</div>
										{org.description && (
											<div>
												<p className="text-sm text-muted-foreground">
													{t("dashboard.settings.descriptionLabel")}
												</p>
												<p className="text-sm">{org.description}</p>
											</div>
										)}
									</>
								)}
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Address Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								{t("dashboard.settings.address")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								{isEditing ? (
									<>
										<form.Field
											name="street"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.street")}
													</FieldLabel>
													<Input
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
										<form.Field
											name="city"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.city")}
													</FieldLabel>
													<Input
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
										<form.Field
											name="postalCode"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.postalCode")}
													</FieldLabel>
													<Input
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
										<form.Field
											name="country"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.country")}
													</FieldLabel>
													<Input
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
									</>
								) : org.address ? (
									<>
										{org.address.street && <p>{org.address.street}</p>}
										<p>
											{org.address.city}
											{org.address.postalCode && `, ${org.address.postalCode}`}
										</p>
										<p>{org.address.country}</p>
									</>
								) : (
									<p className="text-muted-foreground">
										{t("dashboard.settings.noAddress")}
									</p>
								)}
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Contact Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="h-5 w-5" />
								{t("dashboard.settings.contact")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								{isEditing ? (
									<>
										<form.Field
											name="phone"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.phone")}
													</FieldLabel>
													<Input
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
										<form.Field
											name="email"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.email")}
													</FieldLabel>
													<Input
														id={field.name}
														type="email"
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
										<form.Field
											name="website"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														{t("dashboard.settings.website")}
													</FieldLabel>
													<Input
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</Field>
											)}
										/>
									</>
								) : (
									<>
										{org.phone && (
											<div className="flex items-center gap-2">
												<Phone className="h-4 w-4 text-muted-foreground" />
												<span>{org.phone}</span>
											</div>
										)}
										{org.email && (
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span>{org.email}</span>
											</div>
										)}
										{org.website && (
											<div className="flex items-center gap-2">
												<Globe className="h-4 w-4 text-muted-foreground" />
												<a
													href={org.website}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:underline"
												>
													{org.website}
												</a>
											</div>
										)}
										{!org.phone && !org.email && !org.website && (
											<p className="text-muted-foreground">
												{t("dashboard.settings.noContact")}
											</p>
										)}
									</>
								)}
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Working Hours Card */}
					<Card className="col-span-1">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								{t("dashboard.settings.workingHours")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isEditing ? (
								<div className="space-y-4">
									<form.Field
										name="appointmentBuffer"
										children={(field) => (
											<div className="flex items-center gap-4 max-w-sm">
												<FieldLabel className="whitespace-nowrap">
													{t("dashboard.settings.appointmentBuffer")}
												</FieldLabel>
												<Input
													type="number"
													min="0"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													className="w-24"
												/>
												<span className="text-sm text-muted-foreground">
													min
												</span>
											</div>
										)}
									/>

									<div className="grid gap-4">
										{DAYS_OF_WEEK.map((day) => (
											<div
												key={day}
												className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border rounded-lg"
											>
												<div className="w-32 font-medium capitalize">
													{t(`dashboard.settings.days.${day}`)}
												</div>
												<form.Field
													name={"workingHours.${day}" as any}
													children={(field) => {
														const slots = (field.state.value as any[]) || [];
														return (
															<div className="flex-1 space-y-2">
																{slots.map((slot: any, index: number) => (
																	<div
																		key={index}
																		className="flex items-center gap-2"
																	>
																		<Input
																			type="time"
																			value={slot.start}
																			onChange={(e) => {
																				const newSlots = [...slots];
																				newSlots[index] = {
																					...slot,
																					start: e.target.value,
																				};
																				field.handleChange(newSlots);
																			}}
																			className="w-32"
																		/>
																		<span>-</span>
																		<Input
																			type="time"
																			value={slot.end}
																			onChange={(e) => {
																				const newSlots = [...slots];
																				newSlots[index] = {
																					...slot,
																					end: e.target.value,
																				};
																				field.handleChange(newSlots);
																			}}
																			className="w-32"
																		/>
																		<Button
																			variant="ghost"
																			size="icon"
																			type="button"
																			onClick={() => {
																				const newSlots = slots.filter(
																					(_, i) => i !== index,
																				);
																				field.handleChange(newSlots);
																			}}
																		>
																			<Trash2 className="h-4 w-4 text-destructive" />
																		</Button>
																	</div>
																))}
																<Button
																	variant="outline"
																	size="sm"
																	type="button"
																	onClick={() => {
																		field.handleChange([
																			...slots,
																			{
																				start: "09:00",
																				end: "17:00",
																				isOpen: true,
																			},
																		]);
																	}}
																>
																	<Plus className="mr-2 h-4 w-4" />
																	{t("dashboard.settings.addSlot")}
																</Button>
															</div>
														);
													}}
												/>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="grid gap-2">
									<div className="flex gap-2 text-sm text-muted-foreground mb-2">
										<span>{t("dashboard.settings.appointmentBuffer")}:</span>
										<span className="font-medium text-foreground">
											{org.settings?.appointmentBuffer || 30} min
										</span>
									</div>
									{DAYS_OF_WEEK.map((day) => {
										const slots = org.settings?.workingHours?.[day] || [];
										return (
											<div
												key={day}
												className="flex justify-between items-center py-2 border-b last:border-0"
											>
												<span className="capitalize">
													{t(`dashboard.settings.days.${day}`)}
												</span>
												<div className="text-right">
													{slots.length > 0 ? (
														slots.map((slot: any, idx: number) => (
															<div key={idx} className="text-sm">
																{slot.start} - {slot.end}
															</div>
														))
													) : (
														<span className="text-sm text-muted-foreground">
															{t("dashboard.settings.closed")}
														</span>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Display Settings — Dark Mode + Theme Switcher */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Moon className="h-5 w-5" />
								{t("settings.display.title")}
							</CardTitle>
							<CardDescription>
								{t("settings.display.description")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<DarkModeToggle />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Palette className="h-5 w-5" />
								{t("settings.consularTheme.title")}
							</CardTitle>
							<CardDescription>
								{t("settings.consularTheme.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ThemeSwitcher />
						</CardContent>
					</Card>
				</div>

				{isEditing && (
					<div className="flex items-center gap-2 justify-end mt-4">
						<Button
							variant="outline"
							type="button"
							onClick={() => setIsEditing(false)}
						>
							<X className="mr-2 h-4 w-4" />
							{t("common.cancel")}
						</Button>
						<Button type="submit" form="settings-form">
							<Save className="mr-2 h-4 w-4" />
							{t("common.save")}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
}

/* -------------------------------------------------- */
/*  Dark Mode Toggle                                  */
/* -------------------------------------------------- */
function DarkModeToggle() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	return (
		<div className="flex items-center justify-between">
			<div className="space-y-0.5">
				<label className="text-sm font-medium">
					{t("settings.display.darkMode")}
				</label>
				<p className="text-sm text-muted-foreground">
					{t("settings.display.darkModeDesc")}
				</p>
			</div>
			<Switch
				checked={theme === "dark"}
				onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
			/>
		</div>
	);
}

/* -------------------------------------------------- */
/*  Theme Switcher (Classique / Homorphisme)           */
/* -------------------------------------------------- */
function ThemePreview({
	themeId,
	label,
	description,
	isActive,
	onClick,
}: {
	themeId: ConsularTheme;
	label: string;
	description: string;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer w-full text-left",
				isActive
					? "border-primary bg-primary/5 ring-2 ring-primary/20"
					: "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
			)}
		>
			<div
				className={cn(
					"w-16 h-12 rounded-lg overflow-hidden relative shrink-0",
					themeId === "default"
						? "bg-card border border-border"
						: "bg-[oklch(0.92_0.005_250)]",
				)}
			>
				{themeId === "default" ? (
					<div className="p-1.5 space-y-1">
						<div className="h-1.5 w-5 bg-primary/20 rounded" />
						<div className="h-2.5 bg-muted rounded border border-border" />
						<div className="flex gap-0.5">
							<div className="h-2 flex-1 bg-muted rounded border border-border" />
							<div className="h-2 flex-1 bg-muted rounded border border-border" />
						</div>
					</div>
				) : (
					<div className="p-1.5 space-y-1">
						<div className="h-1.5 w-5 bg-primary/20 rounded" />
						<div
							className="h-2.5 rounded"
							style={{
								background: "oklch(0.92 0.005 250)",
								boxShadow:
									"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
							}}
						/>
						<div className="flex gap-0.5">
							<div
								className="h-2 flex-1 rounded"
								style={{
									background: "oklch(0.92 0.005 250)",
									boxShadow:
										"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
								}}
							/>
							<div
								className="h-2 flex-1 rounded"
								style={{
									background: "oklch(0.92 0.005 250)",
									boxShadow:
										"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
								}}
							/>
						</div>
					</div>
				)}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold">{label}</p>
				<p className="text-xs text-muted-foreground leading-tight truncate">
					{description}
				</p>
			</div>
			{isActive && <div className="w-3 h-3 rounded-full bg-primary shrink-0" />}
		</button>
	);
}

function ThemeSwitcher() {
	const { t } = useTranslation();
	const { consularTheme, setConsularTheme } = useConsularTheme();
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<ThemePreview
				themeId="default"
				label={t("settings.consularTheme.default")}
				description={t("settings.consularTheme.defaultDesc")}
				isActive={consularTheme === "default"}
				onClick={() => setConsularTheme("default")}
			/>
			<ThemePreview
				themeId="homeomorphism"
				label={t("settings.consularTheme.homeomorphism")}
				description={t("settings.consularTheme.homeomorphismDesc")}
				isActive={consularTheme === "homeomorphism"}
				onClick={() => setConsularTheme("homeomorphism")}
			/>
		</div>
	);
}
