import { useEffect, useState } from 'react';
import { Document } from '@/types/document';
import { documentService } from '@/services/document-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import { cn } from '@/lib/utils';

export default function CitizenDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userSpaceTheme } = useThemeStyle();
    const isIDN = userSpaceTheme === 'idn';

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const data = await documentService.getMyDocuments();
                setDocuments(data);
            } catch (error) {
                toast.error("Impossible de charger les documents");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const getStatusBadge = (status: Document['status']) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge className="bg-green-500 hover:bg-green-600">Vérifié</Badge>;
            case 'PENDING':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">En attente</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive">Rejeté</Badge>;
            default:
                return <Badge variant="outline">Inconnu</Badge>;
        }
    };

    const getTypeLabel = (type: Document['type']) => {
        switch (type) {
            case 'ID_CARD': return 'Carte d\'Identité';
            case 'PASSPORT': return 'Passeport';
            case 'BIRTH_CERTIFICATE': return 'Acte de Naissance';
            case 'RESIDENCE_PERMIT': return 'Carte de Séjour';
            default: return 'Autre Document';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Mes Documents</h1>
                    <p className="text-muted-foreground">Gérez vos documents officiels et justificatifs.</p>
                </div>
                <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Ajouter un document
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={cn(
                                "p-6 rounded-xl space-y-4 flex flex-col justify-between group transition-all",
                                isIDN
                                    ? "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80"
                                    : "bg-card border border-border hover:border-primary/30 hover:shadow-md"
                            )}
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    {getStatusBadge(doc.status)}
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg line-clamp-1" title={doc.title}>{doc.title}</h3>
                                    <p className="text-sm text-muted-foreground">{getTypeLabel(doc.type)}</p>
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Ajouté le : {doc.uploadDate}</p>
                                    <p>Taille : {doc.size || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-border/50">
                                <Button variant="ghost" size="sm" className="flex-1 gap-2">
                                    <Eye className="w-4 h-4" /> Voir
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1 gap-2">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Upload Placeholder Card */}
                    <div className={cn(
                        "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px] cursor-pointer transition-all",
                        isIDN
                            ? "border-primary/30 bg-white/30 dark:bg-slate-800/30 hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm"
                            : "border-muted-foreground/20 hover:bg-muted/50"
                    )}>
                        <div className={cn(
                            "p-4 rounded-full",
                            isIDN ? "bg-primary/10" : "bg-muted"
                        )}>
                            <Upload className={cn(
                                "w-8 h-8",
                                isIDN ? "text-primary" : "text-muted-foreground"
                            )} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Ajouter un document</h3>
                            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                                Glissez-déposez ou cliquez pour importer un nouveau fichier
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
