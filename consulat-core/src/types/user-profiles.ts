export type GaboneseProfileType = 
  | 'RESIDENT_PERMANENT'  // Résident permanent
  | 'ETUDIANT'            // Étudiant
  | 'TRAVAILLEUR'         // Travailleur
  | 'MINEUR'              // Mineur (compte rattaché à un parent/tuteur)
  | 'VISITEUR_GABONAIS'   // Visiteur gabonais
  | 'VISITEUR_ETRANGER';  // Visiteur étranger

export type VisaType = 
  | 'VISA_TOURISME'       // Visa de tourisme
  | 'VISA_AFFAIRES'       // Visa d'affaires
  | 'VISA_ETUDES'         // Visa d'études
  | 'VISA_TRAVAIL'        // Visa de travail
  | 'VISA_TRANSIT'        // Visa de transit
  | 'VISA_COURTOISIE'     // Visa de courtoisie (diplomatique)
  | 'VISA_FAMILIAL';      // Visa de regroupement familial

export type UserProfileType = GaboneseProfileType | VisaType;

export interface UserProfile {
  id: string;
  entityId: string;
  profileType: UserProfileType;
  firstName: string;
  lastName: string;
  nationality: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  createdAt: string;
  // Pour les mineurs
  parentId?: string;
  // Pour les demandeurs de visa
  visaStatus?: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
}

export const PROFILE_TYPE_LABELS: Record<UserProfileType, string> = {
  RESIDENT_PERMANENT: 'Résident Permanent',
  ETUDIANT: 'Étudiant Gabonais',
  TRAVAILLEUR: 'Travailleur Gabonais',
  MINEUR: 'Mineur (compte parent/tuteur)',
  VISITEUR_GABONAIS: 'Visiteur Gabonais',
  VISITEUR_ETRANGER: 'Visiteur Étranger',
  VISA_TOURISME: 'Demande Visa Tourisme',
  VISA_AFFAIRES: 'Demande Visa Affaires',
  VISA_ETUDES: 'Demande Visa Études',
  VISA_TRAVAIL: 'Demande Visa Travail',
  VISA_TRANSIT: 'Demande Visa Transit',
  VISA_COURTOISIE: 'Demande Visa Courtoisie',
  VISA_FAMILIAL: 'Demande Visa Familial',
};

export const PROFILE_TYPE_COLORS: Record<UserProfileType, string> = {
  RESIDENT_PERMANENT: 'bg-blue-500',
  ETUDIANT: 'bg-purple-500',
  TRAVAILLEUR: 'bg-green-500',
  MINEUR: 'bg-pink-500',
  VISITEUR_GABONAIS: 'bg-cyan-500',
  VISITEUR_ETRANGER: 'bg-orange-500',
  VISA_TOURISME: 'bg-yellow-500',
  VISA_AFFAIRES: 'bg-indigo-500',
  VISA_ETUDES: 'bg-violet-500',
  VISA_TRAVAIL: 'bg-emerald-500',
  VISA_TRANSIT: 'bg-slate-500',
  VISA_COURTOISIE: 'bg-rose-500',
  VISA_FAMILIAL: 'bg-teal-500',
};
