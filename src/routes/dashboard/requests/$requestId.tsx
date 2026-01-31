"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/dashboard/requests/$requestId")({
	component: RequestDetailPage,
});

function RequestDetailPage() {
	const { requestId } = Route.useParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	const request = useQuery(api.functions.requests.getById, {
		requestId: requestId as any,
	});
	const updateStatus = useMutation(api.functions.requests.updateStatus);
	const addNote = useMutation(api.functions.requests.addNote);

	const [noteContent, setNoteContent] = useState("");
	const [isNoteInternal] = useState(true);

	if (request === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (request === null) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				Demande introuvable
			</div>
		);
	}

	const handleStatusChange = async (newStatus: string) => {
		try {
			await updateStatus({ requestId: request._id, status: newStatus as any });
			toast({ title: "Statut mis à jour" });
		} catch (e) {
			toast({ title: "Erreur", variant: "destructive" });
		}
	};

	return (
		<div className="flex flex-col h-full bg-muted/10">
			{/* Header */}
			<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/dashboard/requests" })}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<h1 className="text-lg font-semibold flex items-center gap-2">
						{request.orgService?.title?.fr || "Service inconnu"}
						<Badge variant="outline" className="ml-2 font-mono">
							{request.reference}
						</Badge>
					</h1>
				</div>
				<div className="flex items-center gap-2">
					{/* Status Actions */}
					<Select value={request.status} onValueChange={handleStatusChange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue>{request.status}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="draft">Brouillon</SelectItem>
							<SelectItem value="submitted">Soumis</SelectItem>
							<SelectItem value="under_review">En cours d'examen</SelectItem>
							<SelectItem value="pending">En attente</SelectItem>
							<SelectItem value="pending_completion">
								En attente de compléments
							</SelectItem>
							<SelectItem value="edited">Modifié</SelectItem>
							<SelectItem value="in_production">En production</SelectItem>
							<SelectItem value="validated">Validé</SelectItem>
							<SelectItem value="ready_for_pickup">
								Prêt pour retrait
							</SelectItem>
							<SelectItem value="appointment_scheduled">
								Rendez-vous programmé
							</SelectItem>
							<SelectItem value="completed">Terminé</SelectItem>
							<SelectItem value="rejected">Rejeté</SelectItem>
							<SelectItem value="cancelled">Annulé</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</header>

			{/* Main Content */}
			<div className="flex-1 overflow-auto p-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
					{/* LEFT: Form Data */}
					<div className="md:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Données du formulaire</CardTitle>
								<CardDescription>
									Informations soumises le{" "}
									{format(
										request.submittedAt || Date.now(),
										"dd/MM/yyyy HH:mm",
									)}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{request.formData ? (
									<div className="grid grid-cols-1 gap-4">
										{Object.entries(request.formData).map(
											([sectionKey, sectionData]: [string, any]) => (
												<div
													key={sectionKey}
													className="border rounded-lg p-4 bg-card/50"
												>
													<h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">
														{sectionKey}
													</h3>
													<div className="grid grid-cols-2 gap-4">
														{Object.entries(sectionData).map(([key, value]) => (
															<div key={key}>
																<p className="text-xs text-muted-foreground mb-1">
																	{key}
																</p>
																<p className="text-sm font-medium">
																	{String(value)}
																</p>
															</div>
														))}
													</div>
												</div>
											),
										)}
									</div>
								) : (
									<div className="text-muted-foreground italic">
										Aucune donnée disponible
									</div>
								)}
							</CardContent>
						</Card>

						{/* Documents - Mockup for Phase 5 */}
						<Card>
							<CardHeader>
								<CardTitle>Pièces jointes</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-muted-foreground">
									L'intégration des documents sera finalisée dans la prochaine
									étape.
								</div>
							</CardContent>
						</Card>
					</div>

					{/* RIGHT: Context & Actions */}
					<div className="space-y-6">
						{/* User Info */}
						<Card>
							<CardHeader>
								<CardTitle>Demandeur</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
										{request.user?.firstName?.[0]}
										{request.user?.lastName?.[0]}
									</div>
									<div>
										<p className="font-medium">
											{request.user?.firstName} {request.user?.lastName}
										</p>
										<p className="text-xs text-muted-foreground">
											{request.user?.email}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Notes/Comments */}
						<Card className="flex flex-col h-[400px]">
							<CardHeader>
								<CardTitle>Notes & Suivi</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 overflow-y-auto space-y-4">
								{(request.notes || []).length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-4">
										Aucune note
									</p>
								) : (
									request.notes.map((note: any) => (
										<div
											key={note._id}
											className="bg-muted/50 p-3 rounded-md text-sm"
										>
											<p>{note.content}</p>
											<div className="flex justify-between mt-2 text-xs text-muted-foreground">
												<span>Agent</span>
												<span>
													{formatDistanceToNow(note.createdAt, {
														addSuffix: true,
														locale: fr,
													})}
												</span>
											</div>
										</div>
									))
								)}
							</CardContent>
							<CardFooter className="pt-2">
								<div className="flex w-full gap-2">
									<Textarea
										placeholder="Ajouter une note..."
										className="min-h-[40px]"
										value={noteContent}
										onChange={(e) => setNoteContent(e.target.value)}
									/>
									<Button
										size="icon"
										onClick={() => {
											if (!noteContent.trim()) return;
											addNote({
												requestId: request._id,
												content: noteContent,
												isInternal: isNoteInternal,
											});
											setNoteContent("");
										}}
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
