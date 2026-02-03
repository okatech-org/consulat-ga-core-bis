import { MOCK_ENTITIES } from "@/data/mock-entities";
import { COUNTRY_FLAGS } from "@/types/entity";

export function WorldMapDashboard() {
  const entityCount = MOCK_ENTITIES.length;
  const activeCount = MOCK_ENTITIES.filter((e) => e.isActive).length;

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg overflow-hidden border animate-fade-in">
      {/* Background World Map SVG */}
      <svg
        viewBox="0 0 1200 600"
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified continents outline */}
        <path
          d="M100,200 Q200,150 300,200 T500,200 Q600,250 700,200 T900,200 Q1000,150 1100,200"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-primary"
        />
        <path
          d="M150,300 Q250,280 350,320 T550,300 Q650,350 750,300 T950,320"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-primary"
        />
        <path
          d="M200,400 Q300,380 400,420 T600,400"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-primary"
        />
      </svg>

      {/* Entity Markers */}
      <div className="absolute inset-0">
        {MOCK_ENTITIES.map((entity, index) => {
          // Position calculée selon l'index (simulation)
          const positions = [
            { x: 25, y: 35 },  // USA
            { x: 50, y: 30 },  // France
            { x: 75, y: 35 },  // Chine
            { x: 52, y: 55 },  // Sénégal
          ];
          const pos = positions[index % positions.length];

          return (
            <div
              key={entity.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {/* Pulse effect */}
              <div className="absolute inset-0 w-8 h-8 -m-4 bg-primary/20 rounded-full animate-ping" />
              
              {/* Main marker */}
              <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform cursor-pointer group">
                <span className="text-xl">{COUNTRY_FLAGS[entity.countryCode]}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2">
                    <p className="font-semibold text-sm">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">{entity.city}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-3 shadow-lg">
          <h3 className="text-2xl font-bold text-primary">{entityCount}</h3>
          <p className="text-xs text-muted-foreground">Entités Total</p>
        </div>
        <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-3 shadow-lg">
          <h3 className="text-2xl font-bold text-green-600">{activeCount}</h3>
          <p className="text-xs text-muted-foreground">Actives</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium mb-1">Légende</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span>Représentation active</span>
        </div>
      </div>
    </div>
  );
}
