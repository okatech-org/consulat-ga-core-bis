import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Upload, CheckCircle, Clock, MapPin, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { serviceRequestService, consularCardRequestSchema, type ConsularCardRequest } from "@/services/serviceRequestService";
import iconConsularCard from "@/assets/icons/icon-consular-card.png";

export default function ConsularCardServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState("");
  const [formData, setFormData] = useState<ConsularCardRequest>({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    profession: "",
    address: "",
    city: "",
    country: "",
    arrivalDate: "",
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
    comments: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user?.email) setFormData(prev => ({ ...prev, email: user.email || "" }));
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setIsLoggedIn(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  const validateStep1 = () => {
    const result = consularCardRequestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast.error("Veuillez corriger les erreurs");
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error("Connexion requise"); return; }
    setIsSubmitting(true);
    try {
      const result = await serviceRequestService.submitConsularCardRequest(formData);
      setReferenceNumber(`CC-${result.id.slice(0, 8).toUpperCase()}`);
      toast.success("Demande soumise avec succès");
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredDocuments = ["Passeport gabonais valide", "Acte de naissance intégral", "2 photos d'identité", "Justificatif de domicile", "Attestation de résidence"];
  const benefits = ["Inscription au registre", "Démarches facilitées", "Participation élections", "Assistance urgence", "Accès services consulaires"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"><ArrowLeft className="h-4 w-4" />Retour</Link>
          <div className="flex items-center gap-6">
            <img src={iconConsularCard} alt="Carte Consulaire" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Carte Consulaire</h1>
              <p className="text-lg text-white/80">Inscription et obtention de votre carte</p>
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? "bg-yellow-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Identité" : s === 2 ? "Documents" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-yellow-600" : "bg-muted"}`} />}
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
                        </div>
                        <Button size="sm" onClick={() => navigate("/login")}>Se connecter</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Renseignez vos informations pour l'inscription</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom *</Label>
                        <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={errors.lastName ? "border-red-500" : ""} />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Prénom(s) *</Label>
                        <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={errors.firstName ? "border-red-500" : ""} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date de naissance *</Label>
                        <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Lieu de naissance *</Label>
                        <Input value={formData.birthPlace} onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })} placeholder="Libreville, Gabon" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Profession *</Label>
                      <Input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Ingénieur, Étudiant..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse complète *</Label>
                      <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ville *</Label>
                        <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Paris" />
                      </div>
                      <div className="space-y-2">
                        <Label>Pays de résidence *</Label>
                        <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="US">États-Unis</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="BE">Belgique</SelectItem>
                            <SelectItem value="CH">Suisse</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'arrivée dans le pays *</Label>
                      <Input type="date" value={formData.arrivalDate} onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })} />
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
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Contact d'urgence</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom *</Label>
                          <Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone *</Label>
                          <Input type="tel" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={!isLoggedIn}>
                      {isLoggedIn ? "Continuer" : "Connectez-vous"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader><CardTitle>Documents requis</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1"><p className="font-medium">{doc}</p><p className="text-sm text-muted-foreground">PDF, JPG, PNG</p></div>
                        <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Télécharger</Button>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Commentaires</Label>
                      <Textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} />
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-yellow-600 hover:bg-yellow-700" disabled={isSubmitting}>
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
                      <Button className="bg-yellow-600" asChild><Link to="/mes-demandes">Suivre</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-yellow-600" />Avantages</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((b, i) => <li key={i} className="flex gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" />{b}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-600" />Délais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between pb-4 border-b"><span>Traitement</span><span className="font-semibold">1-2 semaines</span></div>
                <div className="flex justify-between pb-4 border-b"><span>Tarif</span><span className="font-semibold">15 000 FCFA</span></div>
                <div className="flex justify-between"><span>Validité</span><span className="font-semibold">5 ans</span></div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Retrait sur place</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Carte à retirer au consulat avec pièce d'identité.</p>
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
