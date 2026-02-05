import { api } from "@convex/_generated/api";
import { OrganizationType } from "@convex/lib/constants";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Globe,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Search,
  Locate,
  Building,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { MAPBOX_CONFIG } from "@/config/mapbox";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import worldHeroV2 from "@/assets/world-network-hero-v2.png";

const orgsSearchSchema = z.object({
  query: z.string().optional(),
  view: z.enum(["map", "grid"]).optional().default("map"),
  continent: z.string().optional().default("all"),
});

export const Route = createFileRoute("/orgs/")({
  component: OrgsPage,
  validateSearch: (search) => orgsSearchSchema.parse(search),
});

const CONTINENTS = [
  {
    id: "africa",
    name: "Afrique",
    emoji: "🌍",
    countries: [
      "ZA",
      "DZ",
      "AO",
      "BJ",
      "CM",
      "CG",
      "CI",
      "EG",
      "ET",
      "GQ",
      "GN",
      "LY",
      "MA",
      "NG",
      "CD",
      "SN",
      "TG",
      "TN",
      "RW",
      "ST",
      "GA",
    ],
  },
  {
    id: "europe",
    name: "Europe",
    emoji: "🇪🇺",
    countries: [
      "DE",
      "BE",
      "ES",
      "FR",
      "IT",
      "PT",
      "GB",
      "RU",
      "CH",
      "VA",
      "MC",
    ],
  },
  {
    id: "asia",
    name: "Asie",
    emoji: "🌏",
    countries: ["CN", "IN", "JP", "KR", "TR", "IR"],
  },
  {
    id: "americas",
    name: "Amériques",
    emoji: "🌎",
    countries: ["US", "CA", "BR", "MX", "AR", "CU"],
  },
  {
    id: "middle_east",
    name: "Moyen-Orient",
    emoji: "🕌",
    countries: ["SA", "AE", "QA", "KW", "LB"],
  },
];

const countryNames: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  US: "États-Unis",
  GB: "Royaume-Uni",
  DE: "Allemagne",
  ES: "Espagne",
  IT: "Italie",
  CH: "Suisse",
  CA: "Canada",
  GA: "Gabon",
  AO: "Angola",
  CM: "Cameroun",
  CG: "Congo",
  SN: "Sénégal",
  MA: "Maroc",
  TN: "Tunisie",
  EG: "Égypte",
  ZA: "Afrique du Sud",
  CN: "Chine",
  JP: "Japon",
  BR: "Brésil",
  RU: "Russie",
  VA: "Vatican",
  MC: "Monaco",
  KR: "Corée du Sud",
  TR: "Turquie",
  IR: "Iran",
  MX: "Mexique",
  AR: "Argentine",
  CU: "Cuba",
  SA: "Arabie Saoudite",
  AE: "Émirats Arabes Unis",
  QA: "Qatar",
  KW: "Koweït",
  LB: "Liban",
  IN: "Inde",
  BJ: "Bénin",
  CI: "Côte d'Ivoire",
  ET: "Éthiopie",
  GQ: "Guinée Équatoriale",
  GN: "Guinée",
  LY: "Libye",
  NG: "Nigeria",
  CD: "RD Congo",
  RW: "Rwanda",
  ST: "São Tomé",
  TG: "Togo",
  PT: "Portugal",
};

