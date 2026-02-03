# 📋 Cahier des Charges Complet - Consulat.ga-Core

**Version:** 2.0  
**Date:** Février 2026  
**Projet:** Consulat.ga-Core - Plateforme de Services Consulaires Digitaux (Super-App)

---

## 1. Vision du Projet

### 1.1 Contexte

**Consulat.ga-Core** est une plateforme SaaS holistique de digitalisation des services consulaires gabonais. Elle permet aux citoyens gabonais résidant à l'étranger et aux visiteurs étrangers d'accéder aux démarches administratives consulaires de manière dématérialisée.

### 1.2 Objectifs Stratégiques

- Dématérialiser l'ensemble des démarches administratives consulaires
- Réduire drastiquement les délais de traitement des demandes
- Améliorer l'expérience usager pour les citoyens à l'étranger
- Centraliser la gestion multi-organisations (consulats, ambassades, missions permanentes)
- Permettre le suivi en temps réel des demandes
- Offrir une plateforme communautaire (associations, entreprises, CV)

---

## 2. Stack Technique

### 2.1 Frontend

| Technologie         | Usage                             |
| ------------------- | --------------------------------- |
| **React 18**        | Framework UI                      |
| **Vite**            | Build tool et dev server          |
| **TanStack Router** | Routage file-based                |
| **TanStack Query**  | Gestion du cache et data fetching |
| **Tailwind CSS**    | Styling utilitaire                |
| **Shadcn/ui**       | Composants UI                     |
| **Clerk**           | Authentification                  |
| **i18n**            | Internationalisation (FR/EN)      |

### 2.2 Backend

| Technologie       | Usage                                    |
| ----------------- | ---------------------------------------- |
| **Supabase**      | Base de données PostgreSQL + Auth        |
| **Stripe**        | Paiements en ligne                       |
| **Resend**        | Emails transactionnels                   |
| **Google Gemini** | IA pour analyse automatique des demandes |

### 2.3 Déploiement

- **Hébergement:** Google Cloud Run
- **CI/CD:** Cloud Build → déploiement automatique sur `main`

---

## 3. Types d'Utilisateurs

### 3.1 Catégories Principales

| Catégorie         | Description                       | Sous-types                                  |
| ----------------- | --------------------------------- | ------------------------------------------- |
| **Ressortissant** | Gabonais à l'étranger             | Résident (+6 mois), De Passage (-6 mois)    |
| **Visiteur**      | Étranger demandant services Gabon | Visa Tourisme, Visa Affaires, Service Gabon |

### 3.2 Rôles Système

| Rôle            | Accès          | Description                       |
| --------------- | -------------- | --------------------------------- |
| **Citizen**     | `/my-space/*`  | Usager gabonais des services      |
| **Foreigner**   | `/my-space/*`  | Usager étranger                   |
| **Agent**       | `/admin/*`     | Personnel consulaire              |
| **Admin Org**   | `/admin/*`     | Administrateur d'une organisation |
| **Super Admin** | `/dashboard/*` | Administrateur global plateforme  |

### 3.3 Hiérarchie Consulaire (15 rôles)

#### Rôles Consulat Général / Consulat

1. **Consul Général** - Chef de mission (Consulat Général uniquement)
2. **Consul** - Responsable consulaire
3. **Vice-Consul** - Adjoint du consul (pas Ambassade)
4. **Chargé d'Affaires Consulaires** - Gestionnaire des affaires
5. **Agent Consulaire** - Personnel opérationnel
6. **Stagiaire** - Personnel en formation

#### Rôles Ambassade / Haut-Commissariat

1. **Ambassadeur** - Chef de mission diplomatique
2. **Premier Conseiller** - Second de l'ambassadeur
3. **Payeur** - Responsable financier
4. **Conseiller Économique**
5. **Conseiller Social**
6. **Conseiller Communication**
7. **Chancelier** - Chef de chancellerie
8. **Premier Secrétaire**
9. **Réceptionniste**

---

## 4. Entités et Modèles de Données

### 4.1 Profile (Profil Citoyen)

Structure complète de l'identité d'un citoyen.

