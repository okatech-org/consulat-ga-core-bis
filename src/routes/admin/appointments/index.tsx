import { api } from "@convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Calendar, Clock, Eye, Filter, List, Settings2, X } from "lucide-react";
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
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/appointments/")({
	component: DashboardAppointments,
});

function DashboardAppointments() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [dateFilter, setDateFilter] = useState<string>("");
	const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
	const [calendarMonth, setCalendarMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});

	const queryArgs = activeOrgId
		? {
				orgId: activeOrgId,
				status: statusFilter !== "all" ? (statusFilter as any) : undefined,
				date: dateFilter || undefined,
			}
		: "skip";

	const { data: appointments } = useAuthenticatedConvexQuery(
		api.functions.slots.listAppointmentsByOrg,
		queryArgs,
	);
	// Use slots API mutations for the new appointment system
	const { mutateAsync: cancelMutation } = useConvexMutationQuery(
		api.functions.slots.cancelAppointment,
	);
	const { mutateAsync: completeMutation } = useConvexMutationQuery(
		api.functions.slots.completeAppointment,
	);
	const { mutateAsync: noShowMutation } = useConvexMutationQuery(
		api.functions.slots.markNoShow,
	);

	// Note: Appointments are auto-confirmed when booked via slots system

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

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "confirmed":
				return "default";
			case "scheduled":
				return "secondary";
			case "completed":
				return "default";
			case "cancelled":
				return "destructive";
			case "no_show":
				return "destructive";
			default:
				return "outline";
		}
	};

	const calendarDays = useMemo(() => {
		const [year, month] = calendarMonth.split("-").map(Number);
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);
		const daysInMonth = lastDay.getDate();
		const startPad = firstDay.getDay();

		const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

		for (let i = 0; i < startPad; i++) {
			days.push({ date: "", day: 0, isCurrentMonth: false });
		}

		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			days.push({ date: dateStr, day: d, isCurrentMonth: true });
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

	const handlePrevMonth = () => {
		const [year, month] = calendarMonth.split("-").map(Number);
		const prev =
			month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
		setCalendarMonth(
			`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`,
		);
	};

	const handleNextMonth = () => {
		const [year, month] = calendarMonth.split("-").map(Number);
		const next =
			month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);
		setCalendarMonth(
			`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
		);
	};

	const formatMonthYear = () => {
		const [year, month] = calendarMonth.split("-").map(Number);
		return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
			month: "long",
			year: "numeric",
		});
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.appointments.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.appointments.description")}
					</p>
				</div>
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/admin/appointments/settings" })}
					>
						<Settings2 className="mr-2 h-4 w-4" />
						{t("dashboard.appointments.manageSlots", "Gérer les créneaux")}
					</Button>
					<Tabs
						value={viewMode}
						onValueChange={(v) => setViewMode(v as "list" | "calendar")}
					>
						<TabsList>
							<TabsTrigger value="list" className="gap-2">
								<List className="h-4 w-4" />
								{t("dashboard.appointments.listView")}
							</TabsTrigger>
							<TabsTrigger value="calendar" className="gap-2">
								<Calendar className="h-4 w-4" />
								{t("dashboard.appointments.calendarView")}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{viewMode === "list" ? (
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<CardTitle>{t("dashboard.appointments.listTitle")}</CardTitle>
								<CardDescription>
									{t("dashboard.appointments.listDescription")}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="date"
									value={dateFilter}
									onChange={(e) => setDateFilter(e.target.value)}
									className="w-[180px]"
								/>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-[180px]">
										<Filter className="mr-2 h-4 w-4" />
										<SelectValue
											placeholder={t("dashboard.appointments.filterByStatus")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											{t("dashboard.appointments.statuses.all")}
										</SelectItem>
										<SelectItem value="scheduled">
											{t("dashboard.appointments.statuses.scheduled")}
										</SelectItem>
										<SelectItem value="confirmed">
											{t("dashboard.appointments.statuses.confirmed")}
										</SelectItem>
										<SelectItem value="completed">
											{t("dashboard.appointments.statuses.completed")}
										</SelectItem>
										<SelectItem value="cancelled">
											{t("dashboard.appointments.statuses.cancelled")}
										</SelectItem>
										<SelectItem value="no_show">
											{t("dashboard.appointments.statuses.no_show")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										{t("dashboard.appointments.columns.dateTime")}
									</TableHead>
									<TableHead>
										{t("dashboard.appointments.columns.user")}
									</TableHead>
									<TableHead>
										{t("dashboard.appointments.columns.service")}
									</TableHead>
									<TableHead>
										{t("dashboard.appointments.columns.status")}
									</TableHead>
									<TableHead className="text-right">
										{t("dashboard.appointments.columns.action")}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{appointments === undefined ? (
									<TableRow>
										<TableCell colSpan={5} className="h-24 text-center">
											{t("dashboard.appointments.loading")}
										</TableCell>
									</TableRow>
								) : appointments.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={5}
											className="h-24 text-center text-muted-foreground"
										>
											{t("dashboard.appointments.noAppointments")}
										</TableCell>
									</TableRow>
								) : (
									appointments.map((appointment: any) => (
										<TableRow
											key={appointment._id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() =>
												navigate({
													to: `/admin/appointments/${appointment._id}`,
												})
											}
										>
											<TableCell>
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-muted-foreground" />
													<div className="flex flex-col">
														<span className="font-medium">
															{appointment.date}
														</span>
														<span className="text-xs text-muted-foreground">
															{appointment.startTime} - {appointment.endTime}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">
														{appointment.user
															? `${appointment.user.firstName} ${appointment.user.lastName}`
															: "-"}
													</span>
													<span className="text-xs text-muted-foreground">
														{appointment.user?.email}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{(appointment.service as any)?.name || "-"}
											</TableCell>
											<TableCell>
												<Badge
													variant={getStatusBadgeVariant(appointment.status)}
												>
													{t(
														`dashboard.appointments.statuses.${appointment.status}`,
													)}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													{(appointment.status === "scheduled" ||
														appointment.status === "confirmed") && (
														<>
															<Button
																size="sm"
																variant="ghost"
																onClick={() => handleComplete(appointment._id)}
															>
																<Clock className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() => handleNoShow(appointment._id)}
															>
																<X className="h-4 w-4" />
															</Button>
														</>
													)}
													{appointment.status === "scheduled" && (
														<Button
															size="sm"
															variant="ghost"
															className="text-destructive"
															onClick={() => handleCancel(appointment._id)}
														>
															{t("dashboard.appointments.cancel")}
														</Button>
													)}
													<Button
														size="sm"
														variant="ghost"
														onClick={() =>
															navigate({
																to: `/admin/appointments/${appointment._id}`,
															})
														}
													>
														<Eye className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<Button variant="outline" size="sm" onClick={handlePrevMonth}>
									←
								</Button>
								<CardTitle className="min-w-[200px] text-center">
									{formatMonthYear()}
								</CardTitle>
								<Button variant="outline" size="sm" onClick={handleNextMonth}>
									→
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-7 gap-1 text-center text-sm">
							{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
								<div
									key={day}
									className="py-2 font-medium text-muted-foreground"
								>
									{day}
								</div>
							))}
							{calendarDays.map((day) => (
								<div
									key={day.date}
									className={`min-h-[80px] rounded-md border p-1 ${day.isCurrentMonth ? "bg-background" : "bg-muted/30"}`}
								>
									{day.isCurrentMonth && (
										<>
											<div className="text-xs font-medium">{day.day}</div>
											<div className="mt-1 space-y-0.5">
												{appointmentsByDate[day.date]
													?.slice(0, 3)
													.map((apt: any) => (
														<button
															type="button"
															key={apt._id}
															onClick={() =>
																navigate({
																	to: `/admin/appointments/${apt._id}`,
																})
															}
															className={`cursor-pointer truncate rounded px-1 text-xs ${apt.status === "confirmed" ? "bg-primary/20 text-primary" : apt.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-secondary text-secondary-foreground"}`}
														>
															{apt.startTime}
														</button>
													))}
												{(appointmentsByDate[day.date]?.length || 0) > 3 && (
													<div className="text-xs text-muted-foreground">
														+{appointmentsByDate[day.date].length - 3}
													</div>
												)}
											</div>
										</>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
