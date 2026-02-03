import { useState } from 'react';
import { MailSidebar } from '@/components/mail/MailSidebar';
import { MailList } from '@/components/mail/MailList';
import { MailView } from '@/components/mail/MailView';
import { MailComposer } from '@/components/mail/MailComposer';
import { MOCK_CONVERSATIONS } from '@/data/mock-messages';
import { Button } from '@/components/ui/button';
import { Plus, Search, Menu, Mail, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagingPage() {
    const [currentFolder, setCurrentFolder] = useState('inbox');
    const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [replyTo, setReplyTo] = useState<{ subject: string; recipient: string } | undefined>(undefined);

    const { userSpaceTheme } = useThemeStyle();
    const { user } = useAuth();
    const isIDN = userSpaceTheme === 'idn';

    // Filter mails based on folder (Mock Logic)
    const mails = MOCK_CONVERSATIONS.filter(mail => {
        if (currentFolder === 'inbox') return true; // Show all for demo
        if (currentFolder === 'sent') return mail.lastMessage.senderId === 'current-user'; // Mock check
        return false;
    });

    const selectedMail = selectedMailId ? mails.find(m => m.id === selectedMailId) || null : null;

    const handleReply = () => {
        if (selectedMail) {
            setReplyTo({
                subject: selectedMail.subject,
                recipient: selectedMail.lastMessage.senderName // Should be email in real app
            });
            setIsComposerOpen(true);
        }
    };

    const handleCompose = () => {
        setReplyTo(undefined);
        setIsComposerOpen(true);
    };

    return (
        <div className={cn(
            "h-[calc(100vh-6rem)] flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all animate-in fade-in duration-300",
            isIDN
                ? "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/20"
                : "bg-background border-border"
        )}>
            {/* Global Mail Header */}
            <div className={cn(
                "flex items-center justify-between p-4 border-b shrink-0",
                isIDN ? "bg-white/20 border-white/10" : "bg-card border-border"
            )}>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <div className="p-4 border-b flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg">iBoîte</span>
                            </div>
                            <div className="p-4">
                                <Button className="w-full gap-2 mb-4" onClick={handleCompose}>
                                    <Plus className="w-4 h-4" /> Nouveau Message
                                </Button>
                                <MailSidebar
                                    currentFolder={currentFolder}
                                    onSelectFolder={setCurrentFolder}
                                    unreadCount={2}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="hidden md:flex items-center gap-2 text-primary">
                        <Mail className="w-6 h-6" />
                        <h1 className="text-xl font-bold">iBoîte</h1>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher dans tous les messages..."
                        className={cn(
                            "pl-10 border-none shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20",
                            isIDN ? "bg-white/40 dark:bg-black/20" : "bg-muted/50"
                        )}
                    />
                </div>

                <Button className="gap-2 hidden md:flex" onClick={handleCompose}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden lg:inline">Nouveau Message</span>
                </Button>
            </div>

            {/* 3-Pane Layout Content */}
            <div className="flex-1 flex min-h-0">

                {/* Pane 1: Sidebar (Folders) */}
                <div className={cn(
                    "hidden md:flex w-48 flex-col border-r p-3 gap-3",
                    isIDN ? "bg-white/10 border-white/10" : "bg-muted/10 border-border"
                )}>
                    <Button
                        className={cn(
                            "w-full gap-2 font-bold text-sm justify-start",
                            isIDN ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                        variant="ghost"
                        onClick={handleCompose}
                    >
                        <Plus className="w-4 h-4" /> <span className="truncate">Nouveau</span>
                    </Button>
                    <MailSidebar
                        currentFolder={currentFolder}
                        onSelectFolder={setCurrentFolder}
                        unreadCount={2}
                    />
                </div>

                {/* Pane 2: Mail List */}
                <div className={cn(
                    `${selectedMailId ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 flex-col border-r`,
                    isIDN ? "bg-white/5 border-white/10" : "bg-card/50 border-border"
                )}>
                    <div className={cn(
                        "p-3 border-b flex justify-between items-center",
                        isIDN ? "border-white/10" : "border-border"
                    )}>
                        <span className="text-sm font-medium text-muted-foreground">
                            {mails.length} message{mails.length > 1 ? 's' : ''}
                        </span>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            Filtrer
                        </Button>
                    </div>
                    <MailList
                        mails={mails}
                        selectedId={selectedMailId}
                        onSelect={setSelectedMailId}
                    />
                </div>

                {/* Pane 3: Reading View */}
                <div className={cn(
                    `${!selectedMailId ? 'hidden lg:flex' : 'flex'} flex-1 flex-col overflow-y-auto`,
                    isIDN ? "bg-transparent" : "bg-background"
                )}>
                    {selectedMailId ? (
                        <>
                            <div className="lg:hidden p-2 border-b flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMailId(null)} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                            </div>
                            <MailView
                                mail={selectedMail}
                                onReply={handleReply}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center",
                                isIDN ? "bg-white/10" : "bg-muted"
                            )}>
                                <Mail className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="font-medium">Sélectionnez un message pour le lire</p>
                        </div>
                    )}
                </div>
            </div>

            <MailComposer
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
                replyTo={replyTo}
            />
        </div>
    );
}