| Composant                     | Champs                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------- |
| **Identité**                  | Prénom, Nom, Date/Lieu/Pays de naissance, Genre, Nationalité, Mode d'acquisition |
| **Passeport**                 | Numéro, Dates émission/expiration, Autorité délivrante                           |
| **Carte Consulaire**          | Numéro, Date émission, Date expiration                                           |
| **Contacts**                  | Email, Téléphone, Adresse                                                        |
| **Adresse Résidence**         | Rue, Ville, Code postal, Pays, Coordonnées                                       |
| **Adresse Pays d'Origine**    | Rue, Ville, Code postal, Pays                                                    |
| **Famille**                   | Statut marital, Père, Mère, Conjoint                                             |
| **Contacts d'Urgence**        | Résident + Pays d'origine (Nom, Lien, Téléphone)                                 |
| **Situation Professionnelle** | Statut travail, Profession, Employeur, Activité au Gabon                         |
| **Documents Profil**          | Passeport, Acte naissance, Titre séjour, Justif. domicile, Photo                 |

#### Statuts Profil

- `draft`, `active`, `inactive`, `pending`, `suspended`

#### Statuts Maritaux

- `single`, `married`, `divorced`, `widowed`, `civil_union`, `cohabiting`

#### Statuts Travail

- `self_employed`, `employee`, `entrepreneur`, `unemployed`, `retired`, `student`, `other`

### 4.2 ChildProfile (Profil Enfant)

Profil mineur rattaché à un parent.

| Composant                | Champs                                     |
| ------------------------ | ------------------------------------------ |
| **Identité**             | Même structure que Profile                 |
| **Autorités Parentales** | Rôle (père/mère/tuteur), Identité, Contact |

### 4.3 Organization (Organisation Diplomatique)

Types d'organisations diplomatiques gabonaises.

| Type                   | Description                    |
| ---------------------- | ------------------------------ |
| **CONSULAT_GENERAL**   | Consulat Général               |
| **CONSULAT**           | Consulat                       |
| **AMBASSADE**          | Ambassade                      |
| **HAUT_COMMISSARIAT**  | Haut-Commissariat              |
| **MISSION_PERMANENTE** | Mission Permanente (ONU, etc.) |
| **CONSULAT_HONORAIRE** | Consulat Honoraire             |

**Métadonnées Organisation:**

- Juridiction (pays couverts)
- Contact (adresse, téléphone, email, site web, fax)
- Horaires d'ouverture
- Ville et pays
- Coordonnées GPS
- Notes

### 4.4 ConsularService (Service Consulaire)

Catalogue des services consulaires disponibles.

#### Catégories de Services (9)

| Catégorie         | Description                 |
| ----------------- | --------------------------- |
| `identity`        | Passeport, CNI              |
| `civil_status`    | Actes d'état civil          |
| `visa`            | Visas                       |
| `certification`   | Légalisations, Attestations |
| `transcript`      | Transcriptions              |
| `registration`    | Inscriptions consulaires    |
| `assistance`      | Aide sociale                |
| `travel_document` | Laissez-passer              |
| `other`           | Autres services             |

#### Services Types Prédéfinis (8)

1. **VISA** - Demande/renouvellement visa (Tourisme, Affaires, Transit)
2. **PASSEPORT** - Demande/renouvellement passeport
3. **LEGALISATION** - Légalisation documents officiels
4. **CARTE_CONSULAIRE** - Inscription et carte consulaire
5. **TRANSCRIPTION_NAISSANCE** - Transcription acte naissance
6. **ACTE_CIVIL** - Actes état civil divers
7. **INSCRIPTION_CONSULAIRE** - Inscription registre Gabonais étranger
8. **ATTESTATION** - Attestations diverses (résidence, vie, etc.)

#### Structure d'un Service

| Composant                  | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| **Étapes (Steps)**         | form, documents, appointment, payment, review, delivery             |
| **Traitement**             | Mode (online_only, presence_required, hybrid, by_proxy), RDV requis |
| **Livraison**              | Modes (in_person, postal, electronic, by_proxy)                     |
| **Tarification**           | Gratuit ou prix + devise                                            |
| **Formulaires Dynamiques** | Sections, champs typés, logique conditionnelle                      |

### 4.5 ServiceRequest (Demande de Service)

Gestion du cycle de vie des demandes administratives.

#### Statuts de Demande (12)

