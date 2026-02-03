import { api } from "@convex/_generated/api";
import { OrganizationType } from "@convex/lib/constants";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ArrowLeft,
	Building2,
	Clock,
	ExternalLink,
	FileText,
	Globe,
	Mail,
	MapPin,
	Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/orgs/$slug")({
	component: OrgDetailPage,
});

const countryNames: Record<string, string> = {
	FR: "France",
	BE: "Belgique",
	US: "États-Unis",
	GB: "Royaume-Uni",
	DE: "Allemagne",
	ES: "Espagne",
	IT: "Italie",
	CH: "Suisse",
	CA: "Canada",
	GA: "Gabon",
};

const orgTypeLabels: Record<string, string> = {
	[OrganizationType.Consulate]: "Consulat",
	[OrganizationType.HonoraryConsulate]: "Consulat Honoraire",
	[OrganizationType.Embassy]: "Ambassade",
};

const dayNames: Record<string, string> = {
	monday: "Lundi",
	tuesday: "Mardi",
	wednesday: "Mercredi",
	thursday: "Jeudi",
	friday: "Vendredi",
	saturday: "Samedi",
	sunday: "Dimanche",
};

function OrgDetailPage() {
	const { t } = useTranslation();
	const { slug } = Route.useParams();
	const org = useQuery(api.functions.orgs.getBySlug, { slug });

	const isLoading = org === undefined;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-6 py-12">
					<Skeleton className="h-8 w-32 mb-8" />
					<div className="flex items-start gap-6 mb-8">
						<Skeleton className="h-16 w-16 rounded-xl" />
						<div className="flex-1 space-y-3">
							<Skeleton className="h-8 w-2/3" />
							<Skeleton className="h-5 w-40" />
						</div>
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						<Skeleton className="h-48" />
						<Skeleton className="h-48" />
					</div>
				</div>
			</div>
		);
	}

	if (!org) {
		return (
			<div className="min-h-screen bg-background flex flex-col">
				<div className="flex-1 flex items-center justify-center px-6">
					<div className="text-center">
						<Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
						<h1 className="text-2xl font-bold mb-2">
							{t("orgs.notFound", "Représentation non trouvée")}
						</h1>
						<p className="text-muted-foreground mb-6">
							{t(
								"orgs.notFoundDesc",
								"La représentation demandée n'existe pas ou a été supprimée.",
							)}
						</p>
						<Button asChild>
							<Link to="/orgs" search={{ view: "grid" }}>
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t("orgs.backToOrgs", "Retour aux représentations")}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const countryName = countryNames[org.address.country] || org.address.country;
	const typeLabel = orgTypeLabels[org.type] || org.type;
	const isPrimary = org.type === OrganizationType.Embassy;

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="flex-1">
				{/* Header */}
				<section
					className={`py-12 px-6 ${isPrimary ? "bg-primary/10" : "bg-gradient-to-b from-secondary/50 to-background"}`}
				>
					<div className="max-w-4xl mx-auto">
						<Button asChild variant="ghost" size="sm" className="mb-6">
							<Link to="/orgs" search={{ view: "grid" }}>
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t("orgs.backToOrgs", "Retour aux représentations")}
							</Link>
						</Button>

						<div className="flex items-start gap-6">
							<div className="p-4 rounded-2xl bg-primary/10 text-primary">
								<Building2 className="w-10 h-10" />
							</div>
							<div>
								<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
									{org.name}
								</h1>
								<div className="flex items-center gap-3 flex-wrap">
									<Badge
										variant="secondary"
										className="bg-primary/10 text-primary"
									>
										{typeLabel}
									</Badge>
									<span className="text-muted-foreground flex items-center gap-1">
										<MapPin className="w-4 h-4" />
										{org.address.city}, {countryName}
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Content */}
				<section className="py-12 px-6">
					<div className="max-w-4xl mx-auto">
						<div className="grid gap-6 md:grid-cols-2 mb-8">
							{/* Address Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-lg">
										<MapPin className="w-5 h-5 text-primary" />
										{t("orgs.address", "Adresse")}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-1">
									<p>{org.address.street}</p>
									<p>
										{org.address.postalCode} {org.address.city}
									</p>
									<p className="font-medium">{countryName}</p>
								</CardContent>
							</Card>

							{/* Contact Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-lg">
										<Phone className="w-5 h-5 text-primary" />
										{t("orgs.contact", "Contact")}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{org.phone && (
										<div className="flex items-center gap-3">
											<Phone className="w-4 h-4 text-muted-foreground" />
											<a
												href={`tel:${org.phone.replace(/\s/g, "")}`}
												className="text-primary hover:underline"
											>
												{org.phone}
											</a>
										</div>
									)}
									{org.email && (
										<div className="flex items-center gap-3">
											<Mail className="w-4 h-4 text-muted-foreground" />
											<a
												href={`mailto:${org.email}`}
												className="text-primary hover:underline"
											>
												{org.email}
											</a>
										</div>
									)}
									{org.website && (
										<div className="flex items-center gap-3">
											<Globe className="w-4 h-4 text-muted-foreground" />
											<a
												href={org.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline flex items-center gap-1"
											>
												{org.website.replace(/^https?:\/\//, "")}
												<ExternalLink className="w-3 h-3" />
											</a>
										</div>
									)}
									{!org.phone && !org.email && !org.website && (
										<p className="text-muted-foreground">
											{t(
												"orgs.noContact",
												"Aucune information de contact disponible.",
											)}
										</p>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Opening Hours */}
						{org.settings?.workingHours && (
							<Card className="mb-8">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-lg">
										<Clock className="w-5 h-5 text-primary" />
										{t("orgs.openingHours", "Horaires d'ouverture")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{Object.entries(dayNames).map(([key, label]) => {
											const slots = org.settings?.workingHours?.[key];
											return (
												<div key={key} className="text-sm">
													<p className="font-medium">{label}</p>
													<p className="text-muted-foreground">
														{slots && slots.length > 0
															? slots
																	.map((s) => `${s.start} - ${s.end}`)
																	.join(", ")
															: t("orgs.closed", "Fermé")}
													</p>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						)}

						<Separator />

						{/* CTA */}
						<Card className="mt-8 bg-primary/5 border-primary/20">
							<CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
								<div className="flex items-center gap-4">
									<FileText className="w-8 h-8 text-primary" />
									<div>
										<p className="font-semibold text-foreground">
											{t("orgs.discoverServices", "Découvrez nos services")}
										</p>
										<p className="text-sm text-muted-foreground">
											{t(
												"orgs.servicesDesc",
												"Consultez la liste des services consulaires disponibles.",
											)}
										</p>
									</div>
								</div>
								<Button asChild>
									<Link to="/services">
										{t("orgs.viewServices", "Voir les services")}
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</section>
			</div>
		</div>
	);
}
