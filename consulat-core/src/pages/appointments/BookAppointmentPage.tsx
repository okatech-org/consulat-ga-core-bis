import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarDays, Clock, MapPin, CheckCircle, ArrowLeft, ArrowRight, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Organization {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

interface Service {
  id: string;
  name: string;
  processing_time_days: number | null;
}

const generateTimeSlots = (existingAppointments: string[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const isBooked = existingAppointments.some(appt => appt.includes(time));
      slots.push({ time, available: !isBooked });
    }
  }
  return slots;
};

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, city, country")
        .order("name");
      
      if (data && !error) {
        setOrganizations(data);
      }
    };
    fetchOrganizations();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, processing_time_days")
        .eq("is_active", true)
        .order("name");
      
      if (data && !error) {
        setServices(data);
      }
    };
    fetchServices();
  }, []);

  // Fetch available time slots when date and organization change
  useEffect(() => {
    if (!selectedDate || !selectedOrganization) {
      setTimeSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("appointment_date")
        .eq("organization_id", selectedOrganization)
        .gte("appointment_date", `${dateStr}T00:00:00`)
        .lt("appointment_date", `${dateStr}T23:59:59`)
        .neq("status", "CANCELLED");
      
      if (!error) {
        const bookedTimes = (appointments || []).map(a => a.appointment_date);
        setTimeSlots(generateTimeSlots(bookedTimes));
      }
      setLoading(false);
    };

    fetchSlots();
  }, [selectedDate, selectedOrganization]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedOrganization) {
      toast.error("Veuillez compléter toutes les informations requises");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour prendre un rendez-vous");
        navigate("/login");
        return;
      }

      const appointmentDate = `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`;

      const { error } = await supabase
        .from("appointments")
        .insert({
          citizen_id: user.id,
          organization_id: selectedOrganization,
          service_id: selectedService || null,
          appointment_date: appointmentDate,
          duration_minutes: 30,
          notes: notes || null,
          status: "SCHEDULED"
        });

      if (error) throw error;

      toast.success("Rendez-vous confirmé avec succès!");
      setStep(4);
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error("Erreur lors de la réservation: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrg = organizations.find(o => o.id === selectedOrganization);
  const selectedSvc = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Prendre un rendez-vous</h1>
          <p className="text-muted-foreground mt-2">
            Réservez un créneau pour vos démarches consulaires
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[
            { num: 1, label: "Organisation" },
            { num: 2, label: "Date & Heure" },
            { num: 3, label: "Confirmation" },
            { num: 4, label: "Terminé" }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                step >= s.num 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={cn(
                "ml-2 text-sm hidden sm:inline",
                step >= s.num ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
              {idx < 3 && (
                <div className={cn(
                  "w-12 sm:w-24 h-1 mx-2 rounded",
                  step > s.num ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Organization & Service */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Choisir l'organisation et le service
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le consulat et le service souhaité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organisation *</label>
                    <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un consulat" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name} {org.city && `- ${org.city}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service (optionnel)</label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(svc => (
                          <SelectItem key={svc.id} value={svc.id}>
                            {svc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={!selectedOrganization}
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Choisir une date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      disabled={(date) => 
                        isBefore(date, startOfDay(new Date())) || 
                        date.getDay() === 0 || 
                        date.getDay() === 6
                      }
                      locale={fr}
                      className="rounded-md border pointer-events-auto"
                    />
                  </CardContent>
                </Card>

                {/* Time Slots */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Choisir un créneau
                    </CardTitle>
                    {selectedDate && (
                      <CardDescription>
                        {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {!selectedDate ? (
                      <p className="text-muted-foreground text-center py-8">
                        Sélectionnez d'abord une date
                      </p>
                    ) : loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={cn(
                              "w-full",
                              !slot.available && "opacity-50 line-through"
                            )}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!selectedDate || !selectedTime}
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Confirmez votre rendez-vous</CardTitle>
                  <CardDescription>
                    Vérifiez les informations avant de confirmer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{selectedOrg?.name}</p>
                        {selectedOrg?.city && (
                          <p className="text-sm text-muted-foreground">
                            {selectedOrg.city}, {selectedOrg.country}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {selectedSvc && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedSvc.name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground">à {selectedTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (optionnel)</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Informations complémentaires pour votre rendez-vous..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Confirmation..." : "Confirmer le rendez-vous"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Rendez-vous confirmé!
                  </h2>
                  <p className="text-green-700">
                    Votre rendez-vous a été enregistré avec succès.
                    Vous recevrez une confirmation par email.
                  </p>
                  <div className="p-4 bg-white rounded-lg border border-green-200 text-left max-w-md mx-auto">
                    <p className="font-medium">{selectedOrg?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} à {selectedTime}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center pt-4">
                    <Button variant="outline" onClick={() => navigate("/dashboard/citizen")}>
                      Retour au tableau de bord
                    </Button>
                    <Button onClick={() => navigate("/mes-demandes")}>
                      Voir mes rendez-vous
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
