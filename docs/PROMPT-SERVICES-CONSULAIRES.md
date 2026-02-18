# Prompt — Enrichissement des Services Consulaires du site Consulat.ga

## Contexte du projet

Tu travailles sur le site officiel du **Consulat Général du Gabon en France** (`france.consulat.ga`).

**Coordonnées officielles du Consulat :**
- Adresse : 26 bis, avenue Raphaël — 75016 Paris
- Email : consulatgeneralgabon@yahoo.fr

**Stack technique :** React 19 + TypeScript + TanStack Router (file-based routing) + Tailwind CSS v4 + shadcn/ui + i18next (FR/EN) + Lucide React icons.

**Design system :** Glass morphism (`glass-card`, `glass-panel`, `glass-section`, `text-gradient`, `animate-pulse-glow`, `animate-float`). Toutes les cartes utilisent des `div` avec classes glass, pas les composants `Card` de shadcn.

**Structure du site :**
- `/` — Accueil
- `/services` — Services consulaires (page cible principale de ce prompt)
- `/vie-en-france` — Guide de vie en France
- `/integration` — Page d'intégration et sensibilisation
- `/actualites` — Actualités
- `/le-consulat` — Présentation du consulat
- `/contact` — Contact

---

## OBJECTIF

Enrichir la page **Services** (`/services`) et les pages associées avec les **19 actes consulaires** détaillés ci-dessous, extraits du document officiel "Fiche Technique des Actes Consulaires". Chaque service doit avoir sa fiche complète avec : description, documents requis, tarifs, délais et procédure.

---

## PARTIE 1 — CATALOGUE DES SERVICES CONSULAIRES

---

### SERVICE 1 : Carte Consulaire

**Description :** Document d'identification des ressortissants gabonais résidant en France. Obligatoire pour tout Gabonais vivant sur le territoire français.

**Documents requis :**
- 1 copie de l'acte de naissance (datant de moins de 6 mois)
- 1 copie du passeport en cours de validité
- 1 copie du titre de séjour en cours de validité
- 1 justificatif de domicile récent
- 2 photos d'identité (format officiel)

**Tarif : 20 €**

**Catégorie :** Consulat

---

### SERVICE 2 : Tenant Lieu de Passeport

**Description :** Document provisoire délivré en remplacement d'un passeport perdu, volé ou expiré, permettant de voyager temporairement.

**Validité : 1 an**

**Documents requis :**
- Déclaration de perte ou de vol (récépissé du commissariat)
- 1 copie de l'ancien passeport (si disponible)
- 1 copie de l'acte de naissance
- 1 copie du titre de séjour
- 1 justificatif de domicile
- 2 photos d'identité

**Tarif : 55 €**

**Catégorie :** Consulat

---

### SERVICE 3 : Laissez-Passer

**Description :** Document de voyage d'urgence délivré pour un trajet unique (aller simple), notamment en cas de rapatriement ou de voyage urgent sans passeport.

**Validité : 30 jours**

**Documents requis :**
- Déclaration de perte ou de vol du passeport
- 1 copie de l'acte de naissance
- 1 copie du titre de séjour (si applicable)
- 1 justificatif de domicile
- 2 photos d'identité
- Justificatif du motif du voyage (billet d'avion, certificat médical, etc.)

**Tarif : 55 €**

**Catégorie :** Consulat | Urgent

---

### SERVICE 4 : Attestation Patronymique

**Description :** Acte officiel permettant aux parents d'attribuer un nom et un (des) prénom(s) à un enfant à naître. Peut être établie avant la naissance.

**Documents requis :**
- Copie des pièces d'identité des deux parents (passeport ou carte d'identité)
- Copie de l'acte de mariage des parents (si mariés)
- Certificat de grossesse ou attestation médicale
- Copie du livret de famille (si existant)

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 5 : Transcription de l'Acte de Naissance

**Description :** Enregistrement dans les registres consulaires d'un acte de naissance établi à l'étranger (en France). Obligatoire pour que l'état civil gabonais reconnaisse la naissance.

**Documents requis :**
- Copie intégrale de l'acte de naissance français (délivrée par la mairie du lieu de naissance)
- Copie des pièces d'identité des deux parents
- Copie de l'acte de mariage des parents (si mariés)
- Copie du livret de famille
- Copie des titres de séjour des parents
- 2 photos d'identité de l'enfant (si applicable)

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 6 : Certificat de Coutume et Certificat de Célibat

**Description :**
- **Certificat de coutume** : atteste des dispositions du droit gabonais en matière de mariage. Requis par les mairies françaises pour le mariage d'un ressortissant gabonais en France.
- **Certificat de célibat** : atteste que le ressortissant n'est pas engagé dans les liens du mariage au Gabon.