| Statut                  | Description        |
| ----------------------- | ------------------ |
| `draft`                 | Brouillon          |
| `pending`               | En attente         |
| `pending_completion`    | Compléments requis |
| `edited`                | Modifiée           |
| `submitted`             | Soumise            |
| `under_review`          | En cours d'examen  |
| `in_production`         | En production      |
| `validated`             | Validée            |
| `rejected`              | Rejetée            |
| `ready_for_pickup`      | Prête à retirer    |
| `appointment_scheduled` | RDV planifié       |
| `completed`             | Terminée           |
| `cancelled`             | Annulée            |

#### Priorités

- `normal`, `urgent`, `critical`

#### Types de Demande

- `first_request`, `renewal`, `modification`, `consular_registration`, `passport_request`, `id_card_request`

### 4.6 Document (Coffre-fort Documents)

Système de gestion documentaire avec structure Dossier → Fichier.

#### Catégories de Documents (8)

| Catégorie      | Description                       | Icône         |
| -------------- | --------------------------------- | ------------- |
| `identity`     | CNI, Passeport, Carte séjour      | User          |
| `civil_status` | Actes naissance, mariage, divorce | Baby          |
| `residence`    | Justificatif domicile, factures   | Home          |
| `education`    | Diplômes, certificats             | GraduationCap |
| `work`         | Contrats, bulletins de paie       | Briefcase     |
| `health`       | Carte CNAMGS, ordonnances         | Heart         |
| `vehicle`      | Permis, carte grise               | Car           |
| `other`        | Documents divers                  | FileText      |

#### Types de Documents Système (18)

`passport`, `birth_certificate`, `identity_card`, `driver_license`, `photo`, `proof_of_address`, `family_book`, `marriage_certificate`, `divorce_decree`, `nationality_certificate`, `visa_pages`, `employment_proof`, `naturalization_decree`, `identity_photo`, `consular_card`, `death_certificate`, `residence_permit`, `other`

#### Statuts Document

- `pending`, `validated`, `rejected`, `expired`, `expiring`

### 4.7 Appointment (Rendez-vous)

Gestion des créneaux et réservations.

#### Statuts RDV

- `draft`, `pending`, `scheduled`, `confirmed`, `completed`, `cancelled`, `missed`, `rescheduled`

#### Types de RDV

- `document_submission`, `document_collection`, `interview`, `marriage_ceremony`, `emergency`, `consultation`, `other`

#### Configuration Planning

- Planning hebdomadaire par jour
- Créneaux horaires avec capacité
- Fuseau horaire

### 4.8 Association

Organisations associatives de la diaspora gabonaise.

#### Types d'Association (10)

| Type           | Description     |
| -------------- | --------------- |
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

#### Rôles Association

- `PRESIDENT`, `VICE_PRESIDENT`, `SECRETARY`, `TREASURER`, `MEMBER`

#### Fonctionnalités

- Système d'invitation membres
- Statuts: `pending`, `accepted`, `declined`
- Validation par l'administration

### 4.9 Company (Entreprise)

Entreprises créées par des ressortissants gabonais.

#### Types d'Entreprise (8)

| Type                | Description                      |
| ------------------- | -------------------------------- |
| `SARL`              | Société à Responsabilité Limitée |
| `SA`                | Société Anonyme                  |
| `SAS`               | Société par Actions Simplifiée   |
| `SASU`              | SAS Unipersonnelle               |
| `EURL`              | SARL Unipersonnelle              |
| `EI`                | Entreprise Individuelle          |
| `AUTO_ENTREPRENEUR` | Auto-entrepreneur                |
| `OTHER`             | Autre                            |

#### Secteurs d'Activité (12)

`TECHNOLOGY`, `COMMERCE`, `SERVICES`, `INDUSTRY`, `AGRICULTURE`, `HEALTH`, `EDUCATION`, `CULTURE`, `TOURISM`, `TRANSPORT`, `CONSTRUCTION`, `OTHER`

#### Rôles Entreprise

- `CEO`, `OWNER`, `PRESIDENT`, `DIRECTOR`, `MANAGER`

### 4.10 CV (Curriculum Vitae)

Module de création de CV professionnel.

