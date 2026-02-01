import type { FormSection } from "@/components/admin/FormBuilder";

export interface FormTemplate {
	id: string;
	name: { fr: string; en: string };
	description: { fr: string; en: string };
	category: string; // Matches ServiceCategory enum values
	icon: string;
	sections: FormSection[];
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Form templates organized by ServiceCategory
 * Excludes: Passport (handled directly by consulate), Registration (handled directly by consulate)
 */
export const formTemplates: FormTemplate[] = [
	// =====================================================
	// IDENTITY - Cartes d'identité, certificats de nationalité
	// =====================================================
	{
		id: "identity-card",
		name: { fr: "Carte d'identité", en: "Identity Card" },
		description: {
			fr: "Demande de carte nationale d'identité",
			en: "National identity card application",
		},
		category: "identity",
		icon: "CreditCard",
		sections: [
			{
				id: generateId(),
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Sexe", en: "Gender" },
						required: true,
						options: [
							{ value: "male", label: { fr: "Masculin", en: "Male" } },
							{ value: "female", label: { fr: "Féminin", en: "Female" } },
						],
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom du père", en: "Father's Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de la mère", en: "Mother's Name" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Coordonnées", en: "Contact Information" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Adresse", en: "Address" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Ville", en: "City" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Pays de résidence", en: "Country of Residence" },
						required: true,
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},
	{
		id: "nationality-certificate",
		name: { fr: "Certificat de nationalité", en: "Nationality Certificate" },
		description: {
			fr: "Demande de certificat de nationalité gabonaise",
			en: "Gabonese nationality certificate request",
		},
		category: "identity",
		icon: "Award",
		sections: [
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Applicant" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom(s)", en: "Last Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Mode d'acquisition", en: "Acquisition Method" },
						required: true,
						options: [
							{
								value: "birth",
								label: { fr: "Par la naissance", en: "By Birth" },
							},
							{
								value: "naturalization",
								label: { fr: "Par naturalisation", en: "By Naturalization" },
							},
							{
								value: "marriage",
								label: { fr: "Par mariage", en: "By Marriage" },
							},
							{
								value: "filiation",
								label: { fr: "Par filiation", en: "By Filiation" },
							},
						],
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Filiation", en: "Filiation" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom du père", en: "Father's Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nationalité du père", en: "Father's Nationality" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de la mère", en: "Mother's Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nationalité de la mère", en: "Mother's Nationality" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Coordonnées", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// CIVIL STATUS - État civil (naissance, mariage, décès)
	// =====================================================
	{
		id: "birth-certificate",
		name: { fr: "Acte de naissance", en: "Birth Certificate" },
		description: {
			fr: "Demande de copie d'acte de naissance",
			en: "Birth certificate copy request",
		},
		category: "civil_status",
		icon: "Baby",
		sections: [
			{
				id: generateId(),
				title: { fr: "Personne concernée", en: "Person Concerned" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom du père", en: "Father's Name" },
						required: false,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de la mère", en: "Mother's Name" },
						required: false,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Lien avec la personne", en: "Relationship" },
						required: true,
						options: [
							{ value: "self", label: { fr: "Moi-même", en: "Myself" } },
							{ value: "parent", label: { fr: "Parent", en: "Parent" } },
							{ value: "spouse", label: { fr: "Conjoint", en: "Spouse" } },
							{ value: "child", label: { fr: "Enfant", en: "Child" } },
							{
								value: "legal",
								label: { fr: "Représentant légal", en: "Legal Representative" },
							},
						],
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
					{
						id: generateId(),
						type: "number",
						label: { fr: "Nombre de copies", en: "Number of Copies" },
						required: true,
						validation: { min: 1, max: 10 },
					},
				],
			},
		],
	},
	{
		id: "marriage-certificate",
		name: { fr: "Acte de mariage", en: "Marriage Certificate" },
		description: {
			fr: "Demande de copie d'acte de mariage",
			en: "Marriage certificate copy request",
		},
		category: "civil_status",
		icon: "Heart",
		sections: [
			{
				id: generateId(),
				title: {
					fr: "Informations sur le mariage",
					en: "Marriage Information",
				},
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom époux", en: "Husband's Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom épouse", en: "Wife's Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date du mariage", en: "Marriage Date" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu du mariage", en: "Marriage Location" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Qualité", en: "Capacity" },
						required: true,
						options: [
							{ value: "spouse", label: { fr: "Époux/Épouse", en: "Spouse" } },
							{
								value: "child",
								label: { fr: "Enfant du couple", en: "Child of the Couple" },
							},
							{ value: "heir", label: { fr: "Héritier", en: "Heir" } },
							{
								value: "legal",
								label: { fr: "Représentant légal", en: "Legal Representative" },
							},
						],
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},
	{
		id: "death-certificate",
		name: { fr: "Acte de décès", en: "Death Certificate" },
		description: {
			fr: "Demande de copie d'acte de décès",
			en: "Death certificate copy request",
		},
		category: "civil_status",
		icon: "FileX",
		sections: [
			{
				id: generateId(),
				title: { fr: "Personne décédée", en: "Deceased Person" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: false,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date du décès", en: "Date of Death" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu du décès", en: "Place of Death" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Lien avec le défunt", en: "Relationship" },
						required: true,
						options: [
							{
								value: "spouse",
								label: { fr: "Conjoint survivant", en: "Surviving Spouse" },
							},
							{ value: "child", label: { fr: "Enfant", en: "Child" } },
							{ value: "parent", label: { fr: "Parent", en: "Parent" } },
							{ value: "heir", label: { fr: "Héritier", en: "Heir" } },
							{
								value: "legal",
								label: { fr: "Notaire/Avocat", en: "Notary/Lawyer" },
							},
						],
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// VISA - Demandes de visa
	// =====================================================
	{
		id: "visa-tourist",
		name: { fr: "Visa touristique", en: "Tourist Visa" },
		description: {
			fr: "Demande de visa touristique pour le Gabon",
			en: "Tourist visa application for Gabon",
		},
		category: "visa",
		icon: "Globe",
		sections: [
			{
				id: generateId(),
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nationalité", en: "Nationality" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Profession", en: "Occupation" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Passeport", en: "Passport" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Numéro de passeport", en: "Passport Number" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de délivrance", en: "Issue Date" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date d'expiration", en: "Expiry Date" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Autorité de délivrance", en: "Issuing Authority" },
						required: true,
					},
					{
						id: generateId(),
						type: "file",
						label: {
							fr: "Scan du passeport (pages d'identité)",
							en: "Passport scan (identity pages)",
						},
						required: true,
						description: {
							fr: "Pages avec photo et informations personnelles",
							en: "Pages with photo and personal information",
						},
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Détails du voyage", en: "Travel Details" },
				fields: [
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date d'entrée prévue", en: "Intended Entry Date" },
						required: true,
					},
					{
						id: generateId(),
						type: "number",
						label: {
							fr: "Durée du séjour (jours)",
							en: "Duration of Stay (days)",
						},
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Adresse au Gabon", en: "Address in Gabon" },
						required: true,
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Motif du voyage", en: "Purpose of Travel" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Coordonnées", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Adresse actuelle", en: "Current Address" },
						required: true,
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},
	{
		id: "visa-business",
		name: { fr: "Visa d'affaires", en: "Business Visa" },
		description: {
			fr: "Demande de visa d'affaires pour le Gabon",
			en: "Business visa application for Gabon",
		},
		category: "visa",
		icon: "Briefcase",
		sections: [
			{
				id: generateId(),
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nationalité", en: "Nationality" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Profession", en: "Occupation" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Entreprise/Organisation", en: "Company/Organization" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de l'entreprise", en: "Company Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Adresse de l'entreprise", en: "Company Address" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Fonction", en: "Position" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: {
							fr: "Entreprise partenaire au Gabon",
							en: "Partner Company in Gabon",
						},
						required: false,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Détails du voyage", en: "Travel Details" },
				fields: [
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date d'entrée prévue", en: "Intended Entry Date" },
						required: true,
					},
					{
						id: generateId(),
						type: "number",
						label: {
							fr: "Durée du séjour (jours)",
							en: "Duration of Stay (days)",
						},
						required: true,
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Objet de la mission", en: "Purpose of Mission" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Coordonnées", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email professionnel", en: "Professional Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// CERTIFICATION - Légalisations, authentifications
	// =====================================================
	{
		id: "document-legalization",
		name: { fr: "Légalisation de documents", en: "Document Legalization" },
		description: {
			fr: "Demande de légalisation de documents officiels",
			en: "Official document legalization request",
		},
		category: "certification",
		icon: "FileCheck",
		sections: [
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Documents à légaliser", en: "Documents to Legalize" },
				fields: [
					{
						id: generateId(),
						type: "select",
						label: { fr: "Type de document", en: "Document Type" },
						required: true,
						options: [
							{ value: "diploma", label: { fr: "Diplôme", en: "Diploma" } },
							{
								value: "certificate",
								label: { fr: "Certificat", en: "Certificate" },
							},
							{ value: "contract", label: { fr: "Contrat", en: "Contract" } },
							{
								value: "power_of_attorney",
								label: { fr: "Procuration", en: "Power of Attorney" },
							},
							{
								value: "attestation",
								label: { fr: "Attestation", en: "Attestation" },
							},
							{ value: "other", label: { fr: "Autre", en: "Other" } },
						],
					},
					{
						id: generateId(),
						type: "textarea",
						label: {
							fr: "Description du document",
							en: "Document Description",
						},
						required: true,
					},
					{
						id: generateId(),
						type: "number",
						label: { fr: "Nombre de documents", en: "Number of Documents" },
						required: true,
						validation: { min: 1, max: 20 },
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Usage prévu", en: "Intended Use" },
						required: true,
						options: [
							{
								value: "gabon",
								label: { fr: "Usage au Gabon", en: "Use in Gabon" },
							},
							{
								value: "france",
								label: { fr: "Usage en France", en: "Use in France" },
							},
							{
								value: "other",
								label: { fr: "Autre pays", en: "Other Country" },
							},
						],
					},
					{
						id: generateId(),
						type: "file",
						label: {
							fr: "Documents à légaliser (PDF ou images)",
							en: "Documents to legalize (PDF or images)",
						},
						required: true,
						description: {
							fr: "Téléversez les documents à faire légaliser",
							en: "Upload the documents to be legalized",
						},
					},
				],
			},
		],
	},
	{
		id: "signature-certification",
		name: { fr: "Certification de signature", en: "Signature Certification" },
		description: {
			fr: "Certification de conformité de signature",
			en: "Signature conformity certification",
		},
		category: "certification",
		icon: "Pen",
		sections: [
			{
				id: generateId(),
				title: { fr: "Signataire", en: "Signatory" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Numéro de pièce d'identité", en: "ID Number" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Document", en: "Document" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nature du document", en: "Document Nature" },
						required: true,
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Objet", en: "Subject" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Destinataire", en: "Recipient" },
						required: false,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// TRANSCRIPT - Relevés de notes, attestations scolaires
	// =====================================================
	{
		id: "transcript-request",
		name: { fr: "Relevé de notes", en: "Academic Transcript" },
		description: {
			fr: "Demande de relevé de notes ou attestation scolaire",
			en: "Academic transcript or school certificate request",
		},
		category: "transcript",
		icon: "GraduationCap",
		sections: [
			{
				id: generateId(),
				title: { fr: "Étudiant/Élève", en: "Student" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Établissement", en: "Institution" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Années concernées", en: "Years Concerned" },
						required: true,
					},
					{
						id: generateId(),
						type: "select",
						label: { fr: "Niveau d'études", en: "Education Level" },
						required: true,
						options: [
							{ value: "primary", label: { fr: "Primaire", en: "Primary" } },
							{
								value: "secondary",
								label: { fr: "Secondaire", en: "Secondary" },
							},
							{
								value: "university",
								label: { fr: "Universitaire", en: "University" },
							},
							{
								value: "professional",
								label: {
									fr: "Formation professionnelle",
									en: "Professional Training",
								},
							},
						],
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Type de document", en: "Document Type" },
				fields: [
					{
						id: generateId(),
						type: "select",
						label: { fr: "Document demandé", en: "Requested Document" },
						required: true,
						options: [
							{
								value: "transcript",
								label: { fr: "Relevé de notes", en: "Transcript" },
							},
							{
								value: "diploma_copy",
								label: { fr: "Copie de diplôme", en: "Diploma Copy" },
							},
							{
								value: "enrollment",
								label: {
									fr: "Certificat de scolarité",
									en: "Enrollment Certificate",
								},
							},
							{
								value: "graduation",
								label: {
									fr: "Attestation de réussite",
									en: "Graduation Certificate",
								},
							},
						],
					},
					{
						id: generateId(),
						type: "number",
						label: { fr: "Nombre de copies", en: "Number of Copies" },
						required: true,
						validation: { min: 1, max: 5 },
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Motif de la demande", en: "Reason for Request" },
						required: false,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// ASSISTANCE - Urgences, rapatriement, aide sociale
	// =====================================================
	{
		id: "emergency-assistance",
		name: { fr: "Assistance d'urgence", en: "Emergency Assistance" },
		description: {
			fr: "Demande d'assistance consulaire d'urgence",
			en: "Emergency consular assistance request",
		},
		category: "assistance",
		icon: "AlertTriangle",
		sections: [
			{
				id: generateId(),
				title: { fr: "Personne en difficulté", en: "Person in Need" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Numéro de passeport", en: "Passport Number" },
						required: false,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Localisation actuelle", en: "Current Location" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Nature de l'urgence", en: "Nature of Emergency" },
				fields: [
					{
						id: generateId(),
						type: "select",
						label: { fr: "Type d'urgence", en: "Emergency Type" },
						required: true,
						options: [
							{
								value: "medical",
								label: { fr: "Urgence médicale", en: "Medical Emergency" },
							},
							{ value: "accident", label: { fr: "Accident", en: "Accident" } },
							{
								value: "arrest",
								label: { fr: "Arrestation/Détention", en: "Arrest/Detention" },
							},
							{
								value: "victim",
								label: { fr: "Victime d'agression", en: "Victim of Assault" },
							},
							{
								value: "loss",
								label: { fr: "Perte de documents", en: "Loss of Documents" },
							},
							{
								value: "stranded",
								label: { fr: "En situation de détresse", en: "In Distress" },
							},
							{
								value: "death",
								label: { fr: "Décès d'un proche", en: "Death of a Relative" },
							},
							{ value: "other", label: { fr: "Autre", en: "Other" } },
						],
					},
					{
						id: generateId(),
						type: "textarea",
						label: {
							fr: "Description de la situation",
							en: "Situation Description",
						},
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone (urgent)", en: "Phone (urgent)" },
						required: true,
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: false,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Contact en France", en: "Contact in France" },
						required: false,
					},
				],
			},
		],
	},
	{
		id: "repatriation",
		name: { fr: "Aide au rapatriement", en: "Repatriation Assistance" },
		description: {
			fr: "Demande d'aide au rapatriement vers le Gabon",
			en: "Request for repatriation assistance to Gabon",
		},
		category: "assistance",
		icon: "Plane",
		sections: [
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Applicant" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Numéro de passeport", en: "Passport Number" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Adresse actuelle", en: "Current Address" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Motif du rapatriement", en: "Reason for Repatriation" },
				fields: [
					{
						id: generateId(),
						type: "select",
						label: { fr: "Motif", en: "Reason" },
						required: true,
						options: [
							{
								value: "medical",
								label: { fr: "Raisons médicales", en: "Medical Reasons" },
							},
							{
								value: "economic",
								label: {
									fr: "Difficultés économiques",
									en: "Economic Difficulties",
								},
							},
							{
								value: "family",
								label: { fr: "Raisons familiales", en: "Family Reasons" },
							},
							{
								value: "death",
								label: { fr: "Décès d'un proche", en: "Death of a Relative" },
							},
							{ value: "other", label: { fr: "Autre", en: "Other" } },
						],
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Explication détaillée", en: "Detailed Explanation" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Contact au Gabon", en: "Contact in Gabon" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom du contact", en: "Contact Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lien de parenté", en: "Relationship" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone au Gabon", en: "Phone in Gabon" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// TRAVEL DOCUMENT - Laissez-passer, documents de voyage
	// =====================================================
	{
		id: "travel-laissez-passer",
		name: { fr: "Laissez-passer", en: "Emergency Travel Document" },
		description: {
			fr: "Demande de laissez-passer pour voyage d'urgence",
			en: "Emergency travel document (laissez-passer) request",
		},
		category: "travel_document",
		icon: "FileText",
		sections: [
			{
				id: generateId(),
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Motif de la demande", en: "Reason for Request" },
				fields: [
					{
						id: generateId(),
						type: "select",
						label: { fr: "Motif", en: "Reason" },
						required: true,
						options: [
							{
								value: "lost_passport",
								label: { fr: "Perte de passeport", en: "Lost Passport" },
							},
							{
								value: "stolen_passport",
								label: { fr: "Passeport volé", en: "Stolen Passport" },
							},
							{
								value: "expired_passport",
								label: { fr: "Passeport expiré", en: "Expired Passport" },
							},
							{
								value: "emergency_travel",
								label: { fr: "Voyage d'urgence", en: "Emergency Travel" },
							},
						],
					},
					{
						id: generateId(),
						type: "text",
						label: { fr: "Destination", en: "Destination" },
						required: true,
					},
					{
						id: generateId(),
						type: "date",
						label: { fr: "Date de voyage prévue", en: "Planned Travel Date" },
						required: true,
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Détails supplémentaires", en: "Additional Details" },
						required: false,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// OTHER - Autres demandes
	// =====================================================
	{
		id: "general-request",
		name: { fr: "Demande générale", en: "General Request" },
		description: {
			fr: "Formulaire pour toute autre demande consulaire",
			en: "Form for any other consular request",
		},
		category: "other",
		icon: "HelpCircle",
		sections: [
			{
				id: generateId(),
				title: { fr: "Demandeur", en: "Applicant" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: generateId(),
						type: "email",
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: generateId(),
						type: "phone",
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
			{
				id: generateId(),
				title: { fr: "Votre demande", en: "Your Request" },
				fields: [
					{
						id: generateId(),
						type: "text",
						label: { fr: "Objet de la demande", en: "Request Subject" },
						required: true,
					},
					{
						id: generateId(),
						type: "textarea",
						label: { fr: "Description détaillée", en: "Detailed Description" },
						required: true,
					},
				],
			},
		],
	},
];

export function getTemplateById(id: string): FormTemplate | undefined {
	return formTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): FormTemplate[] {
	return formTemplates.filter((t) => t.category === category);
}
