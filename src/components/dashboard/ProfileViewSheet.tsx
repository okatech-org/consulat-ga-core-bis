"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Briefcase,
	FileText,
	Mail,
	MapPin,
	Phone,
	ShieldAlert,
	User,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

// Inline label mappings
const GENDER_LABELS: Record<string, string> = {
	male: "Masculin",
	female: "Féminin",
	other: "Autre",
};

const COUNTRY_LABELS: Record<string, string> = {
	GA: "Gabon",
	FR: "France",
	CM: "Cameroun",
	CG: "Congo",
	CD: "RD Congo",
	SN: "Sénégal",
	CI: "Côte d'Ivoire",
	MA: "Maroc",
	TN: "Tunisie",
	DZ: "Algérie",
	BE: "Belgique",
	CH: "Suisse",
	CA: "Canada",
	US: "États-Unis",
};

const MARITAL_STATUS_LABELS: Record<string, string> = {
	single: "Célibataire",
	married: "Marié(e)",
	divorced: "Divorcé(e)",
	widowed: "Veuf/Veuve",
	pacs: "Pacsé(e)",
};

const NATIONALITY_ACQUISITION_LABELS: Record<string, string> = {
	birth: "Filiation (Naissance)",
	marriage: "Mariage",
	naturalization: "Naturalisation",
	declaration: "Déclaration",
};

const WORK_STATUS_LABELS: Record<string, string> = {
	employee: "Employé(e) / Salarié(e)",
	independent: "Indépendant(e) / Entrepreneur",
	student: "Étudiant(e)",
	retired: "Retraité(e)",
	unemployed: "Sans emploi",
	other: "Autre",
};

interface ProfileViewSheetProps {
	userId: Id<"users">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProfileViewSheet({
	userId,
	open,
	onOpenChange,
}: ProfileViewSheetProps) {
	const { data: profile } = useAuthenticatedConvexQuery(
		api.functions.profiles.getByUserId,
		{ userId },
	);

	// Helper functions
	const getGenderLabel = (code?: string) =>
		code ? GENDER_LABELS[code] || code : undefined;
	const getCountryLabel = (code?: string) =>
		code ? COUNTRY_LABELS[code] || code : undefined;
	const getMaritalStatusLabel = (code?: string) =>
		code ? MARITAL_STATUS_LABELS[code] || code : undefined;
	const getNationalityAcquisitionLabel = (code?: string) =>
		code ? NATIONALITY_ACQUISITION_LABELS[code] || code : undefined;
	const getWorkStatusLabel = (code?: string) =>
		code ? WORK_STATUS_LABELS[code] || code : undefined;

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "—";
		return format(new Date(timestamp), "dd MMMM yyyy", { locale: fr });
	};

	const getInitials = () => {
		const first = profile?.identity?.firstName?.[0] || "";
		const last = profile?.identity?.lastName?.[0] || "";
		return (first + last).toUpperCase() || "?";
	};

