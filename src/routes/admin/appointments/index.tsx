import { api } from "@convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
	Calendar,
	CalendarDays,
	Check,
	ChevronLeft,
	ChevronRight,
	Clock,
	Eye,
	Filter,
	List,
	Loader2,
	User,
	UserX,
	X,
	XCircle,
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/appointments/")({
	component: DashboardAppointments,
});

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
	string,
	{
		color: string;
		bg: string;
		dot: string;
		border: string;
		label: string;
		labelKey: string;
	}
> = {
	confirmed: {
		color: "text-emerald-400",
		bg: "bg-emerald-500/10",
		dot: "bg-emerald-500",
		border: "border-emerald-500/30",
		label: "Confirmé",
		labelKey: "dashboard.appointments.statuses.confirmed",
	},
	completed: {
		color: "text-blue-400",
		bg: "bg-blue-500/10",
		dot: "bg-blue-500",
		border: "border-blue-500/30",
		label: "Terminé",
		labelKey: "dashboard.appointments.statuses.completed",
	},
	cancelled: {
		color: "text-red-400",
		bg: "bg-red-500/10",
		dot: "bg-red-500",
		border: "border-red-500/30",
		label: "Annulé",
		labelKey: "dashboard.appointments.statuses.cancelled",
	},
	no_show: {
		color: "text-amber-400",
		bg: "bg-amber-500/10",
		dot: "bg-amber-500",
		border: "border-amber-500/30",
		label: "Absent",
		labelKey: "dashboard.appointments.statuses.no_show",
	},
	rescheduled: {
		color: "text-purple-400",
		bg: "bg-purple-500/10",
		dot: "bg-purple-500",
		border: "border-purple-500/30",
		label: "Reprogrammé",
		labelKey: "dashboard.appointments.statuses.rescheduled",
	},
};

const getStatusConfig = (status: string) =>
	STATUS_CONFIG[status] ?? {
		color: "text-muted-foreground",
		bg: "bg-muted/50",
		dot: "bg-muted-foreground",
		border: "border-border",
		label: status,
		labelKey: "",
	};

// ─── Main component ─────────────────────────────────────────────────────────

