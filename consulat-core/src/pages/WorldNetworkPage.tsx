import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import {
    Globe,
    MapPin,
    Building2,
    Phone,
    Mail,
    ChevronRight,
    Search,
    Map,
    LayoutGrid,
    ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DIPLOMATIC_NETWORK } from "@/data/mock-diplomatic-network";
import { OrganizationType } from "@/types/organization";

// ============================================================================
// CONTINENT CONFIGURATION
// ============================================================================

const CONTINENTS = [
    { id: 'africa', name: 'Afrique', emoji: '🌍', countries: ['ZA', 'DZ', 'AO', 'BJ', 'CM', 'CG', 'CI', 'EG', 'ET', 'GQ', 'GN', 'LY', 'MA', 'NG', 'CD', 'SN', 'TG', 'TN', 'RW', 'ST'] },
    { id: 'europe', name: 'Europe', emoji: '🇪🇺', countries: ['DE', 'BE', 'ES', 'FR', 'IT', 'PT', 'GB', 'RU', 'CH', 'VA', 'MC'] },
    { id: 'asia', name: 'Asie', emoji: '🌏', countries: ['CN', 'IN', 'JP', 'KR', 'TR', 'IR'] },
    { id: 'americas', name: 'Amériques', emoji: '🌎', countries: ['US', 'CA', 'BR', 'MX', 'AR', 'CU'] },
    { id: 'middle_east', name: 'Moyen-Orient', emoji: '🕌', countries: ['SA', 'AE', 'QA', 'KW', 'LB'] },
];

const COUNTRY_NAMES: Record<string, string> = {
    ZA: 'Afrique du Sud', DZ: 'Algérie', AO: 'Angola', BJ: 'Bénin', CM: 'Cameroun',
    CG: 'Congo', CI: 'Côte d\'Ivoire', EG: 'Égypte', ET: 'Éthiopie', GQ: 'Guinée Équatoriale',
    GN: 'Guinée', LY: 'Libye', MA: 'Maroc', NG: 'Nigeria', CD: 'RD Congo', RW: 'Rwanda', ST: 'São Tomé',
    SN: 'Sénégal', TG: 'Togo', TN: 'Tunisie',
    DE: 'Allemagne', BE: 'Belgique', ES: 'Espagne', FR: 'France', IT: 'Italie',
    PT: 'Portugal', GB: 'Royaume-Uni', RU: 'Russie', CH: 'Suisse', VA: 'Vatican', MC: 'Monaco',
    CN: 'Chine', IN: 'Inde', JP: 'Japon', KR: 'Corée du Sud', TR: 'Turquie', IR: 'Iran',
    US: 'États-Unis', CA: 'Canada', BR: 'Brésil', MX: 'Mexique', AR: 'Argentine', CU: 'Cuba',
    SA: 'Arabie Saoudite', AE: 'Émirats Arabes Unis', QA: 'Qatar', KW: 'Koweït', LB: 'Liban',
};

const COUNTRY_FLAGS: Record<string, string> = {
    ZA: '🇿🇦', DZ: '🇩🇿', AO: '🇦🇴', BJ: '🇧🇯', CM: '🇨🇲', CG: '🇨🇬', CI: '🇨🇮',
    EG: '🇪🇬', ET: '🇪🇹', GQ: '🇬🇶', GN: '🇬🇳', LY: '🇱🇾', MA: '🇲🇦', NG: '🇳🇬',
    CD: '🇨🇩', SN: '🇸🇳', TG: '🇹🇬', TN: '🇹🇳', RW: '🇷🇼', ST: '🇸🇹',
    DE: '🇩🇪', BE: '🇧🇪', ES: '🇪🇸', FR: '🇫🇷', IT: '🇮🇹', PT: '🇵🇹', GB: '🇬🇧',
    RU: '🇷🇺', CH: '🇨🇭', VA: '🇻🇦', MC: '🇲🇨',
    CN: '🇨🇳', IN: '🇮🇳', JP: '🇯🇵', KR: '🇰🇷', TR: '🇹🇷', IR: '🇮🇷',
    US: '🇺🇸', CA: '🇨🇦', BR: '🇧🇷', MX: '🇲🇽', AR: '🇦🇷', CU: '🇨🇺',
    SA: '🇸🇦', AE: '🇦🇪', QA: '🇶🇦', KW: '🇰🇼', LB: '🇱🇧',
};

