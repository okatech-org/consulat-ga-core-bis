import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, ThumbsUp, Activity } from "lucide-react";

// Mock Data Types
interface KPIData {
    satisfactionRate: number;
    avgProcessingDays: number;
    targetDays: number;
    performanceVsTarget: number;
    monthOverMonth: {
        current: number;
        previous: number;
        changePercent: number;
        isPositive: boolean;
    };
}

// Mock Data Generator (since backend is not connected)
const MOCK_KPI_DATA: KPIData = {
    satisfactionRate: 92.5,
    avgProcessingDays: 4.2,
    targetDays: 7,
    performanceVsTarget: 40, // (7 - 4.2) / 7 * 100
    monthOverMonth: {
        current: 145,
        previous: 120,
        changePercent: 20.8,
        isPositive: true,
    }
};

export function KPITrendsCard({ data = MOCK_KPI_DATA }: { data?: KPIData }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Satisfaction Rate */}
            <Card className="neu-raised">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Satisfaction Usagers</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{data.satisfactionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                        +2.1% par rapport au mois dernier
                    </p>
                </CardContent>
            </Card>

            {/* Processing Time */}
            <Card className="neu-raised">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Délai Moyen Traitement</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{data.avgProcessingDays} jours</div>
                    <p className="text-xs text-muted-foreground">
                        Cible: {data.targetDays} jours ({data.performanceVsTarget > 0 ? 'Avance' : 'Retard'})
                    </p>
                </CardContent>
            </Card>

            {/* Monthly Volume */}
            <Card className="neu-raised">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Volume Mensuel</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.monthOverMonth.current}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        {data.monthOverMonth.isPositive ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={data.monthOverMonth.isPositive ? "text-green-500" : "text-red-500"}>
                            {data.monthOverMonth.changePercent}%
                        </span>
                        <span className="ml-1">vs mois dernier</span>
                    </div>
                </CardContent>
            </Card>

            {/* Efficiency Score */}
            <Card className="neu-raised">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Efficacité Opérationnelle</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">A+</div>
                    <p className="text-xs text-muted-foreground">
                        Top 5% du réseau consulaire
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
