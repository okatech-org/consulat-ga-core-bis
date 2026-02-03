import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ConsularCardProps {
    profile?: {
        full_name?: string;
        first_name?: string;
        last_name?: string;
        birth_date?: string;
        photo_url?: string;
        consular_number?: string;
        consular_pin?: string;
        issued_date?: string;
        expires_date?: string;
    };
    className?: string;
    /** Display variant: "full" shows complete card with flip, "mini" shows compact version */
    variant?: "full" | "mini";
    onClick?: () => void;
}

// Card template URLs from Convex storage (consulat project)
const CARD_RECTO_URL = "https://greedy-horse-339.convex.cloud/api/storage/91438165-c30d-4aab-91e0-0a8e5806c1ec";
const CARD_VERSO_URL = "https://greedy-horse-339.convex.cloud/api/storage/1423b4ef-2701-46ef-ac6f-10d759e61c09";

// Shared positioning constants - SINGLE SOURCE OF TRUTH
const PHOTO_POSITION = {
    left: "12.83%",
    top: "32.38%",
    width: "27%",
};

/**
 * Consular Card Component for IDN.GA
 * Displays the user's consular card with front/back flip functionality
 * Supports "full" and "mini" variants for different display contexts
 */
export const ConsularCard = ({ profile, className, variant = "full", onClick }: ConsularCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [imageLoaded, setImageLoaded] = useState({ recto: false, verso: false });
    const [imageError, setImageError] = useState(false);

    const handleFlip = () => {
        if (variant === "full") {
            setIsFlipped(!isFlipped);
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (variant === "full") {
            handleFlip();
        }
    };

    const handleExportPDF = async () => {
        toast.info("Génération du PDF de la carte consulaire...");
        try {
            // TODO: Implement PDF generation similar to CNAMGS
            toast.success("Fonctionnalité PDF en développement");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Erreur lors de la génération du PDF");
        }
    };

    // Default mock data
    const cardData = {
        lastName: profile?.last_name || "DUPONT",
        firstName: profile?.first_name || "Jean Marie",
        cardNumber: profile?.consular_number || "GAB-2024-123456",
        cardPin: profile?.consular_pin || "1234",
        issuedDate: profile?.issued_date || "01/01/2024",
        expiresDate: profile?.expires_date || "01/01/2029",
        photoUrl: profile?.photo_url,
    };

    // Mini variant - compact card for wallet display
    if (variant === "mini") {
        return (
            <div
                onClick={handleClick}
                className={cn(
                    "rounded-xl overflow-hidden shadow-lg cursor-pointer",
                    "hover:shadow-xl transition-shadow",
                    "border border-slate-200",
                    "bg-[#f5f5f5]",
                    "relative",
                    className
                )}
                style={{ aspectRatio: "85 / 55" }}
            >
                {!imageError ? (
                    <>
                        <img
                            src={CARD_RECTO_URL}
                            alt="Carte consulaire"
                            className="w-full h-full object-cover"
                            onLoad={() => setImageLoaded(prev => ({ ...prev, recto: true }))}
                            onError={() => setImageError(true)}
                        />

                        {/* Photo placeholder - using shared positioning constants */}
                        <div
                            className="absolute"
                            style={{
                                left: PHOTO_POSITION.left,
                                top: PHOTO_POSITION.top,
                                width: PHOTO_POSITION.width,
                            }}
                        >
                            {cardData.photoUrl ? (
                                <div className="relative w-full aspect-square rounded-full overflow-hidden">
                                    <img
                                        src={cardData.photoUrl}
                                        alt="Photo identité"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-square rounded-full bg-gray-200/90 flex items-center justify-center">
                                    <span className="text-gray-400 text-[5px]">Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Card number - positioned below photo */}
                        <div className="absolute left-[6%] bottom-[5%] w-[40%] text-center">
                            <p className="text-[5px] sm:text-[6px] text-[#AB7E07] font-bold">
                                {cardData.cardNumber}
                            </p>
                        </div>
                    </>
                ) : (
                    // Fallback if image fails to load
                    <div className="w-full h-full bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-800 flex flex-col justify-center items-center p-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-3 bg-white/30 rounded-sm" />
                            <div>
                                <p className="text-[8px] font-bold text-white">Carte Consulaire</p>
                                <p className="text-[6px] text-white/70">République Gabonaise</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full variant - complete card with flip and actions
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-4">
                {/* Card Preview with flip */}
                <div
                    className="relative w-full cursor-pointer mb-4"
                    onClick={handleClick}
                    style={{ perspective: "1000px" }}
                >
                    <div
                        className={cn(
                            "relative w-full transition-transform duration-500",
                            isFlipped && "[transform:rotateY(180deg)]"
                        )}
                        style={{ transformStyle: "preserve-3d", aspectRatio: "1.60 / 1" }}
                    >
                        {/* Front (Recto) */}
                        <div
                            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <img
                                src={CARD_RECTO_URL}
                                alt="Carte consulaire recto"
                                className="w-full h-full object-cover"
                                onLoad={() => setImageLoaded(prev => ({ ...prev, recto: true }))}
                            />

                            {/* Photo overlay - using shared positioning constants */}
                            <div
                                className="absolute"
                                style={{
                                    left: PHOTO_POSITION.left,
                                    top: PHOTO_POSITION.top,
                                    width: PHOTO_POSITION.width,
                                }}
                            >
                                {cardData.photoUrl ? (
                                    <div className="relative w-full aspect-square rounded-full overflow-hidden">
                                        <img
                                            src={cardData.photoUrl}
                                            alt="Photo identité"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full aspect-square rounded-full bg-gray-200/90 flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">Photo</span>
                                    </div>
                                )}
                            </div>

                            {/* Card number and PIN - positioned below photo */}
                            <div className="absolute left-[6%] bottom-[5%] w-[40%] text-center">
                                <p className="text-[0.65em] sm:text-[0.8em] text-[#AB7E07] font-bold">
                                    {cardData.cardNumber}
                                </p>
                                <p className="text-[0.55em] sm:text-[0.65em] font-medium text-[#E94F69]">
                                    NIP: {cardData.cardPin}
                                </p>
                            </div>

                            {/* Name overlay */}
                            <div className="absolute right-0 top-0 px-1 h-full w-[56.5%] flex flex-col justify-center items-start">
                                <p className="text-[0.7em] sm:text-[0.9em] text-[#383838] font-extrabold -translate-y-[70%]">
                                    <span className="uppercase">{cardData.lastName}</span>
                                    <br />
                                    <span className="text-[0.85em]">{cardData.firstName}</span>
                                </p>
                            </div>

                            {/* Dates overlay */}
                            <div className="absolute right-0 top-0 px-1 h-full w-[37%] pt-[3%] flex flex-col justify-center items-start">
                                <p className="text-[0.45em] sm:text-[0.7em] text-[#383838] font-bold -translate-x-[10%]">
                                    {cardData.issuedDate}
                                </p>
                                <p className="text-[0.45em] sm:text-[0.7em] text-[#383838] font-bold">
                                    {cardData.expiresDate}
                                </p>
                            </div>

                            {/* Flip indicator */}
                            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20">
                                <RotateCcw className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        {/* Back (Verso) */}
                        <div
                            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                            <img
                                src={CARD_VERSO_URL}
                                alt="Carte consulaire verso"
                                className="w-full h-full object-cover"
                                onLoad={() => setImageLoaded(prev => ({ ...prev, verso: true }))}
                            />

                            {/* Flip indicator */}
                            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20">
                                <RotateCcw className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <p className="text-xs text-center text-muted-foreground mb-3">
                    Cliquez sur la carte pour la retourner
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleExportPDF}
                        className="flex-1"
                        size="sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger PDF
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
