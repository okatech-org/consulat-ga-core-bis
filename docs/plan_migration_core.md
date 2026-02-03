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

### Approche

> [!CAUTION]
> **APPROCHE DESTRUCTIVE** : Nous remplaçons tout code existant qui n'est pas aligné avec le design.
>
> - Rien n'est en production
> - Pas de compromis pour "maintenir la compatibilité"
> - Si une feature est mal conçue, on la réécrit

### Stratégie

| Aspect             | Approche Choisie                                   |
| :----------------- | :------------------------------------------------- |
| **Backend**        | ✅ Conserver Convex (déjà fonctionnel)             |
| **Auth**           | ✅ Conserver Clerk + Organizations                 |
| **UI/UX**          | 🔄 Migrer depuis Core (shadcn compatible)          |
| **Logique Métier** | ⚠️ DESTRUCTIF : Réécrire selon architecture Convex |
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

### 1.1 Types d'Organisations Diplomatiques ✅ IMPLÉMENTÉ

> [!TIP]
> **8 types d'organisations** implémentés avec métadonnées complètes.

**Fichiers modifiés :**

- `convex/lib/constants.ts` - Enum `OrganizationType` avec 8 valeurs
- `convex/lib/validators.ts` - `orgTypeValidator` + `weeklyScheduleValidator`
- `convex/schemas/orgs.ts` - Schéma enrichi avec métadonnées

#### Types Implémentés

```typescript
export enum OrganizationType {
  Embassy = "embassy", // Ambassade
  GeneralConsulate = "general_consulate", // Consulat Général
  Consulate = "consulate", // Consulat
  HonoraryConsulate = "honorary_consulate", // Consulat Honoraire
  HighCommission = "high_commission", // Haut-Commissariat
  PermanentMission = "permanent_mission", // Mission Permanente
  ThirdParty = "third_party", // Partenaire tiers
  Other = "other", // Autre
}
```

#### Métadonnées Ajoutées au Schéma `orgs`

| Champ          | Type             | Description                   |
| :------------- | :--------------- | :---------------------------- |
| `coordinates`  | `{ lat, lng }`   | Coordonnées GPS               |
| `fax`          | `string`         | Numéro de fax                 |
| `notes`        | `string`         | Notes internes                |
| `openingHours` | `WeeklySchedule` | Horaires d'ouverture par jour |

#### Checklist

- [x] **1.1.1** 8 types dans `OrganizationType`
- [x] **1.1.2** `weeklyScheduleValidator` créé (lun-dim + notes)
- [x] **1.1.3** Métadonnées : `coordinates`, `fax`, `notes`, `openingHours`

---

### 1.2 Système de Permissions (ABAC) ✅ IMPLÉMENTÉ

> [!TIP]
> **APPROCHE DESTRUCTIVE APPLIQUÉE** : On a séparé clairement les rôles plateforme (UserRole) des rôles organisation (MemberRole), au lieu d'essayer de tout mettre dans un seul enum.

#### Architecture Finale

```
Rôles Plateforme (UserRole)     → users.role      → Accès cross-organisation
Rôles Organisation (MemberRole) → memberships.role → Accès org-spécifique
```

**Fichiers implémentés :**

| Fichier                              | Rôle                                                                                      |
| :----------------------------------- | :---------------------------------------------------------------------------------------- |
| `convex/lib/constants.ts`            | `UserRole` (4) + `MemberRole` (18 rôles diplomatiques)                                    |
| `convex/lib/permissions.ts`          | Source de vérité ABAC : `hasPermission()`, `canManage()`, `canProcess()`, `canValidate()` |
| `convex/lib/auth.ts`                 | Fonctions auth avec hiérarchie : `requireOrgAdmin()`, `requireOrgAgent()`                 |
| `convex/lib/validators.ts`           | `memberRoleValidator` avec 18 rôles                                                       |
| `convex/schemas/users.ts`            | Champ `role` pour les rôles plateforme                                                    |
| `convex/schemas/memberships.ts`      | Champ `permissions[]` pour override spécifiques                                           |
| `src/lib/permissions/components.tsx` | Guards React : `RoleGuard`, `MemberRoleGuard`, `PermissionGuard`, `SuperAdminGuard`       |

#### UserRole (Plateforme)

```typescript
export enum UserRole {
  User = "user", // Citoyen standard
  SuperAdmin = "super_admin", // Accès total plateforme
  IntelAgent = "intel_agent", // Opérations renseignement
  EducationAgent = "education_agent", // Services éducation
}
```

#### MemberRole (Organisation)

```typescript
export enum MemberRole {
  // Ambassade (9 rôles)
  Ambassador,
  FirstCounselor,
  Paymaster,
  EconomicCounselor,
  SocialCounselor,
  CommunicationCounselor,
  Chancellor,
  FirstSecretary,
  Receptionist,

  // Consulat (6 rôles)
  ConsulGeneral,
  Consul,
  ViceConsul,
  ConsularAffairsOfficer,
  ConsularAgent,
  Intern,

  // Générique (3 rôles)
  Admin,
  Agent,
  Viewer,
}
```

#### Hiérarchie des Permissions