| Composant        | Structure                                   |
| ---------------- | ------------------------------------------- |
| **Expériences**  | Titre, Entreprise, Lieu, Dates, Description |
| **Formation**    | Diplôme, École, Lieu, Dates                 |
| **Compétences**  | Nom, Niveau (Beginner → Expert)             |
| **Langues**      | Nom, Niveau (A1 → C2, Native)               |
| **Informations** | Résumé, Loisirs, Portfolio, LinkedIn        |

---

## 5. Pages et Fonctionnalités

### 5.1 Pages Publiques (12)

| Page                   | Description                     |
| ---------------------- | ------------------------------- |
| `Home.tsx`             | Page d'accueil                  |
| `Login.tsx`            | Connexion                       |
| `Index.tsx`            | Redirection                     |
| `Actualites.tsx`       | Actualités consulaires          |
| `WorldNetworkPage.tsx` | Carte du réseau diplomatique    |
| `GlobalHub.tsx`        | Hub global communautaire        |
| `EntityPortal.tsx`     | Portail entité                  |
| `DemoPortal.tsx`       | Portail de démonstration        |
| `NotFound.tsx`         | Page 404                        |
| `/public/*`            | Pages publiques (5 sous-pages)  |
| `/auth/*`              | Authentification (3 sous-pages) |

### 5.2 Dashboard Citoyen (9 pages)

| Page                           | Fonctionnalité            |
| ------------------------------ | ------------------------- |
| `CitizenDashboard.tsx`         | Tableau de bord principal |
| `CitizenServicesPage.tsx`      | Catalogue des services    |
| `CitizenRequestsPage.tsx`      | Mes demandes              |
| `CitizenDocumentsPage.tsx`     | Coffre-fort documents     |
| `CitizenAssociationsPage.tsx`  | Mes associations          |
| `CitizenCompaniesPage.tsx`     | Mes entreprises           |
| `CitizenCVPage.tsx`            | Mon CV                    |
| `CitizenChildrenPage.tsx`      | Profils enfants           |
| `CitizenTimelinePage.tsx`      | Historique activités      |
| `CitizenNotificationsPage.tsx` | Notifications             |
| `CitizenSettingsPage.tsx`      | Paramètres                |

### 5.3 Dashboards Spécifiques (5)

| Dashboard                | Utilisateur cible         |
| ------------------------ | ------------------------- |
| `ResidentDashboard.tsx`  | Gabonais résident +6 mois |
| `PassageDashboard.tsx`   | Gabonais de passage       |
| `ForeignerDashboard.tsx` | Visiteur étranger         |
| `VisitorDashboard.tsx`   | Visiteur général          |
| `AgentDashboard.tsx`     | Agent consulaire          |

### 5.4 Pages Services Dédiées (4)

| Page                          | Service          |
| ----------------------------- | ---------------- |
| `ConsularCardServicePage.tsx` | Carte consulaire |
| `PassportServicePage.tsx`     | Passeport        |
| `LegalizationServicePage.tsx` | Légalisation     |
| `VisaServicePage.tsx`         | Visa             |

### 5.5 Admin Agent (5 pages + sous-pages)

| Page                 | Fonctionnalité                    |
| -------------------- | --------------------------------- |
| `/dashboard/agent/*` | Workspace agent (2 sous-pages)    |
| `/dashboard/admin/*` | Admin organisation (3 sous-pages) |

### 5.6 Super Admin (5 pages)

| Page                          | Fonctionnalité        |
| ----------------------------- | --------------------- |
| `SuperAdminDashboard.tsx`     | Vue d'ensemble        |
| `SuperAdminOrganizations.tsx` | Gestion organisations |
| `OrganizationDetails.tsx`     | Détails organisation  |
| `SuperAdminServices.tsx`      | Gestion services      |
| `SuperAdminUsers.tsx`         | Gestion utilisateurs  |
| `SuperAdminSettings.tsx`      | Paramètres globaux    |

### 5.7 Modules Communautaires

#### Associations (3 pages)

- `AssociationsPage.tsx` - Liste des associations
- `AssociationDetailsPage.tsx` - Détails association
- `NewAssociationPage.tsx` - Créer association

#### Entreprises (3 pages)

- `CompaniesPage.tsx` - Liste entreprises
- `CompanyDetailsPage.tsx` - Détails entreprise
- `NewCompanyPage.tsx` - Créer entreprise

### 5.8 Autres Pages

