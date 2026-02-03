import { ConsularService } from "@/types/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, Plane, FileText, Users, Stamp, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Category icon and color mapping
const categoryStyles: Record<string, { icon: typeof ShieldCheck; bgColor: string; iconColor: string }> = {
    ASSISTANCE: { icon: Heart, bgColor: "bg-red-500/10", iconColor: "text-red-500" },
    PASSPORT: { icon: Plane, bgColor: "bg-blue-500/10", iconColor: "text-blue-500" },
    VISA: { icon: Stamp, bgColor: "bg-amber-500/10", iconColor: "text-amber-500" },
    ETAT_CIVIL: { icon: Users, bgColor: "bg-green-500/10", iconColor: "text-green-500" },
    ADMINISTRATIF: { icon: FileText, bgColor: "bg-purple-500/10", iconColor: "text-purple-500" },
};

interface PublicServiceCardProps {
    service: ConsularService;
    className?: string;
    onRegisterClick?: () => void;
}

export function PublicServiceCard({ service, className, onRegisterClick }: PublicServiceCardProps) {
    const style = categoryStyles[service.category] || { icon: ShieldCheck, bgColor: "bg-slate-500/10", iconColor: "text-slate-500" };
    const IconComponent = style.icon;

    return (
        <div className={cn(
            "glass-card p-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group",
            className
        )}>
            <div className="flex gap-4">
                {/* Icon - Left side */}
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    style.bgColor
                )}>
                    <IconComponent className={cn("w-6 h-6", style.iconColor)} />
                </div>

                {/* Content - Right side */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {service.name}
                        </h3>
                        <Badge variant="outline" className="text-[10px] shrink-0 px-1.5 py-0">
                            {service.category.replace('_', ' ')}
                        </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {service.description}
                    </p>

                    <div className="flex items-center justify-between">
                        {service.price !== undefined && (
                            <span className="text-sm font-semibold text-primary">
                                {service.price === 0 ? 'Gratuit' : `${service.price} ${service.currency || 'EUR'}`}
                            </span>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1 ml-auto group-hover:bg-primary group-hover:text-white"
                            onClick={onRegisterClick}
                        >
                            Obtenir
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
