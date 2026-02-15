import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";

import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Clock,
	Loader2,
	Plus,
	Power,
	PowerOff,
	Settings,
	Trash2,
	UserCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
	useConvexQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/appointments/settings")({
	component: AppointmentSettings,
});

const DAYS_OF_WEEK = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
] as const;

function AppointmentSettings() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
		null,
	);

	// ===== Queries =====
	const { data: schedules, isLoading: schedulesLoading } =
		useAuthenticatedConvexQuery(
			api.functions.agentSchedules.listByOrg,
			activeOrgId ? { orgId: activeOrgId } : "skip",
		);

	const { data: agents } = useAuthenticatedConvexQuery(
		api.functions.agentSchedules.listOrgAgents,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	const { data: orgServices } = useConvexQuery(
		api.functions.services.listByOrg,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	// ===== Mutations =====
	const { mutateAsync: upsertSchedule } = useConvexMutationQuery(
		api.functions.agentSchedules.upsert,
	);
	const { mutateAsync: toggleActive } = useConvexMutationQuery(
		api.functions.agentSchedules.toggleActive,
	);
	const { mutateAsync: deleteSchedule } = useConvexMutationQuery(
		api.functions.agentSchedules.deleteSchedule,
	);
	const { mutateAsync: addException } = useConvexMutationQuery(
		api.functions.agentSchedules.addException,
	);
	const { mutateAsync: removeException } = useConvexMutationQuery(
		api.functions.agentSchedules.removeException,
	);

	// ===== Derived data =====
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

	// ===== Create schedule form =====
	const createForm = useForm({
		defaultValues: {
			agentId: "" as string,
			orgServiceId: undefined as string | undefined,
			weeklySchedule: DAYS_OF_WEEK.slice(0, 5).map((day) => ({
				day,
				timeRanges: [
					{ start: "08:00", end: "12:00" },
					{ start: "14:00", end: "17:00" },
				],
			})),
		},
		onSubmit: async ({ value }) => {
			if (!activeOrgId || !value.agentId) {
				toast.error(t("dashboard.appointments.settings.selectAgent"));
				return;
			}

			try {
				await upsertSchedule({
					orgId: activeOrgId,
					agentId: value.agentId as Id<"memberships">,
					orgServiceId: value.orgServiceId
						? (value.orgServiceId as Id<"orgServices">)
						: undefined,
					weeklySchedule: value.weeklySchedule.map((ws) => ({
						day: ws.day as (typeof DAYS_OF_WEEK)[number],
						timeRanges: ws.timeRanges,
					})),
				});
				toast.success(t("dashboard.appointments.settings.scheduleCreated"));
				setIsCreateDialogOpen(false);
				createForm.reset();
			} catch {
				toast.error(t("dashboard.appointments.settings.createError"));
			}
		},
	});

	// ===== Handlers =====
	const handleToggleActive = async (scheduleId: Id<"agentSchedules">) => {
		try {
			const result = await toggleActive({ scheduleId });
			toast.success(
				result.isActive
					? t("dashboard.appointments.settings.scheduleActivated")
					: t("dashboard.appointments.settings.scheduleDeactivated"),
			);
		} catch {
			toast.error(t("error.generic"));
		}
	};

	const handleDeleteSchedule = async (scheduleId: Id<"agentSchedules">) => {
		try {
			await deleteSchedule({ scheduleId });
			toast.success(t("dashboard.appointments.settings.scheduleDeleted"));
		} catch {
			toast.error(t("error.generic"));
		}
	};

	const handleAddException = async (
		scheduleId: Id<"agentSchedules">,
		date: string,
		available: boolean,
		reason?: string,
	) => {
		try {
			await addException({
				scheduleId,
				exception: { date, available, reason },
			});
			toast.success(t("dashboard.appointments.settings.exceptionAdded"));
		} catch {
			toast.error(t("error.generic"));
		}
	};

	const handleRemoveException = async (
		scheduleId: Id<"agentSchedules">,
		date: string,
	) => {
		try {
			await removeException({ scheduleId, date });
			toast.success(t("dashboard.appointments.settings.exceptionRemoved"));
		} catch {
			toast.error(t("error.generic"));
		}
	};

	// Day labels
	const dayLabels = useMemo(
		() => ({
			monday: t("common.days.monday"),
			tuesday: t("common.days.tuesday"),
			wednesday: t("common.days.wednesday"),
			thursday: t("common.days.thursday"),
			friday: t("common.days.friday"),
			saturday: t("common.days.saturday"),
			sunday: t("common.days.sunday"),
		}),
		[t],
	);

	if (schedulesLoading) {
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

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
						if (!open) createForm.reset();
					}}
				>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							{t("dashboard.appointments.settings.addSchedule")}
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								createForm.handleSubmit();
							}}
						>
							<DialogHeader>
								<DialogTitle>
									{t("dashboard.appointments.settings.createSchedule")}
								</DialogTitle>
								<DialogDescription>
									{t("dashboard.appointments.settings.createScheduleDesc")}
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								{/* Agent selector */}
								<createForm.Field
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
													"dashboard.appointments.settings.selectAgent",
												)}
											/>
										</Field>
									)}
								/>

								{/* Service selector */}
								<createForm.Field
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

								{/* Weekly schedule summary */}
								<div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
									<p className="font-medium mb-1">
										{t("dashboard.appointments.settings.defaultSchedule")}
									</p>
									<p>
										{t("dashboard.appointments.settings.monFri")}: 08:00–12:00,
										14:00–17:00
									</p>
								</div>
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
									{t("dashboard.appointments.settings.createScheduleAction")}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Schedules list */}
			{!schedules || schedules.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
						<Calendar className="h-12 w-12 mb-4 opacity-30" />
						<p className="font-medium">
							{t("dashboard.appointments.settings.noSchedules")}
						</p>
						<p className="text-sm mt-1">
							{t("dashboard.appointments.settings.noSchedulesDesc")}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{schedules.map((schedule) => {
						const isExpanded = expandedScheduleId === schedule._id;
						return (
							<Card
								key={schedule._id}
								className={!schedule.isActive ? "opacity-60" : ""}
							>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<UserCircle className="h-5 w-5 text-primary" />
											<div>
												<CardTitle className="text-base">
													{schedule.agent
														? `${schedule.agent.firstName} ${schedule.agent.lastName}`
														: t("dashboard.appointments.settings.unknownAgent")}
												</CardTitle>
												<CardDescription className="flex items-center gap-2">
													{schedule.serviceName ? (
														<span>
															{typeof schedule.serviceName === "object" &&
															schedule.serviceName !== null
																? (schedule.serviceName as any).fr ||
																	(schedule.serviceName as any).en
																: String(schedule.serviceName)}
														</span>
													) : (
														<span>
															{t("dashboard.appointments.settings.allServices")}
														</span>
													)}
													<Badge
														variant={
															schedule.isActive ? "default" : "secondary"
														}
														className="text-xs"
													>
														{schedule.isActive
															? t("dashboard.appointments.settings.active")
															: t("dashboard.appointments.settings.inactive")}
													</Badge>
												</CardDescription>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													setExpandedScheduleId(
														isExpanded ? null : schedule._id,
													)
												}
											>
												{isExpanded ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												)}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													handleToggleActive(
														schedule._id as Id<"agentSchedules">,
													)
												}
												title={
													schedule.isActive
														? t("dashboard.appointments.settings.deactivate")
														: t("dashboard.appointments.settings.activate")
												}
											>
												{schedule.isActive ? (
													<Power className="h-4 w-4" />
												) : (
													<PowerOff className="h-4 w-4" />
												)}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													handleDeleteSchedule(
														schedule._id as Id<"agentSchedules">,
													)
												}
												title={t("common.delete")}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</div>
								</CardHeader>

								{isExpanded && (
									<CardContent className="space-y-4">
										{/* Weekly schedule */}
										<div>
											<h4 className="text-sm font-medium mb-2">
												{t("dashboard.appointments.settings.weeklySchedule")}
											</h4>
											<div className="space-y-1">
												{schedule.weeklySchedule.map((ws) => (
													<div
														key={ws.day}
														className="flex items-center gap-3 text-sm"
													>
														<span className="w-24 font-medium">
															{dayLabels[ws.day as keyof typeof dayLabels] ||
																ws.day}
														</span>
														<div className="flex gap-2 flex-wrap">
															{ws.timeRanges.map((tr, idx) => (
																<Badge
																	key={`${ws.day}-${idx}`}
																	variant="outline"
																	className="flex items-center gap-1"
																>
																	<Clock className="h-3 w-3" />
																	{tr.start} – {tr.end}
																</Badge>
															))}
															{ws.timeRanges.length === 0 && (
																<span className="text-muted-foreground italic">
																	{t("dashboard.appointments.settings.dayOff")}
																</span>
															)}
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Exceptions */}
										<div>
											<div className="flex items-center justify-between mb-2">
												<h4 className="text-sm font-medium">
													{t("dashboard.appointments.settings.exceptions")}
												</h4>
												<AddExceptionDialog
													scheduleId={schedule._id as Id<"agentSchedules">}
													onAdd={handleAddException}
													t={t}
												/>
											</div>
											{schedule.exceptions && schedule.exceptions.length > 0 ? (
												<div className="space-y-1">
													{schedule.exceptions.map((ex) => (
														<div
															key={ex.date}
															className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2"
														>
															<div className="flex items-center gap-2">
																<Badge
																	variant={
																		ex.available ? "default" : "destructive"
																	}
																	className="text-xs"
																>
																	{ex.available
																		? t(
																				"dashboard.appointments.settings.modified",
																			)
																		: t(
																				"dashboard.appointments.settings.dayOff",
																			)}
																</Badge>
																<span>{ex.date}</span>
																{ex.reason && (
																	<span className="text-muted-foreground">
																		— {ex.reason}
																	</span>
																)}
															</div>
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6"
																onClick={() =>
																	handleRemoveException(
																		schedule._id as Id<"agentSchedules">,
																		ex.date,
																	)
																}
															>
																<Trash2 className="h-3 w-3" />
															</Button>
														</div>
													))}
												</div>
											) : (
												<p className="text-sm text-muted-foreground italic">
													{t("dashboard.appointments.settings.noExceptions")}
												</p>
											)}
										</div>
									</CardContent>
								)}
							</Card>
						);
					})}
				</div>
			)}

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-primary">
								{schedules?.length ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("dashboard.appointments.settings.totalSchedules")}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-green-600">
								{schedules?.filter((s) => s.isActive).length ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("dashboard.appointments.settings.activeSchedules")}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-muted-foreground">
								{agents?.length ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("dashboard.appointments.settings.totalAgents")}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// ===== Small sub-component for adding exceptions =====
