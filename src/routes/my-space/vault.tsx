import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { DocumentTypeCategory } from "@convex/lib/constants";
import { createFileRoute } from "@tanstack/react-router";

import { differenceInDays, format, isPast, isToday } from "date-fns";

import {
	Briefcase,
	Building2,
	Car,
	ClipboardList,
	Clock,
	Download,
	Eye,
	FileCheck,
	FileIcon,
	FilePenLine,
	FileText,
	Gavel,
	GraduationCap,
	Heart,
	Home,
	Landmark,
	Languages,
	Loader2,
	MoreVertical,
	Plus,
	Receipt,
	Search,
	Shield,
	ShieldCheck,
	Trash2,
	Upload,
	User,
	Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";
import { PageHeader } from "@/components/my-space/page-header";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-space/vault")({
	component: VaultPage,
});

// Category config with VIBRANT gradients for Glassmorphism look
const CATEGORY_CONFIG: Record<
	DocumentTypeCategory,
	{
		icon: React.ElementType;
		label: string;
		labelEn: string;
		gradient: string; // The main gradient styling the folder
		shadowColor: string; // Colored shadow for depth
		iconColor: string; // Icon color when used outside folder
	}
> = {
	[DocumentTypeCategory.Forms]: {
		icon: FilePenLine,
		label: "Formulaires",
		labelEn: "Forms",
		gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600",
		shadowColor: "shadow-indigo-500/30",
		iconColor: "text-indigo-600",
	},
	[DocumentTypeCategory.Identity]: {
		icon: User,
		label: "Identité",
		labelEn: "Identity",
		gradient: "bg-gradient-to-br from-violet-400 to-purple-600",
		shadowColor: "shadow-violet-500/30",
		iconColor: "text-violet-600",
	},
	[DocumentTypeCategory.CivilStatus]: {
		icon: FileText,
		label: "État civil",
		labelEn: "Civil Status",
		gradient: "bg-gradient-to-br from-fuchsia-400 to-pink-600",
		shadowColor: "shadow-fuchsia-500/30",
		iconColor: "text-fuchsia-600",
	},
	[DocumentTypeCategory.Nationality]: {
		icon: ShieldCheck,
		label: "Nationalité",
		labelEn: "Nationality",
		gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600",
		shadowColor: "shadow-cyan-500/30",
		iconColor: "text-cyan-600",
	},
	[DocumentTypeCategory.Residence]: {
		icon: Home,
		label: "Résidence",
		labelEn: "Residence",
		gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
		shadowColor: "shadow-emerald-500/30",
		iconColor: "text-emerald-600",
	},
	[DocumentTypeCategory.Employment]: {
		icon: Briefcase,
		label: "Emploi",
		labelEn: "Employment",
		gradient: "bg-gradient-to-br from-sky-400 to-blue-600",
		shadowColor: "shadow-sky-500/30",
		iconColor: "text-sky-600",
	},
	[DocumentTypeCategory.Income]: {
		icon: Wallet,
		label: "Revenus",
		labelEn: "Income",
		gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
		shadowColor: "shadow-green-500/30",
		iconColor: "text-green-600",
	},
	[DocumentTypeCategory.Certificates]: {
		icon: ClipboardList,
		label: "Attestations",
		labelEn: "Certificates",
		gradient: "bg-gradient-to-br from-amber-400 to-yellow-600",
		shadowColor: "shadow-amber-500/30",
		iconColor: "text-amber-600",
	},
	[DocumentTypeCategory.OfficialCertificates]: {
		icon: FileCheck,
		label: "Certificats officiels",
		labelEn: "Official Certificates",
		gradient: "bg-gradient-to-br from-orange-400 to-orange-600",
		shadowColor: "shadow-orange-500/30",
		iconColor: "text-orange-600",
	},
	[DocumentTypeCategory.Justice]: {
		icon: Gavel,
		label: "Justice",
		labelEn: "Justice",
		gradient: "bg-gradient-to-br from-red-400 to-red-600",
		shadowColor: "shadow-red-500/30",
		iconColor: "text-red-600",
	},
	[DocumentTypeCategory.AdministrativeDecisions]: {
		icon: Landmark,
		label: "Décisions admin.",
		labelEn: "Administrative Decisions",
		gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
		shadowColor: "shadow-purple-500/30",
		iconColor: "text-purple-600",
	},
	[DocumentTypeCategory.Housing]: {
		icon: Building2,
		label: "Logement",
		labelEn: "Housing",
		gradient: "bg-gradient-to-br from-teal-400 to-teal-600",
		shadowColor: "shadow-teal-500/30",
		iconColor: "text-teal-600",
	},
	[DocumentTypeCategory.Vehicle]: {
		icon: Car,
		label: "Véhicule",
		labelEn: "Vehicle",
		gradient: "bg-gradient-to-br from-slate-400 to-gray-600",
		shadowColor: "shadow-slate-500/30",
		iconColor: "text-slate-600",
	},
	[DocumentTypeCategory.Education]: {
		icon: GraduationCap,
		label: "Éducation",
		labelEn: "Education",
		gradient: "bg-gradient-to-br from-amber-300 to-orange-500",
		shadowColor: "shadow-amber-500/30",
		iconColor: "text-amber-600",
	},
	[DocumentTypeCategory.LanguageIntegration]: {
		icon: Languages,
		label: "Langue & intégration",
		labelEn: "Language & Integration",
		gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
		shadowColor: "shadow-blue-500/30",
		iconColor: "text-blue-600",
	},
	[DocumentTypeCategory.Health]: {
		icon: Heart,
		label: "Santé",
		labelEn: "Health",
		gradient: "bg-gradient-to-br from-rose-400 to-red-600",
		shadowColor: "shadow-rose-500/30",
		iconColor: "text-rose-600",
	},
	[DocumentTypeCategory.Taxation]: {
		icon: Receipt,
		label: "Fiscalité",
		labelEn: "Taxation",
		gradient: "bg-gradient-to-br from-lime-400 to-lime-600",
		shadowColor: "shadow-lime-500/30",
		iconColor: "text-lime-600",
	},
	[DocumentTypeCategory.Other]: {
		icon: FileIcon,
		label: "Divers",
		labelEn: "Other",
		gradient: "bg-gradient-to-br from-stone-400 to-neutral-600",
		shadowColor: "shadow-stone-500/30",
		iconColor: "text-stone-600",
	},
};

