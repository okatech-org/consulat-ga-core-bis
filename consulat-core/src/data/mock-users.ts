import { DemoUser } from '@/types/roles';
import { ConsularRole, EmploymentStatus } from '@/types/consular-roles';
import { UserFunction, BillingFeature } from '@/types/user-management';
import { MOCK_ENTITIES } from './mock-entities';
import { Entity } from '@/types/entity';
import { OrganizationType } from '@/types/organization';
import { MOCK_GABONAIS_CITIZENS } from './mock-citizens';
import { MOCK_FOREIGNERS } from './mock-foreigners';

// --- STATIC USERS (Admin & Citizens) ---

const ADMIN_USER: DemoUser = {
  id: 'admin-system',
  role: 'ADMIN',
  name: 'Super Admin',
  entityId: undefined,
  permissions: [
    'Accès total au système',
    'Gestion des licences',
    'Création d\'entités',
    'Configuration IA et sécurité',
    'Consultation des logs système',
    'Gestion des utilisateurs globale',
  ],
  badge: '🔴',
  description: 'Super administrateur avec accès au réseau mondial complet',
  functions: [UserFunction.USER_MANAGEMENT, UserFunction.SETTINGS_MANAGEMENT, UserFunction.REPORTING_VIEW],
  billingFeatures: [BillingFeature.API_ACCESS, BillingFeature.UNLIMITED_STORAGE],
  quotas: { maxDailyFiles: 9999, maxStorageGB: 1000, canExportData: true }
};

// --- DYNAMIC STAFF GENERATION ---

