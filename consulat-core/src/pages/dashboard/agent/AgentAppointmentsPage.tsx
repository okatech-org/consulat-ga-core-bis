import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calendar as CalendarIcon,
    Clock,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    MapPin,
    FileText,
    List,
    Grid3X3
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Appointment {
    id: string;
    citizen_id: string;
    appointment_date: string;
    duration_minutes: number;
    status: string;
    notes: string | null;
    organization_id: string;
    service_id: string | null;
    citizen?: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
    };
    service?: {
        name: string;
    };
    organization?: {
        name: string;
        city?: string;
    };
}

const STATUS_STYLES: Record<string, { label: string; color: string; bgColor: string }> = {
    SCHEDULED: { label: 'Planifié', color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    CONFIRMED: { label: 'Confirmé', color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    COMPLETED: { label: 'Terminé', color: 'text-gray-700', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
    CANCELLED: { label: 'Annulé', color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    NO_SHOW: { label: 'Absent', color: 'text-orange-700', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
};

const dotColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-500',
    CONFIRMED: 'bg-green-500',
    COMPLETED: 'bg-gray-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-orange-500',
};

export default function AgentAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');

    useEffect(() => {
        loadAppointments();
    }, [currentMonth]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const { data, error } = await supabase
                .from("appointments")
                .select("*")
                .gte("appointment_date", start.toISOString())
                .lte("appointment_date", end.toISOString())
                .order("appointment_date", { ascending: true });

            if (error) throw error;

            // Fetch related data
            const enrichedAppointments = await Promise.all(
                (data || []).map(async (apt) => {
                    const [profileRes, serviceRes, orgRes] = await Promise.all([
                        supabase.from("profiles").select("first_name, last_name, email, phone").eq("user_id", apt.citizen_id).single(),
                        apt.service_id ? supabase.from("services").select("name").eq("id", apt.service_id).single() : Promise.resolve({ data: null }),
                        supabase.from("organizations").select("name, city").eq("id", apt.organization_id).single(),
                    ]);

                    return {
                        ...apt,
                        citizen: profileRes.data || undefined,
                        service: serviceRes.data || undefined,
                        organization: orgRes.data || undefined,
                    };
                })
            );

            setAppointments(enrichedAppointments);
        } catch (error) {
            console.error("Error loading appointments:", error);
            toast.error("Erreur lors du chargement des rendez-vous");
        } finally {
            setLoading(false);
        }
    };

    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter((apt) => isSameDay(parseISO(apt.appointment_date), date));
    };

    const filteredAppointments = appointments.filter(app => {
        const citizenName = app.citizen ? `${app.citizen.first_name} ${app.citizen.last_name}` : 'Inconnu';
        const matchesSearch = citizenName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? app.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const handleStatusUpdate = async () => {
        if (!selectedAppointment || !newStatus) return;

        try {
            const { error } = await supabase
                .from("appointments")
                .update({
                    status: newStatus,
                    notes: statusNotes || selectedAppointment.notes,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", selectedAppointment.id);

            if (error) throw error;

            // Send notification
            await supabase.from("notifications").insert({
                user_id: selectedAppointment.citizen_id,
                type: newStatus === "CONFIRMED" ? "appointment_confirmation" : newStatus === "CANCELLED" ? "appointment_cancellation" : "updated",
                title: `Rendez-vous ${STATUS_STYLES[newStatus]?.label?.toLowerCase() || newStatus}`,
                message: `Votre rendez-vous du ${format(parseISO(selectedAppointment.appointment_date), "d MMMM yyyy à HH:mm", { locale: fr })} a été ${STATUS_STYLES[newStatus]?.label?.toLowerCase() || newStatus}.`,
                appointment_id: selectedAppointment.id,
                channel: "app",
                status: "pending",
            });

            toast.success("Statut mis à jour avec succès");
            setIsDetailOpen(false);
            setSelectedAppointment(null);
            setNewStatus('');
            setStatusNotes('');
            loadAppointments();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const firstDayOfMonth = startOfMonth(currentMonth).getDay();
    const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestion des Rendez-vous</h1>
                        <p className="text-muted-foreground">
                            Visualisez et gérez les rendez-vous consulaires.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant={viewMode === 'list' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4 mr-2" />
                            Liste
                        </Button>
                        <Button 
                            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                        >
                            <Grid3X3 className="w-4 h-4 mr-2" />
                            Calendrier
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-card rounded-xl p-4 border flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Rechercher un citoyen..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-full ${statusFilter === null ? 'bg-primary/10 text-primary font-bold' : ''}`}
                            onClick={() => setStatusFilter(null)}
                        >
                            Tous
                        </Button>
                        {Object.entries(STATUS_STYLES).map(([key, style]) => (
                            <Button
                                key={key}
                                variant="ghost"
                                size="sm"
                                className={`rounded-full gap-2 ${statusFilter === key ? 'bg-muted font-bold' : ''}`}
                                onClick={() => setStatusFilter(key)}
                            >
                                <div className={`w-2 h-2 rounded-full ${dotColors[key]}`} />
                                {style.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {viewMode === 'calendar' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Calendrier
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-semibold min-w-[140px] text-center">
                                        {format(currentMonth, "MMMM yyyy", { locale: fr })}
                                    </span>
                                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Week days header */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: paddingDays }).map((_, i) => (
                                        <div key={`padding-${i}`} className="aspect-square" />
                                    ))}

                                    {days.map((day) => {
                                        const dayAppointments = getAppointmentsForDate(day);
                                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                                        const isCurrentDay = isToday(day);

                                        return (
                                            <motion.button
                                                key={day.toISOString()}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedDate(day)}
                                                className={`
                                                    aspect-square p-1 rounded-lg border transition-colors relative
                                                    ${isSelected ? "border-primary bg-primary/10" : "border-transparent hover:border-muted-foreground/20"}
                                                    ${isCurrentDay ? "bg-primary/5 font-bold" : ""}
                                                    ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}
                                                `}
                                            >
                                                <span className={`text-sm ${isCurrentDay ? "text-primary" : ""}`}>
                                                    {format(day, "d")}
                                                </span>
                                                {dayAppointments.length > 0 && (
                                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                        {dayAppointments.slice(0, 3).map((apt, i) => (
                                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${dotColors[apt.status] || 'bg-blue-500'}`} />
                                                        ))}
                                                        {dayAppointments.length > 3 && (
                                                            <span className="text-[8px] text-muted-foreground">+{dayAppointments.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                                    {Object.entries(STATUS_STYLES).map(([key, style]) => (
                                        <div key={key} className="flex items-center gap-1.5 text-xs">
                                            <div className={`w-2 h-2 rounded-full ${dotColors[key]}`} />
                                            <span>{style.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Day details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: fr }) : "Sélectionnez un jour"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence mode="wait">
                                    {selectedDate ? (
                                        <motion.div
                                            key={selectedDate.toISOString()}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-3"
                                        >
                                            {getAppointmentsForDate(selectedDate).length === 0 ? (
                                                <p className="text-muted-foreground text-center py-8">
                                                    Aucun rendez-vous ce jour
                                                </p>
                                            ) : (
                                                getAppointmentsForDate(selectedDate).map((apt) => (
                                                    <motion.div
                                                        key={apt.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                                                        onClick={() => {
                                                            setSelectedAppointment(apt);
                                                            setNewStatus(apt.status);
                                                            setIsDetailOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {format(parseISO(apt.appointment_date), "HH:mm")}
                                                                    </span>
                                                                    <Badge className={`${STATUS_STYLES[apt.status]?.bgColor} ${STATUS_STYLES[apt.status]?.color}`} variant="secondary">
                                                                        {STATUS_STYLES[apt.status]?.label || apt.status}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground truncate mt-1">
                                                                    {apt.citizen ? `${apt.citizen.first_name} ${apt.citizen.last_name}` : "Citoyen"}
                                                                </p>
                                                                {apt.service && (
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {apt.service.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </motion.div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">
                                            Cliquez sur un jour pour voir les rendez-vous
                                        </p>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* List View */
                    <div className="grid gap-4">
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Aucun rendez-vous trouvé.
                            </div>
                        ) : (
                            filteredAppointments.map((app) => {
                                const style = STATUS_STYLES[app.status] || STATUS_STYLES.SCHEDULED;
                                const citizenName = app.citizen ? `${app.citizen.first_name} ${app.citizen.last_name}` : 'Inconnu';

                                return (
                                    <div key={app.id} className="bg-card border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:shadow-md transition-all">
                                        {/* Time & Date */}
                                        <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0 min-w-[100px] border-r md:border-r-0 border-border pr-4 md:pr-0">
                                            <span className="text-xl font-bold text-primary">{format(parseISO(app.appointment_date), 'HH:mm')}</span>
                                            <span className="text-sm text-muted-foreground font-medium">{format(parseISO(app.appointment_date), 'd MMM', { locale: fr })}</span>
                                        </div>

                                        {/* Citizen Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {citizenName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-lg leading-none mb-1">{citizenName}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{app.service?.name || 'Service'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location & Status */}
                                        <div className="flex flex-col md:items-end gap-1 min-w-[150px]">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {app.organization?.name || 'Consulat'}
                                            </div>
                                            <Badge variant="outline" className={`${style.bgColor} ${style.color} gap-1`}>
                                                {style.label}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAppointment(app);
                                                    setNewStatus(app.status);
                                                    setIsDetailOpen(true);
                                                }}
                                            >
                                                Détails
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedAppointment(app);
                                                        setNewStatus('CONFIRMED');
                                                        handleStatusUpdate();
                                                    }}>
                                                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                                        Confirmer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedAppointment(app);
                                                        setNewStatus('COMPLETED');
                                                        handleStatusUpdate();
                                                    }}>
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Marquer terminé
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedAppointment(app);
                                                        setNewStatus('CANCELLED');
                                                        handleStatusUpdate();
                                                    }} className="text-destructive">
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Annuler
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Appointment detail dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Détails du rendez-vous</DialogTitle>
                        </DialogHeader>
                        {selectedAppointment && (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">
                                                {selectedAppointment.citizen?.first_name} {selectedAppointment.citizen?.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{selectedAppointment.citizen?.email}</p>
                                            {selectedAppointment.citizen?.phone && (
                                                <p className="text-sm text-muted-foreground">{selectedAppointment.citizen?.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">
                                                {format(parseISO(selectedAppointment.appointment_date), "d MMMM yyyy à HH:mm", { locale: fr })}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Durée: {selectedAppointment.duration_minutes} minutes
                                            </p>
                                        </div>
                                    </div>

                                    {selectedAppointment.service && (
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <p>{selectedAppointment.service.name}</p>
                                        </div>
                                    )}

                                    {selectedAppointment.organization && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <p>{selectedAppointment.organization.name}{selectedAppointment.organization.city ? `, ${selectedAppointment.organization.city}` : ""}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Statut</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SCHEDULED">Planifié</SelectItem>
                                            <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                                            <SelectItem value="COMPLETED">Terminé</SelectItem>
                                            <SelectItem value="CANCELLED">Annulé</SelectItem>
                                            <SelectItem value="NO_SHOW">Absent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        placeholder="Ajouter des notes..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleStatusUpdate}>
                                Mettre à jour
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
