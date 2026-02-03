import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HubHero } from "@/components/hub/HubHero";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, FileText, Users, Shield, Stamp, Plane, SlidersHorizontal } from "lucide-react";

import heroConsulat from "@/assets/hero-consulat.jpg";
import { PublicServiceCard } from "@/components/services/PublicServiceCard";
import { MOCK_SERVICES } from "@/data/mock-services";
import { cn } from "@/lib/utils";

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Category configuration with icons and labels
const CATEGORIES = [
  { id: "ALL", label: "Tous", icon: SlidersHorizontal },
  { id: "PASSPORT", label: "Passeports", icon: FileText },
  { id: "VISA", label: "Visas", icon: Plane },
  { id: "ETAT_CIVIL", label: "État Civil", icon: Users },
  { id: "ADMINISTRATIF", label: "Administratif", icon: Stamp },
  { id: "ASSISTANCE", label: "Assistance", icon: Shield },
];

export default function ServicesConsulaires() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Intelligent search: filters by name, description, requirements, and category
  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return MOCK_SERVICES.filter((service) => {
      // Category filter
      const matchesCategory = selectedCategory === "ALL" || service.category === selectedCategory;

      // Search filter (name, description, requirements)
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
    <div className="min-h-screen flex flex-col bg-gradient-official dark:bg-none dark:bg-background">
      <main className="flex-grow">
        <HubHero
          title="Services Consulaires"
          subtitle="Découvrez l'ensemble des services proposés par les représentations diplomatiques du Gabon à l'étranger."
          backgroundImage={heroConsulat}
          ctaText="Prendre rendez-vous"
          onCtaClick={() => navigate('/login')}
        />

        {/* Search & Filter Section */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un service, document ou démarche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-12 text-base bg-card border-border/50 rounded-xl shadow-sm focus-visible:ring-primary/50"
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
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-1 h-5 min-w-5 flex items-center justify-center text-xs",
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted"
                        )}
                      >
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count & Grid */}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
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
                  <X className="h-4 w-4" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Services Grid with AnimatePresence */}
            <AnimatePresence mode="wait">
              {filteredServices.length > 0 ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="h-full"
                    >
                      <PublicServiceCard
                        service={service}
                        className="h-full hover:-translate-y-1 hover:shadow-elevation transition-all duration-300"
                        onRegisterClick={() => navigate('/login')}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Aucun service trouvé</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Aucun service ne correspond à votre recherche "{searchQuery}".
                    Essayez avec d'autres termes ou parcourez les catégories.
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Voir tous les services
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