const CITY_COORDINATES: Record<string, [number, number]> = {
  Paris: [2.3522, 48.8566],
  Berlin: [13.405, 52.52],
  Bruxelles: [4.3517, 50.8503],
  Madrid: [-3.7038, 40.4168],
  Lisbonne: [-9.1393, 38.7223],
  Rome: [12.4964, 41.9028],
  Londres: [-0.1278, 51.5074],
  Genève: [6.1432, 46.2044],
  Monaco: [7.4246, 43.7384],
  Moscou: [37.6173, 55.7558],
  Bordeaux: [-0.5792, 44.8378],
  Marseille: [5.3698, 43.2965],
  Lyon: [4.8357, 45.764],
  Libreville: [9.4673, 0.4162],
  Pretoria: [28.2293, -25.7479],
  Alger: [3.0588, 36.7538],
  Luanda: [13.2343, -8.8383],
  Cotonou: [2.3158, 6.3703],
  Yaoundé: [11.5174, 3.848],
  Brazzaville: [15.2832, -4.2634],
  Abidjan: [-4.0083, 5.3599],
  "Le Caire": [31.2357, 30.0444],
  "Addis-Abeba": [38.7469, 9.032],
  Accra: [-0.187, 5.6037],
  Malabo: [8.7832, 3.7504],
  Bata: [9.767, 1.8637],
  Bamako: [-8.0, 12.6392],
  Rabat: [-6.8498, 34.0209],
  Laâyoune: [-13.2023, 27.1251],
  Abuja: [7.5248, 9.0765],
  Kinshasa: [15.3222, -4.4419],
  Kigali: [30.0619, -1.9403],
  "São Tomé": [6.7273, 0.3365],
  Dakar: [-17.4677, 14.7167],
  Lomé: [1.2123, 6.1256],
  Tunis: [10.1815, 36.8065],
  Washington: [-77.0369, 38.9072],
  "New York": [-74.006, 40.7128],
  Ottawa: [-75.6972, 45.4215],
  Brasília: [-47.9292, -15.8267],
  "Buenos Aires": [-58.3816, -34.6037],
  Mexico: [-99.1332, 19.4326],
  "La Havane": [-82.3666, 23.1136],
  Pékin: [116.4074, 39.9042],
  Tokyo: [139.6917, 35.6762],
  "New Delhi": [77.209, 28.6139],
  Riyad: [46.6753, 24.7136],
  Ankara: [32.8597, 39.9334],
  Téhéran: [51.389, 35.6892],
  Doha: [51.531, 25.2854],
  "Abou Dhabi": [54.3773, 24.4539],
  Séoul: [126.978, 37.5665],
};

function formatAddress(address: {
  street: string;
  city: string;
  postalCode: string;
}) {
  return `${address.street}, ${address.postalCode} ${address.city}`;
}

function OrgCardSkeleton() {
  return (
    <Card className="h-full border-primary/5">
      <CardHeader className="text-center pb-2">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3 mx-auto" />
      </CardContent>
    </Card>
  );
}

function OrgsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const { data: orgs } = useConvexQuery(api.functions.orgs.list, {});
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState(search.query || "");
  const [viewMode, setViewMode] = useState<"grid" | "map">(
    search.view === "grid" ? "grid" : "map",
  );
  const [selectedContinent, setSelectedContinent] = useState(
    search.continent || "all",
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const updateFilters = (updates: Partial<typeof search>) => {
    navigate({ search: (prev) => ({ ...prev, ...updates }), replace: true });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search.query) {
        updateFilters({ query: searchQuery || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, search.query]);

  const handleViewModeChange = (value: string) => {
    const mode = value as "grid" | "map";
    setViewMode(mode);
    updateFilters({ view: mode });
  };

  const handleContinentChange = (value: string) => {
    setSelectedContinent(value);
    updateFilters({ continent: value });
  };

  const getContinentForCountry = (code: string) =>
    CONTINENTS.find((c) => c.countries.includes(code));

  useEffect(() => {
    if (viewMode !== "map" || !mapContainer.current || map.current) return;
    if (!MAPBOX_CONFIG.accessToken) return;

    const isDark = theme === "dark";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? MAPBOX_CONFIG.styleDark : MAPBOX_CONFIG.styleLight,
      center: [20, 10],
      zoom: 1.5,
      projection: "globe" as any,
      accessToken: MAPBOX_CONFIG.accessToken,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    map.current.on("style.load", () => {
      map.current?.setFog({
        color: isDark ? "rgb(10, 10, 20)" : "rgb(255, 255, 255)",
        "high-color": isDark ? "rgb(20, 20, 40)" : "rgb(200, 200, 225)",
        "horizon-blend": 0.05,
        "star-intensity": isDark ? 0.6 : 0,
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [viewMode, theme]);

  useEffect(() => {
    if (!map.current || viewMode !== "map" || !orgs) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const embassyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
    const consulateIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;

    orgs.forEach((org) => {
      const city = org.address.city;
      const coords =
        CITY_COORDINATES[city] ||
        CITY_COORDINATES[
          Object.keys(CITY_COORDINATES).find((k) => city.includes(k)) || ""
        ];

      if (coords) {
        const isEmbassy = org.type === OrganizationType.Embassy;
        const color = isEmbassy ? "#10b981" : "#3b82f6";
        const bgColor =
          isEmbassy ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)";
        const iconSource = isEmbassy ? embassyIcon : consulateIcon;

        const el = document.createElement("div");
        el.className = "custom-marker group cursor-pointer";
        el.innerHTML = `
          <div class="relative">
             <div class="absolute inset-0 rounded-full animate-ping opacity-10" style="background-color: ${color};"></div>
             <div class="relative w-9 h-9 rounded-full flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-800 transition-transform hover:scale-110" 
                  style="background-color: ${bgColor}; backdrop-filter: blur(12px); color: ${color};">
               ${iconSource}
             </div>
          </div>
        `;

        const popupHTML = `
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl min-w-[200px]">
            <div class="flex items-center gap-2 mb-2">
               <div class="w-2 h-2 rounded-full" style="background-color: ${color}"></div>
               <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                 ${isEmbassy ? t("orgs.embassy", "Ambassade") : t("orgs.consulate", "Consulat")}
               </span>
            </div>
            <h4 class="text-sm font-bold text-white leading-tight">${org.name}</h4>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
               ${org.address.city}, ${countryNames[org.address.country]}
            </div>
            <a href="/orgs/${org.slug}" class="mt-3 flex items-center justify-center gap-2 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold transition-colors">
              ${t("orgs.viewDetails", "Voir les détails")}
            </a>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: "custom-mapbox-popup",
        }).setHTML(popupHTML);

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map.current!);

        el.addEventListener("mouseenter", () => {
          setActiveMarkerId(org._id);
          popup.addTo(map.current!);
        });
        el.addEventListener("mouseleave", () => popup.remove());
        el.addEventListener("click", () => {
          map.current?.flyTo({ center: coords, zoom: 6 });
        });

        markersRef.current.push(marker);
      }
    });
  }, [orgs, viewMode, t]);

  useEffect(() => {
    if (!map.current || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement("div");
    el.className = "user-marker";
    el.innerHTML = `<div class="relative flex items-center justify-center w-6 h-6"><span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-30 animate-ping"></span><div class="relative inline-flex items-center justify-center w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div></div>`;

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current);

    map.current.flyTo({ center: userLocation, zoom: 4 });
  }, [userLocation]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
          setIsLocating(false);
          toast.success("Position trouvée !");
        },
        () => {
          setIsLocating(false);
          toast.error("Impossible de vous localiser.");
        },
      );
    } else {
      setIsLocating(false);
    }
  };

  const filteredOrgs = useMemo(() => {
    return orgs?.filter((org) => {
      const matchesQuery =
        !searchQuery ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        countryNames[org.address.country]
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const continent = getContinentForCountry(org.address.country);
      const matchesContinent =
        selectedContinent === "all" || continent?.id === selectedContinent;

      return matchesQuery && matchesContinent;
    });
  }, [orgs, searchQuery, selectedContinent]);

  const sidebarList = useMemo(() => {
    return (
      orgs
        ?.filter(
          (org) =>
            !searchQuery ||
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.address.city.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name)) || []
    );
  }, [orgs, searchQuery]);

  const handleLocationClick = (org: any) => {
    setActiveMarkerId(org._id);
    const city = org.address.city;
    const coords =
      CITY_COORDINATES[city] ||
      CITY_COORDINATES[
        Object.keys(CITY_COORDINATES).find((k) => city.includes(k)) || ""
      ];
    if (coords && map.current) {
      map.current.flyTo({ center: coords, zoom: 12 });
    }
  };

  const stats = useMemo(
    () => ({
      total: orgs?.length ?? 0,
      countries: new Set(orgs?.map((o) => o.address.country)).size,
      embassies:
        orgs?.filter((o) => o.type === OrganizationType.Embassy).length ?? 0,
    }),
    [orgs],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - High Fidelity */}
      <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src={worldHeroV2}
          alt="Réseau diplomatique"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-105"
        />
        {/* Strictly dark overlay for readability - NO white gradient per user request */}
        <div className="absolute inset-0 bg-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-6">
          <Badge
            variant="outline"
            className="px-4 py-1.5 bg-white/5 text-white border-white/20 backdrop-blur-xl text-xs tracking-widest uppercase"
          >
            <Globe className="w-3.5 h-3.5 mr-2 text-primary" />
            {t("orgs.badge", "Réseau Diplomatique")}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
            {t("orgs.pageTitle", "Réseau Diplomatique Mondial")}
          </h1>
          <p className="text-xl text-slate-100/90 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow">
            {t(
              "orgs.pageDescription",
              "Découvrez l'étendue du réseau diplomatique et consulaire de la République Gabonaise, au service de ses citoyens et de ses partenaires à travers le monde.",
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
            {[
              {
                icon: Building2,
                count: stats.total,
                label: t("orgs.representations", "représentations"),
              },
              {
                icon: MapPin,
                count: stats.countries,
                label: t("orgs.countries", "pays"),
              },
              {
                icon: Globe,
                count: stats.embassies,
                label: t("orgs.embassies", "ambassades"),
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {item.count}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 px-4 md:px-8 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-1.5 rounded-2xl shadow-xl flex items-center gap-1">
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                onClick={() => handleViewModeChange("map")}
                size="sm"
                className="gap-2 rounded-xl"
              >
                <MapIcon className="w-4 h-4" /> {t("orgs.viewMap", "Carte")}
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => handleViewModeChange("grid")}
                size="sm"
                className="gap-2 rounded-xl"
              >
                <LayoutGrid className="w-4 h-4" />{" "}
                {t("orgs.viewGrid", "Grille")}
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-4 bg-card/50 backdrop-blur-xl border border-border/50 px-4 py-2 rounded-2xl shadow-xl">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("orgs.searchPlaceholder", "Rechercher...")}
                className="h-8 border-none bg-transparent focus-visible:ring-0 w-64 p-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* MAP VIEW LAYOUT */}
          {viewMode === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 h-[750px] rounded-3xl overflow-hidden shadow-2xl border border-border bg-card">
              {/* Refined Sidebar */}
              <div className="lg:col-span-1 flex flex-col border-r border-border bg-muted/30">
                <div className="p-6 border-b border-border space-y-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "orgs.searchPlaceholder",
                          "Rechercher...",
                        )}
                        className="pl-9 h-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      className={cn(
                        "rounded-xl h-10 w-10",
                        userLocation ? "text-primary border-primary/30" : "",
                      )}
                    >
                      <Locate
                        className={cn("h-4 w-4", isLocating && "animate-spin")}
                      />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                      {t("map.legend", "Légende")}
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-blue-500/10 bg-blue-500/5 transition-all">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                          Consulats
                        </span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 transition-all">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          Ambassades
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {sidebarList.length === 0 ?
                      <div className="text-center py-12 text-muted-foreground italic text-sm">
                        {t("orgs.noResults", "Aucun résultat")}
                      </div>
                    : sidebarList.map((org) => {
                        const isEmbassy = org.type === OrganizationType.Embassy;
                        const activeClass =
                          activeMarkerId === org._id ?
                            "border-primary bg-primary/5 shadow-md"
                          : "border-transparent hover:bg-card hover:shadow-sm";

                        return (
                          <button
                            key={org._id}
                            onClick={() => handleLocationClick(org)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl text-sm transition-all flex items-start gap-4 border-2 group",
                              activeClass,
                            )}
                          >
                            <div
                              className={cn(
                                "mt-1 w-2.5 h-2.5 rounded-full shrink-0",
                                isEmbassy ? "bg-emerald-500" : "bg-blue-500",
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-card-foreground leading-snug group-hover:text-primary transition-colors">
                                {org.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-1.5 flex items-start gap-1.5">
                                <MapPin className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
                                <span className="truncate">
                                  {org.address.city},{" "}
                                  {countryNames[org.address.country]}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    }
                  </div>
                </ScrollArea>
              </div>

              {/* Map Container */}
              <div className="lg:col-span-3 relative h-full">
                <div
                  ref={mapContainer}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="space-y-10">
              {/* Continent Filters */}
              <Tabs
                value={selectedContinent}
                onValueChange={handleContinentChange}
                className="w-full"
              >
                <TabsList className="w-full h-auto flex flex-wrap gap-2 p-2 bg-card/5 backdrop-blur-md rounded-[2rem] border border-border/10">
                  <TabsTrigger
                    value="all"
                    className="flex-1 min-w-[100px] h-12 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    🌐 {t("orgs.allRegions", "Tous")}
                  </TabsTrigger>
                  {CONTINENTS.map((c) => (
                    <TabsTrigger
                      key={c.id}
                      value={c.id}
                      className="flex-1 min-w-[100px] h-12 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <span className="mr-2 opacity-70">{c.emoji}</span>
                      {c.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orgs === undefined ?
                  Array.from({ length: 6 }).map((_, i) => (
                    <OrgCardSkeleton key={i} />
                  ))
                : filteredOrgs?.length === 0 ?
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto scale-110 shadow-inner">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">
                      {t("orgs.noResults", "Aucun résultat trouvé")}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Veuillez ajuster vos filtres ou changer de continent pour
                      explorer d'autres représentations.
                    </p>
                  </div>
                : filteredOrgs?.map((org) => {
                    const countryName =
                      countryNames[org.address.country] || org.address.country;
                    const isPrimary = org.type === OrganizationType.Embassy;

                    return (
                      <Link
                        key={org._id}
                        to="/orgs/$slug"
                        params={{ slug: org.slug }}
                        className="block group h-full"
                      >
                        <Card
                          className={cn(
                            "h-full transition-all duration-500 rounded-[2.5rem] border-2 shadow-sm relative overflow-hidden group-hover:shadow-2xl group-hover:-translate-y-2",
                            isPrimary ?
                              "border-emerald-500/20 bg-emerald-500/5"
                            : "border-primary/5 hover:border-primary/20 bg-card/50",
                          )}
                        >
                          {isPrimary && (
                            <Badge className="absolute top-6 right-8 bg-emerald-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {t("orgs.embassy", "Ambassade")}
                            </Badge>
                          )}
                          <CardHeader className="text-center pt-10 pb-4">
                            <div
                              className={cn(
                                "mx-auto p-5 rounded-3xl w-20 h-20 flex items-center justify-center mb-6 transition-all duration-500 group-hover:rotate-[360deg] shadow-xl",
                                isPrimary ?
                                  "bg-emerald-500 text-white"
                                : "bg-blue-600 text-white",
                              )}
                            >
                              {isPrimary ?
                                <Building2 className="w-10 h-10" />
                              : <Building className="w-10 h-10" />}
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                              {org.address.city}
                            </CardTitle>
                            <CardDescription className="flex items-center justify-center gap-2 pt-1">
                              <span
                                className={`fi fi-${org.address.country.toLowerCase()} rounded-[4px] shadow-sm`}
                              ></span>
                              <span className="font-bold text-muted-foreground/80">
                                {countryName}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="text-center px-8 pb-10 space-y-4">
                            <div className="font-bold text-card-foreground leading-relaxed line-clamp-2 min-h-[3rem] items-center flex justify-center">
                              {org.name}
                            </div>
                            <div className="text-xs text-muted-foreground/70 font-medium">
                              {formatAddress(org.address)}
                            </div>
                            <div className="pt-4">
                              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                {t("orgs.viewDetails", "Détails")}
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                }
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