const generateStaffForEntity = (entity: Entity, hasConsulateGeneralInCountry: boolean): DemoUser[] => {
  const staff: DemoUser[] = [];
  const entityType = entity.type;
  const city = entity.metadata?.city || 'Unknown';
  const idPrefix = entity.id.split('-').slice(0, 2).join('-'); // e.g., fr-consulat

  // 1. HEAD OF POST (Ambassador or Consul General)
  if (entityType === OrganizationType.AMBASSADE || entityType === OrganizationType.HAUT_COMMISSARIAT || entityType === OrganizationType.MISSION_PERMANENTE) {
    // AMBASSADEUR
    staff.push({
      id: `${idPrefix}-ambassadeur`,
      role: ConsularRole.AMBASSADEUR,
      name: `S.E. M. l'Ambassadeur (${city})`,
      entityId: entity.id,
      hierarchyLevel: 1,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE, OrganizationType.HAUT_COMMISSARIAT, OrganizationType.MISSION_PERMANENTE],
      permissions: ['Supervision globale', 'Représentation Éttat', 'Politique étrangère'],
      badge: '🥇',
      description: 'Chef de Mission Diplomatique',
      functions: [UserFunction.CRISIS_MANAGE, UserFunction.REPORTING_VIEW],
      quotas: { maxDailyFiles: 1000, maxStorageGB: 100, canExportData: true }
    });

    // PREMIER CONSEILLER
    staff.push({
      id: `${idPrefix}-premier-conseiller`,
      role: ConsularRole.PREMIER_CONSEILLER,
      name: `Premier Conseiller (${city})`,
      entityId: entity.id,
      hierarchyLevel: 2,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Coordination services', 'Intérim Ambassadeur'],
      badge: '🥈',
      description: 'Numéro 2 - Coordination',
    });

    // PAYEUR
    staff.push({
      id: `${idPrefix}-payeur`,
      role: ConsularRole.PAYEUR,
      name: `Payeur (${city})`,
      entityId: entity.id,
      hierarchyLevel: 3,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Gestion financière', 'Comptabilité'],
      badge: '💰',
      description: 'Responsable Financier',
    });

    // CONSEILLERS SPÉCIFIQUES
    staff.push({
      id: `${idPrefix}-conseiller-eco`,
      role: ConsularRole.CONSEILLER_ECONOMIQUE,
      name: `Conseiller Économique (${city})`,
      entityId: entity.id,
      hierarchyLevel: 3,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Affaires économiques', 'Commerce'],
      badge: '📈',
      description: 'Affaires Économiques & Commerciales',
    });

    staff.push({
      id: `${idPrefix}-conseiller-social`,
      role: ConsularRole.CONSEILLER_SOCIAL,
      name: `Conseiller Social (${city})`,
      entityId: entity.id,
      hierarchyLevel: 3,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Affaires sociales', 'Diaspora'],
      badge: '🤝',
      description: 'Affaires Sociales',
    });

    staff.push({
      id: `${idPrefix}-conseiller-com`,
      role: ConsularRole.CONSEILLER_COMMUNICATION,
      name: `Conseiller Communication (${city})`,
      entityId: entity.id,
      hierarchyLevel: 3,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Presse', 'Communication', 'Relations publiques'],
      badge: '📢',
      description: 'Communication & Presse',
    });

    // CHANCELIER
    staff.push({
      id: `${idPrefix}-chancelier`,
      role: ConsularRole.CHANCELIER,
      name: `Chancelier (${city})`,
      entityId: entity.id,
      hierarchyLevel: 4,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Administration', 'Protocole'],
      badge: '📜',
      description: 'Chef de Chancellerie',
    });

    // PREMIER SECRETAIRE
    staff.push({
      id: `${idPrefix}-premier-secretaire`,
      role: ConsularRole.PREMIER_SECRETAIRE,
      name: `Premier Secrétaire (${city})`,
      entityId: entity.id,
      hierarchyLevel: 4,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Rédaction', 'Suivi dossiers'],
      badge: '🖊️',
      description: 'Premier Secrétaire',
    });

    // RECEPTIONNISTE
    staff.push({
      id: `${idPrefix}-receptionniste`,
      role: ConsularRole.RECEPTIONNISTE,
      name: `Réceptionniste (${city})`,
      entityId: entity.id,
      hierarchyLevel: 5,
      employmentStatus: EmploymentStatus.CONTRACTUEL,
      allowedEntityTypes: [OrganizationType.AMBASSADE],
      permissions: ['Accueil', 'Standard'],
      badge: '👋',
      description: 'Accueil & Orientation',
    });

  } else if (entityType === OrganizationType.CONSULAT_GENERAL) {
    staff.push({
      id: `${idPrefix}-cg`,
      role: ConsularRole.CONSUL_GENERAL,
      name: `M. le Consul Général (${city})`,
      entityId: entity.id,
      hierarchyLevel: 1,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL],
      permissions: ['Supervision globale', 'Direction stratégique', 'Administration générale'],
      badge: '🥇',
      description: 'Consul Général - Chef de Poste',
      functions: [UserFunction.VISA_VALIDATE, UserFunction.PASSPORT_VALIDATE, UserFunction.CIVIL_REGISTRY_VALIDATE, UserFunction.CRISIS_MANAGE],
      quotas: { maxDailyFiles: 500, maxStorageGB: 50, canExportData: true }
    });
  }

  // === LOGIQUE DE GESTION CONSULAIRE ===
  // Si c'est une Ambassade ET qu'il y a un Consulat Général dans le pays -> PAS DE STAFF CONSULAIRE
  const isEmbassyWithConsulateGeneral = (entityType === OrganizationType.AMBASSADE || entityType === OrganizationType.HAUT_COMMISSARIAT) && hasConsulateGeneralInCountry;

  if (isEmbassyWithConsulateGeneral) {
    // On s'arrête ici pour les Ambassades qui ont un CG dans le pays.
    return staff;
  }

  // 2. CONSUL / VICE-CONSUL / AGENTS (Pour Consulats ou Ambassades sans CG)

  // CONSUL (Chef de section consulaire dans Ambassade sans CG, ou Adjoint dans CG)
  if (entityType === OrganizationType.CONSULAT_GENERAL || entityType === OrganizationType.CONSULAT || !isEmbassyWithConsulateGeneral) {

    // Cas spécifique Ambassade sans CG : On met un Consul OU un Chargé d'Affaires
    // Ici on met les deux pour le choix en démo, ou le logique requested:
    // "Un consul Ou un chargé d'affaire consulaire" -> On va mettre un Consul Chef de Section

    if (entityType === OrganizationType.CONSULAT || entityType === OrganizationType.CONSULAT_GENERAL || entityType === OrganizationType.AMBASSADE) {
      staff.push({
        id: `${idPrefix}-consul`,
        role: ConsularRole.CONSUL,
        name: `M. le Consul (${city})`,
        entityId: entity.id,
        hierarchyLevel: 2,
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        allowedEntityTypes: [OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
        permissions: ['Supervision opérations', 'Validation actes'],
        badge: '🥈',
        description: entityType === OrganizationType.CONSULAT_GENERAL ? 'Consul - Adjoint au Chef de Poste' : 'Consul - Chef de Section Consulaire',
      });
    }

    // Vice-Consul
    if (entityType === OrganizationType.CONSULAT || entityType === OrganizationType.CONSULAT_GENERAL) {
      staff.push({
        id: `${idPrefix}-vc`,
        role: ConsularRole.VICE_CONSUL,
        name: `Vice-Consul (${city})`,
        entityId: entity.id,
        hierarchyLevel: 3,
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT],
        permissions: ['Supervision opérations', 'Validation'],
        badge: '🥉',
        description: 'Vice-Consul - Supervision Opérationnelle',
      });
    }

    // Charge d'affaires Consulaires (Pour tous ceux qui font du consulaire)
    staff.push({
      id: `${idPrefix}-cac`,
      role: ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
      name: `Chargé d'Affaires (${city})`,
      entityId: entity.id,
      hierarchyLevel: 4,
      employmentStatus: EmploymentStatus.FONCTIONNAIRE,
      allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
      permissions: ['Gestion demandes', 'Validation dossiers'],
      badge: '🎖️',
      description: 'Chargé d\'Affaires Consulaires',
    });

    // Agents Consulaires
    staff.push({
      id: `${idPrefix}-agent-1`,
      role: ConsularRole.AGENT_CONSULAIRE,
      name: `Agent Consulaire 1 (${city})`,
      entityId: entity.id,
      hierarchyLevel: 5,
      employmentStatus: EmploymentStatus.CONTRACTUEL,
      allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
      permissions: ['Traitement dossiers', 'Guichet virtuel'],
      badge: '🟢',
      description: 'Agent de traitement - Guichet',
    });

    staff.push({
      id: `${idPrefix}-agent-2`,
      role: ConsularRole.AGENT_CONSULAIRE,
      name: `Agent Consulaire 2 (${city})`,
      entityId: entity.id,
      hierarchyLevel: 5,
      employmentStatus: EmploymentStatus.CONTRACTUEL,
      allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
      permissions: ['Traitement dossiers', 'Biométrie'],
      badge: '🟢',
      description: 'Agent de traitement - Biométrie',
    });

    // STAGIAIRE
    staff.push({
      id: `${idPrefix}-stagiaire`,
      role: ConsularRole.STAGIAIRE,
      name: `Stagiaire (${city})`,
      entityId: entity.id,
      hierarchyLevel: 6,
      employmentStatus: EmploymentStatus.CONTRACTUEL,
      allowedEntityTypes: [OrganizationType.CONSULAT_GENERAL, OrganizationType.CONSULAT, OrganizationType.AMBASSADE],
      permissions: ['Support traitement', 'Saisie données'],
      badge: '🎓',
      description: 'Stagiaire - Support Opérationnel',
    });
  }

  return staff;
};

