import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { cvService } from '@/services/cv-service';
import { CV } from '@/types/cv';
import { CVForm } from '@/components/cv/CVForm';
import { CVPreview, CVTheme } from '@/components/cv/CVPreview';
import { CVImportModal } from '@/components/cv/CVImportModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Palette, Save, LayoutTemplate, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CitizenCVPage() {
    const [cvData, setCvData] = useState<CV | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTheme, setActiveTheme] = useState<CVTheme>('modern');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadCV = async () => {
            try {
                const data = await cvService.getMyCV();
                setCvData(data);
            } catch (error) {
                toast.error("Erreur lors du chargement du CV");
            } finally {
                setIsLoading(false);
            }
        };
        loadCV();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Mon_CV`,
    });

    const handleSave = (data: CV) => {
        setCvData(data);
        cvService.updateCV(data); // Mock save
        toast.success("CV sauvegardé avec succès !");
    };

    const handleImportSuccess = (importedData: Partial<CV>) => {
        if (!cvData) return;

        setCvData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                ...importedData,
                // Merge arrays instead of replacing if needed, but replacing is safer for "Import"
                experiences: importedData.experiences || prev.experiences,
                education: importedData.education || prev.education,
                skills: importedData.skills || prev.skills,
                languages: importedData.languages || prev.languages,
            };
        });
    };

    if (isLoading || !cvData) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mon CV</h1>
                    <p className="text-muted-foreground">Créez, personnalisez et exportez votre CV professionnel.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="flex-1 md:flex-none gap-2">
                        <Upload className="w-4 h-4" /> Importer (IA)
                    </Button>
                    <Button onClick={() => handlePrint()} className="flex-1 md:flex-none gap-2 bg-primary text-primary-foreground">
                        <Download className="w-4 h-4" /> Exporter PDF
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="editor" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="editor" className="gap-2"><Save className="w-4 h-4" /> Éditeur</TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2"><LayoutTemplate className="w-4 h-4" /> Design & Aperçu</TabsTrigger>
                </TabsList>

                {/* Editor Tab */}
                <TabsContent value="editor" className="space-y-4">
                    <CVForm
                        initialData={cvData}
                        onSave={handleSave}
                        onCancel={() => toast.info("Modifications annulées")}
                    />
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="space-y-6">
                    {/* Theme Selector */}
                    <div className="neu-card p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Palette className="w-5 h-5" />
                            <span className="font-medium">Choisir un thème :</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Classique & Pro</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(['modern', 'classic', 'minimalist', 'professional', 'executive', 'compact'] as CVTheme[]).map((theme) => (
                                        <button
                                            key={theme}
                                            type="button"
                                            onClick={() => setActiveTheme(theme)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${activeTheme === theme
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                                }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Créatif & Moderne</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(['creative', 'startup', 'bold', 'tech'] as CVTheme[]).map((theme) => (
                                        <button
                                            key={theme}
                                            type="button"
                                            onClick={() => setActiveTheme(theme)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${activeTheme === theme
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                                }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Spécialisé</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(['academic', 'industrial', 'nature', 'elegant'] as CVTheme[]).map((theme) => (
                                        <button
                                            key={theme}
                                            type="button"
                                            onClick={() => setActiveTheme(theme)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${activeTheme === theme
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                                }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="overflow-auto bg-slate-100 p-4 rounded-xl border shadow-inner flex justify-center">
                        <div className="origin-top scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-300">
                            <div ref={printRef} className="w-[210mm] min-h-[297mm] bg-white shadow-2xl">
                                <CVPreview data={cvData} theme={activeTheme} />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <CVImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
}
