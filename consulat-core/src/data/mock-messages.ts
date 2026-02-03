import { Conversation, Message } from '@/types/messaging';

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv_1',
        participants: ['manager-france', 'citizen-france'],
        subject: 'Demande de renouvellement Passeport - Dossier #452',
        type: 'OFFICIAL',
        unreadCount: 1,
        lastMessage: {
            id: 'msg_2',
            senderId: 'manager-france',
            senderName: 'Consulat Paris',
            senderRole: 'MANAGER',
            content: 'Veuillez trouver ci-joint le formulaire signé.',
            timestamp: '2023-11-28T10:30:00Z',
            isRead: false,
            attachments: [
                { id: 'att_1', type: 'PDF', name: 'formulaire_signe.pdf', url: '#', size: '1.2 Mo' }
            ]
        }
    },
    {
        id: 'conv_2',
        participants: ['entrepreneur-1', 'citizen-france'],
        subject: 'Offre spéciale : Déménagement International',
        type: 'COMMERCIAL',
        unreadCount: 0,
        lastMessage: {
            id: 'msg_10',
            senderId: 'entrepreneur-1',
            senderName: 'Global Move Gabon',
            senderRole: 'ENTREPRENEUR',
            content: 'Profitez de nos tarifs réduits pour cet été.',
            timestamp: '2023-11-27T14:20:00Z',
            isRead: true,
            isPromotional: true
        }
    },
    {
        id: 'conv_3',
        participants: ['assoc-1', 'citizen-france'],
        subject: 'Invitation : Gala de charité',
        type: 'ASSOCIATION',
        unreadCount: 2,
        lastMessage: {
            id: 'msg_15',
            senderId: 'assoc-1',
            senderName: 'Association des Gabonais de France',
            senderRole: 'ASSOCIATION',
            content: 'Nous espérons vous voir nombreux !',
            timestamp: '2023-11-26T18:00:00Z',
            isRead: false
        }
    }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
    'conv_1': [
        {
            id: 'msg_1',
            senderId: 'citizen-france',
            senderName: 'Jean Dupont',
            senderRole: 'CITIZEN',
            content: 'Bonjour, il me manque un document pour mon dossier de passeport.',
            timestamp: '2023-11-28T09:00:00Z',
            isRead: true
        },
        {
            id: 'msg_2',
            senderId: 'manager-france',
            senderName: 'Consulat Paris',
            senderRole: 'MANAGER',
            content: 'Bonjour Monsieur Dupont, Veuillez trouver ci-joint le formulaire signé à nous retourner.',
            timestamp: '2023-11-28T10:30:00Z',
            isRead: false,
            attachments: [
                { id: 'att_1', type: 'PDF', name: 'formulaire_signe.pdf', url: '#', size: '1.2 Mo' }
            ]
        }
    ],
    'conv_2': [
        {
            id: 'msg_10',
            senderId: 'entrepreneur-1',
            senderName: 'Global Move Gabon',
            senderRole: 'ENTREPRENEUR',
            content: 'Bonjour, Profitez de nos tarifs réduits pour cet été sur tous les déménagements France-Gabon !',
            timestamp: '2023-11-27T14:20:00Z',
            isRead: true,
            isPromotional: true
        }
    ],
    'conv_3': [
        {
            id: 'msg_14',
            senderId: 'assoc-1',
            senderName: 'Association des Gabonais de France',
            senderRole: 'ASSOCIATION',
            content: 'Chers membres, notre gala annuel aura lieu le 15 décembre.',
            timestamp: '2023-11-26T17:55:00Z',
            isRead: false
        },
        {
            id: 'msg_15',
            senderId: 'assoc-1',
            senderName: 'Association des Gabonais de France',
            senderRole: 'ASSOCIATION',
            content: 'Nous espérons vous voir nombreux !',
            timestamp: '2023-11-26T18:00:00Z',
            isRead: false
        }
    ]
};
