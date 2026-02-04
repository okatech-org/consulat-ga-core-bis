import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { DocumentCategory } from "@convex/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArrowLeft,
	Briefcase,
	Car,
	ChevronRight,
	Clock,
	Download,
	File,
	FileText,
	GraduationCap,
	Heart,
	Home,
	Loader2,
	MoreVertical,
	Plus,
	Search,
	Trash2,
	Upload,
	User,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
	DocumentCategory,
	{
		icon: React.ElementType;
		label: string;
		labelEn: string;
		gradient: string; // The main gradient styling the folder
		shadowColor: string; // Colored shadow for depth
		iconColor: string; // Icon color when used outside folder
	}
> = {
	[DocumentCategory.Identity]: {
		icon: User,
		label: "Identité",
		labelEn: "Identity",
		gradient: "bg-gradient-to-br from-violet-400 to-purple-600",
		shadowColor: "shadow-violet-500/30",
		iconColor: "text-violet-600",
	},
	[DocumentCategory.CivilStatus]: {
		icon: FileText,
		label: "État civil",
		labelEn: "Civil Status",
		gradient: "bg-gradient-to-br from-fuchsia-400 to-pink-600",
		shadowColor: "shadow-fuchsia-500/30",
		iconColor: "text-fuchsia-600",
	},
	[DocumentCategory.Residence]: {
		icon: Home,
		label: "Résidence",
		labelEn: "Residence",
		gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
		shadowColor: "shadow-emerald-500/30",
		iconColor: "text-emerald-600",
	},
	[DocumentCategory.Education]: {
		icon: GraduationCap,
		label: "Éducation",
		labelEn: "Education",
		gradient: "bg-gradient-to-br from-amber-300 to-orange-500",
		shadowColor: "shadow-amber-500/30",
		iconColor: "text-amber-600",
	},
	[DocumentCategory.Work]: {
		icon: Briefcase,
		label: "Travail",
		labelEn: "Work",
		gradient: "bg-gradient-to-br from-sky-400 to-blue-600",
		shadowColor: "shadow-sky-500/30",
		iconColor: "text-sky-600",
	},
	[DocumentCategory.Health]: {
		icon: Heart,
		label: "Santé",
		labelEn: "Health",
		gradient: "bg-gradient-to-br from-rose-400 to-red-600",
		shadowColor: "shadow-rose-500/30",
		iconColor: "text-rose-600",
	},
	[DocumentCategory.Vehicle]: {
		icon: Car,
		label: "Véhicule",
		labelEn: "Vehicle",
		gradient: "bg-gradient-to-br from-slate-400 to-gray-600",
		shadowColor: "shadow-slate-500/30",
		iconColor: "text-slate-600",
	},
	[DocumentCategory.Other]: {
		icon: File,
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
	category?: DocumentCategory;
	description?: string;
	expiresAt?: number;
	storageId: Id<"_storage">;
	_creationTime: number;
	updatedAt?: number;
};

// Documents classified as "Other" will be displayed at root level
// Others will be in folders
const ROOT_FILES_CATEGORY = DocumentCategory.Other;

function VaultPage() {
	const { t } = useTranslation();
	const [currentFolder, setCurrentFolder] = useState<DocumentCategory | null>(
		null,
	);
	const [showUpload, setShowUpload] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

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
		// Root view: Show only "Other" docs as files
		return doc.category === ROOT_FILES_CATEGORY;
	});

	// Folders to display at root
	const visibleFolders = Object.values(DocumentCategory).filter(
		(cat) => cat !== ROOT_FILES_CATEGORY,
	);

	const getCategoryCount = (cat: DocumentCategory) => {
		return stats?.byCategory[cat] ?? 0;
	};

	const handleFolderClick = (cat: DocumentCategory) => {
		setCurrentFolder(cat);
		setSearchQuery(""); // Clear search when navigating
	};

	const handleBack = () => {
		setCurrentFolder(null);
		setSearchQuery("");
	};

	return (
		<div className="flex flex-col h-[calc(100vh-6rem)] bg-background">
			{/* Toolbar */}
			<div className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="flex items-center gap-4 flex-1">
					{currentFolder ? (
						<div className="flex items-center gap-2 text-lg font-medium">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleBack}
								className="mr-1 -ml-2"
							>
								<ArrowLeft className="h-5 w-5" />
							</Button>
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
								onClick={handleBack}
							>
								{t("vault.title", "Coffre-fort")}
							</button>
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
							<span className="flex items-center gap-2">
								{(() => {
									const ConfigIcon = CATEGORY_CONFIG[currentFolder].icon;
									return (
										<ConfigIcon
											className={cn(
												"h-5 w-5",
												CATEGORY_CONFIG[currentFolder].iconColor,
											)}
										/>
									);
								})()}
								{CATEGORY_CONFIG[currentFolder].label}
							</span>
						</div>
					) : (
						<h1 className="text-2xl font-bold flex items-center gap-2">
							{t("vault.title", "Coffre-fort")}
						</h1>
					)}
				</div>

				<div className="flex items-center gap-3">
					<div className="relative w-64 hidden sm:block">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("common.search", "Rechercher...")}
							className="pl-9 h-9 bg-background/50"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Dialog open={showUpload} onOpenChange={setShowUpload}>
						<DialogTrigger asChild>
							<Button className="gap-2 shadow-sm">
								<Plus className="h-4 w-4" />
								{t("vault.upload", "Ajouter")}
							</Button>
						</DialogTrigger>
						<UploadDialog
							defaultCategory={currentFolder ?? DocumentCategory.Other}
							onClose={() => setShowUpload(false)}
						/>
					</Dialog>
				</div>
			</div>

			<ScrollArea className="flex-1 px-6 py-6">
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
							className="space-y-8"
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

							{/* Files List */}
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
											<FileCard key={doc._id} document={doc as VaultDocument} />
										))}
									</div>
								)}
							</section>
						</motion.div>
					)}
				</AnimatePresence>
			</ScrollArea>
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
	category: DocumentCategory;
	label: string;
	count: number;
	config: (typeof CATEGORY_CONFIG)[DocumentCategory];
	onClick: () => void;
}) {
	return (
		<motion.button
			type="button"
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			// V3: Wallet Design - Square & contained
			className="group relative w-full max-w-[180px] aspect-square mx-auto focus:outline-none"
		>
			{/* External white border/container effect like the reference */}
			<div className="absolute inset-0 bg-white rounded-[2rem] shadow-sm ring-1 ring-black/5" />

			{/* The colored wallet content - slightly inset */}
			<div className="absolute inset-1.5 rounded-[1.7rem] overflow-hidden bg-muted/20">
				{/* 1. Background (Top part visible behind cards) */}
				<div className={cn("absolute inset-0", config.gradient)} />

				{/* 2. Peeking Cards (The "Inserts") */}
				<div className="absolute inset-0 overflow-hidden">
					{/* Card 1 - Rotated Left */}
					<div
						className="absolute top-4 left-4 w-20 h-24 bg-white/90 rounded-lg shadow-sm transform -rotate-12 transition-transform group-hover:-translate-y-2 group-hover:-rotate-15 duration-300"
						style={{ transformOrigin: "bottom center" }}
					>
						{/* Fake content lines */}
						<div className="mt-8 mx-2 h-1.5 bg-gray-200 rounded-full w-12" />
						<div className="mt-2 mx-2 h-1.5 bg-gray-200 rounded-full w-8" />
					</div>

					{/* Card 2 - Rotated Right */}
					<div
						className="absolute top-4 right-6 w-20 h-24 bg-white/95 rounded-md shadow-sm transform rotate-6 transition-transform group-hover:-translate-y-3 group-hover:rotate-12 duration-300 z-10"
						style={{ transformOrigin: "bottom center" }}
					>
						{/* Maybe an icon or mini preview */}
						<div className="flex items-center justify-center h-full text-muted-foreground/20">
							<config.icon className="h-8 w-8" />
						</div>
					</div>
				</div>

				{/* 3. Front Pocket (The "Wallet") */}
				<div className="absolute inset-x-0 bottom-0 top-[35%] z-20">
					{/* The pocket shape itself */}
					<div
						className={cn(
							"absolute inset-0 rounded-t-[1.5rem]",
							config.gradient,
							"shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]", // Shadow casting UP on the cards
						)}
					>
						{/* Frosted / Texture overlay */}
						<div className="absolute inset-0 bg-white/10 mix-blend-overlay" />

						{/* STITCHING EFFECT - Dashed border on top */}
						<div className="absolute inset-x-4 top-0 border-t-2 border-dashed border-white/20 h-px" />
					</div>

					{/* Content Inside Pocket */}
					<div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
						{/* Top Left Label */}
						<span className="font-medium text-sm tracking-wide opacity-90">
							{label}
						</span>

						{/* Bottom Area: Big Number & Label */}
						<div className="flex items-end justify-between">
							<div className="flex items-baseline gap-1.5">
								<span className="text-4xl font-bold tracking-tight">
									{count}
								</span>
								<span className="text-xs font-medium opacity-80 mb-1.5 uppercase tracking-wider">
									{count > 1 ? "Docs" : "Doc"}
								</span>
							</div>

							{/* Small stats or arrow */}
							<div className="mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
								<ChevronRight className="h-4 w-4" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.button>
	);
}

