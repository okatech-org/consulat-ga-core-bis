import { ForeignerUser, CitizenType, RegistrationStatus, ForeignerStatus, RequestReason } from '@/types/citizen';

export const MOCK_FOREIGNERS: ForeignerUser[] = [
    {
        id: 'foreigner-001',
        citizenType: CitizenType.ETRANGER,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-02-20'),
        birthPlace: 'New York',
        gender: 'M',
        nationality: 'Américaine',
        documentType: 'PASSPORT',
        documentNumber: 'US123456',
        documentIssuingCountry: 'USA',
        documentExpireDate: new Date('2028-05-15'),
        statusInCountry: ForeignerStatus.TEMPORARY_VISITOR,
        maritalStatus: 'SINGLE',
        profession: 'Consultant',
        requestReason: RequestReason.VISA_REQUEST,
        currentAddress: {
            street: '10 Avenue des Champs-Élysées',
            city: 'Paris',
            country: 'France',
            postalCode: '75008'
        },
        phone: '+33698765432',
        email: 'john.doe@example.com',
        preferredLanguage: 'EN',
        assignedConsulate: 'fr-consulat-paris',
        registrationStatus: RegistrationStatus.PENDING_APPROVAL,
        registrationDate: new Date('2024-03-15'),
        accessLevel: 'LIMITED',
        uploadedDocuments: [],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
    }
];
