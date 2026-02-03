/**
 * Document Share Modal Component
 * Allows users to generate shareable links and export PDFs
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VaultDocument } from '@/types/document';
import {
    generateDossier,
    downloadDossier,
    generateShareLink,
    getDossierPreview
} from '@/services/documentDossierService';
import { toast } from 'sonner';
import {
    X,
    Share2,
    Download,
    FileText,
    Copy,
    Check,
    Clock,
    Loader2,
    Link2,
    File,
    QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents: VaultDocument[];
    mode: 'share' | 'export';
}

// Expiration options in seconds
const EXPIRATION_OPTIONS = [
    { label: '1 heure', value: 3600 },
    { label: '24 heures', value: 86400 },
    { label: '7 jours', value: 604800 },
    { label: '30 jours', value: 2592000 }
];

export const ShareModal = ({ isOpen, onClose, documents, mode }: ShareModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [selectedExpiration, setSelectedExpiration] = useState(86400); // 24h default
    const [pdfTitle, setPdfTitle] = useState('');
    const [includeMetadata, setIncludeMetadata] = useState(true);

    // Get preview info for export mode
    const preview = getDossierPreview(documents);

    useEffect(() => {
        if (isOpen) {
            setShareUrl(null);
            setCopied(false);
            setPdfTitle(`Dossier iDocument - ${format(new Date(), 'dd-MM-yyyy')}`);
        }
    }, [isOpen]);

    const handleGenerateShareLink = async () => {
        if (documents.length === 0) return;

        setIsLoading(true);
        try {
            // For now, share the first document (multi-doc sharing would need a different approach)
            const url = await generateShareLink(documents[0], selectedExpiration);
            setShareUrl(url);
            toast.success('Lien de partage créé !');
        } catch (error) {
            console.error('Share link error:', error);
            toast.error('Impossible de créer le lien');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (documents.length === 0) return;

        setIsLoading(true);
        try {
            const blob = await generateDossier(documents, {
                title: pdfTitle,
                includeMetadata,
                includeTableOfContents: documents.length > 1
            });

            downloadDossier(blob, `${pdfTitle.replace(/\s+/g, '_')}.pdf`);
            toast.success('PDF téléchargé avec succès !');
            onClose();
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Erreur lors de la génération du PDF');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Lien copié !');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Impossible de copier le lien');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={cn(
                        "relative w-full max-w-lg overflow-hidden rounded-2xl",
                        "bg-white dark:bg-slate-900 shadow-2xl"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            {mode === 'share' ? (
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
                                    <Share2 className="w-5 h-5 text-white" />
                                </div>
                            ) : (
                                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold">
                                    {mode === 'share' ? 'Partager le document' : 'Exporter en PDF'}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {documents.length} document{documents.length > 1 ? 's' : ''} sélectionné{documents.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {mode === 'share' ? (
                            // Share Mode
                            <div className="space-y-4">
                                {/* Expiration Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Durée de validité du lien
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {EXPIRATION_OPTIONS.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => setSelectedExpiration(option.value)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors",
                                                    selectedExpiration === option.value
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted/50 hover:bg-muted"
                                                )}
                                            >
                                                <Clock className="w-4 h-4" />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
                                {!shareUrl ? (
                                    <button
                                        onClick={handleGenerateShareLink}
                                        disabled={isLoading || documents.length === 0}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                            "bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium",
                                            "hover:from-blue-600 hover:to-violet-700 transition-all",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Link2 className="w-5 h-5" />
                                        )}
                                        {isLoading ? 'Génération...' : 'Générer le lien'}
                                    </button>
                                ) : (
                                    // Share URL Display
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                                Lien créé avec succès !
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={shareUrl}
                                                readOnly
                                                className={cn(
                                                    "flex-1 px-3 py-2 rounded-xl text-sm",
                                                    "bg-muted/50 border border-border",
                                                    "truncate"
                                                )}
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className={cn(
                                                    "shrink-0 px-4 py-2 rounded-xl transition-colors",
                                                    copied
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        <p className="text-xs text-muted-foreground text-center">
                                            Ce lien expirera dans {EXPIRATION_OPTIONS.find(o => o.value === selectedExpiration)?.label.toLowerCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Export Mode
                            <div className="space-y-4">
                                {/* PDF Title */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Titre du dossier
                                    </label>
                                    <input
                                        type="text"
                                        value={pdfTitle}
                                        onChange={(e) => setPdfTitle(e.target.value)}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-xl text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                        placeholder="Nom du dossier PDF"
                                    />
                                </div>

                                {/* Preview Info */}
                                <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <File className="w-4 h-4" />
                                        Aperçu du dossier
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <div>Pages estimées: <span className="font-medium text-foreground">{preview.totalPages + 2}</span></div>
                                        <div>Taille estimée: <span className="font-medium text-foreground">~{preview.estimatedSizeMB + 0.5} MB</span></div>
                                        <div>Paires R/V: <span className="font-medium text-foreground">{preview.rectoVersoPairs}</span></div>
                                        <div>Documents simples: <span className="font-medium text-foreground">{preview.singleDocuments}</span></div>
                                    </div>
                                    {preview.folders.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {preview.folders.map(folder => (
                                                <span
                                                    key={folder}
                                                    className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                                                >
                                                    {folder}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Options */}
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={includeMetadata}
                                            onChange={(e) => setIncludeMetadata(e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">Inclure les métadonnées</span>
                                    </label>
                                </div>

                                {/* Export Button */}
                                <button
                                    onClick={handleExportPDF}
                                    disabled={isLoading || documents.length === 0}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                        "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium",
                                        "hover:from-emerald-600 hover:to-teal-700 transition-all",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Download className="w-5 h-5" />
                                    )}
                                    {isLoading ? 'Génération du PDF...' : 'Télécharger le PDF'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShareModal;
