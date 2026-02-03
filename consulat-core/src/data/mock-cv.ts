import { CV } from '@/types/cv';

export const MOCK_CV: CV = {
    id: 'cv-1',
    userId: 'user-current',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+241 01 00 00 00',
    address: 'Libreville, Gabon',
    summary: "Développeur Full Stack passionné avec 5 ans d'expérience dans la création d'applications web modernes. Spécialisé en React, Node.js et TypeScript.",
    experiences: [
        {
            id: 'exp-1',
            title: 'Senior Frontend Developer',
            company: 'Tech Solutions Gabon',
            location: 'Libreville',
            startDate: '2021-01',
            current: true,
            description: "Leadership technique d'une équipe de 5 développeurs. Migration de l'architecture legacy vers React/Next.js."
        },
        {
            id: 'exp-2',
            title: 'Web Developer',
            company: 'Digital Agency',
            location: 'Paris',
            startDate: '2018-06',
            endDate: '2020-12',
            current: false,
            description: "Développement de sites vitrines et e-commerce pour divers clients. Intégration de maquettes Figma."
        }
    ],
    education: [
        {
            id: 'edu-1',
            degree: 'Master Informatique',
            school: 'Université Omar Bongo',
            location: 'Libreville',
            startDate: '2016-09',
            endDate: '2018-06',
            current: false,
            description: 'Spécialisation Génie Logiciel'
        }
    ],
    skills: [
        { id: 'skill-1', name: 'React', level: 'Expert' },
        { id: 'skill-2', name: 'TypeScript', level: 'Advanced' },
        { id: 'skill-3', name: 'Node.js', level: 'Advanced' },
        { id: 'skill-4', name: 'Docker', level: 'Intermediate' }
    ],
    languages: [
        { id: 'lang-1', name: 'Français', level: 'Native' },
        { id: 'lang-2', name: 'Anglais', level: 'C1' }
    ],
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    portfolioUrl: 'https://johndoe.dev',
    updatedAt: new Date().toISOString()
};
