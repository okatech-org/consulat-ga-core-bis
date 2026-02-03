import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Upload, Loader2, User, FileText, Info, Eye } from 'lucide-react';
import { toast } from 'sonner';

export type ChildRegistrationStep = 'parents' | 'documents' | 'basic-info' | 'review';

export function ChildRegistrationForm() {
    const [step, setStep] = useState<ChildRegistrationStep>('parents');
    const [loading, setLoading] = useState(false);

    const steps: { id: ChildRegistrationStep; label: string; icon: any }[] = [
        { id: 'parents', label: 'Parents', icon: User },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'basic-info', label: 'Infos', icon: Info },
        { id: 'review', label: 'Révision', icon: Eye },
    ];

    const handleNext = () => {
        const currentIndex = steps.findIndex(s => s.id === step);
        if (currentIndex < steps.length - 1) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep(steps[currentIndex + 1].id);
            }, 500);
        }
    };

    const handlePrevious = () => {
        const currentIndex = steps.findIndex(s => s.id === step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1].id);
        }
    };

    const handleSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Demande soumise", {
                description: "Le dossier de l'enfant a été soumis pour validation."
            });
            // Redirect or update UI
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Stepper */}
            <div className="flex justify-between mb-8">
                {steps.map((s, index) => {
                    const currentIndex = steps.findIndex(stepObj => stepObj.id === step);
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;

                    return (
                        <div key={s.id} className="flex flex-col items-center relative z-10">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive || isCompleted ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {s.label}
                            </span>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${index < currentIndex ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    style={{ width: 'calc(100% * (var(--num-steps) - 1))' }} // Simplified for visual
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 'parents' && "Informations Parentales"}
                        {step === 'documents' && "Documents Requis"}
                        {step === 'basic-info' && "État Civil de l'Enfant"}
                        {step === 'review' && "Révision du Dossier"}
                    </CardTitle>
                    <CardDescription>
                        {step === 'parents' && "Vérifiez les informations des parents"}
                        {step === 'documents' && "Téléchargez les justificatifs obligatoires"}
                        {step === 'basic-info' && "Complétez les informations de naissance"}
                        {step === 'review' && "Vérifiez et validez la demande"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {step === 'parents' && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/20">
                                <h3 className="font-medium mb-2">Parent 1 (Déclarant)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Prénom</Label>
                                        <Input value="Jean" disabled />
                                    </div>
                                    <div>
                                        <Label>Nom</Label>
                                        <Input value="MBA" disabled />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="add-parent" />
                                <label htmlFor="add-parent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Ajouter un second parent
                                </label>
                            </div>
                        </div>
                    )}

                    {step === 'documents' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Acte de Naissance (Obligatoire)</p>
                                <p className="text-xs text-muted-foreground">PDF, JPG - Max 5MB</p>
                            </div>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium">Photo d'identité (Obligatoire)</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG - Max 2MB</p>
                            </div>
                        </div>
                    )}

                    {step === 'basic-info' && (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date de naissance</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lieu de naissance</Label>
                                    <Input placeholder="Ville" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Mode d'acquisition de la nationalité</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BIRTH">Naissance</SelectItem>
                                        <SelectItem value="NATURALIZATION">Naturalisation</SelectItem>
                                        <SelectItem value="DECLARATION">Déclaration</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-4">
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Prêt à soumettre</AlertTitle>
                                <AlertDescription>
                                    Veuillez vérifier que toutes les informations sont correctes avant de valider.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Enfant</span>
                                    <span className="font-medium">Junior MBA</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Documents</span>
                                    <span className="font-medium text-green-600">2 téléchargés</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={step === 'parents' || loading}
                        >
                            Précédent
                        </Button>

                        {step === 'review' ? (
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Soumettre le dossier
                            </Button>
                        ) : (
                            <Button onClick={handleNext} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Suivant
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