| Route               | Description                      |
| ------------------- | -------------------------------- |
| `/appointments/*`   | Rendez-vous (1 page)             |
| `/documents/*`      | Documents (1 page)               |
| `/requests/*`       | Demandes (2 pages)               |
| `/registration/*`   | Inscription consulaire (2 pages) |
| `/cv/*`             | CV (1 page)                      |
| `/iboite/*`         | Module Boîte (1 page)            |
| `/icarte/*`         | Module Carte (1 page)            |
| `SettingsPage.tsx`  | Paramètres globaux               |
| `MessagingPage.tsx` | Messagerie                       |

---

## 6. Services Business (19)

| Service                          | Responsabilité                |
| -------------------------------- | ----------------------------- |
| `appointmentService.ts`          | Gestion des rendez-vous       |
| `association-service.ts`         | Gestion associations          |
| `company-service.ts`             | Gestion entreprises           |
| `cv-service.ts`                  | Gestion CV                    |
| `document-service.ts`            | CRUD documents                |
| `documentDossierService.ts`      | Gestion dossiers documents    |
| `documentGenerationService.ts`   | Génération PDF                |
| `documentNotificationService.ts` | Notifications documents       |
| `documentOCRService.ts`          | OCR et extraction IA          |
| `documentUploadService.ts`       | Upload documents              |
| `idocumentService.ts`            | Interface document principale |
| `notificationService.ts`         | Notifications utilisateur     |
| `organizationService.ts`         | Gestion organisations         |
| `pdfGenerationService.ts`        | Génération PDF                |
| `profileService.ts`              | Gestion profils               |
| `requestService.ts`              | Gestion demandes              |
| `serviceCatalog.ts`              | Catalogue services            |
| `serviceRequestService.ts`       | Demandes de service           |
| `signatureService.ts`            | Signatures électroniques      |

---

## 7. Composants UI (147)

### 7.1 Composants Globaux (13)

- Header, Footer, NavLink
- JurisdictionSelector
- InteractiveWorldMap, WorldMapVisual
- EntityCard, DemoUserCard, RoleCard
- SimulationBanner, GlobalSettings
- SidebarAppearance
- LanguageToggle

### 7.2 Composants par Domaine

| Domaine         | Nombre | Exemples                             |
| --------------- | ------ | ------------------------------------ |
| `ui/`           | 50     | Button, Input, Card, Dialog, etc.    |
| `cv/`           | 19     | CVEditor, ExperienceForm, SkillsList |
| `iasted/`       | 9      | Composants assistant IA              |
| `dashboard/`    | 9      | Widgets tableau de bord              |
| `documents/`    | 6      | DocumentViewer, UploadZone           |
| `admin/`        | 6      | AgentTools, AdminPanel               |
| `auth/`         | 4      | LoginForm, SignUpForm                |
| `mail/`         | 4      | Messagerie                           |
| `companies/`    | 3      | CompanyCard, CompanyForm             |
| `associations/` | 3      | AssociationCard, MembersList         |
| `hub/`          | 3      | CommunityHub                         |
| `registration/` | 3      | RegistrationWizard                   |
| `services/`     | 2      | ServiceCard, ServiceDetail           |
| `super-admin/`  | 3      | AdminDashboardWidgets                |
| `layout/`       | 2      | MainLayout, Sidebar                  |

---

## 8. Notifications (12 types)

| Type                              | Description              |
| --------------------------------- | ------------------------ |
| `updated`                         | Mise à jour générale     |
| `reminder`                        | Rappel                   |
| `confirmation`                    | Confirmation             |
| `cancellation`                    | Annulation               |
| `communication`                   | Communication            |
| `important_communication`         | Communication importante |
| `appointment_confirmation`        | Confirmation RDV         |
| `appointment_reminder`            | Rappel RDV               |
| `appointment_cancellation`        | Annulation RDV           |
| `consular_registration_submitted` | Inscription soumise      |
| `consular_registration_validated` | Inscription validée      |
| `consular_registration_rejected`  | Inscription rejetée      |
| `consular_card_ready`             | Carte prête              |
| `consular_registration_completed` | Inscription terminée     |
| `feedback`                        | Retour utilisateur       |

**Canaux:** App, Email, SMS

---

## 9. Internationalisation

### 9.1 Langues Supportées