const TYPE_LABELS: Record<string, string> = {
    [OrganizationType.AMBASSADE]: 'Ambassade',
    [OrganizationType.CONSULAT_GENERAL]: 'Consulat Général',
    [OrganizationType.CONSULAT]: 'Consulat',
    [OrganizationType.HAUT_COMMISSARIAT]: 'Haut-Commissariat',
    [OrganizationType.MISSION_PERMANENTE]: 'Mission Permanente',
    [OrganizationType.CONSULAT_HONORAIRE]: 'Consulat Honoraire',
};

const TYPE_COLORS: Record<string, string> = {
    [OrganizationType.AMBASSADE]: 'bg-emerald-500 text-white',
    [OrganizationType.CONSULAT_GENERAL]: 'bg-blue-500 text-white',
    [OrganizationType.CONSULAT]: 'bg-sky-500 text-white',
    [OrganizationType.HAUT_COMMISSARIAT]: 'bg-purple-500 text-white',
    [OrganizationType.MISSION_PERMANENTE]: 'bg-indigo-500 text-white',
    [OrganizationType.CONSULAT_HONORAIRE]: 'bg-gray-400 text-white',
};

export default function WorldNetworkPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
    const [selectedContinent, setSelectedContinent] = useState<string>('all');

    // Group by country
    const representationsByCountry = useMemo(() => {
        const grouped: Record<string, typeof DIPLOMATIC_NETWORK> = {};
        DIPLOMATIC_NETWORK.forEach(rep => {
            const code = rep.metadata?.countryCode || 'XX';
            if (!grouped[code]) grouped[code] = [];
            grouped[code].push(rep);
        });
        return grouped;
    }, []);

    // Get continent for country
    const getContinentForCountry = (code: string) =>
        CONTINENTS.find(c => c.countries.includes(code));

    // Filter by search and continent
    const filteredCountries = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return Object.entries(representationsByCountry).filter(([code, reps]) => {
            // Continent filter
            if (selectedContinent !== 'all') {
                const continent = getContinentForCountry(code);
                if (continent?.id !== selectedContinent) return false;
            }
            // Search filter
            if (query) {
                const countryName = COUNTRY_NAMES[code]?.toLowerCase() || '';
                const repNames = reps.map(r => r.name.toLowerCase()).join(' ');
                const cities = reps.map(r => r.metadata?.city?.toLowerCase() || '').join(' ');
                return countryName.includes(query) || repNames.includes(query) || cities.includes(query);
            }
            return true;
        }).sort((a, b) => {
            const nameA = COUNTRY_NAMES[a[0]] || a[0];
            const nameB = COUNTRY_NAMES[b[0]] || b[0];
            return nameA.localeCompare(nameB);
        });
    }, [representationsByCountry, searchQuery, selectedContinent]);

    // Stats
    const stats = useMemo(() => ({
        total: DIPLOMATIC_NETWORK.length,
        countries: Object.keys(representationsByCountry).length,
        ambassades: DIPLOMATIC_NETWORK.filter(r => r.type === OrganizationType.AMBASSADE).length,
    }), [representationsByCountry]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 py-8 bg-gradient-to-b from-background to-muted/20">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                            <Globe className="w-7 h-7 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            Réseau Diplomatique Mondial
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{stats.total} représentations</span>
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{stats.countries} pays</span>
                            <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{stats.ambassades} ambassades</span>
                        </div>
                    </div>

                    {/* Search & View Toggle */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 max-w-4xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un pays, une ville, une représentation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'map' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('map')}
                                className="flex items-center gap-2"
                            >
                                <Map className="h-4 w-4" />
                                Carte
                            </Button>
                            <Button
                                variant={viewMode === 'cards' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('cards')}
                                className="flex items-center gap-2"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Cartes
                            </Button>
                        </div>
                    </div>

                    {/* View Content */}
                    {viewMode === 'map' ? (
                        <div className="max-w-7xl mx-auto">
                            <InteractiveWorldMap />
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            {/* Continent Tabs */}
                            <Tabs value={selectedContinent} onValueChange={setSelectedContinent} className="mb-6">
                                <TabsList className="flex flex-wrap h-auto gap-2 justify-center">
                                    <TabsTrigger value="all" className="text-sm">
                                        🌐 Tous ({Object.keys(representationsByCountry).length})
                                    </TabsTrigger>
                                    {CONTINENTS.map(c => {
                                        const count = Object.keys(representationsByCountry).filter(code =>
                                            c.countries.includes(code)
                                        ).length;
                                        if (count === 0) return null;
                                        return (
                                            <TabsTrigger key={c.id} value={c.id} className="text-sm">
                                                {c.emoji} {c.name} ({count})
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </Tabs>

                            {/* Country Cards Grid */}
                            {filteredCountries.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Aucun résultat trouvé pour "{searchQuery}"
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredCountries.map(([countryCode, representations], index) => (
                                        <CountryCard
                                            key={countryCode}
                                            countryCode={countryCode}
                                            representations={representations}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

// ============================================================================
// COUNTRY CARD COMPONENT (Like DemoPortal)
// ============================================================================

interface CountryCardProps {
    countryCode: string;
    representations: typeof DIPLOMATIC_NETWORK;
    index: number;
}

function CountryCard({ countryCode, representations, index }: CountryCardProps) {
    const [expanded, setExpanded] = useState(false);
    const mainRep = representations.find(r => r.type === OrganizationType.AMBASSADE) || representations[0];
    const otherReps = representations.filter(r => r.id !== mainRep.id);

    return (
        <Card
            className="overflow-hidden animate-fade-in hover:shadow-lg transition-shadow"
            style={{ animationDelay: `${index * 0.03}s` }}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{COUNTRY_FLAGS[countryCode] || '🏳️'}</span>
                    <div>
                        <CardTitle className="text-lg">{COUNTRY_NAMES[countryCode] || countryCode}</CardTitle>
                        <CardDescription>
                            {representations.length} représentation{representations.length > 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Main Representation */}
                <RepresentationItem rep={mainRep} isMain />

                {/* Other representations */}
                {otherReps.length > 0 && (
                    <>
                        {!expanded ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground"
                                onClick={() => setExpanded(true)}
                            >
                                +{otherReps.length} autre{otherReps.length > 1 ? 's' : ''} représentation{otherReps.length > 1 ? 's' : ''}
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="space-y-2 pt-2 border-t">
                                {otherReps.map(rep => (
                                    <RepresentationItem key={rep.id} rep={rep} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================================================
// REPRESENTATION ITEM
// ============================================================================

function RepresentationItem({ rep, isMain }: { rep: typeof DIPLOMATIC_NETWORK[0]; isMain?: boolean }) {
    const metadata = rep.metadata || {};
    const contact = (metadata.contact || {}) as { address?: string; phone?: string; email?: string };

    return (
        <div className={`rounded-lg border p-3 ${isMain ? 'border-primary/30 bg-primary/5' : ''}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={TYPE_COLORS[rep.type] || 'bg-gray-500'} variant="secondary">
                            {TYPE_LABELS[rep.type] || rep.type}
                        </Badge>
                        <span className="text-sm font-medium">{metadata.city}</span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                        {contact.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                            </div>
                        )}
                        {contact.email && (
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{contact.email}</span>
                            </div>
                        )}
                    </div>
                </div>
                <a
                    href={`/portal/${rep.id}`}
                    className="text-primary hover:text-primary/80"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}
