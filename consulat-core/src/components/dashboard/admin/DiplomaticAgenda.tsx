import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useState } from "react";

interface DiplomaticEvent {
    appointmentId: string;
    title: string;
    type: 'official' | 'ceremony' | 'other';
    startTime: number;
    endTime: number;
    location: string;
    status: string;
    attendeesCount: number;
    description: string;
}

const MOCK_AGENDA: DiplomaticEvent[] = [
    {
        appointmentId: '1',
        title: 'Réception Ambassadeur',
        type: 'official',
        startTime: Date.now() + 1000 * 60 * 60 * 24, // Tomorrow
        endTime: Date.now() + 1000 * 60 * 60 * 26,
        location: 'Résidence de France',
        status: 'confirmed',
        attendeesCount: 50,
        description: 'Fête nationale'
    },
    {
        appointmentId: '2',
        title: 'Cérémonie Mariage (M. Bongo)',
        type: 'ceremony',
        startTime: Date.now() + 1000 * 60 * 60 * 48, // Day after tomorrow
        endTime: Date.now() + 1000 * 60 * 60 * 50,
        location: 'Salle des Mariages',
        status: 'confirmed',
        attendeesCount: 12,
        description: ''
    },
    {
        appointmentId: '3',
        title: 'Réunion de Service',
        type: 'other',
        startTime: Date.now() + 1000 * 60 * 60 * 5, // Today later
        endTime: Date.now() + 1000 * 60 * 60 * 6,
        location: 'Salle de Réunion 1',
        status: 'confirmed',
        attendeesCount: 8,
        description: 'Point hebdomadaire'
    }
];

export function DiplomaticAgenda({ data = MOCK_AGENDA }: { data?: DiplomaticEvent[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <Card className="neu-raised h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Agenda Diplomatique
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="neu-inset rounded-md border"
                    />
                </div>
                <div className="flex-1 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Prochains Événements</h3>
                    {data.map((event) => (
                        <div key={event.appointmentId} className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors border-l-2 border-primary">
                            <div className="flex flex-col items-center justify-center min-w-[50px] bg-muted/30 rounded p-1">
                                <span className="text-xs font-bold text-primary">
                                    {new Date(event.startTime).toLocaleDateString('fr-FR', { day: 'numeric' })}
                                </span>
                                <span className="text-[10px] uppercase text-muted-foreground">
                                    {new Date(event.startTime).toLocaleDateString('fr-FR', { month: 'short' })}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm">{event.title}</h4>
                                    <Badge variant="outline" className="text-[10px]">
                                        {new Date(event.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {event.attendeesCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
