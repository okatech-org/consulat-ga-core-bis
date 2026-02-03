import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, MapPin, Shield } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConsularRole } from "@/types/consular-roles";

// Mock Agent Data
interface Agent {
    id: string;
    name: string;
    role: ConsularRole;
    email: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'leave';
    assignedServices: string[];
    assignedCountries: string[];
    managerId?: string;
}

const MOCK_AGENTS: Agent[] = [
    {
        id: '1',
        name: 'Jean-Pierre Mba',
        role: ConsularRole.CONSUL,
        email: 'jp.mba@consulat.ga',
        status: 'active',
        assignedServices: ['Passeports', 'Visas'],
        assignedCountries: ['France'],
    },
    {
        id: '2',
        name: 'Sophie Nze',
        role: ConsularRole.VICE_CONSUL,
        email: 's.nze@consulat.ga',
        status: 'active',
        assignedServices: ['État Civil'],
        assignedCountries: ['France'],
        managerId: '1'
    },
    {
        id: '3',
        name: 'Marc Ondo',
        role: ConsularRole.AGENT_CONSULAIRE,
        email: 'm.ondo@consulat.ga',
        status: 'leave',
        assignedServices: ['Légalisations'],
        assignedCountries: ['France'],
        managerId: '2'
    },
    {
        id: '4',
        name: 'Alice Koumba',
        role: ConsularRole.STAGIAIRE,
        email: 'a.koumba@consulat.ga',
        status: 'active',
        assignedServices: ['Accueil'],
        assignedCountries: ['France'],
        managerId: '2'
    }
];

export default function AgentsPage() {
    const { currentUser } = useDemo();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | null>(null);

    const filteredAgents = MOCK_AGENTS.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? agent.role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestion des Agents</h1>
                    <p className="text-muted-foreground">
                        Gérez l'équipe consulaire, les rôles et les affectations.
                    </p>
                </div>
                <Button className="neu-raised gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter un Agent
                </Button>
            </div>

            {/* Filters */}
            <Card className="neu-raised">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Rechercher un agent..."
                            className="pl-9 neu-inset"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="neu-raised gap-2" onClick={() => setRoleFilter(null)}>
                            <Filter className="w-4 h-4" />
                            Tous les rôles
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="neu-raised hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                    <AvatarImage src={agent.avatar} />
                                    <AvatarFallback>{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base font-bold">{agent.name}</CardTitle>
                                    <CardDescription className="text-xs flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        {agent.role.replace('_', ' ')}
                                    </CardDescription>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                                    <DropdownMenuItem>Modifier les droits</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Désactiver le compte</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{agent.email}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                    {agent.assignedServices.map(service => (
                                        <Badge key={service} variant="secondary" className="text-[10px]">
                                            {service}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {agent.assignedCountries.join(', ')}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <Badge variant={agent.status === 'active' ? 'default' : agent.status === 'leave' ? 'secondary' : 'destructive'} className="capitalize">
                                    {agent.status === 'leave' ? 'En congé' : agent.status}
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                    Détails
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
