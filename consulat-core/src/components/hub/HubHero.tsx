import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HubHeroProps {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    ctaText?: string;
    onCtaClick?: () => void;
    align?: "left" | "center";
}

export function HubHero({
    title,
    subtitle,
    backgroundImage = "/lovable-uploads/gabon-hero.jpg", // Default placeholder
    ctaText,
    onCtaClick,
    align = "center"
}: HubHeroProps) {
    return (
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className={`relative z-10 container px-4 mx-auto ${align === "center" ? "text-center" : "text-left"}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>

                    {ctaText && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                onClick={onCtaClick}
                                className="bg-gradient-apple hover:opacity-90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                {ctaText}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