| Groupe               | Rôles inclus                                             | Capacités                      |
| :------------------- | :------------------------------------------------------- | :----------------------------- |
| **MANAGEMENT_ROLES** | Ambassador, ConsulGeneral, FirstCounselor, Consul, Admin | Gérer org, assigner, supprimer |
| **PROCESSING_ROLES** | + ViceConsul, Chancellor, ConsularAgent, Agent...        | Traiter demandes, compléter    |
| **VALIDATION_ROLES** | + ConsularAffairsOfficer, SocialCounselor...             | Valider documents, générer     |
| **VIEW_ONLY_ROLES**  | Intern, Viewer, Receptionist...                          | Lecture seule                  |

#### Permissions Spéciales (Override)

Stockée dans `memberships.permissions[]` pour donner des permissions exceptionnelles :

```typescript
// Un stagiaire qui peut exceptionnellement valider des documents
{
  role: MemberRole.Intern,
  permissions: ["documents.validate", "requests.view"]
}
```

#### Usage Backend

```typescript
import { requirePermission, canManage, isSuperAdmin } from "../lib/permissions";

// Dans une mutation
const { user, membership } = await requirePermission(ctx, orgId, "validate");

// Vérification simple
if (isSuperAdmin(user) || canManage(membership)) {
  // Action admin
}
```

#### Usage Frontend

```tsx
import { PermissionGuard, MemberRoleGuard } from "@/lib/permissions";

<PermissionGuard ctx={{ user, membership }} action="validate" resource="documents">
  <ValidateButton />
</PermissionGuard>

<MemberRoleGuard membership={membership} roles={[MemberRole.ConsulGeneral, MemberRole.Consul]}>
  <AdminPanel />
</MemberRoleGuard>
```

#### Checklist

- [x] ~~**1.2.1** Créer `src/lib/permissions/types.ts`~~ → Supprimé (centralisé dans Convex)
- [x] ~~**1.2.2** Créer `src/lib/permissions/roles.ts`~~ → Supprimé (centralisé dans Convex)
- [x] ~~**1.2.3** Créer `src/lib/permissions/utils.ts`~~ → Supprimé (centralisé dans Convex)
- [x] **1.2.4** Migré vers `convex/lib/permissions.ts` comme source unique
- [x] **1.2.5** Séparer `UserRole` (plateforme) de `MemberRole` (org)
- [x] **1.2.6** Créer les 18 rôles diplomatiques dans `MemberRole`
- [x] **1.2.7** Intégrer dans `auth.ts` avec hiérarchies
- [x] **1.2.8** `src/lib/permissions/components.tsx` avec Guards React
- [ ] **1.2.9** Ajouter `<PermissionGuard>` dans l'UI pour les boutons/actions

---

### 1.3 Types d'Utilisateurs Publics ✅ IMPLÉMENTÉ

> [!TIP]
> **6 types d'utilisateurs publics** avec mapping des services accessibles.

**Fichiers modifiés :**

- `convex/lib/constants.ts` - Enum `PublicUserType` + mapping `PUBLIC_USER_TYPE_SERVICES`
- `convex/lib/validators.ts` - `publicUserTypeValidator`
- `convex/schemas/profiles.ts` - Champ `userType`

#### Types Implémentés

```typescript
export enum PublicUserType {
  Resident = "resident", // Gabonais > 6 mois
  Passage = "passage", // Gabonais < 6 mois
  VisaTourism = "visa_tourism", // Visa court séjour
  VisaBusiness = "visa_business", // Visa affaires
  VisaLongStay = "visa_long_stay", // Visa long séjour
  ServiceGabon = "service_gabon", // Légalisation, apostille
}
```

#### Services Accessibles par Type

| Type             | Services                                                                       |
| :--------------- | :----------------------------------------------------------------------------- |
| **Resident**     | registration, passport, civil_status, consular_card, certification, assistance |
| **Passage**      | temporary_registration, travel_document, assistance                            |
| **VisaTourism**  | visa_short_stay                                                                |
| **VisaBusiness** | visa_business, visa_long_stay                                                  |
| **VisaLongStay** | visa_long_stay, residence_permit                                               |
| **ServiceGabon** | legalization, apostille, certified_copy                                        |

#### Checklist

- [x] **1.3.1** 6 types dans `PublicUserType`
- [x] **1.3.2** Mapping `PUBLIC_USER_TYPE_SERVICES`
- [x] **1.3.3** Champ `userType` dans schéma `profiles`

---

## Phase 2 : Données de Référence

### 2.1 Réseau Diplomatique (50+ postes) ✅ IMPLÉMENTÉ

> [!TIP]
> Seed créé avec 50 postes diplomatiques gabonais réels.

**Fichier créé :** `convex/seeds/diplomatic_network.ts`

**Répartition par continent :**

- 🌍 Afrique : 22 postes
- 🇪🇺 Europe : 14 postes
- 🌎 Amériques : 6 postes
- 🌏 Asie & Moyen-Orient : 6 postes

**Métadonnées incluses :**

- Adresses physiques
- Téléphone, Email, Fax
- Horaires d'ouverture (structure `weeklyScheduleValidator`)
- Pays de juridiction
- Coordonnées GPS (lorsque disponibles)

**Utilisation :**

```bash
npx convex run seeds/diplomatic_network:seedDiplomaticNetwork
```

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
