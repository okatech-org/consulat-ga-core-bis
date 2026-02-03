import { UserRole } from './roles';

export type MessageType = 'TEXT' | 'IMAGE' | 'PDF' | 'VIDEO' | 'LINK';

export interface Attachment {
    id: string;
    type: MessageType;
    url: string;
    name: string;
    size?: string;
    thumbnail?: string;
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole | 'ENTREPRENEUR' | 'ASSOCIATION' | 'MANAGER' | 'CITIZEN';
    content: string;
    attachments?: Attachment[];
    timestamp: string;
    isRead: boolean;
    isPromotional?: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    subject?: string;
    lastMessage: Message;
    unreadCount: number;
    type: 'OFFICIAL' | 'ASSOCIATION' | 'COMMERCIAL' | 'PRIVATE';
}
