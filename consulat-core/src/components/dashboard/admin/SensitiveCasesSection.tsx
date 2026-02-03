import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ArrowRight, User } from "lucide-react";

interface SensitiveCase {
    requestId: string;
    priority: 'urgent' | 'critical';
    status: string;
    serviceName: string;
    profileName: string;
    assignedTo: string;
    createdAt: number;
    timeElapsed: string;
    daysElapsed: number;
    isVIP: boolean;
    type: 'emergency' | 'urgent';
}

const MOCK_SENSITIVE_CASES: SensitiveCase[] = [
    {
        requestId: 'REQ-001',
        priority: 'critical',
        status: 'under_review',
        serviceName: 'Laissez-passer',
        profileName: 'Jean-Michel Nguema',
        assignedTo: 'Non assigné',
        createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
        timeElapsed: '2j 0h',
        daysElapsed: 2,
        isVIP: true,
        type: 'emergency'
    },
    {
        requestId: 'REQ-002',
        priority: 'urgent',
        status: 'submitted',
        serviceName: 'Visa Humanitaire',
        profileName: 'Sarah Connor',
        assignedTo: 'Agent Smith',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
        timeElapsed: '5j 3h',
        daysElapsed: 5,
        isVIP: false,
        type: 'urgent'
    },
    {
        requestId: 'REQ-003',
        priority: 'urgent',
        status: 'pending',
        serviceName: 'Rapatriement Corps',
        profileName: 'Famille Koumba',
        assignedTo: 'Consul Adjoint',
        createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
        timeElapsed: '0j 12h',
        daysElapsed: 0,
        isVIP: false,
        type: 'urgent'
    }
];

export function SensitiveCasesSection({ data = MOCK_SENSITIVE_CASES }: { data?: SensitiveCase[] }) {
    return (
        <Card className="neu-raised h-full border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Dossiers Sensibles & Urgences
                </CardTitle>
                <Badge variant="destructive" className="rounded-full px-3">
                    {data.length} cas
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((caseItem) => (
                        <div key={caseItem.requestId} className="neu-inset p-3 rounded-lg flex items-start justify-between group hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                                <div className={`p-2 rounded-full h-fit ${caseItem.priority === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">{caseItem.profileName}</span>
                                        {caseItem.isVIP && <Badge variant="secondary" className="text-[10px] h-4 px-1">VIP</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        {caseItem.serviceName} • <span className="font-medium text-foreground">{caseItem.timeElapsed}</span>
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        {caseItem.assignedTo}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full text-xs neu-raised border-none mt-2">
                        Voir tous les dossiers urgents
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
