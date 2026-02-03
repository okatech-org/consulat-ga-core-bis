import { Entity } from "@/types/entity";
import { DemoUser, UserRole } from "@/types/roles";

export const getDemoAccountsForEntity = (entity: Entity): DemoUser[] => {
  const baseId = `demo-${entity.id}`;
  
  return [
    // 1. Ressortissant (Résident)
    {
      id: `${baseId}-resident`,
      role: 'citizen' as UserRole,
      name: 'Ressortissant (Résident)',
      entityId: entity.id,
      permissions: ['Mes demandes', 'Mon profil', 'Rendez-vous', 'Documents'],
      badge: '🏠',
      description: `Citoyen gabonais résidant à ${entity.city}, ${entity.country}`,
    },
    // 2. Ressortissant (Pays Lié)
    {
      id: `${baseId}-linked`,
      role: 'citizen' as UserRole,
      name: 'Ressortissant (Pays Lié)',
      entityId: entity.id,
      permissions: ['Mes demandes', 'Mon profil', 'Rendez-vous', 'Documents'],
      badge: '🌍',
      description: `Citoyen gabonais résidant dans la juridiction de ${entity.city}`,
    },
    // 3. Ressortissant (Autre/Touriste/Etudiant)
    {
      id: `${baseId}-other`,
      role: 'citizen' as UserRole,
      name: 'Ressortissant (De Passage)',
      entityId: entity.id,
      permissions: ['Assistance', 'Urgences', 'Signalement'],
      badge: '✈️',
      description: `Citoyen gabonais de passage ou étudiant à ${entity.city}`,
    },
    // 4. Demandeur Visa (Type A - Tourisme)
    {
      id: `${baseId}-visa-a`,
      role: 'citizen' as UserRole, // Using citizen role but conceptually a foreigner
      name: 'Demandeur Visa (Tourisme)',
      entityId: entity.id,
      permissions: ['Demande Visa', 'Suivi Dossier'],
      badge: '🎫',
      description: `Demandeur de visa touristique pour le Gabon depuis ${entity.country}`,
    },
    // 5. Demandeur Visa (Type B - Affaires)
    {
      id: `${baseId}-visa-b`,
      role: 'citizen' as UserRole,
      name: 'Demandeur Visa (Affaires)',
      entityId: entity.id,
      permissions: ['Demande Visa', 'Suivi Dossier', 'Fast Track'],
      badge: '💼',
      description: `Demandeur de visa affaires/officiel pour le Gabon depuis ${entity.country}`,
    },
  ];
};
