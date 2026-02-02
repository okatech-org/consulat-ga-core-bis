import { FormFieldType, ServiceCategory } from "@convex/lib/constants";
import type { FormSection } from "@convex/lib/validators";

export interface FormTemplate {
	id: string;
	name: { fr: string; en: string };
	description: { fr: string; en: string };
	category: ServiceCategory;
	icon: string;
	sections: FormSection[];
}

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
		category: ServiceCategory.Identity,
		icon: "CreditCard",
		sections: [
			{
				id: "personal_information",
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: "last_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: "first_name",
						type: FormFieldType.Text,
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "place_of_birth",
						type: FormFieldType.Text,
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: "gender",
						type: FormFieldType.Select,
						label: { fr: "Sexe", en: "Gender" },
						required: true,
						options: [
							{ value: "male", label: { fr: "Masculin", en: "Male" } },
							{ value: "female", label: { fr: "Féminin", en: "Female" } },
						],
					},
					{
						id: "father_name",
						type: FormFieldType.Text,
						label: { fr: "Nom du père", en: "Father's Name" },
						required: true,
					},
					{
						id: "mother_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de la mère", en: "Mother's Name" },
						required: true,
					},
				],
			},
			{
				id: "contact_information",
				title: { fr: "Coordonnées", en: "Contact Information" },
				fields: [
					{
						id: "address",
						type: FormFieldType.Text,
						label: { fr: "Adresse", en: "Address" },
						required: true,
					},
					{
						id: "city",
						type: FormFieldType.Text,
						label: { fr: "Ville", en: "City" },
						required: true,
					},
					{
						id: "country_of_residence",
						type: FormFieldType.Text,
						label: { fr: "Pays de résidence", en: "Country of Residence" },
						required: true,
					},
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Identity,
		icon: "Award",
		sections: [
			{
				id: "applicant",
				title: { fr: "Demandeur", en: "Applicant" },
				fields: [
					{
						id: "last_name",
						type: FormFieldType.Text,
						label: { fr: "Nom(s)", en: "Last Name(s)" },
						required: true,
					},
					{
						id: "first_name",
						type: FormFieldType.Text,
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "place_of_birth",
						type: FormFieldType.Text,
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: "acquisition_method",
						type: FormFieldType.Select,
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
				id: "filiation",
				title: { fr: "Filiation", en: "Filiation" },
				fields: [
					{
						id: "father_name",
						type: FormFieldType.Text,
						label: { fr: "Nom du père", en: "Father's Name" },
						required: true,
					},
					{
						id: "father_nationality",
						type: FormFieldType.Text,
						label: { fr: "Nationalité du père", en: "Father's Nationality" },
						required: true,
					},
					{
						id: "mother_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de la mère", en: "Mother's Name" },
						required: true,
					},
					{
						id: "mother_nationality",
						type: FormFieldType.Text,
						label: { fr: "Nationalité de la mère", en: "Mother's Nationality" },
						required: true,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Coordonnées", en: "Contact" },
				fields: [
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.CivilStatus,
		icon: "Baby",
		sections: [
			{
				id: "person_concerned",
				title: { fr: "Personne concernée", en: "Person Concerned" },
				fields: [
					{
						id: "last_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: "first_name",
						type: FormFieldType.Text,
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "place_of_birth",
						type: FormFieldType.Text,
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: "father_name",
						type: FormFieldType.Text,
						label: { fr: "Nom du père", en: "Father's Name" },
						required: false,
					},
					{
						id: "mother_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de la mère", en: "Mother's Name" },
						required: false,
					},
				],
			},
			{
				id: "requester",
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: "requester_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "relationship",
						type: FormFieldType.Select,
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
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
					{
						id: "number_of_copies",
						type: FormFieldType.Number,
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
		category: ServiceCategory.CivilStatus,
		icon: "Heart",
		sections: [
			{
				id: "marriage_information",
				title: {
					fr: "Informations sur le mariage",
					en: "Marriage Information",
				},
				fields: [
					{
						id: "husband_name",
						type: FormFieldType.Text,
						label: { fr: "Nom époux", en: "Husband's Name" },
						required: true,
					},
					{
						id: "wife_name",
						type: FormFieldType.Text,
						label: { fr: "Nom épouse", en: "Wife's Name" },
						required: true,
					},
					{
						id: "marriage_date",
						type: FormFieldType.Date,
						label: { fr: "Date du mariage", en: "Marriage Date" },
						required: true,
					},
					{
						id: "marriage_location",
						type: FormFieldType.Text,
						label: { fr: "Lieu du mariage", en: "Marriage Location" },
						required: true,
					},
				],
			},
			{
				id: "requester",
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: "requester_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "capacity",
						type: FormFieldType.Select,
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
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.CivilStatus,
		icon: "FileX",
		sections: [
			{
				id: "deceased_person",
				title: { fr: "Personne décédée", en: "Deceased Person" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: false,
					},
					{
						id: "date_of_death",
						type: FormFieldType.Date,
						label: { fr: "Date du décès", en: "Date of Death" },
						required: true,
					},
					{
						id: "place_of_death",
						type: FormFieldType.Text,
						label: { fr: "Lieu du décès", en: "Place of Death" },
						required: true,
					},
				],
			},
			{
				id: "requester",
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: "requester_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "relationship",
						type: FormFieldType.Select,
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
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Visa,
		icon: "Globe",
		sections: [
			{
				id: "personal_information",
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: "last_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: "first_name",
						type: FormFieldType.Text,
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "place_of_birth",
						type: FormFieldType.Text,
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
					{
						id: "nationality",
						type: FormFieldType.Text,
						label: { fr: "Nationalité", en: "Nationality" },
						required: true,
					},
					{
						id: "occupation",
						type: FormFieldType.Text,
						label: { fr: "Profession", en: "Occupation" },
						required: true,
					},
				],
			},
			{
				id: "passport",
				title: { fr: "Passeport", en: "Passport" },
				fields: [
					{
						id: "passport_number",
						type: FormFieldType.Text,
						label: { fr: "Numéro de passeport", en: "Passport Number" },
						required: true,
					},
					{
						id: "passport_issue_date",
						type: FormFieldType.Date,
						label: { fr: "Date de délivrance", en: "Issue Date" },
						required: true,
					},
					{
						id: "passport_expiry_date",
						type: FormFieldType.Date,
						label: { fr: "Date d'expiration", en: "Expiry Date" },
						required: true,
					},
					{
						id: "issuing_authority",
						type: FormFieldType.Text,
						label: { fr: "Autorité de délivrance", en: "Issuing Authority" },
						required: true,
					},
					{
						id: "passport_scan",
						type: FormFieldType.File,
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
				id: "travel_details",
				title: { fr: "Détails du voyage", en: "Travel Details" },
				fields: [
					{
						id: "entry_date",
						type: FormFieldType.Date,
						label: { fr: "Date d'entrée prévue", en: "Intended Entry Date" },
						required: true,
					},
					{
						id: "stay_duration",
						type: FormFieldType.Number,
						label: {
							fr: "Durée du séjour (jours)",
							en: "Duration of Stay (days)",
						},
						required: true,
					},
					{
						id: "address_in_gabon",
						type: FormFieldType.Text,
						label: { fr: "Adresse au Gabon", en: "Address in Gabon" },
						required: true,
					},
					{
						id: "purpose_of_travel",
						type: FormFieldType.Textarea,
						label: { fr: "Motif du voyage", en: "Purpose of Travel" },
						required: true,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Coordonnées", en: "Contact" },
				fields: [
					{
						id: "current_address",
						type: FormFieldType.Text,
						label: { fr: "Adresse actuelle", en: "Current Address" },
						required: true,
					},
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Visa,
		icon: "Briefcase",
		sections: [
			{
				id: "personal_information",
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: "last_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: "first_name",
						type: FormFieldType.Text,
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "nationality",
						type: FormFieldType.Text,
						label: { fr: "Nationalité", en: "Nationality" },
						required: true,
					},
					{
						id: "occupation",
						type: FormFieldType.Text,
						label: { fr: "Profession", en: "Occupation" },
						required: true,
					},
				],
			},
			{
				id: "company",
				title: { fr: "Entreprise/Organisation", en: "Company/Organization" },
				fields: [
					{
						id: "company_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de l'entreprise", en: "Company Name" },
						required: true,
					},
					{
						id: "company_address",
						type: FormFieldType.Text,
						label: { fr: "Adresse de l'entreprise", en: "Company Address" },
						required: true,
					},
					{
						id: "position",
						type: FormFieldType.Text,
						label: { fr: "Fonction", en: "Position" },
						required: true,
					},
					{
						id: "partner_company",
						type: FormFieldType.Text,
						label: {
							fr: "Entreprise partenaire au Gabon",
							en: "Partner Company in Gabon",
						},
						required: false,
					},
				],
			},
			{
				id: "travel_details",
				title: { fr: "Détails du voyage", en: "Travel Details" },
				fields: [
					{
						id: "entry_date",
						type: FormFieldType.Date,
						label: { fr: "Date d'entrée prévue", en: "Intended Entry Date" },
						required: true,
					},
					{
						id: "stay_duration",
						type: FormFieldType.Number,
						label: {
							fr: "Durée du séjour (jours)",
							en: "Duration of Stay (days)",
						},
						required: true,
					},
					{
						id: "mission_purpose",
						type: FormFieldType.Textarea,
						label: { fr: "Objet de la mission", en: "Purpose of Mission" },
						required: true,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Coordonnées", en: "Contact" },
				fields: [
					{
						id: "professional_email",
						type: FormFieldType.Email,
						label: { fr: "Email professionnel", en: "Professional Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Certification,
		icon: "FileCheck",
		sections: [
			{
				id: "requester",
				title: { fr: "Demandeur", en: "Requester" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
			{
				id: "documents_to_legalize",
				title: { fr: "Documents à légaliser", en: "Documents to Legalize" },
				fields: [
					{
						id: "document_type",
						type: FormFieldType.Select,
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
						id: "document_description",
						type: FormFieldType.Textarea,
						label: {
							fr: "Description du document",
							en: "Document Description",
						},
						required: true,
					},
					{
						id: "number_of_documents",
						type: FormFieldType.Number,
						label: { fr: "Nombre de documents", en: "Number of Documents" },
						required: true,
						validation: { min: 1, max: 20 },
					},
					{
						id: "intended_use",
						type: FormFieldType.Select,
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
						id: "documents_upload",
						type: FormFieldType.File,
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
		category: ServiceCategory.Certification,
		icon: "Pen",
		sections: [
			{
				id: "signatory",
				title: { fr: "Signataire", en: "Signatory" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "id_number",
						type: FormFieldType.Text,
						label: { fr: "Numéro de pièce d'identité", en: "ID Number" },
						required: true,
					},
				],
			},
			{
				id: "document",
				title: { fr: "Document", en: "Document" },
				fields: [
					{
						id: "document_nature",
						type: FormFieldType.Text,
						label: { fr: "Nature du document", en: "Document Nature" },
						required: true,
					},
					{
						id: "subject",
						type: FormFieldType.Textarea,
						label: { fr: "Objet", en: "Subject" },
						required: true,
					},
					{
						id: "recipient",
						type: FormFieldType.Text,
						label: { fr: "Destinataire", en: "Recipient" },
						required: false,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Transcript,
		icon: "GraduationCap",
		sections: [
			{
				id: "student",
				title: { fr: "Étudiant/Élève", en: "Student" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "institution",
						type: FormFieldType.Text,
						label: { fr: "Établissement", en: "Institution" },
						required: true,
					},
					{
						id: "years_concerned",
						type: FormFieldType.Text,
						label: { fr: "Années concernées", en: "Years Concerned" },
						required: true,
					},
					{
						id: "education_level",
						type: FormFieldType.Select,
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
				id: "document_type",
				title: { fr: "Type de document", en: "Document Type" },
				fields: [
					{
						id: "requested_document",
						type: FormFieldType.Select,
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
						id: "number_of_copies",
						type: FormFieldType.Number,
						label: { fr: "Nombre de copies", en: "Number of Copies" },
						required: true,
						validation: { min: 1, max: 5 },
					},
					{
						id: "reason",
						type: FormFieldType.Textarea,
						label: { fr: "Motif de la demande", en: "Reason for Request" },
						required: false,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Assistance,
		icon: "AlertTriangle",
		sections: [
			{
				id: "person_in_need",
				title: { fr: "Personne en difficulté", en: "Person in Need" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "passport_number",
						type: FormFieldType.Text,
						label: { fr: "Numéro de passeport", en: "Passport Number" },
						required: false,
					},
					{
						id: "current_location",
						type: FormFieldType.Text,
						label: { fr: "Localisation actuelle", en: "Current Location" },
						required: true,
					},
				],
			},
			{
				id: "emergency_nature",
				title: { fr: "Nature de l'urgence", en: "Nature of Emergency" },
				fields: [
					{
						id: "emergency_type",
						type: FormFieldType.Select,
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
						id: "situation_description",
						type: FormFieldType.Textarea,
						label: {
							fr: "Description de la situation",
							en: "Situation Description",
						},
						required: true,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: "urgent_phone",
						type: FormFieldType.Phone,
						label: { fr: "Téléphone (urgent)", en: "Phone (urgent)" },
						required: true,
					},
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: false,
					},
					{
						id: "contact_in_france",
						type: FormFieldType.Text,
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
		category: ServiceCategory.Assistance,
		icon: "Plane",
		sections: [
			{
				id: "applicant",
				title: { fr: "Demandeur", en: "Applicant" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "passport_number",
						type: FormFieldType.Text,
						label: { fr: "Numéro de passeport", en: "Passport Number" },
						required: true,
					},
					{
						id: "current_address",
						type: FormFieldType.Text,
						label: { fr: "Adresse actuelle", en: "Current Address" },
						required: true,
					},
				],
			},
			{
				id: "repatriation_reason",
				title: { fr: "Motif du rapatriement", en: "Reason for Repatriation" },
				fields: [
					{
						id: "reason",
						type: FormFieldType.Select,
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
						id: "detailed_explanation",
						type: FormFieldType.Textarea,
						label: { fr: "Explication détaillée", en: "Detailed Explanation" },
						required: true,
					},
				],
			},
			{
				id: "contact_in_gabon",
				title: { fr: "Contact au Gabon", en: "Contact in Gabon" },
				fields: [
					{
						id: "contact_name",
						type: FormFieldType.Text,
						label: { fr: "Nom du contact", en: "Contact Name" },
						required: true,
					},
					{
						id: "relationship",
						type: FormFieldType.Text,
						label: { fr: "Lien de parenté", en: "Relationship" },
						required: true,
					},
					{
						id: "phone_in_gabon",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.TravelDocument,
		icon: "FileText",
		sections: [
			{
				id: "personal_information",
				title: { fr: "Informations personnelles", en: "Personal Information" },
				fields: [
					{
						id: "last_name",
						type: FormFieldType.Text,
						label: { fr: "Nom de famille", en: "Last Name" },
						required: true,
					},
					{
						id: "first_name",
						type: FormFieldType.Text,
						label: { fr: "Prénom(s)", en: "First Name(s)" },
						required: true,
					},
					{
						id: "date_of_birth",
						type: FormFieldType.Date,
						label: { fr: "Date de naissance", en: "Date of Birth" },
						required: true,
					},
					{
						id: "place_of_birth",
						type: FormFieldType.Text,
						label: { fr: "Lieu de naissance", en: "Place of Birth" },
						required: true,
					},
				],
			},
			{
				id: "request_reason",
				title: { fr: "Motif de la demande", en: "Reason for Request" },
				fields: [
					{
						id: "reason",
						type: FormFieldType.Select,
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
						id: "destination",
						type: FormFieldType.Text,
						label: { fr: "Destination", en: "Destination" },
						required: true,
					},
					{
						id: "travel_date",
						type: FormFieldType.Date,
						label: { fr: "Date de voyage prévue", en: "Planned Travel Date" },
						required: true,
					},
					{
						id: "additional_details",
						type: FormFieldType.Textarea,
						label: { fr: "Détails supplémentaires", en: "Additional Details" },
						required: false,
					},
				],
			},
			{
				id: "contact",
				title: { fr: "Contact", en: "Contact" },
				fields: [
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
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
		category: ServiceCategory.Other,
		icon: "HelpCircle",
		sections: [
			{
				id: "applicant",
				title: { fr: "Demandeur", en: "Applicant" },
				fields: [
					{
						id: "full_name",
						type: FormFieldType.Text,
						label: { fr: "Nom complet", en: "Full Name" },
						required: true,
					},
					{
						id: "email",
						type: FormFieldType.Email,
						label: { fr: "Email", en: "Email" },
						required: true,
					},
					{
						id: "phone",
						type: FormFieldType.Phone,
						label: { fr: "Téléphone", en: "Phone" },
						required: true,
					},
				],
			},
			{
				id: "request",
				title: { fr: "Votre demande", en: "Your Request" },
				fields: [
					{
						id: "subject",
						type: FormFieldType.Text,
						label: { fr: "Objet de la demande", en: "Request Subject" },
						required: true,
					},
					{
						id: "description",
						type: FormFieldType.Textarea,
						label: { fr: "Description détaillée", en: "Detailed Description" },
						required: true,
					},
				],
			},
		],
	},

	// =====================================================
	// REGISTRATION - Inscriptions consulaires
	// =====================================================
	{
		id: "consular-card-registration",
		name: {
			fr: "Inscription consulaire / Carte consulaire",
			en: "Consular Registration / Consular Card",
		},
		description: {
			fr: "Demande d'inscription au registre consulaire et de carte consulaire",
			en: "Consular registration and consular card application",
		},
		category: ServiceCategory.Registration,
		icon: "CreditCard",
		sections: [],
	},
];

export function getTemplateById(id: string): FormTemplate | undefined {
	return formTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): FormTemplate[] {
	return formTemplates.filter((t) => t.category === category);
}

/**
 * Required documents for consular card registration
 * These map to profile.documents keys and will be auto-filled from Document Vault
 */
export const CONSULAR_CARD_REQUIRED_DOCUMENTS = [
	{
		type: "passport",
		label: { fr: "Passeport en cours de validité", en: "Valid Passport" },
		required: true,
	},
	{
		type: "proof_of_address",
		label: {
			fr: "Justificatif de domicile (moins de 3 mois)",
			en: "Proof of Address (less than 3 months)",
		},
		required: true,
	},
	{
		type: "identity_photo",
		label: {
			fr: "Photo d'identité format passeport",
			en: "Passport-size Identity Photo",
		},
		required: true,
	},
	{
		type: "birth_certificate",
		label: {
			fr: "Acte de naissance (copie intégrale)",
			en: "Birth Certificate (full copy)",
		},
		required: false,
	},
	{
		type: "proof_of_residency",
		label: {
			fr: "Titre de séjour en cours de validité",
			en: "Valid Residence Permit",
		},
		required: false,
	},
];
