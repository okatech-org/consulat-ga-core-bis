"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Briefcase,
	FileText,
	Image as ImageIcon,
	Mail,
	MapPin,
	Phone,
	ShieldAlert,
	User,
	Users,
	Wand2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

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
	const { t } = useTranslation();

	const { data: profile } = useAuthenticatedConvexQuery(
		api.functions.profiles.getByUserId,
		{ userId },
	);

	// Custom query to get the identity photo document
	const identityPhotoId = profile?.documents?.identityPhoto;
	const { data: identityPhotoDoc } = useAuthenticatedConvexQuery(
		api.functions.documents.getById,
		identityPhotoId ? { documentId: identityPhotoId } : "skip", // Wait for profile
	);

	const { data: identityPhotoUrl } = useAuthenticatedConvexQuery(
		api.functions.documents.getUrl,
		identityPhotoDoc?.files[0]?.storageId
			? { storageId: identityPhotoDoc.files[0].storageId }
			: "skip",
	);

	const [isRemovingBg, setIsRemovingBg] = useState(false);
	const removeBackgroundAction = useAction(
		api.functions.backgroundRemoval.removeBackgroundFromFile,
	);
	const generateUploadUrl = useMutation(
		api.functions.documents.generateUploadUrl,
	);
	const addFileToDoc = useMutation(api.functions.documents.addFile);
	const removeFileFromDoc = useMutation(api.functions.documents.removeFile);

	const handleRemoveBackground = async () => {
		if (!identityPhotoUrl || !identityPhotoDoc || !identityPhotoDoc.files[0])
			return;

		try {
			setIsRemovingBg(true);

			// 1. Fetch the image and convert to base64
			const response = await fetch(identityPhotoUrl);
			const blob = await response.blob();
			const reader = new FileReader();

			const base64Promise = new Promise<string>((resolve, reject) => {
				reader.onloadend = () =>
					resolve((reader.result as string).split(",")[1]);
				reader.onerror = reject;
			});
			reader.readAsDataURL(blob);
			const base64String = await base64Promise;

			// 2. Call Convex background removal action
			const result = await removeBackgroundAction({
				fileBase64: base64String,
				fileName: identityPhotoDoc.files[0].filename,
			});

			if (!result.success || !result.imageUrl) {
				throw new Error(result.error || "Échec du détourage");
			}

			// 3. Convert dataUrl back to a File
			const uploadResponse = await fetch(result.imageUrl);
			const processedBlob = await uploadResponse.blob();
			const processedFile = new File(
				[processedBlob],
				`nobg_${identityPhotoDoc.files[0].filename.replace(/\.[^/.]+$/, "")}.png`,
				{ type: "image/png" },
			);

			// 4. Upload to Convex Storage
			const postUrl = await generateUploadUrl();
			const storageResponse = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": processedFile.type },
				body: processedFile,
			});

			if (!storageResponse.ok) {
				throw new Error("Échec de l'upload de la nouvelle image");
			}

			const { storageId } = await storageResponse.json();

			// 5. Delete old file and add new one to document
			const oldStorageId = identityPhotoDoc.files[0].storageId;

			await addFileToDoc({
				documentId: identityPhotoDoc._id,
				storageId: storageId,
				filename: processedFile.name,
				mimeType: processedFile.type,
				sizeBytes: processedFile.size,
			});

			await removeFileFromDoc({
				documentId: identityPhotoDoc._id,
				storageId: oldStorageId,
			});

			toast.success("L'arrière-plan a été supprimé avec succès.");
		} catch (error) {
			console.error("Error removing background:", error);
			toast.error(
				"Impossible de supprimer l'arrière-plan. Vérifiez la clé API Remove.bg.",
			);
		} finally {
			setIsRemovingBg(false);
		}
	};

	// Helper functions
	const getGenderLabel = (code?: string) =>
		code ? t(`enums.gender.${code}`, code) : undefined;
	const getCountryLabel = (code?: string) =>
		code ? t(`countryList.${code}`, code) : undefined;
	const getMaritalStatusLabel = (code?: string) =>
		code ? t(`enums.maritalStatus.${code}`, code) : undefined;
	const getNationalityAcquisitionLabel = (code?: string) =>
		code ? t(`enums.nationalityAcquisition.${code}`, code) : undefined;
	const getWorkStatusLabel = (code?: string) =>
		code ? t(`enums.workStatus.${code}`, code) : undefined;

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
					<SheetTitle className="text-lg">
						{t("profile.profileDetails")}
					</SheetTitle>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto">
					{profile === undefined ? (
						<ProfileSkeleton />
					) : !profile ? (
						<div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
							<User className="h-16 w-16 mb-4 opacity-20" />
							<p className="text-lg font-medium">{t("common.error")}</p>
							<p className="text-sm mt-1">{t("settings.notFound")}</p>
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
								{/* Identity Photo Section */}
								{identityPhotoUrl && (
									<Section
										icon={ImageIcon}
										title={t("documents.identityPhoto")}
									>
										<div className="flex items-start gap-6">
											<div className="relative w-32 h-32 rounded-lg border bg-muted overflow-hidden flex-shrink-0">
												<img
													src={identityPhotoUrl}
													alt="Identification"
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="flex-1 space-y-3">
												<p className="text-sm text-muted-foreground">
													{t("documents.identityPhoto")}
												</p>
												<Button
													onClick={handleRemoveBackground}
													disabled={isRemovingBg}
													variant="secondary"
													size="sm"
												>
													{isRemovingBg ? (
														<span className="animate-pulse">...</span>
													) : (
														<>
															<Wand2 className="h-4 w-4 mr-2" />
															Détourer la photo (IA)
														</>
													)}
												</Button>
											</div>
										</div>
									</Section>
								)}
								{/* Identity Section */}
								<Section icon={User} title={t("profile.sections.identity")}>
									<div className="grid grid-cols-2 gap-4">
										<InfoItem
											label={t("profile.fields.firstName")}
											value={profile.identity?.firstName}
										/>
										<InfoItem
											label={t("profile.fields.lastName")}
											value={profile.identity?.lastName}
										/>
										{profile.identity?.nip && (
											<InfoItem
												label={t("profile.fields.nipCode")}
												value={profile.identity.nip}
											/>
										)}
										<InfoItem
											label={t("profile.fields.birthDate")}
											value={formatDate(profile.identity?.birthDate)}
										/>
										<InfoItem
											label={t("profile.fields.birthPlace")}
											value={profile.identity?.birthPlace}
										/>
										<InfoItem
											label={t("profile.fields.birthCountry")}
											value={getCountryLabel(profile.identity?.birthCountry)}
										/>
										<InfoItem
											label={t("profile.fields.gender")}
											value={getGenderLabel(profile.identity?.gender)}
										/>
										<InfoItem
											label={t("profile.fields.nationality")}
											value={getCountryLabel(profile.identity?.nationality)}
										/>
										{profile.identity?.nationalityAcquisition && (
											<InfoItem
												label={t(
													"documentTypes.types.nationality_acquisition_declaration",
												)}
												value={getNationalityAcquisitionLabel(
													profile.identity.nationalityAcquisition,
												)}
											/>
										)}
									</div>
								</Section>

								{/* Contact Section */}
								<Section icon={Phone} title={t("profile.sections.contact")}>
									<div className="space-y-6">
										{/* Coordonnées principales */}
										<div>
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
												{t("profile.sections.contact")}
											</p>
											<div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
												<InfoItem
													label={t("profile.fields.email")}
													value={profile.contacts?.email}
													icon={<Mail className="h-3.5 w-3.5" />}
												/>
												<InfoItem
													label={t("profile.fields.phone")}
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
													{t("profile.emergency.title")}
												</p>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													{profile.contacts?.emergencyResidence && (
														<div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
															<p className="text-xs font-medium text-destructive mb-3 uppercase tracking-wide">
																{t("profile.emergency.residence")}
															</p>
															<div className="space-y-3">
																<InfoItem
																	label={t("profile.sections.identity")}
																	value={`${profile.contacts.emergencyResidence.firstName} ${profile.contacts.emergencyResidence.lastName}`}
																/>
																<InfoItem
																	label={t("profile.fields.phone")}
																	value={
																		profile.contacts.emergencyResidence.phone
																	}
																	icon={<Phone className="h-3.5 w-3.5" />}
																/>
																{profile.contacts.emergencyResidence.email && (
																	<InfoItem
																		label={t("profile.fields.email")}
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
																{t("profile.emergency.homeland")}
															</p>
															<div className="space-y-3">
																<InfoItem
																	label={t("profile.sections.identity")}
																	value={`${profile.contacts.emergencyHomeland.firstName} ${profile.contacts.emergencyHomeland.lastName}`}
																/>
																<InfoItem
																	label={t("profile.fields.phone")}
																	value={
																		profile.contacts.emergencyHomeland.phone
																	}
																	icon={<Phone className="h-3.5 w-3.5" />}
																/>
																{profile.contacts.emergencyHomeland.email && (
																	<InfoItem
																		label={t("profile.fields.email")}
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
									<Section
										icon={MapPin}
										title={t("profile.sections.addresses")}
									>
										<div className="space-y-4">
											{profile.addresses?.residence && (
												<div className="bg-muted/50 rounded-lg p-4">
													<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
														{t("profile.sections.addressAbroad")}
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
														{t("profile.sections.addressHome")}
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
									<Section icon={Users} title={t("profile.sections.family")}>
										<div className="grid grid-cols-2 gap-4">
											<InfoItem
												label={t("profile.fields.maritalStatus")}
												value={getMaritalStatusLabel(
													profile.family.maritalStatus,
												)}
											/>
											{profile.family.spouse && (
												<InfoItem
													label={t("profile.relationship.spouse")}
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
													label={t("profile.relationship.father")}
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
													label={t("profile.relationship.mother")}
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
									<Section
										icon={FileText}
										title={t("profile.sections.passport")}
									>
										<div className="grid grid-cols-2 gap-4">
											<InfoItem
												label={t("profile.passport.number")}
												value={profile.passportInfo.number}
											/>
											<InfoItem
												label={t("profile.passport.issueDate")}
												value={formatDate(profile.passportInfo.issueDate)}
											/>
											<InfoItem
												label={t("profile.passport.expiryDate")}
												value={formatDate(profile.passportInfo.expiryDate)}
											/>
											<InfoItem
												label={t("profile.passport.issuingAuthority")}
												value={profile.passportInfo.issuingAuthority}
											/>
										</div>
									</Section>
								)}

								{/* Profession Section */}
								{(!!profile.profession?.title ||
									!!profile.profession?.status ||
									!!profile.profession?.employer) && (
									<Section
										icon={Briefcase}
										title={t("profile.sections.profession")}
									>
										<div className="grid grid-cols-2 gap-4">
											{profile.profession.status && (
												<InfoItem
													label={t("profile.profession.status")}
													value={getWorkStatusLabel(profile.profession.status)}
												/>
											)}
											<InfoItem
												label={t("profile.profession.title")}
												value={profile.profession.title}
											/>
											<InfoItem
												label={t("profile.profession.title")}
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
