/**
 * Page iDocument
 * 
 * Interface Dossier → Fichier pour la gestion des documents personnels
 * Inspiré de mairie.ga avec navigation par dossiers
 */

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import UserSpaceLayout from '@/components/layout/UserSpaceLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIDocumentStore } from '@/stores/idocumentStore';
import { idocumentService } from '@/services/idocumentService';
import {
    VaultDocument,
    DocumentCategory,
    DocumentFolder,
    FOLDER_LABELS,
    FOLDER_DESCRIPTIONS,
    FOLDER_COLORS
} from '@/types/document';
import { toast } from 'sonner';
import {
    FileText,
    FolderOpen,
    FolderClosed,
    Search,
    Upload,
    Camera,
    Eye,
    EyeOff,
    Download,
    Trash2,
    X,
    ArrowLeft,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertTriangle,
    User,
    Baby,
    Home,
    GraduationCap,
    Briefcase,
    Heart,
    Car,
    Grid3X3,
    List,
    Plus,
    Image as ImageIcon,
    File,
    Shield,
    Sparkles
} from 'lucide-react';
import { DocumentFlipCard, groupDocuments, ExpirationBadge, StatusBadge } from '@/components/documents/DocumentFlipCard';
import { NotificationsPanel } from '@/components/documents/NotificationsPanel';
import { ShareModal } from '@/components/documents/ShareModal';
import { FolderIcon, FOLDER_ICON_COLORS } from '@/components/documents/FolderIcon';
import { detectDocumentType, detectDocumentSide, getSuggestedFolder } from '@/services/documentOCRService';
import { generateDocumentNotifications, DocumentNotification } from '@/services/documentNotificationService';
import { generateDossier, downloadDossier, getDossierPreview } from '@/services/documentDossierService';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Icon map for folders
const FOLDER_ICON_MAP: Record<DocumentCategory, React.ElementType> = {
    identity: User,
    civil_status: Baby,
    residence: Home,
    education: GraduationCap,
    work: Briefcase,
    health: Heart,
    vehicle: Car,
    other: FileText
};

// Mock documents for demo
const MOCK_DOCUMENTS: VaultDocument[] = [
    {
        id: '1', user_id: 'demo', folder_id: 'identity', name: 'CNI Recto',
        original_name: 'cni_recto.jpg', file_path: '', file_type: 'image', file_size: 1200000,
        mime_type: 'image/jpeg', source: 'upload', status: 'verified', is_verified: true,
        verification_date: '2024-01-15', expiration_date: '2034-01-15', side: 'front',
        metadata: {}, created_at: '2024-01-15', updated_at: '2024-01-15', last_used_at: '2024-12-01'
    },
    {
        id: '2', user_id: 'demo', folder_id: 'identity', name: 'CNI Verso',
        original_name: 'cni_verso.jpg', file_path: '', file_type: 'image', file_size: 1100000,
        mime_type: 'image/jpeg', source: 'upload', status: 'verified', is_verified: true,
        verification_date: '2024-01-15', expiration_date: '2034-01-15', side: 'back',
        metadata: {}, created_at: '2024-01-15', updated_at: '2024-01-15', last_used_at: null
    },
    {
        id: '3', user_id: 'demo', folder_id: 'identity', name: 'Passeport',
        original_name: 'passeport.pdf', file_path: '', file_type: 'pdf', file_size: 2400000,
        mime_type: 'application/pdf', source: 'upload', status: 'verified', is_verified: true,
        verification_date: '2023-11-20', expiration_date: '2028-11-20',
        metadata: {}, created_at: '2023-11-20', updated_at: '2023-11-20', last_used_at: null
    },
    {
        id: '4', user_id: 'demo', folder_id: 'civil_status', name: 'Acte de Naissance',
        original_name: 'acte_naissance.pdf', file_path: '', file_type: 'pdf', file_size: 800000,
        mime_type: 'application/pdf', source: 'official', status: 'verified', is_verified: true,
        verification_date: '2024-02-10', expiration_date: null,
        metadata: {}, created_at: '2024-02-10', updated_at: '2024-02-10', last_used_at: null
    },
    {
        id: '5', user_id: 'demo', folder_id: 'education', name: 'Baccalauréat',
        original_name: 'bac.pdf', file_path: '', file_type: 'pdf', file_size: 500000,
        mime_type: 'application/pdf', source: 'official', status: 'verified', is_verified: true,
        verification_date: '2020-07-15', expiration_date: null,
        metadata: {}, created_at: '2020-07-15', updated_at: '2020-07-15', last_used_at: null
    },
    {
        id: '6', user_id: 'demo', folder_id: 'health', name: 'Carte CNAMGS',
        original_name: 'cnamgs.jpg', file_path: '', file_type: 'image', file_size: 900000,
        mime_type: 'image/jpeg', source: 'upload', status: 'pending', is_verified: false,
        verification_date: null, expiration_date: '2025-03-01',
        metadata: {}, created_at: '2024-03-01', updated_at: '2024-03-01', last_used_at: null
    },
    {
        id: '7', user_id: 'demo', folder_id: 'residence', name: 'Facture SEEG',
        original_name: 'facture_seeg.pdf', file_path: '', file_type: 'pdf', file_size: 350000,
        mime_type: 'application/pdf', source: 'upload', status: 'verified', is_verified: true,
        verification_date: '2024-11-01', expiration_date: '2025-02-01',
        metadata: {}, created_at: '2024-11-01', updated_at: '2024-11-01', last_used_at: null
    },
    {
        id: '8', user_id: 'demo', folder_id: 'vehicle', name: 'Permis de Conduire',
        original_name: 'permis.jpg', file_path: '', file_type: 'image', file_size: 1000000,
        mime_type: 'image/jpeg', source: 'upload', status: 'verified', is_verified: true,
        verification_date: '2023-06-15', expiration_date: '2033-06-15',
        metadata: {}, created_at: '2023-06-15', updated_at: '2023-06-15', last_used_at: null
    },
];


