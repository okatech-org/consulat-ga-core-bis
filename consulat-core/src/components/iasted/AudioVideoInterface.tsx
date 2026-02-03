import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MoreVertical, UserPlus, Phone } from 'lucide-react';

interface AudioVideoInterfaceProps {
    mode: 'audio' | 'video';
}

export function AudioVideoInterface({ mode }: AudioVideoInterfaceProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

    if (callStatus === 'idle') {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-8">
                <div className="relative group">
                    <div className="neu-raised w-32 h-32 rounded-full flex items-center justify-center animate-pulse group-hover:shadow-neo-lg transition-all duration-500">
                        <Avatar className="w-24 h-24 border-4 border-background/50">
                            <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">A</AvatarFallback>
                        </Avatar>
                    </div>
                    <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-background rounded-full shadow-lg"></span>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="font-bold text-2xl text-foreground">Agent Consulaire</h3>
                    <p className="text-sm text-muted-foreground">Disponible pour un appel {mode === 'video' ? 'vidéo' : 'audio'}</p>
                </div>
                <Button
                    size="lg"
                    className="neu-raised rounded-full w-20 h-20 bg-green-500/10 hover:bg-green-500/20 text-green-500 hover:scale-110 transition-all duration-300 border-2 border-green-500/20"
                    onClick={() => setCallStatus('calling')}
                >
                    {mode === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col neu-inset rounded-2xl overflow-hidden relative bg-black/20">
            {/* Remote Video / Avatar */}
            <div className="flex-1 flex items-center justify-center relative p-4">
                {mode === 'video' && !isVideoOff ? (
                    <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900/50 flex items-center justify-center border border-white/5">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center animate-pulse">
                                <Video className="w-8 h-8 text-white/20" />
                            </div>
                            <span className="text-white/40 text-sm font-medium">Flux Vidéo Distant (Simulation)</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                        <div className="neu-raised w-40 h-40 rounded-full flex items-center justify-center p-1">
                            <Avatar className="w-full h-full border-4 border-background/50">
                                <AvatarFallback className="bg-primary/20 text-primary text-5xl font-bold">A</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-foreground">Agent Consulaire</h3>
                            <p className="text-green-500 text-sm font-medium animate-pulse">
                                {callStatus === 'calling' ? 'Appel en cours...' : 'Connecté'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Call Status Overlay */}
                {callStatus === 'calling' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10">
                        <div className="neu-raised w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <Phone className="w-10 h-10 text-primary" />
                        </div>
                        <span className="text-foreground font-medium animate-pulse">Appel en cours...</span>
                    </div>
                )}
            </div>

            {/* Local Video (PIP) */}
            {mode === 'video' && (
                <div className="absolute top-4 right-4 w-32 h-44 neu-raised rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                    <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-md">
                        <span className="text-[10px] text-white/50 font-medium">Moi</span>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="p-6 flex justify-center gap-6 bg-gradient-to-t from-background/90 to-transparent backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-14 h-14 transition-all duration-300 ${isMuted
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg'
                        : 'neu-raised hover:text-primary hover:scale-110'}`}
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                {mode === 'video' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full w-14 h-14 transition-all duration-300 ${isVideoOff
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg'
                            : 'neu-raised hover:text-primary hover:scale-110'}`}
                        onClick={() => setIsVideoOff(!isVideoOff)}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </Button>
                )}

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 shadow-lg hover:scale-110 transition-all duration-300"
                    onClick={() => setCallStatus('idle')}
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
