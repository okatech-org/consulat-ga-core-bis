import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MOCK_ORGANIZATIONS } from '@/data/mock-organizations';
import { MOCK_COMPANIES } from '@/data/mock-companies';
import { MOCK_ASSOCIATIONS } from '@/data/mock-associations';
import { Building2, Globe, Users, Filter, AlertCircle, Search, MapPin, Navigation, Locate } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MAPBOX_CONFIG } from '@/config/mapbox';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Coordonnées précises des villes (format: [longitude, latitude])
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Europe
  'Paris': [2.3522, 48.8566],
  'Berlin': [13.4050, 52.5200],
  'Bruxelles': [4.3517, 50.8503],
  'Madrid': [-3.7038, 40.4168],
  'Lisbonne': [-9.1393, 38.7223],
  'Rome': [12.4964, 41.9028],
  'Londres': [-0.1278, 51.5074],
  'Genève': [6.1432, 46.2044],
  'Monaco': [7.4246, 43.7384],
  'Moscou': [37.6173, 55.7558],

  // Afrique
  'Libreville': [9.4673, 0.4162],
  'Pretoria': [28.2293, -25.7479],
  'Alger': [3.0588, 36.7538],
  'Luanda': [13.2343, -8.8383],
  'Cotonou': [2.3158, 6.3703],
  'Yaoundé': [11.5174, 3.8480],
  'Brazzaville': [15.2832, -4.2634],
  'Abidjan': [-4.0083, 5.3599],
  'Le Caire': [31.2357, 30.0444],
  'Addis-Abeba': [38.7469, 9.0320],
  'Accra': [-0.1870, 5.6037],
  'Malabo': [8.7832, 3.7504],
  'Bata': [9.7670, 1.8637],
  'Bamako': [-8.0000, 12.6392],
  'Rabat': [-6.8498, 34.0209],
  'Laâyoune': [-13.2023, 27.1251],
  'Abuja': [7.5248, 9.0765],
  'Kinshasa': [15.3222, -4.4419],
  'Kigali': [30.0619, -1.9403],
  'São Tomé': [6.7273, 0.3365],
  'Dakar': [-17.4677, 14.7167],
  'Lomé': [1.2123, 6.1256],
  'Tunis': [10.1815, 36.8065],

  // Amériques
  'Washington': [-77.0369, 38.9072],
  'New York': [-74.0060, 40.7128],
  'Ottawa': [-75.6972, 45.4215],
  'Brasília': [-47.9292, -15.8267],
  'Buenos Aires': [-58.3816, -34.6037],
  'Mexico': [-99.1332, 19.4326],

  // Asie
  'Pékin': [116.4074, 39.9042],
  'Tokyo': [139.6917, 35.6762],
  'New Delhi': [77.2090, 28.6139],
  'Riyad': [46.6753, 24.7136],
  'Ankara': [32.8597, 39.9334],
  'Téhéran': [51.3890, 35.6892],
  'Doha': [51.5310, 25.2854],
  'Abou Dhabi': [54.3773, 24.4539],

  // Villes françaises
  'Lyon': [4.8357, 45.7640],
  'Bordeaux': [-0.5792, 44.8378],
  'Marseille': [5.3698, 43.2965],
  'Perpignan': [2.8956, 42.6986],

  // Autres
  'Vatican': [12.4534, 41.9029],
  'Beyrouth': [35.5018, 33.8938],
  'La Havane': [-82.3666, 23.1136],
  'Séoul': [126.9780, 37.5665],
};

export interface MapMarker {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'organization' | 'company' | 'association';
  subtype?: string; // Pour distinguer Ambassade vs Consulat
  city: string;
  country: string;
  distance?: number; // Distance from user in km
  address?: string;
  hours?: any;
}

