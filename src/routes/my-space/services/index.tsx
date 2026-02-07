import { api } from "@convex/_generated/api";
import { ServiceCategory } from "@convex/lib/constants";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Globe,
  type LucideIcon,
  Loader2,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ServiceCard } from "@/components/home/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/my-space/page-header";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-space/services/")({
  component: ServicesPage,
});

// Category configuration
const CATEGORIES: {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  fallback: string;
}[] = [
  {
    id: "ALL",
    icon: SlidersHorizontal,
    labelKey: "services.category.all",
    fallback: "Tous",
  },
  {
    id: ServiceCategory.Passport,
    icon: BookOpenCheck,
    labelKey: "services.category.passport",
    fallback: "Passeports",
  },
  {
    id: ServiceCategory.Visa,
    icon: Globe,
    labelKey: "services.category.visa",
    fallback: "Visas",
  },
  {
    id: ServiceCategory.CivilStatus,
    icon: FileText,
    labelKey: "services.category.civilStatus",
    fallback: "État Civil",
  },
  {
    id: ServiceCategory.Registration,
    icon: BookOpen,
    labelKey: "services.category.registration",
    fallback: "Inscription",
  },
  {
    id: ServiceCategory.Certification,
    icon: FileCheck,
    labelKey: "services.category.certification",
    fallback: "Administratif",
  },
  {
    id: ServiceCategory.Assistance,
    icon: ShieldAlert,
    labelKey: "services.category.assistance",
    fallback: "Assistance",
  },
];

// Category colors for badges
const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
  [ServiceCategory.Passport]: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  [ServiceCategory.Visa]: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
  },
  [ServiceCategory.CivilStatus]: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  [ServiceCategory.Registration]: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  [ServiceCategory.Certification]: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  [ServiceCategory.Assistance]: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
  },
  [ServiceCategory.Other]: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-500/10",
  },
};

// Type for service from listCatalog
type CatalogService = {
  _id: string;
  slug: string;
  name: string | { fr: string; en?: string };
  description: string | { fr: string; en?: string };
  content?: string | { fr: string; en?: string };
  category: string;
  estimatedDays?: number;
  requiresAppointment?: boolean;
  eligibleProfiles?: string[];
  joinedDocuments?: Array<{
    type: string;
    label: { fr: string; en?: string };
    required: boolean;
  }>;
};

function ServicesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: services } = useConvexQuery(
    api.functions.services.listCatalog,
    {},
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedService, setSelectedService] = useState<CatalogService | null>(
    null,
  );

  const isLoading = services === undefined;

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!services) return [];
    const query = searchQuery.toLowerCase().trim();

    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === "ALL" || service.category === selectedCategory;

      const name = getLocalizedValue(service.name, i18n.language);
      const desc = getLocalizedValue(service.description, i18n.language);

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [services, searchQuery, selectedCategory, i18n.language]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
  };

  const handleServiceClick = (service: CatalogService) => {
    setSelectedService(service);
  };

  const handleCreateRequest = () => {
    if (!selectedService) return;
    navigate({
      to: "/my-space/services/$slug/new",
      params: { slug: selectedService.slug },
    });
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <PageHeader
        title={t("mySpace.screens.services.heading", "Services & Démarches")}
        subtitle={t(
          "mySpace.screens.services.subtitle",
          "Découvrez et initiez vos démarches consulaires",
        )}
        icon={<FileText className="h-6 w-6 text-primary" />}
      />

      {/* Search + Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-card border border-border rounded-xl p-4 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t(
              "mySpace.screens.services.searchPlaceholder",
              "Rechercher un service, document ou démarche...",
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-background outline-none transition-all text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              type="button"
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
            const count =
              cat.id === "ALL" ?
                (services?.length ?? 0)
              : (services?.filter((s) => s.category === cat.id).length ?? 0);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  isActive ?
                    "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t(cat.labelKey, cat.fallback)}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1 h-4 min-w-4 flex items-center justify-center text-[10px]",
                    isActive ?
                      "bg-primary-foreground/20 text-primary-foreground"
                    : "",
                  )}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {t("common.loading", "Chargement...")}
          </p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filteredServices.length}
            </span>{" "}
            service{filteredServices.length > 1 ? "s" : ""} disponible
            {filteredServices.length > 1 ? "s" : ""}
            {searchQuery && (
              <span className="ml-1">
                {t("mySpace.screens.services.forQuery", "pour")} «
                <span className="text-primary font-medium">{searchQuery}</span>»
              </span>
            )}
          </p>
          {(searchQuery || selectedCategory !== "ALL") && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <X className="h-4 w-4" />{" "}
              {t("mySpace.screens.services.reset", "Réinitialiser")}
            </button>
          )}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {filteredServices.length > 0 ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const colors =
                  CATEGORY_COLORS[service.category] ||
                  CATEGORY_COLORS[ServiceCategory.Other];
                const serviceName = getLocalizedValue(
                  service.name,
                  i18n.language,
                );
                const serviceDesc = getLocalizedValue(
                  service.description,
                  i18n.language,
                );

                const categoryLabel = t(
                  `services.categoriesMap.${service.category}`,
                  service.category,
                );

                return (
                  <ServiceCard
                    key={service._id}
                    icon={
                      CATEGORIES.find((c) => c.id === service.category)?.icon ||
                      FileText
                    }
                    title={serviceName}
                    description={serviceDesc}
                    color={`${colors.bgColor} ${colors.color}`}
                    badge={categoryLabel}
                    price={t("services.free", "Gratuit")}
                    delay={
                      service.estimatedDays ?
                        `${service.estimatedDays} ${t("services.days", { count: service.estimatedDays, defaultValue: "jour(s)" })}`
                      : undefined
                    }
                    onClick={() =>
                      handleServiceClick(service as CatalogService)
                    }
                  />
                );
              })}
            </div>
          : <div className="text-center py-12 rounded-xl bg-muted/30 border-2 border-dashed">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t(
                  "mySpace.screens.services.noResults",
                  "Aucun service trouvé",
                )}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t(
                  "mySpace.screens.services.noResultsDesc",
                  "Aucun service ne correspond à votre recherche.",
                )}
              </p>
              <Button onClick={handleClearSearch}>
                {t(
                  "mySpace.screens.services.viewAll",
                  "Voir tous les services",
                )}
              </Button>
            </div>
          }
        </motion.div>
      )}

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        open={!!selectedService}
        onOpenChange={(open) => !open && setSelectedService(null)}
        onCreateRequest={handleCreateRequest}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SERVICE DETAIL MODAL
// ---------------------------------------------------------------------------

function ServiceDetailModal({
  service,
  open,
  onOpenChange,
  onCreateRequest,
}: {
  service: CatalogService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRequest: () => void;
}) {
  const { t, i18n } = useTranslation();

  if (!service) return null;

  const colors =
    CATEGORY_COLORS[service.category] || CATEGORY_COLORS[ServiceCategory.Other];
  const Icon =
    CATEGORIES.find((c) => c.id === service.category)?.icon || FileText;
  const serviceName = getLocalizedValue(service.name, i18n.language);
  const serviceDescription = getLocalizedValue(
    service.description,
    i18n.language,
  );
  const serviceContent =
    service.content ? getLocalizedValue(service.content, i18n.language) : null;
  const categoryLabel = t(
    `services.categoriesMap.${service.category}`,
    service.category,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {/* Service header with icon */}
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl ${colors.bgColor} ${colors.color} shrink-0`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight">
                {serviceName}
              </DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={`${colors.bgColor} ${colors.color}`}
                >
                  {categoryLabel}
                </Badge>
                {service.estimatedDays && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {service.estimatedDays}{" "}
                    {t("services.days", {
                      count: service.estimatedDays,
                      defaultValue: "jour(s)",
                    })}
                  </Badge>
                )}
                {service.requiresAppointment && (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  >
                    <Calendar className="h-3 w-3" />
                    {t("services.appointmentRequired", "Rendez-vous requis")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogDescription className="mt-3 text-sm leading-relaxed">
            {serviceDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Detailed content */}
        {serviceContent && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2">
                {t("services.detailsTitle", "Informations détaillées")}
              </h4>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <Needed for rich content>
                dangerouslySetInnerHTML={{ __html: serviceContent }}
              />
            </div>
          </>
        )}

        {/* Required Documents */}
        {service.joinedDocuments && service.joinedDocuments.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t("services.requiredDocuments", "Documents requis")} (
                {service.joinedDocuments.length})
              </h4>
              <ul className="space-y-2">
                {service.joinedDocuments.map((doc, index) => (
                  <li
                    key={`${doc.type}-${index}`}
                    className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg"
                  >
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-sm">
                      {getLocalizedValue(doc.label, i18n.language)}
                    </span>
                    {doc.required && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] shrink-0"
                      >
                        {t("services.required", "Obligatoire")}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Beneficiaries */}
        {service.eligibleProfiles && service.eligibleProfiles.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {t(
                  "services.modal.eligibleBeneficiaries",
                  "Bénéficiaires éligibles",
                )}
              </h4>
              <div className="flex flex-wrap gap-2">
                {service.eligibleProfiles.map((profileType: string) => {
                  const colorMap: Record<string, string> = {
                    long_stay:
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    short_stay:
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    visa_tourism:
                      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                    visa_business:
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    visa_long_stay:
                      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
                    admin_services:
                      "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                  };
                  return (
                    <Badge
                      key={profileType}
                      variant="secondary"
                      className={`gap-1 ${colorMap[profileType] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {t(
                        `services.modal.profileTypes.${profileType}`,
                        profileType,
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Important Info */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1.5 text-sm">
            {t("services.modal.importantInfo", "Informations importantes")}
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              {t(
                "services.modal.infoPoints.docs",
                "Tous les documents doivent être en cours de validité.",
              )}
            </li>
            <li>
              {t(
                "services.modal.infoPoints.delay",
                "Les délais indiqués sont donnés à titre indicatif.",
              )}
            </li>
            <li>
              {t(
                "services.modal.infoPoints.identity",
                "Une pièce d'identité sera demandée lors du retrait.",
              )}
            </li>
          </ul>
        </div>

        {/* Actions */}
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1"
          >
            {t("common.close", "Fermer")}
          </Button>
          <Button onClick={onCreateRequest} className="gap-2 sm:order-2">
            <FileText className="h-4 w-4" />
            {t("services.modal.createRequest", "Faire une demande")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
