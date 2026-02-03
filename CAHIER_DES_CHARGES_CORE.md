# 📋 Cahier des Charges - Consulat Core

## La Super-App de la Diaspora

**Version:** 2.0 (Core)  
**Date:** Février 2026  
**Projet:** Consulat Core - Écosystème Global de Services pour la Diaspora

---

## 1. Vision du Projet

**Consulat Core** ne se limite pas aux démarches administratives. C'est une plateforme holistique conçue pour accompagner le citoyen dans tous les aspects de sa vie à l'étranger : administration, carrière, santé, vie associative et réseau communautaire.

---

## 2. Stack Technique (Core)

- **Frontend :** React + Vite + TypeScript
- **State Management :** TanStack Query + Zustand
- **UI System :** Tailwind CSS + shadcn/ui + Framer Motion
- **Backend :** Supabase (Auth, PostgreSQL, Edge Functions, Storage)
- **Cartographie :** Mapbox GL
- **IA :** Intégration IAsted (Assistant conversationnel multimodal)
- **i18n :** Système de traduction multilingue complet

---

## 3. Architecture des Rôles (Segmentation Avancée)

Contrairement aux systèmes classiques, le Core segmente les usagers pour personnaliser l'expérience :

- **Résident :** Citoyen établi durablement à l'étranger.
- **En Passage :** Citoyen en court séjour (tourisme, affaires).
- **Visiteur/Étranger :** Non-nationaux nécessitant des visas ou services.
- **Étudiant :** Parcours spécifique via le hub IASTED.

---

## 4. Modules "Signature" (Innovations)

### 4.1 IAsted (L'Intelligence Artificielle)

Un assistant IA intégré présent partout sur la plateforme.

- **Multimodalité :** Support chat, audio et vidéo.
- **Aide au remplissage :** Assistance en temps réel pour les formulaires.
- **Support documentaire :** Analyse et classification automatique des pièces jointes.
- **Hub IAsted :** Portail central des connaissances et tutoriels.

### 4.2 iCV & Talents (Smart Careers)

Un module complet de gestion de carrière pour la diaspora.

- **CV Builder :** Générateur de CV professionnel multithème.
- **Smart Score :** Algorithme de scoring des compétences.
- **Import intelligent :** Analyse et extraction de données depuis des CV existants.
- **Répertoire de compétences :** Visibilité des talents de la diaspora pour les entreprises.

### 4.3 iCarte & iBoite (Identité & Courrier)

- **iCarte :** Portefeuille d'identité numérique (Carte consulaire, Carte d'étudiant, etc.).
- **iBoite :** Boîte aux lettres numérique sécurisée pour recevoir les documents officiels signés numériquement.
- **QR Code :** Vérification instantanée de l'authenticité des documents.

### 4.4 Réseau Mondial (Data Visualisation)

- **Carte Interactive :** Visualisation cartographique (Mapbox) de la présence gabonaise dans le monde.
- **Jurisdictions :** Découpage administratif mondial avec sélecteur de juridictions intelligent.

### 4.5 Santé (Intégration CNAMGS)

- **Mini-Carte CNAMCGS :** Visualisation des droits à l'assurance maladie.
- **Bilan de santé :** Suivi basique et informations médicales pour les expatriés.

---

## 5. Modules Écosystème

### 5.1 Associations & ONG

- Création et gestion de profils associatifs.
- Annuaire communautaire des associations de la diaspora.
- Gestion des membres et communications.

### 5.2 Entreprises & Business

- Annuaire des entreprises créées ou gérées par la diaspora.
- Services B2B et visibilité commerciale.

---

## 6. Services Consulaires (Backend Supabase)

### 6.1 Workflow Standardisé

- **Gestion des demandes :** Système de tickets avec timeline interactive.
- **Rendez-vous :** Prise de RDV en ligne avec gestion des créneaux par organisation.
- **Paiements :** Intégration (prévue) pour les frais de chancellerie.

### 6.2 Modèle de Données (Supabase)

- `organizations` : Ambassades, Consulats et Représentations.
- `consular_services` : Catalogue des prestations avec prix et pré-requis.
- `profiles` : Données d'identité étendues.
- `service_requests` : Suivi des dossiers avec meta-data dynamiques (JSONB).
- `appointments` : Gestion calendaire.
- `documents` : Gestionnaire de fichiers sécurisé.

---

## 7. Interfaces Utilisateur (Hub-Centric)

### 7.1 Global Hub

Portail d'entrée centralisant les informations par catégorie :

- **Information :** Guides et procédures.
- **Tutorials :** Vidéos et aides IA.
- **Community :** Forums et réseaux.

### 7.2 Cockpits (Diplomatic Spaces)

Interfaces dédiées pour les Ambassadeurs et Consuls :

- **Tableau de bord de pilotage.**
- **Gestion d'équipe (Agents).**
- **Statistiques de performance.**

---

## 8. Différenciateurs Stratégiques

1. **Unification :** Remplace 5 à 10 sites différents par une seule application.
2. **Mobilité :** Approche "Mobile First" avec identité numérique portable.
3. **Engagement :** Système de notifications et timeline pour réduire l'anxiété de l'usager.
4. **Intelligence :** IAsted réduit la charge de travail des agents en filtrant les erreurs en amont.
