import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Conversation } from '@/types/messaging';
import { Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MailListProps {
    mails: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function MailList({ mails, selectedId, onSelect }: MailListProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col">
                {mails.map((mail) => (
                    <div
                        key={mail.id}
                        onClick={() => onSelect(mail.id)}
                        className={cn(
                            "flex gap-3 p-3 cursor-pointer transition-all border-b border-border/40 hover:bg-muted/30 relative group",
                            selectedId === mail.id
                                ? "bg-primary/5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary"
                                : "bg-transparent"
                        )}
                    >
                        <Avatar className="w-9 h-9 shrink-0 mt-0.5 border border-background shadow-sm">
                            <AvatarFallback className={cn(
                                "text-[10px] font-bold",
                                selectedId === mail.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {mail.lastMessage.senderName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                            {/* Header: Sender + Date */}
                            <div className="flex items-center justify-between gap-2">
                                <span className={cn(
                                    "text-xs truncate flex-1 font-semibold",
                                    mail.unreadCount > 0 ? "text-foreground" : "text-foreground/80"
                                )}>
                                    {mail.lastMessage.senderName}
                                </span>
                                <span className={cn(
                                    "text-[10px] shrink-0 tabular-nums whitespace-nowrap",
                                    mail.unreadCount > 0 ? "text-primary font-bold" : "text-muted-foreground"
                                )}>
                                    {formatDate(mail.lastMessage.timestamp)}
                                </span>
                            </div>

                            {/* Subject */}
                            <div
                                className={cn(
                                    "text-xs leading-tight line-clamp-1 w-full",
                                    mail.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground/70"
                                )}
                                title={mail.subject}
                            >
                                {mail.subject}
                            </div>

                            {/* Preview */}
                            <div className="flex gap-2 items-start">
                                <p
                                    className="text-[11px] text-muted-foreground line-clamp-2 leading-tight w-full break-words"
                                    title={mail.lastMessage.content}
                                >
                                    {mail.lastMessage.content}
                                </p>
                                {mail.lastMessage.attachments && mail.lastMessage.attachments.length > 0 && (
                                    <Paperclip className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
