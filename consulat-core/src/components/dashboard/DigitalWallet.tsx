import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard,
    Bus,
    Heart,
    Car,
    Briefcase,
    RotateCcw,
    ArrowLeft,
    Share2,
    CreditCard as PayIcon,
    Printer,
    QrCode,
    Download,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateCNAMGSPdf } from "@/utils/cnamgs-pdf-generator";
import { MiniCNAMGSCard } from "@/components/health/MiniCNAMGSCard";
import { ConsularCard } from "@/components/consular/ConsularCard";
import { Globe } from "lucide-react";


interface CardAction {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}

export interface WalletCard {
    id: string;
    type: "cni" | "transport" | "bank" | "business" | "driving" | "health" | "consular" | "voter" | "loyalty" | "custom" | "association" | "enterprise";
    name: string;
    subtitle?: string;
    icon: React.ElementType;
    gradient: string;
    data: Record<string, string>;
    backData?: Record<string, string>;
    actions?: CardAction[];
    isAutoAssigned?: boolean; // True for cards auto-assigned from memberships (cannot be deleted)
}

// Cards for consular context - Consulaire is always present, others are addable
export const defaultCards: WalletCard[] = [
    {
        id: "consular",
        type: "consular",
        name: "Carte Consulaire",
        subtitle: "République Gabonaise",
        icon: Globe,
        gradient: "from-primary via-primary/90 to-emerald-700",
        data: { numero: "GAB-2024-123456", nip: "1234", validite: "01/2029" },
        backData: { consulat: "Paris, France", zone: "Île-de-France" },
        actions: [
            { icon: QrCode, label: "QR Code", onClick: () => console.log("QR Consular") },
            { icon: Download, label: "Télécharger", onClick: () => console.log("Download Consular") }
        ]
    }
];

interface CompactWalletProps {
    cards?: WalletCard[];
    onCardClick?: (cardId: string) => void;
}

