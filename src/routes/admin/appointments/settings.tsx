import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";

import { Clock, Lock, Plus, Settings, Trash2, Unlock } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useOrg } from "@/components/org/org-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
	useConvexQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/appointments/settings")({
	component: AppointmentSettings,
});

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function AppointmentSettings() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// Mutations
	const { mutateAsync: createSlot } = useConvexMutationQuery(
		api.functions.slots.createSlot,
	);
	const { mutateAsync: createSlotsBulk } = useConvexMutationQuery(
		api.functions.slots.createSlotsBulk,
	);
	const { mutateAsync: blockSlot } = useConvexMutationQuery(
		api.functions.slots.blockSlot,
	);
	const { mutateAsync: unblockSlot } = useConvexMutationQuery(
		api.functions.slots.unblockSlot,
	);
	const { mutateAsync: deleteSlot } = useConvexMutationQuery(
		api.functions.slots.deleteSlot,
	);

	// Query slots for the selected month
	const queryArgs = activeOrgId
		? {
				orgId: activeOrgId,
				month: selectedMonth,
			}
		: "skip";

	const { data: slots } = useAuthenticatedConvexQuery(
		api.functions.slots.listSlotsByOrg,
		queryArgs,
	);

	// Agent and service queries for selectors
	const { data: agents } = useAuthenticatedConvexQuery(
		api.functions.agentSchedules.listOrgAgents,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	const { data: orgServices } = useConvexQuery(
		api.functions.services.listByOrg,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	// Derived options
	const agentOptions = useMemo(() => {
		if (!agents || !Array.isArray(agents)) return [];
		return agents.map((a: any) => ({
			value: a._id as string,
			label: `${a.firstName} ${a.lastName}`,
		}));
	}, [agents]);

	const serviceOptions = useMemo(() => {
		if (!orgServices || !Array.isArray(orgServices)) return [];
		return orgServices.map((os: any) => ({
			value: os._id as string,
			label: os.name?.fr || os.name?.en || "Service",
		}));
	}, [orgServices]);

	const durationOptions = useMemo(
		() =>
			DURATION_OPTIONS.map((d) => ({
				value: String(d),
				label: `${d} min`,
			})),
		[],
	);

	// Group slots by date
	const slotsByDate = useMemo(() => {
		if (!slots) return {};
		const map: Record<string, typeof slots> = {};
		for (const slot of slots) {
			if (!map[slot.date]) map[slot.date] = [];
			map[slot.date].push(slot);
		}
		// Sort slots by time within each date
		for (const date in map) {
			map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
		}
		return map;
	}, [slots]);

	// Calendar days for the selected month
	const calendarDays = useMemo(() => {
		const [year, month] = selectedMonth.split("-").map(Number);
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);
		const daysInMonth = lastDay.getDate();
		const startPad = firstDay.getDay();

		const days: {
			date: string;
			day: number;
			isCurrentMonth: boolean;
			dayOfWeek: number;
		}[] = [];

		for (let i = 0; i < startPad; i++) {
			days.push({ date: "", day: 0, isCurrentMonth: false, dayOfWeek: i });
		}

		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			const dayOfWeek = new Date(year, month - 1, d).getDay();
			days.push({ date: dateStr, day: d, isCurrentMonth: true, dayOfWeek });
		}

		return days;
	}, [selectedMonth]);

	const handlePrevMonth = () => {
		const [year, month] = selectedMonth.split("-").map(Number);
		const prev =
			month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
		setSelectedMonth(
			`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`,
		);
	};

	const handleNextMonth = () => {
		const [year, month] = selectedMonth.split("-").map(Number);
		const next =
			month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);
		setSelectedMonth(
			`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
		);
	};

	const formatMonthYear = () => {
		const [year, month] = selectedMonth.split("-").map(Number);
		return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
			month: "long",
			year: "numeric",
		});
	};

	// Day labels using i18n
	const dayAbbreviations = useMemo(
		() => [
			t("common.days.sunday").slice(0, 3),
			t("common.days.monday").slice(0, 3),
			t("common.days.tuesday").slice(0, 3),
			t("common.days.wednesday").slice(0, 3),
			t("common.days.thursday").slice(0, 3),
			t("common.days.friday").slice(0, 3),
			t("common.days.saturday").slice(0, 3),
		],
		[t],
	);

	// --- Create Slot Form ---
	const createSlotForm = useForm({
		defaultValues: {
			date: "",
			startTime: "09:00",
			endTime: "10:00",
			capacity: 1,
			agentId: undefined as string | undefined,
			orgServiceId: undefined as string | undefined,
			duration: "30",
			isBulkCreate: false,
			bulkEndDate: "",
			selectedDays: [1, 2, 3, 4, 5] as number[], // Mon-Fri
		},
		onSubmit: async ({ value }) => {
			if (!activeOrgId) return;

			try {
				if (value.isBulkCreate) {
					const dates = generateBulkDates(
						value.date,
						value.bulkEndDate,
						value.selectedDays,
					);
					if (dates.length === 0) {
						toast.error(t("dashboard.appointments.settings.noDatesSelected"));
						return;
					}
					await createSlotsBulk({
						orgId: activeOrgId,
						agentId: value.agentId ? (value.agentId as Id<"users">) : undefined,
						orgServiceId: value.orgServiceId
							? (value.orgServiceId as Id<"orgServices">)
							: undefined,
						dates,
						startTime: value.startTime,
						endTime: value.endTime,
						capacity: value.capacity,
						durationMinutes: Number(value.duration),
					});
					toast.success(
						t("dashboard.appointments.settings.bulkCreated", {
							count: dates.length,
						}),
					);
				} else {
					await createSlot({
						orgId: activeOrgId,
						agentId: value.agentId ? (value.agentId as Id<"users">) : undefined,
						orgServiceId: value.orgServiceId
							? (value.orgServiceId as Id<"orgServices">)
							: undefined,
						date: value.date,
						startTime: value.startTime,
						endTime: value.endTime,
						capacity: value.capacity,
						durationMinutes: Number(value.duration),
					});
					toast.success(t("dashboard.appointments.settings.slotCreated"));
				}
				setIsCreateDialogOpen(false);
				createSlotForm.reset();
			} catch {
				toast.error(t("dashboard.appointments.settings.createError"));
			}
		},
	});

	// Generate dates for bulk creation
	const generateBulkDates = (
		startDate: string,
		endDate: string,
		selectedDays: number[],
	): string[] => {
		if (!startDate || !endDate) return [];

		const dates: string[] = [];
		const start = new Date(startDate);
		const end = new Date(endDate);

		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			if (selectedDays.includes(d.getDay())) {
				dates.push(d.toISOString().split("T")[0]);
			}
		}

		return dates;
	};

	const handleBlockSlot = async (slotId: Id<"appointmentSlots">) => {
		try {
			await blockSlot({
				slotId,
				reason: t("dashboard.appointments.settings.manualBlock"),
			});
			toast.success(t("dashboard.appointments.settings.slotBlocked"));
		} catch {
			toast.error(t("dashboard.appointments.settings.blockError"));
		}
	};

	const handleUnblockSlot = async (slotId: Id<"appointmentSlots">) => {
		try {
			await unblockSlot({ slotId });
			toast.success(t("dashboard.appointments.settings.slotUnblocked"));
		} catch {
			toast.error(t("dashboard.appointments.settings.unblockError"));
		}
	};

	const handleDeleteSlot = async (slotId: Id<"appointmentSlots">) => {
		try {
			await deleteSlot({ slotId });
			toast.success(t("dashboard.appointments.settings.slotDeleted"));
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes("bookings")) {
				toast.error(t("dashboard.appointments.settings.cannotDeleteBooked"));
			} else {
				toast.error(t("dashboard.appointments.settings.deleteError"));
			}
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Settings className="h-6 w-6" />
						{t("dashboard.appointments.settings.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.appointments.settings.description")}
					</p>
				</div>

				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={(open) => {
						setIsCreateDialogOpen(open);
						if (!open) createSlotForm.reset();
					}}
				>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							{t("dashboard.appointments.settings.addSlot")}
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								createSlotForm.handleSubmit();
							}}
						>
							<DialogHeader>
								<createSlotForm.Field
									name="isBulkCreate"
									children={(field) => (
										<DialogTitle>
											{field.state.value
												? t("dashboard.appointments.settings.createBulk")
												: t("dashboard.appointments.settings.createSlot")}
										</DialogTitle>
									)}
								/>
								<DialogDescription>
									{t("dashboard.appointments.settings.createDescription")}
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								{/* Agent selector */}
								<createSlotForm.Field
									name="agentId"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("dashboard.appointments.settings.agent")}
											</FieldLabel>
											<MultiSelect
												type="single"
												options={agentOptions}
												selected={field.state.value}
												onChange={field.handleChange}
												placeholder={t(
													"dashboard.appointments.settings.allAgents",
												)}
											/>
										</Field>
									)}
								/>

								{/* Service selector */}
								<createSlotForm.Field
									name="orgServiceId"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("dashboard.appointments.settings.service")}
											</FieldLabel>
											<MultiSelect
												type="single"
												options={serviceOptions}
												selected={field.state.value}
												onChange={field.handleChange}
												placeholder={t(
													"dashboard.appointments.settings.allServices",
												)}
											/>
										</Field>
									)}
								/>

								{/* Duration picker */}
								<createSlotForm.Field
									name="duration"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("dashboard.appointments.settings.duration")}
											</FieldLabel>
											<MultiSelect
												type="single"
												options={durationOptions}
												selected={field.state.value}
												onChange={(val) => field.handleChange(val ?? "30")}
											/>
										</Field>
									)}
								/>

								{/* Toggle bulk mode */}
								<createSlotForm.Field
									name="isBulkCreate"
									children={(field) => (
										<Field orientation="horizontal">
											<FieldLabel htmlFor="bulkMode">
												{t("dashboard.appointments.settings.bulkMode")}
											</FieldLabel>
											<Switch
												id="bulkMode"
												checked={field.state.value}
												onCheckedChange={field.handleChange}
											/>
										</Field>
									)}
								/>

								{/* Date(s) */}
								<div className="grid gap-4">
									<createSlotForm.Field
										name="date"
										validators={{
											onSubmit: ({ value }) =>
												!value
													? t("dashboard.appointments.settings.dateRequired")
													: undefined,
										}}
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched &&
												field.state.meta.errors.length > 0;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel>
														<createSlotForm.Field
															name="isBulkCreate"
															children={(bulkField) =>
																bulkField.state.value
																	? t(
																			"dashboard.appointments.settings.startDate",
																		)
																	: t("dashboard.appointments.settings.date")
															}
														/>
													</FieldLabel>
													<Input
														type="date"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
													{isInvalid && (
														<FieldError
															errors={field.state.meta.errors as any}
														/>
													)}
												</Field>
											);
										}}
									/>

									<createSlotForm.Field
										name="isBulkCreate"
										children={(bulkField) =>
											bulkField.state.value ? (
												<>
													<createSlotForm.Field
														name="bulkEndDate"
														children={(field) => (
															<Field>
																<FieldLabel>
																	{t("dashboard.appointments.settings.endDate")}
																</FieldLabel>
																<Input
																	type="date"
																	value={field.state.value}
																	onChange={(e) =>
																		field.handleChange(e.target.value)
																	}
																/>
															</Field>
														)}
													/>
													<createSlotForm.Field
														name="selectedDays"
														children={(field) => (
															<Field>
																<FieldLabel>
																	{t(
																		"dashboard.appointments.settings.weekDays",
																	)}
																</FieldLabel>
																<div className="flex gap-1">
																	{dayAbbreviations.map((label, idx) => (
																		<Button
																			key={idx}
																			type="button"
																			variant={
																				field.state.value.includes(idx)
																					? "default"
																					: "outline"
																			}
																			size="sm"
																			className="w-10"
																			onClick={() => {
																				const prev = field.state.value;
																				field.handleChange(
																					prev.includes(idx)
																						? prev.filter((d) => d !== idx)
																						: [...prev, idx],
																				);
																			}}
																		>
																			{label}
																		</Button>
																	))}
																</div>
															</Field>
														)}
													/>
												</>
											) : null
										}
									/>
								</div>

								{/* Time */}
								<div className="grid grid-cols-2 gap-4">
									<createSlotForm.Field
										name="startTime"
										children={(field) => (
											<Field>
												<FieldLabel>
													{t("dashboard.appointments.settings.startTime")}
												</FieldLabel>
												<Input
													type="time"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											</Field>
										)}
									/>
									<createSlotForm.Field
										name="endTime"
										children={(field) => (
											<Field>
												<FieldLabel>
													{t("dashboard.appointments.settings.endTime")}
												</FieldLabel>
												<Input
													type="time"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											</Field>
										)}
									/>
								</div>

								{/* Capacity */}
								<createSlotForm.Field
									name="capacity"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("dashboard.appointments.settings.capacity")}
											</FieldLabel>
											<Input
												type="number"
												min={1}
												value={field.state.value}
												onChange={(e) =>
													field.handleChange(parseInt(e.target.value) || 1)
												}
											/>
										</Field>
									)}
								/>

								{/* Bulk preview */}
								<createSlotForm.Field
									name="isBulkCreate"
									children={(bulkField) =>
										bulkField.state.value ? (
											<createSlotForm.Field
												name="date"
												children={(dateField) => (
													<createSlotForm.Field
														name="bulkEndDate"
														children={(endField) => (
															<createSlotForm.Field
																name="selectedDays"
																children={(daysField) =>
																	dateField.state.value &&
																	endField.state.value ? (
																		<p className="text-sm text-muted-foreground">
																			{t(
																				"dashboard.appointments.settings.bulkPreview",
																				{
																					count: generateBulkDates(
																						dateField.state.value,
																						endField.state.value,
																						daysField.state.value,
																					).length,
																				},
																			)}
																		</p>
																	) : null
																}
															/>
														)}
													/>
												)}
											/>
										) : null
									}
								/>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit">
									<createSlotForm.Field
										name="isBulkCreate"
										children={(field) =>
											field.state.value
												? t("dashboard.appointments.settings.createBulkAction")
												: t("dashboard.appointments.settings.createSlotAction")
										}
									/>
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Calendar View */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button variant="outline" size="sm" onClick={handlePrevMonth}>
								←
							</Button>
							<CardTitle className="min-w-[200px] text-center capitalize">
								{formatMonthYear()}
							</CardTitle>
							<Button variant="outline" size="sm" onClick={handleNextMonth}>
								→
							</Button>
						</div>
						<CardDescription>
							{t("dashboard.appointments.settings.slotsConfigured", {
								count: slots?.length ?? 0,
							})}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-7 gap-1 text-center text-sm">
						{dayAbbreviations.map((day) => (
							<div key={day} className="py-2 font-medium text-muted-foreground">
								{day}
							</div>
						))}
						{calendarDays.map((day, idx) => (
							<div
								key={idx}
								className={`min-h-[100px] rounded-md border p-1 ${
									day.isCurrentMonth ? "bg-background" : "bg-muted/30"
								}`}
							>
								{day.isCurrentMonth && (
									<>
										<div className="flex items-center justify-between px-1">
											<span className="text-xs font-medium">{day.day}</span>
											<button
												onClick={() => {
													createSlotForm.setFieldValue("date", day.date);
													setIsCreateDialogOpen(true);
												}}
												className="text-xs text-primary hover:underline"
											>
												+
											</button>
										</div>
										<div className="mt-1 space-y-0.5 max-h-[70px] overflow-y-auto">
											{slotsByDate[day.date]?.map((slot) => (
												<div
													key={slot._id}
													className={`group flex items-center justify-between rounded px-1 text-xs ${
														slot.isBlocked
															? "bg-destructive/20 text-destructive"
															: slot.bookedCount >= slot.capacity
																? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
																: "bg-primary/10 text-primary"
													}`}
												>
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{slot.startTime}
														{slot.durationMinutes && (
															<span className="text-[10px] opacity-70">
																{slot.durationMinutes}m
															</span>
														)}
													</span>
													<span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														{slot.isBlocked ? (
															<button
																onClick={() => handleUnblockSlot(slot._id)}
																title={t(
																	"dashboard.appointments.settings.unblock",
																)}
															>
																<Unlock className="h-3 w-3" />
															</button>
														) : (
															<button
																onClick={() => handleBlockSlot(slot._id)}
																title={t(
																	"dashboard.appointments.settings.block",
																)}
															>
																<Lock className="h-3 w-3" />
															</button>
														)}
														{slot.bookedCount === 0 && (
															<button
																onClick={() => handleDeleteSlot(slot._id)}
																title={t(
																	"dashboard.appointments.settings.delete",
																)}
															>
																<Trash2 className="h-3 w-3" />
															</button>
														)}
													</span>
												</div>
											))}
										</div>
									</>
								)}
							</div>
						))}
					</div>

					{/* Legend */}
					<div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-primary/10" />
							<span>{t("dashboard.appointments.settings.available")}</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-amber-100 dark:bg-amber-900/30" />
							<span>{t("dashboard.appointments.settings.full")}</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-destructive/20" />
							<span>{t("dashboard.appointments.settings.blocked")}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-primary">
								{slots?.filter(
									(s) => !s.isBlocked && s.bookedCount < s.capacity,
								).length ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("dashboard.appointments.settings.availableSlots")}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-amber-600">
								{slots?.reduce((acc, s) => acc + s.bookedCount, 0) ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("dashboard.appointments.settings.bookingsThisMonth")}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-destructive">
								{slots?.filter((s) => s.isBlocked).length ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("dashboard.appointments.settings.blockedSlots")}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
