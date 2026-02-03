import { Button } from '@/components/ui/button';
import { Inbox, Send, File, Trash2, Archive, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MailSidebarProps {
    currentFolder: string;
    onSelectFolder: (folder: string) => void;
    unreadCount?: number;
}

export function MailSidebar({ currentFolder, onSelectFolder, unreadCount = 0 }: MailSidebarProps) {
    const folders = [
        { id: 'inbox', label: 'Réception', icon: Inbox, count: unreadCount },
        { id: 'sent', label: 'Envoyés', icon: Send },
        { id: 'drafts', label: 'Brouillons', icon: File },
        { id: 'archive', label: 'Archives', icon: Archive },
        { id: 'trash', label: 'Corbeille', icon: Trash2 },
        { id: 'spam', label: 'Spam', icon: AlertCircle },
    ];

    return (
        <div className="flex flex-col gap-1">
            {folders.map((folder) => (
                <Button
                    key={folder.id}
                    variant="ghost"
                    className={cn(
                        "justify-start gap-3 h-9 px-3 text-sm font-medium rounded-lg transition-all",
                        currentFolder === folder.id
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => onSelectFolder(folder.id)}
                >
                    <folder.icon className={cn("w-4 h-4 shrink-0", currentFolder === folder.id ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="flex-1 text-left truncate">{folder.label}</span>
                    {folder.count !== undefined && folder.count > 0 && (
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                            currentFolder === folder.id ? "bg-background/20 text-primary-foreground" : "bg-muted text-foreground"
                        )}>
                            {folder.count}
                        </span>
                    )}
                </Button>
            ))}
        </div>
    );
}
