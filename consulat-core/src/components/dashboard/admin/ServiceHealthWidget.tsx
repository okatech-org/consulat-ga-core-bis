import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface ServiceHealth {
    serviceId: string;
    serviceName: string;
    category: string;
    totalRequests: number;
    pendingRequests: number;
    availableAgents: number;
    capacityPercent: number;
    avgWaitDays: number;
    alertStatus: 'normal' | 'warning' | 'critical';
}

const MOCK_SERVICE_HEALTH: ServiceHealth[] = [
    {
        serviceId: '1',
        serviceName: 'Passeports',
        category: 'Identité',
        totalRequests: 150,
        pendingRequests: 45,
        availableAgents: 3,
        capacityPercent: 85,
        avgWaitDays: 5.2,
        alertStatus: 'warning'
    },
    {
        serviceId: '2',
        serviceName: 'Visas',
        category: 'Voyage',
        totalRequests: 80,
        pendingRequests: 12,
        availableAgents: 2,
        capacityPercent: 40,
        avgWaitDays: 2.1,
        alertStatus: 'normal'
    },
    {
        serviceId: '3',
        serviceName: 'État Civil',
        category: 'Civil',
        totalRequests: 200,
        pendingRequests: 8,
        availableAgents: 2,
        capacityPercent: 25,
        avgWaitDays: 1.5,
        alertStatus: 'normal'
    },
    {
        serviceId: '4',
        serviceName: 'Légalisations',
        category: 'Administratif',
        totalRequests: 300,
        pendingRequests: 90,
        availableAgents: 1,
        capacityPercent: 95,
        avgWaitDays: 8.5,
        alertStatus: 'critical'
    }
];

export function ServiceHealthWidget({ data = MOCK_SERVICE_HEALTH }: { data?: ServiceHealth[] }) {
    return (
        <Card className="neu-raised h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5 text-primary" />
                    Santé des Services
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {data.map((service) => (
                        <div key={service.serviceId} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {service.alertStatus === 'critical' ? (
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                    ) : service.alertStatus === 'warning' ? (
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="font-medium text-sm">{service.serviceName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{service.pendingRequests} en attente</span>
                                    <Badge variant={service.alertStatus === 'normal' ? 'outline' : service.alertStatus === 'warning' ? 'secondary' : 'destructive'} className="text-[10px] h-5">
                                        {service.avgWaitDays}j attente
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Charge: {service.capacityPercent}%</span>
                                    <span>{service.availableAgents} agents actifs</span>
                                </div>
                                <Progress
                                    value={service.capacityPercent}
                                    className={`h-2 ${service.alertStatus === 'critical' ? 'bg-red-100 [&>div]:bg-red-500' :
                                            service.alertStatus === 'warning' ? 'bg-yellow-100 [&>div]:bg-yellow-500' :
                                                'bg-green-100 [&>div]:bg-green-500'
                                        }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