const getOpeningStatus = (hours: any) => {
  if (!hours) return null;

  const now = new Date();
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const currentDay = days[now.getDay()];
  const todayHours = hours[currentDay];

  if (!todayHours || !todayHours.isOpen) return { status: 'Fermé', color: 'text-red-500', bg: 'bg-red-500/10' };

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  if (currentTime < openTime || currentTime > closeTime) {
    return { status: 'Fermé', color: 'text-red-500', bg: 'bg-red-500/10' };
  }

  const minutesUntilClose = closeTime - currentTime;
  const hoursUntilClose = Math.floor(minutesUntilClose / 60);

  if (hoursUntilClose < 1) {
    return { status: `Ferme dans ${minutesUntilClose} min`, color: 'text-orange-500', bg: 'bg-orange-500/10' };
  }

  return { status: `Ouvert • Ferme dans ${hoursUntilClose}h`, color: 'text-green-500', bg: 'bg-green-500/10' };
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function InteractiveWorldMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearestJurisdiction, setNearestJurisdiction] = useState<MapMarker | null>(null);

  // États des filtres
  const [filters, setFilters] = useState({
    organizations: true,
    companies: true,
    associations: true
  });

  const toggleFilter = (type: 'organizations' | 'companies' | 'associations') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Préparer les markers (une seule fois)
  useEffect(() => {
    const allMarkers: MapMarker[] = [];

    // Organisations diplomatiques
    MOCK_ORGANIZATIONS.forEach(org => {
      const city = org.metadata?.city || org.city || '';
      // Prioritize specific coordinates if available
      const coordinates = org.metadata?.coordinates || CITY_COORDINATES[city];

      if (coordinates) {
        allMarkers.push({
          id: org.id,
          name: org.name,
          coordinates,
          type: 'organization',
          subtype: org.type, // Stocker le type précis (AMBASSADE, CONSULAT_GENERAL, etc.)
          city,
          country: org.metadata?.country || org.country || '',
          address: org.metadata?.contact?.address,
          hours: org.metadata?.hours
        });
      }
    });

    // Entreprises
    MOCK_COMPANIES.forEach(company => {
      const city = company.address.city || '';
      // Prioritize specific coordinates if available
      const coordinates = company.coordinates || CITY_COORDINATES[city];

      if (coordinates) {
        allMarkers.push({
          id: company.id,
          name: company.name,
          coordinates,
          type: 'company',
          city,
          country: company.address.country || '',
          address: `${company.address.street}, ${company.address.postalCode} ${company.address.city}`
        });
      }
    });

    // Associations
    MOCK_ASSOCIATIONS.forEach(association => {
      const city = association.address.city || '';
      const coordinates = CITY_COORDINATES[city];
      if (coordinates) {
        allMarkers.push({
          id: association.id,
          name: association.name,
          coordinates,
          type: 'association',
          city,
          country: association.address.country || ''
        });
      }
    });

    setMarkers(allMarkers);
  }, []);

  // Calculer les distances et trouver la juridiction la plus proche
  useEffect(() => {
    if (!userLocation) return;

    let nearestConsulate: MapMarker | null = null;
    let minConsulateDist = Infinity;
    let nearestEmbassy: MapMarker | null = null;
    let minEmbassyDist = Infinity;

    markers.forEach(marker => {
      const distance = calculateDistance(
        userLocation[1], userLocation[0],
        marker.coordinates[1], marker.coordinates[0]
      );
      marker.distance = distance;

      if (marker.type === 'organization') {
        // Priorité aux Consulats Généraux pour la juridiction administrative
        if (marker.subtype === 'CONSULAT_GENERAL' && distance < minConsulateDist) {
          minConsulateDist = distance;
          nearestConsulate = marker;
        }
        // Sinon Ambassade
        if (marker.subtype === 'AMBASSADE' && distance < minEmbassyDist) {
          minEmbassyDist = distance;
          nearestEmbassy = marker;
        }
      }
    });

    // La juridiction est le Consulat Général le plus proche, sinon l'Ambassade la plus proche
    setNearestJurisdiction(nearestConsulate || nearestEmbassy);
  }, [userLocation, markers]);

  // Fonction pour appliquer un offset aux marqueurs superposés
  const getOffsetCoordinates = (coordinates: [number, number], index: number, total: number): [number, number] => {
    if (total <= 1) return coordinates;

    // Rayon du cercle en degrés (approximatif, dépend du zoom mais suffisant pour séparer)
    const radius = 0.00015; // Réduit pour rapprocher les points (approx 15m)
    const angle = (index / total) * 2 * Math.PI;

    return [
      coordinates[0] + radius * Math.cos(angle),
      coordinates[1] + radius * Math.sin(angle)
    ];
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    const mapboxToken = MAPBOX_CONFIG.accessToken;

    if (!mapboxToken || mapboxToken === 'VOTRE_TOKEN_MAPBOX_PUBLIC_ICI') {
      setMapError('Token Mapbox non configuré.');
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: theme === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
        center: [20, 0],
        zoom: 1.5,
        projection: 'globe' as any
      });

      map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

      map.current.on('style.load', () => {
        // Ajouter atmosphère et brouillard pour effet globe (plus subtil en dark mode)
        map.current?.setFog({
          color: theme === 'dark' ? 'rgb(10, 10, 20)' : 'rgb(255, 255, 255)',
          'high-color': theme === 'dark' ? 'rgb(20, 20, 40)' : 'rgb(200, 200, 225)',
          'horizon-blend': 0.05, // Réduit pour plus de clarté
          'star-intensity': theme === 'dark' ? 0.6 : 0 // Plus d'étoiles
        });
      });

    } catch (error) {
      setMapError('Erreur lors de l\'initialisation: ' + (error as Error).message);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Mise à jour du style selon le thème
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(theme === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11');
    }
  }, [theme]);

  // Gestion des marqueurs
  useEffect(() => {
    if (!map.current) return;

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Grouper les marqueurs par coordonnées pour gérer les superpositions
    const markersByLocation: Record<string, MapMarker[]> = {};

    markers.forEach(marker => {
      const shouldShow =
        (marker.type === 'organization' && filters.organizations) ||
        (marker.type === 'company' && filters.companies) ||
        (marker.type === 'association' && filters.associations);

      if (shouldShow) {
        const key = `${marker.coordinates[0]},${marker.coordinates[1]}`;
        if (!markersByLocation[key]) {
          markersByLocation[key] = [];
        }
        markersByLocation[key].push(marker);
      }
    });

    // Créer les marqueurs avec offset si nécessaire
    Object.values(markersByLocation).forEach(group => {
      group.forEach((marker, index) => {
        const offsetCoordinates = getOffsetCoordinates(marker.coordinates, index, group.length);

        const el = document.createElement('div');
        el.className = 'custom-marker group cursor-pointer';

        // Styles CSS-in-JS pour l'animation et le look
        let color, hslColor, bgColor, emojiIcon;

        if (marker.type === 'organization') {
          if (marker.subtype === 'AMBASSADE') {
            // Ambassade -> Vert
            color = 'rgb(16, 185, 129)'; // emerald-500
            hslColor = '160 84% 39%';
            bgColor = 'rgba(16, 185, 129, 0.1)';
            emojiIcon = '🏛️';
          } else {
            // Consulat (et autres) -> Bleu
            color = 'rgb(59, 130, 246)'; // blue-500
            hslColor = '217 91% 60%';
            bgColor = 'rgba(59, 130, 246, 0.1)';
            emojiIcon = '🏛️';
          }
        } else if (marker.type === 'company') {
          color = 'rgb(249, 115, 22)'; // orange-500
          hslColor = '35 100% 53%';
          bgColor = 'rgba(249, 115, 22, 0.1)';
          emojiIcon = '🏢';
        } else { // association
          color = 'rgb(239, 68, 68)'; // red-500
          hslColor = '0 84% 60%';
          bgColor = 'rgba(239, 68, 68, 0.1)';
          emojiIcon = '👥';
        }

        el.innerHTML = `
          <div class="relative">
            <!-- Ping animation (subtle) -->
            <div class="absolute inset-0 rounded-full animate-ping opacity-20" style="background-color: ${color};"></div>
            <!-- Main marker circle -->
            <div class="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 transition-transform hover:scale-110" 
                 style="background-color: ${bgColor}; backdrop-filter: blur(8px);">
              <span class="text-xl">${emojiIcon}</span>
            </div>
            <!-- Bottom indicator dot -->
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-800" 
                 style="background-color: ${color};"></div>
          </div>
        `;

        const isJurisdiction = nearestJurisdiction?.id === marker.id;

        const openingStatus = getOpeningStatus(marker.hours);

        // Popup stylisé pour le mode sombre (Design épuré sans bordure blanche)
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          className: 'custom-mapbox-popup'
        }).setHTML(`
          <div class="font-sans min-w-[260px] bg-slate-950 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
            
            <!-- Header avec Image/Icone et Badges -->
            <div class="relative h-14 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-4 border-b border-slate-800">
               <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider shadow-sm" style="background-color: ${color}">
                    ${marker.type === 'organization' ? (marker.subtype === 'AMBASSADE' ? 'Ambassade' : 'Consulat') : marker.type === 'company' ? 'Entreprise' : 'Association'}
                  </span>
                  ${isJurisdiction ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Juridiction</span>' : ''}
               </div>
            </div>

            <div class="p-4">
              <h3 class="font-bold text-base text-white mb-1 leading-tight">${marker.name}</h3>
              
              ${marker.address ? `
                <p class="text-xs text-slate-400 flex items-start gap-1.5 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 opacity-70"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span class="leading-relaxed">${marker.address}</span>
                </p>
              ` : `
                <p class="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${marker.city}, ${marker.country}
                </p>
              `}

              ${openingStatus ? `
                <div class="mb-4 flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${openingStatus.color} ${openingStatus.bg} border border-current border-opacity-10">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                    ${openingStatus.status}
                  </span>
                  ${marker.distance ? `<span class="text-xs text-slate-500">• à ${Math.round(marker.distance)} km</span>` : ''}
                </div>
              ` : marker.distance ? `
                 <div class="mb-4 text-xs text-slate-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    à ${Math.round(marker.distance)} km
                 </div>
              ` : ''}

              <!-- Actions Buttons -->
              <div class="grid grid-cols-2 gap-2 mt-2">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${marker.coordinates[1]},${marker.coordinates[0]}" target="_blank" rel="noopener noreferrer" 
                   class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                   Y Aller
                </a>
                <a href="${marker.type === 'organization' ? '/portal/' + marker.id : marker.type === 'company' ? '/companies/' + marker.id : '/associations/' + marker.id}" 
                   class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-medium transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                   Détail
                </a>
              </div>
            </div>
          </div>
        `);

        // Ajouter le marqueur à la carte avec les coordonnées décalées
        const mapboxMarker = new mapboxgl.Marker({ element: el })
          .setLngLat(offsetCoordinates)
          .setPopup(popup)
          .addTo(map.current as mapboxgl.Map);

        // Ouvrir le popup au survol
        el.addEventListener('mouseenter', () => {
          setActiveMarkerId(marker.id);
          mapboxMarker.togglePopup();
        });

        // Optionnel : fermer au départ de la souris (peut être gênant si on veut cliquer sur les boutons)
        // Pour l'instant on laisse ouvert pour permettre le clic sur les boutons

        el.addEventListener('click', () => {
          map.current?.flyTo({ center: offsetCoordinates, zoom: 14 });
        });

        markersRef.current.push(mapboxMarker);
      });
    });

  }, [markers, filters, activeMarkerId, theme, nearestJurisdiction]);

  // Gestion du marqueur utilisateur
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'user-marker';
    el.innerHTML = `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-30 animate-ping"></span>
        <div class="relative inline-flex items-center justify-center w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
      </div>
    `;

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current);

    map.current.flyTo({
      center: userLocation,
      zoom: 4
    });

  }, [userLocation]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setIsLocating(false);
          toast.success("Position trouvée !");
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          toast.error("Impossible de vous localiser. Vérifiez vos paramètres.");
        }
      );
    } else {
      setIsLocating(false);
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  // Filtrer et trier la liste latérale
  const filteredList = markers
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = (m.type === 'organization' && filters.organizations) ||
        (m.type === 'company' && filters.companies) ||
        (m.type === 'association' && filters.associations);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Trier par distance si disponible
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const handleLocationClick = (marker: MapMarker) => {
    setActiveMarkerId(marker.id);
    map.current?.flyTo({
      center: marker.coordinates,
      zoom: 12,
      essential: true
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[600px] lg:h-[700px] rounded-xl overflow-hidden shadow-2xl border border-border bg-card">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 flex flex-col border-r border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border space-y-3 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 bg-background border-input focus:border-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Me localiser"
              className={userLocation ? "text-primary border-primary/50 bg-primary/5" : ""}
            >
              <Locate className={cn("h-4 w-4", isLocating && "animate-spin")} />
            </Button>
          </div>

          {nearestJurisdiction && (
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Votre Juridiction
              </div>
              <div className="font-medium text-sm text-foreground">{nearestJurisdiction.name}</div>
              <div className="text-xs text-muted-foreground">
                à {Math.round(nearestJurisdiction.distance || 0)} km
              </div>
            </div>
          )}

          {/* Légende des couleurs */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Légende</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleFilter('organizations')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                  filters.organizations
                    ? "bg-blue-500/10 border-blue-500/30 text-foreground"
                    : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shrink-0" />
                <span>Consulats</span>
              </button>

              <button
                onClick={() => toggleFilter('organizations')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                  filters.organizations
                    ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                    : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shrink-0" />
                <span>Ambassades</span>
              </button>

              <button
                onClick={() => toggleFilter('companies')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                  filters.companies
                    ? "bg-orange-500/10 border-orange-500/30 text-foreground"
                    : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-lg shrink-0" />
                <span>Entreprises</span>
              </button>

              <button
                onClick={() => toggleFilter('associations')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                  filters.associations
                    ? "bg-red-500/10 border-red-500/30 text-foreground"
                    : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shrink-0" />
                <span>Associations</span>
              </button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredList.map(marker => {
                const openingStatus = getOpeningStatus(marker.hours);

                // Déterminer les styles en fonction du type
                let typeStyles = "";
                let activeStyles = "";
                let iconColor = "";

                switch (marker.type) {
                  case 'organization':
                    if (marker.subtype === 'AMBASSADE') {
                      // Ambassades -> Vert émeraude
                      typeStyles = "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10 dark:border-transparent";
                      activeStyles = "bg-emerald-500/25 border-emerald-500/40 shadow-sm shadow-emerald-500/5 dark:bg-emerald-500/20 dark:border-emerald-500/30";
                      iconColor = "bg-emerald-500 shadow-emerald-500/30";
                    } else {
                      // Consulats -> Bleu
                      typeStyles = "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20 dark:bg-blue-500/5 dark:hover:bg-blue-500/10 dark:border-transparent";
                      activeStyles = "bg-blue-500/25 border-blue-500/40 shadow-sm shadow-blue-500/5 dark:bg-blue-500/20 dark:border-blue-500/30";
                      iconColor = "bg-blue-500 shadow-blue-500/30";
                    }
                    break;
                  case 'association': // Assos -> Rouge
                    typeStyles = "bg-red-500/10 hover:bg-red-500/15 border-red-500/20 dark:bg-red-500/5 dark:hover:bg-red-500/10 dark:border-transparent";
                    activeStyles = "bg-red-500/25 border-red-500/40 shadow-sm shadow-red-500/5 dark:bg-red-500/20 dark:border-red-500/30";
                    iconColor = "bg-red-500 shadow-red-500/30";
                    break;
                  case 'company': // Entreprises -> Orange
                    typeStyles = "bg-orange-500/10 hover:bg-orange-500/15 border-orange-500/20 dark:bg-orange-500/5 dark:hover:bg-orange-500/10 dark:border-transparent";
                    activeStyles = "bg-orange-500/25 border-orange-500/40 shadow-sm shadow-orange-500/5 dark:bg-orange-500/20 dark:border-orange-500/30";
                    iconColor = "bg-orange-500 shadow-orange-500/30";
                    break;
                }

                return (
                  <button
                    key={marker.id}
                    onClick={() => handleLocationClick(marker)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl text-sm transition-all duration-200 flex items-start gap-3 border mb-2",
                      activeMarkerId === marker.id ? activeStyles : typeStyles,
                      // Highlight jurisdiction if nearest
                      nearestJurisdiction?.id === marker.id && activeMarkerId !== marker.id ? "ring-1 ring-blue-500/30" : ""
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-2.5 h-2.5 rounded-full shrink-0 shadow-lg",
                      iconColor
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className={cn("font-medium leading-tight", activeMarkerId === marker.id ? "text-foreground" : "text-muted-foreground")}>
                          {marker.name}
                        </div>
                        {marker.distance !== undefined && (
                          <span className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                            {Math.round(marker.distance)} km
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>
                            {marker.address ? marker.address : `${marker.city}, ${marker.country}`}
                          </span>
                        </div>
                      </div>

                      {/* Status d'ouverture dans la liste */}
                      {openingStatus && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", openingStatus.status.includes('Fermé') ? "bg-red-500" : "bg-green-500")} />
                          <span className={cn("text-[10px] font-medium", openingStatus.status.includes('Fermé') ? "text-red-500" : "text-green-500")}>
                            {openingStatus.status.split('•')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative h-full bg-muted/20">
        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-md bg-background">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        )}

        {/* Overlay Info */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium border border-border shadow-sm">
          {filteredList.length} lieux trouvés
        </div>
      </div>
    </div>
  );
}
