import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, Video, Phone, Users, X, Maximize2, Minimize2 } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { AudioVideoInterface } from './AudioVideoInterface';
import { MeetingInterface } from './MeetingInterface';

export function IAstedHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="lg"
                    className="rounded-full shadow-lg h-16 w-16 p-0 bg-gradient-to-r from-primary to-blue-600 hover:scale-110 transition-transform duration-300"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="relative">
                        <Bot className="w-8 h-8 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                </Button>
            </div>
        );
    }

    return (
        <div className={`fixed z-50 transition-all duration-300 ease-in-out ${isExpanded
                ? 'inset-4 bottom-4 right-4'
                : 'bottom-6 right-6 w-[400px] h-[600px]'
            }`}>
            <Card className="w-full h-full flex flex-col shadow-2xl border-primary/20 overflow-hidden bg-background/95 backdrop-blur-sm">
                {/* Header */}
                <div className="p-3 bg-primary text-primary-foreground flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Hub de Communication</h3>
                            <p className="text-xs opacity-80 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                iAsted en ligne
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="border-b px-4 bg-muted/30 shrink-0">
                        <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-4">
                            <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full gap-2">
                                <MessageSquare className="w-4 h-4" /> Chat
                            </TabsTrigger>
                            <TabsTrigger value="call" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full gap-2">
                                <Phone className="w-4 h-4" /> Appel
                            </TabsTrigger>
                            <TabsTrigger value="video" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full gap-2">
                                <Video className="w-4 h-4" /> Visio
                            </TabsTrigger>
                            <TabsTrigger value="meeting" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full gap-2">
                                <Users className="w-4 h-4" /> Réunion
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <TabsContent value="chat" className="h-full m-0 data-[state=active]:flex flex-col">
                            <ChatInterface isExpanded={isExpanded} />
                        </TabsContent>
                        <TabsContent value="call" className="h-full m-0 p-4">
                            <AudioVideoInterface mode="audio" />
                        </TabsContent>
                        <TabsContent value="video" className="h-full m-0 p-4">
                            <AudioVideoInterface mode="video" />
                        </TabsContent>
                        <TabsContent value="meeting" className="h-full m-0 p-4">
                            <MeetingInterface />
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    );
}
