import { GabonaisCitizen, CitizenType, RegistrationStatus } from '@/types/citizen';

export const MOCK_GABONAIS_CITIZENS: GabonaisCitizen[] = [
    {
        id: 'citizen-gab-001',
        citizenType: CitizenType.GABONAIS,
        firstName: 'Jean',
        lastName: 'Mba',
        dateOfBirth: new Date('1985-05-15'),
        birthPlace: 'Libreville',
        gender: 'M',
        cniNumber: '123456789',
        cniExpireDate: new Date('2030-01-01'),
        maritalStatus: 'MARRIED',
        profession: 'Ingénieur',
        currentAddress: {
            street: '12 Rue de la Paix',
            city: 'Paris',
            country: 'France',
            postalCode: '75001'
        },
        phone: '+33612345678',
        email: 'jean.mba@example.com',
        preferredLanguage: 'FR',
        preferredContact: 'EMAIL',
        assignedConsulate: 'fr-consulat-paris',
        registrationStatus: RegistrationStatus.APPROVED,
        registrationDate: new Date('2024-01-01'),
        approvalDate: new Date('2024-01-01'),
        accessLevel: 'FULL',
        uploadedDocuments: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        verifiedAt: new Date('2024-01-01')
    }
];
