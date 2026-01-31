"use client";

import { api } from "@convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useFormFillOptional } from "@/components/ai/FormFillContext";
import { DynamicForm } from "@/components/services/DynamicForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/my-space/services/$slug/new")({
	component: NewRequestPage,
});

function NewRequestPage() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const formFillContext = useFormFillOptional();

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch service by slug
	const orgService = useQuery(api.functions.services.getOrgServiceBySlug, {
		slug,
	});

	const createRequest = useMutation(api.functions.requests.createFromForm);

	// Handle Form Submission
	const handleSubmit = async (data: Record<string, any>) => {
		if (!orgService) return;

		setIsSubmitting(true);
		try {
			await createRequest({
				orgServiceId: orgService._id,
				formData: data,
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
		// This could open the AI assistant panel or trigger a document scan modal
		// For now, just show a toast indicating the feature
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
				<Button onClick={() => navigate({ to: "/my-space/services" })}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour aux services
				</Button>
			</div>
		);
	}

	// No Form Schema configured
	if (!orgService.formSchema) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Formulaire non configuré</h2>
				<p className="text-muted-foreground mb-4">
					Ce service n'a pas encore de formulaire de demande. Veuillez contacter
					l'administration.
				</p>
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/my-space/services" })}
				>
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
						onClick={() => navigate({ to: "/my-space/services" })}
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

				{/* Dynamic Form */}
				<DynamicForm
					schema={orgService.formSchema}
					onSubmit={handleSubmit}
					isSubmitting={isSubmitting}
				/>
			</main>
		</div>
	);
}
