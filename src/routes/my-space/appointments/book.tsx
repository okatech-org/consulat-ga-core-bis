import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArrowLeft,
	Calendar,
	Check,
	Clock,
	Loader2,
	MapPin,
} from "lucide-react";
import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/my-space/appointments/book")({
	component: BookAppointmentPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			orgId: search.orgId as string | undefined,
			serviceId: search.serviceId as string | undefined,
			requestId: search.requestId as string | undefined,
		};
	},
});

function BookAppointmentPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { orgId, serviceId, requestId } = Route.useSearch();

	const [selectedDate, setSelectedDate] = useState<string>("");
	const [selectedSlotId, setSelectedSlotId] =
		useState<Id<"appointmentSlots"> | null>(null);
	const [notes, setNotes] = useState("");
	const [isBooking, setIsBooking] = useState(false);
	const [step, setStep] = useState<"date" | "slot" | "confirm">("date");

	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});

	// Get org info
	const org = useQuery(
		api.functions.orgs.getById,
		orgId ? { orgId: orgId as Id<"orgs"> } : "skip",
	);

	// Get available slots
	const { data: availableSlots } = useAuthenticatedConvexQuery(
		api.functions.slots.listAvailableSlots,
		orgId
			? {
					orgId: orgId as Id<"orgs">,
					serviceId: serviceId as Id<"services"> | undefined,
					month: selectedMonth,
				}
			: "skip",
	);

	// Mutations
	const bookAppointment = useMutation(api.functions.slots.bookAppointment);

	// Group slots by date
	const slotsByDate = useMemo(() => {
		if (!availableSlots) return {};
		const map: Record<string, typeof availableSlots> = {};
		for (const slot of availableSlots) {
			if (!map[slot.date]) map[slot.date] = [];
			map[slot.date].push(slot);
		}
		// Sort by time
		for (const date in map) {
			map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
		}
		return map;
	}, [availableSlots]);

	// Available dates for the calendar
	const availableDates = useMemo(() => {
		return new Set(Object.keys(slotsByDate));
	}, [slotsByDate]);

	// Calendar days for the selected month
	const calendarDays = useMemo(() => {
		const [year, month] = selectedMonth.split("-").map(Number);
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);
		const daysInMonth = lastDay.getDate();
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

	const handleSelectDate = (date: string) => {
		setSelectedDate(date);
		setSelectedSlotId(null);
		setStep("slot");
	};

	const handleSelectSlot = (slotId: Id<"appointmentSlots">) => {
		setSelectedSlotId(slotId);
		setStep("confirm");
	};

	const handleBook = async () => {
		if (!selectedSlotId) return;

		setIsBooking(true);
		try {
			await bookAppointment({
				slotId: selectedSlotId,
				requestId: requestId as Id<"requests"> | undefined,
				notes: notes || undefined,
			});
			toast.success(
				t("appointments.book.success", "Rendez-vous réservé avec succès !"),
			);
			navigate({ to: "/my-space/appointments" });
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error(
					t("appointments.book.error", "Erreur lors de la réservation"),
				);
			}
		} finally {
			setIsBooking(false);
		}
	};

	const selectedSlot = useMemo(() => {
		if (!selectedSlotId || !availableSlots) return null;
		return availableSlots.find((s) => s._id === selectedSlotId) || null;
	}, [selectedSlotId, availableSlots]);

	if (!orgId) {
		return (
			<div className="flex flex-col items-center justify-center p-8 space-y-4">
				<Calendar className="h-16 w-16 text-muted-foreground opacity-30" />
				<p className="text-muted-foreground text-center">
					{t(
						"appointments.book.noOrg",
						"Veuillez sélectionner un organisme pour prendre rendez-vous.",
					)}
				</p>
				<Button onClick={() => navigate({ to: "/orgs" })}>
					{t("appointments.book.selectOrg", "Voir les organismes")}
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-1 max-w-4xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						if (step === "confirm") setStep("slot");
						else if (step === "slot") setStep("date");
						else navigate({ to: "/my-space/appointments" });
					}}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold tracking-tight">
						{t("appointments.book.title", "Prendre rendez-vous")}
					</h1>
					{org && (
						<p className="text-muted-foreground flex items-center gap-1">
							<MapPin className="h-4 w-4" />
							{org.name}
						</p>
					)}
				</div>
			</div>

			{/* Progress Steps */}
			<div className="flex items-center gap-2 justify-center">
				{["date", "slot", "confirm"].map((s, idx) => (
					<div key={s} className="flex items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
								step === s
									? "bg-primary text-primary-foreground"
									: ["date", "slot", "confirm"].indexOf(step) > idx
										? "bg-primary/20 text-primary"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{["date", "slot", "confirm"].indexOf(step) > idx ? (
								<Check className="h-4 w-4" />
							) : (
								idx + 1
							)}
						</div>
						{idx < 2 && (
							<div
								className={`w-12 h-0.5 ${
									["date", "slot", "confirm"].indexOf(step) > idx
										? "bg-primary/20"
										: "bg-muted"
								}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Step 1: Date Selection */}
			{step === "date" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							{t("appointments.book.selectDate", "Choisir une date")}
						</CardTitle>
						<CardDescription>
							{t(
								"appointments.book.selectDateDesc",
								"Sélectionnez une date avec des créneaux disponibles",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Calendar Navigation */}
						<div className="flex items-center justify-between mb-4">
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

						{/* Calendar Grid */}
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
									key={idx}
									disabled={!day.isCurrentMonth || day.isPast || !day.hasSlots}
									onClick={() => day.hasSlots && handleSelectDate(day.date)}
									className={`
                    p-2 rounded-md text-sm transition-colors
                    ${!day.isCurrentMonth ? "text-transparent" : ""}
                    ${day.isPast ? "text-muted-foreground/30" : ""}
                    ${
											day.hasSlots && !day.isPast
												? "bg-primary/10 text-primary hover:bg-primary/20 font-medium cursor-pointer"
												: "cursor-default"
										}
                    ${selectedDate === day.date ? "ring-2 ring-primary" : ""}
                  `}
								>
									{day.day || ""}
								</button>
							))}
						</div>

						{/* Legend */}
						<div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground justify-center">
							<div className="flex items-center gap-1">
								<div className="h-3 w-3 rounded bg-primary/10" />
								<span>Disponible</span>
							</div>
						</div>

						{availableSlots?.length === 0 && (
							<p className="text-center text-muted-foreground mt-6">
								{t(
									"appointments.book.noSlots",
									"Aucun créneau disponible ce mois-ci",
								)}
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Step 2: Time Slot Selection */}
			{step === "slot" && selectedDate && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							{t("appointments.book.selectTime", "Choisir un créneau")}
						</CardTitle>
						<CardDescription>
							{format(new Date(selectedDate), "EEEE d MMMM yyyy", {
								locale: fr,
							})}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{slotsByDate[selectedDate]?.map((slot) => (
								<button
									key={slot._id}
									onClick={() => handleSelectSlot(slot._id)}
									className={`
                    p-4 rounded-lg border text-center transition-all
                    ${
											selectedSlotId === slot._id
												? "border-primary bg-primary/10 ring-2 ring-primary"
												: "hover:border-primary/50 hover:bg-muted/50"
										}
                  `}
								>
									<div className="flex items-center justify-center gap-2 font-medium">
										<Clock className="h-4 w-4" />
										{slot.startTime}
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										jusqu'à {slot.endTime}
									</div>
									<Badge variant="outline" className="mt-2 text-xs">
										{slot.capacity - slot.bookedCount} place(s)
									</Badge>
								</button>
							))}
						</div>

						{(!slotsByDate[selectedDate] ||
							slotsByDate[selectedDate].length === 0) && (
							<p className="text-center text-muted-foreground py-8">
								{t(
									"appointments.book.noSlotsDate",
									"Aucun créneau disponible pour cette date",
								)}
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Step 3: Confirmation */}
			{step === "confirm" && selectedSlot && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Check className="h-5 w-5" />
							{t("appointments.book.confirm", "Confirmer le rendez-vous")}
						</CardTitle>
						<CardDescription>
							{t(
								"appointments.book.confirmDesc",
								"Vérifiez les détails et confirmez votre réservation",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Summary */}
						<div className="bg-muted/50 p-4 rounded-lg space-y-3">
							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-primary" />
								<div>
									<p className="font-medium">
										{format(new Date(selectedSlot.date), "EEEE d MMMM yyyy", {
											locale: fr,
										})}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5 text-primary" />
								<div>
									<p className="font-medium">
										{selectedSlot.startTime} - {selectedSlot.endTime}
									</p>
								</div>
							</div>
							{org && (
								<div className="flex items-center gap-3">
									<MapPin className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium">{org.name}</p>
										{org.address && (
											<p className="text-sm text-muted-foreground">
												{org.address.street}, {org.address.city}
											</p>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label>{t("appointments.book.notes", "Notes (optionnel)")}</Label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder={t(
									"appointments.book.notesPlaceholder",
									"Ajoutez des informations supplémentaires...",
								)}
								rows={3}
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setStep("slot")}
							>
								{t("common.back", "Retour")}
							</Button>
							<Button
								className="flex-1"
								onClick={handleBook}
								disabled={isBooking}
							>
								{isBooking ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t("common.loading", "Chargement...")}
									</>
								) : (
									<>
										<Check className="mr-2 h-4 w-4" />
										{t("appointments.book.bookNow", "Confirmer le rendez-vous")}
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
