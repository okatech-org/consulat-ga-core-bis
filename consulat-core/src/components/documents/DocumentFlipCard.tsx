/**
 * Document FlipCard Component
 * 3D flip animation to show recto/verso on same interface
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VaultDocument, DocumentCategory, FOLDER_LABELS, FOLDER_COLORS } from '@/types/document';
import { Eye, Trash2, Download, Clock, Share2, CheckCircle2, AlertTriangle, FileText, File } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentGroup {
    id: string;
    title: string;
    folderId: DocumentCategory;
    front?: VaultDocument;
    back?: VaultDocument;
    isPair: boolean;
}

// Auto-Rotate Image Component
const AutoRotateImage = ({
    src,
    alt,
    className,
    docType,
    isBlurred = false
}: {
    src: string;
    alt: string;
    className?: string;
    docType?: string;
    isBlurred?: boolean;
}) => {
    const [rotation, setRotation] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const shouldCheckRotation = docType === 'identity' || docType === 'vehicle';
        if (shouldCheckRotation && img.naturalHeight > img.naturalWidth * 1.2) {
            setRotation(90);
        }
        setIsLoaded(true);
    };

    return (
        <img
            src={src}
            alt={alt}
            className={cn(className, "transition-all duration-300", isBlurred && "blur-md hover:blur-none")}
            style={{
                transform: `rotate(${rotation}deg)`,
                opacity: isLoaded ? 1 : 0
            }}
            onLoad={handleLoad}
        />
    );
};

// Expiration Badge Component
export const ExpirationBadge = ({
    date,
    neverExpires = false
}: {
    date?: string | null;
    neverExpires?: boolean;
}) => {
    if (neverExpires) {
        return (
            <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Illimité
            </span>
        );
    }

    if (!date) {
        return (
            <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                Non définie
            </span>
        );
    }

    const days = differenceInDays(new Date(date), new Date());

    if (days < 0) {
        return (
            <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">
                <AlertTriangle className="w-2.5 h-2.5" />
                Expiré
            </span>
        );
    }

    if (days < 30) {
        return (
            <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600">
                <AlertTriangle className="w-2.5 h-2.5" />
                {days}j restants
            </span>
        );
    }

    if (days < 90) {
        return (
            <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                <Clock className="w-2.5 h-2.5" />
                {Math.ceil(days / 30)} mois
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Valide
        </span>
    );
};

// Status Badge Component
export const StatusBadge = ({ status }: { status: VaultDocument['status'] }) => {
    const config = {
        verified: { label: 'Vérifié', class: 'bg-green-500/10 text-green-600', icon: CheckCircle2 },
        pending: { label: 'En attente', class: 'bg-amber-500/10 text-amber-600', icon: Clock },
        rejected: { label: 'Rejeté', class: 'bg-red-500/10 text-red-600', icon: AlertTriangle },
        expired: { label: 'Expiré', class: 'bg-red-500/10 text-red-600', icon: AlertTriangle }
    }[status];

    return (
        <span className={cn("flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded", config.class)}>
            <config.icon className="w-2.5 h-2.5" />
            {config.label}
        </span>
    );
};

// Flip Card Component
export const DocumentFlipCard = ({
    group,
    onPreview,
    onDelete,
    isBlurMode = false
}: {
    group: DocumentGroup;
    onPreview: (doc: VaultDocument) => void;
    onDelete: (doc: VaultDocument) => void;
    isBlurMode?: boolean;
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const neverExpires = ['civil_status', 'education'].includes(group.folderId);

    const handleCardClick = () => {
        if (group.isPair) {
            setIsFlipped(!isFlipped);
        }
    };

    // Single document card
    if (!group.isPair && group.front) {
        const doc = group.front;
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "group relative p-3 rounded-xl cursor-pointer transition-all",
                    "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                    "border border-slate-200/60 dark:border-white/10",
                    "hover:border-primary/30 hover:shadow-lg"
                )}
                onClick={() => onPreview(doc)}
            >
                {/* Thumbnail */}
                <div className={cn(
                    "aspect-[4/3] rounded-lg mb-2 flex items-center justify-center overflow-hidden",
                    `bg-gradient-to-br ${FOLDER_COLORS[doc.folder_id] || "from-gray-500 to-slate-600"}`
                )}>
                    {doc.public_url && doc.file_type === 'image' ? (
                        <AutoRotateImage
                            src={doc.public_url}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                            docType={doc.folder_id}
                            isBlurred={isBlurMode}
                        />
                    ) : (
                        <FileText className="w-8 h-8 text-white/80" />
                    )}
                </div>

                {/* Info */}
                <p className="text-[11px] font-medium text-foreground truncate">{doc.name}</p>
                <div className="flex items-center justify-between mt-1 gap-1 flex-wrap">
                    <StatusBadge status={doc.status} />
                    <ExpirationBadge date={doc.expiration_date} neverExpires={neverExpires} />
                </div>

                {/* Side badge */}
                {doc.side && (
                    <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">
                            {doc.side === 'front' ? 'RECTO' : 'VERSO'}
                        </span>
                    </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(doc); }}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <Eye className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
                        className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-white" />
                    </button>
                </div>
            </motion.div>
        );
    }

    // Flip card for recto/verso pairs
    return (
        <div
            className="perspective-1000 w-full aspect-[3/4] cursor-pointer group"
            onClick={handleCardClick}
        >
            <motion.div
                className="relative w-full h-full preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE */}
                <div
                    className={cn(
                        "absolute inset-0 backface-hidden rounded-xl overflow-hidden",
                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                        "border-2 border-primary/20 shadow-lg"
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-full flex flex-col p-3 relative">
                        <span className="absolute top-2 left-2 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
                            RECTO
                        </span>
                        <span className="absolute top-2 right-2 text-[8px] text-muted-foreground animate-pulse">
                            ↻ Retourner
                        </span>

                        <div className="flex-1 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center mt-6">
                            {group.front?.public_url && group.front.file_type === 'image' ? (
                                <AutoRotateImage
                                    src={group.front.public_url}
                                    alt="Recto"
                                    className="w-full h-full object-contain p-2"
                                    docType={group.folderId}
                                    isBlurred={isBlurMode}
                                />
                            ) : (
                                <FileText className="w-12 h-12 text-muted-foreground/30" />
                            )}
                        </div>

                        <div className="mt-2">
                            <h3 className="font-bold text-sm">{group.title}</h3>
                            <ExpirationBadge date={group.front?.expiration_date} neverExpires={neverExpires} />
                        </div>
                    </div>
                </div>

                {/* BACK FACE */}
                <div
                    className={cn(
                        "absolute inset-0 backface-hidden rounded-xl overflow-hidden rotate-y-180",
                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                        "border-2 border-secondary/20 shadow-lg"
                    )}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="h-full flex flex-col p-3 relative">
                        <span className="absolute top-2 left-2 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                            VERSO
                        </span>

                        <div className="flex-1 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center mt-6">
                            {group.back?.public_url && group.back.file_type === 'image' ? (
                                <AutoRotateImage
                                    src={group.back.public_url}
                                    alt="Verso"
                                    className="w-full h-full object-contain p-2"
                                    docType={group.folderId}
                                    isBlurred={isBlurMode}
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-xs text-muted-foreground">Aucun verso</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); group.back && onPreview(group.back); }}
                                className="flex-1 text-[10px] py-1.5 rounded-lg bg-muted hover:bg-muted/80"
                            >
                                <Eye className="w-3 h-3 inline mr-1" /> Verso
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); group.front && onPreview(group.front); }}
                                className="flex-1 text-[10px] py-1.5 rounded-lg bg-muted hover:bg-muted/80"
                            >
                                <Eye className="w-3 h-3 inline mr-1" /> Recto
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Helper to extract base name for pairing
const extractBaseName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/recto|verso|front|back|avant|arriere/gi, '')
        .replace(/[\s_-]+/g, ' ')
        .trim();
};

