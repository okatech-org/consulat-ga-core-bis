import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISuggestionCardProps {
    title: string;
    description: string;
    impact: string;
    onApply: () => void;
}

const AISuggestionCard = ({ title, description, impact, onApply }: AISuggestionCardProps) => {
    return (
        <div className="neu-raised p-4 rounded-xl border-l-4 border-green-500 flex flex-col space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={48} className="text-green-500" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Suggestion IA</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    {impact}
                </span>
            </div>

            <div className="relative z-10">
                <h4 className="font-bold text-foreground text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>

            <Button
                onClick={onApply}
                variant="ghost"
                size="sm"
                className="self-start text-primary hover:text-primary/80 p-0 h-auto text-xs font-bold flex items-center mt-2 group-hover:translate-x-1 transition-transform"
            >
                Appliquer maintenant <ArrowRight size={12} className="ml-1" />
            </Button>
        </div>
    );
};

export default AISuggestionCard;
