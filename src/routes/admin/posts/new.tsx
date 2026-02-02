"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PostCategory, PostStatus } from "@convex/lib/validators";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import {
	ArrowLeft,
	Calendar,
	CalendarDays,
	FileText,
	MapPin,
	Megaphone,
	Newspaper,
	Ticket,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/common/rich-text-editor";
import { useOrg } from "@/components/org/org-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useConvexMutationQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/posts/new")({
	component: NewPostPage,
});

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

function NewPostPage() {
	const { activeOrgId } = useOrg();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const create = useMutation(api.functions.posts.create);
	const { mutateAsync: generateUploadUrl } = useConvexMutationQuery(
		api.functions.documents.generateUploadUrl,
	)

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [category, setCategory] = useState<
		(typeof PostCategory)[keyof typeof PostCategory]
	>(PostCategory.News);
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [publish, setPublish] = useState(false);

	// Cover image
	const [coverImageStorageId, setCoverImageStorageId] = useState<
		Id<"_storage"> | undefined
	>();
	const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
		null,
	)

	// Event-specific
	const [eventStartAt, setEventStartAt] = useState("");
	const [eventEndAt, setEventEndAt] = useState("");
	const [eventLocation, setEventLocation] = useState("");
	const [eventTicketUrl, setEventTicketUrl] = useState("");

	// Communique-specific
	const [documentStorageId, setDocumentStorageId] = useState<
		Id<"_storage"> | undefined
	>();
	const [documentName, setDocumentName] = useState<string | null>(null);

	const handleTitleChange = (value: string) => {
		setTitle(value);
		if (!slug || slug === slugify(title)) {
			setSlug(slugify(value));
		}
	}

	const handleCoverImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const postUrl = await generateUploadUrl({});
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			})
			if (!result.ok) throw new Error("Upload failed");
			const { storageId } = await result.json();
			setCoverImageStorageId(storageId);
			setCoverImagePreview(URL.createObjectURL(file));
			toast.success(t("dashboard.posts.imageUploaded", "Image téléchargée"));
		} catch {
			toast.error(
				t("dashboard.posts.uploadError", "Erreur lors du téléchargement"),
			)
		}
	}

	const handleDocumentUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const postUrl = await generateUploadUrl({});
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			})
			if (!result.ok) throw new Error("Upload failed");
			const { storageId } = await result.json();
			setDocumentStorageId(storageId);
			setDocumentName(file.name);
			toast.success(
				t("dashboard.posts.documentUploaded", "Document téléchargé"),
			)
		} catch {
			toast.error(
				t("dashboard.posts.uploadError", "Erreur lors du téléchargement"),
			)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!activeOrgId) return;

		if (!title || !slug || !excerpt || !content) {
			toast.error(
				t(
					"dashboard.posts.requiredFields",
					"Veuillez remplir tous les champs obligatoires",
				),
			)
			return
		}

		if (category === PostCategory.Announcement && !documentStorageId) {
			toast.error(
				t(
					"dashboard.posts.documentRequired",
					"Un document PDF est obligatoire pour les communiqués",
				),
			)
			return
		}

		setIsSubmitting(true);
		try {
			await create({
				title,
				slug,
				excerpt,
				content,
				category,
				coverImageStorageId,
				orgId: activeOrgId,
				publish,
				// Event fields
				eventStartAt: eventStartAt
					? new Date(eventStartAt).getTime()
					: undefined,
				eventEndAt: eventEndAt ? new Date(eventEndAt).getTime() : undefined,
				eventLocation: eventLocation || undefined,
				eventTicketUrl: eventTicketUrl || undefined,
				// Communique fields
				documentStorageId,
			})

			toast.success(
				publish
					? t("dashboard.posts.publishedSuccess", "Article publié avec succès")
					: t("dashboard.posts.savedSuccess", "Brouillon enregistré"),
			)
			navigate({ to: "/admin/posts" });
		} catch (err: any) {
			toast.error(err.message || t("common.error", "Une erreur est survenue"));
		} finally {
			setIsSubmitting(false);
		}
	}

	const isEvent = category === PostCategory.Event;
	const isCommunique = category === PostCategory.Announcement;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/admin/posts">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("common.back", "Retour")}
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.posts.new.title", "Nouvelle publication")}
					</h1>
					<p className="text-muted-foreground">
						{t(
							"dashboard.posts.new.description",
							"Créez une actualité, un événement ou un communiqué",
						)}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
				{/* Main content */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								{t("dashboard.posts.form.content", "Contenu")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">
									{t("dashboard.posts.form.title", "Titre")} *
								</Label>
								<Input
									id="title"
									value={title}
									onChange={(e) => handleTitleChange(e.target.value)}
									placeholder={t(
										"dashboard.posts.form.titlePlaceholder",
										"Titre de l'article",
									)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="slug">
									{t("dashboard.posts.form.slug", "Slug (URL)")} *
								</Label>
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">/news/</span>
									<Input
										id="slug"
										value={slug}
										onChange={(e) => setSlug(slugify(e.target.value))}
										placeholder="mon-article"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="excerpt">
									{t("dashboard.posts.form.excerpt", "Résumé")} *
								</Label>
								<Textarea
									id="excerpt"
									value={excerpt}
									onChange={(e) => setExcerpt(e.target.value)}
									placeholder={t(
										"dashboard.posts.form.excerptPlaceholder",
										"Un court résumé qui apparaîtra dans les listes...",
									)}
									rows={3}
								/>
							</div>

							<div className="space-y-2">
								<Label>
									{t("dashboard.posts.form.body", "Corps de l'article")} *
								</Label>
								<RichTextEditor
									content={content}
									onChange={setContent}
									className="min-h-[300px]"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Event-specific fields */}
					{isEvent && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CalendarDays className="h-5 w-5" />
									{t(
										"dashboard.posts.form.eventDetails",
										"Détails de l'événement",
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="eventStartAt">
											<Calendar className="inline mr-2 h-4 w-4" />
											{t("dashboard.posts.form.eventStart", "Date de début")}
										</Label>
										<Input
											id="eventStartAt"
											type="datetime-local"
											value={eventStartAt}
											onChange={(e) => setEventStartAt(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="eventEndAt">
											<Calendar className="inline mr-2 h-4 w-4" />
											{t("dashboard.posts.form.eventEnd", "Date de fin")}
										</Label>
										<Input
											id="eventEndAt"
											type="datetime-local"
											value={eventEndAt}
											onChange={(e) => setEventEndAt(e.target.value)}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="eventLocation">
										<MapPin className="inline mr-2 h-4 w-4" />
										{t("dashboard.posts.form.eventLocation", "Lieu")}
									</Label>
									<Input
										id="eventLocation"
										value={eventLocation}
										onChange={(e) => setEventLocation(e.target.value)}
										placeholder={t(
											"dashboard.posts.form.eventLocationPlaceholder",
											"Adresse ou nom du lieu",
										)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="eventTicketUrl">
										<Ticket className="inline mr-2 h-4 w-4" />
										{t(
											"dashboard.posts.form.eventTicket",
											"Lien billetterie / inscription",
										)}
									</Label>
									<Input
										id="eventTicketUrl"
										type="url"
										value={eventTicketUrl}
										onChange={(e) => setEventTicketUrl(e.target.value)}
										placeholder="https://..."
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Communique-specific fields */}
					{isCommunique && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Megaphone className="h-5 w-5" />
									{t(
										"dashboard.posts.form.communiqueDetails",
										"Document officiel",
									)}
								</CardTitle>
								<CardDescription>
									{t(
										"dashboard.posts.form.communiqueHint",
										"Téléchargez le document PDF officiel (obligatoire)",
									)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="border-2 border-dashed rounded-lg p-6 text-center">
									<input
										type="file"
										accept="application/pdf"
										onChange={handleDocumentUpload}
										className="hidden"
										id="document-upload"
									/>
									{documentName ? (
										<div className="flex items-center justify-center gap-3">
											<FileText className="h-8 w-8 text-emerald-600" />
											<div>
												<p className="font-medium">{documentName}</p>
												<Button
													type="button"
													variant="link"
													size="sm"
													onClick={() =>
														document.getElementById("document-upload")?.click()
													}
												>
													{t("common.change", "Changer")}
												</Button>
											</div>
										</div>
									) : (
										<label htmlFor="document-upload" className="cursor-pointer">
											<Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
											<p className="text-sm text-muted-foreground">
												{t(
													"dashboard.posts.form.uploadDocument",
													"Cliquez pour télécharger un PDF",
												)}
											</p>
										</label>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								{t("dashboard.posts.form.settings", "Paramètres")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>
									{t("dashboard.posts.form.category", "Catégorie")} *
								</Label>
								<Select
									value={category}
									onValueChange={(v) => setCategory(v as any)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={PostCategory.News}>
											<div className="flex items-center gap-2">
												<Newspaper className="h-4 w-4" />
												{t("dashboard.posts.category.news", "Actualité")}
											</div>
										</SelectItem>
										<SelectItem value={PostCategory.Event}>
											<div className="flex items-center gap-2">
												<CalendarDays className="h-4 w-4" />
												{t("dashboard.posts.category.event", "Événement")}
											</div>
										</SelectItem>
										<SelectItem value={PostCategory.Announcement}>
											<div className="flex items-center gap-2">
												<Megaphone className="h-4 w-4" />
												{t(
													"dashboard.posts.category.communique",
													"Communiqué officiel",
												)}
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>
									{t("dashboard.posts.form.coverImage", "Image de couverture")}
								</Label>
								<div className="border-2 border-dashed rounded-lg p-4 text-center">
									<input
										type="file"
										accept="image/*"
										onChange={handleCoverImageUpload}
										className="hidden"
										id="cover-upload"
									/>
									{coverImagePreview ? (
										<div>
											<img
												src={coverImagePreview}
												alt="Cover"
												className="w-full h-32 object-cover rounded mb-2"
											/>
											<Button
												type="button"
												variant="link"
												size="sm"
												onClick={() =>
													document.getElementById("cover-upload")?.click()
												}
											>
												{t("common.change", "Changer")}
											</Button>
										</div>
									) : (
										<label htmlFor="cover-upload" className="cursor-pointer">
											<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
											<p className="text-xs text-muted-foreground">
												{t("dashboard.posts.form.uploadImage", "Télécharger")}
											</p>
										</label>
									)}
								</div>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="publish">
									{t("dashboard.posts.form.publishNow", "Publier maintenant")}
								</Label>
								<Switch
									id="publish"
									checked={publish}
									onCheckedChange={setPublish}
								/>
							</div>
						</CardContent>
					</Card>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting
							? t("common.saving", "Enregistrement...")
							: publish
								? t("dashboard.posts.form.publish", "Publier")
								: t(
										"dashboard.posts.form.saveDraft",
										"Enregistrer le brouillon",
									)}
					</Button>
				</div>
			</form>
		</div>
	)
}
