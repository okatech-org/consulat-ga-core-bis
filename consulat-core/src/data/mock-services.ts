import { ConsularService } from "@/types/services";

// MOCK SERVICES with placeholder images
export const MOCK_SERVICES: ConsularService[] = [
    // PROTECTION ET ASSISTANCE CONSULAIRE (Nouveau cadre légal 2024)
    {
        id: 'consular-protection',
        name: 'Protection et Assistance Consulaire',
        description: 'Assistance d\'urgence aux ressortissants gabonais en situation de détresse avérée. Ce service couvre l\'assistance juridique, le rapatriement sanitaire ou mortuaire, et l\'intervention en cas d\'arrestation, conformément aux dispositions de la loi n°006/2023.',
        category: 'ASSISTANCE',
        is_active: true,
        requirements: [
            'Preuve de nationalité gabonaise (Passeport, CNI)',
            'Justificatif probant de la situation de détresse',
            'Rapport des autorités locales (Police, Hôpital) si applicable',
            'Preuve de résidence ou de séjour dans la juridiction'
        ],
        price: 0,
        currency: 'XAF',
        imageUrl: '/images/services/protection.png',
        legalBasis: {
            reference: 'Loi n°006/2023 du 2 novembre 2023',
            title: 'Portant protection ou assistance consulaire des Gabonais à l\'étranger',
            link: 'https://www.mines.gouv.ga/object.getObject.do?id=979&object=file&mime=file-mime'
        },
        assistanceDetails: {
            beneficiaries: ['Ressortissants gabonais immatriculés', 'Conjoints et enfants mineurs', 'Touristes de passage (urgence uniquement)'],
            situations: [
                'Arrestation ou détention arbitraire',
                'Accident grave ou maladie nécessitant une évacuation',
                'Décès d\'un ressortissant et rapatriement de dépouille',
                'Victime de violences, traite ou trafic',
                'Perte ou vol de documents de voyage',
                'Crise politique ou catastrophe naturelle'
            ],
            fundAmount: 'Fonds de Solidarité des Gabonais de l\'Étranger',
            limitations: [
                'Ne couvre pas les dettes privées (hôtels, amendes)',
                'L\'assistance financière est remboursable (sauf indigence prouvée)',
                'Ne permet pas d\'intervenir dans les décisions de justice locales'
            ]
        }
    },

    // PASSEPORTS
    {
        id: 'passport-ordinary',
        name: 'Passeport Ordinaire Biométrique',
        description: 'Délivrance et renouvellement du passeport biométrique CEMAC. Ce document de voyage sécurisé est valide 5 ans et permet la libre circulation. La présence du demandeur est obligatoire pour la capture des données biométriques.',
        category: 'PASSPORT',
        is_active: true,
        requirements: [
            'Acte de naissance légalisé',
            'Ancien passeport (si renouvellement)',
            '2 photos d\'identité couleur fond blanc (4x4)',
            'Justificatif de domicile récent',
            'Attestation d\'emploi ou certificat de scolarité',
            'Carte Consulaire en cours de validité'
        ],
        price: 85,
        currency: 'EUR',
        imageUrl: '/images/services/passport.png',
        legalBasis: {
            reference: 'Décret n°0281/PR/MAEISRGE',
            title: 'Fixant les modalités pratiques de gestion des passeports biométriques'
        }
    },
    {
        id: 'tenant-lieu-passeport',
        name: 'Tenant lieu de passeport',
        description: 'Document de voyage provisoire délivré à titre exceptionnel aux ressortissants gabonais dépourvus de passeport, permettant le retour au Gabon ou vers le lieu de résidence.',
        category: 'PASSPORT',
        is_active: true,
        requirements: [
            'Déclaration de perte ou de vol (Police locale)',
            'Copie de l\'acte de naissance ou CNI',
            '2 photos d\'identité',
            'Billet d\'avion confirmé'
        ],
        price: 30,
        currency: 'EUR',
        imageUrl: '/images/services/passport.png',
        legalBasis: {
            reference: 'Décret n°0281/PR/MAEISRGE',
            title: 'Fixant les modalités pratiques de gestion des documents de voyage'
        }
    },
    {
        id: 'laissez-passer',
        name: 'Laissez-Passer Consulaire',
        description: 'Titre de voyage provisoire valide pour un seul trajet direct vers le Gabon. Délivré en cas de perte ou vol de passeport pour permettre le retour urgent au pays.',
        category: 'PASSPORT',
        is_active: true,
        requirements: [
            'Déclaration de perte ou de vol (Police locale)',
            'Copie de l\'acte de naissance ou CNI',
            '2 photos d\'identité',
            'Billet d\'avion confirmé vers le Gabon'
        ],
        price: 30,
        currency: 'EUR',
        imageUrl: '/images/services/passport.png',
    },

    // VISAS
    {
        id: 'visa-tourist',
        name: 'Visa Tourisme (Court Séjour)',
        description: 'Autorisation d\'entrée pour les ressortissants étrangers souhaitant visiter le Gabon pour le tourisme ou une visite familiale. Valide pour une entrée (1 mois) ou entrées multiples (3 mois).',
        category: 'VISA',
        is_active: true,
        requirements: [
            'Passeport valide au moins 6 mois',
            'Formulaire de demande rempli',
            'Réservation d\'hôtel ou Certificat d\'hébergement légalisé',
            'Billet d\'avion Aller-Retour',
            'Assurance voyage internationale'
        ],
        price: 60,
        currency: 'EUR',
        imageUrl: '/images/services/visa.png',
    },
    {
        id: 'visa-business',
        name: 'Visa Affaires',
        description: 'Destiné aux opérateurs économiques et professionnels se rendant au Gabon pour des réunions, conférences ou prospection. Ne permet pas d\'exercer une activité salariée sur place.',
        category: 'VISA',
        is_active: true,
        requirements: [
            'Lettre d\'invitation d\'une entreprise au Gabon',
            'Ordre de mission de l\'employeur',
            'Registre de commerce de l\'entreprise invitante',
            'Passeport valide et photos'
        ],
        price: 90,
        currency: 'EUR',
        imageUrl: '/images/services/visa.png',
    },
    {
        id: 'visa-long-stay',
        name: 'Visa Long Séjour / Installation',
        description: 'Pour les étrangers souhaitant s\'installer au Gabon pour le travail, les études ou le regroupement familial. Nécessite une autorisation préalable de la DGDI.',
        category: 'VISA',
        is_active: true,
        requirements: [
            'Autorisation d\'entrée délivrée par la DGDI',
            'Contrat de travail visé (si travailleur)',
            'Certificat médical datant de moins de 3 mois',
            'Extrait de casier judiciaire'
        ],
        price: 99,
        currency: 'EUR',
        imageUrl: '/images/services/visa.png',
    },

    // ETAT CIVIL
    {
        id: 'civil-birth',
        name: 'Transcription d\'Acte de Naissance',
        description: 'Enregistrement à l\'état civil consulaire d\'une naissance survenue dans la juridiction. Permet d\'obtenir un acte de naissance gabonais et d\'établir la nationalité de l\'enfant.',
        category: 'ETAT_CIVIL',
        is_active: true,
        requirements: [
            'Acte de naissance local original (copie intégrale)',
            'Livret de famille ou Acte de mariage des parents',
            'Pièces d\'identité des parents',
            'Formulaire de demande de transcription'
        ],
        price: 15,
        currency: 'EUR',
        imageUrl: '/images/services/family.png',
        legalBasis: {
            reference: 'Code Civil Gabonais',
            title: 'Dispositions relatives à l\'état civil et à la filiation'
        }
    },
    {
        id: 'civil-marriage',
        name: 'Publication des Bans & Transcription Mariage',
        description: 'Procédure obligatoire pour la reconnaissance d\'un mariage célébré à l\'étranger. Inclut la publication des bans avant le mariage et la transcription après la cérémonie.',
        category: 'ETAT_CIVIL',
        is_active: true,
        requirements: [
            'Certificats de célibat ou de capacité matrimoniale',
            'Actes de naissance des futurs époux (moins de 3 mois)',
            'Justificatifs de domicile',
            'Acte de mariage local (pour transcription)'
        ],
        price: 20,
        currency: 'EUR',
        imageUrl: '/images/services/family.png',
    },
    {
        id: 'civil-death',
        name: 'Transcription de Décès',
        description: 'Enregistrement d\'un décès survenu dans la juridiction pour la mise à jour de l\'état civil gabonais et les formalités de succession ou de rapatriement.',
        category: 'ETAT_CIVIL',
        is_active: true,
        requirements: [
            'Acte de décès local original',
            'Passeport ou pièce d\'identité du défunt',
            'Livret de famille (si applicable)'
        ],
        price: 0,
        currency: 'EUR',
        imageUrl: '/images/services/family.png',
    },
    {
        id: 'civil-cert-capacity',
        name: 'Certificat de Capacité à Mariage',
        description: 'Document officiel attestant qu\'il n\'existe aucun empêchement légal à l\'union projetée, souvent exigé par les autorités étrangères pour célébrer le mariage.',
        category: 'ETAT_CIVIL',
        is_active: true,
        requirements: [
            'Audition préalable des futurs époux',
            'Publication des bans effectuée sans opposition',
            'Copies intégrales des actes de naissance'
        ],
        price: 25,
        currency: 'EUR',
        imageUrl: '/images/services/family.png',
    },

    // ADMINISTRATIF
    {
        id: 'legalization',
        name: 'Légalisation de Documents',
        description: 'Authentification de la signature apposée sur un acte public ou sous seing privé (diplômes, casiers judiciaires, actes notariés) pour le rendre valable au Gabon.',
        category: 'ADMINISTRATIF',
        is_active: true,
        requirements: [
            'Document original à légaliser',
            'Document préalablement légalisé par le Ministère des Affaires Étrangères local',
            'Pièce d\'identité du demandeur'
        ],
        price: 10,
        currency: 'EUR',
        imageUrl: '/images/services/protection.png',
    },
    {
        id: 'certified-copy',
        name: 'Copie Certifiée Conforme',
        description: 'Certification qu\'une photocopie est conforme au document original présenté. Valable pour les documents administratifs gabonais.',
        category: 'ADMINISTRATIF',
        is_active: true,
        requirements: [
            'Présentation obligatoire du document Original',
            'Photocopies claires et lisibles à certifier'
        ],
        price: 5,
        currency: 'EUR',
        imageUrl: '/images/services/protection.png',
    },
    {
        id: 'consular-card',
        name: 'Carte d\'Immatriculation Consulaire',
        description: 'Document prouvant l\'enregistrement au registre des Gabonais de l\'étranger. Indispensable pour toutes les démarches administratives et la protection consulaire.',
        category: 'ADMINISTRATIF',
        is_active: true,
        requirements: [
            'Formulaire d\'immatriculation rempli',
            'Passeport gabonais en cours de validité',
            'Titre de séjour ou preuve de résidence légale',
            'Justificatif de domicile dans la juridiction',
            '2 photos d\'identité'
        ],
        price: 15,
        currency: 'EUR',
        imageUrl: '/images/services/protection.png',
        legalBasis: {
            reference: 'Décret régissant l\'immatriculation',
            title: 'Obligation d\'immatriculation pour tout séjour supérieur à 3 mois'
        }
    },
    {
        id: 'certificate-residence',
        name: 'Certificat de Résidence & Changement',
        description: 'Attestation prouvant la résidence dans la juridiction ou le déménagement définitif (pour les douanes). Le certificat de déménagement permet l\'exonération douanière des effets personnels.',
        category: 'ADMINISTRATIF',
        is_active: true,
        requirements: [
            'Carte Consulaire',
            'Justificatif de domicile récent',
            'Pour déménagement : Inventaire détaillé chiffré',
            'Billet d\'avion aller simple'
        ],
        price: 10,
        currency: 'EUR',
        imageUrl: '/images/services/protection.png',
    },
    {
        id: 'power-attorney',
        name: 'Procuration & Légalisation Signature',
        description: 'Certification matérielle de la signature d\'un ressortissant sur un acte sous seing privé (procuration pour banque, vente, gestion). Le signataire doit signer devant l\'agent consulaire.',
        category: 'ADMINISTRATIF',
        is_active: true,
        requirements: [
            'Présence physique OBLIGATOIRE du signataire',
            'Pièce d\'identité gabonaise valide',
            'Texte de la procuration rédigé (non signé)',
            'Identité complète du mandataire'
        ],
        price: 20,
        currency: 'EUR',
        imageUrl: '/images/services/protection.png',
    }
];