// Generate staff for all entities with context awareness
// Generate staff for all entities with context awareness
const GENERATED_STAFF = MOCK_ENTITIES.flatMap(entity => {
  // Check if there is a Consulate General in the same country (and it's not THIS entity)
  const getCountryCode = (e: any) => e.countryCode || e.metadata?.countryCode;
  const currentCountryCode = getCountryCode(entity);

  const hasConsulateGeneralInCountry = MOCK_ENTITIES.some(e =>
    getCountryCode(e) === currentCountryCode &&
    e.id !== entity.id &&
    e.type === OrganizationType.CONSULAT_GENERAL
  );

  return generateStaffForEntity(entity, hasConsulateGeneralInCountry);
});

// --- DYNAMIC STAFF GENERATION ---

// Convert detailed citizens to DemoUser
const MAPPED_CITIZENS: DemoUser[] = MOCK_GABONAIS_CITIZENS.map(c => ({
  id: c.id,
  role: ConsularRole.CITIZEN,
  name: `${c.firstName} ${c.lastName}`,
  entityId: c.assignedConsulate,
  permissions: ['Accès complet', 'Passeport', 'État Civil'],
  badge: '🇬🇦',
  description: `Citoyen Gabonais - ${c.profession}`,
  hierarchyLevel: 0,
  employmentStatus: EmploymentStatus.CITOYEN
}));

// Convert detailed foreigners to DemoUser
const MAPPED_FOREIGNERS: DemoUser[] = MOCK_FOREIGNERS.map(f => ({
  id: f.id,
  role: ConsularRole.FOREIGNER,
  name: `${f.firstName} ${f.lastName}`,
  entityId: f.assignedConsulate,
  permissions: ['Accès limité', 'Visa', 'Légalisation'],
  badge: '🌍',
  description: `Usager Étranger - ${f.nationality}`,
  hierarchyLevel: 0,
  employmentStatus: EmploymentStatus.CITOYEN
}));

// --- SPECIFIC TEST CASES FOR TERRITORIALITY ---

const TEST_STUDENT_FRANCE: DemoUser = {
  id: 'student-gabon-france',
  role: ConsularRole.CITIZEN,
  name: 'Étudiant Gabonais (France)',
  entityId: 'fr-consulat-paris', // Managed by France
  permissions: ['Accès complet'],
  badge: '🎓',
  description: 'Étudiant en France (> 6 mois)',
  residenceCountry: 'FR',
  currentLocation: 'FR',
  stayDuration: 12,
  managedByOrgId: 'fr-consulat-paris'
};

const TEST_STUDENT_TRAVELER: DemoUser = {
  id: 'student-gabon-traveler',
  role: ConsularRole.CITIZEN,
  name: 'Étudiant Voyageur (Maroc)',
  entityId: 'fr-consulat-paris', // Still managed by France
  permissions: ['Accès complet'],
  badge: '✈️',
  description: 'Étudiant France en voyage au Maroc (< 6 mois)',
  residenceCountry: 'FR',
  currentLocation: 'MA', // Morocco
  stayDuration: 2, // < 6 months
  managedByOrgId: 'fr-consulat-paris',
  signaledToOrgId: 'ma-consulat-rabat' // Signaled to Morocco
};

export const MOCK_USERS: DemoUser[] = [
  ADMIN_USER,
  ...GENERATED_STAFF,
  ...MAPPED_CITIZENS,
  ...MAPPED_FOREIGNERS,
  TEST_STUDENT_FRANCE,
  TEST_STUDENT_TRAVELER
];

export const getUserById = (id: string): DemoUser | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};

export const getUsersByEntity = (entityId: string): DemoUser[] => {
  return MOCK_USERS.filter(user => user.entityId === entityId);
};
