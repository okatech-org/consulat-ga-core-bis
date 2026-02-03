import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schemas
export const passportRequestSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  birthPlace: z.string().min(2, "Le lieu de naissance est requis"),
  address: z.string().min(5, "L'adresse complète est requise"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  requestType: z.enum(["first", "renewal", "lost"], { required_error: "Le type de demande est requis" }),
  urgency: z.enum(["normal", "urgent"]),
  comments: z.string().optional(),
});

export const visaRequestSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  nationality: z.string().min(2, "La nationalité est requise"),
  passportNumber: z.string().min(5, "Le numéro de passeport est requis"),
  passportExpiry: z.string().min(1, "La date d'expiration du passeport est requise"),
  visaType: z.enum(["tourist", "business", "transit", "long"], { required_error: "Le type de visa est requis" }),
  arrivalDate: z.string().min(1, "La date d'arrivée est requise"),
  departureDate: z.string().min(1, "La date de départ est requise"),
  accommodation: z.string().min(5, "L'adresse d'hébergement est requise"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  comments: z.string().optional(),
});

export const consularCardRequestSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  birthPlace: z.string().min(2, "Le lieu de naissance est requis"),
  profession: z.string().min(2, "La profession est requise"),
  address: z.string().min(5, "L'adresse complète est requise"),
  city: z.string().min(2, "La ville est requise"),
  country: z.string().min(1, "Le pays de résidence est requis"),
  arrivalDate: z.string().min(1, "La date d'arrivée dans le pays est requise"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  emergencyContact: z.string().min(2, "Le contact d'urgence est requis"),
  emergencyPhone: z.string().min(8, "Le téléphone d'urgence est requis"),
  comments: z.string().optional(),
});

export const legalizationRequestSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  documentType: z.string().min(1, "Le type de document est requis"),
  documentCount: z.string().min(1, "Le nombre de documents est requis"),
  documentOrigin: z.string().min(1, "Le pays d'origine du document est requis"),
  purpose: z.string().min(5, "Le motif de la légalisation est requis"),
  urgency: z.enum(["normal", "urgent"]),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  comments: z.string().optional(),
});

export type PassportRequest = z.infer<typeof passportRequestSchema>;
export type VisaRequest = z.infer<typeof visaRequestSchema>;
export type ConsularCardRequest = z.infer<typeof consularCardRequestSchema>;
export type LegalizationRequest = z.infer<typeof legalizationRequestSchema>;

type RequestType = "PASSPORT" | "VISA" | "CONSULAR_CARD" | "LEGALIZATION";

interface CreateRequestParams {
  type: RequestType;
  subject: string;
  description: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  metadata?: Record<string, unknown>;
}

export const serviceRequestService = {
  async createRequest(params: CreateRequestParams) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour soumettre une demande");
    }

    const { data, error } = await supabase
      .from("requests")
      .insert({
        type: params.type,
        subject: params.subject,
        description: params.description,
        citizen_id: user.id,
        citizen_name: params.citizenName,
        citizen_email: params.citizenEmail,
        citizen_phone: params.citizenPhone || null,
        status: "PENDING",
        priority: "NORMAL",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating request:", error);
      throw new Error("Erreur lors de la création de la demande");
    }

    return data;
  },

  async submitPassportRequest(formData: PassportRequest) {
    const requestTypeLabels: Record<string, string> = {
      first: "Première demande",
      renewal: "Renouvellement",
      lost: "Perte / Vol",
    };

    return this.createRequest({
      type: "PASSPORT",
      subject: `Demande de passeport - ${requestTypeLabels[formData.requestType]}`,
      description: `
Type de demande: ${requestTypeLabels[formData.requestType]}
Urgence: ${formData.urgency === "urgent" ? "Urgent" : "Normal"}
Nom: ${formData.lastName} ${formData.firstName}
Date de naissance: ${formData.birthDate}
Lieu de naissance: ${formData.birthPlace}
Adresse: ${formData.address}
${formData.comments ? `Commentaires: ${formData.comments}` : ""}
      `.trim(),
      citizenName: `${formData.firstName} ${formData.lastName}`,
      citizenEmail: formData.email,
      citizenPhone: formData.phone,
    });
  },

  async submitVisaRequest(formData: VisaRequest) {
    const visaTypeLabels: Record<string, string> = {
      tourist: "Visa Touristique",
      business: "Visa Affaires",
      transit: "Visa Transit",
      long: "Visa Long Séjour",
    };

    return this.createRequest({
      type: "VISA",
      subject: `Demande de visa - ${visaTypeLabels[formData.visaType]}`,
      description: `
Type de visa: ${visaTypeLabels[formData.visaType]}
Nationalité: ${formData.nationality}
Passeport: ${formData.passportNumber} (expire: ${formData.passportExpiry})
Dates de séjour: ${formData.arrivalDate} au ${formData.departureDate}
Hébergement: ${formData.accommodation}
${formData.comments ? `Motif: ${formData.comments}` : ""}
      `.trim(),
      citizenName: `${formData.firstName} ${formData.lastName}`,
      citizenEmail: formData.email,
      citizenPhone: formData.phone,
    });
  },

  async submitConsularCardRequest(formData: ConsularCardRequest) {
    return this.createRequest({
      type: "CONSULAR_CARD",
      subject: `Demande de carte consulaire - ${formData.lastName} ${formData.firstName}`,
      description: `
Nom: ${formData.lastName} ${formData.firstName}
Date de naissance: ${formData.birthDate}
Lieu de naissance: ${formData.birthPlace}
Profession: ${formData.profession}
Adresse: ${formData.address}, ${formData.city}, ${formData.country}
Date d'arrivée dans le pays: ${formData.arrivalDate}
Contact d'urgence: ${formData.emergencyContact} (${formData.emergencyPhone})
${formData.comments ? `Commentaires: ${formData.comments}` : ""}
      `.trim(),
      citizenName: `${formData.firstName} ${formData.lastName}`,
      citizenEmail: formData.email,
      citizenPhone: formData.phone,
    });
  },

  async submitLegalizationRequest(formData: LegalizationRequest) {
    const documentTypeLabels: Record<string, string> = {
      diploma: "Diplôme / Attestation de formation",
      birth: "Acte de naissance",
      marriage: "Acte de mariage",
      death: "Acte de décès",
      certificate: "Certificat / Attestation",
      contract: "Contrat / Document juridique",
      commercial: "Document commercial",
      other: "Autre document",
    };

    return this.createRequest({
      type: "LEGALIZATION",
      subject: `Légalisation - ${documentTypeLabels[formData.documentType] || formData.documentType}`,
      description: `
Type de document: ${documentTypeLabels[formData.documentType] || formData.documentType}
Nombre de documents: ${formData.documentCount}
Pays d'origine: ${formData.documentOrigin}
Motif: ${formData.purpose}
Urgence: ${formData.urgency === "urgent" ? "Urgent (24h)" : "Normal (3-5 jours)"}
${formData.comments ? `Remarques: ${formData.comments}` : ""}
      `.trim(),
      citizenName: `${formData.firstName} ${formData.lastName}`,
      citizenEmail: formData.email,
      citizenPhone: formData.phone,
    });
  },

  async getUserRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté");
    }

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("citizen_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      throw new Error("Erreur lors de la récupération des demandes");
    }

    return data;
  },
};
