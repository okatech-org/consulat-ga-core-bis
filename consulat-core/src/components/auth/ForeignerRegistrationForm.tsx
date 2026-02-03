import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload, Loader2, Clock, AlertTriangle, Plane, MapPin, User, FileText, Briefcase } from "lucide-react";
import { RequestReason, ForeignerStatus } from "@/types/citizen";

export function ForeignerRegistrationForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState<string>("");

    const steps = [
        { id: 1, label: "Identité", icon: User },
        { id: 2, label: "Coordonnées", icon: MapPin },
        { id: 3, label: "Passeport", icon: FileText },
        { id: 4, label: "Motif", icon: Briefcase },
        { id: 5, label: "Documents", icon: Upload },
        { id: 6, label: "Validation", icon: CheckCircle2 },
    ];

    const handleNext = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(step + 1);
        }, 800);
    };

    const handleSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Demande d'inscription visiteur soumise !");
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8 overflow-x-auto pb-4">
                {steps.map((s, index) => (
                    <div key={s.id} className="flex flex-col items-center min-w-[80px] relative z-10">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= s.id ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${step === s.id ? 'text-blue-600' : 'text-muted-foreground'}`}>
                            {s.label}
                        </span>
                        {index < steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${step > s.id ? 'bg-blue-600' : 'bg-muted'
                                    }`}
                                style={{ width: '100%' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <Card className="border-blue-100">
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Identité & État Civil"}
                        {step === 2 && "Coordonnées & Contact"}
                        {step === 3 && "Document de Voyage"}
                        {step === 4 && "Motif du Séjour"}
                        {step === 5 && "Pièces Justificatives"}
                        {step === 6 && "Confirmation"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Vos informations personnelles"}
                        {step === 2 && "Où résidez-vous actuellement ?"}
                        {step === 3 && "Informations de votre passeport"}
                        {step === 4 && "Pourquoi souhaitez-vous vous inscrire ?"}
                        {step === 5 && "Documents requis pour l'analyse"}
                        {step === 6 && "Engagement et soumission"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {step === 1 && (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prénom(s) *</Label>
                                    <Input placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nom(s) *</Label>
                                    <Input placeholder="Doe" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nationalité *</Label>
                                    <Input placeholder="Ex: Française" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de naissance *</Label>
                                    <Input type="date" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Profession</Label>
                                <Input placeholder="Ex: Ingénieur" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Adresse de résidence actuelle *</Label>
                                <Input placeholder="Numéro et nom de rue" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ville *</Label>
                                    <Input />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pays *</Label>
                                    <Input />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Téléphone *</Label>
                                    <Input placeholder="+33..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input type="email" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Numéro de Passeport *</Label>
                                <Input placeholder="Ex: 12AB34567" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pays d'émission *</Label>
                                    <Input />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date d'expiration *</Label>
                                    <Input type="date" />
                                </div>
                            </div>
                            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Validité du Passeport</AlertTitle>
                                <AlertDescription>
                                    Votre passeport doit être valide au moins 6 mois après la date prévue de votre entrée au Gabon.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Motif principal *</Label>
                                <Select onValueChange={setReason}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un motif" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={RequestReason.VISA_REQUEST}>Demande de Visa</SelectItem>
                                        <SelectItem value={RequestReason.LEGALIZATION}>Légalisation / Certification</SelectItem>
                                        <SelectItem value={RequestReason.OTHER}>Autre demande</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {reason === RequestReason.VISA_REQUEST && (
                                <div className="p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="font-medium text-blue-900 flex items-center gap-2">
                                        <Plane className="h-4 w-4" /> Détails du Voyage
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date d'arrivée prévue</Label>
                                            <Input type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date de départ prévue</Label>
                                            <Input type="date" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type d'hébergement</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HOTEL">Hôtel</SelectItem>
                                                <SelectItem value="FAMILY">Famille / Amis</SelectItem>
                                                <SelectItem value="BUSINESS">Invitation Professionnelle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Adresse au Gabon</Label>
                                        <Input placeholder="Nom de l'hôtel ou adresse de l'hôte" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Précisions supplémentaires</Label>
                                <Textarea placeholder="Détails utiles pour l'agent consulaire..." />
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-blue-50 cursor-pointer transition-colors border-blue-200">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                    <p className="font-medium">Photo d'identité *</p>
                                    <p className="text-xs text-muted-foreground">Fond blanc, sans lunettes</p>
                                </div>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-blue-50 cursor-pointer transition-colors border-blue-200">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                    <p className="font-medium">Copie du Passeport *</p>
                                    <p className="text-xs text-muted-foreground">Page avec photo</p>
                                </div>
                                {reason === RequestReason.VISA_REQUEST && (
                                    <>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-blue-50 cursor-pointer transition-colors border-blue-200">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                            <p className="font-medium">Réservation Billet *</p>
                                            <p className="text-xs text-muted-foreground">Aller-Retour</p>
                                        </div>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-blue-50 cursor-pointer transition-colors border-blue-200">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                            <p className="font-medium">Justificatif Hébergement *</p>
                                            <p className="text-xs text-muted-foreground">Réservation hôtel ou Certificat hébergement</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-6">
                            <Alert className="bg-yellow-50 border-yellow-200">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <AlertTitle>Délai de traitement</AlertTitle>
                                <AlertDescription>
                                    L'analyse de votre dossier prendra entre <strong>48h et 72h ouvrées</strong>.
                                    Vous ne pourrez pas prendre de rendez-vous avant la validation de votre compte.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms1" />
                                    <label htmlFor="terms1" className="text-sm font-medium leading-none">
                                        Je certifie que toutes les informations sont exactes
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms2" />
                                    <label htmlFor="terms2" className="text-sm font-medium leading-none">
                                        Je m'engage à respecter les lois de la République Gabonaise
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        {step > 1 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                                Précédent
                            </Button>
                        )}
                        <div className="ml-auto">
                            {step < 6 ? (
                                <Button onClick={handleNext} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Suivant
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Soumettre la demande
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