// Group documents by pairing recto/verso
export const groupDocuments = (docs: VaultDocument[]): DocumentGroup[] => {
    const groups: DocumentGroup[] = [];
    const processed = new Set<string>();
    const pairableTypes = ['identity', 'vehicle'];

    // Find pairs within pairable folder types
    pairableTypes.forEach(folderId => {
        const folderDocs = docs.filter(d => d.folder_id === folderId && !processed.has(d.id));
        const fronts = folderDocs.filter(d => d.side === 'front');
        const backs = folderDocs.filter(d => d.side === 'back');

        // Try to pair by matching base names first
        fronts.forEach(front => {
            if (processed.has(front.id)) return;

            const frontBase = extractBaseName(front.name);
            const matchingBack = backs.find(back =>
                !processed.has(back.id) && extractBaseName(back.name) === frontBase
            );

            if (matchingBack) {
                // Found a matching pair
                const title = front.name
                    .replace(/recto|front/i, '')
                    .replace(/[\s_-]+$/, '')
                    .trim() || FOLDER_LABELS[folderId as DocumentCategory];

                groups.push({
                    id: `${front.id}-${matchingBack.id}`,
                    title,
                    folderId: folderId as DocumentCategory,
                    front,
                    back: matchingBack,
                    isPair: true
                });
                processed.add(front.id);
                processed.add(matchingBack.id);
            }
        });

        // If no name match, try simple index pairing
        const remainingFronts = fronts.filter(f => !processed.has(f.id));
        const remainingBacks = backs.filter(b => !processed.has(b.id));

        let i = 0;
        while (i < remainingFronts.length && i < remainingBacks.length) {
            const front = remainingFronts[i];
            const back = remainingBacks[i];

            const title = front.name
                .replace(/recto|front/i, '')
                .replace(/[\s_-]+$/, '')
                .trim() || FOLDER_LABELS[folderId as DocumentCategory];

            groups.push({
                id: `${front.id}-${back.id}`,
                title,
                folderId: folderId as DocumentCategory,
                front,
                back,
                isPair: true
            });
            processed.add(front.id);
            processed.add(back.id);
            i++;
        }

        // Add remaining unpaired fronts
        remainingFronts.filter(f => !processed.has(f.id)).forEach(doc => {
            groups.push({
                id: doc.id,
                title: doc.name,
                folderId: folderId as DocumentCategory,
                front: doc,
                isPair: false
            });
            processed.add(doc.id);
        });

        // Add remaining unpaired backs (treat as singles)
        remainingBacks.filter(b => !processed.has(b.id)).forEach(doc => {
            groups.push({
                id: doc.id,
                title: doc.name,
                folderId: folderId as DocumentCategory,
                front: doc,
                isPair: false
            });
            processed.add(doc.id);
        });
    });

    // Add all remaining documents as singles
    docs.filter(d => !processed.has(d.id)).forEach(d => {
        groups.push({
            id: d.id,
            title: d.name,
            folderId: d.folder_id as DocumentCategory,
            front: d,
            isPair: false
        });
    });

    return groups;
};

export default DocumentFlipCard;
