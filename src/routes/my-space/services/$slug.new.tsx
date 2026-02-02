"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { OwnerType, ServiceCategory } from "@convex/lib/constants";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useFormFillOptional } from "@/components/ai/FormFillContext";
import { AppointmentSlotPicker } from "@/components/appointments/AppointmentSlotPicker";
import { DynamicForm } from "@/components/services/DynamicForm";
import { RegistrationForm } from "@/components/services/RegistrationForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/my-space/services/$slug/new")({
	component: NewRequestPage,
});

function NewRequestPage() {
	const { profile } = useUserData();
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const formFillContext = useFormFillOptional();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [draftRequestId, setDraftRequestId] = useState<Id<"requests"> | null>(
		null,
	);
	const creatingDraft = useRef(false);
	const [selectedSlotId, setSelectedSlotId] =
		useState<Id<"appointmentSlots"> | null>(null);

	// Fetch service by slug
	const orgService = useQuery(api.functions.services.getOrgServiceBySlug, {
		slug,
	});

	// Check for existing draft
	const existingDraft = useQuery(
		api.functions.requests.getDraftForService,
		orgService ? { orgServiceId: orgService._id } : "skip",
	);

	const createDraft = useMutation(api.functions.requests.create);
	const submitRequest = useMutation(api.functions.requests.submit);

	// Initialize draft: use existing or create new
	useEffect(() => {
		async function initDraft() {
			// Wait for existingDraft query to complete
			if (existingDraft === undefined) return;

			// If we have an existing draft, use it
			if (existingDraft) {
				setDraftRequestId(existingDraft._id);
				return;
			}

			// No existing draft, create one
			if (orgService && !draftRequestId && !creatingDraft.current) {
				creatingDraft.current = true;
				try {
					const id = await createDraft({
						orgServiceId: orgService._id,
						submitNow: false,
					});
					setDraftRequestId(id);
				} catch (error) {
					console.error("Failed to create draft:", error);
				}
			}
		}
		initDraft();
	}, [orgService, existingDraft, draftRequestId, createDraft]);

	// Handle Form Submission
	const handleSubmit = async (data: Record<string, any>) => {
		if (!draftRequestId) {
			toast.error(t("error.generic", "Erreur"), {
				description: "Demande brouillon non créée",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			// If service requires appointment, validate slot is selected
			const requiresAppointment = orgService?.service?.requiresAppointment;
			if (requiresAppointment && !selectedSlotId) {
				toast.error(
					t(
						"request.select_appointment",
						"Veuillez sélectionner un créneau de rendez-vous",
					),
				);
				setIsSubmitting(false);
				return;
			}

			await submitRequest({
				requestId: draftRequestId,
				formData: data,
				slotId: selectedSlotId ?? undefined,
			});

			toast.success(
				t("request.submitted_success", "Demande soumise avec succès"),
				{
					description: t(
						"request.submitted_description",
						"Vous recevrez une notification lorsque le statut changera.",
					),
				},
			);

			navigate({ to: "/my-space/requests" });
		} catch (error) {
			console.error("Failed to submit request:", error);
			toast.error(t("error.generic", "Erreur"), {
				description: t(
					"error.request_failed",
					"Impossible de soumettre la demande.",
				),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Trigger AI Fill (opens assistant or uses existing pendingFill)
	const handleAIFill = () => {
		toast.info("🤖 Assistant IA", {
			description:
				"Ouvrez l'assistant et demandez-lui de remplir le formulaire avec votre passeport.",
		});
	};

	// Loading State
	if (orgService === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Not Found
	if (orgService === null) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Service introuvable</h2>
				<p className="text-muted-foreground mb-4">
					Ce service n'existe pas ou n'est pas disponible.
				</p>
				<Button onClick={() => navigate({ to: "/services" })}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour aux services
				</Button>
			</div>
		);
	}

	// Check if there's anything to show (form sections, documents, or profile verification)
	const hasRequiredDocuments = (orgService.requiredDocuments?.length ?? 0) > 0;
	const isRegistrationService =
		orgService.service?.category === ServiceCategory.Registration;
	const hasFormContent =
		orgService.formSchema || hasRequiredDocuments || isRegistrationService;

	// No Form Schema and no documents configured
	if (!hasFormContent) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Formulaire non configuré</h2>
				<p className="text-muted-foreground mb-4">
					Ce service n'a pas encore de formulaire de demande. Veuillez contacter
					l'administration.
				</p>
				<Button variant="outline" onClick={() => navigate({ to: "/services" })}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour aux services
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
						onClick={() => navigate({ to: "/services" })}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						<h1 className="font-semibold truncate">
							{orgService.title?.fr ||
								orgService.service?.name?.fr ||
								"Nouvelle demande"}
						</h1>
					</div>
					{/* AI Fill Button */}
					{formFillContext && (
						<Button variant="outline" size="sm" onClick={handleAIFill}>
							<Sparkles className="mr-2 h-4 w-4 text-amber-500" />
							Remplir avec l'IA
						</Button>
					)}
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 container py-8 px-4 max-w-2xl mx-auto">
				{/* Service Info Card */}
				<Card className="mb-6 border-primary/20 bg-primary/5">
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between gap-4">
							<div>
								<CardTitle className="text-lg">
									{orgService.title?.fr || orgService.service?.name?.fr}
								</CardTitle>
								<CardDescription className="mt-1">
									{orgService.service?.description?.fr}
								</CardDescription>
							</div>
							{orgService.estimatedDays && (
								<Badge variant="secondary" className="shrink-0">
									~{orgService.estimatedDays} jours
								</Badge>
							)}
						</div>
					</CardHeader>
					{orgService.instructions && (
						<CardContent className="text-sm text-muted-foreground border-t pt-3">
							<p>{orgService.instructions}</p>
						</CardContent>
					)}
				</Card>

				{/* Appointment Slot Picker (if required) */}
				{orgService.service?.requiresAppointment && orgService.orgId && (
					<AppointmentSlotPicker
						orgId={orgService.orgId}
						serviceId={orgService.serviceId}
						onSlotSelected={setSelectedSlotId}
						selectedSlotId={selectedSlotId}
					/>
				)}

				{/* Form - Registration or Dynamic */}
				{orgService.service?.category === ServiceCategory.Registration &&
				profile ? (
					<RegistrationForm
						profile={profile}
						requiredDocuments={
							(orgService.requiredDocuments || []) as Array<{
								type: string;
								label: { fr: string; en?: string };
								required: boolean;
							}>
						}
						onSubmit={async () => {
							await handleSubmit({});
						}}
						isSubmitting={isSubmitting}
					/>
				) : (
					<DynamicForm
						schema={orgService.formSchema}
						defaultValues={
							existingDraft?.formData as Record<string, unknown> | undefined
						}
						onSubmit={handleSubmit}
						isSubmitting={isSubmitting}
					/>
				)}
			</main>
		</div>
	);
}
