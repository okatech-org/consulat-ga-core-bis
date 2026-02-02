import type { Id } from "@convex/_generated/dataModel";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DocumentField } from "@/components/documents/DocumentField";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// Document configuration for profile - matches profile.documents schema keys
const PROFILE_DOCUMENTS = [
	{
		key: "passport" as const,
		labelKey: "profile.documents.passport",
		defaultLabel: "Passeport en cours de validité",
		descriptionKey: "profile.documents.passportDesc",
		defaultDescription: "Copie des pages d'identité de votre passeport",
		required: true,
	},
	{
		key: "proofOfAddress" as const,
		labelKey: "profile.documents.proofOfAddress",
		defaultLabel: "Justificatif de domicile",
		descriptionKey: "profile.documents.proofOfAddressDesc",
		defaultDescription: "Facture récente (moins de 3 mois)",
		required: true,
	},
	{
		key: "identityPhoto" as const,
		labelKey: "profile.documents.identityPhoto",
		defaultLabel: "Photo d'identité",
		descriptionKey: "profile.documents.identityPhotoDesc",
		defaultDescription: "Photo récente format passeport",
		required: true,
	},
	{
		key: "birthCertificate" as const,
		labelKey: "profile.documents.birthCertificate",
		defaultLabel: "Acte de naissance",
		descriptionKey: "profile.documents.birthCertificateDesc",
		defaultDescription: "Copie intégrale ou extrait avec filiation",
		required: false,
	},
	{
		key: "proofOfResidency" as const,
		labelKey: "profile.documents.proofOfResidency",
		defaultLabel: "Titre de séjour",
		descriptionKey: "profile.documents.proofOfResidencyDesc",
		defaultDescription: "Titre de séjour en cours de validité",
		required: false,
	},
];

// Type matching profile.documents schema
interface ProfileDocuments {
	passport?: Id<"documents">;
	identityPhoto?: Id<"documents">;
	proofOfAddress?: Id<"documents">;
	birthCertificate?: Id<"documents">;
	proofOfResidency?: Id<"documents">;
}

interface DocumentsStepProps {
	/** The profile ID for document ownership */
	profileId: Id<"profiles">;
	/** Current documents object from profile */
	documents?: ProfileDocuments;
	/** Callback when a document is uploaded or deleted */
	onDocumentChange?: (
		key: keyof ProfileDocuments,
		documentId: Id<"documents"> | undefined,
	) => void;
}

/**
 * DocumentsStep - Step component for profile wizard document management
 *
 * Uses DocumentField components for each document type.
 * Documents are stored in profile.documents as a typed object.
 */
export function DocumentsStep({
	profileId,
	documents,
	onDocumentChange,
}: DocumentsStepProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						{t("profile.documents.title", "Documents officiels")}
					</CardTitle>
					<CardDescription>
						{t(
							"profile.documents.description",
							"Téléversez vos documents officiels. Ils seront automatiquement rattachés à vos futures demandes.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{PROFILE_DOCUMENTS.map((doc) => (
						<DocumentField
							key={doc.key}
							profileId={profileId}
							documentKey={doc.key}
							documentId={documents?.[doc.key]}
							label={`${t(doc.labelKey, doc.defaultLabel)}${doc.required ? " *" : ""}`}
							description={t(doc.descriptionKey, doc.defaultDescription)}
							onChange={(newId) => onDocumentChange?.(doc.key, newId)}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
