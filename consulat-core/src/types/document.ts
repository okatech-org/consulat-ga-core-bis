/**
 * Types pour iDocument
 * Structure Dossier → Fichier inspirée de mairie.ga
 */

// Catégories de documents
export type DocumentCategory =
    | 'identity'        // CNI, Passeport
    | 'civil_status'    // Acte de naissance, mariage
    | 'residence'       // Justificatif de domicile
    | 'education'       // Diplômes
    | 'work'            // Contrats, bulletins
    | 'health'          // CNAMGS, ordonnances
    | 'vehicle'         // Permis, carte grise
    | 'other';          // Autres

// Source du document
export type DocumentSource =
    | 'upload'          // Upload fichier
    | 'camera'          // Scan caméra
    | 'official'        // Reçu d'une administration
    | 'generated';      // Généré par le système

// Statut du document
export type DocumentStatus =
    | 'pending'         // En attente de vérification
    | 'verified'        // Vérifié
    | 'rejected'        // Rejeté
    | 'expired';        // Expiré

// Type de fichier
export type FileType = 'pdf' | 'image' | 'other';

// Structure d'un dossier
export interface DocumentFolder {
    id: DocumentCategory;
    name: string;
    description: string;
    icon: string;           // Nom de l'icône Lucide
    color: string;          // Classe Tailwind de couleur
    count: number;          // Nombre de documents
}

// Structure d'un document
export interface VaultDocument {
    id: string;
    user_id: string;
    folder_id: DocumentCategory;
    name: string;
    original_name: string | null;
    file_path: string;
    file_type: FileType;
    file_size: number;
    mime_type: string | null;

    // Métadonnées
    source: DocumentSource;
    status: DocumentStatus;
    is_verified: boolean;
    verification_date: string | null;
    expiration_date: string | null;

    // Pour documents recto/verso
    side?: 'front' | 'back';
    paired_document_id?: string;

    // Métadonnées additionnelles
    metadata: Record<string, any>;

    // Timestamps
    created_at: string;
    updated_at: string;
    last_used_at: string | null;

    // URLs computées
    public_url?: string;
    thumbnail_url?: string;
}

// Labels français des catégories
export const FOLDER_LABELS: Record<DocumentCategory, string> = {
    identity: "Identité",
    civil_status: "État Civil",
    residence: "Domicile",
    education: "Diplômes",
    work: "Travail",
    health: "Santé",
    vehicle: "Véhicule",
    other: "Autres"
};

// Descriptions des dossiers
export const FOLDER_DESCRIPTIONS: Record<DocumentCategory, string> = {
    identity: "CNI, Passeport, Carte de séjour",
    civil_status: "Acte de naissance, mariage, divorce",
    residence: "Justificatif de domicile, factures",
    education: "Diplômes, certificats, attestations",
    work: "Contrats, bulletins de paie",
    health: "Carte CNAMGS, ordonnances",
    vehicle: "Permis de conduire, carte grise",
    other: "Documents divers"
};

// Icônes des dossiers
export const FOLDER_ICONS: Record<DocumentCategory, string> = {
    identity: "User",
    civil_status: "Baby",
    residence: "Home",
    education: "GraduationCap",
    work: "Briefcase",
    health: "Heart",
    vehicle: "Car",
    other: "FileText"
};

// Couleurs des dossiers
export const FOLDER_COLORS: Record<DocumentCategory, string> = {
    identity: "from-blue-500 to-indigo-600",
    civil_status: "from-pink-500 to-rose-600",
    residence: "from-emerald-500 to-teal-600",
    education: "from-amber-500 to-orange-600",
    work: "from-purple-500 to-violet-600",
    health: "from-red-500 to-rose-600",
    vehicle: "from-cyan-500 to-blue-600",
    other: "from-slate-500 to-gray-600"
};

// Créer la liste des dossiers
export function createFolderList(documents: VaultDocument[]): DocumentFolder[] {
    const categories: DocumentCategory[] = [
        'identity', 'civil_status', 'residence', 'education',
        'work', 'health', 'vehicle', 'other'
    ];

    return categories.map(cat => ({
        id: cat,
        name: FOLDER_LABELS[cat],
        description: FOLDER_DESCRIPTIONS[cat],
        icon: FOLDER_ICONS[cat],
        color: FOLDER_COLORS[cat],
        count: documents.filter(d => d.folder_id === cat).length
    }));
}

// Interface pour le formulaire d'upload
export interface DocumentUploadData {
    name: string;
    folder_id: DocumentCategory;
    file: File;
    expiration_date?: string;
    side?: 'front' | 'back';
    metadata?: Record<string, any>;
}

// Stats des documents
export interface DocumentStats {
    total: number;
    verified: number;
    pending: number;
    expired: number;
    byFolder: Record<DocumentCategory, number>;
}
