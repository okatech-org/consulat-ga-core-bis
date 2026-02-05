import { useRef, useEffect } from "react";
import * as mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "react-i18next";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { api } from "@convex/_generated/api";
import { MAPBOX_CONFIG } from "@/config/mapbox";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Shield, Navigation } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { OrganizationType } from "@convex/lib/constants";
import { useTheme } from "next-themes";

// Coordinates for major cities (fallback if not in Convex metadata)
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Europe
  Paris: [2.3522, 48.8566],
  London: [-0.1278, 51.5074],
  Berlin: [13.405, 52.52],
  Brussels: [4.3517, 50.8503],
  Madrid: [-3.7038, 40.4168],
  Rome: [12.4964, 41.9028],
  Lisbon: [-9.1393, 38.7223],
  Moscow: [37.6173, 55.7558],
  // Africa
  Libreville: [9.4673, 0.4162],
  Pretoria: [28.2293, -25.7479],
  Algiers: [3.0588, 36.7538],
  Luanda: [13.2343, -8.8383],
  Rabat: [-6.8498, 34.0209],
  Cairo: [31.2357, 30.0444],
  Dakar: [-17.4677, 14.7167],
  Abidjan: [-4.0083, 5.3599],
  Yaounde: [11.5174, 3.848],
  // Americas
  Washington: [-77.0369, 38.9072],
  "New York": [-74.006, 40.7128],
  Ottawa: [-75.6972, 45.4215],
  Brasilia: [-47.9292, -15.8267],
  // Asia
  Beijing: [116.4074, 39.9042],
  Tokyo: [139.6917, 35.6762],
  "New Delhi": [77.209, 28.6139],
  Riyadh: [46.6753, 24.7136],
};

export function WorldMapSection() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { data: orgs } = useConvexQuery(api.functions.orgs.list, {});

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    if (!MAPBOX_CONFIG.accessToken) {
      console.error("Mapbox token missing");
      return;
    }

    (mapboxgl as any).accessToken = MAPBOX_CONFIG.accessToken;

    const isDark = theme === "dark";
    const style = isDark ? MAPBOX_CONFIG.styleDark : MAPBOX_CONFIG.styleLight;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [20, 0],
      zoom: 1.5,
      projection: "globe" as any,
      interactive: true,
      attributionControl: false,
    });

    map.current.on("style.load", () => {
      map.current?.setFog({
        color: isDark ? "rgb(10, 10, 20)" : "rgb(220, 220, 230)",
        "high-color": isDark ? "rgb(20, 20, 40)" : "rgb(180, 180, 200)",
        "horizon-blend": 0.05,
        "star-intensity": isDark ? 0.6 : 0,
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add Markers
  useEffect(() => {
    if (!map.current || !orgs) return;

    // Remove existing markers logic would go here if we were updating dynamically
    // For now simple add

    orgs.forEach((org) => {
      // Try to find coordinates
      const city = org.address.city;
      const coords =
        CITY_COORDINATES[city] ||
        CITY_COORDINATES[
          Object.keys(CITY_COORDINATES).find((k) => city.includes(k)) || ""
        ];

      if (coords) {
        const el = document.createElement("div");
        el.className = "marker group cursor-pointer";

        // Marker Style
        const isEmbassy = org.type === OrganizationType.Embassy;
        const color = isEmbassy ? "rgb(16, 185, 129)" : "rgb(59, 130, 246)"; // Green vs Blue

        el.innerHTML = `
          <div class="relative">
             <div class="absolute inset-0 rounded-full animate-ping opacity-20" style="background-color: ${color};"></div>
             <div class="relative w-3 h-3 rounded-full shadow-lg shadow-${isEmbassy ? "emerald" : "blue"}-500/50 border border-white/50" style="background-color: ${color};"></div>
          </div>
        `;

        // Popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: "custom-popup",
        }).setHTML(`
            <div class="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl text-white text-xs">
              <div class="font-bold mb-1">${isEmbassy ? "Ambassade" : "Consulat"} - ${city}</div>
              <div class="text-slate-400">${org.address.country}</div>
            </div>
          `);

        new mapboxgl.Marker(el)
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map.current!);

        // Hover effects
        el.addEventListener("mouseenter", () => popup.addTo(map.current!));
        el.addEventListener("mouseleave", () => popup.remove());
      }
    });
  }, [orgs]);

  return (
    <section className="py-24 bg-background text-foreground overflow-hidden relative border-t border-border">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Content Left (2/5 = 40%) */}
          <div className="lg:col-span-2 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-6 backdrop-blur-sm">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Réseau Diplomatique</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
              {t("map.title")}
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              {t("map.subtitle")}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-card border border-border backdrop-blur-sm">
                <div className="text-3xl font-bold text-foreground mb-1">
                  50+
                </div>
                <div className="text-sm text-muted-foreground">
                  Ambassades & Consulats
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border backdrop-blur-sm">
                <div className="text-3xl font-bold text-emerald-500 dark:text-emerald-400 mb-1">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground">
                  Assistance d'Urgence
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="h-14 px-8 rounded-full">
              <Link to="/orgs" search={{ view: "grid" }}>
                Explorer le réseau <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Map Right (3/5 = 60%) - Floating Card Effect */}
          <div className="lg:col-span-3 relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-card/50 backdrop-blur-sm group">
            {/* Map Container */}
            <div
              ref={mapContainer}
              className="absolute inset-0 w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

            {/* Floating Top Card */}
            <div className="absolute top-6 right-6 p-4 rounded-2xl bg-background/60 dark:bg-background/40 border border-border backdrop-blur-md shadow-xl max-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Couverture
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    Mondiale
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-primary rounded-full" />
              </div>
            </div>

            {/* Floating Bottom Info */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/60 dark:bg-background/40 border border-border backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Shield className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      Protection Consulaire
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      Service Actif
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-muted-foreground">
                    Délai moyen
                  </div>
                  <div className="font-mono text-foreground">48h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
