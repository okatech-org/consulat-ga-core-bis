import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { useStatistics } from '@/hooks/useStatistics';
import { FileText, Clock, CheckCircle, CalendarDays, TrendingUp, Users } from 'lucide-react';

export function RealTimeQuickStats() {
  const { stats, loading } = useStatistics();

  const statsData = [
    { label: 'Total Demandes', value: stats.totalRequests.toLocaleString(), icon: FileText, change: '+12%' },
    { label: 'En Attente', value: stats.pendingRequests.toString(), icon: Clock, change: '-5%' },
    { label: 'Traitées ce mois', value: stats.completedThisMonth.toString(), icon: CheckCircle, change: '+23%' },
    { label: 'Temps moyen', value: stats.averageProcessingTime, icon: TrendingUp, change: '-0.5j' },
    { label: 'Satisfaction', value: stats.satisfactionRate, icon: Users, change: '+0.2' },
    { label: 'RDV planifiés', value: stats.scheduledAppointments.toString(), icon: CalendarDays, change: '+8' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="neu-raised">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.label} className="neu-raised hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-green-600">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RealTimeRequestsByType() {
  const { stats, loading } = useStatistics();

  if (loading) {
    return (
      <Card className="neu-raised">
        <CardHeader>
          <CardTitle className="text-lg">Répartition par Type de Demande</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neu-raised">
      <CardHeader>
        <CardTitle className="text-lg">Répartition par Type de Demande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {stats.requestsByType.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.requestsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.requestsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RealTimeMonthlyTrends() {
  const { stats, loading } = useStatistics();

  if (loading) {
    return (
      <Card className="neu-raised">
        <CardHeader>
          <CardTitle className="text-lg">Tendances Mensuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neu-raised">
      <CardHeader>
        <CardTitle className="text-lg">Tendances Mensuelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {stats.monthlyTrends.every(m => m.demandes === 0 && m.traitees === 0) ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrends}>
                <defs>
                  <linearGradient id="colorDemandesReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTraiteesReal" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorDemandesReal)"
                  strokeWidth={2}
                  name="Demandes reçues"
                />
                <Area 
                  type="monotone" 
                  dataKey="traitees" 
                  stroke="hsl(var(--chart-2))" 
                  fill="url(#colorTraiteesReal)"
                  strokeWidth={2}
                  name="Demandes traitées"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
