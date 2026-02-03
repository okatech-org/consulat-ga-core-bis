import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Plus,
    Trash2,
    Edit3,
    GripVertical,
    CreditCard,
    Heart,
    Briefcase,
    X,
    Check,
    Users,
    Palette,
    Eye,
    EyeOff,
    ChevronRight,
    Wallet,
    Building2,
    User,
    Upload,
    Image as ImageIcon,
    UserCircle,
    QrCode,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletCard } from "@/components/dashboard/DigitalWallet";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Theme definition
interface CardTheme {
    id: string;
    name: string;
    background: string; // Tailwnd classes
    textColor?: string; // Force specific text color (e.g. for light backgrounds)
    borderColor?: string;
    isPremium?: boolean;
}

// Available themes for card customization
const availableThemes: CardTheme[] = [
    // Modern Artistic
    { id: 'quantum', name: 'Quantum', background: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900', borderColor: 'border-white/20', isPremium: true, textColor: 'text-white' },
    { id: 'aurora', name: 'Aurora', background: 'bg-gradient-to-tr from-green-300 via-blue-500 to-purple-600', borderColor: 'border-white/30', isPremium: true, textColor: 'text-white' },
    { id: 'cyber', name: 'Cyber', background: 'bg-slate-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]', borderColor: 'border-cyan-500/50', isPremium: true, textColor: 'text-cyan-400' },
    { id: 'royal', name: 'Royal', background: 'bg-gradient-to-bl from-amber-200 via-yellow-400 to-amber-700', borderColor: 'border-amber-100/40', isPremium: true, textColor: 'text-amber-950' },
    // Premium Metals
    { id: 'gold', name: 'Or Premium', background: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600', borderColor: 'border-yellow-300/50', isPremium: true },
    { id: 'silver', name: 'Argent', background: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400', textColor: 'text-slate-800', borderColor: 'border-white/50', isPremium: true },
    { id: 'bronze', name: 'Bronze', background: 'bg-gradient-to-br from-orange-700 via-amber-800 to-orange-900', borderColor: 'border-orange-500/30', isPremium: true },
    // Premium Dark
    { id: 'obsidian', name: 'Obsidienne', background: 'bg-gradient-to-br from-slate-950 via-black to-slate-900', borderColor: 'border-white/10', isPremium: true },
    { id: 'midnight', name: 'Minuit', background: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950', borderColor: 'border-blue-500/20', isPremium: true },
    // Standard Colors
    { id: 'violet', name: 'Violet', background: 'bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800' },
    { id: 'blue', name: 'Bleu', background: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700' },
    { id: 'green', name: 'Vert', background: 'bg-gradient-to-br from-green-600 via-green-700 to-emerald-800' },
    { id: 'orange', name: 'Orange', background: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600' },
    { id: 'rose', name: 'Rose', background: 'bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600' },
    { id: 'black', name: 'Noir', background: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black' },
];

// LIMITS
const LIMITS = {
    PRESIDENT_ASSOCIATIONS: 4,  // Max associations user can create/own
    ENTERPRISES: 2,             // Max business cards
    CUSTOM: 3,                  // Max custom cards
    WALLET: 6,                  // Max cards in wallet/profile
};

// Mock: Associations where user is PRESIDENT (can customize)
const mockPresidentAssociations: WalletCard[] = [
    {
        id: "asso-pres-1",
        type: "association",
        name: "Génération Business",
        subtitle: "Carte Membre",
        icon: Users,
        gradient: "bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800",
        data: { role: "PRÉSIDENT", canCustomize: "true" },
    },
];

// Mock: Associations where user is MEMBER (cannot customize - design imposed)
const mockMemberAssociations: WalletCard[] = [
    {
        id: "asso-member-1",
        type: "association",
        name: "Diaspora Gabon France",
        subtitle: "Membre Actif",
        icon: Heart,
        gradient: "bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600",
        data: { role: "MEMBRE" },
        isAutoAssigned: true,
    },
];

const ICartePage = () => {
    const navigate = useNavigate();

    // Cards state
    const [presidentCards, setPresidentCards] = useState<WalletCard[]>(mockPresidentAssociations);
    const [memberCards] = useState<WalletCard[]>(mockMemberAssociations);
    const [enterpriseCards, setEnterpriseCards] = useState<WalletCard[]>([]);
    const [customCards, setCustomCards] = useState<WalletCard[]>([]);

    // Wallet cards (selected for profile)
    const [walletCardIds, setWalletCardIds] = useState<string[]>([]);

    // Modal states
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState<'enterprise' | 'custom' | null>(null);
    const [editingCard, setEditingCard] = useState<WalletCard | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<CardTheme>(availableThemes[5]); // Default to Violet

    // Customization options
    const [showPhoto, setShowPhoto] = useState(true);
    const [showQrCode, setShowQrCode] = useState(true);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [newCardForm, setNewCardForm] = useState({ name: '', subtitle: '', entreprise: '', poste: '', email: '', telephone: '' });

    // All cards combined for wallet selection
    const allCards = [...presidentCards, ...memberCards, ...enterpriseCards, ...customCards];
    const walletCards = walletCardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as WalletCard[];

    // Counts
    const counts = {
        president: presidentCards.length,
        enterprise: enterpriseCards.length,
        custom: customCards.length,
        wallet: walletCardIds.length,
    };

    // Toggle card in wallet
    const toggleWallet = (cardId: string) => {
        if (walletCardIds.includes(cardId)) {
            setWalletCardIds(walletCardIds.filter(id => id !== cardId));
        } else if (walletCardIds.length < LIMITS.WALLET) {
            setWalletCardIds([...walletCardIds, cardId]);
        }
    };

    // Open customize modal
    const openCustomize = (card: WalletCard) => {
        setEditingCard(card);
        // Find existing theme or default
        const theme = availableThemes.find(t => t.background === card.gradient) || availableThemes[5];
        setSelectedTheme(theme);

        setShowPhoto(card.data?.showPhoto !== 'false');
        setShowQrCode(card.data?.showQrCode !== 'false');
        setLogoUrl(card.data?.logoUrl || null);
        setShowCustomizeModal(true);
    };

    // Handle logo upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo trop volumineux (max 2MB)');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setLogoUrl(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Save customization
    const saveCustomization = () => {
        if (!editingCard) return;

        const updateCard = (c: WalletCard) =>
            c.id === editingCard.id ? {
                ...c,
                gradient: selectedTheme.background,
                data: {
                    ...c.data,
                    textColor: selectedTheme.textColor, // Persist text color choice 
                    showPhoto: showPhoto ? 'true' : 'false',
                    showQrCode: showQrCode ? 'true' : 'false',
                    logoUrl: logoUrl || undefined,
                }
            } : c;

        // Determine which list to update
        if (presidentCards.some(c => c.id === editingCard.id)) {
            setPresidentCards(presidentCards.map(updateCard));
        } else if (enterpriseCards.some(c => c.id === editingCard.id)) {
            setEnterpriseCards(enterpriseCards.map(updateCard));
        } else if (customCards.some(c => c.id === editingCard.id)) {
            setCustomCards(customCards.map(updateCard));
        }

        setShowCustomizeModal(false);
        setEditingCard(null);
        toast.success('Design de carte enregistré !');
    };

    // Create enterprise card
    const createEnterpriseCard = () => {
        if (counts.enterprise >= LIMITS.ENTERPRISES) return;
        const newCard: WalletCard = {
            id: `enterprise-${Date.now()}`,
            type: "enterprise",
            name: newCardForm.entreprise || 'Mon Entreprise',
            subtitle: newCardForm.poste || 'Poste',
            icon: Briefcase,
            gradient: availableThemes[6].background, // Default Blue
            data: { entreprise: newCardForm.entreprise, poste: newCardForm.poste, email: newCardForm.email, telephone: newCardForm.telephone },
        };
        setEnterpriseCards([...enterpriseCards, newCard]);
        setShowCreateModal(null);
        setNewCardForm({ name: '', subtitle: '', entreprise: '', poste: '', email: '', telephone: '' });
    };

    // Create custom card
    const createCustomCard = () => {
        if (counts.custom >= LIMITS.CUSTOM) return;
        const newCard: WalletCard = {
            id: `custom-${Date.now()}`,
            type: "custom",
            name: newCardForm.name || 'Ma Carte',
            subtitle: newCardForm.subtitle || '',
            icon: CreditCard,
            gradient: availableThemes[5].background, // Default Violet
            data: {},
        };
        setCustomCards([...customCards, newCard]);
        setShowCreateModal(null);
        setNewCardForm({ name: '', subtitle: '', entreprise: '', poste: '', email: '', telephone: '' });
    };

    // Delete card
    const deleteCard = (card: WalletCard) => {
        if (card.type === 'enterprise') {
            setEnterpriseCards(enterpriseCards.filter(c => c.id !== card.id));
        } else if (card.type === 'custom') {
            setCustomCards(customCards.filter(c => c.id !== card.id));
        }
        setWalletCardIds(walletCardIds.filter(id => id !== card.id));
    };

    // Card row component
    const CardRow = ({ card, canCustomize = false, canDelete = false }: { card: WalletCard; canCustomize?: boolean; canDelete?: boolean }) => {
        const isInWallet = walletCardIds.includes(card.id);
        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-8 rounded-lg flex items-center justify-center", card.gradient)}>
                        <card.icon className={cn("w-4 h-4", card.data?.textColor ? card.data.textColor : "text-white")} />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{card.name}</p>
                        <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canCustomize && (
                        <button onClick={() => openCustomize(card)} className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 transition-colors" title="Personnaliser">
                            <Palette className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => toggleWallet(card.id)}
                        disabled={!isInWallet && counts.wallet >= LIMITS.WALLET}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isInWallet ? "bg-primary/20 text-primary" : "bg-muted hover:bg-muted/80 text-muted-foreground",
                            !isInWallet && counts.wallet >= LIMITS.WALLET && "opacity-50 cursor-not-allowed"
                        )}
                        title={isInWallet ? "Retirer du portefeuille" : "Ajouter au portefeuille"}
                    >
                        {isInWallet ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    {canDelete && (
                        <button onClick={() => deleteCard(card)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                {/* Header with counts */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold">iCarte</h1>
                        <p className="text-sm text-muted-foreground">Gérez vos cartes numériques</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Counts badges */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className={cn("px-2 py-1 rounded-full flex items-center gap-1", counts.president >= LIMITS.PRESIDENT_ASSOCIATIONS ? "bg-amber-500/20 text-amber-500" : "bg-purple-500/20 text-purple-500")}>
                                <Users className="w-3 h-3" /> {counts.president}/{LIMITS.PRESIDENT_ASSOCIATIONS}
                            </span>
                            <span className={cn("px-2 py-1 rounded-full flex items-center gap-1", counts.enterprise >= LIMITS.ENTERPRISES ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500")}>
                                <Briefcase className="w-3 h-3" /> {counts.enterprise}/{LIMITS.ENTERPRISES}
                            </span>
                            <span className={cn("px-2 py-1 rounded-full flex items-center gap-1", counts.custom >= LIMITS.CUSTOM ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500")}>
                                <Palette className="w-3 h-3" /> {counts.custom}/{LIMITS.CUSTOM}
                            </span>
                        </div>
                        <button onClick={() => navigate('/dashboard/citizen')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-primary/30">
                            <Wallet className="w-4 h-4" /> iProfil <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main content - 2 columns */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                    {/* Left: Wallet */}
                    <div className="glass-card rounded-xl p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-primary" />
                                <p className="font-semibold">Mon Portefeuille</p>
                            </div>
                            <span className={cn("text-xs px-2 py-1 rounded-full", counts.wallet >= LIMITS.WALLET ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground")}>
                                {counts.wallet}/{LIMITS.WALLET}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Cartes affichées dans votre iProfil</p>

                        <div className="flex-1 overflow-auto">
                            {walletCards.length > 0 ? (
                                <Reorder.Group axis="y" values={walletCardIds} onReorder={setWalletCardIds} className="space-y-2">
                                    {walletCards.map(card => (
                                        <Reorder.Item key={card.id} value={card.id} className="cursor-grab active:cursor-grabbing">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div className={cn("w-14 h-9 rounded-lg flex items-center justify-center", card.gradient)}>
                                                    <card.icon className={cn("w-4 h-4", card.data?.textColor ? card.data.textColor : "text-white")} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{card.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
                                                </div>
                                                <button onClick={() => toggleWallet(card.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CreditCard className="w-12 h-12 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">Aucune carte dans le portefeuille</p>
                                    <p className="text-xs text-muted-foreground mt-1">Ajoutez des cartes depuis la liste à droite</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Card sections */}
                    <div className="glass-card rounded-xl p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold">Toutes vos cartes</p>
                        </div>

                        <div className="flex-1 overflow-auto space-y-4">
                            {/* Section: President Associations */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    <p className="text-xs font-semibold text-purple-500 uppercase">Associations que vous gérez</p>
                                    <span className="text-xs text-muted-foreground">({counts.president}/{LIMITS.PRESIDENT_ASSOCIATIONS})</span>
                                </div>
                                <div className="space-y-2">
                                    {presidentCards.map(card => (
                                        <CardRow key={card.id} card={card} canCustomize />
                                    ))}
                                    {presidentCards.length === 0 && (
                                        <p className="text-xs text-muted-foreground py-2">Aucune association créée</p>
                                    )}
                                </div>
                            </div>

                            {/* Section: Member Associations */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-rose-500" />
                                    <p className="text-xs font-semibold text-rose-500 uppercase">Associations où vous êtes membre</p>
                                </div>
                                <div className="space-y-2">
                                    {memberCards.map(card => (
                                        <CardRow key={card.id} card={card} />
                                    ))}
                                    {memberCards.length === 0 && (
                                        <p className="text-xs text-muted-foreground py-2">Aucune adhésion</p>
                                    )}
                                </div>
                            </div>

                            {/* Section: Enterprise Cards */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                        <p className="text-xs font-semibold text-blue-500 uppercase">Cartes Entreprises</p>
                                        <span className="text-xs text-muted-foreground">({counts.enterprise}/{LIMITS.ENTERPRISES})</span>
                                    </div>
                                    {counts.enterprise < LIMITS.ENTERPRISES && (
                                        <button onClick={() => setShowCreateModal('enterprise')} className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                                            <Plus className="w-3 h-3" /> Créer
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {enterpriseCards.map(card => (
                                        <CardRow key={card.id} card={card} canDelete canCustomize />
                                    ))}
                                    {enterpriseCards.length === 0 && (
                                        <p className="text-xs text-muted-foreground py-2">Aucune carte entreprise</p>
                                    )}
                                </div>
                            </div>

                            {/* Section: Custom Cards */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-green-500" />
                                        <p className="text-xs font-semibold text-green-500 uppercase">Cartes Personnalisées</p>
                                        <span className="text-xs text-muted-foreground">({counts.custom}/{LIMITS.CUSTOM})</span>
                                    </div>
                                    {counts.custom < LIMITS.CUSTOM && (
                                        <button onClick={() => setShowCreateModal('custom')} className="flex items-center gap-1 text-xs text-green-500 hover:underline">
                                            <Plus className="w-3 h-3" /> Créer
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {customCards.map(card => (
                                        <CardRow key={card.id} card={card} canDelete />
                                    ))}
                                    {customCards.length === 0 && (
                                        <p className="text-xs text-muted-foreground py-2">Aucune carte personnalisée</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customize Modal */}
            <AnimatePresence>
                {showCustomizeModal && editingCard && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCustomizeModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card rounded-2xl p-6 w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Personnaliser la carte</h3>
                                <button onClick={() => setShowCustomizeModal(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Live Preview & Save */}
                                <div className="space-y-6">
                                    <div className={cn("w-full aspect-[1.6/1] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl skew-y-1 transition-transform duration-500 hover:skew-y-0", selectedTheme.background)}>
                                        {selectedTheme.borderColor && <div className={cn("absolute inset-0 border-[3px] rounded-xl pointer-events-none", selectedTheme.borderColor)} />}
                                        {/* Top row */}
                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="flex items-center gap-0">
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt="Logo" className="h-14 w-auto max-w-[140px] object-contain drop-shadow-lg" />
                                                ) : (
                                                    <div className="p-3 rounded-lg bg-white/20 backdrop-blur-md"><editingCard.icon className={cn("w-6 h-6", selectedTheme.textColor || "text-white")} /></div>
                                                )}
                                                <div>
                                                    <span className={cn("text-xs font-bold uppercase tracking-wider opacity-90", selectedTheme.textColor ? selectedTheme.textColor : "text-white")}>{editingCard.type === 'enterprise' ? 'Carte Entreprise' : editingCard.subtitle || 'Carte Membre'}</span>
                                                    <p className={cn("font-extrabold text-xl tracking-tight", selectedTheme.textColor ? selectedTheme.textColor : "text-white")}>{editingCard.name}</p>
                                                </div>
                                            </div>
                                            {showQrCode && (
                                                <div className="p-2 rounded-xl bg-white/90 shadow-lg">
                                                    <QrCode className="w-10 h-10 text-slate-900" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Bottom row */}
                                        <div className="flex items-end justify-between relative z-10">
                                            {showPhoto && (
                                                <div className="w-14 h-14 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                                    <UserCircle className={cn("w-8 h-8", selectedTheme.textColor || "text-white")} />
                                                </div>
                                            )}
                                            <div className="text-right">
                                                <p className={cn("text-xs font-medium uppercase tracking-wide", selectedTheme.textColor ? `${selectedTheme.textColor} opacity-80` : "text-white/80")}>{editingCard.type === 'enterprise' ? 'Poste' : 'Nom du Membre'}</p>
                                                <p className={cn("font-bold text-lg", selectedTheme.textColor ? selectedTheme.textColor : "text-white")}>{editingCard.type === 'enterprise' ? editingCard.subtitle : (editingCard.data?.role === 'PRÉSIDENT' ? 'Président' : 'Membre')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block pt-4">
                                        <Button onClick={saveCustomization} className="w-full h-12 text-base shadow-lg hover:shadow-primary/20"><Check className="w-5 h-5 mr-2" /> Enregistrer le design</Button>
                                    </div>
                                </div>

                                {/* Right Column: Options */}
                                <div className="space-y-8">
                                    {/* Logo Upload */}
                                    <div className="bg-muted/30 p-4 rounded-xl border border-white/5">
                                        <p className="text-sm font-semibold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> {editingCard.type === 'enterprise' ? "Identité Visuelle" : "Logo Association"}</p>
                                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => logoInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-medium text-sm">
                                                <Upload className="w-4 h-4" /> {logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
                                            </button>
                                            {logoUrl && (
                                                <button onClick={() => setLogoUrl(null)} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Themes */}
                                    <div>
                                        <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Thèmes Premium</p>
                                        <div className="grid grid-cols-4 gap-3">
                                            {availableThemes.filter(t => t.isPremium).map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setSelectedTheme(t)}
                                                    className={cn(
                                                        "aspect-square rounded-xl transition-all flex flex-col items-center justify-center gap-1 border-2 relative overflow-hidden group",
                                                        t.background,
                                                        selectedTheme.id === t.id ? "border-white ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                                                    )}
                                                    title={t.name}
                                                >
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider z-10", t.textColor || "text-white")}>{t.name.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Standard Colors */}
                                    <div>
                                        <p className="text-sm font-semibold mb-3">Couleurs Standard</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {availableThemes.filter(t => !t.isPremium).map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setSelectedTheme(t)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full transition-all hover:scale-110",
                                                        t.background,
                                                        selectedTheme.id === t.id && "ring-2 ring-white ring-offset-2 ring-offset-background"
                                                    )}
                                                    title={t.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex items-center gap-6 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={cn("w-10 h-6 rounded-full p-1 transition-colors duration-200", showPhoto ? "bg-primary" : "bg-muted")}>
                                                <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", showPhoto ? "translate-x-4" : "translate-x-0")} />
                                            </div>
                                            <input type="checkbox" checked={showPhoto} onChange={(e) => setShowPhoto(e.target.checked)} className="hidden" />
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">Photo</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={cn("w-10 h-6 rounded-full p-1 transition-colors duration-200", showQrCode ? "bg-primary" : "bg-muted")}>
                                                <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", showQrCode ? "translate-x-4" : "translate-x-0")} />
                                            </div>
                                            <input type="checkbox" checked={showQrCode} onChange={(e) => setShowQrCode(e.target.checked)} className="hidden" />
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">QR Code</span>
                                        </label>
                                    </div>

                                    <div className="block md:hidden pt-4">
                                        <Button onClick={saveCustomization} className="w-full h-12 text-base shadow-lg"><Check className="w-5 h-5 mr-2" /> Enregistrer</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">{showCreateModal === 'enterprise' ? 'Nouvelle carte entreprise' : 'Nouvelle carte personnalisée'}</h3>
                                <button onClick={() => setShowCreateModal(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-3 mb-4">
                                {showCreateModal === 'enterprise' ? (
                                    <>
                                        <Input placeholder="Nom de l'entreprise" value={newCardForm.entreprise} onChange={e => setNewCardForm({ ...newCardForm, entreprise: e.target.value })} />
                                        <Input placeholder="Poste / Fonction" value={newCardForm.poste} onChange={e => setNewCardForm({ ...newCardForm, poste: e.target.value })} />
                                        <Input placeholder="Email professionnel" value={newCardForm.email} onChange={e => setNewCardForm({ ...newCardForm, email: e.target.value })} />
                                        <Input placeholder="Téléphone" value={newCardForm.telephone} onChange={e => setNewCardForm({ ...newCardForm, telephone: e.target.value })} />
                                    </>
                                ) : (
                                    <>
                                        <Input placeholder="Nom de la carte" value={newCardForm.name} onChange={e => setNewCardForm({ ...newCardForm, name: e.target.value })} />
                                        <Input placeholder="Sous-titre" value={newCardForm.subtitle} onChange={e => setNewCardForm({ ...newCardForm, subtitle: e.target.value })} />
                                    </>
                                )}
                            </div>

                            {/* Color picker */}
                            <p className="text-sm font-medium mb-2">Couleur</p>
                            <div className="flex gap-2 flex-wrap mb-6">
                                {availableThemes.filter(t => !t.isPremium).map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTheme(t)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg transition-all",
                                            t.background,
                                            selectedTheme.id === t.id && "ring-2 ring-white ring-offset-2 ring-offset-background"
                                        )}
                                    />
                                ))}
                            </div>

                            <Button onClick={showCreateModal === 'enterprise' ? createEnterpriseCard : createCustomCard} className="w-full">
                                <Plus className="w-4 h-4 mr-2" /> Créer la carte
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ICartePage;