- **Français** (par défaut)
- **Anglais**

### 9.2 Fichiers de Traduction (10)

Localisés dans `/src/i18n/`

---

## 10. Schéma Base de Données (Supabase)

### 10.1 Tables Principales (6)

```sql
-- Organizations (Consulats, Ambassades)
organizations (id, name, logo, type, status, metadata)

-- Consular Services (Catalogue)
consular_services (id, name, description, organization_id, is_active, requirements, price, currency)

-- Profiles (Citoyens)
profiles (id, user_id, first_name, last_name, birth_date, birth_place, nationality, passport_number, phone, address)

-- Service Requests (Demandes)
service_requests (id, service_id, user_id, profile_id, organization_id, status, data, tracking_number)

-- Documents
documents (id, name, type, url, user_id, request_id, status, metadata)

-- Appointments (Rendez-vous)
appointments (id, organization_id, service_id, user_id, request_id, start_time, end_time, status, notes)
```

### 10.2 Enums Base de Données

- `user_role`: SUPER_ADMIN, ADMIN, AGENT, CITIZEN, FOREIGNER
- `organization_type`: EMBASSY, CONSULATE, GENERAL_CONSULATE, HONORARY_CONSULATE, OTHER
- `organization_status`: ACTIVE, INACTIVE, SUSPENDED
- `request_status`: DRAFT, SUBMITTED, IN_REVIEW, ACTION_REQUIRED, APPROVED, REJECTED, COMPLETED, CANCELLED

---

## 11. Intégrations

### 11.1 Authentification (Clerk)

- Connexion sociale (Google, etc.)
- RBAC multi-tenant
- Gestion des sessions

### 11.2 Paiements (Stripe)

- Stripe Elements
- PaymentIntent
- Suivi transactions

### 11.3 IA (Google Gemini)

- OCR et extraction documents
- Analyse automatique soumissions
- Détection anomalies
- Assistant contextuel

### 11.4 Emails (Resend)

- Notifications transactionnelles
- Rappels RDV
- Confirmations

---

## 12. Services par Type d'Usager

### 12.1 Résident Gabonais (+6 mois)

Accès complet: inscription consulaire, carte consulaire, passeports, état civil, certificats, légalisations, actes notariés

### 12.2 Gabonais de Passage (-6 mois)

Accès limité: déclaration temporaire, laissez-passer urgence, certificat de vie, légalisation

### 12.3 Visiteur Visa Tourisme

Visa tourisme, visa transit

### 12.4 Visiteur Visa Affaires

Visa affaires, visa court séjour, visa long séjour

### 12.5 Visiteur Service Gabon

Légalisation, apostille, certificat douanier, certification documents

---

## 13. Sécurité

### 13.1 Authentification

- Authentification via Clerk
- Sessions sécurisées
- 2FA disponible

### 13.2 Autorisation

- RBAC (Role-Based Access Control) côté backend
- Vérification permissions par organisation
- Hiérarchie des rôles consulaires

### 13.3 Données

- Soft delete pour traçabilité
- Audit trail des modifications
- Chiffrement en transit

---

## 14. Fonctionnalités Futures

| Module                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| **Intelligence**         | Dossiers multi-auteurs, observations catégorisées |
| **Prédictions IA**       | Analyse flux et tendances                         |
| **Annuaire Compétences** | Répertoire professionnels diaspora                |
| **Application Mobile**   | App iOS/Android native                            |
| **Notifications Push**   | Alertes temps réel                                |
| **Intégration EasyCard** | Impression cartes physiques                       |

---

## 15. Statistiques du Projet

| Métrique                   | Valeur        |
| -------------------------- | ------------- |
| **Pages**                  | 68            |
| **Composants**             | 147           |
| **Services Business**      | 19            |
| **Types de Données**       | 20+           |
| **Enums/Constantes**       | 35+           |
| **Fichiers de Traduction** | 10            |
| **Tables Base de Données** | 6 principales |
| **Rôles Consulaires**      | 15            |
| **Types d'Organisations**  | 6             |
| **Catégories Services**    | 9             |
| **Types Documents**        | 18            |
| **Types Associations**     | 10            |
| **Types Entreprises**      | 8             |
| **Secteurs d'Activité**    | 12            |

---

_Document généré automatiquement le 3 Février 2026_
