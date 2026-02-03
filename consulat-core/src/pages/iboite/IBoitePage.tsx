/**
 * iBoîte - Boîte aux Lettres Souveraine
 * Layout inspiré de iCV: Panneau de contrôle gauche + Prévisualisation document droite
 * Actions déplacées dans le panneau gauche pour maximiser l'espace de lecture
 */

import { useState, useRef, useEffect, useMemo } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDemo } from "@/contexts/DemoContext";
import { getRepresentationById } from "@/data/demo-diplomatic-network";
import {
    Package, Mail, MessageCircle, MapPin, Copy, Check, Send, Plus, X,
    Building2, User, Reply, Star, Trash2, Inbox, Clock,
    Truck, Printer, Download, AlertCircle, FileText,
    QrCode, Navigation, ChevronDown, Home, Briefcase, Users,
    Eye, ArrowLeft, Share2, Paperclip, Archive,
    Forward, ReplyAll
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Types
type SectionType = "courriers" | "colis" | "emails";
type FolderType = "inbox" | "sent" | "pending" | "trash";
type EmailFolderType = "inbox" | "sent" | "starred" | "trash";
type AccountType = "personal" | "professional" | "association";

interface Account {
    id: string;
    name: string;
    type: AccountType;
    icon: typeof Home;
    color: string;
    address: {
        label: string;
        fullAddress: string;
        street: string;
        city: string;
        country: string;
        postalCode: string;
        qrCode: string;
    };
    email: string;
}

interface DigitalLetter {
    id: string; accountId: string; folder: FolderType; sender: string; senderAddress: string;
    recipient: string; recipientAddress: string; subject: string; content: string;
    attachments: { name: string; size: string }[]; isRead: boolean; type: "action_required" | "informational" | "standard";
    stampColor: "red" | "blue" | "green"; createdAt: Date; dueDate?: Date;
}

interface PackageDelivery {
    id: string; accountId: string; trackingNumber: string; sender: string; description: string;
    status: "pending" | "transit" | "delivered" | "available"; estimatedDelivery?: Date;
}

interface EmailMessage {
    id: string; accountId: string; sender: { name: string; email: string; type: "admin" | "citizen" };
    recipient: { name: string; email: string };
    subject: string; preview: string; content: string; date: Date;
    isRead: boolean; isStarred: boolean; folder: EmailFolderType;
    hasAttachment?: boolean;
}

// Mock Data
// Dynamic accounts generator from user context
function generateUserAccounts(userName: string, userEmail: string, representationCity: string): Account[] {
    const firstName = userName.split(' ')[0];
    return [
        {
            id: "personal", name: "Personnel", type: "personal", icon: Home,
            color: "from-green-500 to-emerald-600",
            address: { label: userName, fullAddress: `Point Relais Consulat`, street: "Représentation Consulaire", city: representationCity, country: "Gabon", postalCode: "BP 1000", qrCode: `CONSULAT-${firstName.toUpperCase().slice(0, 3)}` },
            email: userEmail
        },
        {
            id: "professional", name: "Professionnel", type: "professional", icon: Briefcase,
            color: "from-blue-500 to-indigo-600",
            address: { label: `${firstName} - Professionnel`, fullAddress: "Adresse Professionnelle", street: "Quartier Affaires", city: representationCity, country: "Gabon", postalCode: "BP 5000", qrCode: `CONSULAT-PRO-${firstName.toUpperCase().slice(0, 3)}` },
            email: `pro.${firstName.toLowerCase()}@consulat.ga`
        },
        {
            id: "association", name: "Association", type: "association", icon: Users,
            color: "from-purple-500 to-pink-600",
            address: { label: "Associations Gabonaises", fullAddress: "Maison des Gabonais", street: "Représentation Consulaire", city: representationCity, country: "Gabon", postalCode: "BP 2500", qrCode: `CONSULAT-ASSO-${firstName.toUpperCase().slice(0, 3)}` },
            email: `asso.${firstName.toLowerCase()}@consulat.ga`
        }
    ];
}

const mockLetters: DigitalLetter[] = [
    { id: "l1", accountId: "personal", folder: "inbox", sender: "Mairie de Libreville", senderAddress: "Mairie de Libreville\nService État Civil\nBP 123 Libreville", recipient: "Jean Dupont", recipientAddress: "Jean Dupont\nBP 1000\nLibreville, GABON", subject: "Complément de dossier requis", content: "Monsieur,\n\nSuite à l'examen de votre dossier de demande d'acte de naissance, nous avons constaté qu'il manque une pièce justificative.\n\nNous vous prions de bien vouloir nous transmettre dans les meilleurs délais :\n- Une copie de votre pièce d'identité\n- Un justificatif de domicile récent\n\nSans réponse de votre part sous 15 jours, votre dossier sera classé sans suite.\n\nVeuillez agréer, Monsieur, l'expression de nos salutations distinguées.\n\nLe Service de l'État Civil", attachments: [], isRead: false, type: "action_required", stampColor: "red", createdAt: new Date(Date.now() - 7200000), dueDate: new Date(Date.now() + 86400000 * 15) },
    { id: "l2", accountId: "personal", folder: "inbox", sender: "CNAMGS", senderAddress: "CNAMGS\nDirection Générale\nLibreville", recipient: "Jean Dupont", recipientAddress: "Jean Dupont\nBP 1000\nLibreville", subject: "Confirmation d'adhésion à l'assurance maladie", content: "Monsieur,\n\nNous avons le plaisir de vous confirmer que votre adhésion au régime d'assurance maladie obligatoire a été validée.\n\nVotre numéro d'assuré social est : CNAMGS-2024-78901\n\nVotre carte d'assuré vous sera envoyée sous 10 jours ouvrables.\n\nCordialement,\nLa Direction", attachments: [], isRead: true, type: "informational", stampColor: "green", createdAt: new Date(Date.now() - 172800000) },
    { id: "l3", accountId: "personal", folder: "sent", sender: "Jean Dupont", senderAddress: "Jean Dupont\nBP 1000\nLibreville, GABON", recipient: "Mairie de Libreville", recipientAddress: "Mairie de Libreville\nService État Civil\nBP 123 Libreville", subject: "Demande de copie intégrale d'acte de naissance", content: "Madame, Monsieur l'Officier de l'État Civil,\n\nJe soussigné Jean Dupont, né le 15 mai 1990 à Libreville, sollicite par la présente la délivrance d'une copie intégrale de mon acte de naissance.\n\nCette demande est motivée par le renouvellement de mon passeport.\n\nVous trouverez ci-joint les pièces justificatives requises.\n\nDans l'attente d'une réponse favorable, je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.\n\nJean Dupont", attachments: [{ name: "CNI_recto_verso.pdf", size: "1.2 MB" }, { name: "Justificatif_domicile.pdf", size: "850 KB" }], isRead: true, type: "standard", stampColor: "blue", createdAt: new Date(Date.now() - 432000000) },
];

const mockPackages: PackageDelivery[] = [
    { id: "pkg1", accountId: "personal", trackingNumber: "GA2024-78901", sender: "Amazon.fr", description: "Commande électronique", status: "available" },
    { id: "pkg2", accountId: "personal", trackingNumber: "GA2024-78902", sender: "La Poste", description: "Recommandé", status: "transit", estimatedDelivery: new Date(Date.now() + 86400000 * 2) },
];

const mockEmails: EmailMessage[] = [
    { id: "m1", accountId: "personal", sender: { name: "Mairie de Libreville", email: "contact@mairie-libreville.ga", type: "admin" }, recipient: { name: "Jean Dupont", email: "jean.dupont@idn.ga" }, subject: "Confirmation de votre demande", preview: "Votre demande a été enregistrée sous le numéro #2024-12345...", content: "Bonjour,\n\nVotre demande a été enregistrée sous le numéro #2024-12345.\n\nElle sera traitée dans un délai de 5 jours ouvrables.\n\nCordialement,\nLe Service Accueil", date: new Date(Date.now() - 1800000), isRead: false, isStarred: true, folder: "inbox" },
    { id: "m2", accountId: "personal", sender: { name: "CNAMGS", email: "contact@cnamgs.ga", type: "admin" }, recipient: { name: "Jean Dupont", email: "jean.dupont@idn.ga" }, subject: "Documents requis pour votre dossier", preview: "Pour compléter votre dossier, merci de fournir les documents suivants...", content: "Bonjour,\n\nPour compléter votre dossier d'affiliation, merci de nous fournir les documents suivants :\n- Copie de la CNI\n- Photo d'identité récente\n- Justificatif de revenus\n\nCordialement,\nCNAMGS", date: new Date(Date.now() - 7200000), isRead: false, isStarred: false, folder: "inbox", hasAttachment: true },
    { id: "m3", accountId: "personal", sender: { name: "Direction Générale des Impôts", email: "contact@dgi.ga", type: "admin" }, recipient: { name: "Jean Dupont", email: "jean.dupont@idn.ga" }, subject: "Rappel: Déclaration fiscale 2025", preview: "Nous vous rappelons que la date limite de déclaration...", content: "Monsieur,\n\nNous vous rappelons que la date limite de déclaration de vos revenus 2024 est fixée au 31 mars 2025.\n\nVeuillez vous connecter à votre espace personnel pour effectuer votre déclaration.\n\nCordialement,\nLa DGI", date: new Date(Date.now() - 86400000), isRead: true, isStarred: false, folder: "inbox" },
    { id: "m4", accountId: "personal", sender: { name: "Jean Dupont", email: "jean.dupont@idn.ga", type: "citizen" }, recipient: { name: "CNAMGS", email: "contact@cnamgs.ga" }, subject: "Re: Documents requis pour votre dossier", preview: "Veuillez trouver ci-joint les documents demandés...", content: "Bonjour,\n\nVeuillez trouver ci-joint les documents demandés pour compléter mon dossier.\n\nCordialement,\nJean Dupont", date: new Date(Date.now() - 3600000), isRead: true, isStarred: false, folder: "sent", hasAttachment: true },
];

const IBoitePage = () => {
    const { currentUser } = useDemo();

    // Generate accounts dynamically from user context
    const userAccounts = useMemo(() => {
        const userName = currentUser?.name || "Citoyen Gabonais";
        const userEmail = currentUser?.email || "citoyen@consulat.ga";
        let city = "Libreville";
        if (currentUser?.managedByOrgId) {
            const rep = getRepresentationById(currentUser.managedByOrgId);
            if (rep) city = rep.representation.city;
        }
        return generateUserAccounts(userName, userEmail, city);
    }, [currentUser]);

    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // Initialize account when userAccounts change
    useEffect(() => {
        if (userAccounts.length > 0 && !selectedAccount) {
            setSelectedAccount(userAccounts[0]);
        }
    }, [userAccounts, selectedAccount]);
    const [activeSection, setActiveSection] = useState<SectionType>("courriers");
    const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
    const [emailFolder, setEmailFolder] = useState<EmailFolderType>("inbox");
    const [letters, setLetters] = useState(mockLetters);
    const [selectedLetter, setSelectedLetter] = useState<DigitalLetter | null>(null);
    const [emails, setEmails] = useState(mockEmails);
    const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showComposeEmail, setShowComposeEmail] = useState(false);

    // Preview container ref for scaling
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(1);

    // Calculate scale for A4 preview - using full container
    useEffect(() => {
        const calculateScale = () => {
            if (previewContainerRef.current) {
                const container = previewContainerRef.current;
                const containerWidth = container.clientWidth - 24;
                const containerHeight = container.clientHeight - 24;
                const a4Width = 595;
                const a4Height = 842;
                const scaleX = containerWidth / a4Width;
                const scaleY = containerHeight / a4Height;
                setPreviewScale(Math.min(scaleX, scaleY, 1));
            }
        };
        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [selectedLetter]);

    // Filtered data - guard against null selectedAccount
    const accountLetters = selectedAccount ? letters.filter(l => l.accountId === selectedAccount.id) : [];
    const accountPackages = selectedAccount ? mockPackages.filter(p => p.accountId === selectedAccount.id) : [];
    const accountEmails = selectedAccount ? emails.filter(e => e.accountId === selectedAccount.id) : [];
    const filteredLetters = accountLetters.filter(l => l.folder === currentFolder);
    const filteredEmails = accountEmails.filter(e => emailFolder === "starred" ? e.isStarred : e.folder === emailFolder);
    const unreadLetters = accountLetters.filter(l => l.folder === "inbox" && !l.isRead).length;
    const availablePackages = accountPackages.filter(p => p.status === "available").length;
    const unreadEmails = accountEmails.filter(e => e.folder === "inbox" && !e.isRead).length;

    const copyAddress = () => {
        if (!selectedAccount) return;
        navigator.clipboard.writeText(`${selectedAccount.address.fullAddress}\n${selectedAccount.address.street}\n${selectedAccount.address.postalCode} ${selectedAccount.address.city}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const moveLetter = (id: string, target: FolderType) => {
        setLetters(prev => prev.map(l => l.id === id ? { ...l, folder: target } : l));
        setSelectedLetter(null);
    };

    const toggleEmailStar = (id: string) => {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, isStarred: !e.isStarred } : e));
    };

    // Section badges
    const sectionBadges = {
        courriers: unreadLetters,
        colis: availablePackages,
        emails: unreadEmails
    };

    // Loading state while accounts are being generated
    if (!selectedAccount) {
        return (
            <>
                <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Chargement de votre boîte...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="h-[calc(100vh-8rem)] flex gap-2 overflow-hidden">

                {/* Left Panel - Controls */}
                <div className={cn(
                    "w-72 shrink-0 rounded-xl flex flex-col overflow-hidden",
                    "glass-card"
                )}>
                    {/* Account Selector - Compact */}
                    <div className="p-2.5 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <button
                                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
                                    "bg-gradient-to-r text-white shadow-sm",
                                    selectedAccount.color
                                )}
                            >
                                <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                                    <selectedAccount.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-bold truncate">{selectedAccount.name}</p>
                                    <p className="text-xs text-white/70 truncate">{selectedAccount.email}</p>
                                </div>
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", accountDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {accountDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg overflow-hidden z-50"
                                    >
                                        {userAccounts.map(account => (
                                            <button
                                                key={account.id}
                                                onClick={() => { setSelectedAccount(account); setAccountDropdownOpen(false); setSelectedLetter(null); setSelectedEmail(null); }}
                                                className={cn(
                                                    "w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                                                    selectedAccount.id === account.id && "bg-slate-100 dark:bg-white/10"
                                                )}
                                            >
                                                <div className={cn("w-6 h-6 rounded-md bg-gradient-to-r flex items-center justify-center text-white", account.color)}>
                                                    <account.icon className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{account.name}</span>
                                                {selectedAccount.id === account.id && <Check className="w-3 h-3 text-primary ml-auto" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Address - Ultra Compact */}
                        <div className="mt-2 p-1.5 rounded bg-slate-50 dark:bg-white/5 text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">{selectedAccount.address.street}, {selectedAccount.address.city}</span>
                            <button onClick={copyAddress} className="p-0.5 rounded hover:bg-slate-200 ml-auto shrink-0">
                                {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                        </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="p-2.5 border-b border-slate-200 dark:border-slate-700">
                        <div className="space-y-0.5">
                            {[
                                { id: "courriers" as SectionType, label: "Courriers", icon: Mail, color: "text-blue-500" },
                                { id: "colis" as SectionType, label: "Colis", icon: Package, color: "text-amber-500" },
                                { id: "emails" as SectionType, label: "eMails", icon: MessageCircle, color: "text-green-500" },
                            ].map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => { setActiveSection(section.id); setSelectedLetter(null); setSelectedEmail(null); }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                                        activeSection === section.id
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <section.icon className={cn("w-3.5 h-3.5", activeSection === section.id ? "text-primary" : section.color)} />
                                        {section.label}
                                    </div>
                                    {sectionBadges[section.id] > 0 && (
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded-full text-xs font-bold",
                                            activeSection === section.id ? "bg-primary text-white" : "bg-primary/20 text-primary"
                                        )}>
                                            {sectionBadges[section.id]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Folders + Actions based on section */}
                    <div className="flex-1 overflow-auto p-2.5">
                        {activeSection === "courriers" && (
                            <>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Dossiers</p>
                                <div className="space-y-0.5">
                                    {[
                                        { id: "inbox" as FolderType, label: "Réception", icon: Inbox, count: unreadLetters },
                                        { id: "sent" as FolderType, label: "Expédiés", icon: Send },
                                        { id: "pending" as FolderType, label: "À traiter", icon: Clock, count: accountLetters.filter(l => l.folder === "pending").length },
                                        { id: "trash" as FolderType, label: "Poubelle", icon: Trash2 },
                                    ].map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => { setCurrentFolder(folder.id); setSelectedLetter(null); }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                                                currentFolder === folder.id
                                                    ? "bg-white dark:bg-white/10 shadow-sm text-foreground"
                                                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <folder.icon className="w-3.5 h-3.5" />
                                                {folder.label}
                                            </div>
                                            {folder.count && folder.count > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                                                    {folder.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* New Letter Button */}
                                <button className="w-full mt-3 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm">
                                    <Plus className="w-3.5 h-3.5" />
                                    Nouveau courrier
                                </button>

                                {/* Letter Actions - Show when letter selected */}
                                {selectedLetter && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Actions</p>
                                        <div className="space-y-1">
                                            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 text-primary">
                                                <Reply className="w-3.5 h-3.5" />
                                                Répondre
                                            </button>
                                            <div className="grid grid-cols-2 gap-1">
                                                <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                                                    <Download className="w-3.5 h-3.5 text-blue-500" />
                                                    Télécharger
                                                </button>
                                                <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                                    Imprimer
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {selectedLetter.folder !== "pending" && selectedLetter.folder !== "trash" && (
                                                    <button
                                                        onClick={() => moveLetter(selectedLetter.id, "pending")}
                                                        className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                                                    >
                                                        <Clock className="w-3.5 h-3.5" />
                                                        À traiter
                                                    </button>
                                                )}
                                                <button className={cn(
                                                    "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5",
                                                    (selectedLetter.folder === "pending" || selectedLetter.folder === "trash") && "col-span-2"
                                                )}>
                                                    <Share2 className="w-3.5 h-3.5 text-green-500" />
                                                    Partager
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => moveLetter(selectedLetter.id, "trash")}
                                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeSection === "colis" && (
                            <>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Statut</p>
                                <div className="space-y-1.5">
                                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                        <div className="flex items-center gap-1.5 text-amber-600">
                                            <Package className="w-3.5 h-3.5" />
                                            <span className="text-sm font-semibold">{availablePackages} à retirer</span>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                        <div className="flex items-center gap-1.5 text-blue-600">
                                            <Truck className="w-3.5 h-3.5" />
                                            <span className="text-sm font-semibold">{accountPackages.filter(p => p.status === "transit").length} en transit</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-center">
                                    <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                                    <p className="text-xs font-mono text-muted-foreground">{selectedAccount.address.qrCode}</p>
                                </div>
                            </>
                        )}

                        {activeSection === "emails" && (
                            <>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Dossiers</p>
                                <div className="space-y-0.5">
                                    {[
                                        { id: "inbox" as EmailFolderType, label: "Boîte de réception", icon: Inbox, count: unreadEmails },
                                        { id: "starred" as EmailFolderType, label: "Favoris", icon: Star },
                                        { id: "sent" as EmailFolderType, label: "Envoyés", icon: Send },
                                        { id: "trash" as EmailFolderType, label: "Corbeille", icon: Trash2 },
                                    ].map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => { setEmailFolder(folder.id); setSelectedEmail(null); }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                                                emailFolder === folder.id
                                                    ? "bg-white dark:bg-white/10 shadow-sm text-foreground"
                                                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <folder.icon className={cn("w-3.5 h-3.5", folder.id === "starred" && emailFolder === folder.id && "text-amber-500 fill-amber-500")} />
                                                {folder.label}
                                            </div>
                                            {folder.count && folder.count > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                                                    {folder.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Compose Email Button */}
                                <button
                                    onClick={() => setShowComposeEmail(true)}
                                    className="w-full mt-3 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Nouveau message
                                </button>

                                {/* Email Actions - Show when email selected */}
                                {selectedEmail && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Actions</p>
                                        <div className="space-y-1">
                                            <div className="grid grid-cols-2 gap-1">
                                                <div className="relative group">
                                                    <button className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 text-primary">
                                                        <Reply className="w-3.5 h-3.5" />
                                                        Répondre
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5">
                                                            <ReplyAll className="w-3.5 h-3.5 text-slate-500" />
                                                            Répondre à tous
                                                        </button>
                                                    </div>
                                                </div>
                                                <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                                                    <Forward className="w-3.5 h-3.5 text-blue-500" />
                                                    Transférer
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/5">
                                                    <Archive className="w-3.5 h-3.5 text-slate-500" />
                                                    Archiver
                                                </button>
                                                <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Back Button when viewing - at bottom */}
                    {(selectedLetter || selectedEmail) && (
                        <div className="p-2.5 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => { setSelectedLetter(null); setSelectedEmail(null); }}
                                className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-white/10 hover:bg-slate-200"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Retour à la liste
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Content - FULL HEIGHT FOR PDF */}
                <div
                    ref={previewContainerRef}
                    className={cn(
                        "flex-1 rounded-xl flex flex-col overflow-hidden",
                        "glass-card"
                    )}
                >
                    {/* COURRIERS SECTION */}
                    {activeSection === "courriers" && (
                        selectedLetter ? (
                            /* Letter Preview - FULL SCREEN */
                            <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-slate-200/50 dark:bg-slate-900/50">
                                <div
                                    style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }}
                                    className="bg-white shadow-lg rounded-sm"
                                >
                                    <div className="w-[595px] min-h-[842px] p-10">
                                        {/* Letter Header */}
                                        <div className="flex justify-between mb-6">
                                            <div className="text-xs text-slate-600 whitespace-pre-line">{selectedLetter.senderAddress}</div>
                                            <div className="text-xs font-semibold text-right whitespace-pre-line">{selectedLetter.recipientAddress}</div>
                                        </div>
                                        <div className="text-xs text-slate-600 text-right mb-5">
                                            Libreville, le {format(selectedLetter.createdAt, "dd MMMM yyyy", { locale: fr })}
                                        </div>
                                        <div className="text-base font-bold mb-5 pb-2 border-b border-slate-200">
                                            Objet : {selectedLetter.subject}
                                        </div>
                                        <div className="text-sm leading-6 whitespace-pre-wrap text-justify">
                                            {selectedLetter.content}
                                        </div>
                                        {selectedLetter.attachments.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-slate-200">
                                                <p className="text-xs font-bold text-slate-600 uppercase mb-2">Pièces jointes</p>
                                                <div className="space-y-1.5">
                                                    {selectedLetter.attachments.map((a, i) => (
                                                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-slate-50 border text-xs">
                                                            <FileText className="w-4 h-4 text-blue-500" />
                                                            <span className="flex-1 font-medium">{a.name}</span>
                                                            <span className="text-slate-500">{a.size}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-6 text-right">
                                            <span className="text-lg text-blue-900 italic">{selectedLetter.sender.split('\n')[0]}</span>
                                        </div>
                                        {/* Action Required Badge on document */}
                                        {selectedLetter.type === "action_required" && selectedLetter.folder === "inbox" && (
                                            <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-bold text-red-700">Action requise</p>
                                                    <p className="text-xs text-red-600">Réponse attendue avant le {selectedLetter.dueDate ? format(selectedLetter.dueDate, "dd/MM/yyyy") : "prochainement"}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Letter List */
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="py-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                                    <h2 className="text-sm font-bold text-foreground">
                                        {currentFolder === "inbox" ? "Réception" : currentFolder === "sent" ? "Expédiés" : currentFolder === "pending" ? "À traiter" : "Poubelle"}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">{filteredLetters.length} courrier(s)</p>
                                </div>
                                <div className="flex-1 overflow-auto p-3">
                                    {filteredLetters.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <Mail className="w-10 h-10 mb-2 opacity-30" />
                                            <p className="text-xs">Aucun courrier</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {filteredLetters.map(letter => (
                                                <motion.button
                                                    key={letter.id}
                                                    onClick={() => { setSelectedLetter(letter); if (!letter.isRead) setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, isRead: true } : l)); }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "relative rounded-lg overflow-hidden text-left transition-all",
                                                        "bg-white dark:bg-white/5 hover:bg-slate-50",
                                                        "border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-sm",
                                                        !letter.isRead && "ring-2 ring-primary/30"
                                                    )}
                                                >
                                                    <div className="relative h-20 bg-[#f5f2eb] dark:bg-[#e8e4dc] overflow-hidden">
                                                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#ebe7df] to-[#dfd9ce]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
                                                        <div className="absolute top-2 left-0 right-0 bottom-0 bg-[#f5f2eb] dark:bg-[#e8e4dc] border-t border-black/5 p-2 flex flex-col justify-end">
                                                            {letter.type === "action_required" && !letter.isRead && (
                                                                <span className="absolute top-0.5 right-1 text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">URGENT</span>
                                                            )}
                                                            {letter.folder === "pending" && (
                                                                <span className="absolute top-0.5 right-1 text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">À TRAITER</span>
                                                            )}
                                                            <div className="bg-white/70 p-1.5 rounded">
                                                                <p className="text-xs font-semibold text-slate-800 truncate">{letter.folder === "sent" ? letter.recipient : letter.sender}</p>
                                                                <p className="text-xs text-slate-500 truncate">{letter.subject}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 py-1.5 bg-white dark:bg-slate-900/50 flex items-center justify-between">
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(letter.createdAt, { addSuffix: true, locale: fr })}
                                                        </p>
                                                        {letter.folder !== "pending" && letter.folder !== "trash" && letter.folder !== "sent" && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveLetter(letter.id, "pending"); }}
                                                                className="p-1 rounded hover:bg-amber-100 text-amber-600"
                                                                title="Marquer à traiter"
                                                            >
                                                                <Clock className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    {/* COLIS SECTION */}
                    {activeSection === "colis" && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="py-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                                <h2 className="text-sm font-bold text-foreground">Mes Colis</h2>
                                <p className="text-xs text-muted-foreground">{accountPackages.length} colis</p>
                            </div>
                            <div className="flex-1 overflow-auto p-3">
                                {accountPackages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                        <Package className="w-10 h-10 mb-2 opacity-30" />
                                        <p className="text-xs">Aucun colis</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {accountPackages.map(pkg => (
                                            <motion.div
                                                key={pkg.id}
                                                whileHover={{ scale: 1.01 }}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                                                    "bg-white dark:bg-white/5",
                                                    "border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-sm"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg flex items-center justify-center",
                                                    pkg.status === "available" ? "bg-amber-500/10" : "bg-blue-500/10"
                                                )}>
                                                    {pkg.status === "available" ? (
                                                        <Package className="w-6 h-6 text-amber-500" />
                                                    ) : (
                                                        <Truck className="w-6 h-6 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{pkg.description}</p>
                                                    <p className="text-xs text-muted-foreground">De: {pkg.sender}</p>
                                                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{pkg.trackingNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white",
                                                        pkg.status === "available" ? "bg-amber-500" : "bg-blue-500"
                                                    )}>
                                                        {pkg.status === "available" ? "À retirer" : "En transit"}
                                                    </span>
                                                    {pkg.estimatedDelivery && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Arrivée: {format(pkg.estimatedDelivery, "dd/MM")}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* EMAILS SECTION */}
                    {activeSection === "emails" && (
                        selectedEmail ? (
                            /* Email Detail View - FULL SCREEN */
                            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                                {/* Email Header - On document */}
                                <div className="shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", selectedEmail.sender.type === "admin" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-green-500 to-emerald-600")}>
                                            {selectedEmail.sender.type === "admin" ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-bold text-foreground">{selectedEmail.sender.name}</p>
                                            <p className="text-xs text-muted-foreground">&lt;{selectedEmail.sender.email}&gt;</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">À: {selectedEmail.recipient.email} • {format(selectedEmail.date, "dd MMM yyyy, HH:mm", { locale: fr })}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleEmailStar(selectedEmail.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium transition-all shrink-0",
                                                selectedEmail.isStarred
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            )}
                                        >
                                            <Star className={cn("w-4 h-4", selectedEmail.isStarred && "fill-amber-500 text-amber-500")} />
                                            {selectedEmail.isStarred ? "Retirer des favoris" : "Ajouter aux favoris"}
                                        </button>
                                    </div>
                                    <h1 className="text-lg font-semibold mt-3">{selectedEmail.subject}</h1>
                                </div>

                                {/* Email Content - FULL */}
                                <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border">
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{selectedEmail.content}</p>
                                        {selectedEmail.hasAttachment && (
                                            <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pièces jointes</p>
                                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border">
                                                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-xs font-medium flex-1">Document.pdf</span>
                                                    <button className="text-xs text-primary hover:underline">Télécharger</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Email List View */
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="py-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                                    <h2 className="text-sm font-bold text-foreground">
                                        {emailFolder === "inbox" ? "Boîte de réception" : emailFolder === "starred" ? "Favoris" : emailFolder === "sent" ? "Envoyés" : "Corbeille"}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">{filteredEmails.length} message(s)</p>
                                </div>
                                <div className="flex-1 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredEmails.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                                            <p className="text-xs">Aucun message</p>
                                        </div>
                                    ) : (
                                        filteredEmails.map(email => (
                                            <button
                                                key={email.id}
                                                onClick={() => { setSelectedEmail(email); if (!email.isRead) setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e)); }}
                                                className={cn(
                                                    "w-full flex items-start gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                                                    !email.isRead && "bg-blue-50/50 dark:bg-blue-500/5"
                                                )}
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleEmailStar(email.id); }}
                                                    className="p-0.5 rounded hover:bg-slate-100 mt-1"
                                                >
                                                    <Star className={cn("w-4 h-4", email.isStarred ? "text-amber-500 fill-amber-500" : "text-slate-300 hover:text-slate-400")} />
                                                </button>
                                                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", email.sender.type === "admin" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-green-500 to-emerald-600")}>
                                                    {email.sender.type === "admin" ? <Building2 className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={cn("text-sm truncate", !email.isRead ? "font-bold text-foreground" : "text-muted-foreground")}>
                                                            {emailFolder === "sent" ? email.recipient.name : email.sender.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(email.date, { addSuffix: true, locale: fr })}</span>
                                                    </div>
                                                    <p className={cn("text-xs truncate", !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground")}>{email.subject}</p>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{email.preview}</p>
                                                </div>
                                                {email.hasAttachment && <Paperclip className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Compose Email Modal */}
            <AnimatePresence>
                {showComposeEmail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowComposeEmail(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg rounded-xl bg-background border border-border shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-base font-bold">Nouveau message</h3>
                                <button onClick={() => setShowComposeEmail(false)} className="p-1.5 rounded hover:bg-muted">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <input type="text" placeholder="À" className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <input type="text" placeholder="Objet" className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <textarea placeholder="Votre message..." rows={8} className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted">
                                    <Paperclip className="w-4 h-4" />Joindre
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowComposeEmail(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">
                                        Annuler
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90">
                                        <Send className="w-4 h-4" />Envoyer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default IBoitePage;
