import type { Id } from "@convex/_generated/dataModel";
import { Check, Circle, Clock, FileText, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Types for required documents and submitted documents
interface RequiredDocument {
	type: string;
	label: { fr: string; en?: string };
	required: boolean;
}

interface SubmittedDocument {
	_id: Id<"documents">;
	documentType: string;
	filename: string;
	status: "pending" | "validated" | "rejected";
	mimeType: string;
	sizeBytes: number;
	url?: string;
	rejectionReason?: string;
}

interface DocumentChecklistProps {
	requiredDocuments: RequiredDocument[];
	submittedDocuments: SubmittedDocument[];
	onValidate?: (docId: Id<"documents">) => void;
	onReject?: (docId: Id<"documents">, reason: string) => void;
	isAgent?: boolean;
	className?: string;
}

export function DocumentChecklist({
	requiredDocuments,
	submittedDocuments,
	onValidate,
	onReject,
	isAgent = false,
	className,
}: DocumentChecklistProps) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language as "fr" | "en";

	// Helper to get localized label
	const getLabel = (label: { fr: string; en?: string }) => {
		return label[lang] || label.fr;
	};

	// Map submitted documents by type
	const docsByType = submittedDocuments.reduce(
		(acc, doc) => {
			if (!acc[doc.documentType]) {
				acc[doc.documentType] = [];
			}
			acc[doc.documentType].push(doc);
			return acc;
		},
		{} as Record<string, SubmittedDocument[]>,
	);

	// Calculate completion stats
	const totalRequired = requiredDocuments.filter((d) => d.required).length;
	const completedRequired = requiredDocuments.filter(
		(d) =>
			d.required &&
			docsByType[d.type]?.some((doc) => doc.status === "validated"),
	).length;
	const pendingDocs = submittedDocuments.filter(
		(d) => d.status === "pending",
	).length;
	const progress =
		totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

	const getStatusIcon = (
		status: "pending" | "validated" | "rejected" | "missing",
	) => {
		switch (status) {
			case "validated":
				return <Check className="h-4 w-4 text-green-600" />;
			case "rejected":
				return <XCircle className="h-4 w-4 text-red-600" />;
			case "pending":
				return <Clock className="h-4 w-4 text-amber-600" />;
			default:
				return <Circle className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const getStatusBadge = (
		status: "pending" | "validated" | "rejected" | "missing",
	) => {
		switch (status) {
			case "validated":
				return (
					<Badge
						variant="outline"
						className="bg-green-50 text-green-700 border-green-200"
					>
						{t("documents.status.validated", "Validé")}
					</Badge>
				);
			case "rejected":
				return (
					<Badge
						variant="outline"
						className="bg-red-50 text-red-700 border-red-200"
					>
						{t("documents.status.rejected", "Rejeté")}
					</Badge>
				);
			case "pending":
				return (
					<Badge
						variant="outline"
						className="bg-amber-50 text-amber-700 border-amber-200"
					>
						{t("documents.status.pending", "En attente")}
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="bg-muted text-muted-foreground">
						{t("documents.status.missing", "Manquant")}
					</Badge>
				);
		}
	};

	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							{t("documents.checklist.title", "Pièces justificatives")}
						</CardTitle>
						<CardDescription>
							{completedRequired}/{totalRequired}{" "}
							{t("documents.checklist.required", "documents requis validés")}
							{pendingDocs > 0 && (
								<span className="ml-2 text-amber-600">
									• {pendingDocs}{" "}
									{t("documents.checklist.pending", "en attente")}
								</span>
							)}
						</CardDescription>
					</div>
				</div>
				<Progress value={progress} className="h-2 mt-2" />
			</CardHeader>

			<CardContent className="space-y-3">
				{requiredDocuments.map((reqDoc) => {
					const submitted = docsByType[reqDoc.type] || [];
					const hasSubmitted = submitted.length > 0;
					const latestDoc = submitted[submitted.length - 1];
					const status: "pending" | "validated" | "rejected" | "missing" =
						hasSubmitted ? latestDoc.status : "missing";

					return (
						<div
							key={reqDoc.type}
							className={cn(
								"flex items-start gap-3 p-3 rounded-lg border transition-colors",
								status === "validated" && "bg-green-50/50 border-green-200",
								status === "rejected" && "bg-red-50/50 border-red-200",
								status === "pending" && "bg-amber-50/50 border-amber-200",
								status === "missing" && "bg-muted/30 border-muted",
							)}
						>
							<div className="shrink-0 mt-0.5">{getStatusIcon(status)}</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-medium text-sm">
										{getLabel(reqDoc.label)}
									</span>
									{reqDoc.required && (
										<Badge variant="secondary" className="text-xs">
											{t("common.required", "Obligatoire")}
										</Badge>
									)}
								</div>

								{hasSubmitted && latestDoc && (
									<div className="mt-2 space-y-1">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span className="truncate">{latestDoc.filename}</span>
											<span className="text-xs">
												({(latestDoc.sizeBytes / 1024).toFixed(0)} KB)
											</span>
										</div>

										{latestDoc.status === "rejected" &&
											latestDoc.rejectionReason && (
												<p className="text-sm text-red-600 mt-1">
													{t("documents.rejectionReason", "Motif :")}{" "}
													{latestDoc.rejectionReason}
												</p>
											)}

										{isAgent && latestDoc.status === "pending" && (
											<div className="flex gap-2 mt-2">
												<Button
													size="sm"
													variant="outline"
													className="h-7 text-green-700 hover:bg-green-100"
													onClick={() => onValidate?.(latestDoc._id)}
												>
													<Check className="h-3 w-3 mr-1" />
													{t("documents.validate", "Valider")}
												</Button>
												<Button
													size="sm"
													variant="outline"
													className="h-7 text-red-700 hover:bg-red-100"
													onClick={() => {
														const reason = prompt(
															t("documents.rejectPrompt", "Motif du rejet :"),
														);
														if (reason) {
															onReject?.(latestDoc._id, reason);
														}
													}}
												>
													<XCircle className="h-3 w-3 mr-1" />
													{t("documents.reject", "Rejeter")}
												</Button>
											</div>
										)}
									</div>
								)}
							</div>

							<div className="shrink-0">{getStatusBadge(status)}</div>
						</div>
					);
				})}

				{requiredDocuments.length === 0 && (
					<p className="text-center text-muted-foreground py-4">
						{t(
							"documents.checklist.noRequirements",
							"Aucun document requis pour ce service",
						)}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