function FileCard({ document }: { document: VaultDocument }) {
	const { t } = useTranslation();
	const getUrl = useMutation(api.functions.documents.getUrl);
	const { mutate: remove } = useConvexMutationQuery(
		api.functions.documentVault.removeFromVault,
	);

	const category = document.category ?? DocumentCategory.Other;
	const config = CATEGORY_CONFIG[category];

	const isExpired = document.expiresAt && document.expiresAt < Date.now();
	const isExpiringSoon =
		document.expiresAt &&
		document.expiresAt < Date.now() + 30 * 24 * 60 * 60 * 1000 &&
		!isExpired;

	const handleDownload = async () => {
		try {
			const url = await getUrl({ storageId: document.storageId });
			if (url) window.open(url, "_blank");
		} catch {
			toast.error(t("common.error", "Erreur"));
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
		<Card className="group hover:shadow-md transition-shadow overflow-hidden border-border/50">
			<CardContent className="p-0">
				<div className="flex items-center p-3 gap-3">
					{/* Icon Preview - now a proper text-colored box */}
					<button
						type="button"
						className={cn(
							"h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-105",
						)}
						onClick={handleDownload}
					>
						<FileText className={cn("h-6 w-6", config.iconColor)} />
					</button>

					{/* Content */}
					<button
						type="button"
						className="flex-1 min-w-0 text-left"
						onClick={handleDownload}
					>
						<div className="flex items-center justify-between mb-0.5">
							<p className="font-medium text-sm truncate pr-2">
								{document.filename}
							</p>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>{formatSize(document.sizeBytes)}</span>
							<span>•</span>
							<span>
								{formatDistanceToNow(document._creationTime, {
									locale: fr,
									addSuffix: true,
								})}
							</span>
						</div>
					</button>

					{/* Actions */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleDownload}>
								<Download className="h-4 w-4 mr-2" />
								{t("common.download", "Télécharger")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								{t("common.delete", "Supprimer")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Footer Info (Expiration / Category Tag) */}
				<div className="bg-muted/30 px-3 py-2 flex items-center justify-between border-t border-border/50">
					<div className="flex items-center gap-1.5">
						<div
							className={cn(
								"w-2 h-2 rounded-full",
								config.gradient, // Use the gradient for the dot now
							)}
						/>
						<span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">
							{config.label}
						</span>
					</div>

					{document.expiresAt && (
						<div
							className={cn(
								"flex items-center gap-1 text-[10px]",
								isExpired
									? "text-destructive font-medium"
									: isExpiringSoon
										? "text-amber-600 font-medium"
										: "text-muted-foreground",
							)}
						>
							<Clock className="h-3 w-3" />
							{format(document.expiresAt, "dd/MM/yyyy")}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function UploadDialog({
	defaultCategory,
	onClose,
}: {
	defaultCategory: DocumentCategory;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const generateUploadUrl = useMutation(
		api.functions.documents.generateUploadUrl,
	);
	const { mutate: addToVault, isPending } = useConvexMutationQuery(
		api.functions.documentVault.addToVault,
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
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
			const uploadUrl = await generateUploadUrl();
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
						onValueChange={(v) => setCategory(v as DocumentCategory)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
								<SelectItem key={cat} value={cat}>
									<div className="flex items-center gap-2">
										<config.icon className={cn("h-4 w-4", config.textColor)} />
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
