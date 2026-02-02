/**
 * Ministry Services Seed Data
 * Source: demo.amba-canada.gouv.ga (made generic/country-agnostic)
 * 
 * This data has been generalized to work for any consulate/embassy.
 * Country-specific references (Canada, dollars canadiens, etc.) have been removed.
 */



export const ministryServicesSeed = [
  // ============================================================================
  // VISA SERVICES
  // ============================================================================
  {
    slug: "demande-visa",
    code: "VISA_APPLICATION",
    name: { 
      fr: "Demande de Visa", 
      en: "Visa Application" 
    },
    description: { 
      fr: "Tout étranger souhaitant se rendre au Gabon pour des raisons professionnelles ou personnelles peut solliciter les Services consulaires pour la délivrance d'un visa.", 
      en: "Any foreign national wishing to travel to Gabon for professional or personal reasons may apply to the Consular Services for a visa." 
    },
    content: {
      fr: `<h2>Documents communs à toute demande de visa</h2>
<ul>
<li>Un passeport en cours de validité</li>
<li>Une copie de la page du passeport contenant les informations personnelles</li>
<li>Le formulaire de demande de visa, dûment rempli</li>
<li>Copie du billet d'avion aller-retour</li>
<li>Copie du vaccin contre la fièvre jaune</li>
<li>2 photos d'identité (format passeport)</li>
</ul>
<p><strong>Pour les enfants mineurs :</strong> Copie de l'acte de naissance, copies des pièces d'identité des parents, autorisation parentale.</p>

<h2>Documents complémentaires pour visa affaires</h2>
<ul>
<li>Lettre d'invitation d'une Administration gabonaise ou entreprise au Gabon</li>
<li>Lettre de prise en charge</li>
</ul>

<h2>Documents complémentaires pour visa tourisme ou visite familiale</h2>
<ul>
<li>Certificat d'hébergement établi par une Mairie du Gabon + pièce d'identité de l'hébergeant</li>
<li>Relevé de compte bancaire du mois en cours</li>
<li>Attestation d'emploi ou de congé datant de moins de 3 mois</li>
</ul>

<h2>Documents pour personnes d'origine gabonaise</h2>
<ul>
<li>Passeport en cours de validité</li>
<li>Formulaire de demande de visa</li>
<li>Copie du billet d'avion ou réservation</li>
<li>Document délivré par une Autorité gabonaise (passeport expiré, CNI, acte de naissance, certificat de nationalité)</li>
<li>2 photos d'identité</li>
</ul>`,
      en: `<h2>Common Documents for All Visa Applications</h2>
<ul>
<li>Valid passport</li>
<li>Copy of passport page with personal information</li>
<li>Completed visa application form</li>
<li>Copy of round-trip ticket</li>
<li>Yellow fever vaccination certificate</li>
<li>2 passport-size photos</li>
</ul>
<p><strong>For minors:</strong> Birth certificate copy, copies of parents' IDs, parental authorization.</p>

<h2>Additional Documents for Business Visa</h2>
<ul>
<li>Invitation letter from a Gabonese Administration or company</li>
<li>Sponsorship letter</li>
</ul>

<h2>Additional Documents for Tourism or Family Visit Visa</h2>
<ul>
<li>Accommodation certificate from a Gabonese municipality + host's ID</li>
<li>Current month bank statement</li>
<li>Employment or leave certificate less than 3 months old</li>
</ul>`
    },
    category: "visa",
    icon: "stamp",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "passport", label: { fr: "Passeport en cours de validité", en: "Valid passport" }, required: true },
      { type: "passport_copy", label: { fr: "Copie de la page d'identité du passeport", en: "Copy of passport identity page" }, required: true },
      { type: "visa_form", label: { fr: "Formulaire de demande de visa", en: "Visa application form" }, required: true },
      { type: "flight_ticket", label: { fr: "Billet d'avion aller-retour", en: "Round-trip flight ticket" }, required: true },
      { type: "yellow_fever", label: { fr: "Certificat de vaccination fièvre jaune", en: "Yellow fever vaccination certificate" }, required: true },
      { type: "photos", label: { fr: "2 photos d'identité format passeport", en: "2 passport-size photos" }, required: true },
    ],
    isActive: true,
  },

  // ============================================================================
  // REGISTRATION SERVICES
  // ============================================================================
  {
    slug: "consular-card-registration",
    code: "CONSULAR_CARD",
    name: { 
      fr: "Carte Consulaire", 
      en: "Consular Card" 
    },
    description: { 
      fr: "La carte consulaire permet d'identifier et recenser tous les ressortissants gabonais établis à l'étranger. Elle permet de bénéficier de la protection consulaire.", 
      en: "The consular card identifies and registers all Gabonese nationals living abroad. It provides consular protection benefits." 
    },
    content: {
      fr: `<h2>La carte consulaire</h2>
<p>La carte consulaire est un document qui permet au Consulat d'identifier et de recenser tous les ressortissants gabonais établis dans sa juridiction.</p>
<p>Cette carte permet à l'Ambassade de pouvoir exercer son devoir de protection consulaire envers les gabonais, au regard des situations diverses dans lesquelles pourront se retrouver ces derniers.</p>
<p>Il est conseillé aux compatriotes de se rapprocher des Services consulaires dès leur arrivée afin de se faire enregistrer et se voir délivrer <strong>gratuitement</strong> ce document.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Un formulaire dûment rempli</li>
<li>Une copie de l'acte de naissance délivré par une Autorité gabonaise</li>
<li>Une copie du passeport gabonais</li>
<li>Deux photos d'identité format passeport datant de moins de 3 mois</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Consular Card</h2>
<p>The consular card is a document that allows the Consulate to identify and register all Gabonese nationals established in its jurisdiction.</p>
<p>This card enables the Embassy to exercise its duty of consular protection towards Gabonese citizens in various situations they may encounter.</p>
<p>Citizens are advised to contact the Consular Services upon arrival to register and receive this document <strong>free of charge</strong>.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Completed application form</li>
<li>Copy of birth certificate issued by Gabonese authorities</li>
<li>Copy of Gabonese passport</li>
<li>Two passport-size photos less than 3 months old</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "registration",
    icon: "id-card",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "application_form", label: { fr: "Formulaire de demande", en: "Application form" }, required: true },
      { type: "birth_certificate", label: { fr: "Acte de naissance gabonais", en: "Gabonese birth certificate" }, required: true },
      { type: "passport_copy", label: { fr: "Copie du passeport gabonais", en: "Copy of Gabonese passport" }, required: true },
      { type: "photos", label: { fr: "2 photos d'identité récentes", en: "2 recent passport photos" }, required: true },
    ],
    isActive: true,
  },

  // ============================================================================
  // ATTESTATION SERVICES  
  // ============================================================================
  {
    slug: "attestation-permis-conduire",
    code: "DRIVING_LICENSE_ATTESTATION",
    name: { 
      fr: "Attestation de Validité du Permis de Conduire", 
      en: "Driving License Validity Attestation" 
    },
    description: { 
      fr: "Ce document permet à tout ressortissant gabonais ou étranger détenteur d'un permis de conduire gabonais de le faire authentifier.", 
      en: "This document allows any Gabonese national or foreigner holding a Gabonese driving license to have it authenticated." 
    },
    content: {
      fr: `<h2>Attestation de validité du permis de conduire</h2>
<p>Ce document permet à tout ressortissant gabonais résidant à l'étranger ou tout étranger ayant séjourné au Gabon, et détenteur d'un permis de conduire gabonais, de pouvoir le faire authentifier.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>L'original du permis de conduire délivré par une Autorité gabonaise</li>
<li>Copies du passeport, de la carte d'identité nationale et/ou de l'acte de naissance</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Driving License Validity Attestation</h2>
<p>This document allows any Gabonese national residing abroad or any foreigner who has stayed in Gabon, holding a Gabonese driving license, to have it authenticated.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Original driving license issued by Gabonese authorities</li>
<li>Copies of passport, national ID card and/or birth certificate</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "certification",
    icon: "car",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "driving_license", label: { fr: "Original du permis de conduire gabonais", en: "Original Gabonese driving license" }, required: true },
      { type: "identity_docs", label: { fr: "Copies passeport/CNI/acte de naissance", en: "Copies of passport/ID/birth certificate" }, required: true },
    ],
    isActive: true,
  },
  {
    slug: "attestation-capacite-juridique",
    code: "LEGAL_CAPACITY_ATTESTATION",
    name: { 
      fr: "Attestation de Capacité Juridique", 
      en: "Legal Capacity Attestation" 
    },
    description: { 
      fr: "Ce document atteste qu'un ressortissant gabonais n'a pas fait l'objet de condamnation à des peines privatives de liberté au Gabon.", 
      en: "This document attests that a Gabonese national has not been sentenced to imprisonment in Gabon." 
    },
    content: {
      fr: `<h2>Attestation de capacité juridique</h2>
<p>Ce document permet d'attester qu'un ressortissant gabonais résidant à l'étranger ou tout étranger ayant séjourné au Gabon n'a pas fait l'objet de condamnation à des peines privatives de liberté au Gabon.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>L'extrait de casier judiciaire datant de moins de 3 mois, délivré par une Autorité judiciaire gabonaise</li>
<li>Copies du passeport, de la carte d'identité nationale et/ou de l'acte de naissance</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Legal Capacity Attestation</h2>
<p>This document certifies that a Gabonese national residing abroad or any foreigner who has stayed in Gabon has not been convicted of imprisonment in Gabon.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Criminal record extract less than 3 months old, issued by Gabonese judicial authorities</li>
<li>Copies of passport, national ID and/or birth certificate</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "certification",
    icon: "scale",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "criminal_record", label: { fr: "Extrait de casier judiciaire (< 3 mois)", en: "Criminal record extract (< 3 months)" }, required: true },
      { type: "identity_docs", label: { fr: "Copies passeport/CNI/acte de naissance", en: "Copies of passport/ID/birth certificate" }, required: true },
    ],
    isActive: true,
  },

  // ============================================================================
  // CERTIFICATE SERVICES
  // ============================================================================
  {
    slug: "certificat-vie",
    code: "LIFE_CERTIFICATE",
    name: { 
      fr: "Certificat de Vie", 
      en: "Life Certificate" 
    },
    description: { 
      fr: "Ce document permet aux retraités gabonais ou bénéficiaires de pension gabonaise résidant à l'étranger d'apporter la preuve qu'ils sont encore en vie.", 
      en: "This document allows Gabonese retirees or Gabonese pension beneficiaries residing abroad to prove they are still alive." 
    },
    content: {
      fr: `<h2>Certificat de vie</h2>
<p>Ce document permet aux retraités gabonais ou étrangers bénéficiaires de la pension gabonaise et résidant à l'étranger d'apporter la preuve qu'ils sont encore en vie et connus du Consulat.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Une copie du passeport</li>
<li>Une copie du titre de pension ou de l'attestation de mise à la retraite</li>
<li>Copie du dernier certificat de vie (pour renouvellement)</li>
</ul>
<p><strong>Important :</strong> La présence physique du demandeur est obligatoire lors du dépôt du dossier. Il est recommandé de prendre rendez-vous.</p>`,
      en: `<h2>Life Certificate</h2>
<p>This document allows Gabonese retirees or foreigners receiving Gabonese pensions residing abroad to prove they are still alive and known to the Consulate.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Copy of passport</li>
<li>Copy of pension certificate or retirement attestation</li>
<li>Copy of last life certificate (for renewal)</li>
</ul>
<p><strong>Important:</strong> Physical presence of the applicant is mandatory when submitting the file. Appointment recommended.</p>`
    },
    category: "certification",
    icon: "heart-pulse",
    estimatedDays: 1,
    requiresAppointment: true,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "passport_copy", label: { fr: "Copie du passeport", en: "Passport copy" }, required: true },
      { type: "pension_certificate", label: { fr: "Titre de pension ou attestation de retraite", en: "Pension certificate or retirement attestation" }, required: true },
    ],
    isActive: true,
  },
  {
    slug: "certificat-expatriation",
    code: "EXPATRIATION_CERTIFICATE",
    name: { 
      fr: "Certificat d'Expatriation", 
      en: "Expatriation Certificate" 
    },
    description: { 
      fr: "Document permettant à un ressortissant gabonais retournant définitivement au Gabon de rapatrier ses effets personnels.", 
      en: "Document allowing a Gabonese national returning permanently to Gabon to repatriate personal belongings." 
    },
    content: {
      fr: `<h2>Certificat d'expatriation</h2>
<p>Tout ressortissant gabonais établi à l'étranger et désireux de retourner définitivement au Gabon peut solliciter ce certificat permettant de rapatrier ses effets personnels.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Une copie du passeport</li>
<li>Une liste exhaustive des effets personnels avec références précises (preuves d'achat véhicule, type d'appareils, etc.)</li>
<li>Le nom du transitaire</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Expatriation Certificate</h2>
<p>Any Gabonese national living abroad who wishes to return permanently to Gabon may request this certificate to repatriate personal belongings.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Copy of passport</li>
<li>Comprehensive list of personal effects with precise references (vehicle purchase proof, appliance types, etc.)</li>
<li>Name of freight forwarder</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "certification",
    icon: "plane-departure",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "passport_copy", label: { fr: "Copie du passeport", en: "Passport copy" }, required: true },
      { type: "belongings_list", label: { fr: "Liste détaillée des effets personnels", en: "Detailed list of personal belongings" }, required: true },
      { type: "freight_forwarder", label: { fr: "Nom du transitaire", en: "Freight forwarder name" }, required: true },
    ],
    isActive: true,
  },
  {
    slug: "certificat-coutume-celibat",
    code: "CUSTOM_CELIBACY_CERTIFICATE",
    name: { 
      fr: "Certificats de Coutume et de Célibat", 
      en: "Custom and Celibacy Certificates" 
    },
    description: { 
      fr: "Documents requis pour tout ressortissant gabonais souhaitant se marier ou établir une union formelle à l'étranger.", 
      en: "Documents required for any Gabonese national wishing to marry or establish a formal union abroad." 
    },
    content: {
      fr: `<h2>Certificats de coutume et de célibat</h2>
<p>Tout ressortissant gabonais résidant à l'étranger qui souhaite se marier ou établir une union formelle auprès d'une Administration étrangère peut solliciter ces certificats.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Une copie du passeport gabonais ou de la carte d'identité nationale</li>
<li>Une copie de l'acte de naissance délivré par une Autorité gabonaise</li>
<li>Une copie du jugement de divorce (pour personnes précédemment mariées)</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Custom and Celibacy Certificates</h2>
<p>Any Gabonese national residing abroad who wishes to marry or establish a formal union with a foreign Administration may request these certificates.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Copy of Gabonese passport or national ID</li>
<li>Copy of birth certificate issued by Gabonese authorities</li>
<li>Copy of divorce judgment (for previously married persons)</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "civil_status",
    icon: "heart",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "passport_or_id", label: { fr: "Passeport gabonais ou CNI", en: "Gabonese passport or national ID" }, required: true },
      { type: "birth_certificate", label: { fr: "Acte de naissance gabonais", en: "Gabonese birth certificate" }, required: true },
      { type: "divorce_judgment", label: { fr: "Jugement de divorce (si applicable)", en: "Divorce judgment (if applicable)" }, required: false },
    ],
    isActive: true,
  },
  {
    slug: "certificat-nationalite",
    code: "NATIONALITY_CERTIFICATE",
    name: { 
      fr: "Certificat de Nationalité", 
      en: "Nationality Certificate" 
    },
    description: { 
      fr: "Document confirmant la nationalité gabonaise. Normalement délivré par le Tribunal de Première Instance de Libreville, mais le Consulat peut l'établir dans certains cas.", 
      en: "Document confirming Gabonese nationality. Normally issued by the Court of First Instance of Libreville, but the Consulate may issue it in certain cases." 
    },
    content: {
      fr: `<h2>Certificat de nationalité</h2>
<p>Le Certificat de Nationalité s'obtient normalement auprès du Tribunal de Première Instance de Libreville. Cependant, le Consulat peut, dans certains cas, établir ce document pour confirmer la Nationalité gabonaise.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Une copie du passeport gabonais ou de la carte d'identité nationale</li>
<li>Une copie de l'acte de naissance délivré par une Autorité gabonaise</li>
<li>Copies des actes de naissance et/ou passeports des parents</li>
<li>Copie du décret de naturalisation ou du certificat de nationalité existant (si applicable)</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Nationality Certificate</h2>
<p>The Nationality Certificate is normally obtained from the Court of First Instance of Libreville. However, the Consulate may, in certain cases, issue this document to confirm Gabonese nationality.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Copy of Gabonese passport or national ID</li>
<li>Copy of birth certificate issued by Gabonese authorities</li>
<li>Copies of parents' birth certificates and/or passports</li>
<li>Copy of naturalization decree or existing nationality certificate (if applicable)</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "identity",
    icon: "badge-check",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "passport_or_id", label: { fr: "Passeport gabonais ou CNI", en: "Gabonese passport or national ID" }, required: true },
      { type: "birth_certificate", label: { fr: "Acte de naissance gabonais", en: "Gabonese birth certificate" }, required: true },
      { type: "parents_docs", label: { fr: "Actes de naissance/passeports des parents", en: "Parents' birth certificates/passports" }, required: true },
    ],
    isActive: true,
  },
  {
    slug: "certificat-non-opposition",
    code: "NON_OPPOSITION_CERTIFICATE",
    name: { 
      fr: "Certificat de Non-Opposition au Mariage", 
      en: "Certificate of No Objection to Marriage" 
    },
    description: { 
      fr: "Certificat délivré suite à la publication des bans de mariage, attestant qu'aucune opposition n'a été formulée.", 
      en: "Certificate issued following the publication of marriage banns, attesting that no objection has been raised." 
    },
    content: {
      fr: `<h2>Certificat de non-opposition</h2>
<p>La publication des bans est la procédure qui consiste à afficher le projet de mariage de deux personnes afin que le public en prenne connaissance et de susciter la révélation d'un éventuel empêchement ou opposition.</p>
<p>À la suite de la publication, un certificat de non-opposition est délivré. L'affichage doit rester apposé pendant <strong>10 jours</strong>.</p>

<h2>Base légale</h2>
<p>Aux termes des dispositions de l'article 249 du Code civil de la République Gabonaise : « en pays étranger, le mariage entre Gabonais ou entre Gabonais et étranger est valable s'il a été célébré dans les formes qui y sont usités. Il doit néanmoins être précédé d'une publication faite au domicile des parents et au lieu de naissance au Gabon de chacun des époux ou, à défaut, à la mairie de la capitale ».</p>`,
      en: `<h2>Certificate of No Objection</h2>
<p>The publication of banns is the procedure of posting a marriage notice so the public can be informed and potentially reveal any impediment or objection.</p>
<p>Following publication, a certificate of no objection is issued. The posting must remain displayed for <strong>10 days</strong>.</p>

<h2>Legal Basis</h2>
<p>According to Article 249 of the Gabonese Civil Code: "in foreign countries, marriage between Gabonese nationals or between a Gabonese national and a foreigner is valid if celebrated in the forms customary there. However, it must be preceded by a publication made at the parents' residence and at the place of birth in Gabon of each spouse, or failing that, at the capital's town hall."</p>`
    },
    category: "civil_status",
    icon: "file-check",
    estimatedDays: 14,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "marriage_file", label: { fr: "Dossier complet de mariage", en: "Complete marriage file" }, required: true },
    ],
    isActive: true,
  },

  // ============================================================================
  // TRAVEL DOCUMENT SERVICES
  // ============================================================================
  {
    slug: "tenant-lieu-passeport",
    code: "EMERGENCY_TRAVEL_DOCUMENT",
    name: { 
      fr: "Tenant Lieu de Passeport", 
      en: "Emergency Travel Document" 
    },
    description: { 
      fr: "Document de voyage provisoire pour les ressortissants gabonais ne disposant pas de passeport valide, permettant de voyager vers le Gabon uniquement.", 
      en: "Temporary travel document for Gabonese nationals without a valid passport, allowing travel to Gabon only." 
    },
    content: {
      fr: `<h2>Tenant Lieu de Passeport</h2>
<p>Ce document permet à tout ressortissant gabonais résidant à l'étranger et ne disposant pas de passeport en cours de validité ou l'ayant perdu, de pouvoir voyager <strong>en direction du Gabon uniquement</strong>.</p>
<p>La validité de ce document est de <strong>3 mois</strong> à compter de sa date d'établissement. Il est impératif d'effectuer le déplacement à Libreville pour le renouvellement ou l'établissement du passeport.</p>
<p><strong>Important :</strong> Le Tenant Lieu de Passeport n'est délivré qu'une seule fois pour un demandeur.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Un formulaire dûment rempli</li>
<li>Une copie de tout document gabonais (passeport expiré, acte de naissance, CNI, certificat de nationalité)</li>
<li>Copie de la déclaration de perte du passeport (si applicable)</li>
<li>Une copie du billet d'avion</li>
<li>Deux photos d'identité format passeport (< 3 mois)</li>
<li>Autorisation parentale pour les mineurs + pièces d'identité des parents</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Emergency Travel Document</h2>
<p>This document allows any Gabonese national residing abroad without a valid passport or having lost it to travel <strong>to Gabon only</strong>.</p>
<p>This document is valid for <strong>3 months</strong> from its issue date. You must travel to Libreville to renew or obtain your passport.</p>
<p><strong>Important:</strong> The Emergency Travel Document is issued only once per applicant.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Completed application form</li>
<li>Copy of any Gabonese document (expired passport, birth certificate, national ID, nationality certificate)</li>
<li>Copy of passport loss declaration (if applicable)</li>
<li>Copy of plane ticket</li>
<li>Two passport-size photos (< 3 months old)</li>
<li>Parental authorization for minors + parents' IDs</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "travel_document",
    icon: "file-badge",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "application_form", label: { fr: "Formulaire de demande", en: "Application form" }, required: true },
      { type: "gabonese_document", label: { fr: "Document gabonais (passeport expiré, CNI, acte de naissance)", en: "Gabonese document (expired passport, ID, birth certificate)" }, required: true },
      { type: "flight_ticket", label: { fr: "Billet d'avion", en: "Plane ticket" }, required: true },
      { type: "photos", label: { fr: "2 photos d'identité récentes", en: "2 recent passport photos" }, required: true },
    ],
    isActive: true,
  },
  {
    slug: "laissez-passer",
    code: "LAISSEZ_PASSER",
    name: { 
      fr: "Laissez-Passer", 
      en: "Laissez-Passer" 
    },
    description: { 
      fr: "Document de voyage d'urgence valide 30 jours, pour les ressortissants gabonais devant rentrer au Gabon sans passeport valide.", 
      en: "Emergency travel document valid for 30 days, for Gabonese nationals needing to return to Gabon without a valid passport." 
    },
    content: {
      fr: `<h2>Laissez-Passer</h2>
<p>Ce document permet à tout ressortissant gabonais résidant à l'étranger et ne disposant pas de passeport en cours de validité ou l'ayant perdu, de pouvoir voyager <strong>en direction du Gabon uniquement</strong>.</p>
<p>La validité de ce document est de <strong>30 jours</strong> à compter de sa date d'établissement.</p>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>Un formulaire dûment rempli</li>
<li>Une copie de tout document gabonais (passeport expiré, acte de naissance, CNI, certificat de nationalité)</li>
<li>Copie de la déclaration de perte du passeport (si applicable)</li>
<li>Une copie du billet d'avion</li>
<li>Deux photos d'identité format passeport (< 3 mois)</li>
<li>Autorisation parentale pour les mineurs + pièces d'identité des parents</li>
</ul>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Laissez-Passer</h2>
<p>This document allows any Gabonese national residing abroad without a valid passport or having lost it to travel <strong>to Gabon only</strong>.</p>
<p>This document is valid for <strong>30 days</strong> from its issue date.</p>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Completed application form</li>
<li>Copy of any Gabonese document (expired passport, birth certificate, national ID, nationality certificate)</li>
<li>Copy of passport loss declaration (if applicable)</li>
<li>Copy of plane ticket</li>
<li>Two passport-size photos (< 3 months old)</li>
<li>Parental authorization for minors + parents' IDs</li>
</ul>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "travel_document",
    icon: "ticket",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "application_form", label: { fr: "Formulaire de demande", en: "Application form" }, required: true },
      { type: "gabonese_document", label: { fr: "Document gabonais (passeport expiré, CNI, acte de naissance)", en: "Gabonese document (expired passport, ID, birth certificate)" }, required: true },
      { type: "flight_ticket", label: { fr: "Billet d'avion", en: "Plane ticket" }, required: true },
      { type: "photos", label: { fr: "2 photos d'identité récentes", en: "2 recent passport photos" }, required: true },
    ],
    isActive: true,
  },

  // ============================================================================
  // LEGALIZATION SERVICES
  // ============================================================================
  {
    slug: "legalisation-documents",
    code: "DOCUMENT_LEGALIZATION",
    name: { 
      fr: "Légalisation de Documents", 
      en: "Document Legalization" 
    },
    description: { 
      fr: "Service d'authentification des documents administratifs et actes d'état civil délivrés par une Autorité gabonaise compétente.", 
      en: "Authentication service for administrative documents and civil status certificates issued by competent Gabonese authorities." 
    },
    content: {
      fr: `<h2>Légalisation de documents</h2>
<p>Le Consulat, représentant légal de l'Administration gabonaise, est habilité à légaliser les documents administratifs et autres actes d'état civil délivrés par une Autorité gabonaise compétente.</p>
<p>La légalisation atteste la véracité de la signature, la qualité en laquelle le signataire de l'acte a agi et, le cas échéant, l'identité du sceau ou timbre dont cet acte est revêtu.</p>

<h2>Documents pouvant être légalisés</h2>
<ul>
<li>L'acte de naissance</li>
<li>L'acte de mariage</li>
<li>L'acte de décès</li>
<li>Les actes établis par les autorités administratives</li>
<li>Les actes notariés</li>
<li>Les actes établis par les greffiers</li>
<li>Les actes établis par les huissiers de justice</li>
<li>Les actes établis par des agents diplomatiques ou consulaires</li>
</ul>

<h2>Pièces à fournir</h2>
<ul>
<li>Une lettre adressée au Chef de mission diplomatique</li>
<li>L'original ou la copie légalisée du document à faire légaliser</li>
<li>Les copies du document à faire légaliser (2 copies maximum)</li>
</ul>
<p><strong>Important :</strong> La légalisation d'un acte d'état civil se fait sur la base de la production de son original.</p>
<p><strong>Délai :</strong> 7 jours ouvrables</p>`,
      en: `<h2>Document Legalization</h2>
<p>The Consulate, as the legal representative of the Gabonese Administration, is authorized to legalize administrative documents and civil status certificates issued by competent Gabonese authorities.</p>
<p>Legalization certifies the authenticity of the signature, the capacity in which the signatory acted, and where applicable, the identity of the seal or stamp on the document.</p>

<h2>Documents That Can Be Legalized</h2>
<ul>
<li>Birth certificate</li>
<li>Marriage certificate</li>
<li>Death certificate</li>
<li>Documents issued by administrative authorities</li>
<li>Notarial acts</li>
<li>Documents issued by court clerks</li>
<li>Documents issued by bailiffs</li>
<li>Documents issued by diplomatic or consular agents</li>
</ul>

<h2>Required Documents</h2>
<ul>
<li>Letter addressed to the Head of Diplomatic Mission</li>
<li>Original or legalized copy of the document to be legalized</li>
<li>Copies of the document to be legalized (2 copies maximum)</li>
</ul>
<p><strong>Important:</strong> Legalization of civil status certificates requires the original document.</p>
<p><strong>Processing time:</strong> 7 business days</p>`
    },
    category: "certification",
    icon: "stamp",
    estimatedDays: 7,
    requiresAppointment: false,
    requiresPickupAppointment: false,
    joinedDocuments: [
      { type: "request_letter", label: { fr: "Lettre de demande", en: "Request letter" }, required: true },
      { type: "original_document", label: { fr: "Original du document à légaliser", en: "Original document to be legalized" }, required: true },
      { type: "document_copies", label: { fr: "Copies du document (2 max)", en: "Document copies (2 max)" }, required: false },
    ],
    isActive: true,
  },
];
