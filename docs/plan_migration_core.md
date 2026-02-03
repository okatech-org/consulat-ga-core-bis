# 🚀 Plan de Migration : Consulat-Core → Consulat.ga

**Version :** 1.0  
**Date :** Février 2026  
**Objectif :** Transférer la logique métier, les données et les expériences UI/UX de `consulat-core` vers `consulat.ga`

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Phase 1 : Fondations - Types & Permissions](#phase-1--fondations---types--permissions)
3. [Phase 2 : Données de Référence](#phase-2--données-de-référence)
4. [Phase 3 : Logique Métier - Hiérarchie Consulaire](#phase-3--logique-métier---hiérarchie-consulaire)
5. [Phase 4 : Services & Workflows](#phase-4--services--workflows)
6. [Phase 5 : Features Citoyen](#phase-5--features-citoyen)
7. [Phase 6 : UI/UX Premium](#phase-6--uiux-premium)
8. [Phase 7 : Assistant IA (IAsted)](#phase-7--assistant-ia-iasted)
9. [Phase 8 : Administration & Super Admin](#phase-8--administration--super-admin)

---

## Vue d'Ensemble

### Stratégie

| Aspect             | Approche Choisie                                   |
| :----------------- | :------------------------------------------------- |
| **Backend**        | ✅ Conserver Convex (déjà fonctionnel)             |
| **Auth**           | ✅ Conserver Clerk + Organizations                 |
| **UI/UX**          | 🔄 Migrer depuis Core (shadcn compatible)          |
| **Logique Métier** | 🔄 Adapter les règles Core à l'architecture Convex |
| **Données Mock**   | 🔄 Transformer en seeds Convex                     |

### Fichiers Sources Principaux (Core)

| Fichier                           | Lignes | Contenu                       |
| :-------------------------------- | :----: | :---------------------------- |
| `lib/constants.ts`                |  463   | 50+ enums centralisées        |
| `types/consular-roles.ts`         |  ~200  | Hiérarchie des rôles          |
| `types/consulate-hierarchy.ts`    |  ~150  | Logique d'entités autorisées  |
| `data/mock-diplomatic-network.ts` |  929   | 50+ postes diplomatiques      |
| `data/mock-users.ts`              |  384   | Génération dynamique du staff |
| `data/mock-services.ts`           |  308   | 15 services consulaires       |

---

## Phase 1 : Fondations - Types & Permissions

### 1.1 Types d'Organisations Diplomatiques

> [!IMPORTANT]
> Core définit 7 types d'organisations avec des règles métier spécifiques (ex: Ambassade avec/sans CG dans le pays).

**Source :** `consulat-core/src/types/organization.ts`

#### Checklist

- [ ] **1.1.1** Étendre le validator `orgs.ts` pour inclure tous les types :
  - [ ] `AMBASSADE`
  - [ ] `CONSULAT_GENERAL`
  - [ ] `CONSULAT`
  - [ ] `HAUT_COMMISSARIAT`
  - [ ] `MISSION_PERMANENTE`
  - [ ] `CONSULAT_HONORAIRE`
  - [ ] `AUTRE`
- [ ] **1.1.2** Ajouter les métadonnées organisation :
  - [ ] `jurisdiction: string[]` (pays couverts)
  - [ ] `coordinates: [number, number]` (GPS)
  - [ ] `hours: WeeklySchedule` (horaires)
  - [ ] `contact: ContactInfo` (adresse, téléphone, email, site web, fax)
  - [ ] `notes: string`

**Recommandation technique :**

```typescript
// convex/lib/validators.ts
export const organizationType = v.union(
  v.literal("ambassade"),
  v.literal("consulat_general"),
  v.literal("consulat"),
  v.literal("haut_commissariat"),
  v.literal("mission_permanente"),
  v.literal("consulat_honoraire"),
  v.literal("autre"),
);
```

---

### 1.2 Système de Permissions (ABAC)

> [!IMPORTANT]
> Approche **Attribute-Based Access Control** : les permissions sont des fonctions qui reçoivent l'utilisateur ET l'entité pour décider dynamiquement.

**Référence :** `docs/permissions/` (legacy à réimplémenter)

#### Architecture ABAC

```
src/lib/permissions/
├── types.ts        # Types génériques ResourceType, PermissionCheck
├── roles.ts        # Configuration ROLES par rôle
├── utils.ts        # hasPermission(), assertPermission()
└── components.tsx  # PermissionGuard, RoleGuard
```

#### 1. Types (`types.ts`)

```typescript
import type { Doc } from "@/convex/_generated/dataModel";
import type { UserRole } from "@/convex/lib/constants";

// Définition des ressources et leurs actions
export type ResourceType = {
  profiles: {
    dataType: Doc<"profiles">;
    action: "view" | "create" | "update" | "delete" | "validate";
  };
  requests: {
    dataType: Doc<"requests">;
    action:
      | "view"
      | "create"
      | "update"
      | "delete"
      | "process"
      | "validate"
      | "complete"
      | "assign";
  };
  documents: {
    dataType: Doc<"documents">;
    action: "view" | "create" | "update" | "delete" | "validate" | "generate";
  };
  organizations: {
    dataType: Doc<"organizations">;
    action: "view" | "create" | "update" | "delete" | "manage";
  };
  services: {
    dataType: Doc<"services">;
    action: "view" | "create" | "update" | "delete" | "configure";
  };
  appointments: {
    dataType: Doc<"appointments">;
    action: "view" | "create" | "update" | "delete" | "reschedule" | "cancel";
  };
  associations: {
    dataType: Doc<"associations">;
    action:
      | "view"
      | "create"
      | "update"
      | "delete"
      | "join"
      | "leave"
      | "manage";
  };
  companies: {
    dataType: Doc<"companies">;
    action: "view" | "create" | "update" | "delete" | "manage";
  };
  cv: {
    dataType: Doc<"cv">;
    action: "view" | "create" | "update" | "delete" | "export";
  };
  messages: {
    dataType: Doc<"messages">;
    action: "view" | "create" | "delete" | "archive";
  };
};

// Permission = boolean OU fonction (user, entity) => boolean
export type PermissionCheck<Key extends keyof ResourceType> =
  | boolean
  | ((user: Doc<"users">, data: ResourceType[Key]["dataType"]) => boolean);
```

#### 2. Exemple de Configuration (`roles.ts`)

```typescript
export const ROLES: RolesConfig = {
  super_admin: {
    profiles: {
      view: true,
      create: true,
      update: true,
      delete: true,
      validate: true,
    },
    requests: {
      view: true,
      create: true,
      update: true,
      delete: true,
      process: true,
      validate: true,
      complete: true,
      assign: true,
    },
    // ... tout à true
  },

  consul_general: {
    requests: {
      view: (user, request) => request.organizationId === user.organizationId,
      validate: true,
      assign: true,
    },
    documents: { validate: true, generate: true },
  },

  agent: {
    requests: {
      view: (user, request) => request.organizationId === user.organizationId,
      process: (user, request) => request.assignedTo === user._id,
      update: (user, request) => request.assignedTo === user._id,
    },
  },

  user: {
    profiles: {
      view: (user, profile) => profile.userId === user._id,
      update: (user, profile) => profile.userId === user._id,
    },
    requests: {
      view: (user, request) => request.requesterId === user.profileId,
      create: true,
      update: (user, request) =>
        request.requesterId === user.profileId && request.status === "draft",
    },
  },
};
```

#### 3. Fonctions Utilitaires (`utils.ts`)

```typescript
export function hasPermission<Resource extends keyof ResourceType>(
  user: UserData,
  resource: Resource,
  action: ResourceType[Resource]["action"],
  data?: ResourceType[Resource]["dataType"],
): boolean {
  return (
    user?.roles.some((role) => {
      const permission = ROLES[role]?.[resource]?.[action];
      if (permission == null) return false;
      if (typeof permission === "boolean") return permission;
      return data != null && permission(user, data);
    }) ?? false
  );
}
```

#### 4. Composant React (`PermissionGuard`)

```tsx
<PermissionGuard
  user={user}
  resource="requests"
  action="validate"
  data={request}
>
  <Button>Valider</Button>
</PermissionGuard>
```

#### Checklist

- [x] **1.2.1** Créer `src/lib/permissions/types.ts` avec les ressources
- [x] **1.2.2** Créer `src/lib/permissions/roles.ts` avec la config par rôle
- [x] **1.2.3** Créer `src/lib/permissions/utils.ts` avec `hasPermission()`, `assertPermission()`
- [x] **1.2.4** Créer `src/lib/permissions/components.tsx` avec `PermissionGuard`, `RoleGuard`
- [ ] **1.2.5** Créer les rôles utilisateurs :
  - [ ] `super_admin` - Tout
  - [ ] `admin` - Organisation
  - [ ] `user` - Citoyen standard
- [ ] **1.2.6** Créer les rôles consulaires (17) :
  - [ ] `ambassador` (niveau 1)
  - [ ] `first_counselor` (niveau 2)
  - [ ] `paymaster` (niveau 3)
  - [ ] `economic_counselor` (niveau 3)
  - [ ] `social_counselor` (niveau 3)
  - [ ] `communication_counselor` (niveau 3)
  - [ ] `chancellor` (niveau 4)
  - [ ] `first_secretary` (niveau 4)
  - [ ] `receptionist` (niveau 5)
  - [ ] `consul_general` (niveau 1)
  - [ ] `consul` (niveau 2)
  - [ ] `vice_consul` (niveau 3)
  - [ ] `consular_affairs_officer` (niveau 4)
  - [ ] `consular_agent` (niveau 5)
  - [ ] `intern` (niveau 6)
- [ ] **1.2.7** Intégrer dans les mutations Convex avec `assertPermission()`
- [ ] **1.2.8** Ajouter `<PermissionGuard>` dans l'UI pour les boutons/actions

---

### 1.3 Types d'Utilisateurs Publics

**Source :** `consulat-core/src/types/user-account-types.ts`

#### Checklist

- [ ] **1.3.1** Étendre le profil avec le champ `userType` :
  - [ ] `RESIDENT` (Gabonais > 6 mois)
  - [ ] `PASSAGE` (Gabonais < 6 mois)
  - [ ] `VISA_TOURISME` (Étranger court séjour)
  - [ ] `VISA_AFFAIRES` (Étranger pro)
  - [ ] `SERVICE_GABON` (Étranger services admin)

- [ ] **1.3.2** Créer les règles de services accessibles par type :
  - [ ] Résident → Inscription complète, Passeport, État Civil
  - [ ] Passage → Déclaration temporaire, Laissez-passer
  - [ ] Visa Tourisme → Visa court séjour
  - [ ] Visa Affaires → Visa affaires, long séjour
  - [ ] Service Gabon → Légalisation, Apostille

---

## Phase 2 : Données de Référence

### 2.1 Réseau Diplomatique (50+ postes)

> [!TIP]
> Ces données sont réelles et prêtes à l'emploi. Excellent point de départ pour les seeds.

**Source :** `consulat-core/src/data/mock-diplomatic-network.ts`

#### Checklist

- [ ] **2.1.1** Créer le script de seed `convex/seeds/diplomatic_network.ts`
- [ ] **2.1.2** Importer les 50+ organisations par continent :
  - [ ] Afrique (22 postes)
  - [ ] Europe (14 postes)
  - [ ] Amériques (6 postes)
  - [ ] Asie/Moyen-Orient (8 postes)

- [ ] **2.1.3** Inclure les métadonnées complètes :
  - [ ] Adresse physique
  - [ ] Téléphone + Email
  - [ ] Horaires d'ouverture
  - [ ] Juridiction (pays couverts)
  - [ ] Coordonnées GPS

---

### 2.2 Services Consulaires Complets

**Source :** `consulat-core/src/data/mock-services.ts`

#### Checklist

- [ ] **2.2.1** Enrichir les services existants avec les données Core :
  - [ ] Protection et Assistance Consulaire (Loi 006/2023)
  - [ ] Passeport Ordinaire Biométrique
  - [ ] Tenant lieu de passeport
  - [ ] Laissez-Passer Consulaire
  - [ ] Visa Tourisme
  - [ ] Visa Affaires
  - [ ] Visa Long Séjour / Installation
  - [ ] Transcription Acte de Naissance
  - [ ] Publication Bans & Transcription Mariage
  - [ ] Transcription de Décès
  - [ ] Certificat de Capacité à Mariage
  - [ ] Légalisation de Documents
  - [ ] Copie Certifiée Conforme
  - [ ] Carte d'Immatriculation Consulaire
  - [ ] Certificat de Résidence & Changement
  - [ ] Procuration & Légalisation Signature

- [ ] **2.2.2** Ajouter les champs manquants :
  - [ ] `legalBasis: { reference, title, link }` (base légale)
  - [ ] `assistanceDetails: { beneficiaries[], situations[], limitations[] }`
  - [ ] `imageUrl` (illustration)

---

## Phase 3 : Logique Métier - Hiérarchie Consulaire

### 3.1 Règles de Génération du Personnel

> [!WARNING]
> Cette logique est complexe. Elle détermine quel staff est généré selon le type d'organisation et le contexte pays.

**Source :** `consulat-core/src/data/mock-users.ts` (fonction `generateStaffForEntity`)

#### Règles Métier à Implémenter

1. **Ambassade avec Consulat Général dans le même pays** :
   - Ambassade = Personnel diplomatique uniquement (Ambassadeur → Réceptionniste)
   - PAS de personnel consulaire (géré par le CG)

2. **Ambassade sans Consulat Général** :
   - Ambassade = Diplomatique + Section Consulaire
   - Inclut un Consul ou Chargé d'Affaires Consulaires

3. **Consulat Général** :
   - Personnel consulaire complet (CG → Stagiaire)

4. **Haut-Commissariat** :
   - Similaire à Ambassade (pays du Commonwealth)

5. **Mission Permanente** :
   - Similaire à Ambassade (organisations internationales)

#### Checklist

- [ ] **3.1.1** Créer la fonction `getStaffTemplateForOrg(orgType, context)`
- [ ] **3.1.2** Implémenter la logique `hasConsulateGeneralInCountry(countryCode)`
- [ ] **3.1.3** Créer les templates de staff par type d'organisation
- [ ] **3.1.4** Ajouter la validation dans le formulaire de création d'organisation

---

### 3.2 Territorialité et Juridiction

**Concepts clés :**

| Terme                            | Définition                                                 |
| :------------------------------- | :--------------------------------------------------------- |
| **Organisation de rattachement** | Où le citoyen est inscrit (basé sur la résidence > 6 mois) |
| **Organisation de signalement**  | Où le citoyen se trouve temporairement (voyage < 6 mois)   |
| **Juridiction**                  | Liste des pays couverts par une organisation               |

#### Checklist

- [ ] **3.2.1** Ajouter au profil :
  - [ ] `residenceCountry` (pays de résidence principale)
  - [ ] `currentLocation` (localisation actuelle)
  - [ ] `stayDuration` (durée du séjour actuel en mois)
  - [ ] `managedByOrgId` (organisation de rattachement)
  - [ ] `signaledToOrgId` (organisation de signalement)

- [ ] **3.2.2** Créer la logique de résolution d'organisation :
  - [ ] Si résident > 6 mois → Rattacher à l'org locale
  - [ ] Si de passage < 6 mois → Signaler à l'org locale, garder rattachement

---

## Phase 4 : Services & Workflows

### 4.1 Workflow de Demande Enrichi

**Source :** `consulat-core/src/types/request.ts`, `docs/specifications_techniques.md`

#### Statuts à Implémenter (12)

| Statut                  | Description                  | Couleur |
| :---------------------- | :--------------------------- | :-----: |
| `draft`                 | Brouillon                    |   🔘    |
| `pending`               | En attente                   |   🟡    |
| `pending_completion`    | Compléments requis           |   🟠    |
| `edited`                | Modifiée (après compléments) |   🔵    |
| `submitted`             | Soumise                      |   🟢    |
| `under_review`          | En cours d'examen            |   🔵    |
| `in_production`         | En production                |   🟣    |
| `validated`             | Validée                      |   ✅    |
| `rejected`              | Rejetée                      |   🔴    |
| `ready_for_pickup`      | Prête à retirer              |   🟢    |
| `appointment_scheduled` | RDV planifié                 |   📅    |
| `completed`             | Terminée                     |   ✅    |
| `cancelled`             | Annulée                      |   ⚫    |

#### Checklist

- [ ] **4.1.1** Étendre le validator `RequestStatus` avec les 12 statuts
- [ ] **4.1.2** Créer les transitions autorisées (state machine) :
  - [ ] `draft` → `pending`, `cancelled`
  - [ ] `pending` → `pending_completion`, `under_review`, `cancelled`
  - [ ] `pending_completion` → `edited`
  - [ ] `edited` → `under_review`
  - [ ] `under_review` → `validated`, `rejected`, `appointment_scheduled`
  - [ ] `validated` → `in_production`
  - [ ] `in_production` → `ready_for_pickup`
  - [ ] `ready_for_pickup` → `completed`

- [ ] **4.1.3** Implémenter les hooks de transition (notifications, logs)

---

### 4.2 Système de Procuration (Proxy)

**Concept :** Certains services peuvent être demandés/retirés par un tiers.

#### Checklist

- [ ] **4.2.1** Ajouter le champ `proxy` dans la config de demande :
  ```typescript
  proxy?: {
    firstName: string;
    lastName: string;
    identityDocId: string;
    powerOfAttorneyId: string;
  }
  ```
- [ ] **4.2.2** Ajouter le champ `proxy.allows` dans les services
- [ ] **4.2.3** Créer l'UI de saisie des infos proxy
- [ ] **4.2.4** Ajouter la validation de la procuration

---

### 4.3 Modes de Livraison

| Mode         | Description            |
| :----------- | :--------------------- |
| `in_person`  | Retrait sur place      |
| `postal`     | Envoi postal           |
| `electronic` | Document numérique     |
| `by_proxy`   | Retrait par mandataire |

#### Checklist

- [ ] **4.3.1** Ajouter le champ `delivery` dans les demandes
- [ ] **4.3.2** Créer l'UI de choix du mode de livraison
- [ ] **4.3.3** Intégrer le suivi postal (tracking)

---

## Phase 5 : Features Citoyen

### 5.1 Module CV (iCV)

**Source :** `consulat-core/src/pages/dashboard/citizen/CitizenCVPage.tsx`, `consulat-core/src/types/cv.ts`

#### Checklist

- [ ] **5.1.1** Créer le schema Convex `cv` :
  - [ ] Expériences professionnelles
  - [ ] Formation
  - [ ] Compétences (avec niveau)
  - [ ] Langues (avec niveau CECRL)
  - [ ] Loisirs
  - [ ] Portfolio / LinkedIn

- [ ] **5.1.2** Créer les functions CRUD :
  - [ ] `cv.getByUserId`
  - [ ] `cv.create`
  - [ ] `cv.update`
  - [ ] `cv.addExperience` / `removeExperience`
  - [ ] `cv.addEducation` / `removeEducation`
  - [ ] `cv.addSkill` / `removeSkill`
  - [ ] `cv.addLanguage` / `removeLanguage`

- [ ] **5.1.3** Porter les composants UI :
  - [ ] CVEditor principal
  - [ ] ExperienceForm
  - [ ] EducationForm
  - [ ] SkillsList
  - [ ] LanguagesList
  - [ ] CVPreview

- [ ] **5.1.4** Ajouter l'export PDF

---

### 5.2 Module Associations

**Source :** `consulat-core/src/types/association.ts`, `consulat-core/src/pages/dashboard/citizen/CitizenAssociationsPage.tsx`

#### Types d'Associations (10)

| Type           | Description     |
| :------------- | :-------------- |
| `CULTURAL`     | Culturelle      |
| `SPORTS`       | Sportive        |
| `RELIGIOUS`    | Religieuse      |
| `PROFESSIONAL` | Professionnelle |
| `SOLIDARITY`   | Solidarité      |
| `EDUCATION`    | Éducation       |
| `YOUTH`        | Jeunesse        |
| `WOMEN`        | Femmes          |
| `STUDENT`      | Étudiante       |
| `OTHER`        | Autre           |

#### Checklist

- [ ] **5.2.1** Créer le schema `associations` avec :
  - [ ] Infos de base (nom, type, description, objectifs)
  - [ ] Contact (email, téléphone, réseaux sociaux)
  - [ ] Adresse
  - [ ] Propriétaire + rôle
  - [ ] Statut validation (pending, approved, rejected)

- [ ] **5.2.2** Créer le système de membres :
  - [ ] Table `association_members`
  - [ ] Rôles : PRESIDENT, VICE_PRESIDENT, SECRETARY, TREASURER, MEMBER
  - [ ] Statuts invitation : pending, accepted, declined

- [ ] **5.2.3** Porter les pages UI :
  - [ ] Liste des associations
  - [ ] Détails association
  - [ ] Créer association
  - [ ] Inviter membres

---

### 5.3 Module Entreprises

**Source :** `consulat-core/src/types/company.ts`

#### Types d'Entreprises (8)

`SARL`, `SA`, `SAS`, `SASU`, `EURL`, `EI`, `AUTO_ENTREPRENEUR`, `OTHER`

#### Secteurs d'Activité (12)

`TECHNOLOGY`, `COMMERCE`, `SERVICES`, `INDUSTRY`, `AGRICULTURE`, `HEALTH`, `EDUCATION`, `CULTURE`, `TOURISM`, `TRANSPORT`, `CONSTRUCTION`, `OTHER`

#### Checklist

- [ ] **5.3.1** Créer le schema `companies`
- [ ] **5.3.2** Créer les functions CRUD
- [ ] **5.3.3** Porter les pages UI

---

### 5.4 Module Enfants (Profils Mineurs)

**Source :** `consulat-core/src/types/auth/child.ts`, `consulat-core/src/pages/dashboard/citizen/CitizenChildrenPage.tsx`

#### Checklist

- [ ] **5.4.1** Créer le schema `child_profiles` :
  - [ ] Infos personnelles (identité, naissance)
  - [ ] Parents (avec rôle : père, mère, tuteur)
  - [ ] Documents associés

- [ ] **5.4.2** Lier les demandes aux profils enfants :
  - [ ] Un parent peut faire une demande pour son enfant
  - [ ] Champ `isChildProfile` dans les requests

---

### 5.5 Coffre-fort Documents (e-Documents)

> [!TIP]
> UI particulière de e-Documents dans Core à transférer.

**Source :** `consulat-core/src/pages/dashboard/citizen/CitizenDocumentsPage.tsx`

#### Catégories de Documents (8)

| Catégorie      | Icône | Exemples                |
| :------------- | :---: | :---------------------- |
| `identity`     |  👤   | CNI, Passeport          |
| `civil_status` |  👶   | Acte naissance, mariage |
| `residence`    |  🏠   | Justificatif domicile   |
| `education`    |  🎓   | Diplômes                |
| `work`         |  💼   | Contrats, bulletins     |
| `health`       |  ❤️   | Carte CNAMGS            |
| `vehicle`      |  🚗   | Permis, carte grise     |
| `other`        |  📄   | Divers                  |

#### Checklist

- [ ] **5.5.1** Porter l'UI "dossiers" avec navigation visuelle
- [ ] **5.5.2** Ajouter les métadonnées d'expiration :
  - [ ] `expirationDate`
  - [ ] Alertes automatiques (30j, 7j avant)

---

## Phase 6 : UI/UX Premium

### 6.1 Système de Thèmes

> [!TIP]
> Core propose plusieurs thèmes. Fonctionnalité à transférer.

#### Checklist

- [ ] **6.1.1** Étendre le système de thèmes actuel :
  - [ ] Light (par défaut)
  - [ ] Dark
  - [ ] System (auto)
  - [ ] Gabon (couleurs nationales : vert/jaune/bleu)
  - [ ] High Contrast (accessibilité)

- [ ] **6.1.2** Créer le composant `ThemeSelector`
- [ ] **6.1.3** Persister le choix utilisateur

---

### 6.2 Carte du Réseau Mondial

**Source :** `consulat-core/src/pages/WorldNetworkPage.tsx`, `consulat-core/src/components/InteractiveWorldMap.tsx`

#### Checklist

- [ ] **6.2.1** Porter le composant `InteractiveWorldMap`
- [ ] **6.2.2** Ajouter la page `/network` ou `/reseau`
- [ ] **6.2.3** Afficher les postes par continent
- [ ] **6.2.4** Permettre le clic pour voir les détails

---

### 6.3 iCarte (Portefeuille Digital)

**Source :** `consulat-core/src/pages/icarte/ICartePage.tsx`

#### Concept

Carte consulaire digitale avec :

- QR Code vérifiable
- Affichage des données essentielles
- Mode hors-ligne
- Partage sécurisé

#### Checklist

- [ ] **6.3.1** Porter l'UI de `ICartePage`
- [ ] **6.3.2** Intégrer avec les données Convex
- [ ] **6.3.3** Générer le QR Code dynamique
- [ ] **6.3.4** Créer l'endpoint de vérification QR

---

### 6.4 iBoîte (Messagerie)

**Source :** `consulat-core/src/pages/iboite/IBoitePage.tsx`

#### Checklist

- [ ] **6.4.1** Créer le schema `messages` :
  - [ ] `from`, `to` (user_id ou org_id)
  - [ ] `subject`, `body`
  - [ ] `isRead`, `isArchived`
  - [ ] `attachments`

- [ ] **6.4.2** Porter l'UI de messagerie :
  - [ ] Liste des conversations
  - [ ] Détail conversation
  - [ ] Composer message

- [ ] **6.4.3** Ajouter les notifications temps réel

---

### 6.5 Timeline Citoyen

**Source :** `consulat-core/src/pages/dashboard/citizen/CitizenTimelinePage.tsx`

#### Checklist

- [ ] **6.5.1** Créer l'agrégation des activités utilisateur
- [ ] **6.5.2** Porter l'UI de timeline
- [ ] **6.5.3** Ajouter les filtres par type d'activité

---

## Phase 7 : Assistant IA (IAsted)

**Source :** `consulat-core/src/components/iasted/IAstedChatModal.tsx`

> [!CAUTION]
> Ce composant fait 1219 lignes. Migration complexe.

### 7.1 Fonctionnalités Core

| Feature           | Description                                |
| :---------------- | :----------------------------------------- |
| Chat textuel      | Conversation avec l'assistant              |
| Commande vocale   | Intégration OpenAI WebRTC                  |
| Navigation UI     | L'IA peut piloter l'interface (tool calls) |
| Génération PDF    | L'IA peut générer des documents            |
| Aide contextuelle | Messages d'aide selon la page              |

#### Checklist

- [ ] **7.1.1** Porter le modal de chat
- [ ] **7.1.2** Intégrer avec l'API Gemini existante
- [ ] **7.1.3** Ajouter les fonctions "outils" :
  - [ ] Naviguer vers une page
  - [ ] Remplir un formulaire
  - [ ] Générer un document
  - [ ] Prendre un RDV

- [ ] **7.1.4** Ajouter le mode vocal (optionnel)

---

## Phase 8 : Administration & Super Admin

### 8.1 Gestion des Organisations

**Source :** `consulat-core/src/pages/dashboard/super-admin/SuperAdminOrganizations.tsx`, `consulat-core/src/pages/dashboard/super-admin/OrganizationDetails.tsx`

#### Checklist

- [ ] **8.1.1** Améliorer la page de liste des organisations
- [ ] **8.1.2** Créer la page de détails organisation avec :
  - [ ] Infos générales
  - [ ] Personnel (membres Clerk)
  - [ ] Services configurés
  - [ ] Statistiques

---

### 8.2 Gestion des Services Globaux

**Source :** `consulat-core/src/pages/dashboard/super-admin/SuperAdminServices.tsx`

#### Checklist

- [ ] **8.2.1** Créer l'interface de gestion des services "maîtres"
- [ ] **8.2.2** Permettre la création de templates de service
- [ ] **8.2.3** Gérer la distribution aux organisations

---

### 8.3 Paramètres Globaux

**Source :** `consulat-core/src/pages/dashboard/super-admin/SuperAdminSettings.tsx`

#### Checklist

- [ ] **8.3.1** Paramètres plateforme :
  - [ ] Langues disponibles
  - [ ] Thèmes disponibles
  - [ ] Logos et branding

- [ ] **8.3.2** Paramètres techniques :
  - [ ] Limites de quotas
  - [ ] Configuration IA
  - [ ] Configuration emails

---

## 📊 Récapitulatif

| Phase                   |  Priorité   |  Effort   | Dépendances |
| :---------------------- | :---------: | :-------: | :---------- |
| **1. Fondations**       | 🔴 Critique | 2-3 jours | -           |
| **2. Données**          | 🔴 Critique | 1-2 jours | Phase 1     |
| **3. Hiérarchie**       |  🟠 Haute   | 2-3 jours | Phases 1-2  |
| **4. Workflows**        |  🟠 Haute   | 3-4 jours | Phases 1-3  |
| **5. Features Citoyen** | 🟡 Moyenne  | 5-7 jours | Phases 1-4  |
| **6. UI/UX**            | 🟢 Normale  | 3-5 jours | Phases 1-5  |
| **7. IAsted**           | 🟢 Normale  | 3-5 jours | Phases 1-6  |
| **8. Admin**            | 🟢 Normale  | 2-3 jours | Toutes      |

**Estimation totale : 3-4 semaines**

---

## 🔄 Suivi de Progression

Mettre à jour ce fichier au fur et à mesure :

- [ ] = À faire
- [/] = En cours
- [x] = Terminé

---

_Document créé le 3 Février 2026_
