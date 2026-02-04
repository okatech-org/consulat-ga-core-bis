"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArrowLeft,
	Calendar,
	Check,
	Clock,
	FileText,
	Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/my-space/appointments/new")({
	component: NewAppointmentPage,
});

function NewAppointmentPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [step, setStep] = useState<
		"select-request" | "select-slot" | "confirm"
	>("select-request");
	const [selectedRequestId, setSelectedRequestId] =
		useState<Id<"requests"> | null>(null);
	const [selectedSlotId, setSelectedSlotId] =
		useState<Id<"appointmentSlots"> | null>(null);
	const [isBooking, setIsBooking] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string>("");

	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});

	// Get user's requests that may need an appointment
	const { data: userRequests, isPending: requestsLoading } =
		useAuthenticatedConvexQuery(api.functions.requests.listMine, {});

	// Get user's existing appointments
	const { data: myAppointments } = useAuthenticatedConvexQuery(
		api.functions.slots.listMyAppointments,
		{},
	);

	// Get selected request details
	const selectedRequest = useMemo(() => {
		if (!selectedRequestId || !userRequests) return null;
		return userRequests.find((r) => r._id === selectedRequestId) || null;
	}, [selectedRequestId, userRequests]);

	// Get available slots for the selected request's org
	const { data: availableSlots } = useAuthenticatedConvexQuery(
		api.functions.slots.listAvailableSlots,
		selectedRequest
			? {
					orgId: selectedRequest.orgId,
					month: selectedMonth,
				}
			: "skip",
	);

	// Book appointment mutation
	const { mutateAsync: bookAppointment } = useConvexMutationQuery(
		api.functions.slots.bookAppointment,
	);

	// Get request IDs that already have an active (confirmed, upcoming) appointment
	const requestsWithActiveAppointment = useMemo(() => {
		if (!myAppointments) return new Set<string>();
		const today = new Date().toISOString().split("T")[0];
		return new Set(
			myAppointments
				.filter((apt) => apt.status === "confirmed" && apt.date >= today)
				.map((apt) => apt.requestId)
				.filter(Boolean) as string[],
		);
	}, [myAppointments]);

	// Filter requests that can have appointments
	const eligibleRequests = useMemo(() => {
		if (!userRequests) return [];
		return userRequests.filter((r) => {
			const isEligibleStatus = ["processing", "completed", "pending"].includes(
				r.status,
			);
			const needsAppointment =
				r.service?.requiresAppointment ||
				r.actionRequired?.type === "documents";
			// Exclude requests that already have an active appointment
			const hasActiveAppointment = requestsWithActiveAppointment.has(r._id);
			return isEligibleStatus && needsAppointment && !hasActiveAppointment;
		});
	}, [userRequests, requestsWithActiveAppointment]);

	// Group slots by date
	const slotsByDate = useMemo(() => {
		if (!availableSlots) return {};
		const map: Record<string, typeof availableSlots> = {};
		for (const slot of availableSlots) {
			if (!map[slot.date]) map[slot.date] = [];
			map[slot.date].push(slot);
		}
		for (const date in map) {
			map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
		}
		return map;
	}, [availableSlots]);

	const availableDates = useMemo(
		() => new Set(Object.keys(slotsByDate)),
		[slotsByDate],
	);

	// Calendar days
	const calendarDays = useMemo(() => {
		const [year, month] = selectedMonth.split("-").map(Number);
		const firstDay = new Date(year, month - 1, 1);
		const daysInMonth = new Date(year, month, 0).getDate();
		const startPad = firstDay.getDay();
		const today = new Date().toISOString().split("T")[0];

		const days: {
			date: string;
			day: number;
			isCurrentMonth: boolean;
			isPast: boolean;
			hasSlots: boolean;
		}[] = [];

		for (let i = 0; i < startPad; i++) {
			days.push({
				date: "",
				day: 0,
				isCurrentMonth: false,
				isPast: false,
				hasSlots: false,
			});
		}

		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			days.push({
				date: dateStr,
				day: d,
				isCurrentMonth: true,
				isPast: dateStr < today,
				hasSlots: availableDates.has(dateStr),
			});
		}

		return days;
	}, [selectedMonth, availableDates]);

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

	const handleSelectRequest = (requestId: Id<"requests">) => {
		setSelectedRequestId(requestId);
		setSelectedSlotId(null);
		setSelectedDate("");
		setStep("select-slot");
	};

	const handleSelectSlot = (slotId: Id<"appointmentSlots">) => {
		setSelectedSlotId(slotId);
		setStep("confirm");
	};

	const handleBook = async () => {
		if (!selectedSlotId || !selectedRequestId) return;

		setIsBooking(true);
		try {
			await bookAppointment({
				slotId: selectedSlotId,
				requestId: selectedRequestId,
			});
			toast.success(
				t("appointments.book.success", "Rendez-vous réservé avec succès !"),
			);
			navigate({ to: "/my-space/appointments" });
		} catch (error: unknown) {
			toast.error(
				error instanceof Error
					? error.message
					: "Erreur lors de la réservation",
			);
		} finally {
			setIsBooking(false);
		}
	};

	const selectedSlot = useMemo(() => {
		if (!selectedSlotId || !availableSlots) return null;
		return availableSlots.find((s) => s._id === selectedSlotId) || null;
	}, [selectedSlotId, availableSlots]);

	const getStatusBadge = (status: string) => {
		const colors: Record<string, string> = {
			pending:
				"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
			processing:
				"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
			completed:
				"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
		};
		const labels: Record<string, string> = {
			pending: "En attente",
			processing: "En cours",
			completed: "Prêt",
		};
		return (
			<Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
				{labels[status] || status}
			</Badge>
		);
	};

	if (requestsLoading) {
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 max-w-2xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						if (step === "confirm") setStep("select-slot");
						else if (step === "select-slot") setStep("select-request");
						else navigate({ to: "/my-space/appointments" });
					}}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold tracking-tight">
						{t("appointments.new.title", "Nouveau rendez-vous")}
					</h1>
					<p className="text-sm text-muted-foreground">
						{t(
							"appointments.new.subtitle",
							"Sélectionnez une demande puis choisissez un créneau",
						)}
					</p>
				</div>
			</div>

			{/* Progress Steps */}
			<div className="flex items-center gap-2 justify-center">
				{["select-request", "select-slot", "confirm"].map((s, idx) => (
					<div key={s} className="flex items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
								step === s
									? "bg-primary text-primary-foreground"
									: ["select-request", "select-slot", "confirm"].indexOf(step) >
											idx
										? "bg-primary/20 text-primary"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{["select-request", "select-slot", "confirm"].indexOf(step) >
							idx ? (
								<Check className="h-4 w-4" />
							) : (
								idx + 1
							)}
						</div>
						{idx < 2 && (
							<div
								className={`w-12 h-0.5 ${["select-request", "select-slot", "confirm"].indexOf(step) > idx ? "bg-primary/20" : "bg-muted"}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Step 1: Select Request */}
			{step === "select-request" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							{t("appointments.new.selectRequest", "Choisir une demande")}
						</CardTitle>
						<CardDescription>
							{t(
								"appointments.new.selectRequestDesc",
								"Sélectionnez la demande pour laquelle vous souhaitez prendre rendez-vous",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{eligibleRequests.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
								<p>
									{t(
										"appointments.new.noEligibleRequests",
										"Aucune demande nécessitant un rendez-vous",
									)}
								</p>
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => navigate({ to: "/services" })}
								>
									{t(
										"appointments.new.makeRequest",
										"Faire une nouvelle demande",
									)}
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								{eligibleRequests.map((request) => (
									<button
										key={request._id}
										onClick={() => handleSelectRequest(request._id)}
										className={`w-full p-4 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-muted/50 ${
											selectedRequestId === request._id
												? "border-primary bg-primary/5"
												: ""
										}`}
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">
													{request.service?.name?.fr || "Demande"}
												</p>
												<p className="text-sm text-muted-foreground">
													Réf: {request.reference}
												</p>
												{request.actionRequired && (
													<p className="text-xs text-amber-600 mt-1">
														⚠️ {request.actionRequired.message}
													</p>
												)}
											</div>
											<div className="flex flex-col items-end gap-1">
												{getStatusBadge(request.status)}
												<span className="text-xs text-muted-foreground">
													{request.submittedAt &&
														format(new Date(request.submittedAt), "dd/MM/yyyy")}
												</span>
											</div>
										</div>
									</button>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Step 2: Select Slot */}
			{step === "select-slot" && selectedRequest && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							{t("appointments.new.selectSlot", "Choisir un créneau")}
						</CardTitle>
						<CardDescription>
							Demande : {selectedRequest.service?.name?.fr} (
							{selectedRequest.reference})
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Button variant="outline" size="sm" onClick={handlePrevMonth}>
								←
							</Button>
							<span className="font-medium capitalize">
								{formatMonthYear()}
							</span>
							<Button variant="outline" size="sm" onClick={handleNextMonth}>
								→
							</Button>
						</div>

						<div className="grid grid-cols-7 gap-1 text-center text-sm">
							{["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
								<div
									key={day}
									className="py-2 font-medium text-muted-foreground text-xs"
								>
									{day}
								</div>
							))}
							{calendarDays.map((day, idx) => (
								<button
									key={day.date || `empty-${idx}`}
									type="button"
									disabled={!day.isCurrentMonth || day.isPast || !day.hasSlots}
									onClick={() => day.hasSlots && setSelectedDate(day.date)}
									className={`p-2 rounded-md text-sm transition-colors
                    ${!day.isCurrentMonth ? "text-transparent" : ""}
                    ${day.isPast ? "text-muted-foreground/30" : ""}
                    ${day.hasSlots && !day.isPast ? "bg-primary/10 text-primary hover:bg-primary/20 font-medium cursor-pointer" : "cursor-default"}
                    ${selectedDate === day.date ? "ring-2 ring-primary" : ""}
                  `}
								>
									{day.day || ""}
								</button>
							))}
						</div>

						{selectedDate && slotsByDate[selectedDate] && (
							<div className="pt-4 border-t">
								<p className="text-sm font-medium mb-3">
									Créneaux pour le{" "}
									{format(new Date(selectedDate), "d MMMM", { locale: fr })}
								</p>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{slotsByDate[selectedDate].map((slot) => (
										<button
											key={slot._id}
											type="button"
											onClick={() => handleSelectSlot(slot._id)}
											className={`p-3 rounded-lg border text-center transition-all ${
												selectedSlotId === slot._id
													? "border-primary bg-primary/10 ring-2 ring-primary"
													: "hover:border-primary/50 hover:bg-muted/50"
											}`}
										>
											<div className="flex items-center justify-center gap-1 font-medium text-sm">
												<Clock className="h-3.5 w-3.5" />
												{slot.startTime}
											</div>
											<Badge variant="outline" className="mt-1 text-xs">
												{slot.capacity - slot.bookedCount} place(s)
											</Badge>
										</button>
									))}
								</div>
							</div>
						)}

						{availableSlots?.length === 0 && (
							<p className="text-center text-muted-foreground py-4">
								Aucun créneau disponible ce mois
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Step 3: Confirm */}
			{step === "confirm" && selectedSlot && selectedRequest && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Check className="h-5 w-5" />
							{t("appointments.new.confirm", "Confirmer le rendez-vous")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-muted/50 p-4 rounded-lg space-y-3">
							<div className="flex items-center gap-3">
								<FileText className="h-5 w-5 text-primary" />
								<div>
									<p className="font-medium">
										{selectedRequest.service?.name?.fr}
									</p>
									<p className="text-sm text-muted-foreground">
										Réf: {selectedRequest.reference}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-primary" />
								<p className="font-medium">
									{format(new Date(selectedSlot.date), "EEEE d MMMM yyyy", {
										locale: fr,
									})}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5 text-primary" />
								<p className="font-medium">
									{selectedSlot.startTime} - {selectedSlot.endTime}
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setStep("select-slot")}
							>
								Retour
							</Button>
							<Button
								className="flex-1"
								onClick={handleBook}
								disabled={isBooking}
							>
								{isBooking ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Check className="mr-2 h-4 w-4" />
								)}
								Confirmer
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
