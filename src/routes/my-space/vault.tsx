import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { DocumentCategory } from "@convex/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	AlertTriangle,
	Briefcase,
	Calendar,
	Car,
	Clock,
	Download,
	FileText,
	FolderOpen,
	GraduationCap,
	Heart,
	Home,
	Loader2,
	Plus,
	Trash2,
	Upload,
	User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

// Category config with icons and colors
const CATEGORY_CONFIG: Record<
	DocumentCategory,
	{
		icon: React.ElementType;
		label: string;
		labelEn: string;
		color: string;
		bgColor: string;
	}
> = {
	[DocumentCategory.Identity]: {
		icon: User,
		label: "Identité",
		labelEn: "Identity",
		color: "text-blue-600",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	[DocumentCategory.CivilStatus]: {
		icon: FileText,
		label: "État civil",
		labelEn: "Civil Status",
		color: "text-purple-600",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	[DocumentCategory.Residence]: {
		icon: Home,
		label: "Résidence",
		labelEn: "Residence",
		color: "text-green-600",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	[DocumentCategory.Education]: {
		icon: GraduationCap,
		label: "Éducation",
		labelEn: "Education",
		color: "text-amber-600",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	[DocumentCategory.Work]: {
		icon: Briefcase,
		label: "Travail",
		labelEn: "Work",
		color: "text-indigo-600",
		bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
	},
	[DocumentCategory.Health]: {
		icon: Heart,
		label: "Santé",
		labelEn: "Health",
		color: "text-rose-600",
		bgColor: "bg-rose-100 dark:bg-rose-900/30",
	},
	[DocumentCategory.Vehicle]: {
		icon: Car,
		label: "Véhicule",
		labelEn: "Vehicle",
		color: "text-slate-600",
		bgColor: "bg-slate-100 dark:bg-slate-900/30",
	},
	[DocumentCategory.Other]: {
		icon: FolderOpen,
		label: "Autres",
		labelEn: "Other",
		color: "text-gray-600",
		bgColor: "bg-gray-100 dark:bg-gray-900/30",
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
};

function VaultPage() {
	const { t } = useTranslation();
	const [selectedCategory, setSelectedCategory] =
		useState<DocumentCategory | null>(null);
	const [showUpload, setShowUpload] = useState(false);

	const { data: documents, isPending } = useAuthenticatedConvexQuery(
		api.functions.documentVault.getMyVault,
		{},
	);
	const { data: stats } = useAuthenticatedConvexQuery(
		api.functions.documentVault.getStats,
		{},
	);
	const { data: expiring } = useAuthenticatedConvexQuery(
		api.functions.documentVault.getExpiring,
		{ daysAhead: 30 },
	);

	// Filter documents by selected category
	const filteredDocs = selectedCategory
		? (documents ?? []).filter((d) => d.category === selectedCategory)
		: (documents ?? []);

	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="flex items-start justify-between gap-4"
			>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<FolderOpen className="h-6 w-6 text-primary" />
						{t("vault.title", "Coffre-fort Documents")}
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{t(
							"vault.description",
							"Stockez et organisez vos documents personnels en toute sécurité",
						)}
					</p>
				</div>
				<Dialog open={showUpload} onOpenChange={setShowUpload}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Upload className="h-4 w-4" />
							{t("vault.upload", "Ajouter")}
						</Button>
					</DialogTrigger>
					<UploadDialog onClose={() => setShowUpload(false)} />
				</Dialog>
			</motion.div>

			{/* Stats Cards */}
			{stats && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2, delay: 0.1 }}
					className="grid gap-4 grid-cols-2 md:grid-cols-4"
				>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-primary/10">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold">{stats.total}</p>
									<p className="text-xs text-muted-foreground">
										{t("vault.stats.total", "Documents")}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
									<Clock className="h-5 w-5 text-amber-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{stats.expiringSoon}</p>
									<p className="text-xs text-muted-foreground">
										{t("vault.stats.expiring", "Expirent bientôt")}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
									<AlertTriangle className="h-5 w-5 text-rose-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{stats.expired}</p>
									<p className="text-xs text-muted-foreground">
										{t("vault.stats.expired", "Expirés")}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
									<FolderOpen className="h-5 w-5 text-green-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">
										{Object.keys(stats.byCategory).length}
									</p>
									<p className="text-xs text-muted-foreground">
										{t("vault.stats.categories", "Catégories")}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Expiration Alerts */}
			{expiring && expiring.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2, delay: 0.15 }}
				>
					<Alert
						variant="destructive"
						className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
					>
						<AlertTriangle className="h-4 w-4 text-amber-600" />
						<AlertTitle className="text-amber-800 dark:text-amber-200">
							{t("vault.expiring.title", "Documents à renouveler")}
						</AlertTitle>
						<AlertDescription className="text-amber-700 dark:text-amber-300">
							{t(
								"vault.expiring.description",
								"{{count}} document(s) expirent dans les 30 prochains jours",
								{ count: expiring.length },
							)}
						</AlertDescription>
					</Alert>
				</motion.div>
			)}

			{/* Category Grid */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.2 }}
			>
				<h2 className="text-lg font-semibold mb-3">
					{t("vault.categories", "Catégories")}
				</h2>
				<div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
					{Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
						const category = cat as DocumentCategory;
						const count = stats?.byCategory[category] ?? 0;
						const isSelected = selectedCategory === category;
						const Icon = config.icon;

						return (
							<button
								key={category}
								type="button"
								onClick={() =>
									setSelectedCategory(isSelected ? null : category)
								}
								className={cn(
									"flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
									"hover:scale-105 hover:shadow-md",
									isSelected
										? "ring-2 ring-primary shadow-md"
										: "bg-card border",
									config.bgColor,
								)}
							>
								<Icon className={cn("h-8 w-8", config.color)} />
								<span className="text-sm font-medium text-center">
									{config.label}
								</span>
								<Badge variant="secondary" className="text-xs">
									{count}
								</Badge>
							</button>
						);
					})}
				</div>
			</motion.div>

			{/* Documents List */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.25 }}
			>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold">
						{selectedCategory
							? CATEGORY_CONFIG[selectedCategory].label
							: t("vault.allDocuments", "Tous les documents")}
					</h2>
					{selectedCategory && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedCategory(null)}
						>
							{t("vault.showAll", "Voir tout")}
						</Button>
					)}
				</div>

				{isPending ? (
					<div className="flex justify-center p-8">
						<Loader2 className="animate-spin h-8 w-8 text-primary" />
					</div>
				) : filteredDocs.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
							<h3 className="font-semibold text-lg mb-2">
								{t("vault.empty.title", "Aucun document")}
							</h3>
							<p className="text-muted-foreground text-sm max-w-md mb-4">
								{selectedCategory
									? t(
											"vault.empty.category",
											"Aucun document dans cette catégorie",
										)
									: t(
											"vault.empty.description",
											"Ajoutez vos premiers documents pour les conserver en toute sécurité",
										)}
							</p>
							<Button onClick={() => setShowUpload(true)} className="gap-2">
								<Plus className="h-4 w-4" />
								{t("vault.upload", "Ajouter")}
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{filteredDocs.map((doc) => (
							<DocumentCard key={doc._id} document={doc as VaultDocument} />
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
}

function DocumentCard({ document }: { document: VaultDocument }) {
	const { t } = useTranslation();
	const getUrl = useMutation(api.functions.documents.getUrl);
	const { mutate: remove } = useConvexMutationQuery(
		api.functions.documentVault.removeFromVault,
	);

	const [isDownloading, setIsDownloading] = useState(false);

	const category = document.category ?? DocumentCategory.Other;
	const config = CATEGORY_CONFIG[category];
	const Icon = config.icon;

	const isExpired = document.expiresAt && document.expiresAt < Date.now();
	const isExpiringSoon =
		document.expiresAt &&
		document.expiresAt < Date.now() + 30 * 24 * 60 * 60 * 1000 &&
		!isExpired;

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			const url = await getUrl({ id: document._id });
			if (url) {
				window.open(url, "_blank");
			}
		} catch {
			toast.error(t("common.error", "Erreur"));
		} finally {
			setIsDownloading(false);
		}
	};

	const handleRemove = () => {
		remove(
			{ id: document._id },
			{
				onSuccess: () => toast.success(t("vault.removed", "Document supprimé")),
				onError: () => toast.error(t("common.error", "Erreur")),
			},
		);
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<Card
			className={cn(
				"group hover:shadow-md transition-shadow",
				isExpired && "border-rose-300 dark:border-rose-700",
				isExpiringSoon &&
					!isExpired &&
					"border-amber-300 dark:border-amber-700",
			)}
		>
			<CardHeader className="pb-2">
				<div className="flex items-start gap-3">
					<div className={cn("p-2 rounded-lg", config.bgColor)}>
						<Icon className={cn("h-5 w-5", config.color)} />
					</div>
					<div className="flex-1 min-w-0">
						<CardTitle className="text-sm font-medium truncate">
							{document.filename}
						</CardTitle>
						<div className="flex items-center gap-2 mt-1">
							<Badge variant="secondary" className="text-xs">
								{config.label}
							</Badge>
							<span className="text-xs text-muted-foreground">
								{formatFileSize(document.sizeBytes)}
							</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				{document.description && (
					<p className="text-xs text-muted-foreground line-clamp-2">
						{document.description}
					</p>
				)}

				{/* Expiration */}
				{document.expiresAt && (
					<div
						className={cn(
							"flex items-center gap-2 text-xs",
							isExpired
								? "text-rose-600"
								: isExpiringSoon
									? "text-amber-600"
									: "text-muted-foreground",
						)}
					>
						<Calendar className="h-3.5 w-3.5" />
						{isExpired ? (
							<span>
								{t("vault.expired", "Expiré le {{date}}", {
									date: format(document.expiresAt, "dd/MM/yyyy"),
								})}
							</span>
						) : (
							<span>
								{t("vault.expiresIn", "Expire {{when}}", {
									when: formatDistanceToNow(document.expiresAt, {
										locale: fr,
										addSuffix: true,
									}),
								})}
							</span>
						)}
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-2 pt-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={handleDownload}
						disabled={isDownloading}
					>
						{isDownloading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Download className="h-4 w-4" />
						)}
						<span className="ml-1">{t("common.download", "Télécharger")}</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRemove}
						className="text-destructive hover:text-destructive"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function UploadDialog({ onClose }: { onClose: () => void }) {
	const { t } = useTranslation();
	const generateUploadUrl = useMutation(
		api.functions.documents.generateUploadUrl,
	);
	const { mutate: addToVault, isPending } = useConvexMutationQuery(
		api.functions.documentVault.addToVault,
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [category, setCategory] = useState<DocumentCategory>(
		DocumentCategory.Other,
	);
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
			// 1. Get upload URL
			const uploadUrl = await generateUploadUrl();
			setUploadProgress(30);

			// 2. Upload file
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});
			setUploadProgress(70);

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await response.json();
			setUploadProgress(90);

			// 3. Add to vault
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
			toast.error(t("common.error", "Erreur lors de l'upload"));
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
				{/* File Input */}
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
						className="w-full h-24 border-dashed"
						onClick={() => fileInputRef.current?.click()}
					>
						{file ? (
							<div className="flex flex-col items-center gap-1">
								<FileText className="h-6 w-6 text-primary" />
								<span className="text-sm font-medium">{file.name}</span>
								<span className="text-xs text-muted-foreground">
									{(file.size / 1024).toFixed(1)} KB
								</span>
							</div>
						) : (
							<div className="flex flex-col items-center gap-1 text-muted-foreground">
								<Upload className="h-6 w-6" />
								<span className="text-sm">
									{t("vault.upload.dropzone", "Cliquez pour sélectionner")}
								</span>
								<span className="text-xs">PDF, JPG, PNG, DOC</span>
							</div>
						)}
					</Button>
				</div>

				{/* Category */}
				<div className="space-y-2">
					<Label>{t("vault.upload.category", "Catégorie")} *</Label>
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
										<config.icon className={cn("h-4 w-4", config.color)} />
										{config.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Description */}
				<div className="space-y-2">
					<Label>{t("vault.upload.description", "Description")}</Label>
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Ex: Passeport gabonais"
					/>
				</div>

				{/* Expiration */}
				<div className="space-y-2">
					<Label>{t("vault.upload.expiresAt", "Date d'expiration")}</Label>
					<Input
						type="date"
						value={expiresAt}
						onChange={(e) => setExpiresAt(e.target.value)}
					/>
				</div>

				{/* Progress */}
				{uploading && (
					<div className="space-y-2">
						<Progress value={uploadProgress} />
						<p className="text-xs text-center text-muted-foreground">
							{t("vault.uploading", "Upload en cours...")}
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onClick={onClose}>
						{t("common.cancel", "Annuler")}
					</Button>
					<Button
						type="button"
						onClick={handleUpload}
						disabled={!file || uploading || isPending}
					>
						{(uploading || isPending) && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						{t("vault.upload.submit", "Ajouter")}
					</Button>
				</div>
			</div>
		</DialogContent>
	);
}
