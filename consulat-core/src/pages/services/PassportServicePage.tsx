import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, FileText, AlertCircle, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { serviceRequestService, passportRequestSchema, type PassportRequest } from "@/services/serviceRequestService";
import { DocumentUploadList } from "@/components/documents/DocumentUpload";
import { type UploadedDocument } from "@/services/documentUploadService";
import iconPassport from "@/assets/icons/icon-passport.png";

export default function PassportServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocument>>({});
  const [formData, setFormData] = useState<PassportRequest>({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    phone: "",
    email: "",
    requestType: "first",
    urgency: "normal",
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
    const result = passportRequestSchema.safeParse(formData);
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
      toast.error("Connexion requise", {
        description: "Veuillez vous connecter pour soumettre une demande.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await serviceRequestService.submitPassportRequest(formData);
      setReferenceNumber(`PSP-${result.id.slice(0, 8).toUpperCase()}`);
      toast.success("Demande de passeport soumise avec succès", {
        description: "Vous recevrez un email de confirmation sous 24h.",
      });
      setStep(3);
    } catch (error) {
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredDocuments = [
    "Ancien passeport (si renouvellement)",
    "Acte de naissance intégral",
    "2 photos d'identité récentes",
    "Justificatif de domicile récent",
    "Carte consulaire valide",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="flex items-center gap-6">
            <img src={iconPassport} alt="Passeport" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Demande de Passeport</h1>
              <p className="text-lg text-primary-foreground/80">
                Première demande ou renouvellement de passeport gabonais
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Informations" : s === 2 ? "Documents" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {!isLoggedIn && (
                  <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <LogIn className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <p className="font-medium text-amber-800 dark:text-amber-200">Connexion requise</p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Vous devez être connecté pour soumettre une demande.
                          </p>
                        </div>
                        <Button size="sm" onClick={() => navigate("/login")}>
                          Se connecter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Renseignez vos informations telles qu'elles apparaîtront sur le passeport</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom de famille *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="DUPONT"
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom(s) *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Jean Marie"
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Date de naissance *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className={errors.birthDate ? "border-red-500" : ""}
                        />
                        {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthPlace">Lieu de naissance *</Label>
                        <Input
                          id="birthPlace"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                          placeholder="Libreville, Gabon"
                          className={errors.birthPlace ? "border-red-500" : ""}
                        />
                        {errors.birthPlace && <p className="text-sm text-red-500">{errors.birthPlace}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse complète *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Rue de la République, 75001 Paris, France"
                        className={errors.address ? "border-red-500" : ""}
                      />
                      {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+33 6 12 34 56 78"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.dupont@email.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requestType">Type de demande *</Label>
                        <Select
                          value={formData.requestType}
                          onValueChange={(value: "first" | "renewal" | "lost") => setFormData({ ...formData, requestType: value })}
                        >
                          <SelectTrigger className={errors.requestType ? "border-red-500" : ""}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first">Première demande</SelectItem>
                            <SelectItem value="renewal">Renouvellement</SelectItem>
                            <SelectItem value="lost">Perte / Vol</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.requestType && <p className="text-sm text-red-500">{errors.requestType}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgence</Label>
                        <Select
                          value={formData.urgency}
                          onValueChange={(value: "normal" | "urgent") => setFormData({ ...formData, urgency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal (2-4 semaines)</SelectItem>
                            <SelectItem value="urgent">Urgent (+50% tarif)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        if (validateStep1()) setStep(2);
                      }} 
                      className="w-full"
                      disabled={!isLoggedIn}
                    >
                      {isLoggedIn ? "Continuer vers les documents" : "Connectez-vous pour continuer"}
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
                    <CardDescription>Téléchargez les documents nécessaires à votre demande</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DocumentUploadList
                      documents={requiredDocuments.map(doc => ({ label: doc, required: true }))}
                      uploadedDocs={uploadedDocs}
                      onDocsChange={setUploadedDocs}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="comments">Commentaires additionnels</Label>
                      <Textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Informations complémentaires..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Retour
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
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
                      <p className="text-muted-foreground">
                        Votre demande de passeport a été soumise avec succès.<br />
                        Numéro de référence: <strong>{referenceNumber}</strong>
                      </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" asChild>
                        <Link to="/services">Retour aux services</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/mes-demandes">Suivre ma demande</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Délais et tarifs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Délai standard</span>
                  <span className="font-semibold">2-4 semaines</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Tarif adulte</span>
                  <span className="font-semibold">50 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Tarif mineur</span>
                  <span className="font-semibold">25 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Majoration urgence</span>
                  <span className="font-semibold text-orange-600">+50%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents requis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requiredDocuments.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Important</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Un rendez-vous sera programmé après validation de votre dossier pour la prise d'empreintes.
                    </p>
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