**Documents requis (certificat de coutume) :**
- Copie de l'acte de naissance (moins de 6 mois)
- Copie du passeport
- Copie du titre de séjour
- Copie de la pièce d'identité du futur conjoint
- Justificatif de domicile

**Documents requis (certificat de célibat) :**
- Copie de l'acte de naissance (moins de 6 mois)
- Copie du passeport
- Attestation sur l'honneur de célibat
- Copie du titre de séjour

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 7 : Attestation de Concordance

**Description :** Certifie qu'une même personne est désignée sous des noms ou prénoms différents dans différents documents (erreurs orthographiques, variantes d'état civil). Utile pour les démarches administratives où les documents présentent des incohérences.

**Documents requis :**
- Copie des documents présentant les divergences
- Copie de l'acte de naissance
- Copie du passeport
- Tout document prouvant qu'il s'agit de la même personne

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 8 : Fiche Familiale d'État Civil

**Description :** Document récapitulant la composition familiale d'un ressortissant gabonais (conjoint, enfants). Utilisée pour les démarches administratives, sociales et fiscales en France.

**Documents requis :**
- Copie de l'acte de mariage
- Copie des actes de naissance de tous les enfants
- Copie du passeport du demandeur
- Copie du titre de séjour
- Copie du livret de famille

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 9 : Certificat de Nationalité

**Description :** Document officiel attestant que le titulaire possède la nationalité gabonaise. Peut être exigé pour certaines démarches administratives ou juridiques.

**Documents requis :**
- Copie de l'acte de naissance
- Copie du passeport gabonais
- Copie des actes de naissance des parents (pour prouver la filiation)
- Copie du certificat de nationalité des parents (si disponible)
- 2 photos d'identité

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 10 : Attestation de Revenus

**Description :** Atteste des revenus perçus par un ressortissant gabonais. Peut être requise pour des démarches au Gabon (succession, demande de prêt, etc.).

**Documents requis :**
- Copie du passeport
- Copie du titre de séjour
- Justificatifs de revenus (bulletins de salaire, avis d'imposition, attestation employeur)
- Justificatif de domicile

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 11 : Attestation de Validité du Permis de Conduire

**Description :** Atteste de la validité d'un permis de conduire gabonais pour les démarches d'échange de permis en France ou pour toute utilisation administrative.

**Documents requis :**
- Copie du permis de conduire gabonais
- Copie du passeport
- Copie du titre de séjour
- Justificatif de domicile
- Traduction assermentée du permis de conduire (si nécessaire)

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 12 : Attestation de Capacité Juridique

**Description :** Certifie qu'une personne jouit de sa pleine capacité juridique (n'est pas sous tutelle, curatelle ou interdiction). Utile pour les transactions immobilières, les procurations, les actes notariés.

**Documents requis :**
- Copie de l'acte de naissance
- Copie du passeport
- Copie du titre de séjour
- Attestation sur l'honneur de capacité juridique
- Justificatif de domicile

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 13 : Attestation de Filiation

**Description :** Établit officiellement le lien de filiation entre un enfant et ses parents. Peut être nécessaire pour les démarches de regroupement familial, de succession ou d'état civil.

**Documents requis :**
- Copie de l'acte de naissance de l'enfant
- Copie des actes de naissance des parents
- Copie du livret de famille
- Copie des passeports des parents et de l'enfant
- Acte de reconnaissance (si applicable)

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 14 : Certificat de Vie et d'Entretien

**Description :** Atteste qu'une personne est en vie et, le cas échéant, qu'elle est prise en charge par un tiers. Requis par les caisses de retraite, les organismes sociaux ou pour des démarches de succession.

**Documents requis :**
- Copie du passeport
- Copie du titre de séjour
- Justificatif de domicile
- Formulaire de l'organisme demandeur (le cas échéant)

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

**Note :** La présence physique du demandeur au consulat est généralement requise.

---

### SERVICE 15 : Attestation de Rapatriement de Corps

**Description :** Document administratif nécessaire pour le rapatriement de la dépouille d'un ressortissant gabonais décédé en France vers le Gabon.

**Documents requis :**
- Copie de l'acte de décès (délivré par la mairie française)
- Copie du passeport du défunt
- Copie de la carte consulaire du défunt
- Certificat de non-contagion (délivré par un médecin)
- Certificat de mise en bière hermétique
- Autorisation de transport du corps (délivrée par la préfecture)
- Copie de la pièce d'identité de la personne prenant en charge les formalités

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat | Urgent

