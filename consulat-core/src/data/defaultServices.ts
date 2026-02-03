import { ConsularService } from "@/types/services";

export const DEFAULT_SERVICES: Omit<ConsularService, 'id' | 'created_at' | 'updated_at'>[] = [
    {
        name: "Protection & Assistance",
        description: "Conformément aux dispositions de la Convention de Vienne de 1963 sur les relations consulaires entre États, tout citoyen gabonais séjournant ou résidant en France bénéficie de la protection consulaire.",
        is_active: true,
        price: 0,
        currency: "EUR",
        requirements: ["Passeport ou Carte d'identité"]
    },
    {
        name: "Légalisation de documents",
        description: "La légalisation est la formalité par laquelle est attestée la véracité de la signature, la qualité en laquelle le signataire de l'acte a agi et, le cas échéant, l'identité du sceau ou timbre dont cet acte est revêtu. Elle vise à rendre possible l'usage à l'étranger d'un document public par l'apposition de la signature des instances compétentes.",
        is_active: true,
        price: 20,
        currency: "EUR",
        requirements: ["Document original à légaliser"]
    },
    {
        name: "Attestation de concordance",
        description: "Document permettant à toute personne ayant constaté une incohérence dans un document (acte de naissance, passeport, etc.) de rétablir la vérité des faits après un examen minutieux de l'état civil de l'intéressé par le Consulat Général.",
        is_active: true,
        price: 15,
        currency: "EUR",
        requirements: ["Pièce d'identité", "Documents comportant l'erreur", "Documents justificatifs corrects"]
    },
    {
        name: "Attestation patronymique",
        description: "Document permettant à tout parent gabonais résidant ou de passage en France d'attribuer un patronyme, autre que celui du père ou de la mère, à l'enfant à naître. Recommandé avant la date prévue pour l'accouchement (à partir du 6ème mois).",
        is_active: true,
        price: 15,
        currency: "EUR",
        requirements: ["Pièce d'identité des parents", "Certificat de grossesse"]
    },
    {
        name: "Attestation de revenus",
        description: "Pour les fonctionnaires ou stagiaires gabonais résidant en France, ce document justifie de leurs revenus et de l'exemption d'impôts.",
        is_active: true,
        price: 15,
        currency: "EUR",
        requirements: ["Pièce d'identité", "Justificatif de statut (fonctionnaire/stagiaire)", "Relevés bancaires récents"]
    },
    {
        name: "Attestation de rapatriement de corps",
        description: "Nécessaire pour les démarches administratives auprès des Autorités françaises compétentes suite au décès d'un ressortissant gabonais. Établi à la demande des pompes funèbres ou de la famille.",
        is_active: true,
        price: 0,
        currency: "EUR",
        requirements: ["Acte de décès", "Passeport du défunt", "Demande de la famille ou pompes funèbres"]
    },
    {
        name: "Attestation de capacité juridique",
        description: "Permet d'attester qu'un ressortissant gabonais résidant en France n'a pas fait l'objet de condamnations à des peines privatives de liberté au Gabon.",
        is_active: true,
        price: 15,
        currency: "EUR",
        requirements: ["Passeport", "Casier judiciaire gabonais (si disponible)"]
    },
    {
        name: "Certificat d'expatriation",
        description: "Atteste de la situation d'expatrié d'un gabonais. Nécessaire pour le rapatriement des effets personnels et éventuellement d'un véhicule.",
        is_active: true,
        price: 30,
        currency: "EUR",
        requirements: ["Passeport", "Justificatif de domicile en France", "Preuve de retour définitif"]
    },
    {
        name: "Certificat de nationalité",
        description: "Atteste officiellement de la nationalité gabonaise. S'obtient normalement auprès du Tribunal de Première Instance de Libreville, mais le Consulat peut faciliter la demande.",
        is_active: true,
        price: 30,
        currency: "EUR",
        requirements: ["Acte de naissance", "Passeport", "Photos d'identité"]
    },
    {
        name: "Certificat de vie",
        description: "Preuve de vie pour les personnes bénéficiant d'une pension gabonaise. La présence physique du demandeur est obligatoire au Consulat Général.",
        is_active: true,
        price: 0,
        currency: "EUR",
        requirements: ["Présence physique obligatoire", "Pièce d'identité", "Justificatif de pension"]
    },
    {
        name: "Certificat de non opposition",
        description: "Publication des bans pour le mariage (affichage pendant 10 jours). Nécessaire pour la validité du mariage.",
        is_active: true,
        price: 30,
        currency: "EUR",
        requirements: ["Actes de naissance des futurs époux", "Pièces d'identité", "Justificatifs de domicile"]
    },
    {
        name: "Certificats de coutume et de célibat",
        description: "Prouve la capacité à se marier en France (célibataire, majeur, capable). Indispensable pour le mariage de tout ressortissant gabonais en France.",
        is_active: true,
        price: 30,
        currency: "EUR",
        requirements: ["Acte de naissance", "Pièce d'identité", "Attestation sur l'honneur de célibat"]
    },
    {
        name: "Célébration de mariage au Consulat",
        description: "Mariage au Consulat pour les futurs époux de nationalité gabonaise uniquement. Si double nationalité, mariage à l'état civil français impératif.",
        is_active: true,
        price: 150,
        currency: "EUR",
        requirements: ["Dossier complet de mariage", "Présence des témoins", "Pièces d'identité"]
    },
    {
        name: "Transcription d'acte de décès",
        description: "Transcription de l'acte de décès français dans les registres gabonais.",
        is_active: true,
        price: 10,
        currency: "EUR",
        requirements: ["Acte de décès français", "Pièce d'identité du défunt", "Livret de famille"]
    },
    {
        name: "Transcription d'acte de mariage",
        description: "Transcription de l'acte de mariage français dans les registres gabonais. Recommandé pour tout mariage en Mairie française.",
        is_active: true,
        price: 15,
        currency: "EUR",
        requirements: ["Acte de mariage français", "Pièces d'identité des époux"]
    },
    {
        name: "Laissez-passer",
        description: "Document de voyage d'urgence pour rentrer au Gabon en cas de perte ou expiration du passeport.",
        is_active: true,
        price: 50,
        currency: "EUR",
        requirements: ["Déclaration de perte/vol", "Photos d'identité", "Billet d'avion", "Preuve de nationalité"]
    },
    {
        name: "Transcription d'acte de naissance",
        description: "Transcription de l'acte de naissance d'un enfant né en France issu d'au moins un parent gabonais.",
        is_active: true,
        price: 15,
        currency: "EUR",
        requirements: ["Copie intégrale acte de naissance enfant", "Pièces d'identité parents", "Livret de famille"]
    }
];
