import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Paperclip, Mic, Sparkles } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

interface ChatInterfaceProps {
    isExpanded: boolean;
}

export function ChatInterface({ isExpanded }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Bonjour ! Je suis iAsted. Je peux répondre à vos questions ou vous mettre en relation avec un agent humain. Que souhaitez-vous faire ?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAiMode, setIsAiMode] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useDemo();

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate Response
        setTimeout(() => {
            const responseContent = isAiMode
                ? generateAiResponse(userMsg.content)
                : "Un agent va prendre en charge votre demande dans quelques instants...";

            const responseMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, responseMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const generateAiResponse = (input: string): string => {
        // Mock Logic for "Adaptable Prompts"
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('humain') || lowerInput.includes('agent')) {
            setIsAiMode(false);
            return "Je vous transfère immédiatement vers un agent humain disponible. Veuillez patienter un instant.";
        }
        if (lowerInput.includes('passeport')) return "Pour le passeport, les délais actuels sont de 3 semaines. Voulez-vous prendre rendez-vous ?";
        return "Je comprends. Je suis configuré pour vous aider sur les démarches consulaires. Pouvez-vous préciser ?";
    };

    return (
        <div className="flex flex-col h-full bg-muted/10">
            {/* Mode Switcher */}
            <div className="px-4 py-2 bg-background border-b flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mode actuel :</span>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setIsAiMode(true)}
                        className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${isAiMode ? 'bg-white shadow text-primary font-medium' : 'hover:text-primary'}`}
                    >
                        <Sparkles className="w-3 h-3" /> IA
                    </button>
                    <button
                        onClick={() => setIsAiMode(false)}
                        className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${!isAiMode ? 'bg-white shadow text-primary font-medium' : 'hover:text-primary'}`}
                    >
                        <User className="w-3 h-3" /> Humain
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <Avatar className="w-8 h-8 border shrink-0">
                                {msg.role === 'assistant' ? (
                                    <AvatarFallback className={isAiMode ? "bg-primary text-primary-foreground" : "bg-orange-500 text-white"}>
                                        {isAiMode ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </AvatarFallback>
                                ) : (
                                    <AvatarFallback className="bg-accent">{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className={`flex flex-col gap-1 max-w-[80%]`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground">
                                        {msg.role === 'assistant' ? (isAiMode ? 'iAsted' : 'Agent Support') : 'Vous'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground opacity-50">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-white border shadow-sm rounded-tl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <Avatar className="w-8 h-8 border shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-white border shadow-sm rounded-2xl rounded-tl-none p-3 flex gap-1 items-center">
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t flex gap-2 items-end">
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                    <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                    placeholder={isAiMode ? "Posez une question à iAsted..." : "Écrivez à un agent..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-muted/30"
                />
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                    <Mic className="w-5 h-5" />
                </Button>
                <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()} className="shrink-0">
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