	const fullName = profile
		? [profile.identity?.firstName, profile.identity?.lastName]
				.filter(Boolean)
				.join(" ") || "Nom non renseigné"
		: "";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full md:max-w-3xl! p-0 flex flex-col">
				<SheetHeader className="px-6 py-4 border-b bg-muted/30">
					<SheetTitle className="text-lg">Profil du demandeur</SheetTitle>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto">
					{profile === undefined ? (
						<ProfileSkeleton />
					) : !profile ? (
						<div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
							<User className="h-16 w-16 mb-4 opacity-20" />
							<p className="text-lg font-medium">Profil non renseigné</p>
							<p className="text-sm mt-1">
								L'utilisateur n'a pas encore complété son profil
							</p>
						</div>
					) : (
						<>
							{/* Header with avatar - sticky */}
							<div className="sticky top-0 z-20 bg-background px-6 py-5 border-b shadow-sm">
								<div className="flex items-center gap-4">
									<Avatar className="h-16 w-16 border bg-muted shadow-sm">
										<AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
											{getInitials()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<h3 className="text-xl font-bold truncate">{fullName}</h3>
										{profile.contacts?.email && (
											<p className="text-sm text-muted-foreground truncate">
												{profile.contacts.email}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Sections */}
							<div className="px-6 py-5 space-y-6">
								{/* Identity Section */}
								<Section icon={User} title="Identité">
									<div className="grid grid-cols-2 gap-4">
										<InfoItem
											label="Prénom"
											value={profile.identity?.firstName}
										/>
										<InfoItem label="Nom" value={profile.identity?.lastName} />
										{profile.identity?.nip && (
											<InfoItem label="NIP" value={profile.identity.nip} />
										)}
										<InfoItem
											label="Date de naissance"
											value={formatDate(profile.identity?.birthDate)}
										/>
										<InfoItem
											label="Lieu de naissance"
											value={profile.identity?.birthPlace}
										/>
										<InfoItem
											label="Pays de naissance"
											value={getCountryLabel(profile.identity?.birthCountry)}
										/>
										<InfoItem
											label="Genre"
											value={getGenderLabel(profile.identity?.gender)}
										/>
										<InfoItem
											label="Nationalité"
											value={getCountryLabel(profile.identity?.nationality)}
										/>
										{profile.identity?.nationalityAcquisition && (
											<InfoItem
												label="Nationalité (Acquisition)"
												value={getNationalityAcquisitionLabel(
													profile.identity.nationalityAcquisition,
												)}
											/>
										)}
									</div>
								</Section>

								{/* Contact Section */}
								<Section icon={Phone} title="Contacts">
									<div className="space-y-6">
										{/* Coordonnées principales */}
										<div>
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
												Coordonnées principales
											</p>
											<div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
												<InfoItem
													label="Email"
													value={profile.contacts?.email}
													icon={<Mail className="h-3.5 w-3.5" />}
												/>
												<InfoItem
													label="Téléphone"
													value={profile.contacts?.phone}
													icon={<Phone className="h-3.5 w-3.5" />}
												/>
											</div>
										</div>

										{/* Contacts d'urgence */}
										{(profile.contacts?.emergencyResidence ||
											profile.contacts?.emergencyHomeland) && (
											<div>
												<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
													<ShieldAlert className="h-4 w-4 text-destructive" />
													Personnes à prévenir en cas d'urgence
												</p>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													{profile.contacts?.emergencyResidence && (
														<div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
															<p className="text-xs font-medium text-destructive mb-3 uppercase tracking-wide">
																Résidence habituelle
															</p>
															<div className="space-y-3">
																<InfoItem
																	label="Nom complet"
																	value={`${profile.contacts.emergencyResidence.firstName} ${profile.contacts.emergencyResidence.lastName}`}
																/>
																<InfoItem
																	label="Téléphone"
																	value={
																		profile.contacts.emergencyResidence.phone
																	}
																	icon={<Phone className="h-3.5 w-3.5" />}
																/>
																{profile.contacts.emergencyResidence.email && (
																	<InfoItem
																		label="Email"
																		value={
																			profile.contacts.emergencyResidence.email
																		}
																		icon={<Mail className="h-3.5 w-3.5" />}
																	/>
																)}
															</div>
														</div>
													)}

													{profile.contacts?.emergencyHomeland && (
														<div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
															<p className="text-xs font-medium text-destructive mb-3 uppercase tracking-wide">
																Au Gabon
															</p>
															<div className="space-y-3">
																<InfoItem
																	label="Nom complet"
																	value={`${profile.contacts.emergencyHomeland.firstName} ${profile.contacts.emergencyHomeland.lastName}`}
																/>
																<InfoItem
																	label="Téléphone"
																	value={
																		profile.contacts.emergencyHomeland.phone
																	}
																	icon={<Phone className="h-3.5 w-3.5" />}
																/>
																{profile.contacts.emergencyHomeland.email && (
																	<InfoItem
																		label="Email"
																		value={
																			profile.contacts.emergencyHomeland.email
																		}
																		icon={<Mail className="h-3.5 w-3.5" />}
																	/>
																)}
															</div>
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								</Section>

								{/* Address Section */}
								{(!!profile.addresses?.residence ||
									!!profile.addresses?.homeland) && (
									<Section icon={MapPin} title="Adresses">
										<div className="space-y-4">
											{profile.addresses?.residence && (
												<div className="bg-muted/50 rounded-lg p-4">
													<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
														Résidence actuelle
													</p>
													<p className="text-sm">
														{[
															profile.addresses.residence.street,
															profile.addresses.residence.postalCode,
															profile.addresses.residence.city,
															getCountryLabel(
																profile.addresses.residence.country,
															),
														]
															.filter(Boolean)
															.join(", ") || "—"}
													</p>
												</div>
											)}
											{profile.addresses?.homeland && (
												<div className="bg-muted/50 rounded-lg p-4">
													<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
														Adresse au Gabon
													</p>
													<p className="text-sm">
														{[
															profile.addresses.homeland.street,
															profile.addresses.homeland.city,
															getCountryLabel(
																profile.addresses.homeland.country,
															),
														]
															.filter(Boolean)
															.join(", ") || "—"}
													</p>
												</div>
											)}
										</div>
									</Section>
								)}

								{/* Family Section */}
								{(!!profile.family?.maritalStatus ||
									!!profile.family?.father ||
									!!profile.family?.mother ||
									!!profile.family?.spouse) && (
									<Section icon={Users} title="Famille">
										<div className="grid grid-cols-2 gap-4">
											<InfoItem
												label="Situation familiale"
												value={getMaritalStatusLabel(
													profile.family.maritalStatus,
												)}
											/>
											{profile.family.spouse && (
												<InfoItem
													label="Conjoint(e)"
													value={[
														profile.family.spouse.firstName,
														profile.family.spouse.lastName,
													]
														.filter(Boolean)
														.join(" ")}
												/>
											)}
											{profile.family.father && (
												<InfoItem
													label="Père"
													value={[
														profile.family.father.firstName,
														profile.family.father.lastName,
													]
														.filter(Boolean)
														.join(" ")}
												/>
											)}
											{profile.family.mother && (
												<InfoItem
													label="Mère"
													value={[
														profile.family.mother.firstName,
														profile.family.mother.lastName,
													]
														.filter(Boolean)
														.join(" ")}
												/>
											)}
										</div>
									</Section>
								)}

								{/* Passport Section */}
								{profile.passportInfo?.number && (
									<Section icon={FileText} title="Passeport">
										<div className="grid grid-cols-2 gap-4">
											<InfoItem
												label="Numéro"
												value={profile.passportInfo.number}
											/>
											<InfoItem
												label="Délivré le"
												value={formatDate(profile.passportInfo.issueDate)}
											/>
											<InfoItem
												label="Expire le"
												value={formatDate(profile.passportInfo.expiryDate)}
											/>
											<InfoItem
												label="Autorité"
												value={profile.passportInfo.issuingAuthority}
											/>
										</div>
									</Section>
								)}

								{/* Profession Section */}
								{(!!profile.profession?.title ||
									!!profile.profession?.status ||
									!!profile.profession?.employer) && (
									<Section icon={Briefcase} title="Profession">
										<div className="grid grid-cols-2 gap-4">
											{profile.profession.status && (
												<InfoItem
													label="Statut"
													value={getWorkStatusLabel(profile.profession.status)}
												/>
											)}
											<InfoItem
												label="Intitulé"
												value={profile.profession.title}
											/>
											<InfoItem
												label="Employeur"
												value={profile.profession.employer}
											/>
										</div>
									</Section>
								)}
							</div>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}

// Section wrapper component
function Section({
	icon: Icon,
	title,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-card border rounded-xl p-5 shadow-sm">
			<div className="flex items-center gap-2 mb-4 pb-3 border-b">
				<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<h4 className="font-semibold">{title}</h4>
			</div>
			{children}
		</div>
	);
}

// Info item component
function InfoItem({
	label,
	value,
	icon,
}: {
	label: string;
	value?: string | null;
	icon?: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				{label}
			</p>
			<p className="text-sm font-medium flex items-center gap-1.5">
				{icon}
				{value || "—"}
			</p>
		</div>
	);
}

// Loading skeleton
function ProfileSkeleton() {
	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Skeleton className="h-16 w-16 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>
			<Skeleton className="h-40 w-full rounded-xl" />
			<Skeleton className="h-32 w-full rounded-xl" />
			<Skeleton className="h-32 w-full rounded-xl" />
		</div>
	);
}
