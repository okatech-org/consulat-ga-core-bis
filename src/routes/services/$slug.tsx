import { api } from "@convex/_generated/api";
import { ServiceCategory } from "@convex/lib/validators";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ArrowLeft,
	BookOpen,
	BookOpenCheck,
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	FileCheck,
	FileText,
	FileWarning,
	Globe,
	Loader2,
	type LucideIcon,
	MapPin,
	ShieldAlert,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NearbyOrgs } from "@/components/NearbyOrgs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserCountry } from "@/hooks/useUserCountry";
import { getLocalizedValue } from "@/lib/i18n-utils";

export const Route = createFileRoute("/services/$slug")({
	component: ServiceDetailPage,
});

const categoryConfig: Record<
	string,
	{ icon: LucideIcon; color: string; bgColor: string }
> = {
	[ServiceCategory.Identity]: {
		icon: BookOpenCheck,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-500/10",
	},
	[ServiceCategory.Visa]: {
		icon: Globe,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-500/10",
	},
	[ServiceCategory.CivilStatus]: {
		icon: FileText,
		color: "text-yellow-600 dark:text-yellow-400",
		bgColor: "bg-yellow-500/10",
	},
	[ServiceCategory.Registration]: {
		icon: BookOpen,
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-500/10",
	},
	[ServiceCategory.Certification]: {
		icon: FileCheck,
		color: "text-orange-600 dark:text-orange-400",
		bgColor: "bg-orange-500/10",
	},
	[ServiceCategory.Assistance]: {
		icon: ShieldAlert,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-500/10",
	},
	[ServiceCategory.Other]: {
		icon: FileText,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-500/10",
	},
};

const categoryLabels: Record<string, string> = {
	[ServiceCategory.Identity]: "Passeport",
	[ServiceCategory.Visa]: "Visa",
	[ServiceCategory.CivilStatus]: "État Civil",
	[ServiceCategory.Registration]: "Inscription Consulaire",
	[ServiceCategory.Certification]: "Légalisation",
	[ServiceCategory.Assistance]: "Assistance d'Urgence",
	[ServiceCategory.Other]: "Autre",
};

