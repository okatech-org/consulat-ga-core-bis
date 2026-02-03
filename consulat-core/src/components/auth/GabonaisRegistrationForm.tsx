import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Upload, Loader2, FileText, User, Users, MapPin, Briefcase, Eye } from "lucide-react";

export function GabonaisRegistrationForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const steps = [
        { id: 1, label: "Documents", icon: FileText },
        { id: 2, label: "Infos Base", icon: User },
        { id: 3, label: "Famille", icon: Users },
        { id: 4, label: "Contacts", icon: MapPin },
        { id: 5, label: "Profession", icon: Briefcase },
        { id: 6, label: "Révision", icon: Eye },
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
            alert("Inscription soumise pour validation !");
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8 overflow-x-auto pb-4">
                {steps.map((s, index) => (
                    <div key={s.id} className="flex flex-col items-center min-w-[80px] relative z-10">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= s.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${step === s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                            {s.label}
                        </span>
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${step > s.id ? 'bg-primary' : 'bg-muted'
                                    }`}
                                style={{ width: '100%' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Documents Requis"}
                        {step === 2 && "Informations de Base"}
                        {step === 3 && "Situation Familiale"}
                        {step === 4 && "Coordonnées"}
                        {step === 5 && "Situation Professionnelle"}
                        {step === 6 && "Révision et Soumission"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Téléchargez les pièces justificatives obligatoires"}
                        {step === 2 && "Identité et naissance"}
                        {step === 3 && "Parents et situation matrimoniale"}
                        {step === 4 && "Adresse et contacts d'urgence"}
                        {step === 5 && "Emploi et activité"}
                        {step === 6 && "Vérifiez l'exactitude de vos informations"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Photo d'identité *</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG - Max 2MB</p>
                            </div>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Passeport *</p>
                                <p className="text-xs text-muted-foreground">PDF, JPG - Max 5MB</p>
                            </div>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Acte de Naissance *</p>
                                <p className="text-xs text-muted-foreground">PDF, JPG - Max 5MB</p>
                            </div>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Justificatif de Domicile *</p>
                                <p className="text-xs text-muted-foreground">Moins de 3 mois</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prénom(s) *</Label>
                                    <Input placeholder="Jean" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nom(s) *</Label>
                                    <Input placeholder="Mba" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date de naissance *</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lieu de naissance *</Label>
                                    <Input placeholder="Libreville" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Nationalité *</Label>
                                <Input defaultValue="Gabonaise" disabled />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Situation Matrimoniale *</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SINGLE">Célibataire</SelectItem>
                                        <SelectItem value="MARRIED">Marié(e)</SelectItem>
                                        <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                                        <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                                <h3 className="font-medium text-sm">Filiation</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nom du Père</Label>
                                        <Input placeholder="Nom complet" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nom de la Mère</Label>
                                        <Input placeholder="Nom complet" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Adresse Complète *</Label>
                                <Input placeholder="Numéro, Rue, Apt" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ville *</Label>
                                    <Input />
                                </div>
                                <div className="space-y-2">
                                    <Label>Code Postal *</Label>
                                    <Input />
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg space-y-4 border border-red-100">
                                <h3 className="font-medium text-sm text-red-800">Contact d'Urgence</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nom Complet</Label>
                                        <Input placeholder="Personne à contacter" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Téléphone</Label>
                                        <Input placeholder="+33..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Statut Professionnel</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMPLOYED">Salarié</SelectItem>
                                        <SelectItem value="SELF_EMPLOYED">Indépendant</SelectItem>
                                        <SelectItem value="STUDENT">Étudiant</SelectItem>
                                        <SelectItem value="RETIRED">Retraité</SelectItem>
                                        <SelectItem value="UNEMPLOYED">Sans emploi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Employeur / Établissement</Label>
                                <Input placeholder="Nom de l'entreprise ou école" />
                            </div>
                            <div className="space-y-2">
                                <Label>Profession / Poste</Label>
                                <Input placeholder="Intitulé du poste" />
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-4">
                            <Alert className="bg-blue-50 border-blue-200">
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                <AlertTitle>Prêt à soumettre</AlertTitle>
                                <AlertDescription>
                                    Votre dossier sera transmis au service consulaire pour validation.
                                    Vous recevrez une notification dès que votre statut changera.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms" />
                                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Je certifie sur l'honneur l'exactitude des informations fournies
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
                                <Button onClick={handleNext} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Suivant
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Soumettre le dossier
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