**Note :** Procédure complexe impliquant plusieurs administrations françaises et gabonaises. Le consulat accompagne les familles dans l'ensemble des démarches.

---

### SERVICE 16 : Légalisation de Documents

**Description :** Authentification de la signature apposée sur un document d'origine gabonaise pour qu'il soit reconnu valide en France, ou inversement. La légalisation confirme que le signataire avait qualité pour signer.

**Documents requis :**
- Original du document à légaliser
- Copie du passeport du demandeur
- Copie du titre de séjour

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 17 : Transcription de l'Acte de Mariage

**Description :** Enregistrement dans les registres consulaires d'un mariage célébré en France. Permet la reconnaissance du mariage par l'état civil gabonais.

**Documents requis :**
- Copie intégrale de l'acte de mariage français
- Copie des actes de naissance des deux époux
- Copie des passeports des deux époux
- Copie des titres de séjour
- Copie du livret de famille français (si délivré)
- Certificat de coutume (si le mariage a été célébré avec un certificat de coutume gabonais)

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 18 : Transcription de l'Acte de Décès

**Description :** Enregistrement dans les registres consulaires d'un décès survenu en France. Permet la reconnaissance du décès par l'état civil gabonais et est nécessaire pour les procédures de succession.

**Documents requis :**
- Copie intégrale de l'acte de décès français
- Copie de l'acte de naissance du défunt
- Copie du passeport du défunt
- Copie de la carte consulaire du défunt
- Copie de la pièce d'identité du déclarant

**Tarif :** Selon grille tarifaire consulaire en vigueur

**Catégorie :** Consulat

---

### SERVICE 19 : Célébration du Mariage au Consulat

**Description :** Le Consulat Général peut célébrer des mariages entre ressortissants gabonais ou entre un ressortissant gabonais et un étranger, conformément au droit gabonais.

**Tarifs :**
- **Célébration au consulat : 250 €**
- **Pénalité de retard : 50 € par tranche de 30 minutes** de retard le jour de la célébration
- **Célébration hors du consulat :**
  - En Île-de-France : **500 €**
  - En Province : **1 000 €**

**Documents requis :**
- Actes de naissance des deux époux (moins de 6 mois)
- Copie des passeports des deux époux
- Copie des titres de séjour
- Certificat de célibat (pour le ressortissant gabonais)
- Certificat de coutume
- Certificat médical prénuptial
- Justificatifs de domicile
- Liste des témoins (2 minimum, 4 maximum) avec copies de leurs pièces d'identité
- Publication des bans (au moins 10 jours avant la date de célébration)

**Catégorie :** Consulat

---

## PARTIE 2 — CONSEILS PRATIQUES (déjà intégrés dans le prompt précédent)

Les données de la deuxième partie (régularisation, admission en France, carte de séjour, OQTF, arrestation, binationaux, etc.) sont disponibles dans le fichier `PROMPT-ENRICHISSEMENT-SITE.md`. Ce prompt se concentre sur les **19 services consulaires** de la Partie 1.

---

## INSTRUCTIONS D'INTÉGRATION AU SITE

### A. Architecture de la Page Services (`/services`)

Organise les 19 services en **catégories logiques** avec des onglets ou des sections :

**1. Identité & Documents de voyage**
- Carte consulaire (20 €)
- Tenant lieu de passeport (55 €, validité 1 an)
- Laissez-passer (55 €, validité 30 jours)

**2. État civil — Naissances**
- Attestation patronymique
- Transcription de l'acte de naissance
- Attestation de filiation

**3. État civil — Mariages**
- Certificat de coutume
- Certificat de célibat
- Transcription de l'acte de mariage
- Célébration du mariage (250 € au consulat / 500 € IDF / 1 000 € province)

**4. État civil — Décès**
- Transcription de l'acte de décès
- Attestation de rapatriement de corps

**5. Attestations & Certificats**
- Attestation de concordance
- Fiche familiale d'état civil
- Certificat de nationalité
- Attestation de revenus
- Attestation de validité du permis de conduire
- Attestation de capacité juridique
- Certificat de vie et d'entretien

**6. Autres services**
- Légalisation de documents

### B. Composant ServiceCard enrichi

Pour chaque service, crée une **ServiceCard** contenant :

```
┌─────────────────────────────────────────┐
│ [Badge catégorie]        [Badge urgent] │
│                                         │
│ 🏛️ Titre du service                    │
│                                         │
│ Description courte (2-3 lignes)         │
│                                         │
│ 💰 Tarif : XX €    📅 Validité : X an  │
│                                         │
│ [📋 Voir la fiche]  [📝 Faire la demande] │
└─────────────────────────────────────────┘
```

