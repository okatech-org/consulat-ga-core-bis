import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { cvService } from '@/services/cv-service';
import { CV } from '@/types/cv';
import { CVPreview, CVTheme } from '@/components/cv/CVPreview';
import { CVImportModal } from '@/components/cv/CVImportModal';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2, Edit3, Palette, Sparkles, Wand2, Target, FileText, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserSpaceLayout from '@/components/layout/UserSpaceLayout';
import { cn } from '@/lib/utils';

// Theme definitions with colors and descriptions
const THEME_CATEGORIES = [
    {
        title: "Classique & Pro",
        themes: [
            { id: 'modern' as CVTheme, label: 'Modern', color: '#3B82F6', desc: 'Clean & contemporain' },
            { id: 'classic' as CVTheme, label: 'Classic', color: '#6B7280', desc: 'Intemporel' },
            { id: 'minimalist' as CVTheme, label: 'Minimal', color: '#1F2937', desc: 'Épuré & simple' },
            { id: 'professional' as CVTheme, label: 'Pro', color: '#0F766E', desc: 'Formel & sérieux' },
        ]
    },
    {
        title: "Créatif & Moderne",
        themes: [
            { id: 'creative' as CVTheme, label: 'Créatif', color: '#EC4899', desc: 'Artistique' },
            { id: 'startup' as CVTheme, label: 'Startup', color: '#F97316', desc: 'Tech & dynamique' },
            { id: 'bold' as CVTheme, label: 'Bold', color: '#7C3AED', desc: 'Audacieux' },
            { id: 'tech' as CVTheme, label: 'Tech', color: '#06B6D4', desc: 'IT & Digital' },
        ]
    },
    {
        title: "Spécialisé",
        themes: [
            { id: 'academic' as CVTheme, label: 'Academic', color: '#0369A1', desc: 'Universitaire' },
            { id: 'executive' as CVTheme, label: 'Executive', color: '#1E3A5F', desc: 'Direction' },
            { id: 'elegant' as CVTheme, label: 'Elegant', color: '#9D4EDD', desc: 'Raffiné' },
            { id: 'compact' as CVTheme, label: 'Compact', color: '#059669', desc: 'Dense & efficace' },
        ]
    }
];

