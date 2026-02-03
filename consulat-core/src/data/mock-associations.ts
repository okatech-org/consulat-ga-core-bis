import { Association, AssociationType, AssociationRole } from '@/types/association';

export const MOCK_ASSOCIATIONS: Association[] = [
    {
        id: 'asso-1',
        name: 'Association des Étudiants Gabonais de France',
        legalName: 'ASEGAF',
        associationType: AssociationType.STUDENT,
        status: 'APPROVED',
        email: 'contact@asegaf.org',
        phone: '+33 7 00 00 00 00',
        website: 'https://asegaf.org',
        facebook: 'asegaf.officiel',
        description: 'Association regroupant les étudiants gabonais en France pour l\'entraide et la culture.',
        shortDescription: 'Entraide étudiante',
        objectives: 'Faciliter l\'intégration des étudiants, promouvoir la culture gabonaise.',
        memberCount: 500,
        foundingYear: 1990,
        address: {
            street: 'Campus Universitaire',
            city: 'Bordeaux',
            postalCode: '33000',
            country: 'France'
        },
        ownerId: 'user-3',
        ownerRole: AssociationRole.PRESIDENT,
        createdAt: '2023-09-01T10:00:00Z',
        updatedAt: '2023-09-01T10:00:00Z',
        validatedAt: '2023-09-05T11:00:00Z',
        validatedById: 'admin-system'
    },
    {
        id: 'asso-2',
        name: 'Femmes Entrepreneures de la Diaspora',
        associationType: AssociationType.WOMEN,
        status: 'PENDING',
        email: 'femmes@diaspora-gabon.org',
        phone: '+33 6 12 34 56 78',
        description: 'Réseau de femmes entrepreneures gabonaises en Europe.',
        shortDescription: 'Réseau entrepreneuriat féminin',
        address: {
            street: '10 Rue de la Paix',
            city: 'Marseille',
            postalCode: '13001',
            country: 'France'
        },
        ownerId: 'user-4',
        ownerRole: AssociationRole.PRESIDENT,
        createdAt: '2024-04-10T14:20:00Z',
        updatedAt: '2024-04-10T14:20:00Z'
    }
];
