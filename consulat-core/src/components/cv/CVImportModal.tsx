import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CV } from '@/types/cv';

interface CVImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportSuccess: (data: Partial<CV>) => void;
}

export function CVImportModal({ open, onOpenChange, onImportSuccess }: CVImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setIsAnalyzing(true);

        // Simulate OCR / AI Processing Delay
        setTimeout(() => {
            setIsAnalyzing(false);

            // Mock Extracted Data
            const mockExtractedData: Partial<CV> = {
                summary: "Professionnel expérimenté avec plus de 10 ans d'expérience dans la gestion de projets et le développement logiciel. Passionné par l'innovation et l'optimisation des processus.",
                experiences: [
                    {
                        id: 'exp-imported-1',
                        title: "Chef de Projet Senior",
                        company: "Tech Solutions Gabon",
                        location: "Libreville",
                        startDate: "2018-01",
                        endDate: "Présent",
                        current: true,
                        description: "Gestion d'une équipe de 15 développeurs. Mise en place de méthodologies Agile."
                    },
                    {
                        id: 'exp-imported-2',
                        title: "Développeur Full Stack",
                        company: "Innovatech",
                        location: "Port-Gentil",
                        startDate: "2015-03",
                        endDate: "2017-12",
                        current: false,
                        description: "Développement d'applications web React/Node.js."
                    }
                ],
                education: [
                    {
                        id: 'edu-imported-1',
                        degree: "Master en Informatique",
                        school: "USTM Franceville",
                        location: "Franceville",
                        startDate: "2010",
                        endDate: "2015",
                        current: false
                    }
                ],
                skills: [
                    { id: 'skill-imp-1', name: "Gestion de Projet", level: "Expert" },
                    { id: 'skill-imp-2', name: "React.js", level: "Advanced" },
                    { id: 'skill-imp-3', name: "Node.js", level: "Advanced" },
                    { id: 'skill-imp-4', name: "Agile/Scrum", level: "Expert" }
                ],
                languages: [
                    { id: 'lang-imp-1', name: "Français", level: "Native" },
                    { id: 'lang-imp-2', name: "Anglais", level: "C1" }
                ]
            };

            onImportSuccess(mockExtractedData);
            toast.success("CV analysé avec succès !");
            onOpenChange(false);
            setFile(null);
        }, 2500); // 2.5s delay
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Importer un CV existant</DialogTitle>
                    <DialogDescription>
                        Téléversez votre CV (PDF ou Image). Notre IA analysera le contenu pour pré-remplir votre profil.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-muted-foreground/25">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {file ? (
                                    <>
                                        <FileText className="w-12 h-12 mb-4 text-primary" />
                                        <p className="mb-2 text-sm font-semibold text-foreground">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez</p>
                                        <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                        </label>
                    </div>

                    {isAnalyzing && (
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg text-primary animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Analyse du document en cours...</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAnalyzing}>Annuler</Button>
                    <Button onClick={handleImport} disabled={!file || isAnalyzing} className="gap-2">
                        {isAnalyzing ? 'Traitement...' : 'Analyser et Importer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