const IDocumentPage = () => {
    // Store
    const {
        documents,
        folders,
        isLoading,
        selectedFolderId,
        searchQuery,
        viewMode,
        filteredDocuments,
        fetchDocuments,
        addDocument,
        deleteDocument,
        selectFolder,
        setSearchQuery,
        setViewMode
    } = useIDocumentStore();

    // Local state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFolder, setUploadFolder] = useState<DocumentCategory>('other');
    const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
    const [localDocs, setLocalDocs] = useState<VaultDocument[]>([]);
    const [isBlurMode, setIsBlurMode] = useState(false); // Privacy blur mode
    const [pendingFile, setPendingFile] = useState<File | null>(null); // For smart upload
    const [notifications, setNotifications] = useState<DocumentNotification[]>([]); // Document alerts

    // Share/Export modal state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareModalMode, setShareModalMode] = useState<'share' | 'export'>('export');
    const [selectedDocs, setSelectedDocs] = useState<VaultDocument[]>([]); // For multi-select
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Hover state for folder icons
    const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

    // Track visited folders (persisted in localStorage)
    const [visitedFolders, setVisitedFolders] = useState<Set<string>>(() => {
        const stored = localStorage.getItem('idocument-visited-folders');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    });

    // Initialize with mock data if empty
    useEffect(() => {
        if (documents.length === 0) {
            MOCK_DOCUMENTS.forEach(doc => addDocument(doc));
        }
        setLocalDocs(documents.length > 0 ? documents : MOCK_DOCUMENTS);
    }, [documents]);

    // Update local docs and notifications when store changes
    useEffect(() => {
        if (documents.length > 0) {
            setLocalDocs(documents);
        }
        // Generate notifications from documents
        const docNotifs = generateDocumentNotifications(localDocs);
        setNotifications(docNotifs);
    }, [documents, localDocs]);

    // Get documents for current view
    const displayedDocuments = selectedFolderId
        ? localDocs.filter(d => d.folder_id === selectedFolderId)
        : localDocs;

    // Filter by search
    const searchedDocuments = searchQuery
        ? displayedDocuments.filter(d =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.original_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : displayedDocuments;

    // Create folder stats
    const folderStats = {
        identity: localDocs.filter(d => d.folder_id === 'identity').length,
        civil_status: localDocs.filter(d => d.folder_id === 'civil_status').length,
        residence: localDocs.filter(d => d.folder_id === 'residence').length,
        education: localDocs.filter(d => d.folder_id === 'education').length,
        work: localDocs.filter(d => d.folder_id === 'work').length,
        health: localDocs.filter(d => d.folder_id === 'health').length,
        vehicle: localDocs.filter(d => d.folder_id === 'vehicle').length,
        other: localDocs.filter(d => d.folder_id === 'other').length,
    };

    // Dropzone with intelligent detection
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setPendingFile(file);

            // Intelligent type detection from filename
            const detectedType = detectDocumentType(file.name);
            const detectedSide = detectDocumentSide(file.name);

            if (detectedType) {
                const suggestedFolder = getSuggestedFolder(detectedType);
                setUploadFolder(suggestedFolder as DocumentCategory);
                toast.info(`Type détecté: ${detectedType} → Dossier: ${FOLDER_LABELS[suggestedFolder as DocumentCategory] || suggestedFolder}`);
            } else {
                setUploadFolder(selectedFolderId || 'other');
            }

            setShowUploadModal(true);
        }
    }, [selectedFolderId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        noClick: true
    });

    // Handle upload
    const handleUpload = async (files: FileList | null) => {
        if (!files) return;

        for (const file of Array.from(files)) {
            const newDoc: VaultDocument = {
                id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                user_id: 'demo',
                folder_id: uploadFolder,
                name: file.name.replace(/\.[^/.]+$/, ''),
                original_name: file.name,
                file_path: '',
                file_type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'other',
                file_size: file.size,
                mime_type: file.type,
                source: 'upload',
                status: 'pending',
                is_verified: false,
                verification_date: null,
                expiration_date: null,
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_used_at: null,
                public_url: URL.createObjectURL(file)
            };

            addDocument(newDoc);
            setLocalDocs(prev => [newDoc, ...prev]);
        }

        setShowUploadModal(false);
        toast.success(`${files.length} document(s) ajouté(s)`);
    };

    // Handle delete
    const handleDelete = async (doc: VaultDocument) => {
        await deleteDocument(doc.id);
        setLocalDocs(prev => prev.filter(d => d.id !== doc.id));
        setPreviewDoc(null);
        toast.success('Document supprimé');
    };

    // Folder card component with FolderIcon
    const FolderCard = ({ category }: { category: DocumentCategory }) => {
        const count = folderStats[category];
        const isVisited = visitedFolders.has(category);

        // Determine folder icon state based on visit history
        // - closed-empty: no files (never opens)
        // - closed-filled: has files but never visited
        // - open-filled: has files AND already visited
        let folderType: 'closed-empty' | 'closed-filled' | 'open-filled' = 'closed-empty';
        if (count > 0 && isVisited) {
            folderType = 'open-filled';
        } else if (count > 0) {
            folderType = 'closed-filled';
        }

        const handleClick = () => {
            // Mark as visited when clicking a folder with files
            if (count > 0 && !isVisited) {
                const newVisited = new Set(visitedFolders);
                newVisited.add(category);
                setVisitedFolders(newVisited);
                localStorage.setItem('idocument-visited-folders', JSON.stringify([...newVisited]));
            }
            selectFolder(category);
        };

        return (
            <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClick}
                className={cn(
                    "relative flex flex-col items-center p-4 rounded-2xl text-center transition-all group overflow-hidden",
                    "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
                    "border border-slate-300/80 dark:border-white/10",
                    "hover:border-primary/30 hover:shadow-lg hover:bg-blue-50/50 dark:hover:bg-white/10",
                    "shadow-sm dark:shadow-none"
                )}
            >
                {/* Folder Icon */}
                <div className="mb-2">
                    <FolderIcon
                        type={folderType}
                        size={80}
                        color={FOLDER_ICON_COLORS[category] || '#fbbf24'}
                    />
                </div>

                {/* Label */}
                <h3 className="text-sm font-bold text-foreground mb-0.5 truncate w-full">
                    {FOLDER_LABELS[category]}
                </h3>

                {/* Count */}
                <p className="text-xs text-muted-foreground">
                    {count} {count === 1 ? 'document' : 'documents'}
                </p>
            </motion.button>
        );
    };

    // Document card component
    const DocumentCard = ({ doc }: { doc: VaultDocument }) => {
        const neverExpires = ['civil_status', 'education'].includes(doc.folder_id);
        const Icon = doc.file_type === 'image' ? ImageIcon : doc.file_type === 'pdf' ? FileText : File;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "group relative p-3 rounded-xl cursor-pointer transition-all",
                    "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
                    "border border-slate-300/80 dark:border-white/10",
                    "hover:border-primary/30 hover:shadow-lg",
                    "shadow-sm dark:shadow-none"
                )}
                onClick={() => setPreviewDoc(doc)}
            >
                {/* Thumbnail */}
                <div className={cn(
                    "aspect-[4/3] rounded-lg mb-2 flex items-center justify-center overflow-hidden",
                    `bg-gradient-to-br ${FOLDER_COLORS[doc.folder_id] || "from-gray-500 to-slate-600"}`
                )}>
                    {doc.public_url && doc.file_type === 'image' ? (
                        <img
                            src={doc.public_url}
                            alt={doc.name}
                            className={cn(
                                "w-full h-full object-cover transition-all duration-300",
                                isBlurMode && "blur-md hover:blur-none"
                            )}
                        />
                    ) : (
                        <Icon className="w-8 h-8 text-white/80" />
                    )}
                </div>

                {/* Info */}
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <div className="flex items-center justify-between mt-1 gap-1 flex-wrap">
                    <StatusBadge status={doc.status} />
                    <ExpirationBadge date={doc.expiration_date} neverExpires={neverExpires} />
                </div>

                {/* Side badge for recto/verso */}
                {doc.side && (
                    <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/50 text-white">
                            {doc.side === 'front' ? 'RECTO' : 'VERSO'}
                        </span>
                    </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <Eye className="w-4 h-4 text-white" />
                    </button>
                    <button
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                        className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-white" />
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <div className="h-full flex flex-col gap-2 relative">
                <input {...getInputProps()} />

                {/* Dropzone overlay - only captures drag events */}
                <div
                    {...getRootProps()}
                    className={cn(
                        "absolute inset-0 z-40 transition-opacity pointer-events-none",
                        isDragActive ? "opacity-100 pointer-events-auto" : "opacity-0"
                    )}
                >
                    {isDragActive && (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl">
                            <div className="text-center">
                                <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
                                <p className="text-sm font-medium text-primary">Déposez vos fichiers ici</p>
                            </div>
                        </div>
                    )}
                </div>


                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {selectedFolderId ? (
                            <button
                                onClick={() => selectFolder(null)}
                                className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                {selectedFolderId ? FOLDER_LABELS[selectedFolderId] : 'iDocument'}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {selectedFolderId
                                    ? `${folderStats[selectedFolderId]} document(s)`
                                    : `${localDocs.length} documents • ${Object.values(folderStats).filter(c => c > 0).length} dossiers`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Blur Mode Toggle */}
                        <button
                            onClick={() => setIsBlurMode(!isBlurMode)}
                            className={cn(
                                "p-2 rounded-xl transition-colors",
                                isBlurMode
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                            title={isBlurMode ? "Désactiver mode confidentiel" : "Activer mode confidentiel"}
                        >
                            <EyeOff className="w-4 h-4" />
                        </button>

                        {/* AI Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                            <Sparkles className="w-3 h-3 text-violet-500" />
                            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">IA Active</span>
                        </div>

                        {/* Notifications */}
                        <NotificationsPanel
                            notifications={notifications}
                            onNotificationClick={(notif) => {
                                // Navigate to the document's folder
                                selectFolder(notif.folderId);
                                // Find and preview the document
                                const doc = localDocs.find(d => d.id === notif.documentId);
                                if (doc) setPreviewDoc(doc);
                            }}
                        />

                        {/* Export PDF Button */}
                        <button
                            onClick={() => {
                                setSelectedDocs(selectedFolderId
                                    ? localDocs.filter(d => d.folder_id === selectedFolderId)
                                    : localDocs
                                );
                                setShareModalMode('export');
                                setShareModalOpen(true);
                            }}
                            className={cn(
                                "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs",
                                "bg-muted/50 hover:bg-muted transition-colors"
                            )}
                            title="Exporter en PDF"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>

                        <button
                            onClick={() => setShowUploadModal(true)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
                                "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            )}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter
                        </button>
                    </div>
                </div>


                {/* Search */}
                <div className="relative shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher un document..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-9 pr-4 py-2 rounded-xl text-sm",
                            "bg-muted/50 border border-border",
                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                        )}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <AnimatePresence mode="wait">
                        {!selectedFolderId ? (
                            // Folders View
                            <motion.div
                                key="folders"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                            >
                                {(['identity', 'civil_status', 'residence', 'education', 'work', 'health', 'vehicle', 'other'] as DocumentCategory[]).map((cat) => (
                                    <FolderCard key={cat} category={cat} />
                                ))}
                            </motion.div>
                        ) : (() => {
                            // Use groupDocuments to pair recto/verso
                            const groupedDocs = groupDocuments(searchedDocuments);

                            return (
                                // Documents View with intelligent grouping
                                <motion.div
                                    key="documents"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    {groupedDocs.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                            {groupedDocs.map(group => (
                                                <DocumentFlipCard
                                                    key={group.id}
                                                    group={group}
                                                    onPreview={setPreviewDoc}
                                                    onDelete={handleDelete}
                                                    isBlurMode={isBlurMode}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-64 flex flex-col items-center justify-center text-center">
                                            <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
                                            <p className="text-sm text-muted-foreground">Aucun document dans ce dossier</p>
                                            <button
                                                onClick={() => setShowUploadModal(true)}
                                                className="mt-3 text-xs text-primary hover:underline"
                                            >
                                                Ajouter un document
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-md p-5 rounded-2xl",
                                "bg-background border border-border shadow-2xl"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-foreground">Ajouter un document</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Folder Selection */}
                            <div className="mb-4">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase">Dossier de destination</label>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {(['identity', 'civil_status', 'residence', 'education', 'work', 'health', 'vehicle', 'other'] as DocumentCategory[]).map(cat => {
                                        const Icon = FOLDER_ICON_MAP[cat];
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => setUploadFolder(cat)}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                                                    uploadFolder === cat
                                                        ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                                                        : "bg-muted/50 border-border hover:border-primary/30",
                                                    "border"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-md flex items-center justify-center",
                                                    `bg-gradient-to-br ${FOLDER_COLORS[cat]}`
                                                )}>
                                                    <Icon className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-[8px] text-muted-foreground">{FOLDER_LABELS[cat]}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Upload Zone */}
                            <div className="space-y-3">
                                <label
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer",
                                        "border-2 border-dashed border-border hover:border-primary/50",
                                        "bg-muted/30 hover:bg-muted/50 transition-all"
                                    )}
                                >
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-foreground font-medium">Cliquez pour sélectionner</p>
                                    <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG (max 5MB)</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => handleUpload(e.target.files)}
                                    />
                                </label>

                                <button
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                                        "bg-muted/50 hover:bg-muted transition-colors",
                                        "text-xs font-medium text-muted-foreground"
                                    )}
                                >
                                    <Camera className="w-4 h-4" />
                                    Prendre une photo
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setPreviewDoc(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-2xl p-5 rounded-2xl",
                                "bg-background border border-border shadow-2xl"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{previewDoc.name}</h3>
                                    <p className="text-[10px] text-muted-foreground">
                                        {FOLDER_LABELS[previewDoc.folder_id]} • {format(new Date(previewDoc.created_at), 'dd MMMM yyyy', { locale: fr })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Preview */}
                            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center overflow-hidden mb-4">
                                {previewDoc.public_url && previewDoc.file_type === 'image' ? (
                                    <img
                                        src={previewDoc.public_url}
                                        alt={previewDoc.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : previewDoc.file_type === 'pdf' && previewDoc.public_url ? (
                                    <iframe
                                        src={previewDoc.public_url}
                                        className="w-full h-full"
                                        title={previewDoc.name}
                                    />
                                ) : (
                                    <FileText className="w-24 h-24 text-muted-foreground" />
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                <div>
                                    <span className="text-muted-foreground">Statut:</span>
                                    <span className="ml-2"><StatusBadge status={previewDoc.status} /></span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Expiration:</span>
                                    <span className="ml-2">
                                        <ExpirationBadge
                                            date={previewDoc.expiration_date}
                                            neverExpires={['civil_status', 'education'].includes(previewDoc.folder_id)}
                                        />
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Taille:</span>
                                    <span className="ml-2">{(previewDoc.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Source:</span>
                                    <span className="ml-2 capitalize">{previewDoc.source}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl",
                                    "bg-muted hover:bg-muted/80 transition-colors",
                                    "text-xs font-medium"
                                )}>
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                </button>
                                <button
                                    onClick={() => handleDelete(previewDoc)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
                                        "bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors",
                                        "text-xs font-medium"
                                    )}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share/Export Modal */}
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                documents={selectedDocs}
                mode={shareModalMode}
            />
        </>
    );
};

export default IDocumentPage;