// AI Features
const AI_FEATURES = [
    {
        id: 'improve-summary',
        icon: Wand2,
        label: 'Améliorer le Profil',
        desc: 'Reformulez votre résumé',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 'suggest-skills',
        icon: Brain,
        label: 'Suggérer Compétences',
        desc: 'Basé sur vos expériences',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'optimize-job',
        icon: Target,
        label: 'Optimiser pour Poste',
        desc: 'Adaptez à une offre',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        id: 'generate-letter',
        icon: FileText,
        label: 'Lettre de Motivation',
        desc: 'Générez automatiquement',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
    },
    {
        id: 'ats-check',
        icon: Zap,
        label: 'Score ATS',
        desc: 'Compatibilité recruteurs',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
];

export default function ICVPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [cvData, setCvData] = useState<CV | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTheme, setActiveTheme] = useState<CVTheme>('modern');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null);

    const printRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.35);

    useEffect(() => {
        const loadCV = async () => {
            try {
                const data = await cvService.getMyCV();
                setCvData(data);
            } catch (error) {
                toast({ title: "Erreur", description: "Impossible de charger le CV", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadCV();
    }, []);

    // Calculate optimal scale
    useEffect(() => {
        const calculateScale = () => {
            if (previewContainerRef.current) {
                const containerHeight = previewContainerRef.current.clientHeight;
                const containerWidth = previewContainerRef.current.clientWidth;
                const a4HeightPx = 1123;
                const a4WidthPx = 794;
                const scaleH = (containerHeight - 20) / a4HeightPx;
                const scaleW = (containerWidth - 20) / a4WidthPx;
                setScale(Math.min(scaleH, scaleW, 0.55));
            }
        };
        const timer = setTimeout(calculateScale, 50);
        window.addEventListener('resize', calculateScale);
        return () => { clearTimeout(timer); window.removeEventListener('resize', calculateScale); };
    }, [cvData, isLoading]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CV_${cvData?.firstName}_${cvData?.lastName}`,
    });

    const handleImportSuccess = (importedData: Partial<CV>) => {
        if (!cvData) return;
        setCvData(prev => prev ? { ...prev, ...importedData } : null);
        toast({ title: "📥 Import réussi", description: "Les données ont été importées." });
    };

    const handleAIFeature = async (featureId: string) => {
        setAiLoading(featureId);
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        const messages: Record<string, { title: string; description: string }> = {
            'improve-summary': { title: '✨ Profil amélioré', description: 'Votre résumé a été reformulé avec des mots-clés percutants.' },
            'suggest-skills': { title: '🧠 Compétences suggérées', description: '5 nouvelles compétences ajoutées basées sur vos expériences.' },
            'optimize-job': { title: '🎯 CV optimisé', description: 'Entrez une URL d\'offre d\'emploi pour adapter votre CV.' },
            'generate-letter': { title: '📄 Lettre générée', description: 'Votre lettre de motivation est prête à télécharger.' },
            'ats-check': { title: '⚡ Score ATS: 87%', description: 'Votre CV est bien optimisé pour les systèmes de recrutement.' },
        };

        toast(messages[featureId] || { title: 'Feature IA', description: 'Traitement terminé' });
        setAiLoading(null);
    };

    if (isLoading || !cvData) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-foreground">iCV</h1>
                        <span className="text-sm text-muted-foreground hidden lg:inline">
                            Créez et personnalisez votre CV professionnel
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/icv/edit')} className="gap-2">
                            <Edit3 className="w-4 h-4" /> Modifier
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)} className="gap-2">
                            <Upload className="w-4 h-4" /> Importer
                        </Button>
                        <Button size="sm" onClick={() => handlePrint()} className="gap-2 bg-primary">
                            <Download className="w-4 h-4" /> PDF
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
                    {/* Left Panel - Theme & AI */}
                    <div className={cn(
                        "w-64 shrink-0 rounded-xl flex flex-col overflow-hidden",
                        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
                        "border border-slate-200 dark:border-slate-700"
                    )}>
                        {/* Themes Section */}
                        <div className="p-4 flex-1 overflow-auto">
                            <div className="flex items-center gap-2 text-foreground mb-4">
                                <Palette className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold">Choisir un thème</span>
                            </div>

                            <div className="space-y-4">
                                {THEME_CATEGORIES.map((category) => (
                                    <div key={category.title}>
                                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                                            {category.title}
                                        </p>
                                        <div className="space-y-1">
                                            {category.themes.map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => setActiveTheme(theme.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                                                        activeTheme === theme.id
                                                            ? "bg-primary/10 ring-1 ring-primary/30"
                                                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    )}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                                                        style={{ backgroundColor: theme.color }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-sm font-medium",
                                                            activeTheme === theme.id ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {theme.label}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {theme.desc}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Features Section */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-b from-primary/5 to-transparent">
                            <div className="flex items-center gap-2 text-foreground mb-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold">Options IA</span>
                            </div>

                            <div className="space-y-1.5">
                                {AI_FEATURES.map((feature) => (
                                    <button
                                        key={feature.id}
                                        onClick={() => handleAIFeature(feature.id)}
                                        disabled={aiLoading !== null}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
                                            "hover:bg-white dark:hover:bg-slate-800",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        <div className={cn("p-1.5 rounded-md", feature.bgColor)}>
                                            {aiLoading === feature.id ? (
                                                <Loader2 className={cn("w-4 h-4 animate-spin", feature.color)} />
                                            ) : (
                                                <feature.icon className={cn("w-4 h-4", feature.color)} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                {feature.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Profile Summary */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Mon Profil</p>
                            <p className="text-sm font-medium text-foreground">{cvData.firstName} {cvData.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{cvData.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {cvData.experiences.length} exp.
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                    {cvData.skills.length} comp.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - CV Preview */}
                    <div
                        ref={previewContainerRef}
                        className={cn(
                            "flex-1 rounded-xl flex items-center justify-center overflow-hidden",
                            "bg-slate-200/50 dark:bg-slate-800/30",
                            "border border-slate-200 dark:border-slate-700"
                        )}
                    >
                        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
                            <div ref={printRef} className="bg-white shadow-xl" style={{ width: '210mm', minHeight: '297mm' }}>
                                <CVPreview data={cvData} theme={activeTheme} />
                            </div>
                        </div>
                    </div>
                </div>

                <CVImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} onImportSuccess={handleImportSuccess} />
            </div>
        </>
    );
}
