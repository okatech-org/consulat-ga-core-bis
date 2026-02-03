import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Stamp, Upload, CheckCircle, Clock, FileText, AlertCircle, Files, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { serviceRequestService, legalizationRequestSchema, type LegalizationRequest } from "@/services/serviceRequestService";
import iconLegalization from "@/assets/icons/icon-legalization.png";

export default function LegalizationServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState<LegalizationRequest>({
    firstName: "",
    lastName: "",
    documentType: "",
    documentCount: "1",
    documentOrigin: "",
    purpose: "",
    urgency: "normal",
    phone: "",
    email: "",
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
    const result = legalizationRequestSchema.safeParse(formData);
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
    if (!acceptTerms) { toast.error("Veuillez accepter les conditions"); return; }
    setIsSubmitting(true);
    try {
      const result = await serviceRequestService.submitLegalizationRequest(formData);
      setReferenceNumber(`LEG-${result.id.slice(0, 8).toUpperCase()}`);
      toast.success("Demande soumise avec succès");
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypes = [
    { id: "diploma", name: "Diplôme / Attestation" },
    { id: "birth", name: "Acte de naissance" },
    { id: "marriage", name: "Acte de mariage" },
    { id: "certificate", name: "Certificat" },
    { id: "contract", name: "Contrat juridique" },
    { id: "commercial", name: "Document commercial" },
    { id: "other", name: "Autre" },
  ];

  const pricingInfo = [
    { type: "Document standard", price: "10 000 FCFA" },
    { type: "Document notarié", price: "15 000 FCFA" },
    { type: "Document commercial", price: "20 000 FCFA" },
    { type: "Urgence (+)", price: "+50%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"><ArrowLeft className="h-4 w-4" />Retour</Link>
          <div className="flex items-center gap-6">
            <img src={iconLegalization} alt="Légalisation" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Légalisation de Documents</h1>
              <p className="text-lg text-white/80">Authentification et légalisation officielle</p>
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Documents" : s === 2 ? "Téléchargement" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-purple-600" : "bg-muted"}`} />}
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
                        <div className="flex-1"><p className="font-medium text-amber-800 dark:text-amber-200">Connexion requise</p></div>
                        <Button size="sm" onClick={() => navigate("/login")}>Se connecter</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations sur les documents</CardTitle>
                    <CardDescription>Décrivez les documents à légaliser</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom *</Label>
                        <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={errors.lastName ? "border-red-500" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label>Prénom(s) *</Label>
                        <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type de document *</Label>
                        <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre de documents *</Label>
                        <Select value={formData.documentCount} onValueChange={(value) => setFormData({ ...formData, documentCount: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Pays d'origine du document *</Label>
                      <Select value={formData.documentOrigin} onValueChange={(value) => setFormData({ ...formData, documentOrigin: value })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GA">Gabon</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="US">États-Unis</SelectItem>
                          <SelectItem value="OTHER">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Motif de la légalisation *</Label>
                      <Textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="Usage au Gabon, procédure administrative..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Délai souhaité</Label>
                      <Select value={formData.urgency} onValueChange={(value: "normal" | "urgent") => setFormData({ ...formData, urgency: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (3-5 jours)</SelectItem>
                          <SelectItem value="urgent">Urgent 24h (+50%)</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <Button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full bg-purple-600 hover:bg-purple-700" disabled={!isLoggedIn}>
                      {isLoggedIn ? "Continuer" : "Connectez-vous"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader><CardTitle>Téléchargement des documents</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 border-2 border-dashed border-purple-300 rounded-lg text-center hover:border-purple-500 transition-colors">
                      <Files className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                      <h3 className="font-semibold mb-2">Documents à légaliser</h3>
                      <p className="text-sm text-muted-foreground mb-4">Téléchargez les {formData.documentCount} document(s)</p>
                      <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Sélectionner</Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Remarques</Label>
                      <Textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} />
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
                      <label htmlFor="terms" className="text-sm cursor-pointer">Je certifie que les documents sont authentiques et j'accepte les conditions.</label>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={isSubmitting || !acceptTerms}>
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
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                      <strong>Important:</strong> Les documents originaux doivent être déposés au consulat.
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" asChild><Link to="/services">Services</Link></Button>
                      <Button className="bg-purple-600" asChild><Link to="/mes-demandes">Suivre</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Stamp className="h-5 w-5 text-purple-600" />Tarifs</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pricingInfo.map((item, i) => (
                  <div key={i} className={`flex justify-between ${i < pricingInfo.length - 1 ? 'pb-4 border-b' : ''}`}>
                    <span>{item.type}</span><span className="font-semibold">{item.price}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-purple-600" />Délais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between pb-4 border-b"><span>Normal</span><span className="font-semibold">3-5 jours</span></div>
                <div className="flex justify-between"><span>Urgent</span><span className="font-semibold">24 heures</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-purple-600" />Documents acceptés</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {documentTypes.slice(0, 5).map((t, i) => <li key={i} className="flex gap-2"><CheckCircle className="h-3 w-3 text-green-600" />{t.name}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">Apostille</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Peut être requise pour certains pays.</p>
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
