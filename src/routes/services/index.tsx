import { api } from "@convex/_generated/api";
import { ServiceCategory } from "@convex/lib/constants";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  FileCheck,
  FileText,
  Globe,
  type LucideIcon,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ServiceCard } from "@/components/home/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

const servicesSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
  validateSearch: (search) => servicesSearchSchema.parse(search),
});

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

// Category configuration with icons, colors, and labels
const CATEGORIES: {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}[] = [
  {
    id: "ALL",
    labelKey: "services.allCategories",
    icon: SlidersHorizontal,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-500/10",
  },
  {
    id: ServiceCategory.Passport,
    labelKey: "services.categoriesMap.passport",
    icon: BookOpenCheck,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: ServiceCategory.Visa,
    labelKey: "services.categoriesMap.visa",
    icon: Globe,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    id: ServiceCategory.CivilStatus,
    labelKey: "services.categoriesMap.civil_status",
    icon: FileText,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: ServiceCategory.Registration,
    labelKey: "services.categoriesMap.registration",
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    id: ServiceCategory.Certification,
    labelKey: "services.categoriesMap.legalization",
    icon: FileCheck,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    id: ServiceCategory.Assistance,
    labelKey: "services.categoriesMap.emergency",
    icon: ShieldAlert,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
  },
];

// Type helper for localized strings from Convex
type LocalizedString = string | { fr: string; en?: string } | undefined | null;

function ServicesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const { data: services } = useConvexQuery(
    api.functions.services.listCatalog,
    {},
  );

  const [searchQuery, setSearchQuery] = useState(search.query || "");
  const selectedCategory = search.category || "ALL";

  // Sync state with URL params
  const updateFilters = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  // Navigate to service detail page
  const handleServiceClick = (slug: string) => {
    navigate({ to: "/services/$slug", params: { slug } });
  };

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search.query) {
        updateFilters({ query: searchQuery || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    updateFilters({
      category: categoryId === "ALL" ? undefined : categoryId,
    });
  };

  const isLoading = services === undefined;

  const filteredServices = useMemo(() => {
    if (!services) return [];

    const query = (search.query || "").toLowerCase().trim();

    return services.filter((service) => {
      const serviceName = getLocalizedValue(
        service.name as LocalizedString,
        i18n.language,
      );
      const serviceDesc = getLocalizedValue(
        service.description as LocalizedString,
        i18n.language,
      );

      // Category filter
      const matchesCategory =
        selectedCategory === "ALL" || service.category === selectedCategory;

      // Search filter
      const matchesSearch =
        !query ||
        serviceName.toLowerCase().includes(query) ||
        serviceDesc.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [services, search.query, selectedCategory, i18n.language]);

  const handleClearSearch = () => {
    setSearchQuery("");
    updateFilters({ query: undefined, category: undefined });
  };

  // Category config map for ServiceCard rendering
  const categoryConfig: Record<
    string,
    { icon: LucideIcon; color: string; bgColor: string }
  > = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.filter((c) => c.id !== "ALL").map((c) => [
          c.id,
          { icon: c.icon, color: c.color, bgColor: c.bgColor },
        ]),
      ),
    [],
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow">
        {/* Hero Section with Background Image */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/hero-consulat.jpg)",
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Gradient fade to background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 container px-4 mx-auto text-center pt-8 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                {t("services.pageTitle")}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                {t("services.pageDescription")}
              </p>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pt-2"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Link to="/sign-in/$" params={{ _splat: "" }}>
                    {t("services.bookAppointment", "Prendre rendez-vous")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative pt-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 mt-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t(
                    "services.searchPlaceholderFull",
                    "Rechercher un service, document ou démarche...",
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-14 text-base bg-background border-border/50 rounded-2xl shadow-xl focus-visible:ring-primary/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 mt-3 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  const count =
                    cat.id === "ALL" ?
                      (services?.length ?? 0)
                    : (services?.filter((s) => s.category === cat.id).length ??
                      0);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                        isActive ?
                          "bg-primary text-primary-foreground shadow-md"
                        : "bg-background/80 backdrop-blur-sm hover:bg-background border border-border/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{t(cat.labelKey)}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-1 h-5 min-w-5 flex items-center justify-center text-xs",
                          isActive ?
                            "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted",
                        )}
                      >
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="container mx-auto py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filteredServices.length}
                </span>{" "}
                {filteredServices.length > 1 ?
                  t("services.resultsCount_plural", "services disponibles")
                : t("services.resultsCount_one", "service disponible")}
                {search.query && (
                  <span className="ml-1">
                    {t("services.resultsFor", {
                      query: search.query,
                      defaultValue: `pour "${search.query}"`,
                    })}
                  </span>
                )}
              </p>
              {(search.query || selectedCategory !== "ALL") && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  {t("services.reset", "Réinitialiser")}
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {t("common.loading", "Chargement des services...")}
                </p>
              </div>
            )}

            {/* Services Grid */}
            {!isLoading && (
              <AnimatePresence mode="wait">
                {filteredServices.length > 0 ?
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredServices.map((service, index) => {
                      const config = categoryConfig[service.category] ||
                        categoryConfig[ServiceCategory.Other] || {
                          icon: FileText,
                          color: "text-gray-600",
                          bgColor: "bg-gray-500/10",
                        };

                      const serviceName = getLocalizedValue(
                        service.name as LocalizedString,
                        i18n.language,
                      );
                      const serviceDesc = getLocalizedValue(
                        service.description as LocalizedString,
                        i18n.language,
                      );

                      return (
                        <motion.div
                          key={service._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{
                            delay: index * 0.05,
                          }}
                          layout
                          className="h-full"
                        >
                          <ServiceCard
                            icon={config.icon}
                            title={serviceName}
                            description={serviceDesc}
                            color={`${config.bgColor} ${config.color}`}
                            price={t("services.free")}
                            delay={
                              service.estimatedDays ?
                                `${service.estimatedDays} ${t("services.days", { count: service.estimatedDays })}`
                              : undefined
                            }
                            onClick={() => handleServiceClick(service.slug)}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                : <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                      <Search className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t("services.noResults", "Aucun service trouvé")}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      {t(
                        "services.noResultsHint",
                        "Aucun service ne correspond à votre recherche. Essayez avec d'autres termes ou parcourez les catégories.",
                      )}
                    </p>
                    <Button onClick={handleClearSearch} variant="outline">
                      {t("services.viewAllServices", "Voir tous les services")}
                    </Button>
                  </motion.div>
                }
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