function ServiceDetailPage() {
	const { t, i18n } = useTranslation();
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const service = useQuery(api.functions.services.getBySlug, { slug });

	// Get user's country for service availability check
	const { country: userCountry, isLoading: countryLoading } = useUserCountry();

	// Check if service is available online for user's country
	const availability = useQuery(
		api.functions.services.getServiceAvailabilityByCountry,
		service && userCountry ? { serviceId: service._id, userCountry } : "skip",
	);

	const isLoading = service === undefined;
	const isAvailableOnline = availability?.isAvailable === true;
	const availabilityLoading =
		countryLoading || (userCountry && availability === undefined);

	const handleDownloadForm = () => {
		toast.success(t("services.modal.formDownloaded", "Formulaire téléchargé"), {
			description: t(
				"services.modal.formDownloadedDesc",
				"Le formulaire a été téléchargé avec succès.",
			),
		});
	};

	const handleCreateRequest = () => {
		// Navigate to citizen request form for this service
		navigate({ to: "/my-space/services/$slug/new", params: { slug } });
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-6 py-12">
					<Skeleton className="h-8 w-32 mb-8" />
					<div className="flex items-start gap-6 mb-8">
						<Skeleton className="h-16 w-16 rounded-xl" />
						<div className="flex-1 space-y-3">
							<Skeleton className="h-8 w-2/3" />
							<Skeleton className="h-5 w-24" />
						</div>
					</div>
					<Skeleton className="h-4 w-full mb-2" />
					<Skeleton className="h-4 w-full mb-2" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>
		);
	}

	if (!service) {
		return (
			<div className="min-h-screen bg-background flex flex-col">
				<div className="flex-1 flex items-center justify-center px-6">
					<div className="text-center">
						<FileWarning className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
						<h1 className="text-2xl font-bold mb-2">
							{t("services.notFound", "Service non trouvé")}
						</h1>
						<p className="text-muted-foreground mb-6">
							{t(
								"services.notFoundDesc",
								"Le service demandé n'existe pas ou a été supprimé.",
							)}
						</p>
						<Button asChild>
							<Link to="/services">
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t("services.backToServices", "Retour aux services")}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const config =
		categoryConfig[service.category] || categoryConfig[ServiceCategory.Other];
	const Icon = config.icon;
	const categoryLabel = categoryLabels[service.category] || service.category;
	const serviceName = getLocalizedValue(service.name, i18n.language);
	const serviceDescription = getLocalizedValue(
		service.description,
		i18n.language,
	);
	const serviceContent = service.content
		? getLocalizedValue(service.content, i18n.language)
		: null;

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="flex-1">
				{/* Header */}
				<section className="bg-gradient-to-b from-primary/10 to-background py-12 px-6">
					<div className="max-w-4xl mx-auto">
						<Button asChild variant="ghost" size="sm" className="mb-6">
							<Link to="/services">
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t("services.backToServices", "Retour aux services")}
							</Link>
						</Button>

						<div className="flex items-start gap-6">
							<div
								className={`p-4 rounded-2xl ${config.bgColor} ${config.color}`}
							>
								<Icon className="w-10 h-10" />
							</div>
							<div className="flex-1">
								<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
									{serviceName}
								</h1>
								<div className="flex flex-wrap gap-2">
									<Badge
										variant="secondary"
										className={`${config.bgColor} ${config.color}`}
									>
										{categoryLabel}
									</Badge>
									{service.estimatedDays && (
										<Badge variant="outline" className="gap-1">
											<Clock className="h-3 w-3" />
											{service.estimatedDays}{" "}
											{t("services.days", {
												count: service.estimatedDays,
												defaultValue: "jour(s)",
											})}
										</Badge>
									)}
									{service.requiresAppointment && (
										<Badge
											variant="outline"
											className="gap-1 bg-amber-50 text-amber-700 border-amber-200"
										>
											<Calendar className="h-3 w-3" />
											{t("services.appointmentRequired", "Rendez-vous requis")}
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Content */}
				<section className="py-12 px-6">
					<div className="max-w-4xl mx-auto space-y-8">
						{/* Description */}
						<Card>
							<CardHeader>
								<CardTitle>
									{t("services.descriptionTitle", "Description")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-foreground leading-relaxed">
									{serviceDescription}
								</p>
							</CardContent>
						</Card>

						{/* Detailed Content (HTML) */}
						{serviceContent && (
							<Card>
								<CardHeader>
									<CardTitle>
										{t("services.detailsTitle", "Informations détaillées")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div
										className="prose prose-sm dark:prose-invert max-w-none"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: <Needed for the feature>
										dangerouslySetInnerHTML={{ __html: serviceContent }}
									/>
								</CardContent>
							</Card>
						)}

						{/* Eligible beneficiaries */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5 text-muted-foreground" />
									{t(
										"services.modal.eligibleBeneficiaries",
										"Bénéficiaires éligibles",
									)}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									<Badge
										variant="secondary"
										className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									>
										<CheckCircle2 className="h-3 w-3" />
										{t("services.modal.citizens", "Citoyens gabonais")}
									</Badge>
									<Badge
										variant="secondary"
										className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
									>
										<CheckCircle2 className="h-3 w-3" />
										{t("services.modal.residents", "Résidents à l'étranger")}
									</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Required Documents */}
						{service.joinedDocuments && service.joinedDocuments.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-5 w-5 text-muted-foreground" />
										{t("services.requiredDocuments", "Documents requis")} (
										{service.joinedDocuments.length})
									</CardTitle>
									<CardDescription>
										{t(
											"services.documentsDesc",
											"Les documents suivants sont nécessaires pour cette demande.",
										)}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{service.joinedDocuments.map(
											(
												doc: {
													type: string;
													label: { fr: string; en?: string };
													required: boolean;
												},
												index: number,
											) => (
												<li
													key={service.slug}
													className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
												>
													<div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
														{index + 1}
													</div>
													<span className="flex-1 text-sm font-medium">
														{getLocalizedValue(doc.label, i18n.language)}
													</span>
													{doc.required && (
														<Badge
															variant="destructive"
															className="text-xs shrink-0"
														>
															{t("services.required", "Obligatoire")}
														</Badge>
													)}
												</li>
											),
										)}
									</ul>
								</CardContent>
							</Card>
						)}

						<Separator />

						{/* Actions */}
						<Card className="border-primary/20 bg-primary/5">
							<CardHeader>
								<CardTitle>{t("services.actions", "Actions")}</CardTitle>
								<CardDescription>
									{t(
										"services.actionsDesc",
										"Téléchargez le formulaire ou faites une demande en ligne.",
									)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col sm:flex-row gap-3">
									<Button
										variant="outline"
										className="flex-1 gap-2"
										onClick={handleDownloadForm}
									>
										<Download className="h-4 w-4" />
										{t(
											"services.modal.downloadForm",
											"Télécharger le formulaire",
										)}
									</Button>

									{/* Conditional Request Button */}
									{availabilityLoading ? (
										<Button className="flex-1 gap-2" disabled>
											<Loader2 className="h-4 w-4 animate-spin" />
											{t("services.checkingAvailability", "Vérification...")}
										</Button>
									) : isAvailableOnline ? (
										<Button
											className="flex-1 gap-2"
											onClick={handleCreateRequest}
										>
											<FileText className="h-4 w-4" />
											{t("services.modal.createRequest", "Faire une demande")}
										</Button>
									) : (
										<div className="flex-1 flex items-center justify-center gap-2 p-3 rounded-md bg-muted/50 text-muted-foreground text-sm text-center">
											<MapPin className="h-4 w-4 shrink-0" />
											<span>
												{t(
													"services.notAvailableOnline",
													"Non disponible en ligne pour votre pays",
												)}
											</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Important Info */}
						<div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
							<p className="font-medium text-foreground mb-2">
								{t("services.modal.importantInfo", "Informations importantes")}
							</p>
							<ul className="list-disc list-inside space-y-1">
								<li>
									{t(
										"services.modal.infoPoints.docs",
										"Tous les documents doivent être en cours de validité.",
									)}
								</li>
								<li>
									{t(
										"services.modal.infoPoints.delay",
										"Les délais indiqués sont donnés à titre indicatif.",
									)}
								</li>
								<li>
									{t(
										"services.modal.infoPoints.identity",
										"Une pièce d'identité sera demandée lors du retrait.",
									)}
								</li>
							</ul>
						</div>

						<Separator />

						{/* Nearby Orgs */}
						<NearbyOrgs />
					</div>
				</section>
			</div>
		</div>
	);
}