function DashboardAppointments() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [dateFilter, setDateFilter] = useState<string>("");
	const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
	const [selectedDay, setSelectedDay] = useState<string | null>(null);

	// Calendar month state
	const [calendarMonth, setCalendarMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});

	// ─── API queries ───────────────────────────────────────────────────────

	const queryArgs = activeOrgId
		? {
				orgId: activeOrgId,
				status: statusFilter !== "all" ? (statusFilter as any) : undefined,
				date: dateFilter || undefined,
				month: viewMode === "calendar" ? calendarMonth : undefined,
			}
		: "skip";

	const { data: appointments } = useAuthenticatedConvexQuery(
		api.functions.slots.listAppointmentsByOrg,
		queryArgs,
	);

	// ─── Mutations ─────────────────────────────────────────────────────────

	const { mutateAsync: cancelMutation } = useConvexMutationQuery(
		api.functions.slots.cancelAppointment,
	);
	const { mutateAsync: completeMutation } = useConvexMutationQuery(
		api.functions.slots.completeAppointment,
	);
	const { mutateAsync: noShowMutation } = useConvexMutationQuery(
		api.functions.slots.markNoShow,
	);

	const handleCancel = async (appointmentId: string) => {
		try {
			await cancelMutation({ appointmentId: appointmentId as any });
			toast.success(t("dashboard.appointments.success.cancelled"));
		} catch {
			toast.error(t("dashboard.appointments.error.cancel"));
		}
	};

	const handleComplete = async (appointmentId: string) => {
		try {
			await completeMutation({ appointmentId: appointmentId as any });
			toast.success(t("dashboard.appointments.success.completed"));
		} catch {
			toast.error(t("dashboard.appointments.error.complete"));
		}
	};

	const handleNoShow = async (appointmentId: string) => {
		try {
			await noShowMutation({ appointmentId: appointmentId as any });
			toast.success(t("dashboard.appointments.success.noShow"));
		} catch {
			toast.error(t("dashboard.appointments.error.noShow"));
		}
	};

	// ─── Calendar logic ────────────────────────────────────────────────────

	const calendarDays = useMemo(() => {
		const [year, month] = calendarMonth.split("-").map(Number);
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);
		const daysInMonth = lastDay.getDate();

		// Monday-start: getDay() returns 0=Sun, we want Mon=0
		const startPad = (firstDay.getDay() + 6) % 7;

		const days: {
			date: string;
			day: number;
			isCurrentMonth: boolean;
			isToday: boolean;
		}[] = [];

		// Previous month padding
		const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
		for (let i = startPad - 1; i >= 0; i--) {
			const d = prevMonthLastDay - i;
			const prevMonth = month === 1 ? 12 : month - 1;
			const prevYear = month === 1 ? year - 1 : year;
			const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			days.push({
				date: dateStr,
				day: d,
				isCurrentMonth: false,
				isToday: false,
			});
		}

		// Current month days
		const now = new Date();
		const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			days.push({
				date: dateStr,
				day: d,
				isCurrentMonth: true,
				isToday: dateStr === todayStr,
			});
		}

		// Next month padding (fill to complete 6 rows)
		const remainingSlots = 42 - days.length;
		for (let i = 1; i <= remainingSlots; i++) {
			const nextMonth = month === 12 ? 1 : month + 1;
			const nextYear = month === 12 ? year + 1 : year;
			const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
			days.push({
				date: dateStr,
				day: i,
				isCurrentMonth: false,
				isToday: false,
			});
		}

		return days;
	}, [calendarMonth]);

	const appointmentsByDate = useMemo(() => {
		if (!appointments) return {};
		const map: Record<string, typeof appointments> = {};
		for (const apt of appointments) {
			if (!map[apt.date]) map[apt.date] = [];
			map[apt.date].push(apt);
		}
		return map;
	}, [appointments]);

	// Stats
	const stats = useMemo(() => {
		if (!appointments)
			return { total: 0, confirmed: 0, completed: 0, cancelled: 0, noShow: 0 };
		return {
			total: appointments.length,
			confirmed: appointments.filter((a) => a.status === "confirmed").length,
			completed: appointments.filter((a) => a.status === "completed").length,
			cancelled: appointments.filter((a) => a.status === "cancelled").length,
			noShow: appointments.filter((a) => a.status === "no_show").length,
		};
	}, [appointments]);

	const selectedDayAppointments = useMemo(() => {
		if (!selectedDay || !appointmentsByDate[selectedDay]) return [];
		return appointmentsByDate[selectedDay].sort((a, b) =>
			a.time.localeCompare(b.time),
		);
	}, [selectedDay, appointmentsByDate]);

	// ─── Month navigation ──────────────────────────────────────────────────

	const handlePrevMonth = () => {
		const [year, month] = calendarMonth.split("-").map(Number);
		const prev =
			month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
		setCalendarMonth(
			`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`,
		);
		setSelectedDay(null);
	};

	const handleNextMonth = () => {
		const [year, month] = calendarMonth.split("-").map(Number);
		const next =
			month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);
		setCalendarMonth(
			`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
		);
		setSelectedDay(null);
	};

	const handleToday = () => {
		const now = new Date();
		setCalendarMonth(
			`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
		);
		const todayStr = now.toISOString().split("T")[0];
		setSelectedDay(todayStr);
	};

	const formatMonthYear = () => {
		const [year, month] = calendarMonth.split("-").map(Number);
		return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
			month: "long",
			year: "numeric",
		});
	};

	const formatSelectedDay = (dateStr: string) => {
		const d = new Date(dateStr + "T12:00:00");
		return d.toLocaleDateString("fr-FR", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// ─── Render ────────────────────────────────────────────────────────────

	return (
		<div className="flex min-h-full flex-col gap-4 p-4 md:p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.appointments.title")}
					</h1>
					<p className="text-muted-foreground text-sm">
						{t("dashboard.appointments.description")}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							navigate({ to: "/admin/appointments/agent-schedules" })
						}
					>
						<User className="mr-2 h-4 w-4" />
						{t("dashboard.appointments.agentSchedules", "Plannings agents")}
					</Button>
					<Tabs
						value={viewMode}
						onValueChange={(v) => setViewMode(v as "calendar" | "list")}
					>
						<TabsList className="h-9">
							<TabsTrigger value="calendar" className="gap-1.5 text-xs px-3">
								<CalendarDays className="h-3.5 w-3.5" />
								{t("dashboard.appointments.calendarView")}
							</TabsTrigger>
							<TabsTrigger value="list" className="gap-1.5 text-xs px-3">
								<List className="h-3.5 w-3.5" />
								{t("dashboard.appointments.listView")}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Stats bar */}
			{viewMode === "calendar" && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<StatsCard
						label={t("dashboard.appointments.stats.total", "Total")}
						value={stats.total}
						color="text-foreground"
						bgColor="bg-muted/50"
					/>
					<StatsCard
						label={t("dashboard.appointments.statuses.confirmed", "Confirmés")}
						value={stats.confirmed}
						color="text-emerald-400"
						bgColor="bg-emerald-500/5"
						dotColor="bg-emerald-500"
					/>
					<StatsCard
						label={t("dashboard.appointments.statuses.completed", "Terminés")}
						value={stats.completed}
						color="text-blue-400"
						bgColor="bg-blue-500/5"
						dotColor="bg-blue-500"
					/>
					<StatsCard
						label={t("dashboard.appointments.statuses.cancelled", "Annulés")}
						value={stats.cancelled + stats.noShow}
						color="text-red-400"
						bgColor="bg-red-500/5"
						dotColor="bg-red-500"
					/>
				</div>
			)}

			{/* Main content */}
			{viewMode === "calendar" ? (
				<div className="flex gap-4 flex-1 min-h-0">
					{/* Calendar grid */}
					<Card className="flex-1 flex flex-col">
						{/* Calendar header */}
						<CardHeader className="pb-2 border-b border-border/50">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={handlePrevMonth}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<h2 className="text-lg font-semibold min-w-[180px] text-center capitalize">
										{formatMonthYear()}
									</h2>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={handleNextMonth}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleToday}
									className="text-xs"
								>
									{t("dashboard.appointments.today", "Aujourd'hui")}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="flex-1 p-3">
							{/* Day headers (Mon-Sun) */}
							<div className="grid grid-cols-7 mb-1">
								{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
									(day) => (
										<div
											key={day}
											className="text-center text-xs font-medium text-muted-foreground py-2"
										>
											{day}
										</div>
									),
								)}
							</div>

							{/* Calendar grid */}
							<div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
								{calendarDays.map((day) => {
									const dayAppointments = appointmentsByDate[day.date] ?? [];
									const isSelected = selectedDay === day.date;
									const hasAppointments = dayAppointments.length > 0;

									return (
										<button
											type="button"
											key={day.date}
											onClick={() => {
												if (day.isCurrentMonth) {
													setSelectedDay(isSelected ? null : day.date);
												}
											}}
											className={cn(
												"relative min-h-[85px] p-1.5 text-left transition-all duration-150 bg-background",
												day.isCurrentMonth
													? "hover:bg-muted/60 cursor-pointer"
													: "opacity-30 cursor-default",
												isSelected &&
													"ring-2 ring-primary ring-inset bg-primary/5",
												day.isToday && !isSelected && "bg-primary/5",
											)}
										>
											{/* Day number */}
											<span
												className={cn(
													"inline-flex items-center justify-center text-xs font-medium rounded-md h-6 w-6",
													day.isToday
														? "bg-primary text-primary-foreground"
														: day.isCurrentMonth
															? "text-foreground"
															: "text-muted-foreground/50",
												)}
											>
												{day.day}
											</span>

											{/* Appointment dots */}
											{hasAppointments && day.isCurrentMonth && (
												<div className="mt-0.5 space-y-0.5">
													{dayAppointments.slice(0, 3).map((apt: any) => {
														const cfg = getStatusConfig(apt.status);
														return (
															<div
																key={apt._id}
																className={cn(
																	"flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight truncate",
																	cfg.bg,
																)}
															>
																<div
																	className={cn(
																		"w-1.5 h-1.5 rounded-full shrink-0",
																		cfg.dot,
																	)}
																/>
																<span className={cn("truncate", cfg.color)}>
																	{apt.time}
																</span>
															</div>
														);
													})}
													{dayAppointments.length > 3 && (
														<span className="text-[10px] text-muted-foreground pl-1">
															+{dayAppointments.length - 3}
														</span>
													)}
												</div>
											)}
										</button>
									);
								})}
							</div>

							{/* Legend */}
							<div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
								{Object.entries(STATUS_CONFIG)
									.slice(0, 4)
									.map(([key, cfg]) => (
										<div key={key} className="flex items-center gap-1.5">
											<div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
											<span className="text-[11px] text-muted-foreground">
												{t(cfg.labelKey, cfg.label)}
											</span>
										</div>
									))}
							</div>
						</CardContent>
					</Card>

					{/* Day detail panel */}
					<div
						className={cn(
							"transition-all duration-300 ease-in-out overflow-hidden",
							selectedDay ? "w-[340px] opacity-100" : "w-0 opacity-0",
						)}
					>
						{selectedDay && (
							<Card className="h-full flex flex-col w-[340px]">
								<CardHeader className="pb-3 border-b border-border/50">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-sm font-semibold capitalize">
												{formatSelectedDay(selectedDay)}
											</CardTitle>
											<CardDescription className="text-xs mt-0.5">
												{selectedDayAppointments.length}{" "}
												{t(
													"dashboard.appointments.appointmentsCount",
													"rendez-vous",
												)}
											</CardDescription>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={() => setSelectedDay(null)}
										>
											<X className="h-3.5 w-3.5" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="flex-1 overflow-y-auto p-3 space-y-2">
									{selectedDayAppointments.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-12 text-center">
											<Calendar className="h-8 w-8 text-muted-foreground/20 mb-3" />
											<p className="text-sm text-muted-foreground">
												{t(
													"dashboard.appointments.noAppointmentsToday",
													"Aucun rendez-vous ce jour",
												)}
											</p>
										</div>
									) : (
										selectedDayAppointments.map((apt: any) => (
											<AppointmentDetailCard
												key={apt._id}
												appointment={apt}
												t={t}
												navigate={navigate}
												onComplete={handleComplete}
												onCancel={handleCancel}
												onNoShow={handleNoShow}
											/>
										))
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			) : (
				/* ─── List view ──────────────────────────────────────────────── */
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<CardTitle className="text-base">
									{t("dashboard.appointments.listTitle")}
								</CardTitle>
								<CardDescription className="text-xs">
									{t("dashboard.appointments.listDescription")}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="date"
									value={dateFilter}
									onChange={(e) => setDateFilter(e.target.value)}
									className="w-[160px] h-9 text-xs"
								/>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-[160px] h-9 text-xs">
										<Filter className="mr-1.5 h-3.5 w-3.5" />
										<SelectValue
											placeholder={t("dashboard.appointments.filterByStatus")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											{t("dashboard.appointments.statuses.all")}
										</SelectItem>
										{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
											<SelectItem key={key} value={key}>
												<div className="flex items-center gap-2">
													<div
														className={cn("w-2 h-2 rounded-full", cfg.dot)}
													/>
													{t(cfg.labelKey, cfg.label)}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead className="text-xs">
										{t("dashboard.appointments.columns.dateTime")}
									</TableHead>
									<TableHead className="text-xs">
										{t("dashboard.appointments.columns.user")}
									</TableHead>
									<TableHead className="text-xs">
										{t("dashboard.appointments.columns.service")}
									</TableHead>
									<TableHead className="text-xs">
										{t("dashboard.appointments.columns.status")}
									</TableHead>
									<TableHead className="text-right text-xs">
										{t("dashboard.appointments.columns.action")}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{appointments === undefined ? (
									<TableRow>
										<TableCell colSpan={5} className="h-32 text-center">
											<Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
										</TableCell>
									</TableRow>
								) : appointments.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="h-32 text-center">
											<div className="flex flex-col items-center gap-2">
												<Calendar className="h-8 w-8 text-muted-foreground/20" />
												<span className="text-sm text-muted-foreground">
													{t("dashboard.appointments.noAppointments")}
												</span>
											</div>
										</TableCell>
									</TableRow>
								) : (
									appointments.map((appointment: any) => {
										const cfg = getStatusConfig(appointment.status);
										return (
											<TableRow
												key={appointment._id}
												className="cursor-pointer hover:bg-muted/40 transition-colors"
												onClick={() =>
													navigate({
														to: `/admin/appointments/${appointment._id}`,
													})
												}
											>
												<TableCell>
													<div className="flex items-center gap-2.5">
														<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
															<Calendar className="h-3.5 w-3.5 text-primary" />
														</div>
														<div className="flex flex-col">
															<span className="text-sm font-medium">
																{new Date(
																	appointment.date + "T12:00:00",
																).toLocaleDateString("fr-FR", {
																	day: "numeric",
																	month: "short",
																	year: "numeric",
																})}
															</span>
															<span className="text-xs text-muted-foreground flex items-center gap-1">
																<Clock className="h-3 w-3" />
																{appointment.time} -{" "}
																{appointment.endTime || "—"}
															</span>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2.5">
														<div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
															{appointment.user
																? `${appointment.user.firstName?.[0] ?? ""}${appointment.user.lastName?.[0] ?? ""}`
																: "?"}
														</div>
														<div className="flex flex-col">
															<span className="text-sm font-medium">
																{appointment.user
																	? `${appointment.user.firstName ?? ""} ${appointment.user.lastName ?? ""}`
																	: "—"}
															</span>
															<span className="text-xs text-muted-foreground">
																{appointment.user?.email}
															</span>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-sm">
														{appointment.slot?.serviceId
															? "Service consulaire"
															: "Général"}
													</span>
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className={cn(
															"text-[11px] font-medium",
															cfg.bg,
															cfg.color,
															cfg.border,
														)}
													>
														<div
															className={cn(
																"w-1.5 h-1.5 rounded-full mr-1.5",
																cfg.dot,
															)}
														/>
														{t(cfg.labelKey, cfg.label)}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<TooltipProvider delayDuration={0}>
														<div className="flex items-center justify-end gap-0.5">
															{appointment.status === "confirmed" && (
																<>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				size="icon"
																				variant="ghost"
																				className="h-7 w-7"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleComplete(appointment._id);
																				}}
																			>
																				<Check className="h-3.5 w-3.5 text-emerald-500" />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent side="bottom">
																			<p className="text-xs">
																				{t(
																					"dashboard.appointments.markComplete",
																					"Marquer terminé",
																				)}
																			</p>
																		</TooltipContent>
																	</Tooltip>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				size="icon"
																				variant="ghost"
																				className="h-7 w-7"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleNoShow(appointment._id);
																				}}
																			>
																				<UserX className="h-3.5 w-3.5 text-amber-500" />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent side="bottom">
																			<p className="text-xs">
																				{t(
																					"dashboard.appointments.markNoShow",
																					"Marquer absent",
																				)}
																			</p>
																		</TooltipContent>
																	</Tooltip>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				size="icon"
																				variant="ghost"
																				className="h-7 w-7"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleCancel(appointment._id);
																				}}
																			>
																				<XCircle className="h-3.5 w-3.5 text-red-500" />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent side="bottom">
																			<p className="text-xs">
																				{t("dashboard.appointments.cancel")}
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</>
															)}
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		size="icon"
																		variant="ghost"
																		className="h-7 w-7"
																		onClick={(e) => {
																			e.stopPropagation();
																			navigate({
																				to: `/admin/appointments/${appointment._id}`,
																			});
																		}}
																	>
																		<Eye className="h-3.5 w-3.5" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent side="bottom">
																	<p className="text-xs">
																		{t("dashboard.appointments.view", "Voir")}
																	</p>
																</TooltipContent>
															</Tooltip>
														</div>
													</TooltipProvider>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatsCard({
	label,
	value,
	color,
	bgColor,
	dotColor,
}: {
	label: string;
	value: number;
	color: string;
	bgColor: string;
	dotColor?: string;
}) {
	return (
		<div
			className={cn(
				"rounded-xl border border-border/50 px-4 py-3 flex items-center gap-3",
				bgColor,
			)}
		>
			{dotColor && <div className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />}
			<div>
				<p className={cn("text-2xl font-bold tabular-nums", color)}>{value}</p>
				<p className="text-[11px] text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}

function AppointmentDetailCard({
	appointment,
	t,
	navigate,
	onComplete,
	onCancel,
	onNoShow,
}: {
	appointment: any;
	t: any;
	navigate: any;
	onComplete: (id: string) => void;
	onCancel: (id: string) => void;
	onNoShow: (id: string) => void;
}) {
	const cfg = getStatusConfig(appointment.status);

	return (
		<div
			className={cn(
				"group rounded-lg border p-3 transition-all hover:shadow-sm cursor-pointer",
				cfg.border,
				"bg-card hover:bg-muted/30",
			)}
			onClick={() => navigate({ to: `/admin/appointments/${appointment._id}` })}
		>
			{/* Time + Status */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1.5 text-sm font-semibold">
						<Clock className="h-3.5 w-3.5 text-muted-foreground" />
						{appointment.time}
						{appointment.endTime && (
							<span className="text-muted-foreground font-normal">
								— {appointment.endTime}
							</span>
						)}
					</div>
				</div>
				<Badge
					variant="outline"
					className={cn(
						"text-[10px] h-5 font-medium",
						cfg.bg,
						cfg.color,
						cfg.border,
					)}
				>
					<div className={cn("w-1.5 h-1.5 rounded-full mr-1", cfg.dot)} />
					{t(cfg.labelKey, cfg.label)}
				</Badge>
			</div>

			{/* User */}
			<div className="flex items-center gap-2 mb-2">
				<div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
					{appointment.user
						? `${appointment.user.firstName?.[0] ?? ""}${appointment.user.lastName?.[0] ?? ""}`
						: "?"}
				</div>
				<div className="min-w-0">
					<p className="text-sm font-medium truncate">
						{appointment.user
							? `${appointment.user.firstName ?? ""} ${appointment.user.lastName ?? ""}`
							: "—"}
					</p>
					{appointment.user?.email && (
						<p className="text-[11px] text-muted-foreground truncate">
							{appointment.user.email}
						</p>
					)}
				</div>
			</div>

			{/* Actions */}
			{appointment.status === "confirmed" && (
				<div className="flex items-center gap-1 pt-2 border-t border-border/50">
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="sm"
									variant="ghost"
									className="h-7 text-xs gap-1 flex-1"
									onClick={(e) => {
										e.stopPropagation();
										onComplete(appointment._id);
									}}
								>
									<Check className="h-3 w-3 text-emerald-500" />
									{t("dashboard.appointments.complete", "Terminé")}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">
									{t("dashboard.appointments.markComplete", "Marquer terminé")}
								</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="sm"
									variant="ghost"
									className="h-7 text-xs gap-1 flex-1"
									onClick={(e) => {
										e.stopPropagation();
										onNoShow(appointment._id);
									}}
								>
									<UserX className="h-3 w-3 text-amber-500" />
									{t("dashboard.appointments.absent", "Absent")}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">
									{t("dashboard.appointments.markNoShow", "Marquer absent")}
								</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7"
									onClick={(e) => {
										e.stopPropagation();
										onCancel(appointment._id);
									}}
								>
									<XCircle className="h-3.5 w-3.5 text-red-500" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">
									{t("dashboard.appointments.cancel", "Annuler")}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			)}
		</div>
	);
}
