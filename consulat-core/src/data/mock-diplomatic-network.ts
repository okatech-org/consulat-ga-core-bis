import { Organization, OrganizationType, OrganizationStatus } from '@/types/organization';

export const DIPLOMATIC_NETWORK: Organization[] = [
    // --- AFRIQUE ---
    {
        id: 'za-ambassade-pretoria',
        name: 'Ambassade du Gabon en Afrique du Sud',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Pretoria',
            country: 'Afrique du Sud',
            countryCode: 'ZA',
            jurisdiction: ['Afrique du Sud', 'Botswana', 'Mozambique', 'Zimbabwe'],
            contact: {
                address: '921 Francis Baard Street, Arcadia, Pretoria',
                phone: '+27 12 430 2969',
                email: 'ambagabonsa@gmail.com'
            },
            notes: "Situé au cœur du quartier diplomatique d'Arcadia."
        }
    },
    {
        id: 'dz-ambassade-alger',
        name: 'Ambassade du Gabon en Algérie',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Alger',
            country: 'Algérie',
            countryCode: 'DZ',
            jurisdiction: ['Algérie', 'Mauritanie'],
            contact: {
                address: 'Villa N°2, Impasse Ahmed Kara, Alger',
                phone: '+213 23 38 12 36',
                email: 'ambaga.algerie@diplomatie.gouv.ga',
                fax: '+213 23 38 12 36'
            }
        }
    },
    {
        id: 'ao-ambassade-luanda',
        name: 'Ambassade du Gabon en Angola',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Luanda',
            country: 'Angola',
            countryCode: 'AO',
            jurisdiction: ['Angola', 'Namibie', 'Zambie'],
            contact: {
                address: 'Rua Eng° Armindo de Andrade N°149, Miramar, Luanda',
                phone: '+244 222 042 943',
                email: 'ambagabonluanda@hotmail.com'
            }
        }
    },
    {
        id: 'bj-consulat-cotonou',
        name: 'Consulat Général du Gabon au Bénin',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Cotonou',
            country: 'Bénin',
            countryCode: 'BJ',
            jurisdiction: ['Bénin'],
            contact: {
                address: 'Quartier Patte d’Oie Cadjèhoun C-615 A, Cotonou',
                phone: '+229 64 13 22 88',
                email: 'consga.benin@diplomatie.gouv.ga'
            },
            notes: "La juridiction politique est couverte par l'Ambassade au Togo."
        }
    },
    {
        id: 'cm-ambassade-yaounde',
        name: 'Ambassade du Gabon au Cameroun',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Yaoundé',
            country: 'Cameroun',
            countryCode: 'CM',
            jurisdiction: ['Cameroun', 'République Centrafricaine (RCA)', 'Tchad'],
            contact: {
                address: 'Quartier Bastos, Ekoudou, BP 4130, Yaoundé',
                phone: '+237 222 608 703',
                email: 'ambaga.cameroun@diplomatie.gouv.ga'
            }
        }
    },
    {
        id: 'cg-ambassade-brazzaville',
        name: 'Ambassade du Gabon au Congo',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Brazzaville',
            country: 'Congo',
            countryCode: 'CG',
            jurisdiction: ['Congo'],
            contact: {
                address: '40, Avenue du Maréchal Lyautey, Centre-ville',
                phone: '+242 22 281 56 20',
                email: 'ambagaboncongo@diplomatie.gouv.ga'
            }
        }
    },
    {
        id: 'ci-ambassade-abidjan',
        name: 'Ambassade du Gabon en Côte d\'Ivoire',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Abidjan',
            country: 'Côte d\'Ivoire',
            countryCode: 'CI',
            jurisdiction: ['Côte d\'Ivoire'],
            contact: {
                address: 'Immeuble Les Hévéas, Boulevard Carde, Plateau, Abidjan',
                phone: '+225 27 22 44 51 54',
                email: 'ambga.cotedivoire@diplomatie.gouv.ga'
            },
            notes: "Situé dans le quartier d'affaires du Plateau."
        }
    },
    {
        id: 'eg-ambassade-le-caire',
        name: 'Ambassade du Gabon en Égypte',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Le Caire',
            country: 'Égypte',
            countryCode: 'EG',
            jurisdiction: ['Égypte'],
            contact: {
                address: '59, rue Syrie, Mohandessine, Le Caire',
                phone: '+20 2 304 39 72',
                email: 'amba.gabon@yahoo.fr'
            }
        }
    },
    {
        id: 'et-ambassade-addis-abeba',
        name: 'Ambassade du Gabon en Éthiopie / UA',
        type: OrganizationType.MISSION_PERMANENTE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Addis-Abeba',
            country: 'Éthiopie',
            countryCode: 'ET',
            jurisdiction: ['Éthiopie', 'Union Africaine (UA)', 'CEA', 'PNUE'],
            contact: {
                address: 'Bole Sub City, Kebele-18, H. No. 1026, Addis-Abeba',
                phone: '+251 116 61 10 75',
                email: 'ambagabaddis@gmail.com'
            }
        }
    },
    {
        id: 'gh-consulat-accra',
        name: 'Consulat Honoraire du Gabon au Ghana',
        type: OrganizationType.CONSULAT_HONORAIRE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Accra',
            country: 'Ghana',
            countryCode: 'GH',
            jurisdiction: ['Ghana'],
            contact: {
                address: 'Flat 5 Agostinho Neto Rd, Accra',
                phone: '+233 302 906 994',
                email: 'celps_center@yahoo.com'
            },
            notes: "Le Togo couvre diplomatiquement le Ghana. Présence consulaire locale pour les urgences."
        }
    },
    {
        id: 'gq-ambassade-malabo',
        name: 'Ambassade du Gabon en Guinée Équatoriale',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Malabo',
            country: 'Guinée Équatoriale',
            countryCode: 'GQ',
            jurisdiction: ['Guinée Équatoriale (politique)'],
            contact: {
                address: 'Quartier Paraiso, Malabo',
                phone: '+240 333 093 108',
                email: 'ambagabonguineq@diplomatie.gouv.ga'
            }
        }
    },
    {
        id: 'gq-consulat-bata',
        name: 'Consulat Général du Gabon à Bata',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Bata',
            country: 'Guinée Équatoriale',
            countryCode: 'GQ',
            jurisdiction: ['Guinée Équatoriale'],
            contact: {
                address: 'Plazza del Ayuntamiento, BP 933, Bata',
                phone: '+240 222 10 11 70',
                email: 'samuelnangnang@yahoo.fr'
            },
            notes: "Gestion des flux frontaliers terrestres. Horaires : 08h00 - 16h00."
        }
    },
    {
        id: 'ml-consulat-bamako',
        name: 'Consulat Général du Gabon au Mali',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Bamako',
            country: 'Mali',
            countryCode: 'ML',
            jurisdiction: ['Mali'],
            contact: {
                address: 'Bacodjikoroni Golf, rue 727 Lot 4132, Bamako',
                phone: '+223 20 28 13 99',
                email: 'consgegabmali@yahoo.com'
            },
            notes: "Service consulaire de plein exercice."
        }
    },
    {
        id: 'ma-ambassade-rabat',
        name: 'Ambassade du Gabon au Maroc',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Rabat',
            country: 'Maroc',
            countryCode: 'MA',
            jurisdiction: ['Maroc'],
            contact: {
                address: '72 Av. Mehdi Ben Barka, Souissi, Rabat',
                phone: '+212 537 75 19 50',
                email: 'ambga.maroc@diplomatie.gouv.ga'
            }
        }
    },
    {
        id: 'ma-consulat-laayoune',
        name: 'Consulat Général du Gabon à Laâyoune',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Laâyoune',
            country: 'Maroc',
            countryCode: 'MA',
            jurisdiction: ['Maroc'],
            contact: {
                address: 'Quartier diplomatique, Laâyoune',
                phone: '+212 537 75 19 50', // Via Rabat
                email: ''
            },
            notes: "Inauguré en janvier 2020. Soutien à la souveraineté marocaine et services de proximité."
        }
    },
    {
        id: 'ng-ambassade-abuja',
        name: 'Ambassade du Gabon au Nigeria',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Abuja',
            country: 'Nigeria',
            countryCode: 'NG',
            jurisdiction: ['Nigeria', 'CEDEAO'],
            contact: {
                address: '2B, Orange Close, Off Volta Street, Maitama, Abuja',
                phone: '+234 98 734 965',
                email: 'ambagabngr@yahoo.fr'
            }
        }
    },
    {
        id: 'cd-ambassade-kinshasa',
        name: 'Ambassade du Gabon en RDC',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Kinshasa',
            country: 'RDC',
            countryCode: 'CD',
            jurisdiction: ['RDC', 'Burundi', 'Rwanda (partiellement transféré)'],
            contact: {
                address: '167, avenue Colonel Mondjiba, Zone de Kintambo, Kinshasa',
                phone: '+243 971 190 647',
                email: 'rdcambassadedugabon@gmail.com'
            }
        }
    },
    {
        id: 'rw-haut-commissariat-kigali',
        name: 'Haut-Commissariat du Gabon au Rwanda',
        type: OrganizationType.HAUT_COMMISSARIAT,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Kigali',
            country: 'Rwanda',
            countryCode: 'RW',
            jurisdiction: ['Rwanda'],
            contact: {
                address: 'Kigali',
                phone: '',
                email: ''
            },
            notes: "Ouverture récente août 2024. Chef de Mission : S.E.M. Sylver Aboubakar Minko Mi Nseme."
        }
    },
    {
        id: 'st-ambassade-sao-tome',
        name: 'Ambassade du Gabon à São Tomé',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'São Tomé',
            country: 'São Tomé-et-Principe',
            countryCode: 'ST',
            jurisdiction: ['São Tomé-et-Principe'],
            contact: {
                address: 'Rua Damão, C.P. 394, São Tomé',
                phone: '+239 222 44 34',
                email: 'ambagabon@estome.net'
            }
        }
    },
    {
        id: 'sn-ambassade-dakar',
        name: 'Ambassade du Gabon au Sénégal',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Dakar',
            country: 'Sénégal',
            countryCode: 'SN',
            jurisdiction: ['Sénégal', 'Cap-Vert', 'Gambie', 'Guinée Bissau', 'Guinée'],
            contact: {
                address: 'Avenue Cheikh Anta Diop, BP 436, Dakar',
                phone: '+221 33 865 22 34',
                email: 'ambagabsen@diplomatie.gouv.ga'
            }
        }
    },
    {
        id: 'tg-ambassade-lome',
        name: 'Ambassade du Gabon au Togo',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Lomé',
            country: 'Togo',
            countryCode: 'TG',
            jurisdiction: ['Togo', 'Bénin', 'Ghana'],
            contact: {
                address: 'Boulevard Jean Paul II, BP 9118, Lomé',
                phone: '+228 22 26 75 63',
                email: 'ambaga.togo@diplomatie.gouv.ga'
            }
        }
    },
    {
        id: 'tn-ambassade-tunis',
        name: 'Ambassade du Gabon en Tunisie',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Tunis',
            country: 'Tunisie',
            countryCode: 'TN',
            jurisdiction: ['Tunisie'],
            contact: {
                address: '7, Rue de l’Ile de Rhodes, Les Jardins de Lac II, Tunis',
                phone: '+216 71 197 216',
                email: 'ambassadegabon.tn@gmail.com'
            }
        }
    },

    // --- EUROPE ---
    {
        id: 'de-ambassade-berlin',
        name: 'Ambassade du Gabon en Allemagne',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Berlin',
            country: 'Allemagne',
            countryCode: 'DE',
            jurisdiction: ['Allemagne', 'Autriche'],
            contact: {
                address: 'Hohensteiner Straße 16, 14197 Berlin',
                phone: '+49 30 89 73 34 40',
                email: 'botschaft@botschaft-gabun.de'
            },
            notes: "Horaires : 09h00-16h00 (Lun-Ven)."
        }
    },
    {
        id: 'be-ambassade-bruxelles',
        name: 'Ambassade du Gabon en Belgique / UE',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Bruxelles',
            country: 'Belgique',
            countryCode: 'BE',
            jurisdiction: ['Benelux (Belgique, Pays-Bas, Luxembourg)', 'Union Européenne'],
            contact: {
                address: '112, Avenue Winston Churchill, 1180 Bruxelles',
                phone: '+32 2 340 62 10',
                email: 'ambagabbelg@yahoo.fr'
            }
        }
    },
    {
        id: 'es-ambassade-madrid',
        name: 'Ambassade du Gabon en Espagne',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Madrid',
            country: 'Espagne',
            countryCode: 'ES',
            jurisdiction: ['Espagne'],
            contact: {
                address: 'Calle Orense, 68, 2º Izda, 28020 Madrid',
                phone: '+34 91 413 82 11',
                email: 'olgagabon@gmail.com',
                fax: '+34 91 413 11 53'
            }
        }
    },
    {
        id: 'fr-ambassade-paris',
        name: 'Ambassade du Gabon en France',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Paris',
            country: 'France',
            countryCode: 'FR',
            jurisdiction: ['France', 'Portugal', 'Monaco', 'Andorre', 'OIF'],
            coordinates: [2.2669538, 48.8583866],
            contact: {
                address: '26 bis, Avenue Raphaël, 75016 Paris',
                phone: '+33 1 42 99 68 68',
                email: 'ambassade.gabonfrance@gmail.com',
                website: 'ambassadedugabonenfrance.com'
            },
            hours: {
                'Lundi': { open: '09:00', close: '16:30', isOpen: true },
                'Mardi': { open: '09:00', close: '16:30', isOpen: true },
                'Mercredi': { open: '09:00', close: '16:30', isOpen: true },
                'Jeudi': { open: '09:00', close: '16:30', isOpen: true },
                'Vendredi': { open: '09:00', close: '16:00', isOpen: true },
                'Samedi': { open: '09:00', close: '12:00', isOpen: false },
                'Dimanche': { open: '09:00', close: '12:00', isOpen: false }
            }
        }
    },
    {
        id: 'fr-consulat-paris',
        name: 'Consulat Général du Gabon à Paris',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Paris',
            country: 'France',
            countryCode: 'FR',
            jurisdiction: ['France'],
            coordinates: [2.2669538, 48.8583866],
            contact: {
                address: '26 bis, Avenue Raphaël, 75016 Paris',
                phone: '+33 1 42 99 68 62',
                email: 'cgeneralgabon@hotmail.fr'
            },
            hours: {
                'Lundi': { open: '09:00', close: '16:30', isOpen: true },
                'Mardi': { open: '09:00', close: '16:30', isOpen: true },
                'Mercredi': { open: '09:00', close: '16:30', isOpen: true },
                'Jeudi': { open: '09:00', close: '16:30', isOpen: true },
                'Vendredi': { open: '09:00', close: '16:00', isOpen: true },
                'Samedi': { open: '09:00', close: '12:00', isOpen: false },
                'Dimanche': { open: '09:00', close: '12:00', isOpen: false }
            },
            notes: "Horaires : Lun-Jeu 09h00-16h30, Ven 09h00-16h00. Services : Visas, Passeports (DGDI), État civil."
        }
    },
    {
        id: 'fr-delegation-unesco',
        name: 'Délégation Permanente du Gabon auprès de l\'UNESCO',
        type: OrganizationType.MISSION_PERMANENTE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Paris (UNESCO)',
            country: 'France',
            countryCode: 'FR',
            jurisdiction: ['UNESCO'],
            coordinates: [2.3063, 48.8490],
            contact: {
                address: '1, rue Miollis, 75015 Paris',
                phone: '+33 1 45 68 33 50',
                email: 'dl.gabon@unesco-delegations.org'
            }
        }
    },
    {
        id: 'it-ambassade-rome',
        name: 'Ambassade du Gabon en Italie',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Rome',
            country: 'Italie',
            countryCode: 'IT',
            jurisdiction: ['Italie', 'Grèce', 'Chypre', 'FAO'],
            contact: {
                address: 'Lungotevere Michelangelo, 9, 00192 Rome',
                phone: '+39 06 5272 9121',
                email: 'ambagabonrome@gmail.com'
            }
        }
    },
    {
        id: 'uk-haut-commissariat-londres',
        name: 'Haut-Commissariat du Gabon au Royaume-Uni',
        type: OrganizationType.HAUT_COMMISSARIAT,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Londres',
            country: 'Royaume-Uni',
            countryCode: 'GB',
            jurisdiction: ['Royaume-Uni', 'Irlande', 'Suède', 'Danemark', 'Norvège', 'Finlande'],
            contact: {
                address: '27 Elvaston Place, London SW7 5NL',
                phone: '+44 20 7823 9986',
                email: 'gabonembassyuk@gmail.com'
            },
            notes: "Statut : High Commission (Commonwealth)."
        }
    },
    {
        id: 'ru-ambassade-moscou',
        name: 'Ambassade du Gabon en Russie',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Moscou',
            country: 'Russie',
            countryCode: 'RU',
            jurisdiction: ['Fédération de Russie', 'Europe de l\'Est'],
            contact: {
                address: 'Denezhny Per. 16/1, Moscou 119002',
                phone: '+7 495 241 00 80',
                email: 'ambagab_ru@mail.ru'
            }
        }
    },
    {
        id: 'va-ambassade-vatican',
        name: 'Ambassade du Gabon près le Saint-Siège',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Vatican',
            country: 'Saint-Siège',
            countryCode: 'VA',
            jurisdiction: ['Relations avec le Vatican et l\'Ordre de Malte'],
            contact: {
                address: 'Via Ovidio, 7a, 00193 Rome / Piazzale Clodio 12',
                phone: '+39 06 3974 5043',
                email: 'ambagabon.vatican@yahoo.com'
            }
        }
    },
    {
        id: 'ch-mission-geneve',
        name: 'Mission Permanente du Gabon à Genève',
        type: OrganizationType.MISSION_PERMANENTE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Genève',
            country: 'Suisse',
            countryCode: 'CH',
            jurisdiction: ['ONU Genève', 'OMC', 'OIT', 'OMS'],
            contact: {
                address: 'Avenue de France 23, 1202 Genève',
                phone: '+41 22 731 68 69',
                email: 'mission.gabon@gabon-onug.ch'
            }
        }
    },
    {
        id: 'tr-ambassade-ankara',
        name: 'Ambassade du Gabon en Turquie',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Ankara',
            country: 'Turquie',
            countryCode: 'TR',
            jurisdiction: ['Turquie'],
            contact: {
                address: '16/609 Ilkbahar Mahallesi, Oran, Çankaya, Ankara',
                phone: '+90 312 490 94 94',
                email: 'embagabonturkey@gmail.com'
            }
        }
    },

    // --- AMERIQUES ---
    {
        id: 'br-ambassade-brasilia',
        name: 'Ambassade du Gabon au Brésil',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Brasilia',
            country: 'Brésil',
            countryCode: 'BR',
            jurisdiction: ['Brésil', 'Amérique du Sud'],
            contact: {
                address: 'SHIS QI 09 conjunto 11 casa 09, Lago Sul, Brasilia',
                phone: '+55 61 3248 3533',
                email: 'bresil.embgabon@gmail.com'
            },
            notes: "Horaires : 09h00-16h00."
        }
    },
    {
        id: 'ca-ambassade-ottawa',
        name: 'Ambassade du Gabon au Canada',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Ottawa',
            country: 'Canada',
            countryCode: 'CA',
            jurisdiction: ['Canada'],
            contact: {
                address: '1285, rue Labelle, Ottawa',
                phone: '+1 613 232 5301',
                email: '',
                website: 'ambassadegabon.ca'
            }
        }
    },
    {
        id: 'cu-ambassade-la-havane',
        name: 'Ambassade du Gabon à Cuba',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'La Havane',
            country: 'Cuba',
            countryCode: 'CU',
            jurisdiction: ['Cuba', 'Caraïbes'],
            contact: {
                address: '5ta. Ave. No. 1808 e/ 18 y 20, Miramar, La Havane',
                phone: '+53 7 204 0472',
                email: ''
            }
        }
    },
    {
        id: 'us-ambassade-washington',
        name: 'Ambassade du Gabon aux États-Unis',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Washington',
            country: 'États-Unis',
            countryCode: 'US',
            jurisdiction: ['États-Unis (Fédéral)', 'Mexique', 'Banque Mondiale', 'FMI'],
            contact: {
                address: '2034 20th Street NW, Suite 200, Washington, DC 20009',
                phone: '+1 202 797-1000',
                email: 'info@gabonembassyusa.org'
            },
            notes: "Horaires : 09h00-17h00."
        }
    },
    {
        id: 'us-consulat-new-york',
        name: 'Consulat Général du Gabon à New York',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'New York',
            country: 'États-Unis',
            countryCode: 'US',
            jurisdiction: ['États-Unis (Côte Est)'],
            contact: {
                address: '122 East 42nd Street, Suite 519, New York, NY 10168',
                phone: '+1 212 683-7371',
                email: 'consulatgabon@aol.com'
            },
            notes: "Services : Visas, Légalisations pour la côte Est."
        }
    },
    {
        id: 'us-mission-new-york',
        name: 'Mission Permanente du Gabon à l\'ONU',
        type: OrganizationType.MISSION_PERMANENTE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'New York',
            country: 'États-Unis',
            countryCode: 'US',
            jurisdiction: ['Organisation des Nations Unies (Siège)'],
            contact: {
                address: '18 East 41st Street, 9th Floor, New York, NY 10017',
                phone: '+1 212 686-9720',
                email: 'info@gabonunmission.com'
            }
        }
    },

    // --- ASIE & MOYEN-ORIENT ---
    {
        id: 'sa-ambassade-riyad',
        name: 'Ambassade du Gabon en Arabie Saoudite',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Riyad',
            country: 'Arabie Saoudite',
            countryCode: 'SA',
            jurisdiction: ['Arabie Saoudite', 'Koweït', 'EAU (couverture politique)'],
            contact: {
                address: 'Al-Morsalat Q. Bin Tofiel Street, P.O. Box 94325, Riyadh',
                phone: '+966 11 456 7173',
                email: 'ambagabonriyadh@yahoo.com'
            }
        }
    },
    {
        id: 'cn-ambassade-pekin',
        name: 'Ambassade du Gabon en Chine',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Pékin',
            country: 'Chine',
            countryCode: 'CN',
            jurisdiction: ['Chine', 'Singapour', 'Vietnam'],
            contact: {
                address: '36, Guang Hua Lu, Jian Guo Men Wai, Beijing 100600',
                phone: '+86 10 6532 2810',
                email: 'ambagabonchine@yahoo.fr',
                fax: '+86 10 6532 2621'
            }
        }
    },
    {
        id: 'kr-ambassade-seoul',
        name: 'Ambassade du Gabon en Corée du Sud',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Séoul',
            country: 'Corée du Sud',
            countryCode: 'KR',
            jurisdiction: ['Corée du Sud', 'Thaïlande'],
            contact: {
                address: '4th Floor, Yoosung Building, 239 Itaewon-ro, Yongsan-gu, Séoul',
                phone: '+82 2 793 9575',
                email: 'amgabsel@unitel.co.kr'
            }
        }
    },
    {
        id: 'in-ambassade-new-delhi',
        name: 'Ambassade du Gabon en Inde',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'New Delhi',
            country: 'Inde',
            countryCode: 'IN',
            jurisdiction: ['Inde'],
            contact: {
                address: 'E-84, Paschimi Marg, Vasant Vihar, New Delhi - 110057',
                phone: '+91 11 4101 2513',
                email: 'gabon.secretariat22@gmail.com'
            }
        }
    },
    {
        id: 'jp-ambassade-tokyo',
        name: 'Ambassade du Gabon au Japon',
        type: OrganizationType.AMBASSADE,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Tokyo',
            country: 'Japon',
            countryCode: 'JP',
            jurisdiction: ['Japon'],
            contact: {
                address: '1-34-11, Higashigaoka, Meguro-ku, Tokyo 152-0021',
                phone: '+81 3 5430 9171',
                email: 'info@gabonembassy-tokyo.org'
            },
            notes: "Horaires : 09h00-12h00 / 13h00-16h00."
        }
    },
    {
        id: 'lb-consulat-beyrouth',
        name: 'Consulat Général du Gabon au Liban',
        type: OrganizationType.CONSULAT_GENERAL,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            city: 'Beyrouth',
            country: 'Liban',
            countryCode: 'LB',
            jurisdiction: ['Liban'],
            contact: {
                address: '',
                phone: '+961 5 956 048',
                email: '',
                fax: '+961 5 924 643'
            },
            notes: "Gestion de l'importante communauté libanaise au Gabon et visas d'affaires."
        }
    }
];
