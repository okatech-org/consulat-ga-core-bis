import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, FileText, Users, Shield, Stamp, Plane, SlidersHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { PublicServiceCard } from "@/components/services/PublicServiceCard";
import { MOCK_SERVICES } from "@/data/mock-services";
import { cn } from "@/lib/utils";
import { useThemeStyle } from "@/context/ThemeStyleContext";

// Category configuration with icons and labels
const CATEGORIES = [
    { id: "ALL", label: "Tous", icon: SlidersHorizontal },
    { id: "PASSPORT", label: "Passeports", icon: FileText },
    { id: "VISA", label: "Visas", icon: Plane },
    { id: "ETAT_CIVIL", label: "État Civil", icon: Users },
    { id: "ADMINISTRATIF", label: "Administratif", icon: Stamp },
    { id: "ASSISTANCE", label: "Assistance", icon: Shield },
];

export default function CitizenServicesPage() {
    const navigate = useNavigate();
    const { userSpaceTheme } = useThemeStyle();
    const isIDN = userSpaceTheme === 'idn';

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    // Intelligent search
    const filteredServices = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return MOCK_SERVICES.filter((service) => {
            const matchesCategory = selectedCategory === "ALL" || service.category === selectedCategory;
            const matchesSearch = !query ||
                service.name.toLowerCase().includes(query) ||
                service.description?.toLowerCase().includes(query) ||
                service.requirements?.some(req => req.toLowerCase().includes(query)) ||
                service.category?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const handleClearSearch = () => {
        setSearchQuery("");
        setSelectedCategory("ALL");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 text-muted-foreground"
                        onClick={() => navigate('/dashboard/citizen')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au tableau de bord
                    </Button>
                    <h1 className="text-2xl font-bold">Services & Démarches</h1>
                    <p className="text-muted-foreground">Découvrez et initiez vos démarches consulaires</p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate('/dashboard/citizen/timeline')}
                >
                    Suivre mes demandes
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Search Bar */}
            <div className={cn("p-4 rounded-xl", isIDN ? "glass-card" : "bg-card border")}>
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher un service, document ou démarche..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-12 pr-12 py-3 rounded-xl border outline-none transition-all text-sm",
                            isIDN
                                ? "bg-white/50 dark:bg-black/20 border-white/30 focus:border-primary"
                                : "bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        const count = cat.id === "ALL"
                            ? MOCK_SERVICES.length
                            : MOCK_SERVICES.filter(s => s.category === cat.id).length;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : isIDN
                                            ? "bg-white/30 dark:bg-black/20 hover:bg-white/50 text-muted-foreground hover:text-foreground"
                                            : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{cat.label}</span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "ml-1 h-4 min-w-4 flex items-center justify-center text-[10px]",
                                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : ""
                                    )}
                                >
                                    {count}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredServices.length}</span>
                    {" "}service{filteredServices.length > 1 ? "s" : ""} disponible{filteredServices.length > 1 ? "s" : ""}
                    {searchQuery && (
                        <span className="ml-1">
                            pour "<span className="text-primary font-medium">{searchQuery}</span>"
                        </span>
                    )}
                </p>
                {(searchQuery || selectedCategory !== "ALL") && (
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        <X className="h-4 w-4" /> Réinitialiser
                    </button>
                )}
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <PublicServiceCard
                            key={service.id}
                            service={service}
                            className="h-full"
                            onRegisterClick={() => navigate(`/services/${service.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className={cn("text-center py-12 rounded-xl", isIDN ? "glass-card" : "bg-muted/30")}>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Aucun service trouvé</h3>
                    <p className="text-muted-foreground mb-4">
                        Aucun service ne correspond à "{searchQuery}"
                    </p>
                    <Button onClick={handleClearSearch}>Voir tous les services</Button>
                </div>
            )}
        </div>
    );
}
