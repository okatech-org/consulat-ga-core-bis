"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ArrowLeft, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	AppointmentSlotPicker,
	type DynamicSlotSelection,
} from "@/components/appointments/AppointmentSlotPicker";
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

export const Route = createFileRoute(
	"/my-space/requests/$requestId_/appointment",
)({
	component: AppointmentBookingPage,
});

function AppointmentBookingPage() {
	const { requestId } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [selectedSlot, setSelectedSlot] = useState<DynamicSlotSelection | null>(
		null,
	);
	const [isBooking, setIsBooking] = useState(false);

	// Fetch request details
	const { data: request } = useAuthenticatedConvexQuery(
		api.functions.requests.getById,
		{
			requestId: requestId as Id<"requests">,
		},
	);

	const { mutateAsync: bookDynamicAppointment } = useConvexMutationQuery(
		api.functions.slots.bookDynamicAppointment,
	);

	const handleBookAppointment = async () => {
		if (!selectedSlot || !request) {
			toast.error(
				t("appointment.select_slot", "Veuillez sélectionner un créneau"),
			);
			return;
		}

		setIsBooking(true);
		try {
			await bookDynamicAppointment({
				orgId: request.orgId,
				orgServiceId: request.orgServiceId,
				date: selectedSlot.date,
				startTime: selectedSlot.startTime,
				appointmentType: "deposit",
				requestId: requestId as Id<"requests">,
			});

			toast.success(
				t("appointment.booked_success", "Rendez-vous réservé avec succès"),
				{
					description: t(
						"appointment.booked_description",
						"Vous recevrez une confirmation par email.",
					),
				},
			);

			navigate({ to: `/my-space/requests/${requestId}` });
		} catch (error) {
			console.error("Failed to book appointment:", error);
			toast.error(t("error.generic", "Erreur"), {
				description: t(
					"appointment.booking_failed",
					"Impossible de réserver le rendez-vous.",
				),
			});
		} finally {
			setIsBooking(false);
		}
	};

	const handleSkip = () => {
		toast.info(
			t("appointment.skipped", "Vous pourrez prendre rendez-vous plus tard"),
		);
		navigate({ to: "/my-space/requests" });
	};

	// Loading state
	if (request === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Not Found
	if (request === null) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">
					{t("request.not_found", "Demande introuvable")}
				</h2>
				<Button onClick={() => navigate({ to: "/my-space/requests" })}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("common.back", "Retour")}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-muted/30 to-background">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
				<div className="container flex items-center gap-4 h-14 px-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate({ to: `/my-space/requests/${requestId}` })}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						<h1 className="font-semibold">
							{t("appointment.title", "Prendre rendez-vous")}
						</h1>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 container py-8 px-4 max-w-2xl mx-auto space-y-6">
				{/* Success Banner */}
				<Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
					<CardContent className="flex items-center gap-4 py-4">
						<CheckCircle className="h-8 w-8 text-green-600" />
						<div>
							<p className="font-medium text-green-800 dark:text-green-200">
								{t("request.submitted_success", "Demande soumise avec succès")}
							</p>
							<p className="text-sm text-green-600 dark:text-green-400">
								{t(
									"appointment.next_step",
									"Sélectionnez maintenant un créneau de rendez-vous.",
								)}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Appointment Picker */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							{t("appointment.select_title", "Choisissez un créneau")}
						</CardTitle>
						<CardDescription>
							{t(
								"appointment.select_description",
								"Ce service nécessite un rendez-vous pour le dépôt de votre dossier.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{request.orgId && request.orgServiceId && (
							<AppointmentSlotPicker
								orgId={request.orgId}
								orgServiceId={request.orgServiceId}
								appointmentType="deposit"
								onSlotSelected={setSelectedSlot}
								selectedSlot={selectedSlot}
							/>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex justify-between gap-4">
					<Button variant="outline" onClick={handleSkip}>
						{t("appointment.skip", "Plus tard")}
					</Button>
					<Button
						onClick={handleBookAppointment}
						disabled={!selectedSlot || isBooking}
					>
						{isBooking ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t("appointment.booking", "Réservation...")}
							</>
						) : (
							<>
								<Calendar className="mr-2 h-4 w-4" />
								{t("appointment.confirm", "Confirmer le rendez-vous")}
							</>
						)}
					</Button>
				</div>
			</main>
		</div>
	);
}
