import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

const requestsByType = [
  { name: 'Passeport', value: 145, color: 'hsl(var(--primary))' },
  { name: 'Visa', value: 89, color: 'hsl(var(--chart-2))' },
  { name: 'État Civil', value: 234, color: 'hsl(var(--chart-3))' },
  { name: 'Légalisation', value: 167, color: 'hsl(var(--chart-4))' },
  { name: 'Carte Consulaire', value: 78, color: 'hsl(var(--chart-5))' },
];

const monthlyTrends = [
  { month: 'Jan', demandes: 120, traitees: 98, rdv: 45 },
  { month: 'Fév', demandes: 145, traitees: 130, rdv: 52 },
  { month: 'Mar', demandes: 189, traitees: 165, rdv: 78 },
  { month: 'Avr', demandes: 156, traitees: 142, rdv: 65 },
  { month: 'Mai', demandes: 201, traitees: 178, rdv: 89 },
  { month: 'Juin', demandes: 234, traitees: 210, rdv: 95 },
];

const performanceByAgent = [
  { agent: 'M. Nzoghe', traites: 45, enCours: 12, satisfaction: 4.8 },
  { agent: 'Mme Obiang', traites: 38, enCours: 8, satisfaction: 4.9 },
  { agent: 'M. Ndong', traites: 52, enCours: 15, satisfaction: 4.6 },
  { agent: 'Mme Essono', traites: 41, enCours: 10, satisfaction: 4.7 },
];

export function RequestsByTypeChart() {
  return (
    <Card className="neu-raised">
      <CardHeader>
        <CardTitle className="text-lg">Répartition par Type de Demande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={requestsByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {requestsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyTrendsChart() {
  return (
    <Card className="neu-raised">
      <CardHeader>
        <CardTitle className="text-lg">Tendances Mensuelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTraitees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="demandes" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorDemandes)"
                strokeWidth={2}
                name="Demandes reçues"
              />
              <Area 
                type="monotone" 
                dataKey="traitees" 
                stroke="hsl(var(--chart-2))" 
                fill="url(#colorTraitees)"
                strokeWidth={2}
                name="Demandes traitées"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentPerformanceChart() {
  return (
    <Card className="neu-raised">
      <CardHeader>
        <CardTitle className="text-lg">Performance des Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceByAgent} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="agent" type="category" width={100} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="traites" fill="hsl(var(--primary))" name="Dossiers traités" radius={[0, 4, 4, 0]} />
              <Bar dataKey="enCours" fill="hsl(var(--chart-4))" name="En cours" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickStatsGrid() {
  const stats = [
    { label: 'Total Demandes', value: '1,234', change: '+12%', positive: true },
    { label: 'En Attente', value: '89', change: '-5%', positive: true },
    { label: 'Traitées ce mois', value: '456', change: '+23%', positive: true },
    { label: 'Temps moyen', value: '3.2j', change: '-0.5j', positive: true },
    { label: 'Satisfaction', value: '4.7/5', change: '+0.2', positive: true },
    { label: 'RDV planifiés', value: '78', change: '+8', positive: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="neu-raised">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
