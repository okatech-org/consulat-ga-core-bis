/**
 * OrganizationsAdminPage
 * Admin page for listing and managing all organizations
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Building2,
    MoreVertical,
    Settings,
    Ban,
    CheckCircle,
    Trash2,
    Plus,
    Globe,
} from 'lucide-react';
import { DIPLOMATIC_NETWORK } from '@/data/mock-diplomatic-network';
import { getEnabledServicesForOrganization } from '@/data/organization-services';
import type { Organization } from '@/types/organization';

/**
 * Admin page for managing organizations (consulates/embassies)
 */
export function OrganizationsAdminPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Get all organizations
    const organizations = useMemo(() => {
        return DIPLOMATIC_NETWORK.map(org => ({
            ...org,
            servicesCount: getEnabledServicesForOrganization(org.id).length,
        }));
    }, []);

    // Filter organizations
    const filteredOrganizations = useMemo(() => {
        return organizations.filter(org => {
            const matchesSearch =
                org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.metadata?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.metadata?.country?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'all' || org.type === typeFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && org.isActive) ||
                (statusFilter === 'inactive' && !org.isActive);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [organizations, searchTerm, typeFilter, statusFilter]);

    // Get unique types
    const orgTypes = [...new Set(organizations.map(o => o.type))];

    // Stats
    const stats = useMemo(() => ({
        total: organizations.length,
        active: organizations.filter(o => o.isActive).length,
        byType: orgTypes.reduce((acc, type) => {
            acc[type] = organizations.filter(o => o.type === type).length;
            return acc;
        }, {} as Record<string, number>),
    }), [organizations, orgTypes]);

    return (
        <div className="container mx-auto space-y-6 py-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Organisations</h1>
                    <p className="text-muted-foreground">
                        Administrez les consulats et ambassades du réseau diplomatique
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle organisation
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.active}</p>
                            <p className="text-sm text-muted-foreground">Actives</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Globe className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.byType['AMBASSADE'] || 0}</p>
                            <p className="text-sm text-muted-foreground">Ambassades</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                            <Building2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.byType['CONSULAT_GENERAL'] || 0}</p>
                            <p className="text-sm text-muted-foreground">Consulats Généraux</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, ville, pays..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                {orgTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {getTypeLabel(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="active">Actif</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Organizations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Organisations ({filteredOrganizations.length})</CardTitle>
                    <CardDescription>
                        Liste des représentations diplomatiques gabonaises à travers le monde
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Organisation</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Pays</TableHead>
                                <TableHead>Services</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrganizations.slice(0, 20).map(org => (
                                <OrganizationRow key={org.id} organization={org} />
                            ))}
                        </TableBody>
                    </Table>

                    {filteredOrganizations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium">Aucune organisation trouvée</p>
                            <p className="text-sm text-muted-foreground">
                                Essayez de modifier vos filtres
                            </p>
                        </div>
                    )}

                    {filteredOrganizations.length > 20 && (
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Affichage de 20 sur {filteredOrganizations.length} organisations
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface OrganizationRowProps {
    organization: Organization & { servicesCount: number };
}

function OrganizationRow({ organization }: OrganizationRowProps) {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">{organization.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {organization.metadata?.city}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline">{getTypeLabel(organization.type)}</Badge>
            </TableCell>
            <TableCell>{organization.metadata?.country}</TableCell>
            <TableCell>
                <Badge variant="secondary">{organization.servicesCount}</Badge>
            </TableCell>
            <TableCell>
                {organization.isActive ? (
                    <Badge className="bg-green-100 text-green-700">Actif</Badge>
                ) : (
                    <Badge variant="destructive">Inactif</Badge>
                )}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link to={`/admin/organizations/${organization.id}`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Configurer
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {organization.isActive ? (
                                <>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Désactiver
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activer
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        AMBASSADE: 'Ambassade',
        CONSULAT_GENERAL: 'Consulat Général',
        CONSULAT: 'Consulat',
        HAUT_COMMISSARIAT: 'Haut-Commissariat',
        MISSION_PERMANENTE: 'Mission Permanente',
        CONSULAT_HONORAIRE: 'Consulat Honoraire',
        AUTRE: 'Autre',
    };
    return labels[type] || type;
}

export default OrganizationsAdminPage;
