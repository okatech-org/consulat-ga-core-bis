import { Building2, FileText, Users, Globe, Activity, Plus, ShieldCheck, Settings, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Organization, OrganizationType } from "@/types/organization";
import { organizationService } from "@/services/organizationService";
import { profileService } from "@/services/profileService";
import { ConsularRole } from "@/types/consular-roles";
import { COUNTRY_FLAGS } from "@/types/entity";

interface DashboardProfile {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    organization_id?: string;
    organization?: {
        name: string;
        metadata: any;
    };
}
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 5;

const variants = {
    enter: (direction: number) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        };
    }
};

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const [entities, setEntities] = useState<Organization[]>([]);
    const [users, setUsers] = useState<DashboardProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Global Search State
    const [globalSearch, setGlobalSearch] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orgsData = await organizationService.getAll();
                const usersData = await profileService.getAll() as unknown as DashboardProfile[];
                setEntities(orgsData);
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Global Search Logic
    const searchResults = useMemo(() => {
        if (!globalSearch || globalSearch.length < 2) return { users: [], entities: [] };

        const lowerTerm = globalSearch.toLowerCase();

        const filteredUsers = users.filter(u =>
            (u.first_name + " " + u.last_name).toLowerCase().includes(lowerTerm) ||
            u.email?.toLowerCase().includes(lowerTerm)
        ).slice(0, 5);

        const filteredEntities = entities.filter(e =>
            e.name.toLowerCase().includes(lowerTerm) ||
            e.metadata?.city?.toLowerCase().includes(lowerTerm) ||
            e.metadata?.country?.toLowerCase().includes(lowerTerm)
        ).slice(0, 5);

        return { users: filteredUsers, entities: filteredEntities };
    }, [globalSearch, users, entities]);

    // Calculate Real Stats
    const totalEntities = entities.length;
    const totalUsers = users.length;
    const uniqueCountries = new Set(entities.map(e => e.metadata?.countryCode).filter(Boolean)).size;
    const totalConsuls = users.filter(u => u.role === ConsularRole.CONSUL_GENERAL || u.role === ConsularRole.CONSUL).length;

    const totalPages = Math.ceil(totalEntities / ITEMS_PER_PAGE);
    const startIndex = page * ITEMS_PER_PAGE;
    const paginatedEntities = entities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection][0]);
        setDirection(newDirection);
    };

    const stats = [
        { label: "Organisations", value: totalEntities, icon: Building2, color: "text-blue-600" },
        { label: "Pays Couverts", value: uniqueCountries, icon: Globe, color: "text-orange-600" },
        { label: "Utilisateurs Total", value: totalUsers, icon: Users, color: "text-purple-600" },
        { label: "Consuls & Chefs", value: totalConsuls, icon: ShieldCheck, color: "text-green-600" },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Super Admin</h1>
                        <p className="text-muted-foreground">
                            Vue d'ensemble et administration du réseau consulaire
                        </p>
                    </div>

                    {/* Global Search Bar */}
                    <div className="relative w-full md:w-96" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Recherche globale (Utilisateurs, Entités)..."
                                className="pl-9 neu-inset w-full"
                                value={globalSearch}
                                onChange={(e) => {
                                    setGlobalSearch(e.target.value);
                                    setShowResults(true);
                                }}
                                onFocus={() => setShowResults(true)}
                            />
                            {globalSearch && (
                                <button
                                    onClick={() => { setGlobalSearch(""); setShowResults(false); }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {showResults && globalSearch.length >= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-50"
                                >
                                    <Card className="neu-raised shadow-xl border-primary/20">
                                        <CardContent className="p-2 max-h-[400px] overflow-y-auto">
                                            {searchResults.users.length === 0 && searchResults.entities.length === 0 ? (
                                                <div className="p-4 text-center text-muted-foreground text-sm">
                                                    Aucun résultat trouvé.
                                                </div>
                                            ) : (
                                                <>
                                                    {searchResults.entities.length > 0 && (
                                                        <div className="mb-2">
                                                            <h4 className="text-xs font-bold text-muted-foreground uppercase px-2 py-1">Organisations</h4>
                                                            {searchResults.entities.map(entity => (
                                                                <div
                                                                    key={entity.id}
                                                                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                                                                    onClick={() => navigate(`/dashboard/super-admin/organizations/${entity.id}`)}
                                                                >
                                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                        <Building2 className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium">{entity.name}</div>
                                                                        <div className="text-xs text-muted-foreground">{entity.metadata?.city}, {entity.metadata?.country}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {searchResults.users.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-bold text-muted-foreground uppercase px-2 py-1">Utilisateurs</h4>
                                                            {searchResults.users.map(user => (
                                                                <div
                                                                    key={user.id}
                                                                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                                                                    onClick={() => navigate(`/dashboard/super-admin/users?search=${user.last_name}`)}
                                                                >
                                                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                                        <Users className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
                                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <Badge variant="outline" className="text-[10px] h-4 px-1">{user.role}</Badge>
                                                                            {user.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="neu-raised p-6 rounded-xl flex items-center gap-4">
                            <div className="neu-inset p-3 rounded-full">
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ENTITY MANAGEMENT */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Réseau Diplomatique
                            </h2>
                            <button className="neu-raised px-3 py-1.5 rounded-lg text-xs font-bold text-primary flex items-center gap-1">
                                <Plus className="w-3 h-3" />
                                Ajouter
                            </button>
                        </div>

                        <div className="neu-raised rounded-xl overflow-hidden p-1 flex flex-col">
                            <div className="overflow-x-auto relative min-h-[400px]">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 dark:bg-white/5 border-b dark:border-white/10">
                                        <tr>
                                            <th className="px-6 py-3">Entité</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Ville/Pays</th>
                                            <th className="px-6 py-3">Statut</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <AnimatePresence mode="wait" custom={direction}>
                                        <motion.tbody
                                            key={page}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="divide-y divide-gray-100 dark:divide-white/5"
                                        >
                                            {paginatedEntities.map((entity) => (
                                                <tr key={entity.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                                        {entity.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${entity.type === OrganizationType.AMBASSADE ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            entity.type === OrganizationType.CONSULAT_GENERAL ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                entity.type === OrganizationType.CONSULAT ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                            }`}>
                                                            {entity.type.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 dark:text-gray-300">
                                                        <span className="mr-2">{COUNTRY_FLAGS[entity.metadata?.countryCode || ''] || '🌐'}</span>
                                                        {entity.metadata?.city}, {entity.metadata?.country}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                                            ACTIVE
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-primary hover:underline font-medium">Gérer</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </motion.tbody>
                                    </AnimatePresence>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/5">
                                <div className="text-xs text-muted-foreground">
                                    Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, totalEntities)} sur {totalEntities}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => paginate(-1)}
                                        disabled={page === 0}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-medium flex items-center px-2 dark:text-gray-200">
                                        Page {page + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => paginate(1)}
                                        disabled={page === totalPages - 1}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY & LOGS */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Activité Système
                        </h2>

                        <div className="neu-raised rounded-xl p-6 space-y-6">
                            {[
                                { action: "Connexion Admin", user: "Super Admin", time: "À l'instant", type: "info" },
                                { action: "Mise à jour Entité", user: "Consulat Paris", time: "Il y a 2h", type: "success" },
                                { action: "Nouveau Dossier", user: "Jean Dupont", time: "Il y a 5h", type: "warning" },
                                { action: "Erreur Synchro", user: "Système", time: "Il y a 1j", type: "error" },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${log.type === 'info' ? 'bg-blue-500' :
                                        log.type === 'success' ? 'bg-green-500' :
                                            log.type === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">{log.user} • {log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="neu-raised rounded-xl p-6">
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Maintenance</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="dark:text-gray-300">État du Serveur</span>
                                    <span className="text-green-600 dark:text-green-400 font-bold">Opérationnel</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="dark:text-gray-300">Base de Données</span>
                                    <span className="text-green-600 dark:text-green-400 font-bold">Connecté</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="dark:text-gray-300">Dernière Sauvegarde</span>
                                    <span className="text-gray-600 dark:text-gray-400">Il y a 12h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
