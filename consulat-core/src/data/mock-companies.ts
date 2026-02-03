import { Company, CompanyType, ActivitySector, CompanyRole } from '@/types/company';

export const MOCK_COMPANIES: Company[] = [
    {
        id: 'comp-1',
        name: 'OKA Tech',
        legalName: 'OKA Tech SARL',
        companyType: CompanyType.SARL,
        activitySector: ActivitySector.TECHNOLOGY,
        siret: '12345678900012',
        status: 'APPROVED',
        email: 'contact@okatech.ga',
        phone: '+33 1 23 45 67 89',
        website: 'https://okatech.ga',
        description: 'Entreprise spécialisée dans le développement de solutions numériques pour l\'Afrique.',
        shortDescription: 'Solutions numériques innovantes',
        address: {
            street: '50 avenue des Champs-Élysées',
            city: 'Paris',
            postalCode: '75008',
            country: 'France'
        },
        coordinates: [2.3072, 48.8698],
        ownerId: 'user-1', // Assuming this ID exists in mock-users
        ownerRole: CompanyRole.CEO,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        validatedAt: '2024-01-16T14:30:00Z',
        validatedById: 'admin-system'
    },
    {
        id: 'comp-2',
        name: 'Gabon Export',
        companyType: CompanyType.SA,
        activitySector: ActivitySector.COMMERCE,
        status: 'PENDING',
        email: 'info@gabonexport.com',
        phone: '+33 6 98 76 54 32',
        description: 'Exportation de produits artisanaux gabonais vers l\'Europe.',
        shortDescription: 'Export artisanat gabonais',
        address: {
            street: '45 Rue de la République',
            city: 'Lyon',
            postalCode: '69002',
            country: 'France'
        },
        ownerId: 'user-2',
        ownerRole: CompanyRole.DIRECTOR,
        createdAt: '2024-03-20T09:15:00Z',
        updatedAt: '2024-03-20T09:15:00Z'
    }
];