function AddExceptionDialog({
	scheduleId,
	onAdd,
	t,
}: {
	scheduleId: Id<"agentSchedules">;
	onAdd: (
		scheduleId: Id<"agentSchedules">,
		date: string,
		available: boolean,
		reason?: string,
	) => Promise<void>;
	t: (key: string) => string;
}) {
	const [open, setOpen] = useState(false);
	const [date, setDate] = useState("");
	const [reason, setReason] = useState("");

	const handleSubmit = async () => {
		if (!date) return;
		await onAdd(scheduleId, date, false, reason || undefined);
		setOpen(false);
		setDate("");
		setReason("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1">
					<Plus className="h-3 w-3" />
					{t("dashboard.appointments.settings.addException")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>
						{t("dashboard.appointments.settings.addException")}
					</DialogTitle>
					<DialogDescription>
						{t("dashboard.appointments.settings.addExceptionDesc")}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<Field>
						<FieldLabel>{t("dashboard.appointments.settings.date")}</FieldLabel>
						<Input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</Field>
					<Field>
						<FieldLabel>
							{t("dashboard.appointments.settings.reason")}
						</FieldLabel>
						<Input
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={t(
								"dashboard.appointments.settings.reasonPlaceholder",
							)}
						/>
					</Field>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleSubmit} disabled={!date}>
						{t("common.add")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
