import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	CheckCircle,
	Clock,
	Download,
	ExternalLink,
	File,
	FileText,
	Info,
	Loader2,
	Search,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/my-space/documents")({
	component: DocumentsPage,
});

function DocumentsPage() {
	const { t, i18n } = useTranslation();
	const lang = i18n.language === "fr" ? "fr" : "en";

	// Get user's requests with their documents
	const { data: requests, isPending: requestsPending } =
		useAuthenticatedConvexQuery(api.functions.requests.listMine, {});

	const { mutateAsync: getUrl } = useConvexMutationQuery(
		api.functions.documents.getUrl,
	);

	const [searchQuery, setSearchQuery] = useState("");

	const handleDownload = async (storageId: string) => {
		try {
			const url = await getUrl({ storageId: storageId as Id<"_storage"> });
			if (url) {
				window.open(url, "_blank");
			} else {
				toast.error(
					t(
						"documents.error.noUrl",
						"Impossible de récupérer le lien du document",
					),
				);
			}
		} catch {
			toast.error(
				t("documents.error.download", "Erreur lors du téléchargement"),
			);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "validated":
				return (
					<Badge
						variant="secondary"
						className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						<CheckCircle className="h-3 w-3" />
						{t("documents.status.validated", "Validé")}
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="destructive" className="gap-1">
						<XCircle className="h-3 w-3" />
						{t("documents.status.rejected", "Refusé")}
					</Badge>
				);
			default:
				return (
					<Badge variant="secondary" className="gap-1">
						<Clock className="h-3 w-3" />
						{t("documents.status.pending", "En attente")}
					</Badge>
				);
		}
	};

	// Flatten documents from all requests for search
	const allDocuments =
		requests?.flatMap((request) =>
			(request.documents || []).map((doc: any) => ({
				...doc,
				requestReference: request.reference,
				requestId: request._id,
				serviceName: request.serviceName?.[lang] || request.serviceName?.fr,
			})),
		) || [];

	const filteredDocs = searchQuery
		? allDocuments.filter(
				(doc) =>
					doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: allDocuments;

	if (requestsPending) {
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="animate-spin h-8 w-8 text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-in fade-in p-1">
			{/* Info Alert */}
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>{t("documents.info.title", "Vos documents")}</AlertTitle>
				<AlertDescription>
					{t(
						"documents.info.description",
						"Les documents sont automatiquement associés à vos demandes de services consulaires. Vous pouvez les consulter ici ou directement depuis chaque demande.",
					)}
				</AlertDescription>
			</Alert>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<div>
							<CardTitle>{t("documents.listTitle", "Mes documents")}</CardTitle>
							<CardDescription>
								{t(
									"documents.listDescription",
									"Documents joints à vos demandes consulaires",
								)}
							</CardDescription>
						</div>
						<div className="relative w-full max-w-xs">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={t("documents.search", "Rechercher...")}
								className="pl-9"
								autoComplete="off"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{!filteredDocs || filteredDocs.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
							<File className="h-12 w-12 mb-4 opacity-20" />
							<p className="mb-4">
								{searchQuery
									? t("common.noResults", "Aucun résultat trouvé.")
									: t(
											"documents.empty",
											"Vous n'avez pas encore de documents.",
										)}
							</p>
							{!searchQuery && (
								<p className="text-sm max-w-md">
									{t(
										"documents.emptyHint",
										"Les documents seront ajoutés automatiquement lorsque vous soumettrez une demande de service consulaire.",
									)}
								</p>
							)}
							<Button asChild className="mt-4" variant="outline">
								<Link to="/services">
									{t("documents.browseServices", "Découvrir les services")}
								</Link>
							</Button>
						</div>
					) : (
						<div className="space-y-6">
							{/* Group by request */}
							{requests
								?.filter((r) => r.documents && r.documents.length > 0)
								.map((request) => {
									const requestDocs = (request.documents || []).filter(
										(doc: any) =>
											!searchQuery ||
											doc.filename
												?.toLowerCase()
												.includes(searchQuery.toLowerCase()) ||
											doc.documentType
												?.toLowerCase()
												.includes(searchQuery.toLowerCase()),
									);

									if (requestDocs.length === 0) return null;

									return (
										<div key={request._id} className="space-y-3">
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2">
													<h3 className="font-medium">
														{request.serviceName?.[lang] ||
															request.serviceName?.fr ||
															request.reference}
													</h3>
													<Badge variant="outline" className="text-xs">
														{request.reference}
													</Badge>
												</div>
												<Button variant="ghost" size="sm" asChild>
													<Link
														to="/my-space/requests/$requestId"
														params={{ requestId: request._id }}
													>
														<ExternalLink className="h-4 w-4 mr-1" />
														{t("documents.viewRequest", "Voir la demande")}
													</Link>
												</Button>
											</div>
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
												{requestDocs.map((doc: any) => (
													<Card
														key={doc._id}
														className="group hover:border-primary/50 transition-colors"
													>
														<CardContent className="p-4 flex items-start gap-3">
															<div className="p-2 bg-primary/10 rounded-lg text-primary">
																<FileText className="h-6 w-6" />
															</div>
															<div className="flex-1 min-w-0">
																<h4
																	className="font-medium truncate"
																	title={doc.filename}
																>
																	{doc.filename}
																</h4>
																<p className="text-xs text-muted-foreground">
																	{format(
																		new Date(doc._creationTime),
																		"dd MMM yyyy",
																		{ locale: fr },
																	)}
																</p>
																<div className="flex items-center gap-2 mt-2">
																	{getStatusBadge(doc.status)}
																	<span className="text-xs text-muted-foreground">
																		{(doc.sizeBytes / 1024).toFixed(0)} KB
																	</span>
																</div>
															</div>
														</CardContent>
														<div className="px-4 pb-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
															<Button
																variant="ghost"
																size="icon-xs"
																title={t("documents.download", "Télécharger")}
																onClick={() => handleDownload(doc.storageId)}
															>
																<Download className="h-4 w-4" />
															</Button>
														</div>
													</Card>
												))}
											</div>
										</div>
									);
								})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
