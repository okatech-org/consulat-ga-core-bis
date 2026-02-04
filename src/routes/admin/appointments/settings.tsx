import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/appointments/settings")({
	component: AppointmentSettings,
});

function AppointmentSettings() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// Form state for creating slots
	const [newSlotDate, setNewSlotDate] = useState("");
	const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
	const [newSlotEndTime, setNewSlotEndTime] = useState("10:00");
	const [newSlotCapacity, setNewSlotCapacity] = useState(1);
	const [isBulkCreate, setIsBulkCreate] = useState(false);
	const [bulkEndDate, setBulkEndDate] = useState("");
	const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri

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

	// Generate dates for bulk creation
	const generateBulkDates = (): string[] => {
		if (!newSlotDate || !bulkEndDate) return [];

		const dates: string[] = [];
		const start = new Date(newSlotDate);
		const end = new Date(bulkEndDate);

		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			if (selectedDays.includes(d.getDay())) {
				dates.push(d.toISOString().split("T")[0]);
			}
		}

		return dates;
	};

	const handleCreateSlot = async () => {
		if (!activeOrgId) return;

		try {
			if (isBulkCreate) {
				const dates = generateBulkDates();
				if (dates.length === 0) {
					toast.error("Aucune date sélectionnée");
					return;
				}
				await createSlotsBulk({
					orgId: activeOrgId,
					dates,
					startTime: newSlotStartTime,
					endTime: newSlotEndTime,
					capacity: newSlotCapacity,
				});
				toast.success(`${dates.length} créneaux créés`);
			} else {
				await createSlot({
					orgId: activeOrgId,
					date: newSlotDate,
					startTime: newSlotStartTime,
					endTime: newSlotEndTime,
					capacity: newSlotCapacity,
				});
				toast.success("Créneau créé");
			}
			setIsCreateDialogOpen(false);
			resetForm();
		} catch (error) {
			toast.error("Erreur lors de la création");
		}
	};

	const handleBlockSlot = async (slotId: Id<"appointmentSlots">) => {
		try {
			await blockSlot({ slotId, reason: "Bloqué manuellement" });
			toast.success("Créneau bloqué");
		} catch {
			toast.error("Erreur lors du blocage");
		}
	};

	const handleUnblockSlot = async (slotId: Id<"appointmentSlots">) => {
		try {
			await unblockSlot({ slotId });
			toast.success("Créneau débloqué");
		} catch {
			toast.error("Erreur lors du déblocage");
		}
	};

	const handleDeleteSlot = async (slotId: Id<"appointmentSlots">) => {
		try {
			await deleteSlot({ slotId });
			toast.success("Créneau supprimé");
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes("bookings")) {
				toast.error("Impossible de supprimer un créneau avec des réservations");
			} else {
				toast.error("Erreur lors de la suppression");
			}
		}
	};

	const resetForm = () => {
		setNewSlotDate("");
		setNewSlotStartTime("09:00");
		setNewSlotEndTime("10:00");
		setNewSlotCapacity(1);
		setIsBulkCreate(false);
		setBulkEndDate("");
		setSelectedDays([1, 2, 3, 4, 5]);
	};

	const toggleDay = (day: number) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Settings className="h-6 w-6" />
						{t(
							"dashboard.appointments.settings.title",
							"Configuration des créneaux",
						)}
					</h1>
					<p className="text-muted-foreground">
						{t(
							"dashboard.appointments.settings.description",
							"Gérez les créneaux de rendez-vous disponibles",
						)}
					</p>
				</div>

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							{t(
								"dashboard.appointments.settings.addSlot",
								"Ajouter un créneau",
							)}
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>
								{isBulkCreate
									? t(
											"dashboard.appointments.settings.createBulk",
											"Créer des créneaux récurrents",
										)
									: t(
											"dashboard.appointments.settings.createSlot",
											"Créer un créneau",
										)}
							</DialogTitle>
							<DialogDescription>
								{t(
									"dashboard.appointments.settings.createDescription",
									"Définissez les paramètres du créneau",
								)}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							{/* Toggle bulk mode */}
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="bulkMode"
									checked={isBulkCreate}
									onChange={(e) => setIsBulkCreate(e.target.checked)}
									className="h-4 w-4 rounded border-gray-300"
								/>
								<Label htmlFor="bulkMode">Créer des créneaux récurrents</Label>
							</div>

							{/* Date(s) */}
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label>{isBulkCreate ? "Date de début" : "Date"}</Label>
									<Input
										type="date"
										value={newSlotDate}
										onChange={(e) => setNewSlotDate(e.target.value)}
									/>
								</div>

								{isBulkCreate && (
									<>
										<div className="grid gap-2">
											<Label>Date de fin</Label>
											<Input
												type="date"
												value={bulkEndDate}
												onChange={(e) => setBulkEndDate(e.target.value)}
												min={newSlotDate}
											/>
										</div>

										<div className="grid gap-2">
											<Label>Jours de la semaine</Label>
											<div className="flex gap-1">
												{dayLabels.map((label, idx) => (
													<Button
														key={idx}
														type="button"
														variant={
															selectedDays.includes(idx) ? "default" : "outline"
														}
														size="sm"
														className="w-10"
														onClick={() => toggleDay(idx)}
													>
														{label}
													</Button>
												))}
											</div>
										</div>
									</>
								)}
							</div>

							{/* Time */}
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Heure de début</Label>
									<Input
										type="time"
										value={newSlotStartTime}
										onChange={(e) => setNewSlotStartTime(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Heure de fin</Label>
									<Input
										type="time"
										value={newSlotEndTime}
										onChange={(e) => setNewSlotEndTime(e.target.value)}
									/>
								</div>
							</div>

							{/* Capacity */}
							<div className="grid gap-2">
								<Label>Capacité (nombre de RDV)</Label>
								<Input
									type="number"
									min={1}
									value={newSlotCapacity}
									onChange={(e) =>
										setNewSlotCapacity(parseInt(e.target.value) || 1)
									}
								/>
							</div>

							{isBulkCreate && newSlotDate && bulkEndDate && (
								<p className="text-sm text-muted-foreground">
									{generateBulkDates().length} créneaux seront créés
								</p>
							)}
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Annuler
							</Button>
							<Button onClick={handleCreateSlot} disabled={!newSlotDate}>
								{isBulkCreate ? "Créer les créneaux" : "Créer le créneau"}
							</Button>
						</DialogFooter>
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
							{slots?.length ?? 0} créneaux configurés ce mois
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-7 gap-1 text-center text-sm">
						{["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
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
													setNewSlotDate(day.date);
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
													</span>
													<span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														{slot.isBlocked ? (
															<button
																onClick={() => handleUnblockSlot(slot._id)}
																title="Débloquer"
															>
																<Unlock className="h-3 w-3" />
															</button>
														) : (
															<button
																onClick={() => handleBlockSlot(slot._id)}
																title="Bloquer"
															>
																<Lock className="h-3 w-3" />
															</button>
														)}
														{slot.bookedCount === 0 && (
															<button
																onClick={() => handleDeleteSlot(slot._id)}
																title="Supprimer"
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
							<span>Disponible</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-amber-100 dark:bg-amber-900/30" />
							<span>Complet</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded bg-destructive/20" />
							<span>Bloqué</span>
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
								Créneaux disponibles
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
								Réservations ce mois
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
							<p className="text-sm text-muted-foreground">Créneaux bloqués</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
