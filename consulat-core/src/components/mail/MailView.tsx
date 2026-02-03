import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Reply, ReplyAll, Forward, Trash2, MoreVertical, Paperclip, Download, File as FileIcon, Printer, Star } from 'lucide-react';
import { Conversation } from '@/types/messaging';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MailViewProps {
    mail: Conversation | null;
    onReply: () => void;
}

export function MailView({ mail, onReply }: MailViewProps) {
    if (!mail) return null;

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 px-4 border-b shrink-0 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onReply}>
                                    <Reply className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Répondre</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <ReplyAll className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Répondre à tous</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Forward className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Transférer</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button variant="ghost" size="icon">
                        <Printer className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Star className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 bg-muted/10">
                <div className="p-8 max-w-4xl mx-auto">
                    {/* Email Container (Paper Look) */}
                    <div className="bg-background rounded-xl shadow-sm border p-8 min-h-[600px]">
                        {/* Header */}
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-2xl font-bold flex-1 break-words leading-tight">{mail.subject}</h1>
                                <Badge variant="secondary" className="text-xs px-2 py-1 shrink-0 uppercase tracking-wider font-semibold">
                                    {mail.type}
                                </Badge>
                            </div>

                            <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                                        {mail.lastMessage.senderName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg">{mail.lastMessage.senderName}</span>
                                            <span className="text-sm text-muted-foreground">
                                                &lt;{mail.lastMessage.senderId}@exemple.com&gt;
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {new Date(mail.lastMessage.timestamp).toLocaleString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        À: <span className="text-foreground font-medium">Moi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-8" />

                        {/* Body */}
                        <div className="prose prose-sm max-w-none dark:prose-invert mb-12 whitespace-pre-wrap leading-relaxed text-foreground/90">
                            {mail.lastMessage.content}
                        </div>

                        {/* Attachments */}
                        {mail.lastMessage.attachments && mail.lastMessage.attachments.length > 0 && (
                            <div className="border rounded-lg p-4 bg-muted/20">
                                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground/80">
                                    <Paperclip className="w-4 h-4" />
                                    {mail.lastMessage.attachments.length} Pièce(s) jointe(s)
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {mail.lastMessage.attachments.map((att) => (
                                        <div key={att.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                            <div className="p-2.5 bg-primary/10 rounded-md text-primary">
                                                <FileIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-foreground/90">{att.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">1.2 MB</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="mt-12 flex gap-4">
                            <Button variant="outline" onClick={onReply} className="gap-2">
                                <Reply className="w-4 h-4" /> Répondre
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Forward className="w-4 h-4" /> Transférer
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
