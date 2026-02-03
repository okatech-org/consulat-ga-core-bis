import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users, Video, Plus, CalendarDays } from 'lucide-react';

export function MeetingInterface() {
    const upcomingMeetings = [
        {
            id: 1,
            title: "Audition Consulaire - Renouvellement",
            date: "Aujourd'hui",
            time: "14:30",
            host: "Consulat Paris",
            status: "upcoming"
        },
        {
            id: 2,
            title: "Assemblée Générale - Assoc. Gabonais",
            date: "15 Déc",
            time: "18:00",
            host: "AGF",
            status: "scheduled"
        }
    ];

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                    <div className="neu-raised w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">Mes Réunions</h3>
                </div>
                <Button size="sm" className="neu-raised hover:text-primary transition-all gap-2 text-xs font-medium">
                    <Plus className="w-3 h-3" /> Planifier
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="neu-raised p-4 rounded-xl group hover:shadow-neo-md transition-all duration-300 border border-transparent hover:border-primary/10">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{meeting.title}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Organisé par <span className="font-medium text-foreground/80">{meeting.host}</span></span>
                                </p>
                            </div>
                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${meeting.status === 'upcoming'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                {meeting.status === 'upcoming' ? 'Bientôt' : 'Prévu'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
                            <span className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md">
                                <Calendar className="w-3.5 h-3.5" /> {meeting.date}
                            </span>
                            <span className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5" /> {meeting.time}
                            </span>
                        </div>

                        {meeting.status === 'upcoming' && (
                            <Button size="sm" className="w-full mt-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                                <Video className="w-3.5 h-3.5" /> Rejoindre la salle
                            </Button>
                        )}
                    </div>
                ))}

                <div className="neu-inset p-8 rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground mt-6 border border-dashed border-border/50">
                    <Calendar className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium text-center opacity-60">Aucune autre réunion prévue pour le moment.</p>
                </div>
            </div>
        </div>
    );
}