### C. Fiches détaillées (Modal ou Drawer)

Quand l'utilisateur clique sur "Voir la fiche", affiche un **drawer/modal** avec :
1. **Titre** du service
2. **Description** complète
3. **Documents requis** — liste à puces avec icônes
4. **Tarif** mis en évidence
5. **Validité** (si applicable)
6. **Notes importantes** (alertes visuelles pour les précisions critiques)
7. **Bouton CTA** : "Prendre rendez-vous" ou "Contacter le consulat"

### D. Badges visuels par catégorie

- 🟢 **Identité** — vert
- 🔵 **État civil** — bleu
- 🟡 **Attestations** — jaune/doré
- 🟣 **Légalisation** — violet
- 🔴 **Urgent** — rouge (laissez-passer, rapatriement de corps)

### E. Section Tarifs

Crée une section ou une page `/tarifs` avec un **tableau récapitulatif** de tous les tarifs :

| Service | Tarif | Validité |
|---------|-------|----------|
| Carte consulaire | 20 € | — |
| Tenant lieu de passeport | 55 € | 1 an |
| Laissez-passer | 55 € | 30 jours |
| Célébration mariage (consulat) | 250 € | — |
| Célébration mariage (IDF) | 500 € | — |
| Célébration mariage (province) | 1 000 € | — |
| Pénalité retard mariage | 50 € / 30 min | — |
| Autres actes | Tarif consulaire en vigueur | — |

### F. FAQ spécifique aux services

Ajoute ces questions à la FAQ :
- "Combien coûte la carte consulaire et quels documents fournir ?"
- "Comment obtenir un laissez-passer en urgence ?"
- "Quels documents faut-il pour transcrire un acte de naissance ?"
- "Comment se marier au consulat ? Quel est le tarif ?"
- "Peut-on célébrer un mariage hors du consulat et à quel prix ?"
- "Comment faire légaliser un document gabonais en France ?"
- "Comment obtenir un certificat de coutume pour se marier en mairie ?"
- "Quelle est la procédure de rapatriement de corps vers le Gabon ?"
- "Comment obtenir un certificat de nationalité gabonaise ?"
- "Qu'est-ce qu'une attestation de concordance et quand en a-t-on besoin ?"
- "Comment faire transcrire un mariage célébré en France ?"
- "Qu'est-ce que le tenant lieu de passeport et dans quel cas le demander ?"

### G. Traductions i18n

Toutes les nouvelles entrées doivent être ajoutées dans :
- `src/integrations/i18n/locales/fr.json`
- `src/integrations/i18n/locales/en.json`

Structure de clés suggérée :
```json
{
  "services": {
    "categories": {
      "identity": "Identité & Documents de voyage",
      "civilStatus": "État civil",
      "certificates": "Attestations & Certificats",
      "legalization": "Légalisation",
      "births": "Naissances",
      "marriages": "Mariages",
      "deaths": "Décès"
    },
    "carteConsulaire": {
      "title": "Carte Consulaire",
      "description": "...",
      "price": "20 €",
      "documents": ["..."],
      "category": "identity"
    },
    "tenantLieu": {
      "title": "Tenant Lieu de Passeport",
      "description": "...",
      "price": "55 €",
      "validity": "1 an",
      "documents": ["..."],
      "category": "identity"
    }
  }
}
```

### H. Design et UX

- Respecte le design system glass morphism existant
- Utilise des **onglets** ou un **filtre par catégorie** pour naviguer entre les groupes de services
- Chaque ServiceCard doit afficher le **tarif** de manière visible (badge ou étiquette)
- Les services urgents (laissez-passer, rapatriement) doivent avoir un **indicateur visuel** rouge
- Ajoute une **barre de recherche** sur la page services pour filtrer par mot-clé
- Le **tableau des tarifs** doit être responsive et facilement consultable sur mobile
- Ajoute un **bouton flottant "Contacter le consulat"** en bas de page
- Mobile-first : toutes les fiches doivent être parfaitement lisibles sur smartphone

### I. Liens avec les autres pages

- Depuis `/services` → lien vers `/integration` pour les guides pratiques
- Depuis `/services` → lien vers `/vie-en-france` pour les démarches préfectorales
- Depuis chaque fiche service → lien vers le formulaire de contact `/contact`
- Depuis la page d'accueil `/` → section "Services populaires" avec les 4-5 services les plus demandés (carte consulaire, transcription naissance, certificat de coutume, célébration mariage, laissez-passer)
