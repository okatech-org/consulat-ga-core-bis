"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Briefcase,
	FileText,
	Globe,
	Mail,
	MapPin,
	Phone,
	User,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
							<div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-5 border-b">
								<div className="flex items-center gap-4">
									<Avatar className="h-16 w-16 border-2 border-background shadow-md">
										<AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
											{getInitials()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<h3 className="text-xl font-bold truncate">{fullName}</h3>
										<p className="text-sm text-muted-foreground truncate">
											{profile.contacts?.email || "Email non renseigné"}
										</p>
										<Badge
											variant={
												profile.completionScore >= 80 ? "default" : "secondary"
											}
											className="mt-2"
										>
											Profil complet à {profile.completionScore}%
										</Badge>
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
										<InfoItem
											label="Date de naissance"
											value={formatDate(profile.identity?.birthDate)}
										/>
										<InfoItem
											label="Lieu de naissance"
											value={profile.identity?.birthPlace}
										/>
										<InfoItem
											label="Genre"
											value={getGenderLabel(profile.identity?.gender)}
										/>
										<InfoItem
											label="Nationalité"
											value={getCountryLabel(profile.identity?.nationality)}
										/>
									</div>
								</Section>

								{/* Contact Section */}
								<Section icon={Phone} title="Contact">
									<div className="grid grid-cols-2 gap-4">
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
										{profile.contacts?.phoneAbroad && (
											<InfoItem
												label="Tél. étranger"
												value={profile.contacts.phoneAbroad}
												icon={<Globe className="h-3.5 w-3.5" />}
											/>
										)}
									</div>
								</Section>

								{/* Address Section */}
								{(profile.addresses?.residence ||
									profile.addresses?.homeland) && (
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
								{profile.family &&
									(profile.family.maritalStatus ||
										profile.family.father ||
										profile.family.mother) && (
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
								{profile.profession?.title && (
									<Section icon={Briefcase} title="Profession">
										<div className="grid grid-cols-2 gap-4">
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
