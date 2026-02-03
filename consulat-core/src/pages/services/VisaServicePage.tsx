import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, CheckCircle, Clock, AlertCircle, Plane, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { serviceRequestService, visaRequestSchema, type VisaRequest } from "@/services/serviceRequestService";
import iconVisa from "@/assets/icons/icon-visa.png";

export default function VisaServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState("");
  const [formData, setFormData] = useState<VisaRequest>({
    firstName: "",
    lastName: "",
    birthDate: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    visaType: "tourist",
    arrivalDate: "",
    departureDate: "",
    accommodation: "",
    phone: "",
    email: "",
    comments: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email || "" }));
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validateStep1 = () => {
    const result = visaRequestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast.error("Connexion requise");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await serviceRequestService.submitVisaRequest(formData);
      setReferenceNumber(`VIS-${result.id.slice(0, 8).toUpperCase()}`);
      toast.success("Demande de visa soumise avec succès");
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visaTypes = [
    { id: "tourist", name: "Visa Touristique", duration: "30 jours", price: "70 000 FCFA" },
    { id: "business", name: "Visa Affaires", duration: "90 jours", price: "100 000 FCFA" },
    { id: "transit", name: "Visa Transit", duration: "72 heures", price: "25 000 FCFA" },
    { id: "long", name: "Visa Long Séjour", duration: "1 an", price: "150 000 FCFA" },
  ];

  const requiredDocuments = [
    "Passeport valide (6 mois minimum)",
    "2 photos d'identité récentes",
    "Billet d'avion aller-retour",
    "Réservation d'hébergement",
    "Attestation d'assurance voyage",
    "Justificatif de moyens financiers",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="flex items-center gap-6">
            <img src={iconVisa} alt="Visa" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Demande de Visa</h1>
              <p className="text-lg text-white/80">Obtenez votre visa pour entrer au Gabon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Voyage" : s === 2 ? "Documents" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-blue-600" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {!isLoggedIn && (
                  <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <LogIn className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <p className="font-medium text-amber-800 dark:text-amber-200">Connexion requise</p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">Connectez-vous pour soumettre une demande.</p>
                        </div>
                        <Button size="sm" onClick={() => navigate("/login")}>Se connecter</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de voyage</CardTitle>
                    <CardDescription>Renseignez les détails de votre séjour au Gabon</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label>Type de visa *</Label>
                      <RadioGroup
                        value={formData.visaType}
                        onValueChange={(value: "tourist" | "business" | "transit" | "long") => setFormData({ ...formData, visaType: value })}
                        className="grid md:grid-cols-2 gap-4"
                      >
                        {visaTypes.map((visa) => (
                          <div key={visa.id} className="relative">
                            <RadioGroupItem value={visa.id} id={visa.id} className="peer sr-only" />
                            <Label
                              htmlFor={visa.id}
                              className="flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/30"
                            >
                              <span className="font-semibold">{visa.name}</span>
                              <span className="text-sm text-muted-foreground">{visa.duration}</span>
                              <span className="text-sm font-medium text-blue-600">{visa.price}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom *</Label>
                        <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={errors.lastName ? "border-red-500" : ""} />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Prénom(s) *</Label>
                        <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={errors.firstName ? "border-red-500" : ""} />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date de naissance *</Label>
                        <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nationalité *</Label>
                        <Input value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} placeholder="Française, etc." />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Numéro de passeport *</Label>
                        <Input value={formData.passportNumber} onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Date d'expiration *</Label>
                        <Input type="date" value={formData.passportExpiry} onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date d'arrivée *</Label>
                        <Input type="date" value={formData.arrivalDate} onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Date de départ *</Label>
                        <Input type="date" value={formData.departureDate} onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Téléphone *</Label>
                        <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Adresse d'hébergement au Gabon *</Label>
                      <Textarea value={formData.accommodation} onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })} placeholder="Hôtel, adresse résidentielle..." />
                    </div>

                    <Button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isLoggedIn}>
                      {isLoggedIn ? "Continuer" : "Connectez-vous"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Documents requis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{doc}</p>
                          <p className="text-sm text-muted-foreground">PDF, JPG, PNG (max 5 Mo)</p>
                        </div>
                        <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Télécharger</Button>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Motif du voyage</Label>
                      <Textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} />
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                        {isSubmitting ? "Envoi..." : "Soumettre"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="text-center py-12">
                  <CardContent className="space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Demande envoyée !</h2>
                      <p className="text-muted-foreground">Référence: <strong>{referenceNumber}</strong></p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" asChild><Link to="/services">Services</Link></Button>
                      <Button className="bg-blue-600" asChild><Link to="/mes-demandes">Suivre</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-600" />Délais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {visaTypes.map((v, i) => (
                  <div key={i} className={`flex justify-between ${i < visaTypes.length - 1 ? 'pb-4 border-b' : ''}`}>
                    <span>{v.name}</span>
                    <span className="font-semibold">{v.duration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5 text-blue-600" />Conditions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" />Passeport valide 6 mois</li>
                  <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" />Vaccination fièvre jaune</li>
                  <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" />Billet retour confirmé</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">E-Visa</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Disponible pour certaines nationalités.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