type VaultDocument = {
	_id: Id<"documents">;
	filename: string;
	mimeType: string;
	sizeBytes: number;
	documentType: string;
	category?: DocumentTypeCategory;
	description?: string;
	expiresAt?: number;
	storageId: Id<"_storage">;
	_creationTime: number;
	updatedAt?: number;
};

// Documents classified as "Other" will be displayed at root level
// Others will be in folders

function VaultPage() {
	const { t } = useTranslation();
	// State
	const [currentFolder, setCurrentFolder] =
		useState<DocumentTypeCategory | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showUpload, setShowUpload] = useState(false);
	const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

	const { data: documents, isPending } = useAuthenticatedConvexQuery(
		api.functions.documentVault.getMyVault,
		{},
	);

	const { data: stats } = useAuthenticatedConvexQuery(
		api.functions.documentVault.getStats,
		{},
	);

	// Filter documents logic
	const filteredDocuments = (documents ?? []).filter((doc) => {
		if (searchQuery) {
			return (
				doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
				doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		// If searching, show all matches. If navigating:
		if (currentFolder) {
			return doc.category === currentFolder;
		}
		// Root view: No loose files shown. Everything is in folders now.
		return false;
	});

	// Folders to display at root - ALL categories including "Other"
	const visibleFolders = Object.values(DocumentTypeCategory);

	const getCategoryCount = (cat: DocumentTypeCategory) => {
		return stats?.byCategory[cat] ?? 0;
	};

	const handleFolderClick = (cat: DocumentTypeCategory) => {
		setCurrentFolder(cat);
		setSearchQuery(""); // Clear search when navigating
	};

	const handleBack = () => {
		setCurrentFolder(null);
		setSearchQuery("");
	};

	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="flex flex-col gap-4"
			>
				{/* Top Row: Title + Actions */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<PageHeader
						title={
							currentFolder
								? CATEGORY_CONFIG[currentFolder].label
								: t("vault.title", "Coffre-fort")
						}
						subtitle={
							currentFolder
								? undefined
								: t("vault.subtitle", "Vos documents importants sécurisés")
						}
						icon={
							currentFolder ? (
								(() => {
									const ConfigIcon = CATEGORY_CONFIG[currentFolder].icon;
									return (
										<ConfigIcon
											className={cn(
												"h-6 w-6",
												CATEGORY_CONFIG[currentFolder].iconColor,
											)}
										/>
									);
								})()
							) : (
								<Shield className="h-6 w-6 text-primary" />
							)
						}
						showBackButton={!!currentFolder}
						onBack={handleBack}
					/>
					<div className="flex items-center gap-3 w-full sm:w-auto">
						{/* Search Bar */}
						<div className="relative flex-1 sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={t("vault.searchPlaceholder", "Rechercher...")}
								className="pl-10 h-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<Dialog open={showUpload} onOpenChange={setShowUpload}>
							<DialogTrigger asChild>
								<Button className="gap-2 shadow-sm shrink-0">
									<Plus className="h-4 w-4" />
									<span className="hidden sm:inline">
										{t("vault.upload", "Ajouter")}
									</span>
									<span className="sm:hidden">
										{t("vault.uploadShort", "Ajouter")}
									</span>
								</Button>
							</DialogTrigger>
							<UploadDialog
								defaultCategory={currentFolder ?? DocumentTypeCategory.Other}
								onClose={() => setShowUpload(false)}
							/>
						</Dialog>
					</div>
				</div>
			</motion.div>

			{/* Content */}
			<AnimatePresence mode="wait">
				{isPending ? (
					<div className="flex justify-center p-12">
						<Loader2 className="animate-spin h-8 w-8 text-primary" />
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="space-y-6"
					>
						{/* Folders Selection (Only visible at root and when not searching) */}
						{!currentFolder && !searchQuery && (
							<section>
								<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
									{t("vault.folders", "Dossiers")}
								</h2>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
									{visibleFolders.map((cat) => {
										const config = CATEGORY_CONFIG[cat];
										// const count = getCategoryCount(cat);
										const count = getCategoryCount(cat);

										return (
											<FolderCard
												key={cat}
												category={cat}
												label={config.label}
												count={count}
												config={config}
												onClick={() => handleFolderClick(cat)}
											/>
										);
									})}
								</div>
							</section>
						)}

						{/* Files List - Only show when inside a folder OR searching */}
						{(currentFolder || searchQuery) && (
							<section>
								{/* Section Title Logic */}
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
										{searchQuery
											? t("vault.searchResults", "Résultats de recherche")
											: currentFolder
												? t("vault.documents", "Documents")
												: t("vault.uncategorized", "Fichiers non classés")}
									</h2>
									{filteredDocuments.length > 0 && (
										<span className="text-xs text-muted-foreground">
											{filteredDocuments.length} élément(s)
										</span>
									)}
								</div>

								{filteredDocuments.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30">
										<div className="p-4 rounded-full bg-muted mb-4">
											{currentFolder ? (
												// Use the colored icon matching the folder
												(() => {
													const ConfigIcon =
														CATEGORY_CONFIG[currentFolder].icon;
													return (
														<ConfigIcon
															className={cn(
																"h-8 w-8",
																CATEGORY_CONFIG[currentFolder].iconColor,
															)}
														/>
													);
												})()
											) : (
												<Search className="h-8 w-8 text-muted-foreground" />
											)}
										</div>
										<p className="font-medium text-lg">
											{searchQuery
												? t("vault.noResults", "Aucun résultat")
												: t("vault.emptyFolder", "Ce dossier est vide")}
										</p>
										{!searchQuery && (
											<Button
												variant="link"
												onClick={() => setShowUpload(true)}
												className="mt-2 text-primary"
											>
												{t("vault.uploadPrompt", "Ajouter un document")}
											</Button>
										)}
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
										{filteredDocuments.map((doc) => (
											<FileCard
												key={doc._id}
												document={doc as VaultDocument}
												onPreview={() => setPreviewDoc(doc as VaultDocument)}
											/>
										))}
									</div>
								)}
							</section>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Document Preview Modal */}
			{previewDoc && (
				<DocumentPreviewModal
					open={!!previewDoc}
					onOpenChange={(open) => !open && setPreviewDoc(null)}
					storageId={previewDoc.storageId}
					filename={previewDoc.filename}
					mimeType={previewDoc.mimeType}
				/>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// COMPONENTS
// ---------------------------------------------------------------------------

function FolderCard({
	label,
	count,
	config,
	onClick,
}: {
	category: DocumentTypeCategory;
	label: string;
	count: number;
	config: (typeof CATEGORY_CONFIG)[DocumentTypeCategory];
	onClick: () => void;
}) {
	return (
		<motion.button
			type="button"
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			// Back to the "Tall" proportion w-full h-48, no external container
			className="group relative w-full h-48 focus:outline-none cursor-pointer"
		>
			<div className="absolute inset-0 flex flex-col items-center justify-end">
				{/* 1. Back Folder Body (Darker) */}
				<div
					className={cn(
						"absolute top-0 w-full h-full rounded-2xl",
						config.gradient,
						"brightness-75", // Darker for the back
					)}
				/>

				{/* 2. Peeking Cards (Rotated inserts - Dynamic based on count) */}
				<div className="absolute top-2 inset-x-4 h-[70%] z-10 overflow-visible pointer-events-none">
					{/* Card 1 - Only if count >= 2 */}
					{count >= 2 && (
						<div className="absolute top-0 left-2 w-24 h-28 bg-white/90 rounded-lg shadow-sm transform -rotate-6 transition-transform group-hover:-translate-y-4 group-hover:-rotate-12 duration-300 origin-bottom-left" />
					)}

					{/* Card 2 - Only if count >= 3 (or just keep 3 max for stack effect?) --> User said: 1=1, 2=2, 3+=3 */}
					{/* Let's adjust:
						count >= 3: 3 cards ? User said "si on en a plus de trois, on laisse juste les trois".
						Currently I have 2 slots in visual design (Left and Right).
						Let's add a Center one for the third or adjust positions.
					*/}

					{/* Center/Back card (if >= 3) */}
					{count >= 3 && (
						<div className="absolute top-1 left-8 w-24 h-28 bg-white/80 rounded-lg shadow-sm transform -rotate-1 transition-transform group-hover:-translate-y-6 duration-300 origin-bottom" />
					)}

					{/* Main Right Card (if >= 1) */}
					{count >= 1 && (
						<div className="absolute top-2 right-4 w-24 h-28 bg-white/95 rounded-md shadow-sm transform rotate-3 transition-transform group-hover:-translate-y-5 group-hover:rotate-6 duration-300 z-10 origin-bottom-right">
							{/* Icon watermark on the card */}
							<div className="flex items-center justify-center h-full text-muted-foreground/10">
								<config.icon className="h-12 w-12" />
							</div>
						</div>
					)}
				</div>

				{/* 3. Front Glassy Folder Face (Tall) */}
				<div
					className={cn(
						"absolute bottom-0 w-full h-[85%] rounded-2xl z-20 overflow-hidden",
						config.gradient,
						config.shadowColor,
						"shadow-lg",
						"border-t border-white/20",
					)}
				>
					{/* Inner sheen */}
					<div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

					{/* Content Inside */}
					<div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
						<h3 className="font-bold text-lg leading-tight truncate text-left">
							{label}
						</h3>

						<div className="flex items-baseline gap-1.5 text-left">
							<span className="text-3xl font-bold tracking-tight">{count}</span>
							<span className="text-xs font-medium opacity-90 pb-1 uppercase tracking-wide">
								{count > 1 ? "documents" : "document"}
							</span>
						</div>
					</div>

					{/* Optional: Subtle watermark icon in corner */}
					<config.icon className="absolute -bottom-6 -right-6 h-32 w-32 text-white/5 rotate-12" />
				</div>
			</div>
		</motion.button>
	);
}

function FileCard({
	document,
	onPreview,
}: {
	document: VaultDocument;
	onPreview?: () => void;
}) {
	const { t } = useTranslation();
	const { mutateAsync: remove } = useConvexMutationQuery(
		api.functions.documentVault.removeFromVault,
	);
	const { mutateAsync: getUrl } = useConvexMutationQuery(
		api.functions.documents.getUrl,
	);
	const [imageUrl, setImageUrl] = useState<string | null>(null);

	const config =
		CATEGORY_CONFIG[document.category ?? DocumentTypeCategory.Other];

	// Check if expiring soon (30 days)
	const isExpired =
		document.expiresAt &&
		isPast(document.expiresAt) &&
		!isToday(document.expiresAt);
	const isExpiringSoon =
		document.expiresAt &&
		!isExpired &&
		differenceInDays(document.expiresAt, new Date()) <= 30;

	// Load thumbnail for images
	useEffect(() => {
		if (document.mimeType.startsWith("image/")) {
			getUrl({ storageId: document.storageId })
				.then((url) => setImageUrl(url))
				.catch(() => setImageUrl(null));
		}
	}, [document.storageId, document.mimeType, getUrl]);

	const handleDownload = async () => {
		try {
			const url = await getUrl({ storageId: document.storageId });
			if (url) window.open(url, "_blank");
		} catch {
			toast.error(t("common.error", "Erreur"));
		}
	};

	const handleClick = () => {
		if (onPreview) {
			onPreview();
		} else {
			handleDownload();
		}
	};

	const handleDelete = () => {
		remove({ id: document._id });
		toast.success(t("vault.deleted", "Document supprimé"));
	};

	const formatSize = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
	};

	return (
		<Card
			className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/50 cursor-pointer h-full flex flex-col"
			onClick={handleClick}
		>
			{/* Thumbnail Area - Aspect Ratio 4/3 or similar */}
			<div className="relative aspect-[4/3] bg-muted/30 group-hover:bg-muted/50 transition-colors flex items-center justify-center overflow-hidden border-b border-border/30">
				{/* Document Preview (Image) or Large Icon */}
				{/* Note: We rely on mimeType to decide if we try to show image or icon */}
				{/* For a real thumbnail system with signed URLs, we would need a separate component to fetch and cache the URL. */}
				{/* For now, we will use a Big Icon approach that looks like a thumbnail file. */}

				<div className="transform transition-transform duration-500 group-hover:scale-110 w-full h-full flex items-center justify-center">
					{document.mimeType.startsWith("image/") ? (
						// Image Thumbnail
						imageUrl ? (
							<img
								src={imageUrl}
								alt={document.filename}
								className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
							/>
						) : (
							// Loading or Error placeholder for image
							<div className="w-full h-full bg-muted/20 flex items-center justify-center">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						)
					) : (
						// PDF / Document styling
						<div className="relative w-20 h-28 bg-white shadow-sm flex flex-col items-center justify-center rounded-sm border">
							<div className="absolute top-0 left-0 w-full h-6 bg-muted/10 border-b border-muted/10" />
							<FileIcon
								className={cn("h-10 w-10 opacity-60", config.iconColor)}
							/>
							<div className="absolute bottom-3 left-3 w-10 h-1 bg-muted/30 rounded-full" />
							<div className="absolute bottom-5 left-3 w-14 h-1 bg-muted/30 rounded-full" />
						</div>
					)}
				</div>

				{/* Hover Status/Action Overlay */}
				<div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-sm">
						<Eye className="h-5 w-5 text-primary" />
					</div>
				</div>
			</div>

			<CardContent className="p-3 flex-1 flex flex-col justify-between bg-card text-card-foreground">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 pr-1">
						<h3
							className="font-semibold text-sm truncate leading-snug"
							title={document.filename}
						>
							{document.filename}
						</h3>
						<div className="flex items-center gap-1.5 mt-1">
							<div
								className={cn(
									"w-1.5 h-1.5 rounded-full shrink-0",
									config.gradient,
								)}
							/>
							<p className="text-xs text-muted-foreground truncate">
								{formatSize(document.sizeBytes)}
							</p>
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									handleClick();
								}}
							>
								<Eye className="h-4 w-4 mr-2" />
								{t("common.preview", "Aperçu")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									handleDownload();
								}}
							>
								<Download className="h-4 w-4 mr-2" />
								{t("common.download", "Télécharger")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									handleDelete();
								}}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								{t("common.delete", "Supprimer")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Expiration warning if needed */}
				{(isExpired || isExpiringSoon) && (
					<div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
						<div
							className={cn(
								"flex items-center gap-1 font-medium",
								isExpired ? "text-destructive" : "text-amber-600",
							)}
						>
							<Clock className="h-3 w-3" />
							{document.expiresAt && format(document.expiresAt, "dd/MM/yyyy")}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function UploadDialog({
	defaultCategory,
	onClose,
}: {
	defaultCategory: DocumentTypeCategory;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const { mutateAsync: generateUploadUrl } = useConvexMutationQuery(
		api.functions.documents.generateUploadUrl,
	);
	const { mutate: addToVault, isPending } = useConvexMutationQuery(
		api.functions.documentVault.addToVault,
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [category, setCategory] =
		useState<DocumentTypeCategory>(defaultCategory);
	const [description, setDescription] = useState("");
	const [expiresAt, setExpiresAt] = useState("");
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setUploading(true);
		setUploadProgress(10);

		try {
			const uploadUrl = await generateUploadUrl({});
			setUploadProgress(30);

			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});
			setUploadProgress(70);

			if (!response.ok) throw new Error("Upload failed");

			const { storageId } = await response.json();
			setUploadProgress(90);

			addToVault(
				{
					storageId,
					filename: file.name,
					mimeType: file.type,
					sizeBytes: file.size,
					documentType: "personal",
					category,
					description: description || undefined,
					expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
				},
				{
					onSuccess: () => {
						setUploadProgress(100);
						toast.success(t("vault.uploaded", "Document ajouté"));
						onClose();
					},
					onError: () => {
						toast.error(t("common.error", "Erreur"));
						setUploading(false);
					},
				},
			);
		} catch {
			toast.error(t("common.error", "Erreur"));
			setUploading(false);
		}
	};

	return (
		<DialogContent className="sm:max-w-[450px]">
			<DialogHeader>
				<DialogTitle>
					{t("vault.upload.title", "Ajouter un document")}
				</DialogTitle>
			</DialogHeader>
			<div className="space-y-4 mt-4">
				<div className="space-y-2">
					<Label>{t("vault.upload.file", "Fichier")} *</Label>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="hidden"
						accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
					/>
					<Button
						type="button"
						variant="outline"
						className="w-full h-24 border-dashed relative overflow-hidden"
						onClick={() => fileInputRef.current?.click()}
					>
						{file ? (
							<div className="flex flex-col items-center gap-1 z-10">
								<FileText className="h-6 w-6 text-primary" />
								<span className="text-sm font-medium">{file.name}</span>
								<span className="text-xs text-muted-foreground">
									{(file.size / 1024).toFixed(1)} KB
								</span>
							</div>
						) : (
							<div className="flex flex-col items-center gap-1 text-muted-foreground z-10">
								<Upload className="h-6 w-6" />
								<span className="text-sm">
									{t("vault.upload.dropzone", "Cliquez pour sélectionner")}
								</span>
							</div>
						)}
						{uploading && (
							<motion.div
								className="absolute bottom-0 left-0 h-1 bg-primary"
								initial={{ width: 0 }}
								animate={{ width: `${uploadProgress}%` }}
							/>
						)}
					</Button>
				</div>

				<div className="space-y-2">
					<Label>{t("vault.upload.category", "Dossier")} *</Label>
					<Select
						value={category}
						onValueChange={(v) => setCategory(v as DocumentTypeCategory)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
								<SelectItem key={cat} value={cat}>
									<div className="flex items-center gap-2">
										<config.icon className={cn("h-4 w-4", config.iconColor)} />
										{config.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>{t("vault.upload.expiresAt", "Date d'expiration")}</Label>
					<Input
						type="date"
						value={expiresAt}
						onChange={(e) => setExpiresAt(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label>{t("vault.upload.description", "Description")}</Label>
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder={t(
							"vault.upload.descPlaceholder",
							"Ex: Passeport périmé",
						)}
					/>
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onClick={onClose}>
						{t("common.cancel", "Annuler")}
					</Button>
					<Button
						type="button"
						onClick={handleUpload}
						disabled={!file || uploading || isPending}
					>
						{uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						{t("vault.upload.submit", "Ajouter")}
					</Button>
				</div>
			</div>
		</DialogContent>
	);
}