export default function CompactWallet({ cards = defaultCards, onCardClick }: CompactWalletProps) {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Maximum 7 cards displayed, last one fully visible
    const MAX_CARDS = 7;
    const displayCards = cards.slice(0, MAX_CARDS);
    const hasMoreCards = cards.length > MAX_CARDS;

    const handleCardClick = (cardId: string) => {
        if (selectedCard === cardId) {
            setIsFlipped(!isFlipped);
        } else {
            setSelectedCard(cardId);
            setIsFlipped(false);
            onCardClick?.(cardId);
        }
    };

    const handleBack = () => {
        setSelectedCard(null);
        setIsFlipped(false);
    };

    // Card overlap offset - like real Apple Wallet
    // Each card shows its header (name + icon) before being covered by the next
    const CARD_OVERLAP = 44; // Offset to show full card header with icon and text
    const CARD_HEIGHT = 56; // Height of each card in stacked view
    const selectedCardData = selectedCard ? displayCards.find(c => c.id === selectedCard) : null;

    // Calculate total stack height - last card fully visible
    const stackHeight = CARD_HEIGHT + (displayCards.length - 1) * CARD_OVERLAP;

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Header with back button when card selected */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between mb-3 shrink-0"
                    >
                        <button
                            onClick={handleBack}
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </button>
                        <span className="text-xs text-muted-foreground">
                            Cliquez pour retourner
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Stack - Apple Wallet Style */}
            <div className="relative flex-1" style={{ minHeight: selectedCard ? 120 : stackHeight }}>
                <AnimatePresence>
                    {displayCards.map((card, index) => {
                        const isSelected = selectedCard === card.id;

                        // Apple Wallet style: each card is offset by CARD_OVERLAP
                        // Bottom cards are in front (higher z-index for higher index)
                        const stackPosition = index * CARD_OVERLAP;
                        const zIndex = isSelected ? 100 : (index + 1);

                        // When a card is selected, hide others
                        if (selectedCard && !isSelected) {
                            return null;
                        }

                        // Selected card - Full size 85x55 format
                        // For health cards, use the SVG-based card and navigate to dedicated page
                        if (isSelected && card.type === "health") {
                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ y: stackPosition }}
                                    animate={{ y: 0 }}
                                    onClick={() => navigate("/health/cnamgs")}
                                    className="absolute left-0 right-0 top-0 cursor-pointer"
                                    style={{ zIndex: 100 }}
                                >
                                    <MiniCNAMGSCard className="w-full shadow-xl" />
                                </motion.div>
                            );
                        }

                        // For consular cards, navigate to dedicated page
                        if (isSelected && card.type === "consular") {
                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ y: stackPosition }}
                                    animate={{ y: 0 }}
                                    onClick={() => navigate("/consular")}
                                    className="absolute left-0 right-0 top-0 cursor-pointer"
                                    style={{ zIndex: 100 }}
                                >
                                    <ConsularCard variant="mini" className="w-full shadow-xl" />
                                </motion.div>
                            );
                        }

                        // Selected card - Other card types with flip animation
                        if (isSelected) {
                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ y: stackPosition }}
                                    animate={{ y: 0 }}
                                    onClick={() => handleCardClick(card.id)}
                                    className="absolute left-0 right-0 top-0 cursor-pointer"
                                    style={{ zIndex: 100, perspective: "1000px" }}
                                >
                                    <motion.div
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                        style={{
                                            transformStyle: "preserve-3d",
                                            aspectRatio: "85 / 55"
                                        }}
                                        className={cn(
                                            "rounded-xl text-white relative overflow-hidden w-full shadow-xl",
                                            `bg-gradient-to-br ${card.gradient}`
                                        )}
                                    >
                                        {/* Front */}
                                        <div
                                            className="absolute inset-0 p-3"
                                            style={{ backfaceVisibility: "hidden" }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    {card.type === "cni" ? (
                                                        <img src={sceauGabon} alt="" className="h-6 w-6 object-contain" />
                                                    ) : (
                                                        <div className="p-1.5 rounded-lg bg-white/20">
                                                            <card.icon className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-xs">{card.name}</p>
                                                        <p className="text-[9px] opacity-70">{card.subtitle}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                                                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="mt-2 space-y-0.5">
                                                {Object.entries(card.data).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-[10px] uppercase opacity-60">{key}</span>
                                                        <span className={cn("font-medium text-xs", key === "numero" && "font-mono")}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 p-3"
                                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-xs">Verso</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                                                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {card.backData && (
                                                <div className="mt-2 space-y-0.5">
                                                    {Object.entries(card.backData).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-[10px] uppercase opacity-60">{key}</span>
                                                            <span className="font-medium text-xs">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl" />
                                    </motion.div>
                                </motion.div>
                            );
                        }

                        // Stacked cards - Full card visible, overlapping like Apple Wallet
                        // For health cards, use the SVG-based MiniCNAMGSCard
                        if (card.type === "health") {
                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleCardClick(card.id)}
                                    className="absolute left-0 right-0 cursor-pointer"
                                    style={{
                                        zIndex,
                                        top: stackPosition
                                    }}
                                >
                                    <MiniCNAMGSCard className="w-full" />
                                </motion.div>
                            );
                        }

                        // For consular cards, use the MiniConsularCard
                        if (card.type === "consular") {
                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleCardClick(card.id)}
                                    className="absolute left-0 right-0 cursor-pointer"
                                    style={{
                                        zIndex,
                                        top: stackPosition
                                    }}
                                >
                                    <ConsularCard variant="mini" className="w-full" />
                                </motion.div>
                            );
                        }

                        // Other cards - gradient style
                        return (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleCardClick(card.id)}
                                className="absolute left-0 right-0 cursor-pointer"
                                style={{
                                    zIndex,
                                    top: stackPosition
                                }}
                            >
                                <div
                                    style={{ aspectRatio: "85 / 55" }}
                                    className={cn(
                                        "rounded-xl text-white px-3 py-2.5 shadow-lg w-full",
                                        `bg-gradient-to-br ${card.gradient}`,
                                        "hover:shadow-xl transition-shadow",
                                        "border border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {card.type === "cni" ? (
                                            <img src={sceauGabon} alt="" className="h-5 w-5 object-contain" />
                                        ) : (
                                            <div className="p-1 rounded-lg bg-white/20">
                                                <card.icon className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-sm leading-tight">{card.name}</p>
                                            <p className="text-[10px] opacity-70">{card.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action Buttons - only when card is selected */}
            <AnimatePresence>
                {selectedCardData?.actions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-2 grid grid-cols-2 gap-1.5 shrink-0"
                    >
                        {selectedCardData.actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 py-2 rounded-lg",
                                    "bg-slate-100/50 dark:bg-white/10",
                                    "hover:bg-slate-200/50 dark:hover:bg-white/15",
                                    "text-[10px] font-medium text-foreground",
                                    "transition-colors"
                                )}
                            >
                                <action.icon className="w-3 h-3" />
                                {action.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* "See more" link when there are more cards */}
            {hasMoreCards && !selectedCard && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate("/icarte")}
                    className={cn(
                        "mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg",
                        "bg-slate-100/80 dark:bg-white/10",
                        "hover:bg-slate-200/80 dark:hover:bg-white/15",
                        "text-sm font-medium text-primary",
                        "transition-colors"
                    )}
                >
                    Voir toutes les cartes ({cards.length})
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            )}
        </div>
    );
}
