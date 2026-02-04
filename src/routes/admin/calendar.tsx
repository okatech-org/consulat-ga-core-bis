import { api } from "@convex/_generated/api";
import type { EventClickArg } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Calendar,
	Clock,
	FileText,
	Mail,
	MapPin,
	Phone,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrg } from "@/components/org/org-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/calendar")({
	component: CalendarPage,
});

interface AppointmentEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	extendedProps: {
		requestId: string;
		requestRef: string;
		serviceName: string;
		userName: string;
		userEmail?: string;
		userPhone?: string;
		status: string;
	};
}

function CalendarPage() {
	const { t, i18n } = useTranslation();
	const { activeOrg } = useOrg();
	const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
		null,
	);
	const [dialogOpen, setDialogOpen] = useState(false);

	// Fetch requests with appointments for this org
	const { data: requests } = useAuthenticatedConvexQuery(
		api.functions.requests.listByOrg,
		activeOrg?._id ? { orgId: activeOrg._id } : "skip",
	);

	// Transform requests into calendar events
	const events = useMemo(() => {
		if (!requests) return [];

		return requests
			.filter((req) => req.appointmentDate)
			.map((req): AppointmentEvent => {
				const startDate = new Date(req.appointmentDate!);
				const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min default

				const serviceName =
					typeof req.service?.name === "object"
						? req.service.name.fr || req.service.name.en
						: req.service?.name || "Service";

				return {
					id: req._id,
					title: `${req.user?.name || "Client"} - ${serviceName}`,
					start: startDate,
					end: endDate,
					extendedProps: {
						requestId: req._id,
						requestRef: req.reference,
						serviceName,
						userName: req.user?.name || "Client",
						userEmail: req.user?.email,
						userPhone: req.user?.phone,
						status: req.status,
					},
				};
			});
	}, [requests]);

	const handleEventClick = (clickInfo: EventClickArg) => {
		const event = clickInfo.event;
		setSelectedEvent({
			id: event.id,
			title: event.title,
			start: event.start!,
			end: event.end!,
			extendedProps: event.extendedProps as AppointmentEvent["extendedProps"],
		});
		setDialogOpen(true);
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			pending: "#f59e0b",
			processing: "#3b82f6",
			completed: "#22c55e",
			cancelled: "#ef4444",
		};
		return colors[status] || "#6b7280";
	};

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			pending: t("status.pending", "En attente"),
			processing: t("status.processing", "En traitement"),
			completed: t("status.completed", "Terminé"),
			cancelled: t("status.cancelled", "Annulé"),
		};
		return labels[status] || status;
	};

	if (!activeOrg) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">
					{t("common.selectOrg", "Sélectionnez une organisation")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Calendar className="h-6 w-6" />
						{t("calendar.title", "Calendrier des rendez-vous")}
					</h1>
					<p className="text-muted-foreground">
						{t(
							"calendar.subtitle",
							"Vue d'ensemble de tous les rendez-vous programmés",
						)}
					</p>
				</div>
				<Badge variant="outline" className="text-sm">
					{events.length} {t("calendar.appointments", "rendez-vous")}
				</Badge>
			</div>

			{/* Calendar */}
			<Card>
				<CardContent className="pt-6">
					<FullCalendar
						plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
						initialView="dayGridMonth"
						headerToolbar={{
							left: "prev,next today",
							center: "title",
							right: "dayGridMonth,timeGridWeek,timeGridDay",
						}}
						locale={i18n.language === "fr" ? frLocale : undefined}
						events={events.map((event) => ({
							...event,
							backgroundColor: getStatusColor(event.extendedProps.status),
							borderColor: getStatusColor(event.extendedProps.status),
						}))}
						eventClick={handleEventClick}
						eventTimeFormat={{
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						}}
						slotMinTime="08:00:00"
						slotMaxTime="18:00:00"
						weekends={false}
						height="auto"
						dayMaxEvents={3}
						nowIndicator
					/>
				</CardContent>
			</Card>

			{/* Legend */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">
						{t("calendar.legend", "Légende")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						{Object.entries({
							pending: t("status.pending", "En attente"),
							processing: t("status.processing", "En traitement"),
							completed: t("status.completed", "Terminé"),
							cancelled: t("status.cancelled", "Annulé"),
						}).map(([key, label]) => (
							<div key={key} className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: getStatusColor(key) }}
								/>
								<span className="text-sm">{label}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Event Detail Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							{t("calendar.appointmentDetails", "Détails du rendez-vous")}
						</DialogTitle>
						<DialogDescription>
							{selectedEvent?.extendedProps.requestRef}
						</DialogDescription>
					</DialogHeader>

					{selectedEvent && (
						<div className="space-y-4">
							{/* Date & Time */}
							<div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
								<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">
										{t("calendar.dateTime", "Date et heure")}
									</p>
									<p className="font-medium">
										{selectedEvent.start.toLocaleDateString(
											i18n.language === "fr" ? "fr-FR" : "en-US",
											{
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											},
										)}
									</p>
									<p className="text-sm text-muted-foreground">
										{selectedEvent.start.toLocaleTimeString(
											i18n.language === "fr" ? "fr-FR" : "en-US",
											{
												hour: "2-digit",
												minute: "2-digit",
											},
										)}
									</p>
								</div>
							</div>

							{/* Service */}
							<div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
								<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">
										{t("calendar.service", "Service")}
									</p>
									<p className="font-medium">
										{selectedEvent.extendedProps.serviceName}
									</p>
								</div>
							</div>

							{/* Client */}
							<div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
								<User className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">
										{t("calendar.client", "Client")}
									</p>
									<p className="font-medium">
										{selectedEvent.extendedProps.userName}
									</p>
									{selectedEvent.extendedProps.userEmail && (
										<p className="text-sm text-muted-foreground flex items-center gap-1">
											<Mail className="h-3 w-3" />
											{selectedEvent.extendedProps.userEmail}
										</p>
									)}
									{selectedEvent.extendedProps.userPhone && (
										<p className="text-sm text-muted-foreground flex items-center gap-1">
											<Phone className="h-3 w-3" />
											{selectedEvent.extendedProps.userPhone}
										</p>
									)}
								</div>
							</div>

							{/* Status */}
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									{t("calendar.status", "Statut")}:
								</span>
								<Badge
									style={{
										backgroundColor: getStatusColor(
											selectedEvent.extendedProps.status,
										),
									}}
								>
									{getStatusLabel(selectedEvent.extendedProps.status)}
								</Badge>
							</div>

							{/* Action */}
							<div className="pt-2">
								<Link
									to="/admin/requests/$requestId"
									params={{ requestId: selectedEvent.extendedProps.requestId }}
								>
									<Button className="w-full">
										{t("calendar.viewRequest", "Voir la demande")}
									</Button>
								</Link>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
