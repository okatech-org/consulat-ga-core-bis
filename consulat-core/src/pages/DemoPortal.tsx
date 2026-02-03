import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimulationBanner } from "@/components/SimulationBanner";
import { MOCK_USERS } from "@/data/mock-users";
import { DemoUserCard } from "@/components/DemoUserCard";
import {
  TestTube2,
  Globe2,
  Building2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Users,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DEMO_EUROPE,
  DEMO_ASIA,
  DEMO_AMERICAS,
  DEMO_AFRICA,
  getDemoStats,
  type DemoCountryConfig,
  type DemoRepresentationConfig,
} from "@/data/demo-diplomatic-network";

export default function DemoPortal() {
  const stats = useMemo(() => getDemoStats(), []);
  const [selectedRegion, setSelectedRegion] = useState<string>('europe');
  const navigate = useNavigate();

  const regionData: Record<string, { label: string; countries: DemoCountryConfig[] }> = {
    europe: { label: '🇪🇺 Europe', countries: DEMO_EUROPE },
    asia: { label: '🌏 Asie', countries: DEMO_ASIA },
    americas: { label: '🌎 Amériques', countries: DEMO_AMERICAS },
    africa: { label: '🌍 Afrique', countries: DEMO_AFRICA },
  };

  const handleSelectRepresentation = (rep: DemoRepresentationConfig) => {
    // Store selected representation in localStorage for demo
    localStorage.setItem('demo_selected_representation', JSON.stringify({
      id: rep.id,
      type: rep.type,
      city: rep.city,
      enabledServices: rep.enabledServices,
    }));
    // Navigate to portal
    navigate(`/portal/${rep.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SimulationBanner />
      <Header />

      <main className="flex-1 py-12 bg-gradient-official">
        <div className="container">
          {/* Header Alert */}
          <div className="mb-8 animate-fade-in">
            <Alert className="bg-accent/10 border-accent max-w-4xl mx-auto">
              <TestTube2 className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Portail de Démonstration Multi-Entités
              </AlertTitle>
              <AlertDescription>
                Sélectionnez un pays puis une représentation diplomatique pour simuler différents scénarios.
                Chaque représentation propose des services adaptés (passeports, visas, état civil, etc.).
              </AlertDescription>
            </Alert>
          </div>

          {/* Title & Stats */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Globe2 className="h-10 w-10 text-primary" />
              Réseau Diplomatique Gabonais
            </h1>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span><strong>{stats.totalCountries}</strong> Pays</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-5 w-5" />
                <span><strong>{stats.totalRepresentations}</strong> Représentations</span>
              </div>
            </div>
          </div>

          {/* Super Admin Section */}
          <div className="mb-12 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Comptes Administrateur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
              {MOCK_USERS.filter(u => u.role === 'ADMIN').map(admin => (
                <div key={admin.id} className="transform hover:scale-105 transition-transform duration-300">
                  <DemoUserCard user={admin} />
                </div>
              ))}
            </div>
          </div>


          {/* Region Tabs */}

          {/* Region Tabs */}
          <div className="max-w-6xl mx-auto">
            <Tabs value={selectedRegion} onValueChange={setSelectedRegion}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {Object.entries(regionData).map(([key, { label }]) => (
                  <TabsTrigger key={key} value={key} className="text-sm md:text-base">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(regionData).map(([key, { countries }]) => (
                <TabsContent key={key} value={key} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countries.map((country, index) => (
                      <CountryCard
                        key={country.code}
                        country={country}
                        index={index}
                        onSelectRepresentation={handleSelectRepresentation}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Footer note */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Les simulations n'affectent pas les données de production et sont réinitialisées à chaque session
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================
// COUNTRY CARD
// ============================================================================

interface CountryCardProps {
  country: DemoCountryConfig;
  index: number;
  onSelectRepresentation: (rep: DemoRepresentationConfig) => void;
}

function CountryCard({ country, index, onSelectRepresentation }: CountryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const mainRep = country.representations.find(r => r.isMainRepresentation) || country.representations[0];
  const otherReps = country.representations.filter(r => r.id !== mainRep.id);
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden animate-scale-in hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl shadow-sm rounded-full bg-white/10 p-1">{country.flag}</span>
            <div>
              <CardTitle className="text-lg">{country.nameFr}</CardTitle>
              <CardDescription>
                {country.representations.length} représentation{country.representations.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Main Representation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
            <Building2 className="h-3 w-3" /> Représentations
          </h4>
          <RepresentationItem
            rep={mainRep}
            isMain
            onSelect={() => onSelectRepresentation(mainRep)}
          />

          {/* Other representations */}
          {otherReps.length > 0 && (
            <>
              {!expanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setExpanded(true)}
                >
                  Voir {otherReps.length} autre{otherReps.length > 1 ? 's' : ''} représentation{otherReps.length > 1 ? 's' : ''}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}

              {expanded && (
                <div className="space-y-2 pt-1 animate-in slide-in-from-top-1">
                  {otherReps.map(rep => (
                    <RepresentationItem
                      key={rep.id}
                      rep={rep}
                      onSelect={() => onSelectRepresentation(rep)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Separator */}
        <div className="h-px bg-border my-4" />

        {/* User Accounts Section (Country Level) */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-3">
            <Users className="h-3 w-3" /> Comptes Usagers ({country.nameFr})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <UserTypeAccessButton
              type="RESSORTISSANT_RESIDENT"
              label="Ressortissant Résident"
              desc="Vivant à l'étranger"
              icon="🇬🇦"
              color="text-green-600 bg-green-500/5 hover:bg-green-500/10 border-green-500/20"
              onClick={() => {
                localStorage.setItem('demo_selected_representation', JSON.stringify(mainRep));
                localStorage.setItem('demo_user_type', 'RESSORTISSANT_RESIDENT');
                navigate('/dashboard/citizen');
              }}
            />
            <UserTypeAccessButton
              type="RESSORTISSANT_DE_PASSAGE"
              label="Ressortissant de Passage"
              desc="Voyageur temporaire"
              icon="✈️"
              color="text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20"
              onClick={() => {
                localStorage.setItem('demo_selected_representation', JSON.stringify(mainRep));
                localStorage.setItem('demo_user_type', 'RESSORTISSANT_DE_PASSAGE');
                navigate('/dashboard/citizen');
              }}
            />
            <UserTypeAccessButton
              type="VISITEUR"
              label="Visiteur / Étranger"
              desc="Demandeur de Visa"
              icon="🌍"
              color="text-orange-600 bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20"
              onClick={() => {
                localStorage.setItem('demo_selected_representation', JSON.stringify(mainRep));
                localStorage.setItem('demo_user_type', 'VISITEUR');
                navigate('/dashboard/foreigner');
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
            * Ces comptes usagers sont rattachés par défaut à : {mainRep.city}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REPRESENTATION ITEM WITH ACCESS DETAILS
// ============================================================================

interface RepresentationItemProps {
  rep: DemoRepresentationConfig;
  isMain?: boolean;
  onSelect: () => void;
}

function RepresentationItem({ rep, isMain, onSelect }: RepresentationItemProps) {
  const [showAccess, setShowAccess] = useState(false);
  const navigate = useNavigate();

  const typeLabels: Record<string, string> = {
    ambassade: 'Ambassade',
    consulat_general: 'Consulat Général',
    consulat: 'Consulat',
    consulat_honoraire: 'Consulat Honoraire',
    delegation_permanente: 'Délégation Permanente',
  };

  const typeColors: Record<string, string> = {
    ambassade: 'bg-primary text-primary-foreground',
    consulat_general: 'bg-blue-500 text-white',
    consulat: 'bg-green-500 text-white',
    consulat_honoraire: 'bg-gray-400 text-white',
    delegation_permanente: 'bg-indigo-500 text-white',
  };

  // Filter staff for this entity
  const staff = useMemo(() => {
    return MOCK_USERS.filter(u =>
      u.entityId === rep.id &&
      u.role !== 'CITIZEN' &&
      u.role !== 'FOREIGNER'
    );
  }, [rep.id]);

  const toggleAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAccess(!showAccess);
  };

  return (
    <div className={`rounded-lg border transition-all ${isMain ? 'border-primary/50 bg-primary/5' : 'hover:bg-accent/50'}`}>
      <div
        className="p-3 cursor-pointer flex items-start justify-between gap-2"
        onClick={toggleAccess}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={typeColors[rep.type]} variant="secondary">
              {typeLabels[rep.type] || rep.type}
            </Badge>
            <span className="font-medium text-sm">{rep.city}</span>
          </div>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="truncate">{rep.contact.phone}</span>
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          {showAccess ? <ChevronRight className="h-4 w-4 rotate-90 transition-transform" /> : <ChevronRight className="h-4 w-4 transition-transform" />}
        </Button>
      </div>

      {/* ACCESS PANEL (STAFF ONLY) */}
      {showAccess && (
        <div className="p-3 border-t bg-background/50 space-y-4 animate-in slide-in-from-top-2">

          {/* 1. STAFF ACCOUNTS */}
          {staff.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Personnel Diplomatique
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {staff.map(user => (
                  <div key={user.id} className="scale-95 origin-left">
                    <DemoUserCard user={user} compact />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Aucun compte personnel configuré pour cette entité.</p>
          )}

          <Button className="w-full mt-2" size="sm" onClick={onSelect}>
            Accéder au Portail Public de cette entité
          </Button>
        </div>
      )}
    </div>
  );
}

function UserTypeAccessButton({ type, label, desc, icon, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-2 rounded-md transition-colors text-left border border-transparent hover:border-border ${color}`}
    >
      <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-lg shadow-sm">
        {icon}
      </div>
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-[10px] opacity-80">{desc}</div>
      </div>
      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
    </button>
  );
}
