"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Download, ExternalLink, FileText, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface DocumentPreviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	storageId: string;
	filename: string;
	mimeType?: string;
}

/**
 * Modal to preview documents (PDF, images) inline without opening a new page
 */
export function DocumentPreviewModal({
	open,
	onOpenChange,
	storageId,
	filename,
	mimeType,
}: DocumentPreviewModalProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const getUrl = useMutation(api.functions.documents.getUrl);

	const [documentUrl, setDocumentUrl] = useState<string | null>(null);

	// Load document URL when modal opens
	const loadDocument = async () => {
		if (!storageId) return;
		try {
			setLoading(true);
			setError(false);
			const url = await getUrl({ storageId: storageId as Id<"_storage"> });
			setDocumentUrl(url);
		} catch {
			setError(true);
			toast.error("Impossible de charger le document");
		} finally {
			setLoading(false);
		}
	};

	// Load on open
	if (open && !documentUrl && !loading && !error) {
		loadDocument();
	}

	// Reset state when closing
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setDocumentUrl(null);
			setLoading(true);
			setError(false);
		}
		onOpenChange(newOpen);
	};

	// Determine file type
	const isPdf =
		mimeType?.includes("pdf") || filename?.toLowerCase().endsWith(".pdf");
	const isImage =
		mimeType?.startsWith("image/") ||
		/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename || "");

	const handleDownload = async () => {
		if (documentUrl) {
			window.open(documentUrl, "_blank");
		}
	};

	const handleOpenExternal = () => {
		if (documentUrl) {
			window.open(documentUrl, "_blank");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
				{/* Header */}
				<DialogHeader className="px-4 py-3 border-b flex-shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<FileText className="h-5 w-5 text-primary" />
							<DialogTitle className="text-base font-medium truncate max-w-[400px]">
								{filename || "Document"}
							</DialogTitle>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleOpenExternal}
								disabled={!documentUrl}
							>
								<ExternalLink className="h-4 w-4 mr-1.5" />
								Ouvrir
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleDownload}
								disabled={!documentUrl}
							>
								<Download className="h-4 w-4 mr-1.5" />
								Télécharger
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleOpenChange(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</DialogHeader>

				{/* Content */}
				<div className="flex-1 overflow-hidden bg-muted/30">
					{loading && (
						<div className="h-full flex items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					)}

					{error && (
						<div className="h-full flex flex-col items-center justify-center text-muted-foreground">
							<FileText className="h-12 w-12 mb-4 opacity-20" />
							<p>Impossible de charger le document</p>
							<Button variant="outline" className="mt-4" onClick={loadDocument}>
								Réessayer
							</Button>
						</div>
					)}

					{!loading && !error && documentUrl && (
						<>
							{isPdf && (
								<iframe
									src={documentUrl}
									className="w-full h-full border-0"
									title={filename}
								/>
							)}

							{isImage && (
								<div className="h-full overflow-auto flex items-center justify-center p-4">
									<img
										src={documentUrl}
										alt={filename}
										className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
										onLoad={() => setLoading(false)}
										onError={() => setError(true)}
									/>
								</div>
							)}

							{!isPdf && !isImage && (
								<div className="h-full flex flex-col items-center justify-center text-muted-foreground">
									<FileText className="h-12 w-12 mb-4 opacity-20" />
									<p className="mb-2">
										Ce type de fichier ne peut pas être prévisualisé
									</p>
									<Button variant="default" onClick={handleDownload}>
										<Download className="h-4 w-4 mr-2" />
										Télécharger le fichier
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
