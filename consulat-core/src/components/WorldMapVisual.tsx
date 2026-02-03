export function WorldMapVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <svg
        viewBox="0 0 1200 600"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified world map outline */}
        <path
          d="M100,200 Q200,150 300,200 T500,200 Q600,250 700,200 T900,200 Q1000,150 1100,200"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-primary/30"
        />
        <path
          d="M150,300 Q250,280 350,320 T550,300 Q650,350 750,300 T950,320"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-primary/30"
        />
        
        {/* Location markers with pulse animation */}
        {[
          { x: 250, y: 220, label: 'USA' },
          { x: 550, y: 240, label: 'FR' },
          { x: 850, y: 260, label: 'CN' },
          { x: 600, y: 350, label: 'SN' },
        ].map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              className="fill-primary animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="15"
              className="fill-primary/20 animate-ping"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
