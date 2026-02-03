import { api } from "@convex/_generated/api";
import { LanguageLevel, SkillLevel } from "@convex/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import {
	Award,
	Briefcase,
	Building2,
	Calendar,
	Edit,
	Eye,
	EyeOff,
	Globe,
	GraduationCap,
	Languages,
	Loader2,
	Mail,
	MapPin,
	Phone,
	Plus,
	Save,
	Sparkles,
	Trash2,
	User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/my-space/cv")({
	component: CVPage,
});

// Types matching backend schema
type Experience = {
	title: string;
	company: string;
	location?: string;
	startDate: string;
	endDate?: string;
	current: boolean;
	description?: string;
};

type Education = {
	degree: string;
	school: string;
	location?: string;
	startDate: string;
	endDate?: string;
	current: boolean;
	description?: string;
};

type Skill = {
	name: string;
	level: SkillLevel;
};

type Language = {
	name: string;
	level: LanguageLevel;
};

type CV = {
	email?: string;
	phone?: string;
	address?: string;
	summary?: string;
	experiences: Experience[];
	education: Education[];
	skills: Skill[];
	languages: Language[];
	portfolioUrl?: string;
	linkedinUrl?: string;
	isPublic?: boolean;
} | null;

function CVPage() {
	const { t } = useTranslation();
	const { data: cv, isPending } = useAuthenticatedConvexQuery(
		api.functions.cv.getMine,
		{},
	);
	const { mutate: upsert, isPending: isSaving } = useConvexMutationQuery(
		api.functions.cv.upsert,
	);
	const { mutate: toggleVisibility } = useConvexMutationQuery(
		api.functions.cv.toggleVisibility,
	);

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		phone: "",
		address: "",
		summary: "",
		portfolioUrl: "",
		linkedinUrl: "",
	});

	// Initialize form data when cv loads
	if (cv && !isEditing && formData.email !== cv.email) {
		setFormData({
			email: cv.email ?? "",
			phone: cv.phone ?? "",
			address: cv.address ?? "",
			summary: cv.summary ?? "",
			portfolioUrl: cv.portfolioUrl ?? "",
			linkedinUrl: cv.linkedinUrl ?? "",
		});
	}

	const handleSaveInfo = () => {
		upsert(formData, {
			onSuccess: () => {
				toast.success(t("cv.saved", "CV enregistré"));
				setIsEditing(false);
			},
			onError: () => toast.error(t("common.error", "Une erreur est survenue")),
		});
	};

	const handleToggleVisibility = () => {
		toggleVisibility(
			{},
			{
				onSuccess: () => {
					toast.success(
						cv?.isPublic
							? t("cv.nowPrivate", "CV maintenant privé")
							: t("cv.nowPublic", "CV maintenant public"),
					);
				},
			},
		);
	};

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
			>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Sparkles className="h-6 w-6 text-primary" />
						{t("cv.title", "Mon iCV")}
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{t("cv.subtitle", "Votre CV numérique intelligent")}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={handleToggleVisibility}
						className="gap-2"
					>
						{cv?.isPublic ? (
							<>
								<EyeOff className="h-4 w-4" />
								{t("cv.makePrivate", "Rendre privé")}
							</>
						) : (
							<>
								<Eye className="h-4 w-4" />
								{t("cv.makePublic", "Rendre public")}
							</>
						)}
					</Button>
					{isEditing ? (
						<Button onClick={handleSaveInfo} disabled={isSaving}>
							{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							<Save className="h-4 w-4 mr-2" />
							{t("common.save", "Enregistrer")}
						</Button>
					) : (
						<Button onClick={() => setIsEditing(true)}>
							<Edit className="h-4 w-4 mr-2" />
							{t("common.edit", "Modifier")}
						</Button>
					)}
				</div>
			</motion.div>

			{/* Status Badge */}
			{cv && (
				<Badge
					variant="outline"
					className={
						cv.isPublic
							? "bg-green-500/10 text-green-500 border-green-500/30"
							: ""
					}
				>
					{cv.isPublic
						? t("cv.public", "🌐 Public")
						: t("cv.private", "🔒 Privé")}
				</Badge>
			)}

			<Tabs defaultValue="info" className="space-y-4">
				<TabsList>
					<TabsTrigger value="info" className="gap-2">
						<User className="h-4 w-4" />
						{t("cv.tabs.info", "Informations")}
					</TabsTrigger>
					<TabsTrigger value="experience" className="gap-2">
						<Briefcase className="h-4 w-4" />
						{t("cv.tabs.experience", "Expérience")}
					</TabsTrigger>
					<TabsTrigger value="education" className="gap-2">
						<GraduationCap className="h-4 w-4" />
						{t("cv.tabs.education", "Formation")}
					</TabsTrigger>
					<TabsTrigger value="skills" className="gap-2">
						<Award className="h-4 w-4" />
						{t("cv.tabs.skills", "Compétences")}
					</TabsTrigger>
				</TabsList>

				{/* Info Tab */}
				<TabsContent value="info">
					<InfoSection
						cv={cv ?? null}
						isEditing={isEditing}
						formData={formData}
						setFormData={setFormData}
					/>
				</TabsContent>

				{/* Experience Tab */}
				<TabsContent value="experience">
					<ExperienceSection cv={cv ?? null} />
				</TabsContent>

				{/* Education Tab */}
				<TabsContent value="education">
					<EducationSection cv={cv ?? null} />
				</TabsContent>

				{/* Skills Tab */}
				<TabsContent value="skills">
					<SkillsSection cv={cv ?? null} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

function InfoSection({
	cv,
	isEditing,
	formData,
	setFormData,
}: {
	cv: CV;
	isEditing: boolean;
	formData: {
		email: string;
		phone: string;
		address: string;
		summary: string;
		portfolioUrl: string;
		linkedinUrl: string;
	};
	setFormData: (data: typeof formData) => void;
}) {
	const { t } = useTranslation();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<User className="h-5 w-5 text-primary" />
						{t("cv.info.title", "Informations personnelles")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{isEditing ? (
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>{t("cv.info.email", "Email")}</Label>
								<Input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="jean.dupont@email.com"
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("cv.info.phone", "Téléphone")}</Label>
								<Input
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									placeholder="+33 6 12 34 56 78"
								/>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label>{t("cv.info.address", "Adresse")}</Label>
								<Input
									value={formData.address}
									onChange={(e) =>
										setFormData({ ...formData, address: e.target.value })
									}
									placeholder="75 Avenue des Champs-Élysées, 75008 Paris"
								/>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label>{t("cv.info.summary", "Résumé")}</Label>
								<Textarea
									value={formData.summary}
									onChange={(e) =>
										setFormData({ ...formData, summary: e.target.value })
									}
									placeholder="Décrivez votre parcours en quelques phrases..."
									rows={4}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("cv.info.linkedin", "LinkedIn")}</Label>
								<Input
									value={formData.linkedinUrl}
									onChange={(e) =>
										setFormData({ ...formData, linkedinUrl: e.target.value })
									}
									placeholder="https://linkedin.com/in/..."
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("cv.info.portfolio", "Portfolio")}</Label>
								<Input
									value={formData.portfolioUrl}
									onChange={(e) =>
										setFormData({ ...formData, portfolioUrl: e.target.value })
									}
									placeholder="https://..."
								/>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{cv?.summary && (
								<p className="text-muted-foreground italic">{cv.summary}</p>
							)}
							<div className="grid gap-3 md:grid-cols-2">
								{cv?.email && (
									<div className="flex items-center gap-2 text-sm">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<span>{cv.email}</span>
									</div>
								)}
								{cv?.phone && (
									<div className="flex items-center gap-2 text-sm">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span>{cv.phone}</span>
									</div>
								)}
								{cv?.address && (
									<div className="flex items-center gap-2 text-sm md:col-span-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span>{cv.address}</span>
									</div>
								)}
								{cv?.linkedinUrl && (
									<div className="flex items-center gap-2 text-sm">
										<Globe className="h-4 w-4 text-muted-foreground" />
										<a
											href={cv.linkedinUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											LinkedIn
										</a>
									</div>
								)}
							</div>
							{!cv?.email && !cv?.phone && !cv?.summary && (
								<p className="text-muted-foreground text-sm">
									{t(
										"cv.info.empty",
										"Aucune information. Cliquez sur Modifier pour ajouter vos informations.",
									)}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

function ExperienceSection({ cv }: { cv: CV }) {
	const { t } = useTranslation();
	const { mutate: addExperience, isPending } = useConvexMutationQuery(
		api.functions.cv.addExperience,
	);
	const { mutate: removeExperience } = useConvexMutationQuery(
		api.functions.cv.removeExperience,
	);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		company: "",
		location: "",
		startDate: "",
		endDate: "",
		current: false,
		description: "",
	});

	const handleAdd = () => {
		addExperience(
			{
				title: formData.title,
				company: formData.company,
				startDate: formData.startDate,
				current: formData.current,
				location: formData.location || undefined,
				endDate: formData.endDate || undefined,
				description: formData.description || undefined,
			},
			{
				onSuccess: () => {
					toast.success(t("cv.experience.added", "Expérience ajoutée"));
					setIsAddDialogOpen(false);
					setFormData({
						title: "",
						company: "",
						location: "",
						startDate: "",
						endDate: "",
						current: false,
						description: "",
					});
				},
			},
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Briefcase className="h-5 w-5 text-primary" />
						{t("cv.experience.title", "Expériences professionnelles")}
					</CardTitle>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-1" />
								{t("cv.experience.add", "Ajouter")}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{t("cv.experience.add.title", "Ajouter une expérience")}
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 mt-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>{t("cv.experience.form.title", "Poste")} *</Label>
										<Input
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											placeholder="Développeur React"
										/>
									</div>
									<div className="space-y-2">
										<Label>
											{t("cv.experience.form.company", "Entreprise")} *
										</Label>
										<Input
											value={formData.company}
											onChange={(e) =>
												setFormData({ ...formData, company: e.target.value })
											}
											placeholder="Acme Inc."
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label>{t("cv.experience.form.location", "Lieu")}</Label>
									<Input
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										placeholder="Paris, France"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>
											{t("cv.experience.form.startDate", "Date de début")} *
										</Label>
										<Input
											type="month"
											value={formData.startDate}
											onChange={(e) =>
												setFormData({ ...formData, startDate: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>
											{t("cv.experience.form.endDate", "Date de fin")}
										</Label>
										<Input
											type="month"
											value={formData.endDate}
											onChange={(e) =>
												setFormData({ ...formData, endDate: e.target.value })
											}
											disabled={formData.current}
										/>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										id="exp-current"
										checked={formData.current}
										onChange={(e) =>
											setFormData({
												...formData,
												current: e.target.checked,
												endDate: "",
											})
										}
										className="rounded border-muted-foreground"
									/>
									<Label htmlFor="exp-current">
										{t("cv.experience.form.current", "Poste actuel")}
									</Label>
								</div>
								<div className="space-y-2">
									<Label>
										{t("cv.experience.form.description", "Description")}
									</Label>
									<Textarea
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										rows={3}
										placeholder="Décrivez vos responsabilités..."
									/>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}
									>
										{t("common.cancel", "Annuler")}
									</Button>
									<Button
										type="button"
										onClick={handleAdd}
										disabled={
											isPending ||
											!formData.title ||
											!formData.company ||
											!formData.startDate
										}
									>
										{isPending && (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										)}
										{t("common.add", "Ajouter")}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{!cv?.experiences || cv.experiences.length === 0 ? (
						<p className="text-muted-foreground text-sm text-center py-8">
							{t(
								"cv.experience.empty",
								"Aucune expérience. Ajoutez votre parcours professionnel.",
							)}
						</p>
					) : (
						<div className="space-y-4">
							{cv.experiences.map((exp, index) => (
								<div
									key={`exp-${exp.company}-${exp.startDate}`}
									className="relative group border-l-2 border-primary/20 pl-4 pb-4 last:pb-0"
								>
									<div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
									<div className="flex items-start justify-between">
										<div>
											<h4 className="font-semibold">{exp.title}</h4>
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<Building2 className="h-3.5 w-3.5" />
												{exp.company}
												{exp.location && <span>• {exp.location}</span>}
											</p>
											<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{exp.startDate} -{" "}
												{exp.current
													? t("cv.experience.current", "Présent")
													: exp.endDate}
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
											onClick={() => removeExperience({ index })}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									{exp.description && (
										<p className="text-sm text-muted-foreground mt-2">
											{exp.description}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

function EducationSection({ cv }: { cv: CV }) {
	const { t } = useTranslation();
	const { mutate: addEducation, isPending } = useConvexMutationQuery(
		api.functions.cv.addEducation,
	);
	const { mutate: removeEducation } = useConvexMutationQuery(
		api.functions.cv.removeEducation,
	);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		degree: "",
		school: "",
		location: "",
		startDate: "",
		endDate: "",
		current: false,
		description: "",
	});

	const handleAdd = () => {
		addEducation(
			{
				degree: formData.degree,
				school: formData.school,
				startDate: formData.startDate,
				current: formData.current,
				location: formData.location || undefined,
				endDate: formData.endDate || undefined,
				description: formData.description || undefined,
			},
			{
				onSuccess: () => {
					toast.success(t("cv.education.added", "Formation ajoutée"));
					setIsAddDialogOpen(false);
					setFormData({
						degree: "",
						school: "",
						location: "",
						startDate: "",
						endDate: "",
						current: false,
						description: "",
					});
				},
			},
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<GraduationCap className="h-5 w-5 text-primary" />
						{t("cv.education.title", "Formation")}
					</CardTitle>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-1" />
								{t("cv.education.add", "Ajouter")}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{t("cv.education.add.title", "Ajouter une formation")}
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label>{t("cv.education.form.degree", "Diplôme")} *</Label>
									<Input
										value={formData.degree}
										onChange={(e) =>
											setFormData({ ...formData, degree: e.target.value })
										}
										placeholder="Master en Informatique"
									/>
								</div>
								<div className="space-y-2">
									<Label>
										{t("cv.education.form.school", "Établissement")} *
									</Label>
									<Input
										value={formData.school}
										onChange={(e) =>
											setFormData({ ...formData, school: e.target.value })
										}
										placeholder="Université de Paris"
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("cv.education.form.location", "Lieu")}</Label>
									<Input
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										placeholder="Paris, France"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>
											{t("cv.education.form.startDate", "Date de début")} *
										</Label>
										<Input
											type="month"
											value={formData.startDate}
											onChange={(e) =>
												setFormData({ ...formData, startDate: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>
											{t("cv.education.form.endDate", "Date de fin")}
										</Label>
										<Input
											type="month"
											value={formData.endDate}
											onChange={(e) =>
												setFormData({ ...formData, endDate: e.target.value })
											}
											disabled={formData.current}
										/>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										id="edu-current"
										checked={formData.current}
										onChange={(e) =>
											setFormData({
												...formData,
												current: e.target.checked,
												endDate: "",
											})
										}
										className="rounded border-muted-foreground"
									/>
									<Label htmlFor="edu-current">
										{t("cv.education.form.current", "En cours")}
									</Label>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}
									>
										{t("common.cancel", "Annuler")}
									</Button>
									<Button
										type="button"
										onClick={handleAdd}
										disabled={
											isPending ||
											!formData.degree ||
											!formData.school ||
											!formData.startDate
										}
									>
										{isPending && (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										)}
										{t("common.add", "Ajouter")}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{!cv?.education || cv.education.length === 0 ? (
						<p className="text-muted-foreground text-sm text-center py-8">
							{t(
								"cv.education.empty",
								"Aucune formation. Ajoutez votre parcours académique.",
							)}
						</p>
					) : (
						<div className="space-y-4">
							{cv.education.map((edu, index) => (
								<div
									key={`edu-${edu.school}-${edu.startDate}`}
									className="relative group border-l-2 border-primary/20 pl-4 pb-4 last:pb-0"
								>
									<div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
									<div className="flex items-start justify-between">
										<div>
											<h4 className="font-semibold">{edu.degree}</h4>
											<p className="text-sm text-muted-foreground">
												{edu.school}
											</p>
											{edu.location && (
												<p className="text-sm text-muted-foreground">
													{edu.location}
												</p>
											)}
											<p className="text-xs text-muted-foreground mt-1">
												{edu.startDate} -{" "}
												{edu.current
													? t("cv.education.ongoing", "En cours")
													: edu.endDate}
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
											onClick={() => removeEducation({ index })}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

function SkillsSection({ cv }: { cv: CV }) {
	const { t } = useTranslation();
	const { mutate: addSkill, isPending: isAddingSkill } = useConvexMutationQuery(
		api.functions.cv.addSkill,
	);
	const { mutate: removeSkill } = useConvexMutationQuery(
		api.functions.cv.removeSkill,
	);
	const { mutate: addLanguage, isPending: isAddingLang } =
		useConvexMutationQuery(api.functions.cv.addLanguage);
	const { mutate: removeLanguage } = useConvexMutationQuery(
		api.functions.cv.removeLanguage,
	);

	const [skillDialogOpen, setSkillDialogOpen] = useState(false);
	const [langDialogOpen, setLangDialogOpen] = useState(false);
	const [skillForm, setSkillForm] = useState({
		name: "",
		level: SkillLevel.Intermediate,
	});
	const [langForm, setLangForm] = useState({
		name: "",
		level: LanguageLevel.B2,
	});

	const skillLevelLabels: Record<SkillLevel, string> = {
		[SkillLevel.Beginner]: t("cv.skill.beginner", "Débutant"),
		[SkillLevel.Intermediate]: t("cv.skill.intermediate", "Intermédiaire"),
		[SkillLevel.Advanced]: t("cv.skill.advanced", "Avancé"),
		[SkillLevel.Expert]: t("cv.skill.expert", "Expert"),
	};

	const langLevelLabels: Record<LanguageLevel, string> = {
		[LanguageLevel.A1]: "A1 - Débutant",
		[LanguageLevel.A2]: "A2 - Élémentaire",
		[LanguageLevel.B1]: "B1 - Intermédiaire",
		[LanguageLevel.B2]: "B2 - Intermédiaire avancé",
		[LanguageLevel.C1]: "C1 - Avancé",
		[LanguageLevel.C2]: "C2 - Maîtrise",
		[LanguageLevel.Native]: t("cv.lang.native", "Natif"),
	};

	const handleAddSkill = () => {
		addSkill(skillForm, {
			onSuccess: () => {
				toast.success(t("cv.skills.added", "Compétence ajoutée"));
				setSkillDialogOpen(false);
				setSkillForm({ name: "", level: SkillLevel.Intermediate });
			},
		});
	};

	const handleAddLanguage = () => {
		addLanguage(langForm, {
			onSuccess: () => {
				toast.success(t("cv.languages.added", "Langue ajoutée"));
				setLangDialogOpen(false);
				setLangForm({ name: "", level: LanguageLevel.B2 });
			},
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
			className="space-y-6"
		>
			{/* Skills */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Award className="h-5 w-5 text-primary" />
						{t("cv.skills.title", "Compétences")}
					</CardTitle>
					<Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-1" />
								{t("cv.skills.add", "Ajouter")}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{t("cv.skills.add.title", "Ajouter une compétence")}
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label>
										{t("cv.skills.form.name", "Nom de la compétence")} *
									</Label>
									<Input
										value={skillForm.name}
										onChange={(e) =>
											setSkillForm({ ...skillForm, name: e.target.value })
										}
										placeholder="React, Python, Gestion de projet..."
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("cv.skills.form.level", "Niveau")} *</Label>
									<Select
										value={skillForm.level}
										onValueChange={(v) =>
											setSkillForm({ ...skillForm, level: v as SkillLevel })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.values(SkillLevel).map((level) => (
												<SelectItem key={level} value={level}>
													{skillLevelLabels[level]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setSkillDialogOpen(false)}
									>
										{t("common.cancel", "Annuler")}
									</Button>
									<Button
										type="button"
										onClick={handleAddSkill}
										disabled={isAddingSkill || !skillForm.name}
									>
										{isAddingSkill && (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										)}
										{t("common.add", "Ajouter")}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{!cv?.skills || cv.skills.length === 0 ? (
						<p className="text-muted-foreground text-sm text-center py-8">
							{t("cv.skills.empty", "Aucune compétence ajoutée.")}
						</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{cv.skills.map((skill, index) => (
								<Badge
									key={`skill-${skill.name}`}
									variant="secondary"
									className="group cursor-pointer pr-1.5"
								>
									{skill.name}
									<span className="text-xs ml-1 text-muted-foreground">
										({skillLevelLabels[skill.level]})
									</span>
									<button
										type="button"
										onClick={() => removeSkill({ index })}
										className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
									>
										<Trash2 className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Languages */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Languages className="h-5 w-5 text-primary" />
						{t("cv.languages.title", "Langues")}
					</CardTitle>
					<Dialog open={langDialogOpen} onOpenChange={setLangDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-1" />
								{t("cv.languages.add", "Ajouter")}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{t("cv.languages.add.title", "Ajouter une langue")}
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label>{t("cv.languages.form.name", "Langue")} *</Label>
									<Input
										value={langForm.name}
										onChange={(e) =>
											setLangForm({ ...langForm, name: e.target.value })
										}
										placeholder="Français, Anglais, Espagnol..."
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("cv.languages.form.level", "Niveau")} *</Label>
									<Select
										value={langForm.level}
										onValueChange={(v) =>
											setLangForm({ ...langForm, level: v as LanguageLevel })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.values(LanguageLevel).map((level) => (
												<SelectItem key={level} value={level}>
													{langLevelLabels[level]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setLangDialogOpen(false)}
									>
										{t("common.cancel", "Annuler")}
									</Button>
									<Button
										type="button"
										onClick={handleAddLanguage}
										disabled={isAddingLang || !langForm.name}
									>
										{isAddingLang && (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										)}
										{t("common.add", "Ajouter")}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{!cv?.languages || cv.languages.length === 0 ? (
						<p className="text-muted-foreground text-sm text-center py-8">
							{t("cv.languages.empty", "Aucune langue ajoutée.")}
						</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{cv.languages.map((lang, index) => (
								<Badge
									key={`lang-${lang.name}`}
									variant="outline"
									className="group cursor-pointer pr-1.5"
								>
									{lang.name}
									<span className="text-xs ml-1 font-semibold text-primary">
										({langLevelLabels[lang.level]})
									</span>
									<button
										type="button"
										onClick={() => removeLanguage({ index })}
										className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
									>
										<Trash2 className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
